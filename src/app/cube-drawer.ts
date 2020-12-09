import { Sticker } from './classes/puzzle/Sticker';
import { Vector2D } from './classes/vector2-d';
import { CENTER, RIGHT, Vector3D, BACK, FRONT, LEFT, UP, DOWN } from './classes/vector3d';
import { Observable, Observer } from 'rxjs';
import { Puzzle } from './classes/puzzle/puzzle';
import * as THREE from 'three';
import { roundStickerCorners } from './classes/puzzle/puzzleUtils';
import { FaceSticker } from './classes/puzzle/FaceSticker';

function map(v, a, b, A, B) {
  return (v - a) * (B - A) / (b - a) + A;
}

function planView(cube: Puzzle, DIM: number): string {
  if ( [ 'rubik', 'skewb', 'ivy' ].indexOf(cube.type) > -1 ) {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    
    const PI_2 = Math.PI / 2;
    const order = cube.order[0];
    const LW = 2;
    const PAD = 20;
    const ALL_PAD = LW + PAD;
    const mSticker = (DIM - ALL_PAD * 2) / (order + 1) / 2 + ALL_PAD;

    canvas.width = DIM;
    canvas.height = DIM;

    let allStickers = cube.getAllStickers();
    let stickers = allStickers.filter(s => {
      if ( s.color === 'd' ) {
        return false;
      }
      let p = s.points;
      return p.reduce((s, pt) => s && pt.y >= 1 - 1e-6 , true);
    }).map(s => s.rotate(CENTER, RIGHT, PI_2));

    ctx.strokeStyle = '7px solid #000000';
    ctx.lineWidth = LW;

    for (let i = 0, maxi = stickers.length; i < maxi; i += 1) {
      ctx.fillStyle = cube.getHexStrColor( stickers[i].color );
      let pts = stickers[i].points;

      ctx.beginPath();

      if ( cube.type === 'rubik' ) {
        let mc = stickers[i].getMassCenter();
        let pts1 = pts.map(p => p.sub(mc).mul(1 / 0.925).add(mc));
        let box = pts1.reduce((ac, e) => {
          return [
            Math.min(ac[0], e.x), Math.min(ac[1], e.y),
            Math.max(ac[2], e.x), Math.max(ac[3], e.y),
          ]
        }, [Infinity, Infinity, -Infinity, -Infinity]); 

        pts = [
          new Vector3D(box[0], box[1]), new Vector3D(box[0], box[3]),
          new Vector3D(box[2], box[3]), new Vector3D(box[2], box[1]),
        ];
      }

      for (let j = 0, maxj = pts.length; j < maxj; j += 1) {
        let x = map(pts[j].x, -1, 1, mSticker, DIM - mSticker);
        let y = map(pts[j].y, -1, 1, mSticker, DIM - mSticker);
        if ( j === 0 ) {
          ctx.moveTo(x, DIM - y);
        } else {
          ctx.lineTo(x, DIM - y);
        }
      }
      ctx.fill();
      ctx.closePath();
      ctx.stroke();
    }

    if ( cube.type === 'rubik' ) {
    
      let sideStikers = allStickers.filter(s => {
        if ( s.color === 'd' ) {
          return false;
        }
  
        let th = 1 - 2 / cube.order[0];
        let mc = s.getMassCenter();

        return mc.y > th && ( Math.abs(mc.x) > 1 - 1e-6 || Math.abs(mc.z) > 1 - 1e-6 );
      })
      .sort((a, b) => {
        let dirs = [ BACK, RIGHT, FRONT, LEFT ];
        let oa = a.getOrientation();
        let ob = b.getOrientation();
        let ia;
        let ib;
  
        for (let i = 0; i < 4; i += 1) {
          if ( oa.sub(dirs[i]).abs() < 1e-6 ) {
            ia = i;
          }
          if ( ob.sub(dirs[i]).abs() < 1e-6 ) {
            ib = i;
          }
        }
  
        if ( ia === ib ) {
          let c1 = a.getMassCenter();
          let c2 = b.getMassCenter();
          if ( ia == 0) {
            return c1.x - c2.x;
          } else if ( ia == 1 ) {
            return c1.z - c2.z;
          } else if ( ia == 2 ) {
            return c2.x - c1.x;
          }
          return c2.z - c1.z;
        }
        return ia - ib;
      });

      let f = 0.04;

      let vecs = [
        new Vector2D(mSticker, mSticker),
        new Vector2D(DIM - mSticker, mSticker),
        new Vector2D(DIM - mSticker, DIM - mSticker),
        new Vector2D(mSticker, DIM - mSticker),
        new Vector2D(mSticker, mSticker),
      ];

      let sideIdx = 0;

      for (let v = 0, maxv = vecs.length - 1; v < maxv; v += 1) {
        let v1 = vecs[v];
        let v2 = vecs[v + 1];
        let vDir = v2.sub(v1).mul(f);
        let vd1 = v1.add( vDir ).sub( vDir.unit().rot(Math.PI / 2).mul(mSticker - ALL_PAD / 2) );
        let vd2 = v2.sub( vDir ).sub( vDir.unit().rot(Math.PI / 2).mul(mSticker - ALL_PAD / 2) );
  
        for (let i = 0; i < order; i += 1) {
          let p1 = v1.add(v2.sub(v1).mul(i / order));
          let p2 = v1.add(v2.sub(v1).mul((i + 1) / order));
          let p3 = vd1.add(vd2.sub(vd1).mul((i + 1) / order));
          let p4 = vd1.add(vd2.sub(vd1).mul(i / order));
  
          ctx.fillStyle = cube.getHexStrColor( sideStikers[ sideIdx++ ].color );
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
          ctx.lineTo(p4.x, p4.y); ctx.lineTo(p1.x, p1.y); ctx.fill(); ctx.stroke();
        }
      }

      let swaps = cube.arrows;

      const tipLength = 0.06 * DIM;
      const tipAngle = Math.PI * 0.88;
      const elems = 5;

      for (let i = 0, maxi = (~~(swaps.length / elems) ) * elems; i < maxi; i += elems) {
        let x1 = swaps[i];
        let y1 = swaps[i + 1];
        let x2 = swaps[i + 2];
        let y2 = swaps[i + 3];
        let type = swaps[i + 4];

        if ( x1 < 0 || x1 >= order ||
            y1 < 0 || y1 >= order ||
            x2 < 0 || x2 >= order ||
            x2 < 0 || x2 >= order ) {
          continue;
        }

        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'black';

        let vi = vecs[2].sub(vecs[0]).div(order);
        let vj = vecs[2].sub(vecs[0]).div(order);
        let unit = vecs[2].sub(vecs[0]).div(order * 2);

        vi.y = 0;
        vj.x = 0;

        let ini = vecs[0].add( vi.mul(x1) ).add( vj.mul(y1) ).add(unit);
        let fin = vecs[0].add( vi.mul(x2) ).add( vj.mul(y2) ).add(unit);
        let tip = fin.sub(ini).unit().mul( tipLength );
        let tip1 = fin.add( tip.rot( tipAngle ) );
        let tip2 = fin.add( tip.rot( -tipAngle ) );
        let tip3 = ini.sub( tip.rot( tipAngle ) );
        let tip4 = ini.sub( tip.rot( -tipAngle ) );
        let m1 = tip1.add(tip2).div(2);
        let m2 = tip3.add(tip4).div(2);

        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.lineTo(fin.x, fin.y);
        ctx.lineTo(tip1.x, tip1.y);
        ctx.lineTo(tip2.x, tip2.y);
        ctx.fill();
        ctx.stroke();

        if ( type != 0 ) {
          ctx.beginPath();
          ctx.lineTo(ini.x, ini.y);
          ctx.lineTo(tip3.x, tip3.y);
          ctx.lineTo(tip4.x, tip4.y);
          ctx.fill();
          ctx.stroke();
        }

        ctx.lineWidth = 4;
        ctx.lineCap = 'square';

        ctx.beginPath();
        ctx.moveTo(m1.x, m1.y);
        ctx.lineTo(m2.x, m2.y);
        ctx.stroke();

      }
    }

    return canvas.toDataURL();
  }
  return '';
}

