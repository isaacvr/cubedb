import { Sticker } from './Sticker';
import { UP, DOWN, FRONT, CENTER } from './../vector3d';
import { PuzzleInterface } from '../../interfaces/interfaces';
import { Vector3D } from '../vector3d';
import { STANDARD_PALETTE } from '../../constants/constants';
import { Piece } from './Piece';
import { assignColors, getAllStickers } from './puzzleUtils';

export function PYRAMINX(n: number): PuzzleInterface {
  let pyra: PuzzleInterface = {
    center: new Vector3D(0, 0, 0),
    moves: {},
    palette: STANDARD_PALETTE,
    pieces: [],
    rotation: {},
    faceVectors: [],
    getAllStickers: null,
    faceColors: [ 'g', 'y', 'b', 'o' ]
  };

  pyra.getAllStickers = getAllStickers.bind(pyra);

  const PI = Math.PI;
  const PI_3 = PI / 3;
  const L = 2.6;
  const V = L / Math.sqrt(3);
  const H = Math.sqrt(L ** 2 - V ** 2);
  const R = Math.sqrt(6) * L / 12;
  let PU = UP.mul( H - R );
  let PR = DOWN.mul(R).add( FRONT.mul(V) ).rotate(CENTER, UP, PI_3);
  let PB = PR.rotate(CENTER, UP, 2 * PI_3);
  let PL = PB.rotate(CENTER, UP, 2 * PI_3);

  pyra.pieces = [];

  const ANCHORS = [
    PU, PR, PB, PL
  ];

  /// front, right, down, left

  const UNITS = [
    [ PL.sub(PU).div(n), PR.sub(PL).div(n) ],
    [ PB.sub(PR).div(n), PU.sub(PB).div(n) ],
    [ PR.sub(PB).div(n), PL.sub(PR).div(n) ],
    [ PU.sub(PL).div(n), PB.sub(PU).div(n) ],
  ];

  pyra.faceVectors = [
    UNITS[0][0].cross( UNITS[0][1] ).unit(),
    UNITS[1][0].cross( UNITS[1][1] ).unit(),
    UNITS[2][0].cross( UNITS[2][1] ).unit(),
    UNITS[3][0].cross( UNITS[3][1] ).unit(),
  ];

  for (let f = 0; f < 4; f += 1) {
    for (let i = 0; i < n; i += 1) {
      for (let j = 0; j <= i; j += 1) {
        pyra.pieces.push(new Piece([
          new Sticker([
            ANCHORS[f].add( UNITS[f][0].mul(i).add( UNITS[f][1].mul(j) ) ),
            ANCHORS[f].add( UNITS[f][0].mul(i + 1).add( UNITS[f][1].mul(j) ) ),
            ANCHORS[f].add( UNITS[f][0].mul(i + 1).add( UNITS[f][1].mul(j + 1) ) ),
          ])
        ]));

        if ( j < i ) {
          pyra.pieces.push(new Piece([
            new Sticker([
              ANCHORS[f].add( UNITS[f][0].mul(i).add( UNITS[f][1].mul(j) ) ),
              ANCHORS[f].add( UNITS[f][0].mul(i + 1).add( UNITS[f][1].mul(j + 1) ) ),
              ANCHORS[f].add( UNITS[f][0].mul(i).add( UNITS[f][1].mul(j + 1) ) ),
            ])
          ]));
        }
      }
    }
  }

  if ( n > 1 ) {
    pyra.moves = {
      u: { plane: [], angle: -120 },
      r: { plane: [], angle: -120 },
      b: { plane: [], angle: -120 },
      l: { plane: [], angle: -120 },
    };
  }

  if ( n > 2 ) {
    pyra.moves.U = { plane: [], angle: -120 };
    pyra.moves.R = { plane: [], angle: -120 };
    pyra.moves.B = { plane: [], angle: -120 };
    pyra.moves.L = { plane: [], angle: -120 };
  }

  let letters = [ "U", "R", "B", "L" ];

  for (let l = 0, maxl = letters.length; l < maxl; l += 1) {
    for (let i = 0; i < 3 ; i += 1) {
      if ( n > 1 ) {
        pyra.moves[ letters[l].toLowerCase() ].plane.push(
          ANCHORS[l].add(
            UNITS[l][0].mul(n - 2).rotate(ANCHORS[l], ANCHORS[l].unit(), i * 2 * PI_3)
          )
        );
      }

      if ( n > 2 ) {
        pyra.moves[ letters[l] ].plane.push(
          ANCHORS[l].add(
            UNITS[l][0].mul(n - 1).rotate(ANCHORS[l], ANCHORS[l].unit(), i * 2 * PI_3)
          )
        );
      }
    }
  }

  assignColors(pyra, pyra.faceColors);

  // Initial rotation
  pyra.rotation = {
    x: Math.PI / 6,
    y: -Math.PI / 4,
    z: 0,
  };

  return pyra;

}