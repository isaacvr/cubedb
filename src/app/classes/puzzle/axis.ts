import { Sticker } from './Sticker';
import { LEFT, UP, BACK, FRONT, RIGHT, CENTER, DOWN } from './../vector3d';
import { STANDARD_PALETTE } from '../../constants/constants';
import { PuzzleInterface } from '../../interfaces/interfaces';
import { Vector3D } from '../vector3d';
import { Piece } from './Piece';
import { assignColors, getAllStickers, roundCorners } from './puzzleUtils';

export function AXIS(): PuzzleInterface {

  let axis: PuzzleInterface = {
    center: new Vector3D(0, 0, 0),
    faceVectors: [],
    palette: STANDARD_PALETTE,
    pieces: [],
    rotation: {},
    getAllStickers: null,
    faceColors: [ 'y', 'o', 'g', 'w', 'r', 'b' ],
    move: () => true
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

  let DEF = new Sticker([ F, D, E ]);
  let BEF = new Sticker([ F, E, B ]);
  let BCE = new Sticker([ B, E, C ]);
  let ACDE = new Sticker([ E, D, A, C ]);
  let BCH = new Sticker([ B, C, H ]);
  let ADG = new Sticker([ D, G, A ]);
  let ACH = new Sticker([ C, A, H ]);
  let cornerBig = new Piece([
    ADG,
    ADG.rotate(CENTER, RIGHT, PI_2).rotate(CENTER, BACK, PI_2),
    ADG.rotate(CENTER, UP, PI_2).rotate(CENTER, FRONT, PI_2),
    new Sticker([ A, A.rotate(G, BACK, PI_2), D ])
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
    ACH.rotate(CENTER, UP, PI_2).rotate(CENTER, FRONT, PI_2),
    new Sticker([ F, E, EH, FH]),
    new Sticker([ E, D, DH, EH ]),
    new Sticker([ D, E1, EH1, DH ]),
    new Sticker([ E1, F, FH, EH1 ]),
  ]);

  let edgeSmall = new Piece([
    ACDE,
    new Sticker([ E, D, DH, EH ]),
    new Sticker([ E, C, CH, EH ]),
    new Sticker([ C, A, AH, CH ]),
    new Sticker([ A, D, DH, AH ]),
  ]);

  let cornerSmall = new Piece([
    BCE,
    new Sticker([ B, EH, E ]),
    new Sticker([ C, E, EH, CH ]),
    new Sticker([ B, C, CH ]),
  ]);

  let edge1 = new Piece([
    BCH,
    new Sticker([ C, B, CH]),
    centerPiece.stickers[5].rotate(G, G, -PI * 2 / 3),
  ]);

  edge1.stickers.push( ...edge1.rotate(CENTER, B.add(H).div(2), PI).stickers );

  let pieces = axis.pieces;

  pieces.push( cornerBig );
  pieces.push( centerPiece );
  pieces.push( edgeSmall );
  pieces.push( cornerSmall );
  pieces.push( edge1 );
  pieces.push( edge1.reflect(G, B, CENTER).reverse() );

  for (let i = 1, maxi = pieces.length; i < maxi; i += 1) {
    pieces.push( pieces[i].rotate(G, G, -PI * 2 / 3) );
    pieces.push( pieces[i].rotate(G, G, PI * 2 / 3) );
  }

  for (let i = 0, maxi = 5; i < maxi; i += 1) {
    pieces.push(pieces[i].rotate(CENTER, UP, PI).rotate(CENTER, LEFT, PI_2));
  }

  for (let i = 6, maxi = 12; i < maxi; i += 1) {
    pieces.push(pieces[i].rotate(CENTER, UP, PI).rotate(CENTER, LEFT, PI_2));
  }

  axis.rotation = {
    x: Math.PI / 6,
    y: -Math.PI / 4,
    z: 0,
  };
  
  axis.faceVectors = [
    UP, RIGHT, FRONT, DOWN, LEFT, BACK
  ];

  assignColors(axis, axis.faceColors);
  roundCorners(axis);

  return axis;

}