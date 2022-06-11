import type { WritableArrayLike } from "./Mat3Func.js";
/**
 * Copy the values from one WritableArrayLike to another
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a the source vector
 * @returns {WritableArrayLike} out
 */
export declare function copy(out: WritableArrayLike, a: WritableArrayLike): WritableArrayLike;
/**
 * Set the components of a WritableArrayLike to the given values
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {WritableArrayLike} out
 */
export declare function set(out: WritableArrayLike, x: number, y: number): WritableArrayLike;
/**
 * Adds two WritableArrayLike's
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a the first operand
 * @param {WritableArrayLike} b the second operand
 * @returns {WritableArrayLike} out
 */
export declare function add(out: WritableArrayLike, a: WritableArrayLike, b: WritableArrayLike): WritableArrayLike;
/**
 * Subtracts vector b from vector a
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a the first operand
 * @param {WritableArrayLike} b the second operand
 * @returns {WritableArrayLike} out
 */
export declare function subtract(out: WritableArrayLike, a: WritableArrayLike, b: WritableArrayLike): WritableArrayLike;
/**
 * Multiplies two WritableArrayLike's
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a the first operand
 * @param {WritableArrayLike} b the second operand
 * @returns {WritableArrayLike} out
 */
export declare function multiply(out: WritableArrayLike, a: WritableArrayLike, b: WritableArrayLike): WritableArrayLike;
/**
 * Divides two WritableArrayLike's
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a the first operand
 * @param {WritableArrayLike} b the second operand
 * @returns {WritableArrayLike} out
 */
export declare function divide(out: WritableArrayLike, a: WritableArrayLike, b: WritableArrayLike): WritableArrayLike;
/**
 * Scales a WritableArrayLike by a scalar number
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {WritableArrayLike} out
 */
export declare function scale(out: WritableArrayLike, a: WritableArrayLike, b: number): WritableArrayLike;
/**
 * Calculates the euclidian distance between two WritableArrayLike's
 *
 * @param {WritableArrayLike} a the first operand
 * @param {WritableArrayLike} b the second operand
 * @returns {Number} distance between a and b
 */
export declare function distance(a: WritableArrayLike, b: WritableArrayLike): number;
/**
 * Calculates the squared euclidian distance between two WritableArrayLike's
 *
 * @param {WritableArrayLike} a the first operand
 * @param {WritableArrayLike} b the second operand
 * @returns {Number} squared distance between a and b
 */
export declare function squaredDistance(a: WritableArrayLike, b: WritableArrayLike): number;
/**
 * Calculates the length of a WritableArrayLike
 *
 * @param {WritableArrayLike} a vector to calculate length of
 * @returns {Number} length of a
 */
export declare function length(a: WritableArrayLike): number;
/**
 * Calculates the squared length of a WritableArrayLike
 *
 * @param {WritableArrayLike} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
export declare function squaredLength(a: WritableArrayLike): number;
/**
 * Negates the components of a WritableArrayLike
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a vector to negate
 * @returns {WritableArrayLike} out
 */
export declare function negate(out: WritableArrayLike, a: WritableArrayLike): WritableArrayLike;
/**
 * Returns the inverse of the components of a WritableArrayLike
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a vector to invert
 * @returns {WritableArrayLike} out
 */
export declare function inverse(out: WritableArrayLike, a: WritableArrayLike): WritableArrayLike;
/**
 * Normalize a WritableArrayLike
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a vector to normalize
 * @returns {WritableArrayLike} out
 */
export declare function normalize(out: WritableArrayLike, a: WritableArrayLike): WritableArrayLike;
/**
 * Calculates the dot product of two WritableArrayLike's
 *
 * @param {WritableArrayLike} a the first operand
 * @param {WritableArrayLike} b the second operand
 * @returns {Number} dot product of a and b
 */
export declare function dot(a: WritableArrayLike, b: WritableArrayLike): number;
/**
 * Computes the cross product of two WritableArrayLike's
 * Note that the cross product returns a scalar
 *
 * @param {WritableArrayLike} a the first operand
 * @param {WritableArrayLike} b the second operand
 * @returns {Number} cross product of a and b
 */
export declare function cross(a: WritableArrayLike, b: WritableArrayLike): number;
/**
 * Performs a linear interpolation between two WritableArrayLike's
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a the first operand
 * @param {WritableArrayLike} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {WritableArrayLike} out
 */
export declare function lerp(out: WritableArrayLike, a: WritableArrayLike, b: WritableArrayLike, t: number): WritableArrayLike;
/**
 * Transforms the WritableArrayLike with a WritableArrayLike
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a the vector to transform
 * @param {WritableArrayLike} m matrix to transform with
 * @returns {WritableArrayLike} out
 */
export declare function transformMat2(out: WritableArrayLike, a: WritableArrayLike, m: WritableArrayLike): WritableArrayLike;
/**
 * Transforms the WritableArrayLike with a WritableArrayLike
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a the vector to transform
 * @param {WritableArrayLike} m matrix to transform with
 * @returns {WritableArrayLike} out
 */
export declare function transformMat2d(out: WritableArrayLike, a: WritableArrayLike, m: WritableArrayLike): WritableArrayLike;
/**
 * Transforms the WritableArrayLike with a WritableArrayLike
 * 3rd vector component is implicitly '1'
 *
 * @param {WritableArrayLike} out the receiving vector
 * @param {WritableArrayLike} a the vector to transform
 * @param {WritableArrayLike} m matrix to transform with
 * @returns {WritableArrayLike} out
 */
export declare function transformMat3(out: WritableArrayLike, a: WritableArrayLike, m: WritableArrayLike): WritableArrayLike;
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
export declare function transformMat4(out: WritableArrayLike, a: WritableArrayLike, m: WritableArrayLike): WritableArrayLike;
/**
 * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
 *
 * @param {WritableArrayLike} a The first vector.
 * @param {WritableArrayLike} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
export declare function exactEquals(a: WritableArrayLike, b: WritableArrayLike): boolean;
