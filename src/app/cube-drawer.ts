import { Observable, Observer } from 'rxjs';
import { Puzzle } from './classes/puzzle/puzzle';
import * as THREE from 'three';

export function generateCubeBundle(cubes: Puzzle[], width ?: number): Observable< string > {
  return new Observable((observer: Observer<string>) => {

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

    let itv = setInterval(() => {
      if ( c >= maxc ) {
        clearInterval(itv);
        renderer.dispose();
        observer.complete();
        return;
      }

      let cube = cubes[c];
      let stickers = cube.getAllStickers();
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

      scene.add(group);

      group.rotation.x = cube.rotation.x;
      group.rotation.y = cube.rotation.y;
      group.rotation.z = cube.rotation.z;

      renderer.render(scene, camera);

      observer.next( renderer.domElement.toDataURL() );      

      group.visible = false;

      c += 1;

    }, 50);

  });

}