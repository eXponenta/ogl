import type { WritableArrayLike } from './Mat3Func.js';
/**
 * Copy the values from one WritableArrayLike to another
 *
 * @param {WritableArrayLike} out the receiving matrix
 * @param {WritableArrayLike} a the source matrix
 * @returns {WritableArrayLike} out
 */
export declare function copy(out: WritableArrayLike, a: WritableArrayLike): WritableArrayLike;
/**
 * Set the components of a WritableArrayLike to the given values
 *
 * @param {WritableArrayLike} out the receiving matrix
 * @returns {WritableArrayLike} out
 */
export declare function set(out: WritableArrayLike, m00: any, m01: any, m02: any, m03: any, m10: any, m11: any, m12: any, m13: any, m20: any, m21: any, m22: any, m23: any, m30: any, m31: any, m32: any, m33: any): WritableArrayLike;
/**
 * Set a WritableArrayLike to the identity matrix
 *
 * @param {WritableArrayLike} out the receiving matrix
 * @returns {WritableArrayLike} out
 */
export declare function identity(out: WritableArrayLike): WritableArrayLike;
/**
 * Transpose the values of a WritableArrayLike
 *
 * @param {WritableArrayLike} out the receiving matrix
 * @param {WritableArrayLike} a the source matrix
 * @returns {WritableArrayLike} out
 */
export declare function transpose(out: WritableArrayLike, a: WritableArrayLike): WritableArrayLike;
/**
 * Inverts a WritableArrayLike
 *
 * @param {WritableArrayLike} out the receiving matrix
 * @param {WritableArrayLike} a the source matrix
 * @returns {WritableArrayLike} out
 */
export declare function invert(out: WritableArrayLike, a: WritableArrayLike): WritableArrayLike;
/**
 * Calculates the determinant of a WritableArrayLike
 *
 * @param {WritableArrayLike} a the source matrix
 * @returns {Number} determinant of a
 */
export declare function determinant(a: WritableArrayLike): number;
/**
 * Multiplies two WritableArrayLikes
 *
 * @param {WritableArrayLike} out the receiving matrix
 * @param {WritableArrayLike} a the first operand
 * @param {WritableArrayLike} b the second operand
 * @returns {WritableArrayLike} out
 */
export declare function multiply(out: WritableArrayLike, a: WritableArrayLike, b: WritableArrayLike): WritableArrayLike;
/**
 * Translate a WritableArrayLike by the given vector
 *
 * @param {WritableArrayLike} out the receiving matrix
 * @param {WritableArrayLike} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {WritableArrayLike} out
 */
export declare function translate(out: WritableArrayLike, a: WritableArrayLike, v: WritableArrayLike): WritableArrayLike;
/**
 * Scales the WritableArrayLike by the dimensions in the given vec3 not using vectorization
 *
 * @param {WritableArrayLike} out the receiving matrix
 * @param {WritableArrayLike} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {WritableArrayLike} out
 **/
export declare function scale(out: WritableArrayLike, a: WritableArrayLike, v: WritableArrayLike): WritableArrayLike;
/**
 * Rotates a WritableArrayLike by the given angle around the given axis
 *
 * @param {WritableArrayLike} out the receiving matrix
 * @param {WritableArrayLike} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {WritableArrayLike} out
 */
export declare function rotate(out: WritableArrayLike, a: WritableArrayLike, rad: number, axis: WritableArrayLike): WritableArrayLike;
/**
 * Returns the translation vector component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslation,
 *  the returned vector will be the same as the translation vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive translation component
 * @param  {WritableArrayLike} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */
export declare function getTranslation(out: WritableArrayLike, mat: WritableArrayLike): WritableArrayLike;
/**
 * Returns the scaling factor component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslationScale
 *  with a normalized Quaternion paramter, the returned vector will be
 *  the same as the scaling vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive scaling factor component
 * @param  {WritableArrayLike} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */
export declare function getScaling(out: WritableArrayLike, mat: WritableArrayLike): WritableArrayLike;
export declare function getMaxScaleOnAxis(mat: any): number;
/**
 * Returns a quaternion representing the rotational component
 *  of a transformation matrix. If a matrix is built with
 *  fromRotationTranslation, the returned quaternion will be the
 *  same as the quaternion originally supplied.
 * @param {quat} out Quaternion to receive the rotation component
 * @param {WritableArrayLike} mat Matrix to be decomposed (input)
 * @return {quat} out
 */
export declare const getRotation: (out: any, mat: any) => any;
/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale
 * This is equivalent to (but much faster than):
 *
 *     WritableArrayLike.identity(dest);
 *     WritableArrayLike.translate(dest, vec);
 *     let quatMat = WritableArrayLike.create();
 *     quat4.toWritableArrayLike(quat, quatMat);
 *     WritableArrayLike.multiply(dest, quatMat);
 *     WritableArrayLike.scale(dest, scale)
 *
 * @param {WritableArrayLike} out WritableArrayLike receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @param {vec3} s Scaling vector
 * @returns {WritableArrayLike} out
 */
export declare function fromRotationTranslationScale(out: WritableArrayLike, q: WritableArrayLike, v: WritableArrayLike, s: WritableArrayLike): WritableArrayLike;
/**
 * Calculates a 4x4 matrix from the given quaternion
 *
 * @param {WritableArrayLike} out WritableArrayLike receiving operation result
 * @param {quat} q Quaternion to create matrix from
 *
 * @returns {WritableArrayLike} out
 */
export declare function fromQuat(out: WritableArrayLike, q: WritableArrayLike): WritableArrayLike;
/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {WritableArrayLike} out WritableArrayLike frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {WritableArrayLike} out
 */
export declare function perspective(out: WritableArrayLike, fovy: number, aspect: number, near: number, far: number): WritableArrayLike;
/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {WritableArrayLike} out WritableArrayLike frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {WritableArrayLike} out
 */
export declare function ortho(out: WritableArrayLike, left: number, right: number, bottom: number, top: number, near: number, far: number): WritableArrayLike;
/**
 * Generates a matrix that makes something look at something else.
 *
 * @param {WritableArrayLike} out WritableArrayLike frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} target Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {WritableArrayLike} out
 */
export declare function targetTo(out: WritableArrayLike, eye: WritableArrayLike, target: WritableArrayLike, up: WritableArrayLike): WritableArrayLike;
/**
 * Adds two WritableArrayLike's
 *
 * @param {WritableArrayLike} out the receiving matrix
 * @param {WritableArrayLike} a the first operand
 * @param {WritableArrayLike} b the second operand
 * @returns {WritableArrayLike} out
 */
export declare function add(out: WritableArrayLike, a: WritableArrayLike, b: WritableArrayLike): WritableArrayLike;
/**
 * Subtracts matrix b from matrix a
 *
 * @param {WritableArrayLike} out the receiving matrix
 * @param {WritableArrayLike} a the first operand
 * @param {WritableArrayLike} b the second operand
 * @returns {WritableArrayLike} out
 */
export declare function subtract(out: WritableArrayLike, a: WritableArrayLike, b: WritableArrayLike): WritableArrayLike;
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {WritableArrayLike} out the receiving matrix
 * @param {WritableArrayLike} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {WritableArrayLike} out
 */
export declare function multiplyScalar(out: WritableArrayLike, a: WritableArrayLike, b: number): WritableArrayLike;
