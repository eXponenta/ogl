import { RenderState } from './State.js';
import { nextUUID } from './uuid.js';
import { DefaultRenderTask } from './RenderTask.js';
import { RenderTaskGroup } from './RenderTaskGroup.js';
// sorry SSR =)
export const GL_ENUMS = (self.WebGL2RenderingContext || WebGLRenderingContext).prototype;
export class Renderer {
    constructor({ context, canvas, width = 300, height = 150, dpr = 1, alpha = false, depth = true, stencil = false, antialias = false, premultipliedAlpha = false, preserveDrawingBuffer = false, powerPreference = 'default', autoClear = true, webgl = 2, frustumCull = true } = {}) {
        this.width = 0;
        this.height = 0;
        this.renderGroups = [];
        this.baseRenderTask = new DefaultRenderTask();
        const attributes = {
            alpha,
            depth,
            stencil,
            antialias,
            premultipliedAlpha,
            preserveDrawingBuffer,
            powerPreference,
        };
        this.dpr = dpr;
        this.alpha = alpha;
        this.color = true;
        this.depth = depth;
        this.stencil = stencil;
        this.premultipliedAlpha = premultipliedAlpha;
        this.autoClear = autoClear;
        this.frustumCull = frustumCull;
        this.id = nextUUID();
        if (!context) {
            canvas = canvas || document.createElement('canvas');
            // Attempt WebGL2 unless forced to 1, if not supported fallback to WebGL1
            if (webgl === 2)
                context = canvas.getContext('webgl2', attributes);
            if (!context)
                context = canvas.getContext('webgl', attributes);
            if (!context)
                throw new Error('unable to create webgl context');
        }
        this.isWebgl2 = self.WebGL2RenderingContext && (context instanceof self.WebGL2RenderingContext);
        this.gl = context;
        // Attach renderer to gl so that all classes have access to internal state functions
        this.gl.renderer = this;
        // initialise size values
        this.setSize(width, height);
        this.state = new RenderState();
        this.extensions = {};
        // Initialise extra format types
        if (this.isWebgl2) {
            this.getExtension('EXT_color_buffer_float');
            this.getExtension('OES_texture_float_linear');
        }
        else {
            this.getExtension('OES_texture_float');
            this.getExtension('OES_texture_float_linear');
            this.getExtension('OES_texture_half_float');
            this.getExtension('OES_texture_half_float_linear');
            this.getExtension('OES_element_index_uint');
            this.getExtension('OES_standard_derivatives');
            this.getExtension('EXT_sRGB');
            this.getExtension('WEBGL_depth_texture');
            this.getExtension('WEBGL_draw_buffers');
        }
        this.getExtension('WEBGL_compressed_texture_astc');
        this.getExtension('EXT_texture_compression_bptc');
        this.getExtension('WEBGL_compressed_texture_s3tc');
        this.getExtension('WEBGL_compressed_texture_etc1');
        this.getExtension('WEBGL_compressed_texture_pvrtc');
        this.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');
        // Create method aliases using extension (WebGL1) or native if available (WebGL2)
        this.vertexAttribDivisor = this.getExtension('ANGLE_instanced_arrays', 'vertexAttribDivisor', 'vertexAttribDivisorANGLE');
        this.drawArraysInstanced = this.getExtension('ANGLE_instanced_arrays', 'drawArraysInstanced', 'drawArraysInstancedANGLE');
        this.drawElementsInstanced = this.getExtension('ANGLE_instanced_arrays', 'drawElementsInstanced', 'drawElementsInstancedANGLE');
        this._createVertexArray = this.getExtension('OES_vertex_array_object', 'createVertexArray', 'createVertexArrayOES');
        this._bindVertexArray = this.getExtension('OES_vertex_array_object', 'bindVertexArray', 'bindVertexArrayOES');
        this._deleteVertexArray = this.getExtension('OES_vertex_array_object', 'deleteVertexArray', 'deleteVertexArrayOES');
        this.drawBuffers = this.getExtension('WEBGL_draw_buffers', 'drawBuffers', 'drawBuffersWEBGL');
        // Store device parameters
        this.parameters = {};
        this.parameters.maxTextureUnits = this.gl.getParameter(this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        this.parameters.maxAnisotropy = this.getExtension('EXT_texture_filter_anisotropic')
            ? this.gl.getParameter(this.getExtension('EXT_texture_filter_anisotropic').MAX_TEXTURE_MAX_ANISOTROPY_EXT)
            : 0;
    }
    vertexAttribDivisor(...params) { }
    drawArraysInstanced(...params) { }
    drawElementsInstanced(...params) { }
    _createVertexArray(...params) {
        return null;
    }
    _bindVertexArray(...params) { }
    _deleteVertexArray(...params) { }
    drawBuffers(...params) { }
    /**
     * Guarded version for valid VAO state
     */
    createVertexArray(...params) {
        return this._createVertexArray(...params);
    }
    bindVertexArray(vao) {
        // allow to rebound buffer to vao
        if (vao)
            this.state.boundBuffer = null;
        if (this.state.currentVAO === vao) {
            return;
        }
        this.state.currentVAO = vao;
        this._bindVertexArray(vao);
    }
    deleteVertexArray(vao) {
        if (!vao)
            return;
        // guarded, because some devices not like to remove active vao
        if (this.state.currentVAO === vao)
            this.bindVertexArray(null);
        this._deleteVertexArray(vao);
    }
    bindBuffer(target, buffer = null) {
        if (this.state.boundBuffer === buffer)
            return;
        this.state.boundBuffer = buffer;
        this.gl.bindBuffer(target, buffer);
    }
    deleteBuffer(buffer) {
        if (this.state.boundBuffer === buffer)
            this.state.boundBuffer = null;
        this.gl.deleteBuffer(buffer);
    }
    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.gl.canvas.width = width * this.dpr;
        this.gl.canvas.height = height * this.dpr;
        // Offscreen canvas not has style
        Object.assign(this.gl.canvas.style || {}, {
            width: width + 'px',
            height: height + 'px',
        });
    }
    setViewport(width, height, x = 0, y = 0) {
        if (this.state.viewport.width === width && this.state.viewport.height === height)
            return;
        this.state.viewport.width = width;
        this.state.viewport.height = height;
        this.state.viewport.x = x;
        this.state.viewport.y = y;
        this.gl.viewport(x, y, width, height);
    }
    setScissor(width, height, x = 0, y = 0) {
        this.gl.scissor(x, y, width, height);
    }
    enable(id) {
        if (this.state[id] === true)
            return;
        this.gl.enable(id);
        this.state[id] = true;
    }
    disable(id) {
        if (this.state[id] === false)
            return;
        this.gl.disable(id);
        this.state[id] = false;
    }
    setBlendFunc(src, dst, srcAlpha, dstAlpha) {
        if (this.state.blendFunc.src === src &&
            this.state.blendFunc.dst === dst &&
            this.state.blendFunc.srcAlpha === srcAlpha &&
            this.state.blendFunc.dstAlpha === dstAlpha)
            return;
        this.state.blendFunc.src = src;
        this.state.blendFunc.dst = dst;
        this.state.blendFunc.srcAlpha = srcAlpha;
        this.state.blendFunc.dstAlpha = dstAlpha;
        if (srcAlpha !== undefined)
            this.gl.blendFuncSeparate(src, dst, srcAlpha, dstAlpha);
        else
            this.gl.blendFunc(src, dst);
    }
    setBlendEquation(modeRGB, modeAlpha) {
        modeRGB = modeRGB || this.gl.FUNC_ADD;
        if (this.state.blendEquation.modeRGB === modeRGB && this.state.blendEquation.modeAlpha === modeAlpha)
            return;
        this.state.blendEquation.modeRGB = modeRGB;
        this.state.blendEquation.modeAlpha = modeAlpha;
        if (modeAlpha !== undefined)
            this.gl.blendEquationSeparate(modeRGB, modeAlpha);
        else
            this.gl.blendEquation(modeRGB);
    }
    setCullFace(value) {
        if (this.state.cullFace === value)
            return;
        this.state.cullFace = value;
        this.gl.cullFace(value);
    }
    setFrontFace(value) {
        if (this.state.frontFace === value)
            return;
        this.state.frontFace = value;
        this.gl.frontFace(value);
    }
    setDepthMask(value) {
        if (this.state.depthMask === value)
            return;
        this.state.depthMask = value;
        this.gl.depthMask(value);
    }
    setDepthFunc(value) {
        if (this.state.depthFunc === value)
            return;
        this.state.depthFunc = value;
        this.gl.depthFunc(value);
    }
    activeTexture(value) {
        if (this.state.activeTextureUnit === value)
            return;
        this.state.activeTextureUnit = value;
        this.gl.activeTexture(this.gl.TEXTURE0 + value);
    }
    /**
     * Guarded version for bindTexture
     */
    bindTexture(target, texture, unit = this.state.activeTextureUnit) {
        if (this.state.textureUnits[unit] === texture)
            return;
        this.state.textureUnits[unit] = texture;
        this.activeTexture(unit);
        this.gl.bindTexture(target, texture);
    }
    bindFramebuffer({ target = this.gl.FRAMEBUFFER, buffer = null } = {}) {
        if (this.state.framebuffer === buffer)
            return;
        this.state.framebuffer = buffer;
        this.gl.bindFramebuffer(target, buffer);
    }
    getExtension(extension, webgl2Func, extFunc) {
        // if webgl2 function supported, return func bound to gl context
        if (webgl2Func && this.gl[webgl2Func])
            return this.gl[webgl2Func].bind(this.gl);
        // fetch extension once only
        if (!this.extensions[extension]) {
            this.extensions[extension] = this.gl.getExtension(extension);
        }
        // return extension if no function requested
        if (!webgl2Func)
            return this.extensions[extension];
        // Return null if extension not supported
        if (!this.extensions[extension])
            return null;
        // return extension function, bound to extension
        return this.extensions[extension][extFunc].bind(this.extensions[extension]);
    }
    setRenderGroups(tasks) {
        this.renderGroups.length = 0;
        if (tasks[0].isRenderTask) {
            this.renderGroups.push(new RenderTaskGroup(tasks));
        }
        this.renderGroups.push(...tasks);
    }
    render(tasks) {
        let renderGroups = this.renderGroups;
        if (tasks) {
            if (!Array.isArray(tasks)) {
                tasks = [tasks];
            }
            // is render group
            if (tasks[0].iRenderGroup) {
                renderGroups = tasks;
            }
            else if (tasks) {
                // render task as arrays
                for (const t of tasks)
                    this._executeRenderTask(t);
            }
        }
        // if not external task - run base group
        for (const group of renderGroups) {
            group.begin(this);
            const tasks = group.renderTasks;
            for (const task of tasks) {
                this._executeRenderTask(task);
            }
            group.finish();
        }
    }
    _executeRenderTask(run) {
        var _a;
        const task = run.isRenderTask
            ? run
            : this.baseRenderTask.set(run);
        const needUpdate = task.begin(this);
        const { target, clear, scene, camera } = task;
        if (target === null) {
            // make sure no render target bound so draws to canvas
            this.bindFramebuffer();
            this.setViewport(this.width * this.dpr, this.height * this.dpr);
        }
        else {
            (_a = target.prepare) === null || _a === void 0 ? void 0 : _a.call(target, { context: this });
            // bind supplied render target and update viewport
            this.bindFramebuffer(target);
            this.setViewport(target.width, target.height);
        }
        if (clear || (this.autoClear && clear !== false)) {
            this.clear(target);
        }
        // updates all scene graph matrices
        // if renderTask not doings this
        if (needUpdate && scene)
            scene.updateMatrixWorld();
        // Update camera separately, in case not in scene graph
        // if renderTask not doings this
        if (needUpdate && camera)
            camera.updateMatrixWorld();
        // Get render list - entails culling and sorting
        const renderList = task.getRenderList(this);
        const props = { camera, context: this };
        // prepare state
        for (const node of renderList)
            node.prepare(props);
        // draw state
        for (const node of renderList)
            node.draw(props);
        task.finish();
    }
    clear(target) {
        const color = this.color || target && target.options.color > 0;
        const depth = this.depth || target && target.options.depth;
        const stencil = this.stencil || target && target.options.stencil;
        // Ensure depth buffer writing is enabled so it can be cleared
        if (depth) {
            this.enable(this.gl.DEPTH_TEST);
            this.setDepthMask(true);
        }
        this.gl.clear((color ? this.gl.COLOR_BUFFER_BIT : 0) |
            (depth ? this.gl.DEPTH_BUFFER_BIT : 0) |
            (stencil ? this.gl.STENCIL_BUFFER_BIT : 0));
    }
}
