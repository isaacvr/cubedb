import { PuzzleOptions } from './../../interfaces/interfaces';
import { CubeMode } from './../../constants/constants';
import { Piece } from './Piece';
import { Vector3D } from '../../classes/vector3d';
import { PuzzleInterface } from '../../interfaces/interfaces';
import { RUBIK } from './nnn';
import { SKEWB } from './skewb';
import { SQUARE1 } from './square1';
import { PYRAMINX } from './pyraminx';
import { AXIS } from './axis';
import { FISHER } from './fisher';
import { IVY } from './ivy';
import { strToHex } from '../../constants/constants';
import { PuzzleType, CubeView } from '../../types';
import { assignColors } from './puzzleUtils';

const protos = {
  skewb: SKEWB,
  square1: SQUARE1,
  pyraminx: PYRAMINX,
  rubik: RUBIK,
  axis: AXIS,
  fisher: FISHER,
  ivy: IVY,
};

export class Puzzle {
  rotation: any;
  p: PuzzleInterface;
  private _type: PuzzleType;
  private _mode: CubeMode;
  private _view: CubeView;
  private _tips: Vector3D[];

  constructor(options: PuzzleOptions) {
    this._type = options.type || 'rubik';
    this._mode = options.mode || CubeMode.NORMAL;
    this._view = options.view || 'trans';
    this._tips = [];

    this.setTips(options.tips || []);

    let a;

    if ( Array.isArray(options.order) ) {
      a = options.order;
    } else if ( typeof options.order === 'number' ) {
      a = [ options.order ];
    } else {
      a = [3];
    }

    if ( typeof this._type === 'string' ) {
      this.p = protos[this._type].apply(null, a);
    }

    this.rotation = this.p.rotation;
    this.adjustColors();

  }

  get type() {
    return this._type;
  }

  get mode() {
    return this._mode;
  }

  get view() {
    return this._view;
  }

  get tips() {
    return this._tips;
  }

