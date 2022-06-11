import type { IDisposable } from './IDisposable';
import type { GLContext } from './Renderer.js';
import { Texture, ITextureStyleInit } from './Texture.js';
export interface IRenderTargetInit extends ITextureStyleInit {
    width: number;
    height: number;
    depth: boolean;
    color: number;
    stencil: boolean;
    depthTexture: boolean;
}
export declare class RenderTarget implements IDisposable {
    readonly gl: GLContext;
    readonly depth: boolean;
    readonly textures: Texture[];
    readonly texture: Texture;
    readonly depthTexture: Texture;
    width: number;
    height: number;
    target: GLenum;
    buffer: WebGLFramebuffer;
    depthBuffer: WebGLRenderbuffer;
    stencilBuffer: WebGLRenderbuffer;
    depthStencilBuffer: WebGLRenderbuffer;
    constructor(gl: GLContext, { width, height, target, color, // number of color attachments
    depth, stencil, depthTexture, // note - stencil breaks
    wrapS, wrapT, minFilter, magFilter, type, format, internalFormat, unpackAlignment, premultiplyAlpha, }?: Partial<IRenderTargetInit>);
    setSize(width: any, height: any): void;
    destroy(): void;
}
