import { Vec2 } from '../math/Vec2.js';
import { Vec3 } from '../math/Vec3.js';
import { Camera } from '../core/Camera.js';
import { Mesh } from '../core/Mesh.js';
import { IGeometryBounds } from '../core/Geometry.js';
export interface IHitResult {
    localPoint: Vec3;
    point: Vec3;
    distance?: number;
    faceNormal?: Vec3;
    localFaceNormal?: Vec3;
    uv?: Vec2;
    normal?: Vec3;
    localNormal?: Vec3;
}
export interface IIntersectInit {
    output?: HitMesh[];
    maxDistance?: number;
    cullFace?: boolean;
    includeUV?: boolean;
    includeNormal?: boolean;
}
declare type HitMesh = Mesh & {
    hit: IHitResult;
};
export declare class Raycast {
    origin: Vec3;
    direction: Vec3;
    castMouse(camera: Camera, mouse?: Vec2 | Array<number>): void;
    intersectBounds(meshes: Mesh[], { maxDistance, output }?: IIntersectInit): HitMesh[];
    intersectMeshes(meshes: any, { cullFace, maxDistance, includeUV, includeNormal, output }?: IIntersectInit): HitMesh[];
    intersectSphere(sphere: IGeometryBounds, origin?: Vec3, direction?: Vec3): number;
    intersectBox(box: IGeometryBounds, origin?: Vec3, direction?: Vec3): number;
    intersectTriangle(a: Vec3, b: Vec3, c: Vec3, backfaceCulling?: boolean, origin?: Vec3, direction?: Vec3, normal?: Vec3): number;
    getBarycoord(point: Vec3, a: Vec3, b: Vec3, c: Vec3, target?: Vec3): Vec3;
}
export {};
