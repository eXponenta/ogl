import { GL_ENUMS } from './Renderer.js';
import { Texture } from './Texture.js';
export class RenderTarget {
    constructor(_gl, { width = 0, height = 0, target = GL_ENUMS.FRAMEBUFFER, color = 1, // number of color attachments
    depth = true, stencil = false, depthTexture = false, // note - stencil breaks
    wrapS = GL_ENUMS.CLAMP_TO_EDGE, wrapT = GL_ENUMS.CLAMP_TO_EDGE, minFilter = GL_ENUMS.LINEAR, magFilter = minFilter, type = GL_ENUMS.UNSIGNED_BYTE, format = GL_ENUMS.RGBA, internalFormat = format, unpackAlignment, premultiplyAlpha, } = {}) {
        // said that RT not complete
        this._invalid = false;
        this.options = {
            width,
            height,
            target,
            color,
            depth,
            stencil,
            depthTexture,
            wrapS,
            wrapT,
            minFilter,
            magFilter,
            type,
            format,
            internalFormat,
            unpackAlignment,
            premultiplyAlpha
        };
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.target = target;
        this.textures = [];
        // create and attach required num of color textures
        for (let i = 0; i < color; i++) {
            this.textures.push(new Texture(_gl, {
                width,
                height,
                wrapS,
                wrapT,
                minFilter,
                magFilter,
                type,
                format,
                internalFormat,
                unpackAlignment,
                premultiplyAlpha,
                flipY: false,
                generateMipmaps: false,
            }));
        }
        // alias for majority of use cases
        this.texture = this.textures[0];
        this._invalid = true;
    }
    prepare({ context }) {
        if (!this._invalid) {
            return;
        }
        this.options.width = this.options.width || context.gl.canvas.width;
        this.options.height = this.options.height || context.gl.canvas.height;
        this.width = this.options.width;
        this.height = this.options.height;
        const { gl } = context;
        const drawBuffers = [];
        this._invalid = false;
        this.buffer = this.buffer || gl.createFramebuffer();
        this.target = this.options.target;
        context.bindFramebuffer(this);
        // create and attach required num of color textures
        for (let i = 0; i < this.textures.length; i++) {
            const t = this.textures[i];
            t.width = this.width;
            t.height = this.height;
            t.needsUpdate = true;
            // MUST CALL
            // without it a texture property will null
            t.prepare({ context });
            gl.framebufferTexture2D(this.target, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, t.texture, 0);
            drawBuffers.push(gl.COLOR_ATTACHMENT0 + i);
        }
        // For multi-render targets shader access
        if (drawBuffers.length > 1) {
            context.drawBuffers(drawBuffers);
        }
        // note depth textures break stencil - so can't use together
        if (this.options.depthTexture && (context.isWebgl2 || context.getExtension('WEBGL_depth_texture'))) {
            this.depthTexture = this.depthTexture || new Texture(gl, {
                width: this.width,
                height: this.height,
                minFilter: GL_ENUMS.NEAREST,
                magFilter: GL_ENUMS.NEAREST,
                format: GL_ENUMS.DEPTH_COMPONENT,
                internalFormat: context.isWebgl2 ? GL_ENUMS.DEPTH_COMPONENT16 : GL_ENUMS.DEPTH_COMPONENT,
                type: GL_ENUMS.UNSIGNED_INT,
            });
            this.depthTexture.width = this.width;
            this.depthTexture.height = this.height;
            this.depthTexture.needsUpdate = true;
            this.depthTexture.prepare({ context });
            gl.framebufferTexture2D(this.target, GL_ENUMS.DEPTH_ATTACHMENT, GL_ENUMS.TEXTURE_2D, this.depthTexture.texture, 0);
        }
        else {
            // Render buffers
            if (this.options.depth && !this.options.stencil) {
                this.depthBuffer = this.depthBuffer || gl.createRenderbuffer();
                gl.bindRenderbuffer(GL_ENUMS.RENDERBUFFER, this.depthBuffer);
                gl.renderbufferStorage(GL_ENUMS.RENDERBUFFER, GL_ENUMS.DEPTH_COMPONENT16, this.width, this.height);
                gl.framebufferRenderbuffer(this.target, GL_ENUMS.DEPTH_ATTACHMENT, GL_ENUMS.RENDERBUFFER, this.depthBuffer);
            }
            if (this.options.stencil && !this.options.depth) {
                this.stencilBuffer = this.stencilBuffer || gl.createRenderbuffer();
                gl.bindRenderbuffer(gl.RENDERBUFFER, this.stencilBuffer);
                gl.renderbufferStorage(gl.RENDERBUFFER, GL_ENUMS.STENCIL_INDEX8, this.width, this.height);
                gl.framebufferRenderbuffer(this.target, GL_ENUMS.STENCIL_ATTACHMENT, GL_ENUMS.RENDERBUFFER, this.stencilBuffer);
            }
            if (this.options.depth && this.options.stencil) {
                this.depthStencilBuffer = this.depthStencilBuffer || gl.createRenderbuffer();
                gl.bindRenderbuffer(GL_ENUMS.RENDERBUFFER, this.depthStencilBuffer);
                gl.renderbufferStorage(GL_ENUMS.RENDERBUFFER, GL_ENUMS.DEPTH_STENCIL, this.width, this.height);
                gl.framebufferRenderbuffer(this.target, GL_ENUMS.DEPTH_STENCIL_ATTACHMENT, GL_ENUMS.RENDERBUFFER, this.depthStencilBuffer);
            }
        }
        context.bindFramebuffer({ target: this.target });
        this.activeContext = context;
    }
    setSize(width, height) {
        if (this.width === width && this.height === height)
            return;
        this.options.width = width;
        this.options.height = height;
        // prepares should be called
        this._invalid = true;
    }
    destroy() {
        // todo
        // implement it
    }
}
