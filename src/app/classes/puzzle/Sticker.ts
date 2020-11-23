import { Vector3D, CENTER } from './../vector3d';

export class Sticker {
  points: Vector3D[];
  color: string;
  oColor: string;
  types: string[];
  _generator: Sticker;
  vecs: Vector3D[];

  private _cached_mass_center: Vector3D;

  constructor(pts?: Vector3D[], color?: string, types ?: string[]) {
    this.points = (pts || []).map(e => e.clone());
    this.oColor = color || 'w';
    this.color = this.oColor;
    this.types = (types || [ 'v' ]).map(e => e);
    this.updateMassCenter();
    this._generator = this;
    this.vecs = [];
  }

  updateMassCenter(): Vector3D {
    let pts = this.points;
    this._cached_mass_center = pts.reduce((s, e) => s.add(e), new Vector3D()).div(pts.length || 1);
    return this._cached_mass_center;
  }

  getMassCenter(): Vector3D {
    return this._cached_mass_center;
  }

  add(ref: Vector3D): Sticker {
    let cp = this.clone(true);
    cp.points = this.points.map(e => e.add(ref));
    cp._cached_mass_center = cp._cached_mass_center.add(ref);
    return cp;
  }

  sub(ref: Vector3D): Sticker {
    let cp = this.clone(true);
    cp.points = this.points.map(e => e.sub(ref));
    cp._cached_mass_center = cp._cached_mass_center.sub(ref);
    return cp;
  }

  mul(f: number): Sticker {
    let cp = this.clone(true);
    cp.points = this.points.map(e => e.mul(f));
    cp._cached_mass_center = cp._cached_mass_center.mul(f);
    return cp;
  }

  div(f: number): Sticker {
    let cp = this.clone(true);
    cp.points = this.points.map(e => e.div(f));
    cp._cached_mass_center = cp._cached_mass_center.div(f);
    return cp;
  }

  dot(v: Vector3D): number[] {
    return this.points.map(e => e.dot(v));
  }

  getOrientation(): Vector3D {
    let n = this.points.length;
    let i = [0, 1, 2].map(e => Math.round((e / 3) * n));

    return Vector3D.cross( this.points[ i[0] ], this.points[ i[1] ], this.points[ i[2] ] ).unit();
  }

  rotate(ref: Vector3D, dir: Vector3D, ang: number, self?: boolean, col?: string): Sticker {
    if ( self ) {
      this.points.map(e => e.rotate(ref, dir, ang, true));
      this._cached_mass_center.rotate(ref, dir, ang, true);
      this.color = col || this.color;
      this.vecs.map(v => v.rotate(CENTER, dir, ang, true));
      return this;
    }
    
    let res = this.clone(true);
    res.points = this.points.map(e => e.rotate(ref, dir, ang));
    res._cached_mass_center = this._cached_mass_center.rotate(ref, dir, ang);
    res.color = col || res.color;
    res.vecs = res.vecs.map(v => v.rotate(CENTER, dir, ang));
    return res;
  }

  clone(excludePoints?: boolean): Sticker {
    let s = new Sticker(excludePoints ? [] : this.points, this.color, this.types);
    s.color = this.color;
    s.oColor = this.oColor;
    s._cached_mass_center = this._cached_mass_center.clone();
    s.vecs = this.vecs.map(e => e.clone());
    return s;
  }

  direction1(a: Vector3D, u: Vector3D, useMc: boolean): -1 | 0 | 1 {
    let dirs = [0, 0, 0];
    let pts = (useMc) ? [this.getMassCenter()] : this.points;

    for (let i = 0, maxi = pts.length; i < maxi; i += 1) {
      dirs[ Vector3D.direction1(a, u, pts[i]) + 1 ] += 1;
    }
    
    if ( (dirs[0] > 0 && dirs[2] > 0) || (dirs[1] === pts.length) ) {
      return 0;
    } else if ( dirs[0] > 0 ) {
      return -1;
    }

    return 1;
  }

  direction(p1: Vector3D, p2: Vector3D, p3: Vector3D, useMassCenter?: boolean): -1 | 0 | 1 {
    let dirs = [0, 0, 0];
    let pts = (useMassCenter) ? [this.getMassCenter()] : this.points;

    for (let i = 0, maxi = pts.length; i < maxi; i += 1) {
      dirs[ Vector3D.direction(p1, p2, p3, pts[i]) + 1 ] += 1;
    }
    
    if ( (dirs[0] > 0 && dirs[2] > 0) || (dirs[1] === pts.length) ) {
      return 0;
    } else if ( dirs[0] > 0 ) {
      return -1;
    }

    return 1;
    
  }

  reflect(p1: Vector3D, p2: Vector3D, p3: Vector3D, preserveOrientation?: boolean): Sticker {
    let s = this.clone(true);
   
    let u = Vector3D.cross(p1, p2, p3).unit();
    let dist = (p: Vector3D) => p.sub(p1).dot(u);

    s.points = this.points.map(p => p.add( u.mul( -2 * dist(p) ) ));
    if ( preserveOrientation ) {
      s.points.reverse();
    }
    s._cached_mass_center = s._cached_mass_center.add( u.mul( -2 * dist(s._cached_mass_center) ) );
    s.vecs = s.vecs.map(v => v.add( u.mul( -2 * v.dot(u) ) ));
    return s;
  }

  reverse(): Sticker {
    let s = this.clone(true);
    s.points = this.points.map(p => p.clone()).reverse();
    return s;
  }

  contains(p: Vector3D): boolean {
    let u = this.points[this.points.length - 1];
    let zProduct = 0;
    let product: Vector3D;

    for (const v of this.points) {
      product = u.sub(v).cross( u.sub(p) );
      if ((zProduct < 0 && product.z > 0) || (zProduct > 0 && product.z < 0)) {
        return false;
      } else if (product.z !== 0) {
        zProduct = product.z;
      }
      u = v;
    }
    
    return true;
  }

  equal(s: Sticker): boolean {
    let p1 = this.points;
    let p2 = s.points;
    
    if ( this.color != s.color || p1.length != p2.length ) {
      return false;
    }

    for (let i = 0, maxi = p1.length; i < maxi; i += 1) {
      if ( p1[i].sub(p2[i]).abs() > 1e-6 ) {
        return false;
      }
    }

    return true;
  }
}