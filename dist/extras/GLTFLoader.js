import { Geometry } from '../core/Geometry.js';
import { Transform } from '../core/Transform.js';
import { Texture } from '../core/Texture.js';
import { Mesh } from '../core/Mesh.js';
import { GLTFAnimation } from './GLTFAnimation.js';
import { GLTFSkin } from './GLTFSkin.js';
import { Mat4 } from '../math/Mat4.js';
import { Vec3 } from '../math/Vec3.js';
import { NormalProgram } from './NormalProgram.js';
// Supports
// [x] glb
// [x] Geometry
// [x] Nodes and Hierarchy
// [x] Instancing
// [x] Skins
// [x] Textures
// [x] Animation
// [x] GLB support
// [x] Basis/ktx2
// [x] KHR_lights_punctual lights
// [ ] Morph Targets
// [ ] Materials
// [ ] Cameras
// TODO: Sparse accessor packing? For morph targets basically
// TODO: init accessor missing bufferView with 0s
// TODO: morph target animations
// TODO: option to turn off GPU instancing
const TYPE_ARRAY = {
    5121: Uint8Array,
    5122: Int16Array,
    5123: Uint16Array,
    5125: Uint32Array,
    5126: Float32Array,
    'image/jpeg': Uint8Array,
    'image/png': Uint8Array,
};
const TYPE_SIZE = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16,
};
const ATTRIBUTES = {
    POSITION: 'position',
    NORMAL: 'normal',
    TANGENT: 'tangent',
    TEXCOORD_0: 'uv',
    TEXCOORD_1: 'uv2',
    COLOR_0: 'color',
    WEIGHTS_0: 'skinWeight',
    JOINTS_0: 'skinIndex',
};
const TRANSFORMS = {
    translation: 'position',
    rotation: 'quaternion',
    scale: 'scale',
};
export class GLTFLoader {
    static setBasisManager(manager) {
        this.basisManager = manager;
    }
    static async load(gl, src) {
        const dir = src.split('/').slice(0, -1).join('/') + '/';
        // load main description json
        const desc = await this.parseDesc(src);
        return await this.parse(gl, desc, dir);
    }
    static async parse(gl, desc, dir) {
        var _a;
        if (desc.asset === undefined || desc.asset.version[0] < 2)
            console.warn('Only GLTF >=2.0 supported. Attempting to parse.');
        if (((_a = desc.extensionsRequired) === null || _a === void 0 ? void 0 : _a.includes('KHR_texture_basisu')) && !this.basisManager)
            console.warn('KHR_texture_basisu extension required but no manager supplied. Use .setBasisManager()');
        // Load buffers async
        const buffers = await this.loadBuffers(desc, dir);
        // Unbind current VAO so that new buffers don't get added to active mesh
        gl.renderer.bindVertexArray(null);
        // Create gl buffers from bufferViews
        const bufferViews = this.parseBufferViews(gl, desc, buffers);
        // Create images from either bufferViews or separate image files
        const images = await this.parseImages(gl, desc, dir, bufferViews);
        const textures = this.parseTextures(gl, desc, images);
        // Just pass through material data for now
        const materials = this.parseMaterials(gl, desc, textures);
        // Fetch the inverse bind matrices for skeleton joints
        const skins = this.parseSkins(gl, desc, bufferViews);
        // Create geometries for each mesh primitive
        const meshes = this.parseMeshes(gl, desc, bufferViews, materials, skins);
        // Create transforms, meshes and hierarchy
        const nodes = this.parseNodes(gl, desc, meshes, skins, images);
        // Place nodes in skeletons
        this.populateSkins(skins, nodes);
        // Create animation handlers
        const animations = this.parseAnimations(gl, desc, nodes, bufferViews);
        // Get top level nodes for each scene
        const scenes = this.parseScenes(desc, nodes);
        const scene = scenes[desc.scene];
        // Create uniforms for scene lights (TODO: light linking?)
        const lights = this.parseLights(gl, desc, nodes, scenes);
        // Remove null nodes (instanced transforms)
        for (let i = nodes.length; i >= 0; i--)
            if (!nodes[i])
                nodes.splice(i, 1);
        return {
            json: desc,
            buffers,
            bufferViews,
            images,
            textures,
            materials,
            meshes,
            nodes,
            lights,
            animations,
            scenes,
            scene,
        };
    }
    static async parseDesc(src) {
        if (!src.match(/\.glb/)) {
            return await fetch(src).then((res) => res.json());
        }
        else {
            return await fetch(src)
                .then((res) => res.arrayBuffer())
                .then((glb) => this.unpackGLB(glb));
        }
    }
    // From https://github.com/donmccurdy/glTF-Transform/blob/e4108cc/packages/core/src/io/io.ts#L32
    static unpackGLB(glb) {
        // Decode and verify GLB header.
        const header = new Uint32Array(glb, 0, 3);
        if (header[0] !== 0x46546c67) {
            throw new Error('Invalid glTF asset.');
        }
        else if (header[1] !== 2) {
            throw new Error(`Unsupported glTF binary version, "${header[1]}".`);
        }
        // Decode and verify chunk headers.
        const jsonChunkHeader = new Uint32Array(glb, 12, 2);
        const jsonByteOffset = 20;
        const jsonByteLength = jsonChunkHeader[0];
        if (jsonChunkHeader[1] !== 0x4e4f534a) {
            throw new Error('Unexpected GLB layout.');
        }
        // Decode JSON.
        const jsonText = new TextDecoder().decode(glb.slice(jsonByteOffset, jsonByteOffset + jsonByteLength));
        const json = JSON.parse(jsonText);
        // JSON only
        if (jsonByteOffset + jsonByteLength === glb.byteLength)
            return json;
        const binaryChunkHeader = new Uint32Array(glb, jsonByteOffset + jsonByteLength, 2);
        if (binaryChunkHeader[1] !== 0x004e4942) {
            throw new Error('Unexpected GLB layout.');
        }
        // Decode content.
        const binaryByteOffset = jsonByteOffset + jsonByteLength + 8;
        const binaryByteLength = binaryChunkHeader[0];
        const binary = glb.slice(binaryByteOffset, binaryByteOffset + binaryByteLength);
        // Attach binary to buffer
        json.buffers[0].binary = binary;
        return json;
    }
    // Threejs GLTF Loader https://github.com/mrdoob/three.js/blob/master/examples/js/loaders/GLTFLoader.js#L1085
    static resolveURI(uri, dir) {
        // Invalid URI
        if (typeof uri !== 'string' || uri === '')
            return '';
        // Host Relative URI
        if (/^https?:\/\//i.test(dir) && /^\//.test(uri)) {
            dir = dir.replace(/(^https?:\/\/[^\/]+).*/i, '$1');
        }
        // Absolute URI http://, https://, //
        if (/^(https?:)?\/\//i.test(uri))
            return uri;
        // Data URI
        if (/^data:.*,.*$/i.test(uri))
            return uri;
        // Blob URI
        if (/^blob:.*$/i.test(uri))
            return uri;
        // Relative URI
        return dir + uri;
    }
    static async loadBuffers(desc, dir) {
        if (!desc.buffers)
            return null;
        return await Promise.all(desc.buffers.map((buffer) => {
            // For GLB, binary buffer ready to go
            if (buffer.binary)
                return buffer.binary;
            const uri = this.resolveURI(buffer.uri, dir);
            return fetch(uri).then((res) => res.arrayBuffer());
        }));
    }
    static parseBufferViews(gl, desc, buffers) {
        if (!desc.bufferViews)
            return null;
        // Clone to leave description pure
        const bufferViews = desc.bufferViews.map((o) => Object.assign({}, o));
        desc.meshes &&
            desc.meshes.forEach(({ primitives }) => {
                primitives.forEach(({ attributes, indices }) => {
                    // Flag bufferView as an attribute, so it knows to create a gl buffer
                    for (let attr in attributes)
                        bufferViews[desc.accessors[attributes[attr]].bufferView].isAttribute = true;
                    if (indices === undefined)
                        return;
                    bufferViews[desc.accessors[indices].bufferView].isAttribute = true;
                    // Make sure indices bufferView have a target property for gl buffer binding
                    bufferViews[desc.accessors[indices].bufferView].target = gl.ELEMENT_ARRAY_BUFFER;
                });
            });
        // Get componentType of each bufferView from the accessors
        desc.accessors.forEach(({ bufferView: i, componentType }) => {
            bufferViews[i].componentType = componentType;
        });
        // Get mimetype of bufferView from images
        desc.images &&
            desc.images.forEach(({ uri, bufferView: i, mimeType }) => {
                if (i === undefined)
                    return;
                bufferViews[i].mimeType = mimeType;
            });
        // Push each bufferView to the GPU as a separate buffer
        bufferViews.forEach(({ buffer: bufferIndex, // required
        byteOffset = 0, // optional
        byteLength, // required
        byteStride, // optional
        target = gl.ARRAY_BUFFER, // optional, added above for elements
        name, // optional
        extensions, // optional
        extras, // optional
        componentType, // optional, added from accessor above
        mimeType, // optional, added from images above
        isAttribute, }, i) => {
            bufferViews[i].data = buffers[bufferIndex].slice(byteOffset, byteOffset + byteLength);
            if (!isAttribute)
                return;
            // Create gl buffers for the bufferView, pushing it to the GPU
            const buffer = gl.createBuffer();
            gl.bindBuffer(target, buffer);
            gl.renderer.state.boundBuffer = buffer;
            gl.bufferData(target, bufferViews[i].data, gl.STATIC_DRAW);
            bufferViews[i].buffer = buffer;
        });
        return bufferViews;
    }
    static async parseImages(gl, desc, dir, bufferViews) {
        if (!desc.images)
            return null;
        return await Promise.all(desc.images.map(async ({ uri, bufferView: bufferViewIndex, mimeType, name }) => {
            if (mimeType === 'image/ktx2') {
                const { data } = bufferViews[bufferViewIndex];
                const image = await this.basisManager.parseTexture(data);
                return image;
            }
            // jpg / png
            const image = new Image();
            image.name = name;
            if (uri) {
                image.src = this.resolveURI(uri, dir);
            }
            else if (bufferViewIndex !== undefined) {
                const { data } = bufferViews[bufferViewIndex];
                const blob = new Blob([data], { type: mimeType });
                image.src = URL.createObjectURL(blob);
            }
            image.ready = new Promise((res) => {
                image.onload = () => res();
            });
            return image;
        }));
    }
    static parseTextures(gl, desc, images) {
        if (!desc.textures)
            return null;
        return desc.textures.map((textureInfo) => this.createTexture(gl, desc, images, textureInfo));
    }
    static createTexture(gl, desc, images, { sampler: samplerIndex, source: sourceIndex, name, extensions, extras }) {
        if (sourceIndex === undefined && !!extensions) {
            // Basis extension source index
            if (extensions.KHR_texture_basisu)
                sourceIndex = extensions.KHR_texture_basisu.source;
        }
        const image = images[sourceIndex];
        if (image.texture)
            return image.texture;
        const options = {
            flipY: false,
            wrapS: gl.REPEAT,
            wrapT: gl.REPEAT,
        };
        const sampler = samplerIndex !== undefined ? desc.samplers[samplerIndex] : null;
        if (sampler) {
            ['magFilter', 'minFilter', 'wrapS', 'wrapT'].forEach((prop) => {
                if (sampler[prop])
                    options[prop] = sampler[prop];
            });
        }
        // For compressed textures
        if (image.isBasis) {
            options.image = image;
            options.internalFormat = image.internalFormat;
            if (image.isCompressedTexture) {
                options.generateMipmaps = false;
                if (image.length > 1)
                    this.minFilter = gl.NEAREST_MIPMAP_LINEAR;
            }
            const texture = new Texture(gl, options);
            texture.name = name;
            image.texture = texture;
            return texture;
        }
        const texture = new Texture(gl, options);
        texture.name = name;
        image.texture = texture;
        image.ready.then(() => {
            texture.image = image;
        });
        return texture;
    }
    static parseMaterials(gl, desc, textures) {
        if (!desc.materials)
            return null;
        return desc.materials.map(({ name, extensions, extras, pbrMetallicRoughness = {}, normalTexture, occlusionTexture, emissiveTexture, emissiveFactor = [0, 0, 0], alphaMode = 'OPAQUE', alphaCutoff = 0.5, doubleSided = false, }) => {
            const { baseColorFactor = [1, 1, 1, 1], baseColorTexture, metallicFactor = 1, roughnessFactor = 1, metallicRoughnessTexture,
            //   extensions,
            //   extras,
             } = pbrMetallicRoughness;
            if (baseColorTexture) {
                baseColorTexture.texture = textures[baseColorTexture.index];
                // texCoord
            }
            if (normalTexture) {
                normalTexture.texture = textures[normalTexture.index];
                // scale: 1
                // texCoord
            }
            if (metallicRoughnessTexture) {
                metallicRoughnessTexture.texture = textures[metallicRoughnessTexture.index];
                // texCoord
            }
            if (occlusionTexture) {
                occlusionTexture.texture = textures[occlusionTexture.index];
                // strength 1
                // texCoord
            }
            if (emissiveTexture) {
                emissiveTexture.texture = textures[emissiveTexture.index];
                // texCoord
            }
            return {
                name,
                extensions,
                extras,
                baseColorFactor,
                baseColorTexture,
                metallicFactor,
                roughnessFactor,
                metallicRoughnessTexture,
                normalTexture,
                occlusionTexture,
                emissiveTexture,
                emissiveFactor,
                alphaMode,
                alphaCutoff,
                doubleSided,
            };
        });
    }
    static parseSkins(gl, desc, bufferViews) {
        if (!desc.skins)
            return null;
        return desc.skins.map(({ inverseBindMatrices, // optional
        skeleton, // optional
        joints, // required
        // name,
        // extensions,
        // extras,
         }) => {
            return {
                inverseBindMatrices: this.parseAccessor(inverseBindMatrices, desc, bufferViews),
                skeleton,
                joints,
            };
        });
    }
    static parseMeshes(gl, desc, bufferViews, materials, skins) {
        if (!desc.meshes)
            return null;
        return desc.meshes.map(({ primitives, // required
        weights, // optional
        name, // optional
        extensions, // optional
        extras, // optional
         }, meshIndex) => {
            // TODO: weights stuff ?
            // Parse through nodes to see how many instances there are
            // and if there is a skin attached
            // If multiple instances of a skin, need to create each
            let numInstances = 0;
            let skinIndices = [];
            let isLightmap = false;
            desc.nodes &&
                desc.nodes.forEach(({ mesh, skin, extras }) => {
                    if (mesh === meshIndex) {
                        numInstances++;
                        if (skin !== undefined)
                            skinIndices.push(skin);
                        if (extras && extras.lightmap_scale_offset)
                            isLightmap = true;
                    }
                });
            let isSkin = !!skinIndices.length;
            // For skins, return array of skin meshes to account for multiple instances
            if (isSkin) {
                primitives = skinIndices.map((skinIndex) => {
                    return this.parsePrimitives(gl, primitives, desc, bufferViews, materials, 1, isLightmap).map(({ geometry, program, mode }) => {
                        const mesh = new GLTFSkin(gl, { skeleton: skins[skinIndex], geometry, program, mode });
                        mesh.name = name;
                        // TODO: support skin frustum culling
                        mesh.frustumCulled = false;
                        return mesh;
                    });
                });
                // For retrieval to add to node
                primitives.instanceCount = 0;
                primitives.numInstances = numInstances;
            }
            else {
                primitives = this.parsePrimitives(gl, primitives, desc, bufferViews, materials, numInstances, isLightmap).map(({ geometry, program, mode }) => {
                    const mesh = new Mesh(gl, { geometry, program, mode });
                    mesh.name = name;
                    // Tag mesh so that nodes can add their transforms to the instance attribute
                    mesh.numInstances = numInstances;
                    if (mesh.geometry.attributes.instanceMatrix) {
                        // Avoid incorrect culling for instances
                        mesh.frustumCulled = false;
                    }
                    return mesh;
                });
            }
            return {
                primitives,
                weights,
                name,
            };
        });
    }
    static parsePrimitives(gl, primitives, desc, bufferViews, materials, numInstances, isLightmap) {
        return primitives.map(({ attributes, // required
        indices, // optional
        material: materialIndex, // optional
        mode = 4, // optional
        targets, // optional
        extensions, // optional
        extras, // optional
         }) => {
            // TODO: materials
            const program = new NormalProgram(gl);
            if (materialIndex !== undefined) {
                program.gltfMaterial = materials[materialIndex];
            }
            const geometry = new Geometry(gl);
            // Add each attribute found in primitive
            for (let attr in attributes) {
                geometry.addAttribute(ATTRIBUTES[attr], this.parseAccessor(attributes[attr], desc, bufferViews));
            }
            // Add index attribute if found
            if (indices !== undefined) {
                geometry.addAttribute('index', this.parseAccessor(indices, desc, bufferViews));
            }
            // Add instanced transform attribute if multiple instances
            // Ignore if skin as we don't support instanced skins out of the box
            if (numInstances > 1) {
                geometry.addAttribute('instanceMatrix', {
                    instanced: 1,
                    size: 16,
                    data: new Float32Array(numInstances * 16),
                });
            }
            // Always supply lightmapScaleOffset as an instanced attribute
            // Instanced skin lightmaps not supported
            if (isLightmap) {
                geometry.addAttribute('lightmapScaleOffset', {
                    instanced: 1,
                    size: 4,
                    data: new Float32Array(numInstances * 4),
                });
            }
            return {
                geometry,
                program,
                mode,
            };
        });
    }
    static parseAccessor(index, desc, bufferViews) {
        // TODO: init missing bufferView with 0s
        // TODO: support sparse
        const { bufferView: bufferViewIndex, // optional
        byteOffset = 0, // optional
        componentType, // required
        normalized = false, // optional
        count, // required
        type, // required
        min, // optional
        max, // optional
        sparse, // optional
        // name, // optional
        // extensions, // optional
        // extras, // optional
         } = desc.accessors[index];
        const { data, // attached in parseBufferViews
        buffer, // replaced to be the actual GL buffer
        byteOffset: bufferByteOffset = 0, 
        // byteLength, // applied in parseBufferViews
        byteStride = 0, target,
        // name,
        // extensions,
        // extras,
         } = bufferViews[bufferViewIndex];
        const size = TYPE_SIZE[type];
        // Parse data from joined buffers
        const TypeArray = TYPE_ARRAY[componentType];
        const elementBytes = data.BYTES_PER_ELEMENT;
        const componentStride = byteStride / elementBytes;
        const isInterleaved = !!byteStride && componentStride !== size;
        // TODO: interleaved
        // Convert data to typed array for various uses (bounding boxes, animation etc)
        const newData = isInterleaved ? new TypeArray(data) : new TypeArray(data, byteOffset, count * size);
        // Return attribute data
        return {
            data: newData,
            size,
            type: componentType,
            normalized,
            buffer,
            stride: byteStride,
            offset: byteOffset,
            count,
            min,
            max,
        };
    }
    static parseNodes(gl, desc, meshes, skins, images) {
        if (!desc.nodes)
            return null;
        const nodes = desc.nodes.map(({ camera, // optional
        children, // optional
        skin: skinIndex, // optional
        matrix, // optional
        mesh: meshIndex, // optional
        rotation, // optional
        scale, // optional
        translation, // optional
        weights, // optional
        name, // optional
        extensions, // optional
        extras, // optional
         }) => {
            const node = new Transform();
            if (name)
                node.name = name;
            node.extras = extras;
            node.extensions = extensions;
            // Need to attach to node as may have same material but different lightmap
            if (extras && extras.lightmapTexture !== undefined) {
                extras.lightmapTexture.texture = this.createTexture(gl, desc, images, { source: extras.lightmapTexture.index });
            }
            // Apply transformations
            if (matrix) {
                node.matrix.copy(matrix);
                node.decompose();
            }
            else {
                if (rotation)
                    node.quaternion.copy(rotation);
                if (scale)
                    node.scale.copy(scale);
                if (translation)
                    node.position.copy(translation);
                node.updateMatrix();
            }
            // Flags for avoiding duplicate transforms and removing unused instance nodes
            let isInstanced = false;
            let isFirstInstance = true;
            let isInstancedMatrix = false;
            let isSkin = skinIndex !== undefined;
            // add mesh if included
            if (meshIndex !== undefined) {
                if (isSkin) {
                    meshes[meshIndex].primitives[meshes[meshIndex].primitives.instanceCount].forEach((mesh) => {
                        mesh.extras = extras;
                        mesh.setParent(node);
                    });
                    meshes[meshIndex].primitives.instanceCount++;
                    // Remove properties once all instances added
                    if (meshes[meshIndex].primitives.instanceCount === meshes[meshIndex].primitives.numInstances) {
                        delete meshes[meshIndex].primitives.numInstances;
                        delete meshes[meshIndex].primitives.instanceCount;
                    }
                }
                else {
                    meshes[meshIndex].primitives.forEach((mesh) => {
                        mesh.extras = extras;
                        // instanced mesh might only have 1
                        if (mesh.geometry.isInstanced) {
                            isInstanced = true;
                            if (!mesh.instanceCount) {
                                mesh.instanceCount = 0;
                            }
                            else {
                                isFirstInstance = false;
                            }
                            if (mesh.geometry.attributes.instanceMatrix) {
                                isInstancedMatrix = true;
                                node.matrix.toArray(mesh.geometry.attributes.instanceMatrix.data, mesh.instanceCount * 16);
                            }
                            if (mesh.geometry.attributes.lightmapScaleOffset) {
                                mesh.geometry.attributes.lightmapScaleOffset.data.set(extras.lightmap_scale_offset, mesh.instanceCount * 4);
                            }
                            mesh.instanceCount++;
                            if (mesh.instanceCount === mesh.numInstances) {
                                // Remove properties once all instances added
                                delete mesh.numInstances;
                                delete mesh.instanceCount;
                                // Flag attribute as dirty
                                if (mesh.geometry.attributes.instanceMatrix) {
                                    mesh.geometry.attributes.instanceMatrix.needsUpdate = true;
                                }
                                if (mesh.geometry.attributes.lightmapScaleOffset) {
                                    mesh.geometry.attributes.lightmapScaleOffset.needsUpdate = true;
                                }
                            }
                        }
                        // For instances, only the first node will actually have the mesh
                        if (isInstanced) {
                            if (isFirstInstance)
                                mesh.setParent(node);
                        }
                        else {
                            mesh.setParent(node);
                        }
                    });
                }
            }
            // Reset node if instanced to not duplicate transforms
            if (isInstancedMatrix) {
                // Remove unused nodes just providing an instance transform
                if (!isFirstInstance)
                    return null;
                // Avoid duplicate transform for node containing the instanced mesh
                node.matrix.identity();
                node.decompose();
            }
            return node;
        });
        desc.nodes.forEach(({ children = [] }, i) => {
            // Set hierarchy now all nodes created
            children.forEach((childIndex) => {
                if (!nodes[childIndex])
                    return;
                nodes[childIndex].setParent(nodes[i]);
            });
        });
        return nodes;
    }
    static populateSkins(skins, nodes) {
        if (!skins)
            return;
        skins.forEach((skin) => {
            skin.joints = skin.joints.map((i, index) => {
                const joint = nodes[i];
                joint.bindInverse = new Mat4(...skin.inverseBindMatrices.data.slice(index * 16, (index + 1) * 16));
                return joint;
            });
            if (skin.skeleton)
                skin.skeleton = nodes[skin.skeleton];
        });
    }
    static parseAnimations(gl, desc, nodes, bufferViews) {
        if (!desc.animations)
            return null;
        return desc.animations.map(({ channels, // required
        samplers, // required
        name, // optional
        // extensions, // optional
        // extras,  // optional
         }) => {
            const data = channels.map(({ sampler: samplerIndex, // required
            target, // required
            // extensions, // optional
            // extras, // optional
             }) => {
                const { input: inputIndex, // required
                interpolation = 'LINEAR', output: outputIndex, // required
                // extensions, // optional
                // extras, // optional
                 } = samplers[samplerIndex];
                const { node: nodeIndex, // optional - TODO: when is it not included?
                path, // required
                // extensions, // optional
                // extras, // optional
                 } = target;
                const node = nodes[nodeIndex];
                const transform = TRANSFORMS[path];
                const times = this.parseAccessor(inputIndex, desc, bufferViews).data;
                const values = this.parseAccessor(outputIndex, desc, bufferViews).data;
                return {
                    node,
                    transform,
                    interpolation,
                    times,
                    values,
                };
            });
            return {
                name,
                animation: new GLTFAnimation(data),
            };
        });
    }
    static parseScenes(desc, nodes) {
        if (!desc.scenes)
            return null;
        return desc.scenes.map(({ nodes: nodesIndices = [], name, // optional
        extensions, extras, }) => {
            const scene = nodesIndices.reduce((map, i) => {
                // Don't add null nodes (instanced transforms)
                if (nodes[i])
                    map.push(nodes[i]);
                return map;
            }, []);
            scene.extras = extras;
            return scene;
        });
    }
    static parseLights(gl, desc, nodes, scenes) {
        var _a, _b;
        const lights = {
            directional: [],
            point: [],
            spot: [],
        };
        // Update matrices on root nodes
        scenes.forEach((scene) => scene.forEach((node) => node.updateMatrixWorld()));
        // uses KHR_lights_punctual extension
        const lightsDescArray = ((_b = (_a = desc.extensions) === null || _a === void 0 ? void 0 : _a.KHR_lights_punctual) === null || _b === void 0 ? void 0 : _b.lights) || [];
        // Need nodes for transforms
        nodes.forEach((node) => {
            var _a;
            if (!((_a = node === null || node === void 0 ? void 0 : node.extensions) === null || _a === void 0 ? void 0 : _a.KHR_lights_punctual))
                return;
            const lightIndex = node.extensions.KHR_lights_punctual.light;
            const lightDesc = lightsDescArray[lightIndex];
            const light = {
                name: lightDesc.name || '',
                color: { value: new Vec3().set(lightDesc.color || 1) },
            };
            // Apply intensity directly to color
            if (lightDesc.intensity !== undefined)
                light.color.value.multiply(lightDesc.intensity);
            switch (lightDesc.type) {
                case 'directional':
                    light.direction = { value: new Vec3(0, 0, 1).transformDirection(node.worldMatrix) };
                    break;
                case 'point':
                    light.position = { value: new Vec3().applyMatrix4(node.worldMatrix) };
                    light.distance = { value: lightDesc.range };
                    light.decay = { value: 2 };
                    break;
                case 'spot':
                    // TODO: support spot uniforms
                    Object.assign(light, lightDesc);
                    break;
            }
            lights[lightDesc.type].push(light);
        });
        return lights;
    }
}
