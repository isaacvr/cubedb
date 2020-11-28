import { CENTER, Vector3D } from './../vector3d';
import { Sticker } from './Sticker';
import { PuzzleInterface } from './../../interfaces/interfaces';

export function assignColors(p: PuzzleInterface, cols ?: string[]) {
  let colors = cols || [ 'y', 'o', 'g', 'w', 'r', 'b' ];

  let stickers: Sticker[] = p.getAllStickers();
  let pieces = p.pieces;

  for (let i = 0, maxi = stickers.length; i < maxi; i += 1) {
    let sticker = stickers[i];
    let points = sticker.points;
    for (let j = 0, maxj = points.length; j < maxj; j += 1) {
      for (let k = -1; k <= 1; k += 1) {
        if ( Math.abs( points[j].x - k ) < 1e-6 ) {
          // console.log('Fixing X => ', points[j].x, k);
          points[j].x = k;
        }
        if ( Math.abs( points[j].y - k ) < 1e-6 ) {
          // console.log('Fixing Y => ', points[j].y, k);
          points[j].y = k;
        }
        if ( Math.abs( points[j].z - k ) < 1e-6 ) {
          // console.log('Fixing Z => ', points[j].z, k);
          points[j].z = k;
        }
      }

    }
  }

  for (let i = 0, maxi = stickers.length; i < maxi; i += 1) {
    let sticker = stickers[i];
    let _i = [0, 1, 2].map(e => Math.round((e / 3) * sticker.points.length));

    let p1 = sticker.points[ _i[0] ];
    let p2 = sticker.points[ _i[1] ];
    let p3 = sticker.points[ _i[2] ];
    let dirs = [0, 0, 0];
    let ok = false;

    for (let j = 0, maxj = pieces.length; j < maxj; j += 1) {
      dirs[ pieces[j].direction(p1, p2, p3, true) + 1] += 1;
      if ( dirs[0] > 0 && dirs[2] > 0 ) {
        sticker.color = 'x';
        sticker.oColor = 'x';
        ok = true;
        break;
      }
    }

    if ( !ok ) {
      if ( dirs[0] > 0 ) {
        let v = sticker.getOrientation();
        for (let j = 0, maxj = colors.length; j < maxj; j += 1) {
          if ( v.sub( p.faceVectors[j] ).abs() < 1e-6 ) {
            sticker.color = colors[j];
            sticker.oColor = colors[j];
            break;
          }
        }
      } else {
        sticker.color = 'x';
        sticker.oColor = 'x';
      }
    }
  }
}

export function getAllStickers(): Sticker[] {
  
  let res = [];
  let pieces = this.pieces;

  for (let i = 0, maxi = pieces.length; i < maxi; i += 1) {
    let stickers = pieces[i].stickers;
    res.push(...stickers);
  }

  return res;

}

export function scaleSticker(st: Sticker, scale: number): Sticker {
  const SCALE = scale || 0.925;
  let n = st.getOrientation();
  // console.log("ORIENTATION: ", n);
  let cm = st.updateMassCenter();
  return st.sub(cm).mul(SCALE).add(cm).add( n.mul(0.005) );
}

export function roundStickerCorners(s: Sticker, rd?: number, scale?: number, ppc?: number): Sticker {
  const RAD = rd || 0.11;
  const PPC = ppc || 10;
  const C2k = [ 1, 2, 1 ];
  const SCALE = scale || 0.925;

  let st = s;
  let pts = st.points;
  let newSt = new Sticker();

  for (let i = 0, maxi = pts.length; i < maxi; i += 1) {
    let v1 = pts[ (i + 1) % maxi ].sub( pts[i] ).mul(RAD);
    let v2 = pts[ (i - 1 + maxi) % maxi ].sub( pts[i] ).mul(RAD);
    let P = [ pts[i].add(v2), pts[i], pts[i].add(v1) ];
    
    for (let j = 0; j <= PPC; j += 1) {
      let a = j / PPC;
      newSt.points.push(
        P.reduce((ac: Vector3D, p: Vector3D, pos: number) => {
          return ac.add( p.mul( C2k[pos] * Math.pow(1 - a, 2 - pos) * Math.pow(a, pos) ) )
        }, new Vector3D())
      );
    }
  }

  return scaleSticker(newSt, SCALE);
}

export function roundCorners(
  p: PuzzleInterface,
  rd ?: number, scale ?: number, ppc ?: number,
  fn ?: Function, justScale ?: boolean) {
  const CHECK = fn || (() => true);

  let pieces = p.pieces;

  for (let i = 0, maxi = pieces.length; i < maxi; i += 1) {
    let pc = pieces[i];
    let s = pc.stickers;

    for (let j = 0, maxj = s.length; j < maxj; j += 1) {
      if ( !CHECK(s[j]) ) {
        continue;
      }

      let newSt = (justScale)
        ? scaleSticker(s[j], scale)
        : roundStickerCorners(s[j], rd, scale, ppc);

      newSt.updateMassCenter();

      newSt.color = s[j].color;
      newSt.oColor = s[j].oColor;
      newSt.vecs = s[j].vecs.map(e => e.clone());
      
      s[j].color = 'd';
      s[j].oColor = 'd';
      s[j].vecs.length = 0;

      pc.stickers.push(newSt);

      newSt._generator = s[j];
    }

  }
}

export function assignVectors(p: PuzzleInterface) {
  let pieces = p.pieces;

  for (let i = 0, maxi = pieces.length; i < maxi; i += 1) {
    let stickers = pieces[i].stickers;
    let vecs = pieces[i].stickers.reduce((ac, s) => {
      if ( s.color != 'x' && s.color != 'd' ) {
        ac.push( s.getOrientation() );
      }
      return ac;
    }, []);

    for (let j = 0, maxj = stickers.length; j < maxj; j += 1) {
      if ( stickers[j].color != 'x' && stickers[j].color != 'd' ) {
        stickers[j].vecs = vecs.map(e => e.clone());
      }
    }
  }
}