  private adjustColors() {
    if ( this._type != 'rubik' ) {
      return;
    }

    let pieces = this.p.pieces;
    let dims = this.p.dims;
  
    // console.log('DIMS: ', dims);

    for (let i = 0, maxi = pieces.length; i < maxi; i += 1) {
      let stickers = pieces[i].stickers;
      let topLayer = (i < dims[0] * dims[1]);
      // let c = ~~(i / (dims[0] * dims[1]));
      // let n = i % (dims[0] * dims[1]);
      // let b = ~~(n / dims[0]);
      // let a = n % dims[0];
      // console.log(i, a, b, c);
      // console.log('I, TopLayer', i, topLayer);

      switch(this._mode) {
        case CubeMode.NORMAL:
        case CubeMode.ELL:
        case CubeMode.ZBLL:
        case CubeMode.PLL: {
          continue;
        }
        case CubeMode.OLL: {
          for (let j = 0, maxj = stickers.length; j < maxj; j += 1) {
            if ( stickers[j].color != 'y' ) {
              stickers[j].color = 'x';
            }
          }
          break;
        }
        case CubeMode.F2L: {
          if ( pieces[i].contains('y') ) {
            for (let j = 0, maxj = stickers.length; j < maxj; j += 1) {
              stickers[j].color = 'x';
            }
          }
          break;
          // let c = getCoords();
          // if ( cube.a[ c[0] ][ c[1] ][ c[2] ].contains( cube.getColor('U') ) ) {
          //   return this.colors.G;
          // }
          // return this.colors[ str[id][ pos() ] ];
        }
        case CubeMode.CMLL: {
          if ( topLayer && stickers.length === 2 ) {
            for (let j = 0, maxj = stickers.length; j < maxj; j += 1) {
              stickers[j].color = 'x';
            }
          }
          break;
          // let c = getCoords();
          // if ( c[1] === 0 ) {
          //   if ( c[0] === 1 || c[2] === 1 ) {
          //     return this.colors.G;
          //   }
          // }
          // return this.colors[ str[id][ pos() ] ];
        }
        case CubeMode.OLLCP: {
          if ( topLayer ) {
            if ( i % 2 == 1 ) {
              for (let j = 0, maxj = stickers.length; j < maxj; j += 1) {
                if ( stickers[j].color != 'y' ) {
                  stickers[j].color = 'x';
                }
              }
            }
          }
          break;
          // let c = getCoords();
          // if ( c[1] === 0 ) {
          //   if ( c[0] === 1 || c[2] === 1 ) {
          //     if ( cube.a[ c[0] ][ c[1] ][ c[2] ].contains( cube.getColor('U') ) ) {            
          //       if ( cube.a[ c[0] ][ c[1] ][ c[2] ].getColor(face) === cube.getColor('U') ) {
          //         return this.colors.U;
          //       }
          //       return this.colors.G;
          //     }
          //   }
          // }
          // return this.colors[ str[id][ pos() ] ];
        }
        case CubeMode.COLL: {
          if ( topLayer ) {
            if ( stickers.length === 2 ) {
              for (let j = 0, maxj = stickers.length; j < maxj; j += 1) {
                let isTop = true;
                let pts = stickers[j].points;
                // console.log('POINTS: ', pts);
                for (let k = 1, maxk = pts.length; k < maxk; k += 1) {
                  if ( Math.abs(pts[k].y - pts[0].y) > 1e-5 ) {
                    isTop = false;
                    break;
                  }
                }

                if ( !isTop ) {
                  // console.log('NOT TOP: ', stickers[j].color);
                  stickers[j].color = 'x';
                } else {
                  // console.log('TOP: ', stickers[j].color);
                }
              }
            }
          } else {
            for (let j = 0, maxj = stickers.length; j < maxj; j += 1) {
              stickers[j].color = 'x';
            }
          }
          break;
          // let c = getCoords();
          
          // if ( c[1] === 0 ) {
          //   if ( c[0] === 1 || c[2] === 1 ) {
          //     if ( "LFRB".indexOf(face) > -1 ) {
          //       return this.colors.G;
          //     }
          //   }
          // }

          // return this.colors[ str[id][ pos() ] ];
        }
        case CubeMode.VLS:
        case CubeMode.WV: {
          if ( topLayer ) {
            for (let j = 0, maxj = stickers.length; j < maxj; j += 1) {
              if ( stickers[j].color != 'y' ) {
                stickers[j].color = 'x';
              }
            }
          }
          break;
        }
        case CubeMode.GRAY: {
          for (let j = 0, maxj = stickers.length; j < maxj; j += 1) {
            stickers[j].color = 'x';
          }
          break;
          // return this.colors.G;
        }
        case CubeMode.CENTERS: {
          if ( stickers.length != 1 ) {
            for (let j = 0, maxj = stickers.length; j < maxj; j += 1) {
              stickers[j].color = 'x';
            }
          }
          break;
        }
        case CubeMode.CROSS: {
          if ( stickers.length > 2 || (stickers.length === 2 && !pieces[i].contains('w')) ) {
            for (let j = 0, maxj = stickers.length; j < maxj; j += 1) {
              stickers[j].color = 'x';
            }
          }
          break;
        }
        default: {
          // return this.colors[ str[id][ pos() ] ];
          break;
        }
    
      }
    }
  }

  static inverse(type: PuzzleType, sequence: string): string {
    let arr = sequence.trim().split(' ').map(e => e.trim()).filter(e => e != "");
    let res = [];

    if ( type !== 'square1' ) {
      for (let i = arr.length - 1; i >= 0; i -= 1) {
        if ( arr[i].indexOf('2') > -1 ) {
          res.push( arr[i].replace("'", "") );
        } else if ( arr[i].indexOf("'") > -1 ) {
          res.push( arr[i].replace("'", "") );
        } else {
          res.push( arr[i] + "'" );
        }
      }
    } else {
      arr = sequence.replace(/\s*/g, '').split('/');
      for (let i = arr.length - 1; i >= 0; i -= 1) {
        if ( arr[i] != '' ) {
          let parts = arr[i].split(',').map(Number);
          res.push( (-parts[0]) + ',' + (-parts[1]) );
        }
        if ( i > 0 ) {
          res.push('/');
        }
      }
    }

    return res.join(" ");
  }

  static fromSequence(scramble: string, options: PuzzleOptions, inv ?: boolean): Puzzle {
    let p = new Puzzle(options);
    // console.log('SCRAMBLE: ', scramble);
    // console.log('SCRAMBLE_INV: ', Puzzle.inverse(options.type, scramble));
    // console.log("\n");
    p.move( (inv) ? Puzzle.inverse(options.type, scramble) : scramble);
    return p;
  }

