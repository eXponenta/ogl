import { Vec3 } from '../math/Vec3.js';

export const enum CURVE_TYPE {
    CATMULLROM = 'catmullrom',
    CUBICBEZIER = 'cubicbezier',
    QUADRATICBEZIER = 'quadraticbezier'
}

// temp
const _a0 = new Vec3(),
    _a1 = new Vec3(),
    _a2 = new Vec3(),
    _a3 = new Vec3();

/**
 * Get the control points of cubic bezier curve.
 * @param {*} i
 * @param {*} a
 * @param {*} b
 */
function getCtrlPoint(points: Vec3[], i, a = 0.168, b = 0.168) {
    if (i < 1) {
        _a0.sub(points[1], points[0]).scale(a).add(points[0]);
    } else {
        _a0.sub(points[i + 1], points[i - 1])
            .scale(a)
            .add(points[i]);
    }
    if (i > points.length - 3) {
        const last = points.length - 1;
        _a1.sub(points[last - 1], points[last])
            .scale(b)
            .add(points[last]);
    } else {
        _a1.sub(points[i], points[i + 2])
            .scale(b)
            .add(points[i + 1]);
    }
    return [_a0.clone(), _a1.clone()];
}

function getQuadraticBezierPoint(t, p0, c0, p1) {
    const k = 1 - t;
    _a0.copy(p0).scale(k ** 2);
    _a1.copy(c0).scale(2 * k * t);
    _a2.copy(p1).scale(t ** 2);
    const ret = new Vec3();
    ret.add(_a0, _a1).add(_a2);
    return ret;
}

function getCubicBezierPoint(t, p0, c0, c1, p1) {
    const k = 1 - t;
    _a0.copy(p0).scale(k ** 3);
    _a1.copy(c0).scale(3 * k ** 2 * t);
    _a2.copy(c1).scale(3 * k * t ** 2);
    _a3.copy(p1).scale(t ** 3);
    const ret = new Vec3();
    ret.add(_a0, _a1).add(_a2).add(_a3);
    return ret;
}

export interface ICurveInit {
    points: Array<Vec3>;
    divisions: number;
    type: CURVE_TYPE;
}

export class Curve {
    static CATMULLROM = CURVE_TYPE.CATMULLROM;
    static CUBICBEZIER = CURVE_TYPE.CUBICBEZIER;
    static QUADRATICBEZIER = CURVE_TYPE.QUADRATICBEZIER;

    public points: Array<Vec3>;
    public divisions: number;
    public type: CURVE_TYPE;

    constructor({
        points = [new Vec3(0, 0, 0), new Vec3(0, 1, 0), new Vec3(1, 1, 0), new Vec3(1, 0, 0)],
        divisions = 12,
        type = CURVE_TYPE.CATMULLROM
    }: Partial<ICurveInit> = {}) {
        this.points = points;
        this.divisions = divisions;
        this.type = type;
    }

    private _getQuadraticBezierPoints(divisions = this.divisions): Vec3[] {
        const points: Array<Vec3> = [];
        const count = this.points.length;

        if (count < 3) {
            console.warn('Not enough points provided.');
            return [];
        }

        const p0 = this.points[0];
        let c0 = this.points[1],
            p1 = this.points[2];

        for (let i = 0; i <= divisions; i++) {
            const p = getQuadraticBezierPoint(i / divisions, p0, c0, p1);
            points.push(p);
        }

        let offset = 3;
        while (count - offset > 0) {
            p0.copy(p1);
            c0 = p1.scale(2).sub(c0);
            p1 = this.points[offset];
            for (let i = 1; i <= divisions; i++) {
                const p = getQuadraticBezierPoint(i / divisions, p0, c0, p1);
                points.push(p);
            }
            offset++;
        }

        return points;
    }

    private _getCubicBezierPoints(divisions = this.divisions): Vec3[] {
        const points: Array<Vec3> = [];
        const count = this.points.length;

        if (count < 4) {
            console.warn('Not enough points provided.');
            return [];
        }

        let p0 = this.points[0],
            c0 = this.points[1],
            c1 = this.points[2],
            p1 = this.points[3];

        for (let i = 0; i <= divisions; i++) {
            const p = getCubicBezierPoint(i / divisions, p0, c0, c1, p1);
            points.push(p);
        }

        let offset = 4;
        while (count - offset > 1) {
            p0.copy(p1);
            c0 = p1.scale(2).sub(c1);
            c1 = this.points[offset];
            p1 = this.points[offset + 1];
            for (let i = 1; i <= divisions; i++) {
                const p = getCubicBezierPoint(i / divisions, p0, c0, c1, p1);
                points.push(p);
            }
            offset += 2;
        }

        return points;
    }

    private _getCatmullRomPoints(divisions = this.divisions, a = 0.168, b = 0.168): Vec3[] {
        const points: Array<Vec3> = [];
        const count = this.points.length;

        if (count <= 2) {
            return this.points;
        }

        let p0;
        this.points.forEach((p, i) => {
            if (i === 0) {
                p0 = p;
            } else {
                const [c0, c1] = getCtrlPoint(this.points, i - 1, a, b);
                const c = new Curve({
                    points: [p0, c0, c1, p],
                    type: CURVE_TYPE.CUBICBEZIER,
                });
                points.pop();
                points.push(...c.getPoints(divisions));
                p0 = p;
            }
        });

        return points;
    }

    getPoints(divisions = this.divisions, a = 0.168, b = 0.168): Vec3[] {
        const type = this.type;

        if (type === CURVE_TYPE.QUADRATICBEZIER) {
            return this._getQuadraticBezierPoints(divisions);
        }

        if (type === CURVE_TYPE.CUBICBEZIER) {
            return this._getCubicBezierPoints(divisions);
        }

        if (type === CURVE_TYPE.CATMULLROM) {
            return this._getCatmullRomPoints(divisions, a, b);
        }

        return this.points;
    }
}

