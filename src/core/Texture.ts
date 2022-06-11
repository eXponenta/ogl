// TODO: delete texture
// TODO: use texSubImage2D for updates (video or when loaded)
// TODO: need? encoding = linearEncoding
// TODO: support non-compressed mipmaps uploads

import type { IDisposable } from "./IDisposable";
import type { GLContext } from "./Renderer.js";
import type { RenderState } from "./State.js";
import { nextUUID } from "./uuid.js";

const emptyPixel = new Uint8Array(4);

const isPowerOf2 = (value: number) => (value & (value - 1)) === 0;

export interface ICompressedImageFrame {
    width: number;
    height: number;
    data: Uint8Array;
}

export interface ICompressedImageData extends Array<ICompressedImageFrame> {
    isCompressedTexture: boolean;
}

export type INativeImageSource =
    HTMLCanvasElement |
    HTMLImageElement |
    ImageBitmap |
    HTMLVideoElement |
    null;

export type IImageSource = INativeImageSource | ICompressedImageData | null;

export interface ITextureStyleInit {
    target: GLenum;
    type: GLenum;
    format: GLenum;
    internalFormat: GLenum;
    wrapS: GLenum;
    wrapT: GLenum;
    minFilter: GLenum;
    magFilter: GLenum;
    premultiplyAlpha: boolean;
    unpackAlignment: number;
}

export interface IBaseTextureInit extends ITextureStyleInit {
    generateMipmaps: boolean;
    flipY: boolean;
    anisotropy: number;
    level: number;
}

export interface IRegularTextureInit<T extends IImageSource> extends IBaseTextureInit {
    image: T;
}

export interface IEmptyTextureInit extends IBaseTextureInit {
    // used for RenderTargets or Data Textures
    width: number;
    height: number;
}

export type ITextureInit<T extends IImageSource> = IRegularTextureInit<T> | IEmptyTextureInit;

export class Texture<T extends IImageSource = null> implements IDisposable {
    public image: T;

    public readonly gl: GLContext;
    public readonly id: number;
    public readonly type: GLenum;
    public readonly target: GLenum;
    public readonly format: GLenum;
    public readonly internalFormat: GLenum;
    public readonly unpackAlignment: number;
    public readonly store: { image: T };
    public readonly state: Partial<ITextureInit<T>>
    public readonly glState: RenderState;

    public wrapS: GLenum;
    public wrapT: GLenum;
    public generateMipmaps: boolean;
    public minFilter: GLenum;
    public magFilter: GLenum;
    public premultiplyAlpha: boolean;
    public flipY: boolean;
    public anisotropy: number;
    public level: number;

    public width: number;
    public height: number;

    public needsUpdate: boolean = false;

    texture: WebGLTexture;

    onUpdate?: () => void;

    constructor(
        gl: GLContext,
        {
            target = gl.TEXTURE_2D,
            type = gl.UNSIGNED_BYTE,
            format = gl.RGBA,
            internalFormat = format,
            wrapS = gl.CLAMP_TO_EDGE,
            wrapT = gl.CLAMP_TO_EDGE,
            generateMipmaps = true,
            minFilter = generateMipmaps ? gl.NEAREST_MIPMAP_LINEAR : gl.LINEAR,
            magFilter = gl.LINEAR,
            premultiplyAlpha = false,
            unpackAlignment = 4,
            flipY = target == gl.TEXTURE_2D ? true : false,
            anisotropy = 0,
            level = 0,
            ...other
        }: Partial<ITextureInit<T>> = {}
    ) {
        this.gl = gl;
        this.id = nextUUID();

        this.image = (other as IRegularTextureInit<T>).image;
        this.target = target;
        this.type = type;
        this.format = format;
        this.internalFormat = internalFormat;
        this.minFilter = minFilter;
        this.magFilter = magFilter;
        this.wrapS = wrapS;
        this.wrapT = wrapT;
        this.generateMipmaps = generateMipmaps;
        this.premultiplyAlpha = premultiplyAlpha;
        this.unpackAlignment = unpackAlignment;
        this.flipY = flipY;

        // not set yet
        this.anisotropy = Math.min(anisotropy, this.gl.renderer.parameters.maxAnisotropy);
        this.level = level;

        this.width = (other as IEmptyTextureInit).width;
        this.height = (other as IEmptyTextureInit).height || this.width;
        this.texture = this.gl.createTexture();

        this.store = {
            image: null,
        };

        // Alias for state store to avoid redundant calls for global state
        this.glState = this.gl.renderer.state;

        // State store to avoid redundant calls for per-texture state
        this.state = {
            minFilter: this.gl.NEAREST_MIPMAP_LINEAR,
            magFilter: this.gl.LINEAR,
            wrapS: this.gl.REPEAT,
            wrapT: this.gl.REPEAT,
            anisotropy: 0,
        };
    }

    bind() {
        // Already bound to active texture unit
        if (this.glState.textureUnits[this.glState.activeTextureUnit] === this.id) return;
        this.gl.bindTexture(this.target, this.texture);
        this.glState.textureUnits[this.glState.activeTextureUnit] = this.id;
    }

