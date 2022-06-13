import { Camera } from './Camera';
import { GLContext, INativeObjectHolder, Renderer } from './Renderer.js';
import { Texture, ITextureStyleInit } from './Texture.js';
export interface IRenderTargetInit extends ITextureStyleInit {
    width: number;
    height: number;
    depth: boolean;
    color: number;
    stencil: boolean;
    depthTexture: boolean;
}
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
    readonly texture: Texture;
    depthTexture: Texture;
    width: number;
    height: number;
    target: GLenum;
    buffer: WebGLFramebuffer;
    depthBuffer: WebGLRenderbuffer;
    stencilBuffer: WebGLRenderbuffer;
    depthStencilBuffer: WebGLRenderbuffer;
    private _invalid;
    constructor(_gl: GLContext, { width, height, target, color, // number of color attachments
    depth, stencil, depthTexture, // note - stencil breaks
    wrapS, wrapT, minFilter, magFilter, type, format, internalFormat, unpackAlignment, premultiplyAlpha, }?: Partial<IRenderTargetInit>);
    prepare({ context }: {
        context: Renderer;
        camera: Camera;
    }): void;
    setSize(width: number, height: number): void;
    destroy(): void;
}
