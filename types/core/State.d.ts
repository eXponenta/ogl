export interface IBlendFuncState {
    src: GLenum;
    dst: GLenum;
    srcAlpha?: GLenum;
    dstAlpha?: GLenum;
}
export interface IBlendEquationState {
    modeRGB: GLenum;
    modeAlpha?: GLenum;
}
export interface IViewportState {
    x: number;
    y: number;
    width: number | null;
    height: number | null;
}
export declare const GL: WebGL2RenderingContext | WebGLRenderingContext;
export declare type GL_TYPE = typeof GL;
export declare class RenderState {
    blendFunc: IBlendFuncState;
    blendEquation: IBlendEquationState;
    cullFace: GLenum | null;
    frontFace: GLenum;
    depthMask: boolean;
    depthFunc: GLenum;
    premultiplyAlpha: boolean;
    flipY: boolean;
    unpackAlignment: number;
    framebuffer: WebGLFramebuffer;
    viewport: IViewportState;
    textureUnits: Record<number, WebGLTexture>;
    activeTextureUnit: number;
    boundBuffer: WebGLBuffer;
    uniformLocations: Map<WebGLUniformLocation, any>;
    currentProgram: WebGLProgram;
    currentVAO: WebGLVertexArrayObject;
}
