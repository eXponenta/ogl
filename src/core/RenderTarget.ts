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

abstract class RenderTargetStorage<T extends IRenderTargetStorageInit = IRenderTargetStorageInit> implements INativeObjectHolder {
    public activeContext: Renderer;

    public target: GLenum;
    public format: GLenum;
    public attachment: GLenum;
    public width: number = 0;
    public height: number = 0;

    protected _invalid: boolean = true;

    constructor (public options: T) {};

    abstract prepare(args: { context: Renderer; camera: Camera; }): void;
    abstract destroy(): void;

    setSize(width: number, height: number) {
        this._invalid = this._invalid || this.width !== width || this.height !== height;

        this.width = width;
        this.height = height;

        this.options.width = width;
        this.options.height = height;
    }

}

class RenderBufferStorage extends RenderTargetStorage {
    public buffer: WebGLRenderbuffer;

    prepare({ context }: { context: Renderer }): void {
        if (!this._invalid) {
            return;
        }

        const { gl } = context;
        const { format, attachment, target, width, height } = this.options;

        this.buffer = this.buffer || gl.createRenderbuffer();

        gl.bindRenderbuffer(GL_ENUMS.RENDERBUFFER, this.buffer);
        gl.renderbufferStorage(GL_ENUMS.RENDERBUFFER, format, width, height);
        gl.framebufferRenderbuffer(target, attachment, GL_ENUMS.RENDERBUFFER, this.buffer);

        this.activeContext = context;
        this.format = format;
        this.attachment = attachment;
        this.target = target;
        this.width = width;
        this.height = height;

        this._invalid = false;
    }

    destroy(): void {
        if (!this.buffer || !this.activeContext) {
            return;
        }

        this.activeContext.gl.deleteRenderbuffer(this.buffer);
    }
}

class TextureStorage extends RenderTargetStorage<IRenderTargetStorageInit & Partial<ITextureStyleInit>> {
    public texture: Texture<null>;

    protected _invalid: boolean;

    prepare({context}: { context: Renderer }): void {
        const { format, attachment, target, width, height } = this.options;

        this.texture = this.texture || new Texture(null, {
            ...this.options,
            flipY: false,
            generateMipmaps: false,
            target: GL_ENUMS.TEXTURE_2D
        });

        this.texture.prepare({ context });

        context.gl.framebufferTexture2D(
            target,
            attachment,
            GL_ENUMS.TEXTURE_2D,
            this.texture.texture,
            0
        );

        this.texture.setSize(width, height);

        this.width = width;
        this.height = height;
        this.attachment = attachment;
        this.format = format;
        this.target = target;

        this.activeContext = context;

        this._invalid = false;
    }

    destroy(): void {
        this.texture?.destroy();
    }
}

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

    public readonly bufferStorages: {
        depth?: RenderBufferStorage;
        stencil?: RenderBufferStorage;
        depthStencil?: RenderBufferStorage;
    } = {};

    public textureStorage: TextureStorage[] = [];
    public depthTextureStorage: TextureStorage;

    public width: number;
    public height: number;
    public target: GLenum;
    public buffer: WebGLFramebuffer;

    // said that RT not complete
    private _invalid = false;

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

    // Migrations

    get texture(): Texture<null> {
        return this.textureStorage[0].texture;
    }

    get stencilBuffer() {
        return this.bufferStorages.depthStencil?.buffer;
    }

    get depthBuffer() {
        return this.bufferStorages.depth?.buffer;
    }

    get depthStencilBuffer() {
        return this.bufferStorages.depthStencil?.buffer;
    }

    prepare({ context }: { context: Renderer }): void {
        if (!this._invalid) {
            return;
        }

        const { gl } = context;
        const { bufferStorages: storages, options } = this;
        const drawBuffers = [];

        options.width = options.width || context.gl.canvas.width;
        options.height = options.height || context.gl.canvas.height;

        this.width = options.width;
        this.height = options.height;
        this.target = options.target;
        this.buffer = this.buffer || gl.createFramebuffer();

        this._invalid = false;

        context.bindFramebuffer(this);

        // create and attach required num of color textures
        for (let i = 0; i < options.color; i++) {
            const t = this.textureStorage[i] || new TextureStorage({
                ...this.options,
                attachment: GL_ENUMS.COLOR_ATTACHMENT0 + i,
            });

            this.textureStorage[i] = t;
            this.textures[i] = t.texture;

            t.setSize(this.width, this.height);
            t.prepare({ context });

            drawBuffers.push(gl.COLOR_ATTACHMENT0 + i);
        }

        // For multi-render targets shader access
        if (drawBuffers.length > 1) {
            context.drawBuffers(drawBuffers);
        }

        // note depth textures break stencil - so can't use together
        if (this.options.depthTexture && (context.isWebgl2 || context.getExtension('WEBGL_depth_texture'))) {
            const t = this.depthTextureStorage || new TextureStorage({
                minFilter: GL_ENUMS.NEAREST,
                magFilter: GL_ENUMS.NEAREST,
                format: GL_ENUMS.DEPTH_COMPONENT,
                internalFormat: context.isWebgl2 ? GL_ENUMS.DEPTH_COMPONENT16 : GL_ENUMS.DEPTH_COMPONENT,
                type: GL_ENUMS.UNSIGNED_INT,
                attachment: GL_ENUMS.DEPTH_ATTACHMENT,
                target: this.target,
            })

            this.depthTextureStorage = t;
            this.depthTexture = this.depthTextureStorage.texture;

            t.setSize(this.width, this.height);
            t.prepare({ context });

        } else {
            let storageType: keyof typeof RENDER_BUFFER_FORMATS = 'depth';

            if (this.options.stencil && !this.options.depth) {
                storageType = 'stencil';
            }

            if (this.options.depth && this.options.stencil) {
                storageType = 'depthStencil';
            }

            // invalidate and destroy not needed
            for (const key in storages) {
                const old = storages[key] as RenderBufferStorage;

                if (key !== storageType && old) {
                    // invalidate storages
                    old.destroy();
                    storages[key] = null;
                }
            }

            const storage = storages[storageType] || new RenderBufferStorage({
                target: this.target,
                ...RENDER_BUFFER_FORMATS[storageType]
            });

            storage.setSize(this.width, this.height);
            storage.prepare({ context });

            storages[storageType] = storage;
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

        for (const key in this.bufferStorages) {
            (this.bufferStorages[key] as RenderBufferStorage)?.destroy();
            this.bufferStorages[key] = null;
        }

        for (const t of this.textureStorage) {
            t.destroy();
        }
        this.textureStorage.length = 0;

        this.depthTextureStorage?.destroy();
        this.depthTextureStorage = null;
    }
}
