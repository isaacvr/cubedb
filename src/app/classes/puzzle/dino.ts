import { Vector3 } from 'three';
import { LEFT, UP, BACK, RIGHT, FRONT, DOWN, CENTER } from './../vector3d';
import { Vector3D } from '../../classes/vector3d';
import { PuzzleInterface } from './../../interfaces/interfaces';
import { STANDARD_PALETTE } from "../../constants/constants";
import { Piece } from './Piece';
import { Sticker } from './Sticker';
import { assignColors, getAllStickers, roundCorners } from './puzzleUtils';

export function DINO(): PuzzleInterface {

  const dino: PuzzleInterface = {
    pieces: [],
    palette: STANDARD_PALETTE,
    rotation: {},
    center: new Vector3D(0, 0, 0),
    faceVectors: [],
    getAllStickers: null,
    faceColors: [ 'y', 'o', 'g', 'w', 'r', 'b' ],
    move: () => true
  };

  dino.getAllStickers = getAllStickers.bind(dino);

  const PI = Math.PI;
  const PI_2 = PI / 2;
  const ANG = 2 * PI / 3;

  let pieces = dino.pieces;
  let ref = LEFT.add(UP).add(BACK);

  let pieceLT = new Piece([
    new Sticker([ LEFT.add(UP).add(BACK), LEFT.add(UP).add(FRONT), UP ]),
    new Sticker([ LEFT.add(UP).add(BACK), LEFT, LEFT.add(UP).add(FRONT) ]),
  ]);

  pieceLT.stickers.forEach(s => s.vecs = [
    LEFT.add(UP).add(BACK).unit(),
    LEFT.add(UP).add(FRONT).unit()
  ]);

  for (let i = 0; i < 4; i += 1) {
    pieces.push( pieceLT.rotate(CENTER, UP, PI_2 * i) );
    pieces.push( pieceLT.rotate(CENTER, UP, PI_2 * i).rotate(CENTER, FRONT, PI) );
    pieces.push( pieceLT.rotate(ref, ref, -2 * PI / 3).rotate(CENTER, UP, PI_2 * i) );
  }

  dino.vectorsFromCamera = function(vecs: any[], cam) {
    return vecs.map(e => {
      let vp = new Vector3(e.x, e.y, e.z).project(cam);
      return new Vector3D(vp.x, -vp.y, 0);
    });
  };

  dino.toMove = function(piece: Piece, sticker: Sticker, dir: Vector3D) {
    let mc = sticker.updateMassCenter();
    let toMovePieces = pieces.filter(p => p.direction1(mc, dir) === 0);
    return {
      pieces: toMovePieces,
      ang: ANG
    };
  };

  dino.rotation = {
    x: PI / 6,
    y: -PI / 4,
    z: 0,
  };
  
  dino.faceVectors = [
    UP, RIGHT, FRONT, DOWN, LEFT, BACK
  ];

  assignColors(dino, dino.faceColors);
  // roundCorners(dino, 0.05, 0.97);
  roundCorners(dino);

  return dino;

}