function projectedView(cube: Puzzle, DIM: number): string {  
  let W = DIM * 4 / 2;
  let H = DIM * 3 / 2;
  const PI = Math.PI;
  const PI_2 = PI / 2;
  const PI_3 = PI / 3;
  const PI_6 = PI / 6;
  const FACTOR = 2.1;
  let LW = 3;  

  if ( cube.type === 'pyraminx' ) {
    H = W / 1.1363636363636365;
  } else if ( cube.type === 'square1' ) {
    W += H;
    H = W - H;
    W = W - H;
    W *= 0.62;
    // W = H / 2.5;
  } else if ( cube.type === 'megaminx' ) {
    W = H * 2;
    LW = H * 0.004;
  }
 
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');

  canvas.width = W;
  canvas.height = H;
  ctx.lineWidth = LW;

  let colorFilter = [ 'd' ];
  
  if ( cube.type === 'square1' ) {
    colorFilter.push('x');
  }

  let stickers = cube.getAllStickers().filter(s => colorFilter.indexOf(s.color) === -1);

  let sideStk: { [name: string]: Sticker[] } = {};

  let faceVectors = cube.p.faceVectors;
  let faceName = [ 'U', 'R', 'F', 'D', 'L', 'B' ];
  let fcTr: any[] = [
    [ CENTER, RIGHT, PI_2, UP, FACTOR ],
    [ CENTER, UP, -PI_2, RIGHT, FACTOR ],
    [ CENTER, RIGHT, 0, UP, 0 ], /// F = no transform
    [ CENTER, LEFT, PI_2, DOWN, FACTOR ],
    [ CENTER, UP, PI_2, LEFT, FACTOR ],
    [ CENTER, UP, PI, RIGHT, FACTOR * 2 ],
  ];
  let SQ1_ANCHORS: Vector3D[] = [];

  for (let i = 0; i < 12; i += 1) {
    SQ1_ANCHORS.push(
      UP.add( BACK.rotate(CENTER, UP, PI_6 * i + PI_6 / 2).mul(1.38036823524362) ),
      UP.add( BACK.rotate(CENTER, UP, PI_6 * i + PI_6 / 2).mul(1.88561808632825) )
    );
  }

  if ( cube.type === 'pyraminx' ) {
    faceName = [ 'F', 'R', 'D', 'L' ];
  } else if ( cube.type === 'square1' ) {
    faceVectors = [ UP, DOWN, RIGHT.add(BACK).add(UP) ];
    faceName = [ 'U', 'D', 'M' ];
  } else if ( cube.type === 'megaminx' ) {
    let raw = cube.p.raw;
    let ac = raw[0];
    let FACE_ANG = raw[1];
    faceName = [
      "U",
      "MU1", "MU2", "MU3", "MU4", "MU5",
      "MD1", "MD2", "MD3", "MD4", "MD5",
      "D"
    ];
    fcTr = [
      [ CENTER, UP, 0, UP, 0 ], /// no transform
    ];

    for (let i = 0; i < 5; i += 1) {
      fcTr.push([
        ac[i], ac[ (i + 1) % 5 ].sub(ac[i]), FACE_ANG - PI, UP, 0
      ]);
    }  

    for (let i = 0; i < 5; i += 1) {
      fcTr.push([ CENTER, UP, 0, UP, 0 ]);
    }
    fcTr.push([ CENTER, UP, 0, UP, 0 ]);
  }

  for (let i = 0, maxi = faceName.length; i < maxi; i += 1) {
    sideStk[ faceName[i] ] = [];
  }

  for (let i = 0, maxi = stickers.length; i < maxi; i += 1) {
    let st = stickers[i];
    let uv = st.getOrientation();
    let ok = false;
    for (let j = 0, maxj = faceVectors.length; j < maxj && !ok; j += 1) {
      if ( faceVectors[j].sub( uv ).abs() < 1e-6 ) {
        if ( ['rubik', 'ivy', 'skewb', 'megaminx'].indexOf(cube.type) > -1 ) {
          sideStk[ faceName[j] ].push(
            st.rotate(fcTr[j][0], fcTr[j][1], fcTr[j][2]).add( fcTr[j][3].mul(fcTr[j][4]) )
          );
        } else {
          sideStk[ faceName[j] ].push(st);
        }
        ok = true;
      }
    }

    if ( !ok && cube.type === 'square1' ) {
      if ( st.color != 'd' && st.color != 'x' ) {
        let pts = st._generator.points.filter(p => {
          return Math.abs(p.y) >= 1 - 1e-6;
        });

        if ( pts.length > 0 ) {
          let st1 = st._generator.clone();
          st1.points.map(p => p.y = (p.y + pts[0].y) / 2);
          st1.updateMassCenter();
          st1.rotate(pts[0], pts[0].sub(pts[1]), PI_2, true);

          let points = st1.points;
          for (let j = 1; j <= 2; j += 1) {
            SQ1_ANCHORS.sort((a, b) => a.sub(points[j]).abs() - b.sub(points[j]).abs());
            points[j] = SQ1_ANCHORS[0].clone();
          }

          // let rounded = st1;
          let rounded = roundStickerCorners(st1, null, 0.95);
          rounded.color = st.color;
          rounded.oColor = st.oColor;

          if ( pts[0].y > 0 ) {
            sideStk.U.push( rounded );
          } else {
            sideStk.D.push( rounded ); 
          }
        } else {
          let isFront = st._generator.points.reduce((ac, p) => ac && p.z >= 1, true);
          
          if ( isFront ) {
            let st1 = st.clone();
            st1.points.map(p => {p.y /= 2; p.x *= 4/3;});
            sideStk.M.push(st1);
          }
        }
      }
    }
  }

  if ( cube.type === 'pyraminx' ) {
    let PU = UP.mul(1.59217);
    let PR = DOWN.mul(0.53072).add( FRONT.mul(1.5011) ).rotate(CENTER, UP, PI_3);
    let PB = PR.rotate(CENTER, UP, 2 * PI_3);
    let PL = PB.rotate(CENTER, UP, 2 * PI_3);
    let MLR = PL.add(PR).div(2);

    // const ANG = 0.39369908169872414;
    const ANG = 0.4048928432892675;
    // const ANG = ang;
    const ANG1 = PI_2 + ANG;

    sideStk.F = sideStk.F.map(s => s.rotate(MLR, RIGHT, ANG));
    sideStk.R = sideStk.R.map(s => s.rotate(PR, PR.sub(PU), ANG1).rotate(MLR, RIGHT, ANG));
    sideStk.D = sideStk.D.map(s => s.rotate(PR, PL.sub(PR), ANG1).rotate(MLR, RIGHT, ANG));
    sideStk.L = sideStk.L.map(s => s.rotate(PU, PU.sub(PL), ANG1).rotate(MLR, RIGHT, ANG));

    let cm1 = sideStk.R.reduce((a, s) => a.add(s.getMassCenter()), new Vector3D()).div(sideStk.R.length).setLength(0.15);
    let cm2 = sideStk.D.reduce((a, s) => a.add(s.getMassCenter()), new Vector3D()).div(sideStk.D.length).setLength(0.15);
    let cm3 = sideStk.L.reduce((a, s) => a.add(s.getMassCenter()), new Vector3D()).div(sideStk.L.length).setLength(0.15);
    
    sideStk.R = sideStk.R.map(s => s.add(cm1) );
    sideStk.D = sideStk.D.map(s => s.add(cm2) );
    sideStk.L = sideStk.L.map(s => s.add(cm3) );
  } else if ( cube.type === 'square1' ) {
    sideStk.U = sideStk.U.map(st => st.rotate(CENTER, RIGHT, PI_2).add( UP.mul(FACTOR) ));
    sideStk.D = sideStk.D.map(st => st.rotate(CENTER, RIGHT, -PI_2).add( DOWN.mul(FACTOR) ));
  } else if ( cube.type === 'megaminx' ) {
    let raw = cube.p.raw;
    let FACE_ANG = raw[1];
    let F = raw[2];
    let R = raw[3];
    let SIDE = raw[4];
    let alpha = 2 * PI / 5;
    let beta = (PI - alpha) / 2;
    let D = SIDE * F * Math.sin(alpha) / Math.sin(beta);
    let r = R - D;

    let ac1 = cube.p.pieces.find(p => {
      let st = p.stickers.filter(s => s.color != 'd');
      return st.length === 1 && st[0].getOrientation().sub(DOWN).abs() < 1e-6;
    }).stickers[0].add(UP).mul(R / r).add(DOWN).points;


    let pts1 = [];
    let pts2 = [];
    for (let i = 0; i < 6; i += 1) {
      sideStk[ faceName[i] ] = sideStk[ faceName[i] ].map(s => {
        let newS = s.rotate(CENTER, RIGHT, PI_2);
        pts1.push(...s.points);
        return newS;
      });
    }
    for (let i = 6; i < 12; i += 1) {
      let pts = sideStk[ faceName[i] ][0].points;
      for (let j = 0, j1 = 1; j < 5 && i < 11; j += 1) {
        if ( Vector3D.direction(pts[0], pts[1], pts[2], ac1[j]) === 0 &&
             Vector3D.direction(pts[0], pts[1], pts[2], ac1[j1]) === 0) {
          sideStk[ faceName[i] ] = sideStk[ faceName[i] ].map(s => {
            return s.rotate(ac1[j], ac1[j1].sub(ac1[j]), FACE_ANG - PI);
          });
          break;
        }
        j1 = (j1 + 1) % 5;
      }
      sideStk[ faceName[i] ] = sideStk[ faceName[i] ].map(s => {
        let newS = s.rotate(CENTER, FRONT, PI).rotate(CENTER, RIGHT, PI_2);
        pts2.push(...newS.points);
        return newS;
      });
    }
    pts1.sort((p1, p2) => p2.x - p1.x);
    pts2.sort((p1, p2) => p1.x - p2.x);
    let vec = pts1[5].sub(pts2[0]);
    vec.y *= -1;
    vec.z = 0;
    for (let i = 6; i < 12; i += 1) {
      sideStk[ faceName[i] ] = sideStk[ faceName[i] ].map(s => s.add(vec));
    }
  }

  let allStickers: Sticker[] = [];

  for (let i = 0, maxi = faceName.length; i < maxi; i += 1) {
      allStickers.push(...sideStk[ faceName[i] ]);
  }

  let __min = Math.min;
  let __max = Math.max;

  let limits = [ Infinity, -Infinity, Infinity, -Infinity ];
  
  for (let i = 0, maxi = allStickers.length; i < maxi; i += 1) {
    let pts = allStickers[i].points;
    pts.forEach(p => {
      limits[0] = __min(limits[0], p.x); limits[1] = __max(limits[1], p.x);
      limits[2] = __min(limits[2], p.y); limits[3] = __max(limits[3], p.y);
    });
  }  

  const PAD = 2;

  for (let i = 0, maxi = allStickers.length; i < maxi; i += 1) {
    ctx.fillStyle = cube.getHexStrColor( allStickers[i].color );
    let pts = allStickers[i].points;

    ctx.beginPath();

    for (let j = 0, maxj = pts.length; j < maxj; j += 1) {
      let x = map(pts[j].x, limits[0], limits[1], PAD, W - PAD);
      let y = map(pts[j].y, limits[2], limits[3], PAD, H - PAD);
      if ( j === 0 ) {
        ctx.moveTo(x, H - y);
      } else {
        ctx.lineTo(x, H - y);
      }
    }
    ctx.fill();
    ctx.closePath();
    ctx.stroke();
  }

  if ( cube.type === 'megaminx' ) {
    let LX = W * 0.251;
    let LY = H * 0.457;
    let fontWeight = W * 0.05;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';
    ctx.font = fontWeight + "px verdana, sans-serif";
    ctx.fillText("U", LX, LY);
    ctx.fillText("F", LX, LY * 1.75);
  }

  return canvas.toDataURL();
}

