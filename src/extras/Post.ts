// TODO: Destroy render targets if size changed and exists

import { Program } from '../core/Program.js';
import { Mesh } from '../core/Mesh.js';
import { RenderTarget } from '../core/RenderTarget.js';
import { Triangle } from './Triangle.js';
import { GLContext, GL_ENUMS, Renderer } from '../core/Renderer.js';
import type { Geometry } from '../core/Geometry.js';
import { GL } from '../core/State.js';

export interface IPostInit {
    width: number;
    height: number;
    dpr: number;
    wrapS?: GLenum;
    wrapT?: GLenum;
    minFilter?: GLenum;
    magFilter?: GLenum;
    geometry?: Geometry;
    targetOnly?: boolean;
}

export interface IRenderPassInit {
    vertex: string;
    fragment: string;
    uniforms: Record<string, { value: any }> | {};
    enabled: boolean;
    textureUniform: string;
}

export interface IRenderPass {
    mesh: Mesh;
    program: Program;
    uniforms: Record<string, { value: any }> | {};
    enabled: boolean;
    textureUniform: string;
}

export interface ISwapChain {
    read: RenderTarget;
    write: RenderTarget;
    swap(): void;
}

export class Post {
    /**
     * @deprecated, always null, not use it. use activeContext instead
     *
     */
    public readonly gl: GLContext;
    public readonly activeContext: Renderer;
    public readonly options: {
        wrapS: GLenum;
        wrapT: GLenum;
        minFilter: GLenum;
        magFilter: GLenum;
        width: number;
        height: number;
    };
    public readonly geometry: Geometry;
    public readonly targetOnly: boolean;
    public readonly passes: IRenderPass[] = [];

    public width: number;
    public height: number;
    public dpr: number;

    private uniform: { value: any } = { value: null };
    private fbo: ISwapChain;

    constructor(
        context: GLContext |  Renderer,
        {
            width = undefined,
            height = undefined,
            dpr = undefined,
            wrapS = GL_ENUMS.CLAMP_TO_EDGE,
            wrapT = GL.CLAMP_TO_EDGE,
            minFilter = GL_ENUMS.LINEAR,
            magFilter = GL.LINEAR,
            geometry = new Triangle(null),
            targetOnly = null,
        } : Partial<IPostInit>  = {}
    ) {
        if (!(context instanceof Renderer)) {
            console.warn('[Post deprecation] You should pass instance of renderer instead of gl as argument')
        }

        this.activeContext = context instanceof Renderer ? context : context.renderer;
        this.options = { wrapS, wrapT, minFilter, magFilter, width, height };
        this.geometry = geometry;
        this.targetOnly = targetOnly;

        const fbo = (this.fbo = {
            read: null,
            write: null,
            swap: () => {
                let temp = fbo.read;
                fbo.read = fbo.write;
                fbo.write = temp;
            },
        });

        this.resize({ width, height, dpr });
    }

    addPass({
        vertex = defaultVertex,
        fragment = defaultFragment,
        uniforms = {},
        textureUniform = 'tMap',
        enabled = true
    }: Partial<IRenderPassInit> = {}) {
        uniforms[textureUniform] = { value: null };

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

    resize({ width, height, dpr }: { width?: number; height?: number; dpr?: number } = {}) {
        if (dpr) this.dpr = dpr;
        if (width) {
            this.width = width;
            this.height = height || width;
        }

        dpr = this.dpr || this.activeContext.dpr;
        width = Math.floor((this.width || this.activeContext.width) * dpr);
        height = Math.floor((this.height || this.activeContext.height) * dpr);

        this.options.width = width;
        this.options.height = height;

        if (!this.fbo.read) {
            this.fbo.read = new RenderTarget(null, this.options);
            this.fbo.write = new RenderTarget(null, this.options);
        } {
            this.fbo.read.setSize(width, height);
            this.fbo.write.setSize(width, height);
        }

        this.fbo.read.prepare({ context: this.activeContext });
        this.fbo.write.prepare({ context: this.activeContext });
    }

    // Uses same arguments as renderer.render, with addition of optional texture passed in to avoid scene render
    render({ scene, camera, texture, target = null, update = true, sort = true, frustumCull }) {
        const enabledPasses = this.passes.filter((pass) => pass.enabled);

        if (!texture) {
            this.activeContext.render({
                scene,
                camera,
                target: enabledPasses.length || (!target && this.targetOnly) ? this.fbo.write : target,
                update,
                sort,
                frustumCull,
            });
            this.fbo.swap();
        }

        enabledPasses.forEach((pass, i) => {
            pass.mesh.program.uniforms[pass.textureUniform].value = !i && texture ? texture : this.fbo.read.texture;
            this.activeContext.render({
                scene: pass.mesh,
                target: i === enabledPasses.length - 1 && (target || !this.targetOnly) ? target : this.fbo.write,
                clear: true,
            });
            this.fbo.swap();
        });

        this.uniform.value = this.fbo.read.texture;
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
