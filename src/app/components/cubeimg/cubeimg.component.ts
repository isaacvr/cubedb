import { CubeMode } from '../../constants/constants';
import { Cube } from '../../classes/cube';
import { Component, ViewChild, ElementRef, Input, AfterViewInit, OnChanges } from '@angular/core';
import { Vector2D } from '../../classes/vector2-d';

@Component({
  selector: 'app-cubeimg',
  templateUrl: './cubeimg.component.html',
  styleUrls: ['./cubeimg.component.scss']
})
export class CubeimgComponent implements AfterViewInit, OnChanges {
  @Input('cube') cube: Cube;
  @Input('mode') mode: CubeMode;
  @Input('view') view: 'trans' | 'plan';
  @Input('arrows') arrows: number[];

  @ViewChild('img') canvas: ElementRef<HTMLCanvasElement>;

  FLU: Vector2D;
  RBU: Vector2D;
  LBU: Vector2D;
  FRD: Vector2D;
  FLD: Vector2D;
  RBD: Vector2D;
  colors;

  constructor() {
    this.FLU = new Vector2D(-89, -49);
    this.RBU = new Vector2D(90, -49);
    this.LBU = new Vector2D(0, -89);
    this.FRD = new Vector2D(0, 106);
    this.FLD = new Vector2D(-81, 51);
    this.RBD = new Vector2D(82, 51);
    this.colors = {
      F: 'rgb(42, 196, 75)',
      L: 'rgb(240, 48, 49)',
      B: 'rgb(53, 94, 229)',
      R: 'rgb(247, 120, 36)',
      U: 'rgb(255, 255, 37)',
      D: 'rgb(230, 230, 230)',
      G: 'rgb(64, 64, 64)',
    };
    this.cube = new Cube(3);
    this.mode = CubeMode.NORMAL;
    this.view = 'trans';
    this.arrows = [];
  }

  ngAfterViewInit() {
    if ( this.cube && this.canvas ) {
      this.generateCube(this.cube, +this.mode, this.arrows || [], this.view);
    }
  }

  ngOnChanges() {
    if ( this.cube && this.canvas ) {
      this.generateCube(this.cube, +this.mode, this.arrows || [], this.view);
    }
  }

