import { Sticker } from './Sticker';
import { PuzzleInterface } from './../../interfaces/interfaces';

export function assignColors(p: PuzzleInterface, cols ?: string[]) {
  let colors = cols || [ 'y', 'o', 'g', 'w', 'r', 'b' ];

  let stickers: Sticker[] = p.getAllStickers();

  for (let i = 0, maxi = stickers.length; i < maxi; i += 1) {
    let points = stickers[i].points;
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
    // let p1 = sticker.points[ sticker.points.length - 1 ];
    // let p2 = sticker.points[0];
    // let p3 = sticker.points[1];
    let p1 = sticker.points[0];
    let p2 = sticker.points[1];
    let p3 = sticker.points[2];
    let dirs = [0, 0, 0];

    for (let j = 0, maxj = p.pieces.length; j < maxj; j += 1) {
      dirs[ p.pieces[j].direction(p1, p2, p3) + 1] += 1;
    }

    if ( (dirs[0] > 0 && dirs[2] > 0) ) {
      sticker.oColor = 'x';
      sticker.color = 'x';
      // console.log('STICKER COLOR: X1', sticker);
    } else if ( dirs[0] > 0 ) {
      let v = sticker.getOrientation();
      for (let j = 0; j < 6; j += 1) {
        if ( v.sub( p.faceVectors[j] ).abs() < 1e-6 ) {
          sticker.color = colors[j];
          sticker.oColor = colors[j];
          break;
        }
      }
      // console.log('STICKER COLOR: ', sticker.color, sticker);
    } else {
      // console.log('STICKER COLOR: X2', sticker);
      sticker.oColor = 'x';
      sticker.color = 'x';
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