    update(textureUnit = 0) {
        const needsUpdate = !(this.image === this.store.image && !this.needsUpdate);

        // Make sure that texture is bound to its texture unit
        if (needsUpdate || this.glState.textureUnits[textureUnit] !== this.id) {
            // set active texture unit to perform texture functions
            this.gl.renderer.activeTexture(textureUnit);
            this.bind();
        }

        if (!needsUpdate) return;
        this.needsUpdate = false;

        // this is NOT A GL GLOBAL STATE
        if (this.flipY !== this.glState.flipY) {
            this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, this.flipY);
            this.glState.flipY = this.flipY;
        }
        // this is NOT A GL GLOBAL STATE
        if (this.premultiplyAlpha !== this.glState.premultiplyAlpha) {
            this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha);
            this.glState.premultiplyAlpha = this.premultiplyAlpha;
        }
        // this is NOT A GL GLOBAL STATE
        if (this.unpackAlignment !== this.glState.unpackAlignment) {
            this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, this.unpackAlignment);
            this.glState.unpackAlignment = this.unpackAlignment;
        }

        if (this.minFilter !== this.state.minFilter) {
            this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, this.minFilter);
            this.state.minFilter = this.minFilter;
        }

        if (this.magFilter !== this.state.magFilter) {
            this.gl.texParameteri(this.target, this.gl.TEXTURE_MAG_FILTER, this.magFilter);
            this.state.magFilter = this.magFilter;
        }

        if (this.wrapS !== this.state.wrapS) {
            this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_S, this.wrapS);
            this.state.wrapS = this.wrapS;
        }

        if (this.wrapT !== this.state.wrapT) {
            this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_T, this.wrapT);
            this.state.wrapT = this.wrapT;
        }

        if (this.anisotropy && this.anisotropy !== this.state.anisotropy) {
            this.gl.texParameterf(
                this.target,
                this.gl.renderer.getExtension('EXT_texture_filter_anisotropic').TEXTURE_MAX_ANISOTROPY_EXT,
                this.anisotropy
            );
            this.state.anisotropy = this.anisotropy;
        }

        if (this.image) {
            if ((this.image as any).width) {
                this.width = (this.image as any).width;
                this.height = (this.image as any).height;
            }

            if (this.target === this.gl.TEXTURE_CUBE_MAP) {
                // For cube maps
                for (let i = 0; i < 6; i++) {
                    this.gl.texImage2D(
                        this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                        this.level,
                        this.internalFormat,
                        this.format,
                        this.type,
                        this.image[i]
                    );
                }
            } else if (ArrayBuffer.isView(this.image)) {
                // Data texture
                this.gl.texImage2D(this.target, this.level, this.internalFormat, this.width, this.height, 0, this.format, this.type, this.image);
            } else if ((this.image as ICompressedImageData).isCompressedTexture) {
                // Compressed texture
                for (let level = 0; level < (this.image as ICompressedImageData).length; level++) {
                    this.gl.compressedTexImage2D(
                        this.target,
                        level,
                        this.internalFormat,
                        this.image[level].width,
                        this.image[level].height,
                        0,
                        this.image[level].data
                    );
                }
            } else {
                // Regular texture
                this.gl.texImage2D(this.target, this.level, this.internalFormat, this.format, this.type, this.image as INativeImageSource);
            }

            if (this.generateMipmaps) {
                // For WebGL1, if not a power of 2, turn off mips, set wrapping to clamp to edge and minFilter to linear
                if (!this.gl.renderer.isWebgl2 && (!isPowerOf2((this.image as any).width) || !isPowerOf2((this.image as any).height))) {
                    this.generateMipmaps = false;
                    this.wrapS = this.wrapT = this.gl.CLAMP_TO_EDGE;
                    this.minFilter = this.gl.LINEAR;
                } else {
                    this.gl.generateMipmap(this.target);
                }
            }

            // Callback for when data is pushed to GPU
            this.onUpdate && this.onUpdate();
        } else {
            if (this.target === this.gl.TEXTURE_CUBE_MAP) {
                // Upload empty pixel for each side while no image to avoid errors while image or video loading
                for (let i = 0; i < 6; i++) {
                    this.gl.texImage2D(
                        this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                        0,
                        this.gl.RGBA,
                        1,
                        1,
                        0,
                        this.gl.RGBA,
                        this.gl.UNSIGNED_BYTE,
                        emptyPixel
                    );
                }
            } else if (this.width) {
                // image intentionally left null for RenderTarget
                this.gl.texImage2D(this.target, this.level, this.internalFormat, this.width, this.height, 0, this.format, this.type, null);
            } else {
                // Upload empty pixel if no image to avoid errors while image or video loading
                this.gl.texImage2D(this.target, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, emptyPixel);
            }
        }
        this.store.image = this.image;
    }

    destroy(): void {
        this.gl.deleteTexture(this.texture);
        this.store.image = null;
        this.image = null;
    }
}
