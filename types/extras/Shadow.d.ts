export class Shadow {
    constructor(gl: any, { light, width, height }: {
        light?: Camera;
        width?: number;
        height?: any;
    });
    gl: any;
    light: Camera;
    target: RenderTarget;
    depthProgram: Program<"">;
    castMeshes: any[];
    add({ mesh, receive, cast, vertex, fragment, uniformProjection, uniformView, uniformTexture, }: {
        mesh: any;
        receive?: boolean;
        cast?: boolean;
        vertex?: string;
        fragment?: string;
        uniformProjection?: string;
        uniformView?: string;
        uniformTexture?: string;
    }): void;
    render({ scene }: {
        scene: any;
    }): void;
}
import { Camera } from "../core/Camera.js";
import { RenderTarget } from "../core/RenderTarget.js";
import { Program } from "../core/Program.js";
