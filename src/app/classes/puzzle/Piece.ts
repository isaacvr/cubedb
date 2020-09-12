import { Vector3D } from '../vector3d';
import { Sticker } from './Sticker';

export class Piece {
  stickers: Sticker[];
  
  constructor(stickers?: Sticker[]) {
    this.stickers = (stickers || []).map(e => e.copy());
  }

  get length(): number {
    return this.stickers.length;
  }

  get totalPoints(): number {
    let res = 0;
    for (let i = 0, maxi = this.stickers.length; i < maxi; i += 1) {
      res += this.stickers[i].points.length;
    }
    return res;
  }

  setColor(cols: string[]) {
    for (let i = 0, maxi = Math.min(cols.length, this.stickers.length); i < maxi; i += 1) {
      this.stickers[i].color = cols[i];
    }
  }

  add(ref: Vector3D): Piece {
    let p = new Piece();
    p.stickers = this.stickers.map(s => s.add(ref));
    return p;
  }
  
  sub(ref: Vector3D): Piece {
    let p = new Piece();
    p.stickers = this.stickers.map(s => s.sub(ref));
    return p;
  }

  mul(f: number): Piece {
    let p = new Piece();
    p.stickers = this.stickers.map(s => s.mul(f));
    return p;
  }

  div(f: number): Piece {
    let p = new Piece();
    p.stickers = this.stickers.map(s => s.div(f));
    return p;
  }

  rotate(ref: Vector3D, dir: Vector3D, ang: number): Piece {
    let p = new Piece();
    p.stickers = this.stickers.map(s => s.rotate(ref, dir, ang));
    return p;
  }

  direction(p1: Vector3D, p2: Vector3D, p3: Vector3D): -1 | 0 | 1 {
    let dirs = [0, 0, 0];

    for (let i = 0; i < this.stickers.length; i += 1) {
      dirs[ this.stickers[i].direction(p1, p2, p3) + 1 ] += 1;
    }

    if ( (dirs[0] > 0 && dirs[2] > 0) || dirs[1] === this.stickers.length ) {
      return 0;
    } else if ( dirs[0] > 0 ) {
      return -1;
    }

    return 1;
  }

  reflect(p1: Vector3D, p2: Vector3D, p3: Vector3D): Piece {
    let p = new Piece();
    p.stickers = this.stickers.map(s => s.reflect(p1, p2, p3));
    return p;
  }

  reverse(): Piece {
    let p = new Piece();
    p.stickers = this.stickers.map(s => s.reverse());
    return p;
  }

  contains(col: string): boolean {
    for (let i = 0, maxi = this.stickers.length; i < maxi; i += 1) {
      if ( this.stickers[i].color === col ) {
        return true;
      }
    }

    return false;
  }
}