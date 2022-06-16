// TODO: test stencil and depth
import { Camera } from './Camera.js';
import { GLContext, GL_ENUMS, INativeObjectHolder, Renderer } from './Renderer.js';
import { Texture, ITextureStyleInit } from './Texture.js';

export interface IRenderTargetInit extends ITextureStyleInit {
    width: number;
    height: number;
    depth: boolean;
    color: number;
    stencil: boolean;
    depthTexture: boolean;
    msaa: boolean;
}

export interface IRenderTargetStorageInit {
    target: GLenum;
    attachment: GLenum;
    format: GLenum;
    width?: number;
    height?: number;
    msaa?: boolean;
}

export const RENDER_BUFFER_FORMATS = {
    depth: {
        format: GL_ENUMS.DEPTH_COMPONENT16,
        attachment: GL_ENUMS.DEPTH_ATTACHMENT,
    },

    stencil: {
        format: GL_ENUMS.STENCIL_INDEX8,
        attachment: GL_ENUMS.STENCIL_ATTACHMENT,
    },

    depthStencil: {
        format: GL_ENUMS.DEPTH_STENCIL,
        attachment: GL_ENUMS.DEPTH_STENCIL_ATTACHMENT,
    },
};

export class RenderTarget implements INativeObjectHolder {
    activeContext: Renderer;

    /**
     * @deprecated
     * Not store GL context at all
     */
    public readonly gl: GLContext;
    public readonly options: IRenderTargetInit;
    public readonly depth: boolean;
    // legacy
    public readonly textures: Texture[] = [];
    public depthTexture: Texture;

    public width: number;
    public height: number;
    public target: GLenum;
    public buffer: WebGLFramebuffer;

    public stencilBuffer: WebGLRenderbuffer;
    public depthBuffer: WebGLRenderbuffer;
    public depthStencilBuffer: WebGLRenderbuffer;

    // said that RT not complete
    protected _invalid = false;
    protected _attachmentsStorage: Map<string, WebGLFramebuffer | Texture<null>> = new Map();

    constructor(
        _gl: GLContext,
        {
            width = 0,
            height = 0,
            target = GL_ENUMS.FRAMEBUFFER,
            color = 1, // number of color attachments
            depth = true,
            stencil = false,
            depthTexture = false, // note - stencil breaks
            wrapS = GL_ENUMS.CLAMP_TO_EDGE,
            wrapT = GL_ENUMS.CLAMP_TO_EDGE,
            minFilter = GL_ENUMS.LINEAR,
            magFilter = minFilter,
            type = GL_ENUMS.UNSIGNED_BYTE,
            format = GL_ENUMS.RGBA,
            internalFormat = format,
            msaa = false,
            unpackAlignment,
            premultiplyAlpha,
        }: Partial<IRenderTargetInit> = {}
    ) {
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
            premultiplyAlpha,
            msaa,
        };

