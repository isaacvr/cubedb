import { Piece } from './Piece';
import { LEFT, UP, BACK, FRONT, RIGHT, CENTER, DOWN } from '../vector3d';
import { STANDARD_PALETTE } from '../../constants/constants';
import { PuzzleInterface } from '../../interfaces/interfaces';
import { Vector3D } from '../vector3d';
import { Sticker } from './Sticker';
import { assignColors, getAllStickers } from './puzzleUtils';

export function FISHER(): PuzzleInterface {

  let fisher: PuzzleInterface = {
    center: new Vector3D(0, 0, 0),
    faceVectors: [],
    moves: {},
    palette: STANDARD_PALETTE,
    pieces: [],
    rotation: {},
    getAllStickers: null,
    faceColors: [ 'y', 'o', 'g', 'w', 'r', 'b' ]
  };

  fisher.getAllStickers = getAllStickers.bind(fisher);

  const R2 = Math.sqrt(2);
  const R2_2 = R2 / 2;
  
  const L = 1;
  const L23 = L * 2 / 3;
  const L1 = L * R2 / 3;
  const LB = (L - L1) * 2;

  let A = LEFT.add(UP).add(BACK).mul(L);
  let B = LEFT.add(UP).add(FRONT).mul(L);
  let C = RIGHT.add(UP).add(BACK).mul(L);
  let AB = B.sub(A).unit();
  let AC = C.sub(A).unit();
  let VL = AB.mul(LB * R2_2).rotate(CENTER, UP, Math.PI / 4);

  let piece1 = new Piece([
    new Sticker([
      A.clone(),
      A.add( AB.mul(L1) ),
      A.add( AB.mul(L1) ).add( VL ),
      A.add( AC.mul(L1) ).add( VL ),
      A.add( AC.mul(L1) ),
    ]),
    new Sticker([
      A.clone(),
      A.add( DOWN.mul(L23) ),
      A.add( DOWN.mul(L23) ).add( FRONT.mul(L1) ),
      A.add( FRONT.mul(L1) ),
    ]),
    new Sticker([
      A.add( FRONT.mul(L1) ),
      A.add( FRONT.mul(L1) ).add( DOWN.mul(L23) ),
      A.add( FRONT.mul(L1) ).add( DOWN.mul(L23) ).add( VL ),
      A.add( FRONT.mul(L1) ).add( VL ),
    ]),
  ]);

  piece1.stickers.push( piece1.stickers[0].add( DOWN.mul(L23) ) );
  piece1.stickers.push( piece1.stickers[1].rotate(A, UP, -Math.PI / 2).add( RIGHT.mul(L1) ) );
  piece1.stickers.push( piece1.stickers[2].add( RIGHT.sub( FRONT ).mul(L1) ) );
  piece1.setColor([ 'w', 'o', 'x', 'x', 'b', 'x' ]);
  
  let piece2 = new Piece([
    new Sticker([
      A.add( AC.mul(L1) ),
      A.add( AC.mul(L1) ).add( VL ),
      C.sub( AC.mul(L1) ),
    ]),
    piece1.stickers[2].add( RIGHT.sub( FRONT ).mul(L1) ),
    piece1.stickers[2].rotate( A.add( FRONT.mul(L1) ), UP, Math.PI / 2 ).add(
      RIGHT.sub(FRONT).mul(L1).add( VL )
    ),
    new Sticker([
      A.add( RIGHT.mul(L1) ),
      A.add( RIGHT.mul(L1 + LB) ),
      A.add( RIGHT.mul(L1 + LB) ).add( DOWN.mul(L23) ),
      A.add( RIGHT.mul(L1) ).add( DOWN.mul(L23) ),
    ])
  ]);

  piece2.stickers.push( piece2.stickers[0].add( DOWN.mul(L23) ) );
  piece2.setColor([ 'w', 'x', 'x', 'b', 'x' ]);

  let upFace = [
    piece2, piece1
  ];

  for (let i = 1; i <= 3; i += 1) {
    upFace.push( upFace[0].rotate(CENTER, UP, i * Math.PI / 2) );
    upFace.push( upFace[1].rotate(CENTER, UP, i * Math.PI / 2) );
  }

  upFace.push(new Piece([
    new Sticker([0, 1, 2, 3].map(e => upFace[e * 2 + 1].stickers[0].points[2].clone()))
  ]));

  let midFace = upFace.map(p => p.add( DOWN.mul(L23) ));
  let downFace = upFace.map(p => p.rotate(CENTER, RIGHT, Math.PI));

  midFace.pop();

  fisher.pieces.push(...upFace);
  fisher.pieces.push(...midFace);
  fisher.pieces.push(...downFace);

  fisher.moves = {
    "U": { plane: upFace[1].stickers[3].points.map(e => e.clone()), angle: -90 },
    "R": { plane: upFace[3].stickers[2].points.map(e => e.clone()), angle: -90 },
    "F": { plane: upFace[1].stickers[2].points.map(e => e.clone()), angle: -90 },
    "D": { plane: downFace[1].stickers[3].points.map(e => e.clone()), angle: -90 },
    "L": { plane: upFace[0].stickers[2].points.map(e => e.clone()).reverse(), angle: -90 },
    "B": { plane: upFace[5].stickers[2].points.map(e => e.clone()), angle: -90 },
  };

  // Initial rotation
  fisher.rotation = {
    x: Math.PI / 6,
    y: -Math.PI / 4,
    z: 0,
  };
  
  fisher.faceVectors = [
    UP, RIGHT, FRONT, DOWN, LEFT, BACK
  ]

  assignColors(fisher, fisher.faceColors);

  return fisher;

}