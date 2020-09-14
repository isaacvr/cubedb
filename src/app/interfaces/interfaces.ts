import { CubeView, PuzzleType } from '../types';
import { Puzzle } from '../classes/puzzle/puzzle';
import { Sticker } from './../classes/puzzle/Sticker';
import { Piece } from './../classes/puzzle/Piece';
import { Vector3D } from '../classes/vector3d';
import { CubeMode } from "../constants/constants";

export interface Card {
  title: string;
  cube: string;
  route: string;
  timer?: boolean;
}

export interface RawCard {
  title: string;
  scramble: string;
  route: string;
  cubeType: PuzzleType;
  cubeMode: CubeMode;
  order: number[];
  timer: boolean;
  view?: CubeView;
  tips?: number[];
  createdAt?: number;
}

export interface Solution {
  moves: string;
  votes: number;
}

export interface Algorithm {
  name: string;
  shortName: string;
  group?: string;
  order: number;
  scramble: string;
  puzzle?: string;
  solutions?: Solution[];
  mode: CubeMode;
  cube ?: string;
  tips ?: number[];
  parentPath ?: string;
  view?: CubeView;
}

export interface NavigationRoute {
  link: string;
  name: string;
}

export interface PuzzleInterface {
  pieces: Piece[];
  moves: any;
  palette: any;
  rotation: any;
  center: Vector3D;
  faceVectors: Vector3D[];
  faceColors: string[];
  getAllStickers: () => Sticker[];
  dims?: number[];
}

export interface PuzzleOptions {
  type: PuzzleType;
  order?: number[];
  mode?: CubeMode;
  view?: CubeView;
  tips?: number[];
}

export interface Tutorial {
  title: string;
  puzzle: string;
}