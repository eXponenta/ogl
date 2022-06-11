import * as ColorFunc from './functions/ColorFunc';

// Color stored as an array of RGB decimal values (between 0 > 1)
// Constructor and set method accept following formats:
// new Color() - Empty (defaults to black)
// new Color([0.2, 0.4, 1.0]) - Decimal Array (or another Color instance)
// new Color(0.7, 0.0, 0.1) - Decimal RGB values
// new Color('#ff0000') - Hex string
// new Color('#ccc') - Short-hand Hex string
// new Color(0x4f27e8) - Number
// new Color('red') - Color name string (short list in ColorFunc.js)

export class Color extends Array<number> {
    constructor ();
    constructor (color: Array<number>)
    constructor (color: string)
    constructor (r: number, g: number, b: number)
    constructor(...color: any[]) {
        super(...(Array.isArray(color[0])
            ? color
            : ColorFunc.parseColor(...color))
        );

        return this;
    }

    get r(): number {
        return this[0];
    }

    get g(): number {
        return this[1];
    }

    get b(): number {
        return this[2];
    }

    set r(v: number) {
        this[0] = v;
    }

    set g(v: number) {
        this[1] = v;
    }

    set b(v: number) {
        this[2] = v;
    }

    set (color: Array<number>): this
    set (color: string): this
    set (r: number, g: number, b: number): this
    set (...color: any[]) {
        if (Array.isArray(color[0])) return this.copy(color[0]);
        return this.copy(ColorFunc.parseColor(...color));
    }

    copy(v: Array<number> | Color): this {
        this[0] = v[0];
        this[1] = v[1];
        this[2] = v[2];
        return this;
    }
}
