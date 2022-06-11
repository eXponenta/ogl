export class GLTFLoader {
    static setBasisManager(manager: any): void;
    static load(gl: any, src: any): Promise<{
        json: any;
        buffers: any[];
        bufferViews: any;
        images: any[];
        textures: any;
        materials: any;
        meshes: any;
        nodes: any;
        lights: {
            directional: any[];
            point: any[];
            spot: any[];
        };
        animations: any;
        scenes: any;
        scene: any;
    }>;
    static parse(gl: any, desc: any, dir: any): Promise<{
        json: any;
        buffers: any[];
        bufferViews: any;
        images: any[];
        textures: any;
        materials: any;
        meshes: any;
        nodes: any;
        lights: {
            directional: any[];
            point: any[];
            spot: any[];
        };
        animations: any;
        scenes: any;
        scene: any;
    }>;
    static parseDesc(src: any): Promise<any>;
    static unpackGLB(glb: any): any;
    static resolveURI(uri: any, dir: any): string;
    static loadBuffers(desc: any, dir: any): Promise<any[]>;
    static parseBufferViews(gl: any, desc: any, buffers: any): any;
    static parseImages(gl: any, desc: any, dir: any, bufferViews: any): Promise<any[]>;
    static parseTextures(gl: any, desc: any, images: any): any;
    static createTexture(gl: any, desc: any, images: any, { sampler: samplerIndex, source: sourceIndex, name, extensions, extras }: {
        sampler: any;
        source: any;
        name: any;
        extensions: any;
        extras: any;
    }): any;
    static parseMaterials(gl: any, desc: any, textures: any): any;
    static parseSkins(gl: any, desc: any, bufferViews: any): any;
    static parseMeshes(gl: any, desc: any, bufferViews: any, materials: any, skins: any): any;
    static parsePrimitives(gl: any, primitives: any, desc: any, bufferViews: any, materials: any, numInstances: any, isLightmap: any): any;
    static parseAccessor(index: any, desc: any, bufferViews: any): {
        data: any;
        size: any;
        type: any;
        normalized: any;
        buffer: any;
        stride: any;
        offset: any;
        count: any;
        min: any;
        max: any;
    };
    static parseNodes(gl: any, desc: any, meshes: any, skins: any, images: any): any;
    static populateSkins(skins: any, nodes: any): void;
    static parseAnimations(gl: any, desc: any, nodes: any, bufferViews: any): any;
    static parseScenes(desc: any, nodes: any): any;
    static parseLights(gl: any, desc: any, nodes: any, scenes: any): {
        directional: any[];
        point: any[];
        spot: any[];
    };
}
