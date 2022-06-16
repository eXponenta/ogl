import { GLContext, INativeObjectHolder, Renderer } from './Renderer.js';
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
export declare const RENDER_BUFFER_FORMATS: {
    depth: {
        format: number;
        attachment: number;
    };
    stencil: {
        format: number;
        attachment: number;
    };
    depthStencil: {
        format: number;
        attachment: number;
    };
};
export declare class RenderTarget implements INativeObjectHolder {
    activeContext: Renderer;
    /**
     * @deprecated
     * Not store GL context at all
     */
    readonly gl: GLContext;
    readonly options: IRenderTargetInit;
    readonly depth: boolean;
    readonly textures: Texture[];
    depthTexture: Texture;
    width: number;
    height: number;
    target: GLenum;
    buffer: WebGLFramebuffer;
    stencilBuffer: WebGLRenderbuffer;
    depthBuffer: WebGLRenderbuffer;
    depthStencilBuffer: WebGLRenderbuffer;
    protected _invalid: boolean;
    protected _attachmentsStorage: Map<string, WebGLFramebuffer | Texture<null>>;
    constructor(_gl: GLContext, { width, height, target, color, // number of color attachments
    depth, stencil, depthTexture, // note - stencil breaks
    wrapS, wrapT, minFilter, magFilter, type, format, internalFormat, msaa, unpackAlignment, premultiplyAlpha, }?: Partial<IRenderTargetInit>);
    get texture(): Texture<null>;
    /**
     * BEcause render buffers used only in RenderTarget not needed has OGL abstractions for it, use as has
     */
    protected _attachRenderBuffer(context: Renderer, options: IRenderTargetStorageInit): WebGLRenderbuffer;
    protected _attachTexture(context: Renderer, options: IRenderTargetStorageInit & Partial<ITextureStyleInit>): Texture<null>;
    prepare({ context }: {
        context: Renderer;
    }): void;
    setSize(width: number, height: number): void;
    destroy(): void;
}