  private rotate(move: string, dir: number, turns: number) {
    // console.log("MV: ", move, dir, turns);
    const moveObj = this.p.moves[ move ];
    const pieces = this.p.pieces;
    const pts = moveObj.plane;
    const u = Vector3D.cross(pts[0], pts[1], pts[2]).unit();
    const O = this.p.center;
    const ang = moveObj.angle * Math.PI / 180 * dir * turns;

    let Q: Piece[] = [];

    for (let i = 0, maxi = pieces.length; i < maxi; i += 1) {
      let d = pieces[i].direction(pts[0], pts[1], pts[2]);

      if ( d === 0 ) {
        console.log("Invalid move. Piece intersection detected.", move, dir, turns);
        console.log("Piece: ", i, pieces[i], pts);
        return;
      }

      if ( d > 0 ) {
        Q.push(pieces[i]);
      }
    }

    for (let i = 0, maxi = Q.length; i < maxi; i += 1) {
      Q[i].stickers = Q[i].stickers.map(s => s.rotate(O, u, ang));
    }
  }

  private singleMove(_move: string): void {
    // console.log("SM: ", _move);
    let moveArr = _move.split('');
    let moveLen = moveArr.length - 1;

    let dir = 1;
    let turns = 1;
    let move = '';

    if ( this._type != 'square1' ) {
      while( moveLen >= 0 ) {
        let ok = false;
        switch( moveArr[ moveLen ] ) {
          case "’":
          case "'": {
            dir = -1;
            break;
          }
          case "2": {
            turns = 2;
            break;
          }
          default: {
            ok = true;
            break;
          }
        }
        if ( ok ) {
          break;
        }
        moveLen -= 1;
        moveArr.pop();
      }

      move = moveArr.join('');

    } else if ( _move[0] === 'U' || _move[0] === 'D' ) {
      turns = parseInt( _move.slice(1, _move.length) ) || 1;
      move = _move[0];
    } else {
      move = moveArr.join('');
    }

    if ( !this.p.moves.hasOwnProperty( move ) ) {
      console.log('ERROR: ', move, 'is not a valid move');
      return;
    }

    if ( Array.isArray(this.p.moves[_move]) ) {
      let seq = this.p.moves[_move];
      for (let i = 0, maxi = seq.length; i < maxi; i += 1) {
        this.singleMove(seq[i]);
      }
      return;
    }

    this.rotate(move, dir, turns);

  }

  setTips(tips: number[]) {
    // console.info('setTips() is not implemented yet!');
  }

  isComplete(): boolean {
    let pieces = this.p.pieces;
    let fb = this.p.faceVectors;
    let fbLen = fb.length;
    let colors = [];

    for (let i = 0; i < fbLen; i += 1) {
      colors.push('-');
    }

    for (let p = 0, maxp = pieces.length; p < maxp; p += 1) {
      for (let s = 0, maxs = pieces[p].stickers.length; s < maxs; s += 1) {
        let v = pieces[p].stickers[s].getOrientation();
        let ok = false;

        for (let j = 0; j < fbLen; j += 1) {
          if ( v.sub( fb[j] ).abs() < 1e-6 ) {
            if ( colors[j] === '-' ) {
              colors[j] = pieces[p].stickers[s].color;
              // console.log('COLORS ', i, layers[j], ': ', colors);
            } else if ( colors[j] != pieces[p].stickers[s].color ) {
              // console.log('COLOR D/OES NOT MATCH', i, layers[j], colors[j], this.p.fc[i]);
              return false;
            }

            ok = true;
            break;
          }
        }

        if ( !ok ) {
          // console.log('PIECE MISSORIENTED');
          return false;
        }
      }
    }

    return true;
  }

  move(seq: string): void {
    let s1 = seq.split(' ').map(e => e.trim()).filter(e => e != '');
    
    if ( this._type == 'square1' ) {
      s1 = seq.replace(/\s\S/g, '').split('/');
    }

    // console.log('SEQ: ', seq);

    assignColors(this.p, this.p.faceColors);

    for (let i = 0, maxi = s1.length; i < maxi; i += 1) {
      if ( this._type == 'square1' ) {
        if ( s1[i] === '/' ) {
          this.singleMove('/');
        } else {
          let parts = s1[i].split(',');
          // console.log("parts: ", parts);
          if ( parts[0] != '0' ) {
            this.singleMove('U' + parts[0]);
          }
          if ( parts[1] != '0' ) {
            this.singleMove('D' + parts[1]);
          }
        }
      } else {
        this.singleMove(s1[i]);
      }
    }

    this.adjustColors();
  }

  getColor(face: string): string {
    return this.p.palette[ face ];
  }

  getHexColor(face: string): number {
    return strToHex( this.p.palette[ face ] );
  }

  get pieces(): Piece[] {
    return this.p.pieces;
  }
  
  // get str(): string[] {
  //   return this.p.fc;
  // }

  getAllStickers() {
    return this.p.getAllStickers();
  }
}
