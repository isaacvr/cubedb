import { Subscription } from 'rxjs';
import { DataService } from './../../services/data.service';
import { generateCubeBundle } from 'app/cube-drawer';
import { Router } from '@angular/router';
import { CubeMode } from './../../constants/constants';
import { Puzzle } from './../../classes/puzzle/puzzle';
import { Component, OnDestroy } from '@angular/core';

declare type CubeType = Puzzle | { type: 'arrow', text: string } | { tp: 'arrow', tx: string };

interface BlockType {
  type: "title" | "text" | "cubes";
  content ?: string;
  cubes?: CubeType[];
}

@Component({
  selector: 'app-tutorial-parser',
  templateUrl: './tutorial-parser.component.html',
  styleUrls: ['./tutorial-parser.component.scss']
})
export class TutorialParserComponent implements OnDestroy {
  title: string;
  blocks: BlockType[];
  _id: string;
  sub: Subscription;
  constructor(private dataService: DataService, private router: Router) {

    this.title = '';
    this.blocks = [];

    let url = decodeURIComponent( this.router.url );
    this.title = url.split('?')[0].split('/').pop();
    this._id = url.split("=")[1];
    
    this.sub = this.dataService.tutSub.subscribe({
      next: (list) => {
        let current = list.find(t => t._id == this._id);
        if ( current ) {
          this.init( current.content );
        }
      }
    });
    
    this.dataService.getTutorials();

  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  init(sheet: any) {
    // let arr = <any[]>JSON.parse(sheet);
    let arr = sheet;

    this.blocks = [];
    let pos = [];
    let allCubes: Puzzle[] = [];

    for (let i = 0, l = 0, maxi = arr.length; i < maxi; i += 1) {
      switch( (arr[i].type || arr[i].t ) ) {
        case "tl":
        case "title": {
          this.title = (arr[i].content || arr[i].c);
          break;
        }
        case "s":
        case "tx":
        case "subtitle":
        case "text": {
          this.blocks.push({
            type: (arr[i].type || arr[i].t),
            content: (arr[i].content || arr[i].c),
            cubes: []
          });
          l += 1;
          break;
        }
        case "c":
        case "cubes": {
          let cubes: CubeType[] = [];
          let content = arr[i].content || arr[i].c;
          for (let j = 0, maxj = content.length; j < maxj; j += 1) {
            let cnt = content[j];
            switch( (cnt.type || cnt.t ) ) {
              case '$': {
                if ( allCubes.length > 0 ) {
                  let lastCube = allCubes[ allCubes.length - 1 ];
                  let newMode: CubeMode = cnt.mode ? CubeMode[ (<string> cnt.mode) ] : lastCube.mode;
                  let cp = lastCube.clone(newMode);
                  cp.move(cnt.scramble);
                  cp.p.rotation = cnt.rotation || cp.p.rotation;
                  cp.rotation = cp.p.rotation;
                  cubes.push(cp);
                  allCubes.push(cp);
                  pos.push([l, j]);
                }
                break;
              }
              case 'arrow': {
                cubes.push({
                  type: 'arrow',
                  text: (cnt.text || cnt.tt),
                });
                break;
              }
              default: {
                let p = Puzzle.fromSequence((cnt.scramble || cnt.s), {
                  type: (cnt.type || cnt.t),
                  order: [cnt.order],
                  mode: CubeMode[ <string> cnt.mode ],
                  tips: cnt.tips || [],
                  view: cnt.view,
                });
                p.rotation = cnt.rotation || cnt.r || p.rotation;
                cubes.push(p);
                allCubes.push(p);
                pos.push([l, j]);
              }
            }
          }

          this.blocks.push({
            type: 'cubes',
            cubes,
          });
          l += 1;
          break;
        }
      }
    }

    let subs = generateCubeBundle(allCubes, 150, false, true).subscribe({
      complete: () => { subs.unsubscribe(); }
    });
  }
}
