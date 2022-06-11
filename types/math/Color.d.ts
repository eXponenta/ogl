export declare class Color extends Array<number> {
    constructor();
    constructor(color: Array<number>);
    constructor(color: string);
    constructor(r: number, g: number, b: number);
    get r(): number;
    get g(): number;
    get b(): number;
    set r(v: number);
    set g(v: number);
    set b(v: number);
    set(color: Array<number>): this;
    set(color: string): this;
    set(r: number, g: number, b: number): this;
    clone(): Color;
    copy(v: Array<number> | Color): this;
}
