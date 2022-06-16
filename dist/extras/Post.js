// TODO: Destroy render targets if size changed and exists
import { Program } from '../core/Program.js';
import { Mesh } from '../core/Mesh.js';
import { RenderTarget } from '../core/RenderTarget.js';
import { Triangle } from './Triangle.js';
import { GL_ENUMS, Renderer } from '../core/Renderer.js';
import { GL } from '../core/State.js';
import { AbstractRenderTaskGroup } from '../core/RenderTaskGroup.js';
import { DefaultRenderTask } from '../core/RenderTask.js';
export class Post extends AbstractRenderTaskGroup {
    constructor(context, { width = undefined, height = undefined, dpr = undefined, wrapS = GL_ENUMS.CLAMP_TO_EDGE, wrapT = GL.CLAMP_TO_EDGE, minFilter = GL_ENUMS.LINEAR, magFilter = GL.LINEAR, geometry = new Triangle(null), targetOnly = null, } = {}) {
        super();
        this.passes = [];
        this.uniform = { value: null };
        this._postTask = new DefaultRenderTask();
        if (!(context instanceof Renderer)) {
            console.warn('[Post deprecation] You should pass instance of renderer instead of gl as argument');
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
    addPass({ vertex = defaultVertex, fragment = defaultFragment, uniforms = {}, textureUniform = 'tMap', enabled = true } = {}) {
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
    resize({ width, height, dpr } = {}) {
        if (dpr)
            this.dpr = dpr;
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
        }
        {
            this.fbo.read.setSize(width, height);
            this.fbo.write.setSize(width, height);
        }
        this.fbo.read.prepare({ context: this.activeContext });
        this.fbo.write.prepare({ context: this.activeContext });
    }
    setRenderOptions(options) {
        this._sceneOptions = options;
    }
    /**
     * @deprecated
     * Use post as render task group
     */
    render(option) {
        this.setRenderOptions(option);
        this.activeContext.render(this);
    }
    get renderTasks() {
        return this;
    }
    *[Symbol.iterator]() {
        const enabledPasses = this._enabledPasses;
        const { target, texture } = this._sceneOptions;
        if (!texture) {
            this._postTask.set(this._sceneOptions);
            this._postTask.target = enabledPasses.length || (!target && this.targetOnly)
                ? this.fbo.write
                : target;
            yield this._postTask;
            this.fbo.swap();
        }
        for (let i = 0; i < enabledPasses.length; i++) {
            const pass = enabledPasses[i];
            pass.mesh.program.uniforms[pass.textureUniform].value = (!i && texture)
                ? texture
                : this.fbo.read.texture;
            yield this._postTask.set({
                scene: pass.mesh,
                target: i === enabledPasses.length - 1 && (target || !this.targetOnly) ? target : this.fbo.write,
                clear: true,
            });
            this.fbo.swap();
        }
        this.uniform.value = this.fbo.read.texture;
    }
    begin(context) {
        this.fbo.read.prepare({ context });
        this.fbo.write.prepare({ context });
        this._enabledPasses = this.passes.filter((pass) => pass.enabled);
    }
    finish() {
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