function circle(ctx: CanvasRenderingContext2D, x: number, y: number, rad: number, col: string) {
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

function drawSingleClock(
  ctx: CanvasRenderingContext2D, RAD: number, X: number, Y: number,
  MAT, PINS, BLACK: string, WHITE: string, GRAY: string) {
  const W = RAD * 0.582491582491582;
  const RAD_CLOCK = RAD * 0.20202020202020;
  const BORDER = RAD * 0.0909090909090909;
  const BORDER1 = 4;

  const PI = Math.PI;
  const TAU = PI * 2;

  const arrow = new Sticker([
    new Vector3D(0.0000, 1.0000),
    new Vector3D(0.1491, 0.4056),
    new Vector3D(0.0599, 0.2551),
    new Vector3D(0.0000, 0.0000),
    new Vector3D(-0.0599, 0.2551),
    new Vector3D(-0.1491, 0.4056),
  ]).mul(RAD_CLOCK);

  const circles = new Sticker([
    new Vector3D(0.1672),
    new Vector3D(0.1254),
  ]).mul(RAD_CLOCK);

  const R_PIN = circles.points[0].x * 2.3;

  circle(ctx, X, Y, RAD, WHITE);

  for (let i = -1; i < 2; i += 2) {
    for (let j = -1; j < 2; j += 2) {
      circle(ctx, X + W * i, Y + W * j, RAD_CLOCK + BORDER + BORDER1, WHITE);
      circle(ctx, X + W * i, Y + W * j, RAD_CLOCK + BORDER, BLACK);
    }
  }

  circle(ctx, X, Y, RAD - BORDER1, BLACK);

  for (let i = -1; i < 2; i += 1) {
    for (let j = -1; j < 2; j += 1) {
      circle(ctx, X + W * i, Y + W * j, RAD_CLOCK, WHITE);

      const ANCHOR = new Vector3D(X + W * i, Y + W * j);
      let angId = MAT[j + 1][i + 1];
      let ang = angId * TAU / 12;
      let pts = arrow.rotate(CENTER, FRONT, PI + ang).add(ANCHOR).points;
      ctx.fillStyle = BLACK;
      ctx.beginPath();
      for (let p = 0, maxp = pts.length; p < maxp; p += 1) {
        p === 0 && ctx.moveTo(pts[p].x, pts[p].y);
        p > 0 && ctx.lineTo(pts[p].x, pts[p].y);
      }
      ctx.fill();
      ctx.closePath();

      circle(ctx, ANCHOR.x, ANCHOR.y, circles.points[0].x, BLACK);
      circle(ctx, ANCHOR.x, ANCHOR.y, circles.points[1].x, WHITE);

      for (let a = 0; a < 12; a += 1) {
        let pt = ANCHOR.add( DOWN.mul(RAD_CLOCK + BORDER / 2).rotate(CENTER, FRONT, a * TAU / 12) );
        let r = circles.points[0].x / 4 * (a ? 1 : 1.6);
        let c = a ? WHITE : '#ff0000'
        circle(ctx, pt.x, pt.y, r, c);
      }

      if ( i <= 0 && j <= 0 ) {
        let val = PINS[ (j + 1) * 2 + i + 1 ];
        circle(ctx, ANCHOR.x + W / 2, ANCHOR.y + W / 2, R_PIN, (val) ? WHITE : GRAY);
        circle(ctx, ANCHOR.x + W / 2, ANCHOR.y + W / 2, R_PIN * 0.8, (val) ? BLACK : GRAY);
      }
    }
  }
}

function clockImage(cube: Puzzle, DIM: number): string {
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  canvas.width = DIM * 2.2;
  canvas.height = DIM;

  const PINS1 = cube.p.raw[0];
  const PINS2 = cube.p.raw[0].map((e, p) => !PINS1[ ((p >> 1) << 1) + 1 - (p & 1) ]);
  const MAT = cube.p.raw[1];
  const RAD = DIM / 2;

  let theme = localStorage.getItem('theme');

  const BLACK = '#181818';
  const WHITE = (theme === 'dark') ? '#aaa' : '#eee';
  const GRAY = '#7f7f7f';

  drawSingleClock(ctx, RAD, RAD, RAD, MAT[0], PINS2, BLACK, WHITE, GRAY);
  drawSingleClock(ctx, RAD, canvas.width - RAD, RAD, MAT[1], PINS1, WHITE, BLACK, GRAY);
  
  return canvas.toDataURL();
}

export function cubeToThree(cube: Puzzle, F: number = 1) {
  let group = new THREE.Object3D();
  let pieces = cube.pieces;

  for (let p = 0, maxp = pieces.length; p < maxp; p += 1) {
    let stickers = pieces[p].stickers;
    let piece = new THREE.Object3D();

    piece.userData = pieces[p];

    for (let s = 0, maxs = stickers.length; s < maxs; s += 1) {
      let sticker = stickers[s].mul(F); 
      let color = cube.getHexColor( sticker.color );
      let stickerGeometry = new THREE.Geometry(); 
      let stickerMaterial: THREE.Material;

      stickerGeometry.vertices.push( ...sticker.points.map(p => new THREE.Vector3(p.x, p.y, p.z)) );

      if ( sticker instanceof FaceSticker ) {
        stickerMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          vertexColors: true
        });

        let f = sticker.faces;
        for (let i = 0, maxi = f.length; i < maxi; i += 1) {
          let face = new THREE.Face3(f[i][0], f[i][1], f[i][2], null);
          face.color.setHex( color );
          stickerGeometry.faces.push(face);
        }
        stickerGeometry.colorsNeedUpdate = true;
      } else {
        stickerMaterial = new THREE.MeshBasicMaterial({
          color,
          side: THREE.DoubleSide
        });

        for (let i = 2, maxi = sticker.points.length; i < maxi; i += 1) {
          stickerGeometry.faces.push( new THREE.Face3(0, i - 1, i) );
        }
      }

      let box = new THREE.Mesh(stickerGeometry, stickerMaterial);
      box.userData = stickers[s];
      
      piece.add(box);

    }

    group.add(piece);
    
  }

  group.rotation.x = cube.rotation.x;
  group.rotation.y = cube.rotation.y;
  group.rotation.z = cube.rotation.z;

  return group;
}

