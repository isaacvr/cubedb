import { LEFT, UP, BACK, RIGHT, FRONT, DOWN, CENTER } from './../vector3d';
import { Vector3D } from '../../classes/vector3d';
import { PuzzleInterface } from './../../interfaces/interfaces';
import { STANDARD_PALETTE } from "../../constants/constants";
import { Piece } from './Piece';
import { Sticker } from './Sticker';
import { assignColors, getAllStickers, roundCorners } from './puzzleUtils';
import { Vector3 } from 'three';

export function RUBIK(a: number, b?:number, c?:number): PuzzleInterface {
  // const a = n;
  // const b = n;
  // const c = n;
  const isCube = a == b && b == c;
  const len = [a, b, c].reduce((m, e) => Math.min(m, 2 / e), 2);

  const rubik: PuzzleInterface = {
    pieces: [],
    palette: STANDARD_PALETTE,
    rotation: {},
    center: new Vector3D(0, 0, 0),
    faceVectors: [],
    getAllStickers: null,
    dims: [a, b, c],
    faceColors: [ 'w', 'r', 'g', 'y', 'o', 'b' ],
    move: () => false
  };

  let fc = rubik.faceColors;

  rubik.getAllStickers = getAllStickers.bind(rubik);

  const ref = LEFT.mul(a).add(
    BACK.mul(b)
  ).add(
    UP.mul(c)
  ).mul( len / 2 );

  const PI = Math.PI;
  const PI_2 = PI / 2;

  for (let z = 0; z < c; z += 1) {
    for (let y = 0; y < b; y += 1) {
      for (let x = 0; x < a; x += 1) {
        let anchor = ref.add( DOWN.mul(z).add( FRONT.mul(y)).add( RIGHT.mul(x) ).mul(len) );
        let center = anchor.add( FRONT.add(RIGHT).add(DOWN).mul(len / 2) );
        let p = new Piece();
        let sUp = new Sticker([
          anchor,
          anchor.add( FRONT.mul(len) ),
          anchor.add( FRONT.add(RIGHT).mul(len) ),
          anchor.add( RIGHT.mul(len) ),
        ], fc[0]);
        let sLeft = new Sticker([
          anchor,
          anchor.add( DOWN.mul(len) ),
          anchor.add( DOWN.add(FRONT).mul(len) ),
          anchor.add( FRONT.mul(len) ),
        ], fc[4]);
        sUp.vecs = [ RIGHT, FRONT, UP ].map(e => e.clone());
        sLeft.vecs = [ RIGHT, FRONT, UP ].map(e => e.clone());
        ( !isCube || z == 0 ) && p.stickers.push(sUp);
        ( !isCube || x == a - 1 ) && p.stickers.push(sLeft.rotate(center, UP, PI, false, fc[1]));
        ( !isCube || y == b - 1 ) && p.stickers.push(sLeft.rotate(center, UP, PI_2, false, fc[2]));
        ( !isCube || z == c - 1 ) && p.stickers.push(sUp.rotate(center, RIGHT, PI, false, fc[3]));
        ( !isCube || x == 0 ) && p.stickers.push(sLeft);
        ( !isCube || y == 0 ) && p.stickers.push(sLeft.rotate(center, UP, -PI_2, false, fc[5]));

        if ( p.stickers.length ) {
          if ( p.stickers.length === 1 && !isCube ) {
            if ( ( z == 0 || z == c - 1 ) && c > 1 ) {
              p.stickers.push( p.stickers[0].rotate(center, RIGHT, PI, false, 'd') );
            } else if ( ( x == 0 || x == a - 1 ) && a > 1 ) {
              p.stickers.push( p.stickers[0].rotate(center, UP, PI, false, 'd') );
            } else if ( ( y == 0 || y == b - 1 ) && b > 1 ) {
              p.stickers.push( p.stickers[0].rotate(center, UP, PI, false, 'd') );
            }
          }
          p.updateMassCenter();
          rubik.pieces.push(p);
        }
      }
    }
  }

  let pieces = rubik.pieces;
  
  const MOVE_MAP = "URFDLB";

  let ref1 = ref.add( RIGHT.mul(a * len) ).add( FRONT.mul(b * len) ).add( DOWN.mul(c * len) );

  let planes = [
    [ ref, ref.add(FRONT), ref.add(RIGHT) ],
    [ ref1, ref1.add(BACK), ref1.add(UP) ],
    [ ref1, ref1.add(UP), ref1.add(LEFT) ],
    [ ref1, ref1.add(LEFT), ref1.add(BACK) ],
    [ ref, ref.add(DOWN), ref.add(FRONT) ],
    [ ref, ref.add(RIGHT), ref.add(DOWN) ]
  ];

  rubik.move = function(moves: any[]) {
    for (let m = 0, maxm = moves.length; m < maxm; m += 1) {
      let mv = moves[m];
      let moveId = MOVE_MAP.indexOf( mv[2] );
      let layers = mv[1] === a ? mv[1] + 1 : mv[1];
      let turns = mv[3];
      const pts1 = planes[moveId];
      const u = Vector3D.cross(pts1[0], pts1[1], pts1[2]).unit();
      const mu = u.mul(-1);
      const pts2 = pts1.map(p => p.add( mu.mul(len * layers) ));
      const ang = Math.PI / 2 * turns;

      for (let i = 0, maxi = pieces.length; i < maxi; i += 1) {
        let d = pieces[i].direction(pts2[0], pts2[1], pts2[2], true);

        if ( d === 0 ) {
          console.log("Invalid move. Piece intersection detected.", "URFDLB"[moveId], turns, mv);
          console.log("Piece: ", i, pieces[i], pts2);
          return false;
        }

        if ( d > 0 ) {
          pieces[i].stickers.map(s => s.rotate(CENTER, mu, ang, true));
        }
      }
    }
    return true;
  };

  rubik.vectorsFromCamera = function(vecs: any[], cam) {
    return vecs.map(e => {
      let vp = new Vector3(e.x, e.y, e.z).project(cam);
      return new Vector3D(vp.x, -vp.y, 0);
    });
  };

  rubik.toMove = function(piece: Piece, sticker: Sticker, dir: Vector3D) {
    let mc = sticker.updateMassCenter();
    let toMovePieces = pieces.filter(p => p.direction1(mc, dir) === 0);
    return {
      pieces: toMovePieces,
      ang: PI_2
    };
  };

  rubik.rotation = {
    x: PI / 6,
    y: -PI / 4,
    z: 0,
  };
  
  rubik.faceVectors = [
    UP, RIGHT, FRONT, DOWN, LEFT, BACK
  ];

  assignColors(rubik, rubik.faceColors);
  isCube && roundCorners(rubik, null, null, null, null, (s: Sticker) => s.color != 'x');
  !isCube && roundCorners(rubik);

  return rubik;

}