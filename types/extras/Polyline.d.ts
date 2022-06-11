export class Polyline {
    constructor(gl: any, { points, vertex, fragment, uniforms, attributes, }: {
        points: any;
        vertex?: string;
        fragment?: string;
        uniforms?: {};
        attributes?: {};
    });
    gl: any;
    points: any;
    count: any;
    position: Float32Array;
    prev: Float32Array;
    next: Float32Array;
    geometry: Geometry;
    resolution: {
        value: Vec2;
    };
    dpr: {
        value: number;
    };
    thickness: {
        value: number;
    };
    color: {
        value: Color;
    };
    miter: {
        value: number;
    };
    program: Program<never>;
    mesh: Mesh<Geometry, Program<"">>;
    updateGeometry(): void;
    resize(): void;
}
import { Geometry } from "../core/Geometry.js";
import { Vec2 } from "../math/Vec2.js";
import { Color } from "../math/Color.js";
import { Program } from "../core/Program.js";
import { Mesh } from "../core/Mesh.js";
