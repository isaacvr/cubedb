import { Piece } from './../../classes/puzzle/Piece';
import { Vector3D, CENTER } from './../../classes/vector3d';
import { cubeToThree } from 'app/cube-drawer';
import { CubeMode } from './../../constants/constants';
import { Puzzle } from './../../classes/puzzle/puzzle';
import { PuzzleType } from './../../types';
import { Component, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { puzzleReg } from 'app/classes/puzzle/puzzleRegister';

function tToV(v1: THREE.Vector3): Vector3D {
  return new Vector3D(v1.x, v1.y, v1.z);
}

function mouseIntersection(mx: number, my: number, arr: any[], camera: THREE.PerspectiveCamera): THREE.Intersection[] {
  let mouse = new THREE.Vector2(mx, my);
  let raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  return raycaster.intersectObjects(arr);
}

function drag(piece: THREE.Intersection, ini: THREE.Vector2, fin: THREE.Vector2,
  cube: Puzzle, group: THREE.Object3D, camera: THREE.PerspectiveCamera) {
  camera.updateMatrix();
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();

  let pc = [ piece.object.parent.userData, piece.object.userData ];
  let u = pc[1].getOrientation();
  let vecs = pc[1].vecs.filter(v => v.cross(u).abs() > 1e-6 );
  let v = fin.clone().sub(ini);
  let vv = new Vector3D(v.x, v.y, 0);
 
  let faceVectors = cube.p.vectorsFromCamera(vecs, camera, u);

  let dir: number;
  let best: Vector3D;

  // console.log("FACE_VECTORS: ", faceVectors);

  faceVectors.reduce((ac, fv, p) => {
    let cr = vv.cross(fv);
    if ( cr.abs() > ac ) {
      best = vecs[p];
      dir = -Math.sign( cr.z );
      return cr.abs();
    }
    return ac;
  }, -Infinity);

  if ( !best ) {
    return null;
  }

  let animationBuffer: THREE.Geometry[][] = [];
  let userData: any[][] = [];
  let angs: number[] = [];
  let animationTimes: number[] = [];

  let toMove = cube.p.toMove(pc[0], pc[1], best);
  let groupToMove = ( Array.isArray(toMove) ) ? toMove : [ toMove ];

  let findPiece = (p: Piece, arr: Piece[]): boolean => {
    for (let i = 0, maxi = arr.length; i < maxi; i += 1) {
      if ( arr[i].equal(p) ) {
        return true;
      }
    }

    return false;
  };

  groupToMove.forEach(g => {
    let pieces: Piece[] = g.pieces;
    let subBuffer: THREE.Geometry[] = [];
    let subUserData = [];

    group.children.forEach(p => {
      let c: THREE.Mesh[] = <THREE.Mesh[]> p.children;

      if ( findPiece(<Piece> p.userData, pieces) ) {
        subUserData.push( p.userData );
        for (let i = 0, maxi = c.length; i < maxi; i += 1) {
          let gm1 = <THREE.Geometry>c[i].geometry;
          subBuffer.push( gm1 );
        }
      }
    });

    userData.push( subUserData );
    animationBuffer.push(subBuffer);
    angs.push( g.ang );
    animationTimes.push( g.animationTime );
  });

  return {
    buffer: animationBuffer,
    userData,
    u: best,
    dir,
    ang: angs,
    animationTime: animationTimes
  };

}

const ANIMATION_TIME = 300; /// Default animation time: 300ms

@Component({
  selector: 'app-iterative-puzzle',
  templateUrl: './iterative-puzzle.component.html',
  styleUrls: ['./iterative-puzzle.component.scss']
})
export class IterativePuzzleComponent implements OnDestroy {
  cube: Puzzle;
  sensitivity: number = 3e-3;
  dragging: boolean = false;
  rx: number = 0;
  ry: number = 0;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  group: THREE.Object3D;

  /// GUI
  puzzles: any[];
  selectedPuzzle: PuzzleType;
  order: number;
  hasOrder: boolean;
  GUIExpanded: boolean;

  /// Animation
  animating: boolean = false;
  timeIni: number; 
  animationTimes: number[] = [];
  from: THREE.Geometry[][];
  animBuffer: THREE.Geometry[][];
  userData: any[][];
  u: Vector3D;
  angs: number[];
  constructor() {
    this.from = [];
    this.animBuffer = [];

    this.GUIExpanded = false;
    this.selectedPuzzle = 'gear';
    this.order = 2;
    this.hasOrder = false;

    this.puzzles = [];

    for (let [key, value] of puzzleReg ) {
      if ( key != 'clock' ) {
        this.puzzles.push({
          name: value.name,
          value: key,
          order: value.order
        });
      }
    }

    let renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });

    this.renderer = renderer;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    let canvas = renderer.domElement;

    document.body.appendChild(canvas);
    canvas.style.position = 'absolute';
    canvas.style.top = '0px';
    canvas.style.left = '0px';

    let scene = new THREE.Scene();
    this.scene = scene;

    let camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 14);
    camera.position.x = 3.7640728163235093;
    camera.position.y = 1.865193066464847;
    camera.position.z = 3.550043754410077;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    this.resetPuzzle();

    let piece: THREE.Intersection = null;
    let ini = null;
    let iniM = null;
    
    let downHandler = (event) => {
      if ( event.preventDefault ) {
        event.preventDefault();
      }

      if ( this.animating ) {
        controls.enabled = false;
        return;
      }

      this.dragging = true;

      ini = new THREE.Vector2(event.clientX, event.clientY);
      iniM = new THREE.Vector3(
        ( event.clientX / window.innerWidth ) * 2 - 1,
        -( event.clientY / window.innerHeight ) * 2 + 1
      );

      let allStickers = []
      
      this.group.children.forEach(c => {
        allStickers.push(...c.children);
      });

      let intersects = mouseIntersection(iniM.x, iniM.y, allStickers, camera);
      
      piece = null;

      if ( intersects.length > 0 ) {
        if ( (<any>intersects[0].object).material.color.getHex() ) {
          piece = intersects[0];
        }
        controls.enabled = false;
      }

    };

    let upHandler = () => {
      this.dragging = false;
      controls.enabled = true;
    };

    let moveHandler = (event) => {
      if ( event.preventDefault ) {
        event.preventDefault();
      }

      if ( !this.dragging ) {
        return;
      }

      let fin = new THREE.Vector2(event.clientX, event.clientY);

      if ( piece && fin.clone().sub(ini).length() > 40 ) {
        let data = drag(piece, ini, fin, this.cube, this.group, camera);

        if ( data ) {
          this.animBuffer = data.buffer;
          this.userData = data.userData;
          this.u = data.u;
          this.angs = data.ang.map(a => a * data.dir);
          this.from = this.animBuffer.map(g => g.map(e => e.clone()));
          this.animationTimes = data.animationTime.map(e => e || ANIMATION_TIME);
          this.animating = true;
          this.timeIni = performance.now();
        }

        this.dragging = false;
      }
    };

    canvas.addEventListener('pointerdown', downHandler, false);
    canvas.addEventListener('pointerup', upHandler, false);
    canvas.addEventListener('pointermove', moveHandler, false);

    canvas.addEventListener('touchstart', (e) => { downHandler(e.touches[0]); }, false);
    canvas.addEventListener('touchend', upHandler, false);
    canvas.addEventListener('touchmove', (e) =>  { moveHandler(e.touches[0]); }, false);
    
    let controls = new TrackballControls(camera, canvas);
    controls.rotateSpeed = 3;
    controls.noPan = true;
    controls.minDistance = 4;
    controls.maxDistance = 8;

    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      controls.handleResize();
    });
    
    let interpolate = (data: THREE.Geometry[], from: THREE.Geometry[], ang: number, userData: Piece[]) => {
      let allStickers = userData.reduce((ac, p) => {
        let p1 = p.clone(true);

        if ( p1.hasCallback ) {
          p1.callback(p1, this.cube.p.center, this.u, ang);
        } else {
          p1.rotate(this.cube.p.center, this.u, ang, true);
        }

        ac.push( ...p1.stickers );
        return ac;
      }, []);

      for (let i = 0, maxi = data.length; i < maxi; i += 1) {
        data[i].vertices.forEach((v, p) => {
          let vec = allStickers[i].points[p];
          v.set(vec.x, vec.y, vec.z);
        });
        data[i].verticesNeedUpdate = true;
        data[i].computeBoundingBox();
        data[i].computeBoundingSphere();
      }
    };

    let animate = () => {
      
      if ( this.animating ) {
        let total = this.animBuffer.length;
        let done = this.animBuffer.map(e => false);
        let animating = 0;

        for (let i = 0; i < total; i += 1) {
          if ( done[i] ) {
            continue;
          }
          let animationTime = this.animationTimes[i];
          let alpha = (performance.now() - this.timeIni) / animationTime;
          if ( alpha > 1 ) {
            interpolate(this.animBuffer[i], this.from[i], this.angs[i], this.userData[i]);
            this.userData[i].forEach((p: Piece) => {
              if ( p.hasCallback ) {
                p.callback(p, this.cube.p.center, this.u, this.angs[i]);
              } else {
                p.rotate(this.cube.p.center, this.u, this.angs[i], true);
              }
            });
            this.userData[i].length = 0;
            this.animBuffer[i].length = 0;
            this.from[i].length = 0;
            done[i] = true;
          } else {
            animating += 1;
            interpolate(this.animBuffer[i], this.from[i], this.angs[i] * alpha, this.userData[i]);
          }
        }

        if ( animating === 0 ) {
          this.animating = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame( animate );
    }

    animate();

  }

  ngOnDestroy() {
    this.renderer.domElement.remove();
    this.renderer.dispose();
  }

  /// GUI
  setOrder() {
    this.hasOrder = this.puzzles.find(p => p.value === this.selectedPuzzle).order;
  }

  resetPuzzle() {
    let children = this.scene.children;
    this.scene.remove( ...children );
    
    this.cube = new Puzzle({
      type: this.selectedPuzzle,
      view: 'trans',
      order: [ this.order, this.order, this.order ],
      mode: CubeMode.NORMAL
    });

    this.group = cubeToThree(this.cube);

    this.scene.add(this.group);

    this.group.rotation.x = 0;
    this.group.rotation.y = 0;
    this.group.rotation.z = 0;
  }

  hideGUI() {
    this.GUIExpanded = false;
  }

  showGUI() {
    this.GUIExpanded = true;
  }

}
