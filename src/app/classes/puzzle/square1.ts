import { Piece } from './Piece';
import { RIGHT, LEFT, BACK, UP, FRONT, DOWN } from './../vector3d';
import { Vector3D, CENTER } from '../../classes/vector3d';
import { PuzzleInterface } from './../../interfaces/interfaces';
import { STANDARD_PALETTE } from '../../constants/constants';
import { Sticker } from './Sticker';
import { assignColors, getAllStickers } from './puzzleUtils';

export function SQUARE1(): PuzzleInterface {

  // The puzzle is defined as an object on the TTk.Puzzle namespace
  const sq1: PuzzleInterface = {
    pieces: [],               /// Sticker's points
    moves: {},                /// Define every move
    palette: {},              /// Color Palette
    rotation: {},             /// Initial rotation
    center: new Vector3D(0, 0, 0),
    faceVectors: [],
    getAllStickers: null,
    faceColors: [ 'y', 'o', 'g', 'w', 'r', 'b' ]
  };

  sq1.getAllStickers = getAllStickers.bind(sq1);

  const L = 1;
  const L23 = 2 * L / 3;
  const L1 = 2 * L * Math.sqrt(2) / 2;
  const PI = Math.PI;
  const PI_2 = PI / 2;

  const BIG = L1 * Math.sin( PI / 6 ) / Math.sin( 7 * PI / 12 );

  let pieceBig = new Piece([
    new Sticker([
      LEFT.add(BACK).add(UP).mul(L),
      LEFT.add(BACK).add(UP).mul(L).add( FRONT.mul(BIG) ),
      UP.mul(L),
      LEFT.add(BACK).add(UP).mul(L).add( RIGHT.mul(BIG) ),
    ]),
    new Sticker([
      LEFT.add(BACK).add(UP).mul(L),
      LEFT.add(BACK).add(UP).mul(L).add( DOWN.mul(L23) ),
      LEFT.add(BACK).add(UP).mul(L).add( DOWN.mul(L23) ).add( FRONT.mul(BIG) ),
      LEFT.add(BACK).add(UP).mul(L).add( FRONT.mul(BIG) ),
    ]),
  ]);

  pieceBig.stickers.push( pieceBig.stickers[0].add( DOWN.mul(L23) ) );
  pieceBig.stickers.push(
    pieceBig.stickers[1]
    .rotate(LEFT.add(BACK).add(UP).mul(L), DOWN, PI_2)
    .add( RIGHT.mul(BIG) )
    );
    
  let pieceSmall = new Piece([
    new Sticker([
      LEFT.add(UP).add(BACK).mul(L).add( RIGHT.mul(BIG) ),
      RIGHT.add(UP).add(BACK).mul(L).add( LEFT.mul(BIG) ),
      RIGHT.add(UP).add(BACK).mul(L).add( LEFT.mul(BIG) ).add( DOWN.mul(L23) ),
      LEFT.add(UP).add(BACK).mul(L).add( RIGHT.mul(BIG) ).add( DOWN.mul(L23) ),
    ]),
    new Sticker([
      LEFT.add(UP).add(BACK).mul(L).add( RIGHT.mul(BIG) ),
      UP.mul(L),
      RIGHT.add(UP).add(BACK).mul(L).add( LEFT.mul(BIG) ),
    ]),
  ]);

  let mid = new Piece([
    new Sticker([
      LEFT.add(BACK).add(UP).mul(L).add( DOWN.mul(L23) ),
      LEFT.add(BACK).add(DOWN).mul(L).add( UP.mul(L23) ),
      LEFT.add(FRONT).add(DOWN).mul(L).add( UP.mul(L23) ),
      LEFT.add(FRONT).add(UP).mul(L).add( DOWN.mul(L23) ),
    ]),
    new Sticker([
      LEFT.add(FRONT).add(UP).mul(L).add( DOWN.mul(L23) ),
      LEFT.add(FRONT).add(DOWN).mul(L).add( UP.mul(L23) ),
      LEFT.add(FRONT).add(DOWN).mul(L).add( UP.mul(L23) ).add( RIGHT.mul(BIG) ),
      LEFT.add(FRONT).add(UP).mul(L).add( DOWN.mul(L23) ).add( RIGHT.mul(BIG) ),
    ]),
    new Sticker([
      LEFT.add(FRONT).add(UP).mul(L).add( DOWN.mul(L23) ).add( RIGHT.mul(BIG) ),
      LEFT.add(FRONT).add(DOWN).mul(L).add( UP.mul(L23) ).add( RIGHT.mul(BIG) ),
      RIGHT.add(BACK).add(DOWN).mul(L).add( UP.mul(L23) ).add( LEFT.mul(BIG) ),
      RIGHT.add(BACK).add(UP).mul(L).add( DOWN.mul(L23) ).add( LEFT.mul(BIG) ),
    ]),
    new Sticker([
      RIGHT.add(BACK).add(UP).mul(L).add( DOWN.mul(L23) ).add( LEFT.mul(BIG) ),
      RIGHT.add(BACK).add(DOWN).mul(L).add( UP.mul(L23) ).add( LEFT.mul(BIG) ),
      LEFT.add(BACK).add(DOWN).mul(L).add( UP.mul(L23) ),
      LEFT.add(BACK).add(UP).mul(L).add( DOWN.mul(L23) ),
    ]),
    new Sticker([
      LEFT.add(BACK).add(UP).mul(L).add( DOWN.mul(L23) ),
      LEFT.add(FRONT).add(UP).mul(L).add( DOWN.mul(L23) ),
      LEFT.add(FRONT).add(UP).mul(L).add( DOWN.mul(L23) ).add( RIGHT.mul(BIG) ),
      RIGHT.add(BACK).add(UP).mul(L).add( DOWN.mul(L23) ).add( LEFT.mul(BIG) ),
    ]),
    new Sticker([
      LEFT.add(BACK).add(DOWN).mul(L).add( UP.mul(L23) ),
      LEFT.add(FRONT).add(DOWN).mul(L).add( UP.mul(L23) ),
      LEFT.add(FRONT).add(DOWN).mul(L).add( UP.mul(L23) ).add( RIGHT.mul(BIG) ),
      RIGHT.add(BACK).add(DOWN).mul(L).add( UP.mul(L23) ).add( LEFT.mul(BIG) ),
    ]),
  ]);

  for (let i = 0; i < 4; i += 1) {
    sq1.pieces.push( pieceSmall.rotate(CENTER, UP, i * PI_2) );
    sq1.pieces.push( pieceBig.rotate(CENTER, UP, i * PI_2) );
  }

  for (let i = 0, maxi = sq1.pieces.length; i < maxi; i += 1) {
    sq1.pieces.push( sq1.pieces[i].rotate(CENTER, RIGHT, PI) );
  }

  sq1.pieces.push(mid);
  sq1.pieces.push(mid.rotate(CENTER, UP, PI));

  sq1.moves = {
    "/": { plane: mid.stickers[2].clone().points, angle: 180 },
    "U": { plane: pieceBig.stickers[2].clone().points, angle: -30 },
    "D": { plane: mid.stickers[5].clone().points.reverse(), angle: -30 },
  }

  // Colours to use for facelets
  sq1.palette = STANDARD_PALETTE;

  // Initial rotation
  sq1.rotation = {
    x: Math.PI / 6,
    y: -Math.PI / 4,
    z: 0,
  };

  sq1.faceVectors = [
    UP, RIGHT, FRONT, DOWN, LEFT, BACK
  ];

  assignColors(sq1, sq1.faceColors);

  return sq1;

}