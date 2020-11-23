import { PuzzleInterface } from './../../interfaces/interfaces';
export function CLOCK(): PuzzleInterface {
  
  /// This is for compatibility only!!
  let clock: PuzzleInterface = {
    center: null,
    faceColors: null,
    faceVectors: null,
    getAllStickers: null,
    move: () => true,
    palette: null,
    pieces: null,
    rotation: {
      x: 0,
      y: 0,
      z: 0,
    },
    dims: null,
  };

  let pins: boolean[] = [ false, false, false, false ];
  let clocks = [
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
  ];

  let add = function(i, j, k, val) {
    clocks[i][j][k] = ((clocks[i][j][k] + val) % 12 + 12) % 12;
  };

  let mat = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  clock.move = function(moves: any[]) {
    let first = true;
    let upFace = 0;
    for (let i = 0, maxi = moves.length; i < maxi; i += 1) {
      let mv = moves[i];
      let pinCode = mv[0];
      let up = mv[1];
      let down = mv[2];

      if ( mv[0] === -1 ) {
        upFace ^= 1;
        continue;
      }

      for (let x = 0; x < 3; x += 1) {
        for (let y = 0; y < 3; y += 1) {
          mat[x][y] = 0;
        }
      }

      for (let j = 0, mask = 8; j < 4; j += 1, mask >>= 1) {
        if ( isNaN(up) || isNaN(down) ) {
          if ( first ) {
            pins.length = 0;
            pins.push(false, false, false, false);
            first = false;
          }
          pins[j] = (pinCode & mask) ? true : pins[j];
        } else {
          pins[j] = !!(pinCode & mask);
        }
        if ( pins[j] ) {
          let x = j >> 1;
          let y = j & 1;
          mat[x][y] = mat[x + 1][y] = mat[x][y + 1] = mat[x + 1][y + 1] = 1;
        }
      }

      if ( !isNaN(up) && !isNaN(down) ) {
        for (let x = 0; x < 3; x += 1) {
          for (let y = 0; y < 3; y += 1) {
            if ( mat[x][y] ) {
              add(upFace, x, y, up);
              if ( (x & 1) == 0 && (y & 1) == 0 ) {
                add(1 - upFace, x, 2 - y, -up);
              }
            }
          }
        }
      }

    }
  };

  clock.raw = [
    pins, clocks
  ];

  return clock;
}