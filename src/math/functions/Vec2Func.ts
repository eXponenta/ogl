import type { WritableArrayLike } from "./Mat3Func";

const EPSILON = 0.000001;

/**
 * Copy the values from one WritableArrayLike to another
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a the source vector
 * @returns {WritableArrayLike} out
 */
export function copy(out: WritableArrayLike, a: WritableArrayLike): WritableArrayLike {
    out[0] = a[0];
    out[1] = a[1];
    return out;
}

/**
 * Set the components of a WritableArrayLike to the given values
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {WritableArrayLike} out
 */
export function set(out: WritableArrayLike, x: number, y: number): WritableArrayLike {
    out[0] = x;
    out[1] = y;
    return out;
}

/**
 * Adds two WritableArrayLike's
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a the first operand
 * @param {WritableArrayLike} b the second operand
 * @returns {WritableArrayLike} out
 */
export function add(out: WritableArrayLike, a: WritableArrayLike, b: WritableArrayLike): WritableArrayLike {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
}

/**
 * Subtracts vector b from vector a
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a the first operand
 * @param {WritableArrayLike} b the second operand
 * @returns {WritableArrayLike} out
 */
export function subtract(out: WritableArrayLike, a: WritableArrayLike, b: WritableArrayLike): WritableArrayLike {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
}

/**
 * Multiplies two WritableArrayLike's
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a the first operand
 * @param {WritableArrayLike} b the second operand
 * @returns {WritableArrayLike} out
 */
export function multiply(out: WritableArrayLike, a: WritableArrayLike, b: WritableArrayLike): WritableArrayLike {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
}

/**
 * Divides two WritableArrayLike's
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a the first operand
 * @param {WritableArrayLike} b the second operand
 * @returns {WritableArrayLike} out
 */
export function divide(out: WritableArrayLike, a: WritableArrayLike, b: WritableArrayLike): WritableArrayLike {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
}

/**
 * Scales a WritableArrayLike by a scalar number
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {WritableArrayLike} out
 */
export function scale(out: WritableArrayLike, a: WritableArrayLike, b: number): WritableArrayLike {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
}

/**
 * Calculates the euclidian distance between two WritableArrayLike's
 *
 * @param {WritableArrayLike} a the first operand
 * @param {WritableArrayLike} b the second operand
 * @returns {Number} distance between a and b
 */
export function distance(a: WritableArrayLike, b: WritableArrayLike): number {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x * x + y * y);
}

/**
 * Calculates the squared euclidian distance between two WritableArrayLike's
 *
 * @param {WritableArrayLike} a the first operand
 * @param {WritableArrayLike} b the second operand
 * @returns {Number} squared distance between a and b
 */
export function squaredDistance(a: WritableArrayLike, b: WritableArrayLike): number {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x * x + y * y;
}

/**
 * Calculates the length of a WritableArrayLike
 *
 * @param {WritableArrayLike} a vector to calculate length of
 * @returns {Number} length of a
 */
export function length(a: WritableArrayLike): number {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x * x + y * y);
}

/**
 * Calculates the squared length of a WritableArrayLike
 *
 * @param {WritableArrayLike} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
export function squaredLength(a: WritableArrayLike): number {
    var x = a[0],
        y = a[1];
    return x * x + y * y;
}

/**
 * Negates the components of a WritableArrayLike
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a vector to negate
 * @returns {WritableArrayLike} out
 */
export function negate(out: WritableArrayLike, a: WritableArrayLike): WritableArrayLike {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
}

/**
 * Returns the inverse of the components of a WritableArrayLike
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a vector to invert
 * @returns {WritableArrayLike} out
 */
export function inverse(out: WritableArrayLike, a: WritableArrayLike): WritableArrayLike {
    out[0] = 1.0 / a[0];
    out[1] = 1.0 / a[1];
    return out;
}

/**
 * Normalize a WritableArrayLike
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a vector to normalize
 * @returns {WritableArrayLike} out
 */
export function normalize(out: WritableArrayLike, a: WritableArrayLike): WritableArrayLike {
    var x = a[0],
        y = a[1];
    var len = x * x + y * y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
    }
    out[0] = a[0] * len;
    out[1] = a[1] * len;
    return out;
}

/**
 * Calculates the dot product of two WritableArrayLike's
 *
 * @param {WritableArrayLike} a the first operand
 * @param {WritableArrayLike} b the second operand
 * @returns {Number} dot product of a and b
 */
export function dot(a: WritableArrayLike, b: WritableArrayLike): number {
    return a[0] * b[0] + a[1] * b[1];
}

/**
 * Computes the cross product of two WritableArrayLike's
 * Note that the cross product returns a scalar
 *
 * @param {WritableArrayLike} a the first operand
 * @param {WritableArrayLike} b the second operand
 * @returns {Number} cross product of a and b
 */
export function cross(a: WritableArrayLike, b: WritableArrayLike): number {
    return a[0] * b[1] - a[1] * b[0];
}

/**
 * Performs a linear interpolation between two WritableArrayLike's
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a the first operand
 * @param {WritableArrayLike} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {WritableArrayLike} out
 */
export function lerp(out: WritableArrayLike, a: WritableArrayLike, b: WritableArrayLike, t: number): WritableArrayLike {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
}

/**
 * Transforms the WritableArrayLike with a WritableArrayLike
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a the vector to transform
 * @param {WritableArrayLike} m matrix to transform with
 * @returns {WritableArrayLike} out
 */
export function transformMat2(out: WritableArrayLike, a: WritableArrayLike, m: WritableArrayLike): WritableArrayLike {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y;
    out[1] = m[1] * x + m[3] * y;
    return out;
}

/**
 * Transforms the WritableArrayLike with a WritableArrayLike
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a the vector to transform
 * @param {WritableArrayLike} m matrix to transform with
 * @returns {WritableArrayLike} out
 */
export function transformMat2d(out: WritableArrayLike, a: WritableArrayLike, m: WritableArrayLike): WritableArrayLike {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
    return out;
}

/**
 * Transforms the WritableArrayLike with a WritableArrayLike
 * 3rd vector component is implicitly '1'
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a the vector to transform
 * @param {WritableArrayLike} m matrix to transform with
 * @returns {WritableArrayLike} out
 */
export function transformMat3(out: WritableArrayLike, a: WritableArrayLike, m: WritableArrayLike): WritableArrayLike {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
}

/**
 * Transforms the WritableArrayLike with a WritableArrayLike
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a the vector to transform
 * @param {WritableArrayLike} m matrix to transform with
 * @returns {WritableArrayLike} out
 */
export function transformMat4(out: WritableArrayLike, a: WritableArrayLike, m: WritableArrayLike): WritableArrayLike {
    let x = a[0];
    let y = a[1];
    out[0] = m[0] * x + m[4] * y + m[12];
    out[1] = m[1] * x + m[5] * y + m[13];
    return out;
}

/**
 * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
 *
 * @param {WritableArrayLike} a The first vector.
 * @param {WritableArrayLike} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
export function exactEquals(a: WritableArrayLike, b: WritableArrayLike): boolean {
    return a[0] === b[0] && a[1] === b[1];
}