export function generateCubeBundle(cubes: Puzzle[], width ?: number, all ?: boolean, inCube?: boolean): Observable< string | string[] > {
  return new Observable((observer: Observer<string | string[]>) => {

    const W = width || 250;
    let renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    renderer.setSize(W, W);
    
    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(40, 0.95, 2, 7);

    camera.position.z = 5.5;
    
    scene.add(camera);

    let c = 0;
    let maxc = cubes.length;

    let buff: string[] = [];

    let itv = setInterval(() => {
      if ( c >= maxc ) {
        clearInterval(itv);
        renderer.dispose();

        if ( all ) {
          observer.next(buff);
        }

        observer.complete();
        return;
      }

      let cube = cubes[c];

      if ( cube.type === 'clock' ) {
        let res = clockImage(cube, W);
        if ( all ) {
          buff.push( res );
        } else {
          if ( inCube ) {
            (<any> cube).img = res;
          } else {
            observer.next( res );
          }
        }
      } else if ( [ 'plan', '2d' ].indexOf(cube.view) > -1 ) {
        let res;

        if ( cube.view == 'plan' ) { 
          res = planView(cube, W);
        } else {
          res = projectedView(cube, W);
        }

        if ( all ) {
          buff.push( res );
        } else {
          if ( inCube ) {
            (<any> cube).img = res;
          } else {
            observer.next( res );
          }
        }
      } else {

        let group = cubeToThree(cube, cube.type === 'megaminx' ? Math.sqrt(7) / 2 : 1);

        scene.add(group);

        renderer.render(scene, camera);

        let res = renderer.domElement.toDataURL();

        if ( all ) {
          buff.push( res );
        } else {
          if ( inCube ) {
            (<any> cube).img = res;
          } else {
            observer.next( res );
          }
        }

        group.visible = false;
      }

      c += 1;

    }, 20);

  });

}