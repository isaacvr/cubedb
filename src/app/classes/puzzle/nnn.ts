import { LEFT, UP, BACK, RIGHT, FRONT, DOWN } from './../vector3d';
import { Vector3D } from '../../classes/vector3d';
import { PuzzleInterface } from './../../interfaces/interfaces';
import { STANDARD_PALETTE } from "../../constants/constants";
import { Piece } from './Piece';
import { Sticker } from './Sticker';
import { splitClasses } from '@angular/compiler';
import { assignColors, getAllStickers } from './puzzleUtils';

export function RUBIK(n: number): PuzzleInterface {
  const a = n;
  const b = n;
  const c = n;
  const len = 2 / n;
// export function RUBIK(a: number, b: number, c: number): PuzzleInterface {  
  // const len = Math.min( 2 / a, 2 / b, 2 / c );


  // The puzzle is defined as an object on the TTk.Puzzle namespace
  const rubik: PuzzleInterface = {
    pieces: [],                    /// Sticker's points
    moves: {},                     /// Define every move
    palette: {},                   /// Color Palette
    rotation: {},                  /// Initial rotation
    center: new Vector3D(0, 0, 0),
    faceVectors: [],
    getAllStickers: null,
    dims: [a, b, c],
    faceColors: [ 'y', 'o', 'g', 'w', 'r', 'b' ]
  };

  rubik.getAllStickers = getAllStickers.bind(rubik);

  let ref1 = LEFT.mul(a).add(
    BACK.mul(b)
  ).add(
    UP.mul(c)
  ).mul( len / 2 );

  const PI = Math.PI;
  const PI_2 = PI / 2;

  for (let z = 0; z < c; z += 1) {
    for (let y = 0; y < b; y += 1) {
      for (let x = 0; x < a; x += 1) {
        let anchor = ref1.add( DOWN.mul(z).add( FRONT.mul(y)).add( RIGHT.mul(x) ).mul(len) );
        let center = anchor.add( FRONT.add(RIGHT).add(DOWN).mul(len / 2) );
        let p = new Piece();
        let sUp = new Sticker([
          anchor.copy(),
          anchor.add( FRONT.mul(len) ),
          anchor.add( FRONT.add(RIGHT).mul(len) ),
          anchor.add( RIGHT.mul(len) ),
        ]);
        let sLeft = new Sticker([
          anchor.copy(),
          anchor.add( DOWN.mul(len) ),
          anchor.add( DOWN.add(FRONT).mul(len) ),
          anchor.add( FRONT.mul(len) ),
        ]);
        p.stickers.push(sUp);
        p.stickers.push(sLeft.rotate(center, UP, PI));
        p.stickers.push(sLeft.rotate(center, UP, PI_2));
        p.stickers.push(sUp.rotate(center, RIGHT, PI));
        p.stickers.push(sLeft);
        p.stickers.push(sLeft.rotate(center, UP, -PI_2));
        rubik.pieces.push(p);
      }
    }
  }

  let pieces = rubik.pieces;
  
  // console.log(pieces);

  rubik.moves = {
    "U": { plane: pieces[0].stickers[3].copy().points.reverse(), angle: -90 },
    "R": { plane: pieces[a-1].stickers[4].copy().points.reverse(), angle: -90 },
    "F": { plane: pieces[a * b - 1].stickers[5].copy().points.reverse(), angle: -90 },
    "D": { plane: pieces[a * b * c - 1].stickers[0].copy().points.reverse(), angle: -90 },
    "L": { plane: pieces[0].stickers[1].copy().points.reverse(), angle: -90 },
    "B": { plane: pieces[0].stickers[2].copy().points.reverse(), angle: -90 },
    "u": { plane: pieces[a * b].stickers[3].copy().points.reverse(), angle: -90 },
    "r": { plane: pieces[a * b - 2].stickers[4].copy().points.reverse(), angle: -90 },
    "f": { plane: pieces[0].stickers[2].copy().points, angle: -90 },
    "d": { plane: pieces[a * b * (c - 1) - 1].stickers[0].copy().points.reverse(), angle: -90 },
    "l": { plane: pieces[a + 1].stickers[1].copy().points.reverse(), angle: -90 },
    "b": { plane: pieces[a].stickers[2].copy().points.reverse(), angle: -90 },
    "x": { plane: pieces[a - 1].stickers[1].add(RIGHT).copy().points.reverse(), angle: 90 },
    "y": { plane: pieces[0].stickers[0].add(UP).copy().points.reverse(), angle: 90 },
    "z": { plane: pieces[0].stickers[5].add(BACK).copy().points.reverse(), angle: -90 },
    "M": [ "l", "L'" ],
    "M'": [ "l'", "L" ],
    "M2": [ "l2", "L2" ],
    "M2'": [ "l2", "L2" ],
    "S": [ "f", "F'" ],
    "S'": [ "f'", "F" ],
    "S2": [ "f2", "F2" ],
    "S2'": [ "f2", "F2" ],
    "E": [ "u", "U'" ],
    "E'": [ "u'", "U" ],
    "E2": [ "u2", "U2" ],
    "E2'": [ "u2", "U2" ]
  };

  if ( n === 4 ) {
    let moves = [ 'u', 'f', 'l', 'b', 'r', 'd' ];
    
    for (let i = 0, maxi = moves.length; i < maxi; i += 1) {
      rubik.moves[ moves[i].toUpperCase() + "w" ] = rubik.moves[ moves[i] ];
      delete rubik.moves[ moves[i] ];
      rubik.moves[ moves[i] ] = [ moves[i].toUpperCase() + "w", moves[i].toUpperCase() + "'" ];
    }
  }

  // Colours to use for facelets
  rubik.palette = STANDARD_PALETTE;

  // Initial rotation
  rubik.rotation = {
    x: Math.PI / 6,
    y: -Math.PI / 4,
    z: 0,
  };
  
  rubik.faceVectors = [
    UP, RIGHT, FRONT, DOWN, LEFT, BACK
  ];

  assignColors(rubik, rubik.faceColors);

  for (let i = pieces.length - 1; i >= 0; i -= 1) {
    let stickers = pieces[i].stickers;
    for (let j = stickers.length - 1; j >= 0; j -= 1) {
      if ( stickers[j].color === 'x' ) {
        stickers.splice(j, 1);
      }
    }

    if ( stickers.length === 0 ) {
      pieces.splice(i, 1);
    }
  }

  return rubik;

}