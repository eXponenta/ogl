import { Vec3 } from '../math/Vec3.js';
import { Quat } from '../math/Quat.js';
import type { Transform } from '../core/Transform.js';

const prevPos = new Vec3();
const prevRot = new Quat();
const prevScl = new Vec3();

const nextPos = new Vec3();
const nextRot = new Quat();
const nextScl = new Vec3();

export interface IAnimData {
    frames: Array<any>;
}

export interface IAnimInit {
    objects: Transform[];
    data: IAnimData;
}

export class Animation {
    public readonly objects: Transform[];
    public readonly data: IAnimData;

    public elapsed: number = 0;
    public weight: number = 1;
    public duration: number;

    constructor({ objects, data }: IAnimInit) {
        this.objects = objects;
        this.data = data;
        this.elapsed = 0;
        this.weight = 1;
        this.duration = data.frames.length - 1;
    }

    update(totalWeight: number = 1, isSet = false) {
        const weight = isSet ? 1 : this.weight / totalWeight;
        const elapsed = this.elapsed % this.duration;

        const floorFrame = Math.floor(elapsed);
        const blend = elapsed - floorFrame;
        const prevKey = this.data.frames[floorFrame];
        const nextKey = this.data.frames[(floorFrame + 1) % this.duration];

        this.objects.forEach((object, i) => {
            prevPos.fromArray(prevKey.position, i * 3);
            prevRot.fromArray(prevKey.quaternion, i * 4);
            prevScl.fromArray(prevKey.scale, i * 3);

            nextPos.fromArray(nextKey.position, i * 3);
            nextRot.fromArray(nextKey.quaternion, i * 4);
            nextScl.fromArray(nextKey.scale, i * 3);

            prevPos.lerp(nextPos, blend);
            prevRot.slerp(nextRot, blend);
            prevScl.lerp(nextScl, blend);

            object.position.lerp(prevPos, weight);
            object.quaternion.slerp(prevRot, weight);
            object.scale.lerp(prevScl, weight);
        });
    }
}
