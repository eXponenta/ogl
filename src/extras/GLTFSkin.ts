import { Mesh } from '../core/Mesh.js';
import { Mat4 } from '../math/Mat4.js';
import { Texture } from '../core/Texture.js';
import type { GLContext, Renderer } from '../core/Renderer.js';
import type { Geometry } from '../core/Geometry.js';
import type { Program } from '../core/Program.js';
import type { GLTFAnimation } from './GLTFAnimation.js';
import { Camera } from '../core/Camera.js';

const tempMat4 = new Mat4();
const identity = new Mat4();

export interface IGLTFSkeletoneData {
    joints: Array<any>;
}

export interface IGLTFSkinData {
    skeleton: IGLTFSkeletoneData;
    geometry: Geometry;
    program: Program;
    mode: GLenum;
}

export class GLTFSkin extends Mesh {
    public readonly skeleton: IGLTFSkeletoneData;
    public readonly animations: GLTFAnimation[] = [];

    private boneMatrices: Float32Array;
    private boneTextureSize: number;
    private boneTexture: Texture<Float32Array>;

    constructor(gl: GLContext, {
        skeleton,
        geometry,
        program,
        mode = gl.TRIANGLES
    }: IGLTFSkinData) {
        super(gl, { geometry, program, mode });
        this.skeleton = skeleton;
        this.program = program;
        this.createBoneTexture();
    }

    createBoneTexture() {
        if (!this.skeleton.joints.length) return;
        const size = Math.max(4, Math.pow(2, Math.ceil(Math.log(Math.sqrt(this.skeleton.joints.length * 4)) / Math.LN2)));
        this.boneMatrices = new Float32Array(size * size * 4);
        this.boneTextureSize = size;
        this.boneTexture = new Texture(this.gl, {
            image: this.boneMatrices,
            generateMipmaps: false,
            type: this.gl.FLOAT,
            internalFormat: this.gl.renderer.isWebgl2 ? (this.gl as any).RGBA32F : this.gl.RGBA,
            minFilter: this.gl.NEAREST,
            magFilter: this.gl.NEAREST,
            flipY: false,
            width: size,
        });
    }

    // addAnimation(data) {
    //     const animation = new Animation({ objects: this.bones, data });
    //     this.animations.push(animation);
    //     return animation;
    // }

    // updateAnimations() {
    //     // Calculate combined animation weight
    //     let total = 0;
    //     this.animations.forEach((animation) => (total += animation.weight));

    //     this.animations.forEach((animation, i) => {
    //         // force first animation to set in order to reset frame
    //         animation.update(total, i === 0);
    //     });
    // }

    updateUniforms() {
        // Update bone texture
        this.skeleton.joints.forEach((bone, i) => {
            // Find difference between current and bind pose
            tempMat4.multiply(bone.worldMatrix, bone.bindInverse);
            this.boneMatrices.set(tempMat4, i * 16);
        });

        if (this.boneTexture) this.boneTexture.needsUpdate = true;
    }

    prepare(args: { camera: Camera; context: Renderer; }): void {
        if (!this.program.uniforms.boneTexture) {
            Object.assign(this.program.uniforms, {
                boneTexture: { value: this.boneTexture },
                boneTextureSize: { value: this.boneTextureSize },
            });
        }
        this.updateUniforms();

        super.prepare(args);
    }

    draw({ camera = null, context }) {
        // Switch the world matrix with identity to ignore any transforms
        // on the mesh itself - only use skeleton's transforms
        const _worldMatrix = this.worldMatrix;
        this.worldMatrix = identity;

        super.draw({ camera, context });

        // Switch back to leave identity untouched
        this.worldMatrix = _worldMatrix;
    }
}
