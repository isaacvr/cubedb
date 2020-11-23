import { Vector3 } from 'three';
import { Vector3D } from '../vector3d';
import { Sticker } from './Sticker';

export class Piece {
  stickers: Sticker[];
  
  private _cached_mass_center: Vector3D;
  constructor(stickers?: Sticker[]) {
    this.stickers = (stickers || []).map(e => e.clone());
    this.updateMassCenter();
  }

  updateMassCenter(): Vector3D {
    let pts = this.getAllPoints();
    let sum = pts.reduce((s, e) => s.add(e), new Vector3D());
    this._cached_mass_center = sum.div(pts.length || 1);
    return this._cached_mass_center;
  }

  get length(): number {
    return this.stickers.length;
  }

  get totalPoints(): number {
    let res = 0;
    let stickers = this.stickers;
    for (let i = 0, maxi = stickers.length; i < maxi; i += 1) {
      res += stickers[i].points.length;
    }
    return res;
  }

  getAllPoints(): Vector3D[] {
    let res = [];
    for (let i = 0, maxi = this.stickers.length; i < maxi; i += 1) {
      res.push(...this.stickers[i].points);
    }
    return res;
  }

  getMassCenter(cached: boolean = true): Vector3D {
    if (!cached) {
      this.updateMassCenter();
    }
    return this._cached_mass_center;
  }

  setColor(cols: string[]) {
    for (let i = 0, maxi = Math.min(cols.length, this.stickers.length); i < maxi; i += 1) {
      this.stickers[i].color = cols[i];
    }
  }

  add(ref: Vector3D): Piece {
    return new Piece(this.stickers.map(s => s.add(ref)));
  }
  
  sub(ref: Vector3D): Piece {
    return new Piece(this.stickers.map(s => s.sub(ref)));
  }

  mul(f: number): Piece {
    return new Piece(this.stickers.map(s => s.mul(f)));
  }

  div(f: number): Piece {
    return new Piece( this.stickers.map(s => s.div(f)));
  }

  rotate(ref: Vector3D, dir: Vector3D, ang: number, self ?: boolean): Piece {
    if ( self ) {
      this.stickers.map(s => s.rotate(ref, dir, ang, true));
      this._cached_mass_center.rotate(ref, dir, ang, true);
      return this;
    }
    let p = new Piece();
    p.stickers = this.stickers.map(s => s.rotate(ref, dir, ang));
    p._cached_mass_center = this._cached_mass_center.rotate(ref, dir, ang);
    return p;
  }

  direction(p1: Vector3D, p2: Vector3D, p3: Vector3D, useMassCenter?: boolean, disc ?): -1 | 0 | 1 {
    let dirs = [0, 0, 0];
    let pts = this.stickers;
    let len = 0;
    let fn = disc || (() => true);

    for (let i = 0, maxi = pts.length; i < maxi; i += 1) {
      if ( fn(pts[i]) ) {
        len += 1;
        dirs[ pts[i].direction(p1, p2, p3, useMassCenter) + 1 ] += 1;
      }
    }

    // if ( dirs[1] || ( dirs[0] > 0 && dirs[2] > 0 ) ) {
    //   return 0;
    // } else if ( dirs[0] ) {
    //   return -1;
    // }

    // return 1;
    // // console.log("DIRS: ", dirs);
    if ( (dirs[0] > 0 && dirs[2] > 0) || dirs[1] === len ) {
      return 0;
    } else if ( dirs[0] > 0 ) {
      return -1;
    }

    return 1;
  }

  direction1(anchor: Vector3D, u: Vector3D, useMassCenter?: boolean): -1 | 0 | 1 {
    let dirs = [0, 0, 0];
    let pts = this.stickers;
    let len = pts.length;

    for (let i = 0; i < len; i += 1) {
      dirs[ pts[i].direction1(anchor, u, useMassCenter) + 1 ] += 1;
    }
    // console.log("DIRS1: ", dirs);

    if ( dirs[1] || ( dirs[0] > 0 && dirs[2] > 0 ) ) {
      return 0;
    }else if ( dirs[0] ) {
      return -1;
    }

    return 1;
    // if ( (dirs[0] > 0 && dirs[2] > 0) || dirs[1] === len ) {
    //   return 0;
    // } else if ( dirs[0] > 0 ) {
    //   return -1;
    // }

    // return 1;
  }

  reflect(p1: Vector3D, p2: Vector3D, p3: Vector3D, preserveOrientation?: boolean): Piece {
    return new Piece(
      this.stickers.map(s => s.reflect(p1, p2, p3, preserveOrientation))
    );
  }

  reverse(): Piece {
    return new Piece(
      this.stickers.map(s => s.reverse())
    );
  }

  contains(col: string): boolean {
    for (let i = 0, maxi = this.stickers.length; i < maxi; i += 1) {
      if ( this.stickers[i].color === col || this.stickers[i].oColor === col ) {
        return true;
      }
    }

    return false;
  }

  clone() {
    return new Piece( this.stickers );
  }

  equal(p1: Piece): boolean {
    let s1 = this.stickers;
    let s2 = p1.stickers;

    if ( s1.length != s2.length ) {
      return false;
    }

    for (let i = 0, maxi = s1.length; i < maxi; i += 1) {
      if ( !s1[i].equal(s2[i]) ) {
        return false;
      }
    }

    return true;
  }
}