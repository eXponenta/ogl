// TODO: delete texture
// TODO: use texSubImage2D for updates (video or when loaded)
// TODO: need? encoding = linearEncoding
// TODO: support non-compressed mipmaps uploads
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { GL_ENUMS } from "./Renderer.js";
import { nextUUID } from "./uuid.js";
const emptyPixel = new Uint8Array(4);
const isPowerOf2 = (value) => (value & (value - 1)) === 0;
export class Texture {
    constructor(_gl, _a = {}) {
        var { target = GL_ENUMS.TEXTURE_2D, type = GL_ENUMS.UNSIGNED_BYTE, format = GL_ENUMS.RGBA, internalFormat = format, wrapS = GL_ENUMS.CLAMP_TO_EDGE, wrapT = GL_ENUMS.CLAMP_TO_EDGE, generateMipmaps = true, minFilter = generateMipmaps ? GL_ENUMS.NEAREST_MIPMAP_LINEAR : GL_ENUMS.LINEAR, magFilter = GL_ENUMS.LINEAR, premultiplyAlpha = false, unpackAlignment = 4, flipY = target == GL_ENUMS.TEXTURE_2D ? true : false, anisotropy = 0, level = 0 } = _a, other = __rest(_a, ["target", "type", "format", "internalFormat", "wrapS", "wrapT", "generateMipmaps", "minFilter", "magFilter", "premultiplyAlpha", "unpackAlignment", "flipY", "anisotropy", "level"]);
        this.needsUpdate = false;
        this.textureUnit = 0;
        this.id = nextUUID();
        this.image = other.image;
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
        this.anisotropy = anisotropy;
        this.level = level;
        this.width = other.width;
        this.height = other.height || this.width;
        this.store = {
            image: null,
        };
        // State store to avoid redundant calls for per-texture state
        this.state = {
            minFilter: GL_ENUMS.NEAREST_MIPMAP_LINEAR,
            magFilter: GL_ENUMS.LINEAR,
            wrapS: GL_ENUMS.REPEAT,
            wrapT: GL_ENUMS.REPEAT,
            anisotropy: 0,
        };
    }
    /**
     * Attach renderer context to current texture and prepare (bind, upload) for rendering
     * @returns
     */
    prepare({ context }) {
        if (!this.texture) {
            this.texture = context.gl.createTexture();
        }
        if (!this.texture) {
            // bug
            return;
        }
        const needsUpdate = this.image !== this.store.image || this.needsUpdate || this.activeContext !== context;
        if (needsUpdate) {
            this.upload(context);
        }
        this.needsUpdate = false;
        this.activeContext = context;
    }
    /**
     * Bind texture to slot, not prepare it. Only bind. For prepare use prepare
     */
    bind(textureUnit = this.textureUnit) {
        if (!this.activeContext) {
            console.warn('[Texture] Direct bind not allowed before prepare, use prepare to attaching texture to context');
        }
        this.textureUnit = textureUnit;
        this.activeContext.bindTexture(this.target, this.texture, this.textureUnit);
    }
    setSize(width, height) {
        if (this.image) {
            return;
        }
        this.width = width;
        this.height = height;
        this.needsUpdate = true;
    }
    /**
     * @deprecated
     * Only mark, not force upload.
     * Use prepare for direct upload and bind for bind
     */
    update(textureUnit = 0) {
        this.textureUnit = textureUnit;
        this.needsUpdate = true;
    }
    upload(context) {
        if (!this.texture) {
            return this.prepare({ context });
        }
        const { gl, state } = context;
        // bind if not bounded
        // needs for upload
        context.bindTexture(this.target, this.texture);
        // this is NOT A GL GLOBAL STATE
        if (this.flipY !== state.flipY) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this.flipY);
            state.flipY = this.flipY;
        }
        // this is NOT A GL GLOBAL STATE
        if (this.premultiplyAlpha !== state.premultiplyAlpha) {
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha);
            state.premultiplyAlpha = this.premultiplyAlpha;
        }
        // this is NOT A GL GLOBAL STATE
        if (this.unpackAlignment !== state.unpackAlignment) {
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, this.unpackAlignment);
            state.unpackAlignment = this.unpackAlignment;
        }
        if (this.minFilter !== this.state.minFilter) {
            gl.texParameteri(this.target, gl.TEXTURE_MIN_FILTER, this.minFilter);
            this.state.minFilter = this.minFilter;
        }
        if (this.magFilter !== this.state.magFilter) {
            gl.texParameteri(this.target, gl.TEXTURE_MAG_FILTER, this.magFilter);
            this.state.magFilter = this.magFilter;
        }
        if (this.wrapS !== this.state.wrapS) {
            gl.texParameteri(this.target, gl.TEXTURE_WRAP_S, this.wrapS);
            this.state.wrapS = this.wrapS;
        }
        if (this.wrapT !== this.state.wrapT) {
            gl.texParameteri(this.target, gl.TEXTURE_WRAP_T, this.wrapT);
            this.state.wrapT = this.wrapT;
        }
        const ext = context.getExtension('EXT_texture_filter_anisotropic');
        const anisotropy = ext ? Math.min(this.anisotropy, gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT)) : 0;
        if (anisotropy && anisotropy !== this.state.anisotropy) {
            gl.texParameterf(this.target, ext.TEXTURE_MAX_ANISOTROPY_EXT, anisotropy);
            this.state.anisotropy = anisotropy;
        }
        if (this.image) {
            if (this.image.width) {
                this.width = this.image.width;
                this.height = this.image.height;
            }
            if (this.target === gl.TEXTURE_CUBE_MAP) {
                // For cube maps
                for (let i = 0; i < 6; i++) {
                    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, this.level, this.internalFormat, this.format, this.type, this.image[i]);
                }
            }
            else if (ArrayBuffer.isView(this.image)) {
                // Data texture
                gl.texImage2D(this.target, this.level, this.internalFormat, this.width, this.height, 0, this.format, this.type, this.image);
            }
            else if (this.image.isCompressedTexture) {
                // Compressed texture
                for (let level = 0; level < this.image.length; level++) {
                    gl.compressedTexImage2D(this.target, level, this.internalFormat, this.image[level].width, this.image[level].height, 0, this.image[level].data);
                }
            }
            else {
                // Regular texture
                gl.texImage2D(this.target, this.level, this.internalFormat, this.format, this.type, this.image);
            }
            if (this.generateMipmaps) {
                // For WebGL1, if not a power of 2, turn off mips, set wrapping to clamp to edge and minFilter to linear
                if (!gl.renderer.isWebgl2 && (!isPowerOf2(this.image.width) || !isPowerOf2(this.image.height))) {
                    this.generateMipmaps = false;
                    this.wrapS = this.wrapT = gl.CLAMP_TO_EDGE;
                    this.minFilter = gl.LINEAR;
                }
                else {
                    gl.generateMipmap(this.target);
                }
            }
            // Callback for when data is pushed to GPU
            this.onUpdate && this.onUpdate();
        }
        else {
            if (this.target === gl.TEXTURE_CUBE_MAP) {
                // Upload empty pixel for each side while no image to avoid errors while image or video loading
                for (let i = 0; i < 6; i++) {
                    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, emptyPixel);
                }
            }
            else if (this.width) {
                // image intentionally left null for RenderTarget
                gl.texImage2D(this.target, this.level, this.internalFormat, this.width, this.height, 0, this.format, this.type, null);
            }
            else {
                // Upload empty pixel if no image to avoid errors while image or video loading
                gl.texImage2D(this.target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, emptyPixel);
            }
        }
        this.store.image = this.image;
    }
    destroy() {
        if (!this.activeContext) {
            return;
        }
        this.activeContext.gl.deleteTexture(this.texture);
        this.store.image = null;
        this.image = null;
        this.activeContext = null;
    }
}
