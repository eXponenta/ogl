export class Flowmap {
    constructor(gl: any, { size, falloff, alpha, dissipation, type, }?: {
        size?: number;
        falloff?: number;
        alpha?: number;
        dissipation?: number;
        type: any;
    });
    gl: any;
    uniform: {
        value: any;
    };
    mask: {
        read: any;
        write: any;
        swap: () => void;
    };
    aspect: number;
    mouse: Vec2;
    velocity: Vec2;
    mesh: Mesh<Triangle, Program<"">>;
    update(): void;
}
import { Vec2 } from "../math/Vec2.js";
import { Triangle } from "./Triangle.js";
import { Program } from "../core/Program.js";
import { Mesh } from "../core/Mesh.js";
