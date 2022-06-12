import { Vec3 } from '../math/Vec3.js';
import type { Camera } from '../core/Camera.js';
export interface IOrbitInit {
    element: HTMLElement | Document;
    enabled: boolean;
    target: Vec3;
    ease: number;
    inertia: number;
    enableRotate: boolean;
    rotateSpeed: number;
    autoRotate: boolean;
    autoRotateSpeed: number;
    enableZoom: boolean;
    zoomSpeed: number;
    zoomStyle: 'dolly' | 'zoom';
    enablePan: boolean;
    panSpeed: number;
    minPolarAngle: number;
    maxPolarAngle: number;
    minAzimuthAngle: number;
    maxAzimuthAngle: number;
    minDistance: number;
    maxDistance: number;
}
export declare function Orbit(object: Camera, { element, enabled, target, ease, inertia, enableRotate, rotateSpeed, autoRotate, autoRotateSpeed, enableZoom, zoomSpeed, zoomStyle, enablePan, panSpeed, minPolarAngle, maxPolarAngle, minAzimuthAngle, maxAzimuthAngle, minDistance, maxDistance, }?: Partial<IOrbitInit>): void;
