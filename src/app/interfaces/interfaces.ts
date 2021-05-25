import { Puzzle } from './../classes/puzzle/puzzle';
import { CubeView, PuzzleType } from '../types';
import { Sticker } from './../classes/puzzle/Sticker';
import { Piece } from './../classes/puzzle/Piece';
import { Vector3D } from '../classes/vector3d';
import { CubeMode } from "../constants/constants";

export interface Card {
  title: string;
  cube: string;
  ready: boolean;
  route: string;
  timer?: boolean;
  puzzle?: Puzzle;
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
  ready: boolean;
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
  palette: any;
  rotation: any;
  center: Vector3D;
  faceVectors: Vector3D[];
  faceColors: string[];
  getAllStickers: () => Sticker[];
  move: (any) => any;

  dims?: number[];
  raw?: any;
  scramble?: () => any;
  toMove?: (...args) => any;
  vectorsFromCamera?: (...args) => any;
}

export interface PuzzleOptions {
  type: PuzzleType;
  order?: number[];
  mode?: CubeMode;
  view?: CubeView;
  tips?: number[];
}

export enum Penalty {
  NONE = 0, P2 = 1, DNF = 2
}

export interface Solve {
  _id?: any;
  time: number;
  date: number;
  scramble: string;
  penalty: Penalty;
  selected: boolean;
  session: string;
  comments?: string;
  group?: number;
  mode?: string;
  len?: number;
  prob?: number;
}

export interface Session {
  _id: string;
  name: string;
}

export interface TimerPuzzleCategory {
  [name: string]: Solve[];
}

export interface TimerPuzzle {
  puzzle: string;
  title: string;
  categoriesStr: string[];
  categories: TimerPuzzleCategory;
}

export interface RawPuzzle {
  type: PuzzleType;
  mode: CubeMode;
  scramble: string;
  tips: number[];
  rotation: any;
  order: number[];
  view: CubeView;
  raw?: any; // Intended for user specific purposes
}

export declare type CubeType = Puzzle | RawPuzzle | { type: 'arrow', text: string } | { tp: 'arrow', tx: string };

export interface BlockType {
  type: "title" | "text" | "cubes";
  content ?: string;
  cubes?: CubeType[];
}

export interface Tutorial {
  _id: string;
  title: string;
  titleLower: string;
  puzzle: string;
  algs: number;
  content: BlockType[];
}
