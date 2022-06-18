import { Program } from '../core/Program.js';
import { Texture } from '../core/Texture.js';
import { Color } from '../math/Color.js';
export const vertex = /* glsl */ `
    precision highp float;
    precision highp int;

    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 uv;

    uniform mat3 normalMatrix;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    varying vec3 vNormal;
    varying vec2 vUV;

    void main() {
        vUV = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;
export const fragment = /* glsl */ `
    precision highp float;
    precision highp int;

    varying vec2 vUV;
    varying vec3 vNormal;

    uniform vec3 uTint;
    uniform sampler2D uTexture;

    void main() {
        vec4 color = texture2D(uTexture, vUV);
        color.rgb *= uTint.rgb;

        gl_FragColor = color;
    }
`;
let WHITE;
export class UnlitProgram extends Program {
    constructor(gl, { tint = new Color('white'), texture, } = {}) {
        texture = texture || WHITE || (WHITE = new Texture(gl, {
            image: new Uint8Array([255, 255, 255, 255]),
            width: 1,
            height: 1,
            generateMipmaps: false,
        }));
        super(gl, {
            vertex: vertex,
            fragment: fragment,
            cullFace: null,
            uniforms: {
                uTexture: { value: texture },
                uTint: { value: tint }
            }
        });
    }
    set texture(v) {
        this.uniforms.uTexture.value = v;
    }
    get texture() {
        return this.uniforms.uTexture.value;
    }
    set tint(v) {
        this.uniforms.uTint.value = v;
    }
    get tint() {
        return this.uniforms.uTint.value;
    }
}
