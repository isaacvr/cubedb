import { LEFT, UP, BACK, RIGHT, FRONT, DOWN, CENTER } from './../vector3d';
import { Vector3D } from '../../classes/vector3d';
import { PuzzleInterface } from './../../interfaces/interfaces';
import { STANDARD_PALETTE } from "../../constants/constants";
import { Piece } from './Piece';
import { Sticker } from './Sticker';
import { assignColors, getAllStickers } from './puzzleUtils';

export function IVY(): PuzzleInterface {

  // The puzzle is defined as an object on the TTk.Puzzle namespace
  const ivy: PuzzleInterface = {
    pieces: [],                    /// Sticker's points
    moves: {},                     /// Define every move
    palette: {},                   /// Color Palette
    rotation: {},                  /// Initial rotation
    center: new Vector3D(0, 0, 0),
    faceVectors: [],
    getAllStickers: null,
    faceColors: [ 'y', 'o', 'g', 'w', 'r', 'b' ]
  };

  ivy.getAllStickers = getAllStickers.bind(ivy);

  const PI = Math.PI;
  const PI_2 = PI / 2;

  let p1 = LEFT.add(UP).add(BACK);
  let p2 = LEFT.add(UP).add(FRONT);
  let p3 = RIGHT.add(UP).add(FRONT);
  let p4 = RIGHT.add(UP).add(BACK);

  let cornerSticker = new Sticker([
    p1,
  ]);

  let curvePoints = [];

  for (let i = 0, maxi = 25; i <= maxi; i += 1) {
    let alpha = i / maxi;
    curvePoints.push(
      p3.add( LEFT.mul(2).rotate(CENTER, DOWN, alpha * PI_2) )
    );
  }

  cornerSticker.points.push(...curvePoints.map(e => e.copy()));

  let centerPiece = new Piece([
    new Sticker([
      ...curvePoints.map(e => e.copy()).reverse(),
      ...curvePoints.map((e: Vector3D) => e.rotate(CENTER, UP, PI)).reverse()
    ])
  ]);

  centerPiece.stickers[0].points.pop();

  let corner = new Piece([
    cornerSticker,
    cornerSticker.rotate(CENTER, LEFT.add(UP).add(BACK), 2 * PI / 3),
    cornerSticker.rotate(CENTER, LEFT.add(UP).add(BACK), -2 * PI / 3)
  ]);

  ivy.pieces.push(
    corner,
    corner.rotate(CENTER, UP, PI),
    corner.rotate(CENTER, LEFT, PI),
    corner.rotate(CENTER, LEFT, PI).rotate(CENTER, UP, PI),
    centerPiece,
    centerPiece.rotate(CENTER, UP, PI_2).rotate(CENTER, RIGHT, PI_2),
    centerPiece.rotate(CENTER, UP, PI_2).rotate(CENTER, LEFT, PI_2),
    centerPiece.rotate(CENTER, UP, PI_2).rotate(CENTER, FRONT, PI_2),
    centerPiece.rotate(CENTER, UP, PI_2).rotate(CENTER, BACK, PI_2),
    centerPiece.rotate(CENTER, UP, PI).rotate(CENTER, RIGHT, PI),
  );

  ivy.moves = {
  };

  // Colours to use for facelets
  ivy.palette = STANDARD_PALETTE;

  // Initial rotation
  ivy.rotation = {
    x: Math.PI / 6,
    y: -Math.PI / 4,
    z: 0,
  };
  
  ivy.faceVectors = [
    UP, RIGHT, FRONT, DOWN, LEFT, BACK
  ];

  assignColors(ivy, ivy.faceColors);

  return ivy;

}