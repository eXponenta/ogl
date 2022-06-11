export class BasisManager {
    constructor(workerSrc: any);
    onMessage({ data }: {
        data: any;
    }): void;
    queue: Map<any, any>;
    getSupportedFormat(): "none" | "pvrtc" | "s3tc" | "etc1" | "astc" | "bptc";
    initWorker(workerSrc: any): void;
    worker: Worker;
    parseTexture(buffer: any): Promise<any>;
}
