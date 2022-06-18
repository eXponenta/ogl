import { Program } from '../core/Program.js';
import type { GLContext } from '../core/Renderer.js';
import { Texture } from '../core/Texture.js';
import { Vec3 } from '../math/Vec3.js';
import { Color } from '../math/Color.js';

export const vertex = /* glsl */ `
    precision highp float;
    precision highp int;

    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 uv;

    uniform mat3 normalMatrix;
    uniform mat4 modelViewMatrix;
    uniform mat4 modelMatrix;
    uniform mat4 projectionMatrix;

    varying vec3 vNormal;
    varying vec3 vPos;
    varying vec2 vUV;

    void main() {
        vUV = uv;
        vNormal = normalize(normalMatrix * normal);
        vPos = vec3(modelMatrix * vec4(position, 1.0));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const fragment = /* glsl */ `
    precision highp float;
    precision highp int;

    varying vec2 vUV;
    varying vec3 vNormal;
    varying vec3 vPos;

    uniform sampler2D uTexture;
    uniform vec3 uTint;
    uniform vec3 uLightPos;
    uniform vec3 uAmbientColor;

    void main() {
        vec4 color = texture2D(uTexture, vUV);
        vec3 norm = normalize(vNormal);
        vec3 lightDir = normalize(uLightPos - vPos);

        float diff = max(dot(norm, lightDir), 0.0);
        vec3 diffuse = diff * uAmbientColor;

        color.rgb *= (uAmbientColor + diffuse) * uTint;

        gl_FragColor = color;
    }
`;

export interface ISimpleLightProg {
    texture?: Texture<any>;
    lightPos?: Vec3;
    lightColor?: Color;
    ambientColor?: Color;
    tint?: Color;
}

let WHITE: Texture<any>;

export class SimpleLightProgram extends Program<'uLightPos' | 'uLightColor' | 'uAmbientColor' | 'uTexture' | 'uTint'> {
    constructor(
        gl: GLContext,
        {
            texture,
            lightColor = new Color('white'),
            ambientColor = new Color('#222222'),
            lightPos = new Vec3(1, 1, 1),
            tint = new Color('white'),
        }: ISimpleLightProg = {}
    ) {
        texture =
            texture ||
            WHITE ||
            (WHITE = new Texture(gl, {
                image: new Uint8Array([255, 255, 255, 255]),
                width: 1,
                height: 1,
                generateMipmaps: false,
            }));

        super(gl, {
            vertex: vertex,
            fragment: fragment,
            uniforms: {
                uAmbientColor: { value: ambientColor },
                uLightColor: { value: lightColor },
                uLightPos: { value: lightPos },
                uTexture: { value: texture },
                uTint: { value: tint }
            },
        });
    }

    set texture(v: Texture<any>) {
        this.uniforms.uTexture.value = v;
    }

    get texture() {
        return this.uniforms.uTexture.value;
    }

    set lightPos(v: Vec3) {
        this.uniforms.uLightPos.value = v;
    }

    get lightPos() {
        return this.uniforms.uLightPos.value;
    }

    set lightColor(v: Color) {
        this.uniforms.uLightColor.value = v;
    }

    get lightColor() {
        return this.uniforms.uLightColor.value;
    }

    set ambientColor(v: Color) {
        this.uniforms.uAmbientColor.value = v;
    }

    get ambientColor() {
        return this.uniforms.uAmbientColor.value;
    }

    set tint(v: Color) {
        this.uniforms.uTint.value = v;
    }

    get tint() {
        return this.uniforms.uTint.value;
    }
}
