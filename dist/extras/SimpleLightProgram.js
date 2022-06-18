import { Program } from '../core/Program.js';
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
    uniform mat4 viewMatrix;
    uniform mat4 projectionMatrix;

    varying vec3 vNormal;
    varying vec3 vLight;
    varying vec2 vUV;

    void main() {
        vUV = uv;
        vNormal = normalMatrix * normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;
export const fragment = /* glsl */ `
    precision highp float;
    precision highp int;

    varying vec2 vUV;
    varying vec3 vNormal;
    varying vec3 vLight;


    uniform sampler2D uTexture;
    uniform vec3 uTint;
    uniform vec3 uAmbientColor;
    uniform vec3 uLightColor;
    uniform vec3 uLightPos;

    void main() {
        vec4 color = texture2D(uTexture, vUV);
        vec3 norm = normalize(vNormal);
        vec3 lightDir = normalize(uLightPos);

        float diff = max(dot(norm, lightDir), 0.0);
        vec3 diffuse = diff * uLightColor;

        color.rgb *= (uAmbientColor + diffuse) * uTint;

        gl_FragColor = color;
    }
`;
let WHITE;
export class SimpleLightProgram extends Program {
    constructor(gl, { texture, lightColor = new Color('white'), ambientColor = new Color('#222222'), lightPos = new Vec3(1, 1, 1), tint = new Color('white'), } = {}) {
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
    set texture(v) {
        this.uniforms.uTexture.value = v;
    }
    get texture() {
        return this.uniforms.uTexture.value;
    }
    set lightPos(v) {
        this.uniforms.uLightPos.value = v;
    }
    get lightPos() {
        return this.uniforms.uLightPos.value;
    }
    set lightColor(v) {
        this.uniforms.uLightColor.value = v;
    }
    get lightColor() {
        return this.uniforms.uLightColor.value;
    }
    set ambientColor(v) {
        this.uniforms.uAmbientColor.value = v;
    }
    get ambientColor() {
        return this.uniforms.uAmbientColor.value;
    }
    set tint(v) {
        this.uniforms.uTint.value = v;
    }
    get tint() {
        return this.uniforms.uTint.value;
    }
}
