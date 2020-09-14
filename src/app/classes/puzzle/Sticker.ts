import { Vector3D } from './../vector3d';

export class Sticker {
  points: Vector3D[];
  color: string;
  oColor: string;
  types: string[];
  constructor(pts?: Vector3D[], color?: string, types ?: string[]) {
    this.points = (pts || []).map(e => e.clone());
    this.oColor = color || 'w';
    this.color = this.oColor;
    this.types = (types || [ 'v' ]).map(e => e);
  }

  add(ref: Vector3D): Sticker {
    let cp = this.clone();
    cp.points = cp.points.map(e => e.add(ref));
    return cp;
  }

  sub(ref: Vector3D): Sticker {
    let cp = this.clone();
    cp.points = cp.points.map(e => e.sub(ref));
    return cp;
  }

  mul(f: number): Sticker {
    let cp = this.clone();
    cp.points = cp.points.map(e => e.mul(f));
    return cp;
  }

  div(f: number): Sticker {
    let cp = this.clone();
    cp.points = cp.points.map(e => e.div(f));
    return cp;
  }

  dot(v: Vector3D): number[] {
    return this.points.map(e => e.dot(v));
  }

  getOrientation(): Vector3D {
    return Vector3D.cross( this.points[0], this.points[1], this.points[2] ).unit();
  }

  rotate(ref: Vector3D, dir: Vector3D, ang: number): Sticker {
    let res = this.clone();
    res.points = this.points.map(e => e.rotate(ref, dir, ang));
    return res;
  }

  clone(): Sticker {
    return new Sticker(this.points, this.color, this.types);
  }

  direction(p1: Vector3D, p2: Vector3D, p3: Vector3D): -1 | 0 | 1 {
    let dirs = [0, 0, 0];
    let v = Vector3D.cross(p1, p2, p3);

    for (let i = 0; i < this.points.length; i += 1) {
      let dot = v.dot( this.points[i].sub(p1) );

      if ( Math.abs(dot) < 1e-3 ) {
        dirs[1] += 1;
      } else {
        dirs[ Math.sign(dot) + 1 ] += 1;
      }
    }
    
    if ( (dirs[0] > 0 && dirs[2] > 0) || (dirs[1] === this.points.length) ) {
      return 0;
    } else if ( dirs[0] > 0 ) {
      return -1;
    }

    return 1;
    
  }

  reflect(p1: Vector3D, p2: Vector3D, p3: Vector3D): Sticker {
    let s = this.clone();
   
    let u = Vector3D.cross(p1, p2, p3).unit();
    let dist = (p: Vector3D) => p.sub(p1).dot(u);

    s.points = this.points.map(p => p.add( u.mul( -2 * dist(p) ) ));

    return s;
  }

  reverse(): Sticker {
    let s = this.clone();
    s.points = this.points.map(p => p.clone()).reverse();
    return s;
  }
}