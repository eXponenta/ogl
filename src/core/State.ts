export interface IBlendFuncState {
    src: GLenum,
    dst: GLenum,
    srcAlpha?: GLenum,
    dstAlpha?: GLenum
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

// for constants
export const GL = self.WebGL2RenderingContext ? self.WebGL2RenderingContext.prototype : WebGLRenderingContext.prototype;

export type GL_TYPE = typeof GL;

export class RenderState {
    blendFunc: IBlendFuncState = {
        src: GL.ONE, dst: GL.ZERO
    };
    blendEquation: IBlendEquationState = {
        modeRGB: GL.FUNC_ADD
    };

    cullFace: GLenum | null = null;
    frontFace: GLenum = GL.CCW;

    depthMask: boolean = true;
    depthFunc: GLenum = GL.LESS;

    // should be put of state
    premultiplyAlpha: boolean = false;

    // should be out of state
    flipY: boolean = false;

    unpackAlignment: number = 4;

    framebuffer: WebGLFramebuffer = null;

    viewport: IViewportState = { x: 0, y: 0, width: null, height: null };

    textureUnits: Record<number, WebGLTexture> = {};

    activeTextureUnit: number = 0;

    boundBuffer: WebGLBuffer = null;

    uniformLocations: Map<WebGLUniformLocation, any> = new Map();

    currentProgram: WebGLProgram = null;

    currentVAO: WebGLVertexArrayObject = null;
}
