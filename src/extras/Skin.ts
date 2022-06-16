import { Mesh } from '../core/Mesh.js';
import { Transform } from '../core/Transform.js';
import { Mat4 } from '../math/Mat4.js';
import { Texture } from '../core/Texture.js';
import { Animation } from './Animation.js';
import type { IAnimData } from './Animation.js';
import { GLContext, GL_ENUMS, Renderer } from '../core/Renderer.js';
import type { Geometry } from '../core/Geometry.js';
import type { Program } from '../core/Program.js';
import { Camera } from '../core/Camera.js';

const tempMat4 = new Mat4();

export interface IBoneData {
    name: string;
    parent: number;
}

export interface IBindPose {
    position: Float32Array;
    quaternion: Float32Array;
    scale: Float32Array;
}

export interface IRigData {
    bones: IBoneData[];
    bindPose: IBindPose;
}

export interface ISkinInit {
    rig: IRigData;
    geometry: Geometry;
    program: Program;
    mode?: GLenum
}

export interface IBoneTransform extends Transform {
    bindInverse: Mat4;
}

export class Skin extends Mesh<any, Program<'boneTexture' | 'boneTextureSize'>> {
    private boneTexture: Texture<Float32Array>;
    private boneTextureSize: number;
    private animations: Animation[] = [];
    private boneMatrices: Float32Array;

    public root: Transform;
    public bones: IBoneTransform[];

    private _rig: IRigData;
    private _invalid: boolean = true;

    constructor(_gl: GLContext, {
        rig,
        geometry,
        program,
        mode = GL_ENUMS.TRIANGLES
    }: ISkinInit) {
        super(null, { geometry, program, mode });

        this._rig = rig;
    }

    createBones(rig: IRigData) {
        // Create root so that can simply update world matrix of whole skeleton
        this.root = new Transform();

        // Create bones
        this.bones = [];
        if (!rig.bones || !rig.bones.length) return;
        for (let i = 0; i < rig.bones.length; i++) {
            const bone = new Transform() as IBoneTransform;

            // Set initial values (bind pose)
            bone.position.fromArray(rig.bindPose.position, i * 3);
            bone.quaternion.fromArray(rig.bindPose.quaternion, i * 4);
            bone.scale.fromArray(rig.bindPose.scale, i * 3);

            this.bones.push(bone);
        }

        // Once created, set the hierarchy
        rig.bones.forEach((data, i) => {
            this.bones[i].name = data.name;
            if (data.parent === -1) return this.bones[i].setParent(this.root);
            this.bones[i].setParent(this.bones[data.parent]);
        });

        // Then update to calculate world matrices
        this.root.updateMatrixWorld(true);

        // Store inverse of bind pose to calculate differences
        this.bones.forEach((bone) => {
            bone.bindInverse = new Mat4(...bone.worldMatrix).inverse();
        });

        // bind bones to animation
        this.animations.forEach((a) => {
            a.objects = this.bones;
        })
    }

    createBoneTexture({context}: {context: Renderer}) {
        if (!this.bones.length) return;
        const size = Math.max(4, Math.pow(2, Math.ceil(Math.log(Math.sqrt(this.bones.length * 4)) / Math.LN2)));
        this.boneMatrices = new Float32Array(size * size * 4);
        this.boneTextureSize = size;
        this.boneTexture = new Texture(null, {
            image: this.boneMatrices,
            generateMipmaps: false,
            type: GL_ENUMS.FLOAT,
            internalFormat: context.isWebgl2 ? (GL_ENUMS as WebGL2RenderingContext).RGBA32F : GL_ENUMS.RGBA,
            minFilter: GL_ENUMS.NEAREST,
            magFilter: GL_ENUMS.NEAREST,
            flipY: false,
            width: size,
        });
    }

    addAnimation(data: IAnimData) {
        // bones not exist on this moment
        const animation = new Animation({ objects: null, data });
        this.animations.push(animation);
        return animation;
    }

    update() {
        if (this._invalid) return;

        // Calculate combined animation weight
        let total = 0;
        this.animations.forEach((animation) => (total += animation.weight));

        this.animations.forEach((animation, i) => {
            // force first animation to set in order to reset frame
            animation.update(total, i === 0);
        });
    }

    prepare(args:{ camera: Camera; context: Renderer; }): void {
        if (this._invalid) {
            this.createBones(this._rig);
            this.createBoneTexture(args);

            Object.assign(this.program.uniforms, {
                boneTexture: { value: this.boneTexture },
                boneTextureSize: { value: this.boneTextureSize },
            });

            this._invalid = false;
        }

        this.update();

        // Update world matrices manually, as not part of scene graph
        this.root.updateMatrixWorld(true);

        // Update bone texture
        this.bones.forEach((bone, i) => {
            // Find difference between current and bind pose
            tempMat4.multiply(bone.worldMatrix, bone.bindInverse);
            this.boneMatrices.set(tempMat4, i * 16);
        });

        if (this.boneTexture) this.boneTexture.needsUpdate = true;

        super.prepare(args);
    }
}
