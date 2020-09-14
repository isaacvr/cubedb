import { Sticker } from './Sticker';
import { LEFT, UP, BACK, FRONT, RIGHT, CENTER, DOWN } from './../vector3d';
import { STANDARD_PALETTE } from '../../constants/constants';
import { PuzzleInterface } from '../../interfaces/interfaces';
import { Vector3D } from '../vector3d';
import { Piece } from './Piece';
import { assignColors, getAllStickers } from './puzzleUtils';

export function AXIS(): PuzzleInterface {

  let axis: PuzzleInterface = {
    center: new Vector3D(0, 0, 0),
    faceVectors: [],
    moves: {},
    palette: STANDARD_PALETTE,
    pieces: [],
    rotation: {},
    getAllStickers: null,
    faceColors: [ 'y', 'o', 'g', 'w', 'r', 'b' ]
  };

  axis.getAllStickers = getAllStickers.bind(axis);

  const L = 1;
  const PI = Math.PI;
  const PI_2 = PI / 2;

  let A = UP.add(FRONT).mul(L);
  let B = RIGHT.add(UP).add(BACK).mul(L);

  let AB = Math.sqrt( L**2 + (L / 2) ** 2 );
  
  let alpha = PI / 4;
  let beta = Math.asin( (L / 2) / AB );  
  let gamma = alpha + beta;

  let AC = (L) * Math.sin(alpha) / Math.sin(gamma);

  let C = A.add( B.sub(A).unit().mul(AC) );
  let F = LEFT.add(UP).add(BACK).mul(L);
  let G = LEFT.add(UP).add(FRONT).mul(L);
  let H = RIGHT.add(UP).add(FRONT).mul(L);
  
  let D = F.add(G).div(2);
  let E = D.add( B.sub(D).unit().mul(AC) );
  let E1 = E
    .rotate(CENTER, DOWN, PI_2)
    .rotate(CENTER, FRONT, PI_2)

  let DEF = new Sticker([
    F.clone(),
    D.clone(),
    E.clone(),
  ]);

  let BEF = new Sticker([
    F.clone(),
    E.clone(),
    B.clone(),
  ]);

  let BCE = new Sticker([
    B.clone(),
    E.clone(),
    C.clone(),
  ]);

  let ACDE = new Sticker([
    E.clone(),
    D.clone(),
    A.clone(),
    C.clone(),
  ]);

  let BCH = new Sticker([
    B.clone(),
    C.clone(),
    H.clone(),
  ]);

  let ADG = new Sticker([
    D.clone(),
    G.clone(),
    A.clone(),
  ]);

  let ACH = new Sticker([
    C.clone(),
    A.clone(),
    H.clone(),
  ]);

  let cornerBig = new Piece([
    ADG,
    ADG
      .rotate(CENTER, RIGHT, PI_2)
      .rotate(CENTER, BACK, PI_2),
    ADG
      .rotate(CENTER, UP, PI_2)
      .rotate(CENTER, FRONT, PI_2),
    new Sticker([
      A.clone(),
      A.rotate(G, BACK, PI_2),
      D.clone(),
    ])
  ]);

  let v1 = Vector3D.cross(A, B, A.rotate(G, BACK, PI_2)).unit();
  let v2 = Vector3D.cross(B, D, D.rotate(G, LEFT, PI_2)).unit();

  let dist = (p: Vector3D) => Math.abs(p.sub(A).dot(v1));
  let dist1 = (p: Vector3D) => Math.abs(p.sub(B).dot(v2));

  let FH = F.add( v1.mul( -dist(F) ) );
  let DH = D.add( v1.mul( -dist(D) ) );
  let EH = E.add( v1.mul( -dist(E) ) );
  let EH1 = E1.add( v1.mul( -dist(E1) ) );
  let CH = C.add( v2.mul( -dist1(C) ) );
  let AH = A.add( v2.mul( -dist1(A) ) );

  let centerPiece = new Piece([
    DEF,
    ACH
      .rotate(CENTER, UP, PI_2)
      .rotate(CENTER, FRONT, PI_2),
    new Sticker([
      F.clone(),
      E.clone(),
      EH.clone(),
      FH.clone(),
    ]),
    new Sticker([
      E.clone(),
      D.clone(),
      DH.clone(),
      EH.clone(),
    ]),
    new Sticker([
      D.clone(),
      E1.clone(),
      EH1.clone(),
      DH.clone(),
    ]),
    new Sticker([
      E1.clone(),
      F.clone(),
      FH.clone(),
      EH1.clone(),
    ]),
  ]);

  let edgeSmall = new Piece([
    ACDE,
    new Sticker([
      E.clone(),
      D.clone(),
      DH.clone(),
      EH.clone(),
    ]),
    new Sticker([
      E.clone(),
      C.clone(),
      CH.clone(),
      EH.clone(),
    ]),
    new Sticker([
      C.clone(),
      A.clone(),
      AH.clone(),
      CH.clone(),
    ]),
    new Sticker([
      A.clone(),
      D.clone(),
      DH.clone(),
      AH.clone(),
    ]),
  ]);

  let cornerSmall = new Piece([
    BCE,
    new Sticker([
      B.clone(),
      EH.clone(),
      E.clone(),
    ]),
    new Sticker([
      C.clone(),
      E.clone(),
      EH.clone(),
      CH.clone(),
    ]),
    new Sticker([
      B.clone(),
      C.clone(),
      CH.clone(),
    ]),
  ]);

  let edge1 = new Piece([
    BCH,
    new Sticker([
      C.clone(),
      B.clone(),
      CH.clone()
    ]),
    centerPiece.stickers[5].rotate(G, G, -PI * 2 / 3),
  ]);

  edge1.stickers.push( ...edge1.rotate(CENTER, B.add(H).div(2), PI).stickers );

  axis.pieces.push( cornerBig );
  axis.pieces.push( centerPiece );
  axis.pieces.push( edgeSmall );
  axis.pieces.push( cornerSmall );
  axis.pieces.push( edge1 );
  axis.pieces.push( edge1.reflect(G, B, CENTER).reverse() );

  for (let i = 1, maxi = axis.pieces.length; i < maxi; i += 1) {
    axis.pieces.push( axis.pieces[i].rotate(G, G, -PI * 2 / 3) );
    axis.pieces.push( axis.pieces[i].rotate(G, G, PI * 2 / 3) );
  }

  for (let i = 0, maxi = 5; i < maxi; i += 1) {
    axis.pieces.push(axis.pieces[i].rotate(CENTER, UP, PI).rotate(CENTER, LEFT, PI_2));
  }

  for (let i = 6, maxi = 12; i < maxi; i += 1) {
    axis.pieces.push(axis.pieces[i].rotate(CENTER, UP, PI).rotate(CENTER, LEFT, PI_2));
  }

  axis.moves = {
    "U": { plane: axis.pieces[2].stickers[3].points.map(e => e.clone()).reverse(), angle: -90 },
    "R": { plane: axis.pieces[1].stickers[2].points.map(e => e.clone()), angle: -90 },
    "F": { plane: axis.pieces[1].stickers[3].points.map(e => e.clone()), angle: -90 },
    "D": { plane: axis.pieces[6].stickers[2].points.map(e => e.clone()), angle: -90 },
    "L": { plane: axis.pieces[1].stickers[4].points.map(e => e.clone()), angle: -90 },
    "B": { plane: axis.pieces[1].stickers[5].points.map(e => e.clone()), angle: -90 },
  };

  // Initial rotation
  axis.rotation = {
    x: Math.PI / 6,
    y: -Math.PI / 4,
    z: 0,
  };
  
  axis.faceVectors = [
    UP, RIGHT, FRONT, DOWN, LEFT, BACK
  ];

  assignColors(axis, axis.faceColors);

  return axis;

}