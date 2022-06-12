export declare class BasisManager {
    private readonly queue;
    private worker;
    constructor(workerSrc: string);
    getSupportedFormat(): "none" | "pvrtc" | "s3tc" | "etc1" | "astc" | "bptc";
    initWorker(workerSrc: string): void;
    onMessage({ data }: MessageEvent<{
        id: number;
        error: string;
        image: any;
    }>): void;
    parseTexture(buffer: ArrayBuffer): Promise<any>;
}
