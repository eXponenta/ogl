let supportedFormat;
let id = 0;

export class BasisManager {
    private readonly queue = new Map();
    private worker: Worker;

    constructor(workerSrc: string) {
        if (!supportedFormat) supportedFormat = this.getSupportedFormat();
        this.onMessage = this.onMessage.bind(this);
        this.queue = new Map();
        this.initWorker(workerSrc);
    }

    getSupportedFormat() {
        const gl = document.createElement('canvas').getContext('webgl');
        /* if (!!gl.getExtension('WEBGL_compressed_texture_etc')) {
            return 'etc2';
        } else  */
        if (!!gl.getExtension('WEBGL_compressed_texture_astc')) {
            return 'astc';
        } else if (!!gl.getExtension('EXT_texture_compression_bptc')) {
            return 'bptc';
        } else if (!!gl.getExtension('WEBGL_compressed_texture_s3tc')) {
            return 's3tc';
        } else if (!!gl.getExtension('WEBGL_compressed_texture_etc1')) {
            return 'etc1';
        } else if (!!gl.getExtension('WEBGL_compressed_texture_pvrtc') || !!gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc')) {
            return 'pvrtc';
            // } else if (!!gl.getExtension('WEBGL_compressed_texture_atc')) {
            //     return 'atc';
        }
        return 'none';
    }

    initWorker(workerSrc: string) {
        this.worker = new Worker(workerSrc);
        this.worker.onmessage = this.onMessage;
    }

    onMessage({ data }: MessageEvent<{ id: number, error: string, image: any }>) {
        const { id, error, image } = data;
        if (error) {
            console.log(error, id);
            return;
        }
        const textureResolve = this.queue.get(id);
        this.queue.delete(id);
        image.isBasis = true;
        textureResolve(image);
    }

    async parseTexture(buffer: ArrayBuffer): Promise<any> {
        id++;
        this.worker.postMessage({
            id,
            buffer,
            supportedFormat,
        });
        let textureResolve: (image: any) => void;
        const promise = new Promise((res) => (textureResolve = res));
        this.queue.set(id, textureResolve);
        return promise;
    }
}
