import { LEFT, UP, BACK, RIGHT, FRONT, DOWN, CENTER } from './../vector3d';
import { Vector3D } from '../../classes/vector3d';
import { PuzzleInterface } from './../../interfaces/interfaces';
import { Piece } from './Piece';
import { Sticker } from './Sticker';
import { assignColors, assignVectors, getAllStickers, roundCorners } from './puzzleUtils';
import { Vector3 } from 'three';

export function MEGAMINX(): PuzzleInterface {

  const mega: PuzzleInterface = {
    pieces: [],
    palette: {
      "white": "rgb(255, 255, 255)",
      "yellow": "rgb(255,235,59)",
      "violet": "rgb(144, 60, 154)",
      "green": "rgb(0, 109, 76)",
      "red": "rgb(229,57,53)",
      "blue": "rgb(0, 87, 196)",
      "lgreen": "rgb(74, 217, 49)",
      "gray": "rgb(150, 153, 153)",
      "orange": "rgb(255,167,38)",
      "pink": "rgb(237, 150, 161)",
      "lyellow": "rgb(220, 211, 165)",
      "lblue": "rgb(83, 177, 243)",
      "d": "rgb(0, 0, 0)",
    },
    rotation: {},
    center: new Vector3D(0, 0, 0),
    faceVectors: [],
    getAllStickers: null,
    dims: [],
    faceColors: [ "white", "yellow", "violet", "green", "red", "blue", "orange", "lblue", "lyellow", "pink", "lgreen", "gray" ],
    move: () => false
  };

  mega.getAllStickers = getAllStickers.bind(mega);
  
  const PI = Math.PI;
  const sq = Math.sqrt;
  const F_INT = sq( (50 + 22 * sq(5) ) / 5 ) / 4;
  const F_EXT = sq(6) / 4 * sq(3 + sq(5));
  const R_INT = 1;
  const SIDE = R_INT / F_INT;
  const R_EXT = SIDE * F_EXT;
  const RAD = sq( R_EXT ** 2 - R_INT ** 2 );
  const FACTOR = 0.42;
  const FACE_ANG = PI - Math.acos( Math.tan(18 * PI / 180) * Math.tan(54 * PI / 180) );
  const INNER_ANG = 2 * PI / 5;

  let anchors: Vector3D[] = [];

  for (let i = 0; i < 5; i += 1) {
    anchors.push( UP.mul(R_INT).add( BACK.mul(RAD).rotate(CENTER, UP, i * INNER_ANG) ) );
  }

  const V1: Vector3D = anchors[1].sub(anchors[0]).mul(FACTOR);
  const V2: Vector3D = anchors[4].sub(anchors[0]).mul(FACTOR);
  
  let st_corner = new Sticker([
    anchors[0],
    anchors[0].add( V1 ),
    anchors[0].add( V1.add(V2) ),
    anchors[0].add( V2 ),
  ], 'white');

  let st_edge = new Sticker([
    anchors[0].add( V1 ),
    anchors[1].sub( V1 ),
    anchors[1].sub( V1 ).add( V1.rotate(CENTER, UP, INNER_ANG) ),
    anchors[0].add( V1 ).add( V2 ),
  ], 'white');

  let corner = new Piece([
    st_corner,
    st_corner.rotate( anchors[0], UP, 3 * PI / 5 ).rotate(anchors[0], V2, FACE_ANG - PI),
    st_corner.rotate( anchors[0], UP, -3 * PI / 5 ).rotate(anchors[0], V1, PI - FACE_ANG),
  ]);

  let edge = new Piece([
    st_edge,
    st_edge
      .rotate( anchors[0].add(anchors[1]).div(2), UP, PI )
      .rotate( anchors[0].add(V1), V1, PI - FACE_ANG)
  ]);

  let st_center = new Sticker([], 'white');

  let topCorners: Piece[] = [];
  let topEdges: Piece[] = [];

  for (let i = 0; i < 5; i += 1) {
    topCorners.push( corner.rotate(CENTER, UP, i * 2 * PI / 5) );
    topEdges.push( edge.rotate(CENTER, UP, i * 2 * PI / 5) );
    st_center.points.push( topCorners[i].stickers[0].points[2] );
  }
  
  st_center.updateMassCenter();
  let center = new Piece([st_center]);

  let midEdges = [];
  let midCorners = [];
  let midCenters: Piece[] = [];

  for (let i = 0; i < 5; i += 1) {
    let refCenter = center.reflect(CENTER, anchors[i], anchors[ (i + 1) % 5 ], true);
    midCenters.push(refCenter);
  }

  midCenters.push(
    ...midCenters.map(p => p.reflect(CENTER, CENTER.add(RIGHT), CENTER.add(FRONT), true)
                            .rotate(CENTER, UP, PI / 5)
                      )
  );

  for (let i = 0, maxi = topEdges.length; i < maxi; i += 1) {
    let u = topEdges[i].stickers[1].getOrientation();
    for (let j = 1; j <= 3; j += 1) {
      midEdges.push( topEdges[i].rotate(CENTER, u, INNER_ANG * j) );
      j <= 2 && midCorners.push( topCorners[i].rotate(CENTER, u, INNER_ANG * j) );
    }
  }

  let bottomEdges = topEdges.map(p => p.rotate(CENTER, RIGHT, PI));

  for (let i = 0, maxi = bottomEdges.length; i < maxi; i += 1) {
    let u = bottomEdges[i].stickers[1].getOrientation();    
    bottomEdges.push( bottomEdges[i].rotate(CENTER, u, INNER_ANG) );
  }

  mega.pieces.push(
    ...topCorners,
    ...topCorners.map(p => p.rotate(CENTER, RIGHT, PI)),
    ...topEdges,
    ...midEdges,
    ...midCorners,
    center,
    ...midCenters,
    center.rotate(CENTER, RIGHT, PI),
    ...bottomEdges,
  );

  let pieces = mega.pieces;

  for (let i = 0, maxi = pieces.length; i < maxi; i += 1) {
    if ( pieces[i].stickers.length === 1 ) {
      mega.faceVectors.push( pieces[i].stickers[0].getOrientation() );
    }
  }

  let LDIST = Math.abs( corner.stickers[1].points[2].sub(anchors[0]).y );

  let planes = [ st_center, midCenters[1].stickers[0] ].map(s => {
    let mc = s.getMassCenter();
    return s.points.map(p => p.add( mc.unit().mul(-LDIST) ))
  });

  mega.move = function(moves: any[]) {
    for (let m = 0, maxm = moves.length; m < maxm; m += 1) {
      let mv = moves[m];
      let moveId = mv[0];
      let turns = mv[1];
      const pts1 = planes[moveId].map(e => e.clone());
      const u = Vector3D.cross(pts1[0], pts1[1], pts1[2]).unit();
      const ang = INNER_ANG * turns;
      
      for (let i = 0, maxi = pieces.length; i < maxi; i += 1) {
        let d = pieces[i].direction(pts1[0], pts1[1], pts1[2], true);

        if ( d === 0 ) {
          console.log("Invalid move. Piece intersection detected.", "URFDLB"[moveId], turns, mv);
          console.log("Piece: ", i, pieces[i], pts1);
          return false;
        }

        if ( d * mv[2] > 0 ) {
          pieces[i].stickers.map(s => s.rotate(CENTER, u, ang, true));
        }
      }
    }
    return true;
  };

  mega.vectorsFromCamera = function(vecs: any[], cam) {
    return vecs.map(e => {
      let vp = new Vector3(e.x, e.y, e.z).project(cam);
      return new Vector3D(vp.x, -vp.y, 0);
    });
  };

  mega.toMove = function(pc: Piece, st: Sticker, u: Vector3D) {
    let mc = st.getMassCenter();
    return {
      pieces: pieces.filter(p => p.direction1(mc, u) >= 0),
      ang: INNER_ANG,
    };
  };

  mega.rotation = {
    x: PI / 6,
    y: -PI / 4,
    z: 0,
  };

  assignColors(mega, mega.faceColors);
  roundCorners(mega);
  assignVectors(mega);

  mega.raw = [ anchors, FACE_ANG, FACTOR, RAD, SIDE ];

  return mega;

}