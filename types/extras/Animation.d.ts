export class Animation {
    constructor({ objects, data }: {
        objects: any;
        data: any;
    });
    objects: any;
    data: any;
    elapsed: number;
    weight: number;
    duration: number;
    update(totalWeight: number, isSet: any): void;
}
