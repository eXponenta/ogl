import { Program } from '../core/Program.js';
import { Mesh } from '../core/Mesh.js';
import { Texture } from '../core/Texture.js';
import { RenderTarget } from '../core/RenderTarget.js';
import { Triangle } from './Triangle.js';
import { GLContext, GL_ENUMS, Renderer } from '../core/Renderer.js';
import type { Geometry } from '../core/Geometry.js';
import type { ISwapChain, IRenderPass, IRenderPassInit } from './Post.js';

export class GPGPU {
    public activeContext: Renderer;
    public readonly passes: IRenderPass[] =[];

    private geometry: Geometry;
    private dataLength: number;
    private size: number;
    private coords: Float32Array;
    private uniform: { value: Texture<Float32Array> };
    private fbo: ISwapChain;

    constructor(
        context: GLContext | Renderer,
        {
            // Always pass in array of vec4s (RGBA values within texture)
            data = new Float32Array(16),
            geometry = new Triangle(null),
            type = (GL_ENUMS as any).HALF_FLOAT, // Pass in gl.FLOAT to force it, defaults to gl.HALF_FLOAT
        }
    ) {
        if (!(context instanceof Renderer)) {
            console.warn('[Post deprecation] You should pass instance of renderer instead of gl as argument')
        }

        this.activeContext = context instanceof Renderer ? context : context.renderer;

        const initialData = data;
        this.geometry = geometry;
        this.dataLength = initialData.length / 4;

        // Windows and iOS only like power of 2 textures
        // Find smallest PO2 that fits data
        this.size = Math.pow(2, Math.ceil(Math.log(Math.ceil(Math.sqrt(this.dataLength))) / Math.LN2));

        // Create coords for output texture
        this.coords = new Float32Array(this.dataLength * 2);
        for (let i = 0; i < this.dataLength; i++) {
            const x = (i % this.size) / this.size; // to add 0.5 to be center pixel ?
            const y = Math.floor(i / this.size) / this.size;
            this.coords.set([x, y], i * 2);
        }

        // Use original data if already correct length of PO2 texture, else copy to new array of correct length
        const floatArray = (() => {
            if (initialData.length === this.size * this.size * 4) {
                return initialData;
            } else {
                const a = new Float32Array(this.size * this.size * 4);
                a.set(initialData);
                return a;
            }
        })();

        // Create output texture uniform using input float texture with initial data
        this.uniform = {
            value: new Texture(null, {
                image: floatArray,
                target: GL_ENUMS.TEXTURE_2D,
                type: GL_ENUMS.FLOAT,
                format: GL_ENUMS.RGBA,
                internalFormat: this.activeContext.isWebgl2 ? (GL_ENUMS as WebGL2RenderingContext).RGBA32F : GL_ENUMS.RGBA,
                wrapS: GL_ENUMS.CLAMP_TO_EDGE,
                wrapT: GL_ENUMS.CLAMP_TO_EDGE,
                generateMipmaps: false,
                minFilter: GL_ENUMS.NEAREST,
                magFilter: GL_ENUMS.NEAREST,
                width: this.size,
                flipY: false,
            }),
        };

        type = type || (GL_ENUMS as WebGL2RenderingContext).HALF_FLOAT || this.activeContext.extensions['OES_texture_half_float'].HALF_FLOAT_OES;

        // Create FBOs
        const options = {
            width: this.size,
            height: this.size,
            type: type,
            format: GL_ENUMS.RGBA,
            internalFormat: this.activeContext.isWebgl2 ? (type === GL_ENUMS.FLOAT ? (<any>GL_ENUMS).RGBA32F : (<any>GL_ENUMS).RGBA16F) : GL_ENUMS.RGBA,
            minFilter: GL_ENUMS.NEAREST,
            depth: false,
            unpackAlignment: 1,
        };

        this.fbo = {
            read: new RenderTarget(null, options),
            write: new RenderTarget(null, options),
            swap: () => {
                let temp = this.fbo.read;
                this.fbo.read = this.fbo.write;
                this.fbo.write = temp;
                this.uniform.value = this.fbo.read.texture;
            },
        };

        this.uniform.value.prepare( { context: this.activeContext });
        this.fbo.read.prepare({ context: this.activeContext });
        this.fbo.write.prepare({ context: this.activeContext });
    }

    addPass({
        vertex = defaultVertex,
        fragment = defaultFragment,
        uniforms = {},
        textureUniform = 'tMap',
        enabled = true
    }: Partial<IRenderPassInit> = {}) {
        uniforms[textureUniform] = this.uniform;
        const program = new Program(null, { vertex, fragment, uniforms });
        const mesh = new Mesh(null, { geometry: this.geometry, program });

        const pass = {
            mesh,
            program,
            uniforms,
            enabled,
            textureUniform,
        };

        this.passes.push(pass);
        return pass;
    }

    render() {
        const enabledPasses = this.passes.filter((pass) => pass.enabled);

        enabledPasses.forEach((pass, i) => {
            this.activeContext.render({
                scene: pass.mesh,
                target: this.fbo.write,
                clear: false,
            });
            this.fbo.swap();
        });
    }
}

const defaultVertex = /* glsl */ `
    attribute vec2 uv;
    attribute vec2 position;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
    }
`;

const defaultFragment = /* glsl */ `
    precision highp float;

    uniform sampler2D tMap;
    varying vec2 vUv;

    void main() {
        gl_FragColor = texture2D(tMap, vUv);
    }
`;
