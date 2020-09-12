import { CubeView } from '../../types';
import { Component, AfterViewInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Puzzle } from '../../classes/puzzle/puzzle';
import * as THREE from 'three';
import { LOADING_IMG } from '../../constants/constants';

@Component({
  selector: 'app-puzzle',
  templateUrl: './puzzle.component.html',
  styleUrls: ['./puzzle.component.scss']
})
export class PuzzleComponent implements AfterViewInit {
  @Input('cube') puzzle: Puzzle;
  @Input('view') view: CubeView;

  @ViewChild('img') img: ElementRef<HTMLImageElement>;

  notReady: boolean;
  loadingImg: string;
  // renderer: THREE.WebGLRenderer;
  // scene: THREE.Scene;
  // camera: THREE.Camera;

  constructor(private hostElement: ElementRef) {
    this.puzzle = null;
    this.img = null;
    this.notReady = true;
    this.loadingImg = LOADING_IMG;

  }

  ngAfterViewInit() {
    
    // this.img.nativeElement.appendChild( this.renderer.domElement );

    if ( this.puzzle ) {
      setTimeout(() => {
        this.generateCubeThree(this.puzzle);
      }, 0);
    }
  }

  ngOnChanges() { 
    if ( this.puzzle && this.img ) {
      setTimeout(() => {
        this.generateCubeThree(this.puzzle);
      }, 0);
    }
  }

  generateCubeThree(cube: Puzzle) {
    const W = 200;

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
    
    let elem = renderer.domElement;
    elem.style.width = '100%';
    elem.style.height = '100%';

    let stickers = cube.getAllStickers();

    // console.time('stickers');
    let group = new THREE.Object3D();

    for (let s = 0, maxs = stickers.length; s < maxs; s += 1) {
      let sticker = stickers[s];
      let color = cube.getHexColor( sticker.color );
      let stickerGeometry = new THREE.BufferGeometry();

      let stickerMaterial = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide
      });

      let len = sticker.points.length;

      let pointsBuffer:any = sticker.points.reduce((ac, e) => {
        ac.push(e.x, e.y, e.z);
        return ac;
      }, []);

      pointsBuffer.push(pointsBuffer[0], pointsBuffer[1], pointsBuffer[2]);
      let points1 = new Float32Array(pointsBuffer);

      let points = [];
      
      let colors = [];
      // let faces = [];

      colors.push(0, 0, 0);
      colors.push(0, 0, 0);
      for (let i = 0; i <= len; i += 1) {
        colors.push(0, 0, 0);

        if ( i >= 2 && i < len ) {
          let i1 = 0;
          let i2 = i - 1;
          let i3 = (i === len) ? 0 : i;
          points.push( pointsBuffer[i1 * 3], pointsBuffer[i1 * 3 + 1], pointsBuffer[i1 * 3 + 2] );
          points.push( pointsBuffer[i2 * 3], pointsBuffer[i2 * 3 + 1], pointsBuffer[i2 * 3 + 2] );
          points.push( pointsBuffer[i3 * 3], pointsBuffer[i3 * 3 + 1], pointsBuffer[i3 * 3 + 2] );
        }
      }
      
      stickerGeometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));

      let box = new THREE.Mesh(stickerGeometry, stickerMaterial);
      let lineGeometry = new THREE.BufferGeometry();

      lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(points1, 3));
      lineGeometry.setAttribute("colors", new THREE.Float32BufferAttribute(colors, 3));
      
      let lineMaterial = new THREE.LineBasicMaterial({
        color: THREE.VertexColors
      });
      
      let line = new THREE.Line(lineGeometry, lineMaterial);

      group.add(box, line);
      
    }

    // console.timeEnd('stickers');

    scene.add(group);

    group.rotation.x = this.puzzle.rotation.x;
    group.rotation.y = this.puzzle.rotation.y;
    group.rotation.z = this.puzzle.rotation.z;

    // let render = () => {
    //   requestAnimationFrame(render);
    // console.time('render');
    renderer.render(scene, camera);
    // console.timeEnd('render');
      // group.rotation.x += 0.001;
      // group.rotation.y += 0.002;
      // group.rotation.z += 0.003;
    // this.img.nativeElement.src = this.renderer.domElement.toDataURL();
    // this.img.nativeElement.innerHTML = '';
    this.img.nativeElement.src = renderer.domElement.toDataURL();
    // renderer.dispose();
    // }

    // if ( this.notReady ) {
    //   this.hostElement.nativeElement.appendChild( renderer.domElement );
    // }

    // render();

    // console.time('toDataURL');
    this.notReady = false;
    // console.timeEnd('toDataURL');

  }

}
