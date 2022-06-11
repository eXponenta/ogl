export interface WritableArrayLike {
    readonly length: number;
    [n: number]: number;
}
/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {mat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */
export declare function fromMat4(out: WritableArrayLike, a: WritableArrayLike): WritableArrayLike;
/**
 * Calculates a 3x3 matrix from the given quaternion
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {quat} q Quaternion to create matrix from
 *
 * @returns {mat3} out
 */
export declare function fromQuat(out: WritableArrayLike, q: WritableArrayLike): WritableArrayLike;
/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
export declare function copy(out: WritableArrayLike, a: WritableArrayLike): WritableArrayLike;
/**
 * Set the components of a mat3 to the given values
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */
export declare function set(out: WritableArrayLike, m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number): WritableArrayLike;
/**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */
export declare function identity(out: WritableArrayLike): WritableArrayLike;
/**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
export declare function transpose(out: WritableArrayLike, a: WritableArrayLike): WritableArrayLike;
/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
export declare function invert(out: WritableArrayLike, a: WritableArrayLike): WritableArrayLike;
/**
 * Calculates the determinant of a mat3
 *
 * @param {mat3} a the source matrix
 * @returns {Number} determinant of a
 */
export declare function determinant(a: WritableArrayLike): number;
/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
export declare function multiply(out: WritableArrayLike, a: WritableArrayLike, b: WritableArrayLike): WritableArrayLike;
/**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to translate
 * @param {vec2} v vector to translate by
 * @returns {mat3} out
 */
export declare function translate(out: WritableArrayLike, a: WritableArrayLike, v: WritableArrayLike): WritableArrayLike;
/**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
export declare function rotate(out: WritableArrayLike, a: WritableArrayLike, rad: number): WritableArrayLike;
/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/
export declare function scale(out: WritableArrayLike, a: WritableArrayLike, v: WritableArrayLike): WritableArrayLike;
/**
 * Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {mat4} a Mat4 to derive the normal matrix from
 *
 * @returns {mat3} out
 */
export declare function normalFromMat4(out: WritableArrayLike, a: WritableArrayLike): WritableArrayLike;
/**
 * Generates a 2D projection matrix with the given bounds
 *
 * @param {mat3} out mat3 frustum matrix will be written into
 * @param {number} width Width of your gl context
 * @param {number} height Height of gl context
 * @returns {mat3} out
 */
export declare function projection(out: WritableArrayLike, width: number, height: number): WritableArrayLike;
/**
 * Adds two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
export declare function add(out: WritableArrayLike, a: WritableArrayLike, b: WritableArrayLike): WritableArrayLike;
/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
export declare function subtract(out: WritableArrayLike, a: WritableArrayLike, b: WritableArrayLike): WritableArrayLike;
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat3} out
 */
export declare function multiplyScalar(out: WritableArrayLike, a: WritableArrayLike, b: number): WritableArrayLike;