        this.width = width;
        this.height = height;
        this.depth = depth;
        this.target = target;
        this._invalid = true;
    }

    public get texture() {
        return this.textures[0];
    }

    /**
     * BEcause render buffers used only in RenderTarget not needed has OGL abstractions for it, use as has
     */
    protected _attachRenderBuffer(
        context: Renderer,
        options: IRenderTargetStorageInit
    ): WebGLRenderbuffer {
        const { gl } = context;
        const { format, attachment, target, width, height } = options;
        const key = `${format}${target}${attachment}`;

        const buffer = this._attachmentsStorage.get(key) || gl.createRenderbuffer();

        gl.bindRenderbuffer(GL_ENUMS.RENDERBUFFER, buffer);
        gl.renderbufferStorage(GL_ENUMS.RENDERBUFFER, format, width, height);
        gl.framebufferRenderbuffer(target, attachment, GL_ENUMS.RENDERBUFFER, buffer);

        this._attachmentsStorage.set(key, buffer);
        return buffer;
    }

    protected _attachTexture(
        context: Renderer,
        options: IRenderTargetStorageInit & Partial<ITextureStyleInit>
    ): Texture<null> {
        const { gl } = context;
        const { format, attachment, target, width, height } = options;
        const key = `${format}${target}${attachment}`;

        const texture = <Texture>this._attachmentsStorage.get(key) || new Texture(null, {
            ...options,
            flipY: false,
            generateMipmaps: false,
            target: GL_ENUMS.TEXTURE_2D,
        });

        texture.setSize(width, height);
        texture.prepare({ context });

        gl.framebufferTexture2D(
            target,
            attachment,
            GL_ENUMS.TEXTURE_2D,
            texture.texture,
            0
        );

        this._attachmentsStorage.set(key, texture);
        return texture;
    }

    prepare({ context }: { context: Renderer }): void {
        if (!this._invalid) {
            return;
        }

        const { gl } = context;
        const { options } = this;
        const drawBuffers = [];
        const activeAttachments: Array<WebGLRenderbuffer | Texture> = [];

        options.width = options.width || context.gl.canvas.width;
        options.height = options.height || context.gl.canvas.height;

        this.width = options.width;
        this.height = options.height;
        this.target = options.target;
        this.buffer = this.buffer || gl.createFramebuffer();
        this.textures.length = 0;

        this._invalid = false;

        context.bindFramebuffer(this);

        // create and attach required num of color textures
        for (let i = 0; i < options.color; i++) {
            const t = this._attachTexture(context, {
                ...options,
                attachment: GL_ENUMS.COLOR_ATTACHMENT0 + i,
            });

            this.textures[i] = t;

            activeAttachments.push(t);
            drawBuffers.push(gl.COLOR_ATTACHMENT0 + i);
        }

        // For multi-render targets shader access
        if (drawBuffers.length > 1) {
            context.drawBuffers(drawBuffers);
        }

        // note depth textures break stencil - so can't use together
        if (options.depthTexture && (context.isWebgl2 || context.getExtension('WEBGL_depth_texture'))) {
            this.depthTexture = this._attachTexture(context, {
                minFilter: GL_ENUMS.NEAREST,
                magFilter: GL_ENUMS.NEAREST,
                format: GL_ENUMS.DEPTH_COMPONENT,
                internalFormat: context.isWebgl2 ? GL_ENUMS.DEPTH_COMPONENT16 : GL_ENUMS.DEPTH_COMPONENT,
                type: GL_ENUMS.UNSIGNED_INT,
                attachment: GL_ENUMS.DEPTH_ATTACHMENT,
                target: this.target,
            });

            activeAttachments.push(this.depthTexture);
        } else {
            let storageType: keyof typeof RENDER_BUFFER_FORMATS = 'depth';

            if (options.stencil && !options.depth) {
                storageType = 'stencil';
            }

            if (options.depth && options.stencil) {
                storageType = 'depthStencil';
            }

            const renderBuffer = this._attachRenderBuffer(context, {
                target: this.target,
                width: this.width,
                height: this.height,
                ...RENDER_BUFFER_FORMATS[storageType]
            });

            for(const key in RENDER_BUFFER_FORMATS) {
                this[key + 'Buffer'] = key === storageType ? renderBuffer : null;
            }

            activeAttachments.push(renderBuffer);
        }

        // remove older attachments
        for (const [key, value] of this._attachmentsStorage) {
            if (activeAttachments.indexOf(value) > -1) continue;

            // destroy texture
            if (value && value instanceof Texture) {
                value.destroy();
            } else {
                // or delete render buffer
                gl.deleteRenderbuffer(value);
            }

            this._attachmentsStorage.delete(key);
        }

        context.bindFramebuffer({ target: this.target });

        this.activeContext = context;
    }

    setSize(width: number, height: number) {
        if (this.width === width && this.height === height) return;

        this.options.width = width | 0;
        this.options.height = height | 0;

        // prepares should be called
        this._invalid = true;
    }

    destroy(): void {
        // todo
        // implement it

        if (!this.buffer) {
            return;
        }

        const { gl } = this.activeContext;

        gl.deleteFramebuffer(this.buffer);

        // remove all attachments
        for (const [key, value] of this._attachmentsStorage) {
            // destroy texture
            if (value && value instanceof Texture) {
                value.destroy();
            } else {
                // or delete render buffer
                gl.deleteRenderbuffer(value);
            }
        }

        this.stencilBuffer = null;
        this.depthBuffer = null;
        this.depthStencilBuffer = null;
        this.depthTexture = null;
        this.textures.length = 0;

        this._attachmentsStorage.clear();
    }
}
