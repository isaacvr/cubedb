import { RIGHT, LEFT, DOWN, FRONT } from './../vector3d';
import { Vector3D, CENTER, BACK, UP } from '../../classes/vector3d';
import { PuzzleInterface } from '../../interfaces/interfaces';
import { STANDARD_PALETTE } from "../../constants/constants";
import { Piece } from './Piece';
import { Sticker } from './Sticker';
import { assignColors, getAllStickers } from './puzzleUtils';

export function SKEWB(): PuzzleInterface {
  // The puzzle is defined as an object on the TTk.Puzzle namespace
  let skewb: PuzzleInterface = {
    pieces: [],              /// Sticker's points
    moves: {},               /// Define every move
    palette: {},             /// Color Palette
    rotation: {},            /// Initial rotation
    center: new Vector3D(0, 0, 0),
    faceVectors: [],
    getAllStickers: null,
    faceColors: [ 'y', 'o', 'g', 'w', 'r', 'b' ]
  };

  skewb.getAllStickers = getAllStickers.bind(skewb);

  const L = 1;
  const PI = Math.PI;
  const PI_2 = PI / 2;

  let center = new Piece([
    new Sticker([
      UP.add(BACK).mul(L),
      UP.add(LEFT).mul(L),
      UP.add(FRONT).mul(L),
      UP.add(RIGHT).mul(L),
    ])
  ]);

  let cornerSticker = new Sticker([
    UP.add(RIGHT).mul(L),
    UP.add(FRONT).mul(L),
    UP.add(FRONT).add(RIGHT).mul(L)
  ]);

  let anchor = UP.add(FRONT).add(RIGHT).mul(L);

  let corner = new Piece([
    cornerSticker,
    cornerSticker.rotate(anchor, UP, PI_2).rotate(anchor, RIGHT, PI_2),
    cornerSticker.rotate(anchor, DOWN, PI_2).rotate(anchor, BACK, PI_2),
  ]);

  for (let i = 0; i < 4; i += 1) {
    skewb.pieces.push(center.rotate(CENTER, RIGHT, i * PI_2) );
  }
  skewb.pieces.push(center.rotate(CENTER, BACK, PI_2) );
  skewb.pieces.push(center.rotate(CENTER, FRONT, PI_2) );

  for (let i = 0; i <= 1; i += 1) {
    for (let j = 0; j < 4; j += 1) {
      skewb.pieces.push( corner.rotate(CENTER, RIGHT, i * PI_2).rotate(CENTER, UP, j * PI_2) );
    }
  }

  // Define moves
  skewb.moves = {
    "F": {
      plane: [
        RIGHT.add(UP).mul(L), FRONT.add(UP).mul(L), FRONT.add(LEFT).mul(L)
      ],
      angle: -120
    },
    "R": {
      plane: [
        BACK.add(UP).mul(L),
        RIGHT.add(UP).mul(L),
        RIGHT.add(FRONT).mul(L),
      ],
      angle: -120
    },
    "B": {
      plane: [
        LEFT.add(UP).mul(L),
        BACK.add(UP).mul(L),
        RIGHT.add(BACK).mul(L),
      ],
      angle: -120
    },
    "L": {
      plane: [
        RIGHT.add(FRONT).mul(L),
        UP.add(FRONT).mul(L),
        LEFT.add(UP).mul(L),
      ],
      angle: -120
    },
    "x": {
      plane: [
        RIGHT.add(UP).add(FRONT).mul(L),
        RIGHT.add(UP).add(BACK).mul(L),
        RIGHT.add(DOWN).add(BACK).mul(L),
      ],
      angle: 90
    },
    "y": {
      plane: [
        LEFT.add(UP).add(BACK).mul(L),
        RIGHT.add(UP).add(BACK).mul(L),
        RIGHT.add(UP).add(FRONT).mul(L),
      ],
      angle: 90
    },
    "z": {
      plane: [
        LEFT.add(UP).add(FRONT).mul(L),
        RIGHT.add(UP).add(FRONT).mul(L),
        RIGHT.add(DOWN).add(FRONT).mul(L),
      ],
      angle: 90
    },
  };

  // Colours to use for facelets
  skewb.palette = STANDARD_PALETTE;

  // Initial rotation
  skewb.rotation = {
    x: Math.PI / 6,
    y: -Math.PI / 4,
    z: 0,
  };

  skewb.faceVectors = [
    UP, RIGHT, FRONT, DOWN, LEFT, BACK
  ];

  assignColors(skewb, skewb.faceColors);

  return skewb;

}