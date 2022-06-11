// for constants 
export const GL = self.WebGL2RenderingContext ? self.WebGL2RenderingContext.prototype : WebGLRenderingContext.prototype;
export class RenderState {
    constructor() {
        this.blendFunc = {
            src: GL.ONE, dst: GL.ZERO
        };
        this.blendEquation = {
            modeRGB: GL.FUNC_ADD
        };
        this.cullFace = null;
        this.frontFace = GL.CCW;
        this.depthMask = true;
        this.depthFunc = GL.LESS;
        // should be put of state
        this.premultiplyAlpha = false;
        // should be out of state
        this.flipY = false;
        this.unpackAlignment = 4;
        this.framebuffer = null;
        this.viewport = { x: 0, y: 0, width: null, height: null };
        this.textureUnits = [];
        this.activeTextureUnit = 0;
        this.boundBuffer = null;
        this.uniformLocations = new Map();
        this.currentProgram = null;
        this.currentVAO = null;
    }
}