  drawPath(ctx: CanvasRenderingContext2D, path: Vector2D[], options?) {
    let opt = options || { fill: ctx.fillStyle, stroke: ctx.strokeStyle };

    ctx.fillStyle = opt.fill;
    ctx.strokeStyle = opt.stroke;

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1, maxi = path.length; i < maxi; i += 1) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.fill();
    ctx.stroke();
  }

  drawLine(ctx: CanvasRenderingContext2D, from: Vector2D, to: Vector2D) {
    this.drawPath(ctx, [from, to]);
  }

  intersection(p1: Vector2D, p2: Vector2D, p3: Vector2D, p4: Vector2D): Vector2D {
    let v1 = p2.sub(p1);
    let v2 = p4.sub(p3);

    let D = v2.x * v1.y - v1.x * v2.y;
    let D1 = v2.x * ( p3.y - p1.y ) - ( p3.x - p1.x ) * v2.y;

    let t1 = D1 / D;

    return p1.add( v1.mul(t1) );

  }

  isCenter(order: number, c: number[]): boolean {
    let m = ~~( order / 2 );
    let cant = 0;

    for (let i = 0; i < 3; i += 1) {
      if ( c[i] === m ) {
        cant += 1;
      }
    }

    return cant === 2;
  }
  
  isCorner(order: number, c: number[]): boolean {
    for (let i = 0; i < 3; i += 1) {
      if ( c[i] != order - 1 && c[i] != 0 ) {
        return false;
      }
    }
    return true;
  }

  isEdge(order: number, c: number[]): boolean {
    return !this.isCenter(order, c) && !this.isCorner(order, c);
  }

  getColor(cube: Cube, face: string, x: number, y: number, mode: CubeMode): string {
    let layers = [ 'U', 'R', 'F', 'D', 'L', 'B' ];
    let id = layers.indexOf(face);
    let str = cube.asString().match(new RegExp(`.{1,${ cube.order ** 2 }}`, 'g'));
    let order = cube.order;
    let orderm1 = order - 1;

    let pos = () => x * cube.order + y;
    let getCoords = () => {
      if (face === 'U') {
        return [ y, 0, x ];
      } else if (face === 'F') {
        return [ y, x, orderm1 ];
      } else if ( face === 'R' ) {
        return [ orderm1, x, orderm1 - y ];
      } else if ( face === 'D' ) {
        return [ y, orderm1, orderm1 - x ];
      } else if ( face === 'L' ) {
        return [ 0, x, y ];
      } else { /// B
        return [ orderm1 - y, x, 0];
      }
    };

    switch(mode) {
      case CubeMode.NORMAL:
      case CubeMode.ELL:
      case CubeMode.ZBLL:
      case CubeMode.PLL: {
        return this.colors[ str[id][ pos() ] ];
      }
      case CubeMode.OLL: {
        return (str[id][ pos() ] === 'U') ? this.colors.U : this.colors.G;
      }
      case CubeMode.F2L: {
        let c = getCoords();
        if ( cube.a[ c[0] ][ c[1] ][ c[2] ].contains( cube.getColor('U') ) ) {
          return this.colors.G;
        }
        return this.colors[ str[id][ pos() ] ];
      }
      case CubeMode.CMLL: {
        let c = getCoords();
        if ( c[1] === 0 ) {
          if ( c[0] === 1 || c[2] === 1 ) {
            return this.colors.G;
          }
        }
        return this.colors[ str[id][ pos() ] ];
      }
      case CubeMode.OLLCP: {
        let c = getCoords();
        if ( c[1] === 0 ) {
          if ( c[0] === 1 || c[2] === 1 ) {
            if ( cube.a[ c[0] ][ c[1] ][ c[2] ].contains( cube.getColor('U') ) ) {            
              if ( cube.a[ c[0] ][ c[1] ][ c[2] ].getColor(face) === cube.getColor('U') ) {
                return this.colors.U;
              }
              return this.colors.G;
            }
          }
        }
        return this.colors[ str[id][ pos() ] ];
      }
      case CubeMode.COLL: {
        let c = getCoords();
        
        if ( c[1] === 0 ) {
          if ( c[0] === 1 || c[2] === 1 ) {
            if ( "LFRB".indexOf(face) > -1 ) {
              return this.colors.G;
            }
          }
        }

        return this.colors[ str[id][ pos() ] ];
      }
      case CubeMode.VLS:
      case CubeMode.WV: {
        let c = getCoords();
        if ( cube.a[ c[0] ][ c[1] ][ c[2] ].contains( cube.getColor('U') ) ) {
          if ( cube.a[ c[0] ][ c[1] ][ c[2] ].getColor(face) === cube.getColor('U') ) {
            return this.colors.U;
          }
          return this.colors.G;
        }
        return this.colors[ str[id][ pos() ] ];
      }
      case CubeMode.GRAY: {
        return this.colors.G;
      }
      case CubeMode.CENTERS: {
        let c = getCoords();

        if ( this.isCenter(cube.order, c) ) {
          return this.colors[ face ];
        }
        return this.colors.G;
      }
      case CubeMode.CROSS: {
        let c = getCoords();

        if ( this.isCenter(cube.order, c) ) {
          return this.colors[ face ];
        }

        if ( this.isEdge(cube.order, c) &&
            cube.a[ c[0] ][ c[1] ][ c[2] ].contains( cube.getColor('D') ) ) {
          return this.colors[ str[id][ pos() ] ];
        }

        return this.colors.G;
      }
      default: {
        return this.colors[ str[id][ pos() ] ];
      }
    }
  }

  drawFace(ctx: CanvasRenderingContext2D,
    p1: Vector2D, p2: Vector2D, p3: Vector2D, p4: Vector2D,
    cube: Cube, layer: string, mode: CubeMode) {

    let n = cube.order;

    let px1 = [];
    let px2 = [];
    let py1 = [];
    let py2 = [];

    for (let i = 0; i <= n; i += 1) {
      px1.push(p1.add( p2.sub(p1).mul(i / n) ));
      px2.push(p4.add( p3.sub(p4).mul(i / n) ));

      py1.push(p1.add( p4.sub(p1).mul(i / n) ));
      py2.push(p2.add( p3.sub(p2).mul(i / n) ));
    }

    let grid = [];

    for (let i = 0; i <= n; i += 1) {
      let col = [];
      for (let j = 0; j <= n; j += 1) {
        col.push( this.intersection(px1[i], px2[i], py1[j], py2[j]) );
      }
      col = col.map(e => new Vector2D(e.x, e.y));
      grid.push(col);
    }

    // let c = 0;

    for (let j = 0; j < n; j += 1) {
      for (let i = 0; i < n; i += 1) {
        this.drawPath(ctx, [
          grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1], grid[i][j]
        ], {
          fill: this.getColor(cube, layer, j, i, mode),
          stroke: 'black'
        });
      }
    }

  }

  generateCube(cube: Cube, mode ?: CubeMode, arrows ?: number[], view?: 'trans' | 'plan'): string {

    if ( view ) {
      switch( view ) {
        case 'trans': {
          return this.frontalView(cube, mode);
        }
        case 'plan': {
          return this.superiorView(cube, mode, arrows);
        }
      }
    }

    switch(mode) {
      case CubeMode.CMLL:
      case CubeMode.COLL:
      case CubeMode.ELL:
      case CubeMode.OLLCP:
      case CubeMode.VLS:
      case CubeMode.ZBLL:
      case CubeMode.PLL: {
        return this.superiorView(cube, mode, arrows);
      }
      default: {
        return this.frontalView(cube, mode);
      }
    }

  }

  superiorView(cube: Cube, mode ?: CubeMode, arrows ?: number[]): string {
    let dims = 300;
    let canvas = this.canvas.nativeElement;
    
    canvas.width = dims;
    canvas.height = dims;

    const ctx = canvas.getContext('2d');
    
    const LW = 5;

    /// Context Styles
    ctx.strokeStyle = 'black';
    ctx.lineWidth = LW;
    ctx.lineJoin = 'bevel';

    let mSticker = (dims - LW * 2) / (cube.order + 1) / 2 + LW;

    let vecs = [
      new Vector2D(mSticker, mSticker),
      new Vector2D(dims - mSticker, mSticker),
      new Vector2D(dims - mSticker, dims - mSticker),
      new Vector2D(mSticker, dims - mSticker),
      new Vector2D(mSticker, mSticker),
    ];

    let sideLayers = [ 'B', 'R', 'F', 'L' ];

    this.drawFace(ctx, vecs[0], vecs[1], vecs[2], vecs[3], cube, 'U', mode);

    let f = 0.04;
    let orderm1 = cube.order - 1;

    for (let v = 0, maxv = vecs.length - 1; v < maxv; v += 1) {
      let v1 = vecs[v];
      let v2 = vecs[v + 1];
      let vDir = v2.sub(v1).mul(f);
      let vd1 = v1.add( vDir ).sub( vDir.unit().rot(Math.PI / 2).mul(mSticker - LW / 2) );
      let vd2 = v2.sub( vDir ).sub( vDir.unit().rot(Math.PI / 2).mul(mSticker - LW / 2) );

      for (let i = 0; i < cube.order; i += 1) {
        let p1 = v1.add(v2.sub(v1).mul(i / cube.order));
        let p2 = v1.add(v2.sub(v1).mul((i + 1) / cube.order));
        let p3 = vd1.add(vd2.sub(vd1).mul((i + 1) / cube.order));
        let p4 = vd1.add(vd2.sub(vd1).mul(i / cube.order));

        ctx.fillStyle = this.getColor(cube, sideLayers[v], 0, orderm1 - i, mode);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y); ctx.lineTo(p1.x, p1.y); ctx.fill(); ctx.stroke();
      }
    }

    let swaps = arrows || [];

    const tipLength = 0.06 * dims;
    const tipAngle = Math.PI * 0.88;
    const elems = 5;

    for (let i = 0, maxi = (~~(swaps.length / elems) ) * elems; i < maxi; i += elems) {
      let x1 = swaps[i];
      let y1 = swaps[i + 1];
      let x2 = swaps[i + 2];
      let y2 = swaps[i + 3];
      let type = swaps[i + 4];

      if ( x1 < 0 || x1 >= cube.order ||
          y1 < 0 || y1 >= cube.order ||
          x2 < 0 || x2 >= cube.order ||
          x2 < 0 || x2 >= cube.order ) {
        continue;
      }

      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'black';

      let vi = vecs[2].sub(vecs[0]).div(cube.order);
      let vj = vecs[2].sub(vecs[0]).div(cube.order);
      let unit = vecs[2].sub(vecs[0]).div(cube.order * 2);

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

    return canvas.toDataURL();
  }

  frontalView(cube: Cube, mode ?: CubeMode): string {
    let dims = 66.6666666666 * (cube.order - 1) + 200;
    let canvas = this.canvas.nativeElement;
    
    canvas.width = dims;
    canvas.height = dims;

    const ctx = canvas.getContext('2d');
    
    /// Context Styles
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.lineJoin = 'bevel';
    /// Origin - Piece FRU

    /**
     * According to the pre-stablished coordinates above, we want the cube to be
     * centered and to cover most of the space available. For that, the reference
     * center must be in the correct spot. The X must be in the middle of the canvas
     * since the cube is symetric respect the Y-axis. The ratio between the distance
     * Y-to-top and T-to-bottom must be equal to the ratio between the distance from
     * the center to LBU and the center to FRD, which is 0.4564102564.
     */
    let O = new Vector2D( dims / 2, dims * 0.4564102564);

    /**
     * As we explained before, once the center is computed, the aspect ratio must be
     * set in order that the distance of the top (LBU) multiplied by the factor F,
     * should be equal to the Y coordinate of the Origin (distance from the top to the
     * Origin).
     */
    let f = -O.y / (this.LBU.y - ctx.lineWidth);

    /// U Face
    let path1 = [
      this.LBU, this.RBU , new Vector2D(0, 0), this.FLU //, this.LBU
    ];

    /// L Face
    let path2 = [
      this.FLU, new Vector2D(0, 0), this.FRD, this.FLD //, this.FLU
    ];

    /// R Face
    let path3 = [
      new Vector2D(0, 0), this.RBU, this.RBD, this.FRD //, new Vector2D(0, 0)
    ];

    /// Scale and center to fit in the image
    path1 = path1.map(e => e.mul(f).add(O));
    path2 = path2.map(e => e.mul(f).add(O));
    path3 = path3.map(e => e.mul(f).add(O));

    /// Draw each face
    this.drawFace(ctx, path1[0], path1[1], path1[2], path1[3], cube, 'U', mode);
    this.drawFace(ctx, path2[0], path2[1], path2[2], path2[3], cube, 'F', mode);
    this.drawFace(ctx, path3[0], path3[1], path3[2], path3[3], cube, 'R', mode);

    return canvas.toDataURL();

  }

  //*/
}