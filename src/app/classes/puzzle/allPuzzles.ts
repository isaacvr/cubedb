import { RUBIK } from './nnn';
import { SKEWB } from './skewb';
import { SQUARE1 } from './square1';
import { PYRAMINX } from './pyraminx';
import { AXIS } from './axis';
import { FISHER } from './fisher';
import { IVY } from './ivy';
import { CLOCK } from './clock';
import { MEGAMINX } from './megaminx';
import { MIRROR } from './mirror';
import { DINO } from './dino';
import { REX } from './rex';
import { REDI } from './redi';
import { MIXUP } from './mixup';
import { registerPuzzle } from './puzzleRegister';

registerPuzzle("rubik", "Rubik's Cube", RUBIK, true);
registerPuzzle("mirror", "Mirror", MIRROR, true);
registerPuzzle("pyraminx", "Pyraminx", PYRAMINX, true);
registerPuzzle("megaminx", "Megaminx", MEGAMINX, true);
registerPuzzle("skewb", "Skewb", SKEWB, false);
registerPuzzle("square1", "Square One", SQUARE1, false);
registerPuzzle("axis", "Axis", AXIS, false);
registerPuzzle("fisher", "Fisher", FISHER, false);
registerPuzzle("ivy", "Ivy", IVY, false);
registerPuzzle("clock", "Rubik's clock", CLOCK, false);
registerPuzzle("dino", "Dino", DINO, false);
registerPuzzle("rex", "Rex", REX, false);
registerPuzzle("redi", "Redi", REDI, false);
registerPuzzle("mixup", "Mixup", MIXUP, false);