import { Piece } from './../../classes/puzzle/Piece';
import { Vector3D, CENTER } from './../../classes/vector3d';
import { cubeToThree } from 'app/cube-drawer';
import { CubeMode } from './../../constants/constants';
import { Puzzle } from './../../classes/puzzle/puzzle';
import { Component } from '@angular/core';
import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';

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
  let vecs = pc[1].vecs.filter(v => v.cross( pc[1].getOrientation() ).abs() > 1e-6 );
  let v = fin.clone().sub(ini);
  let vv = new Vector3D(v.x, v.y, 0);
 
  let faceVectors = cube.p.vectorsFromCamera(vecs, camera);

  let dir;
  let best;

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

  // console.log("BEST_DIR: ", best, dir);

  let animationBuffer: THREE.Geometry[] = [];
  let userData: any[] = [];

  let toMove = cube.p.toMove(pc[0], pc[1], best);
  let piecesToMove: Piece[] = toMove.pieces;

  // console.log('TOMOVE: ', toMove);

  let findPiece = (p: Piece): boolean => {
    for (let i = 0, maxi = piecesToMove.length; i < maxi; i += 1) {
      if ( piecesToMove[i].equal(p) ) {
        return true;
      }
    }

    return false;
  };

  group.children.forEach(p => {
    let c: THREE.Mesh[] = <THREE.Mesh[]> p.children;

    if ( findPiece(<Piece> p.userData) ) {
      userData.push( p.userData );
      for (let i = 0, maxi = c.length; i < maxi; i += 1) {
        let gm1 = <THREE.Geometry>c[i].geometry;
        animationBuffer.push( gm1 );
      }
    }
  });

  return {
    buffer: animationBuffer,
    userData,
    u: best,
    dir,
    ang: toMove.ang
  };

}

@Component({
  selector: 'app-iterative-puzzle',
  templateUrl: './iterative-puzzle.component.html',
  styleUrls: ['./iterative-puzzle.component.scss']
})
export class IterativePuzzleComponent {
  cube: Puzzle;
  sensitivity: number = 3e-3;
  dragging: boolean = false;
  rx: number = 0;
  ry: number = 0;

  /// Animation
  animating: boolean = false;
  timeIni: number; 
  animationTime: number = 300;
  from: THREE.Geometry[];
  animBuffer: THREE.Geometry[];
  userData: any[];
  u: Vector3D;
  ang: number;
  constructor() {
    this.from = [];
    this.animBuffer = [];

    this.cube = new Puzzle({
      type: 'square1',
      view: 'trans',
      order: [3],
      mode: CubeMode.NORMAL
    });

    let renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    let canvas = renderer.domElement;
    document.body.appendChild(canvas);

    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 2, 8);
    camera.position.x = 3.7640728163235093;
    camera.position.y = 1.865193066464847;
    camera.position.z = 3.550043754410077;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    let group = cubeToThree(this.cube);

    scene.add(group);

    group.rotation.x = 0;
    group.rotation.y = 0;
    group.rotation.z = 0;

    let piece: THREE.Intersection = null;
    let ini = null;
    let iniM = null;
    
    let downHandler = (event) => {
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
      
      group.children.forEach(c => {
        allStickers.push(...c.children);
      });

      let intersects = mouseIntersection(iniM.x, iniM.y, allStickers, camera);
      
      piece = null;

      if ( intersects.length > 0 ) {
        if ( (<any>intersects[0].object).material.color.getHex() ) {
          piece = intersects[0];
          // console.log('INTERSECTION: ', piece);
        }
        controls.enabled = false;
      }

    };

    let upHandler = () => {
      this.dragging = false;
      controls.enabled = true;
    };

    let moveHandler = (event) => {
      
      if ( !this.dragging ) {
        return;
      }

      let fin = new THREE.Vector2(event.clientX, event.clientY);

      if ( piece && fin.clone().sub(ini).length() > 40 ) {
        let data = drag(piece, ini, fin, this.cube, group, camera);

        if ( data ) {
          this.animBuffer = data.buffer;
          this.userData = data.userData;
          this.u = data.u;
          this.ang = data.dir * data.ang;
          this.from = this.animBuffer.map(g => g.clone());
          this.animating = true;
          this.timeIni = performance.now();
          this.dragging = false;
        }
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
    controls.maxDistance = 6;

    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      controls.handleResize();
    });
    
    let interpolate = (data: THREE.Geometry[], from: THREE.Geometry[], ang: number, alpha: number) => {
      for (let i = 0, maxi = data.length; i < maxi; i += 1) {
        data[i].vertices.forEach((v, p) => {
          let vec = tToV(from[i].vertices[p]).rotate(CENTER, this.u, ang);
          v.set(vec.x, vec.y, vec.z);
        });
        data[i].verticesNeedUpdate = true;
        data[i].computeBoundingBox();
        data[i].computeBoundingSphere();
      }
    };

    let animate = () => {
      requestAnimationFrame( animate );
      
      if ( this.animating ) {
        let alpha = (performance.now() - this.timeIni) / this.animationTime;
        if ( alpha > 1 ) {
          this.animating = false;
          interpolate(this.animBuffer, this.from, this.ang, 1);
          this.userData.forEach((p: Piece) => {
            p.rotate(CENTER, this.u, this.ang, true);
          });
          this.animBuffer.length = 0;
          this.from.length = 0;
        } else {
          interpolate(this.animBuffer, this.from, this.ang * alpha, alpha);
        }
      }

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

  }

}
