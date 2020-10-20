import { generateCubeBundle } from 'app/cube-drawer';
import { Router } from '@angular/router';
import { CubeMode, LOADING_IMG } from './../../constants/constants';
import { PuzzleTypeStr, PuzzleType, CubeView } from './../../types/index';
import { Puzzle } from './../../classes/puzzle/puzzle';
import { Component } from '@angular/core';

interface BlockType {
  type: "title" | "text" | "cubes";
  content ?: string;
  cubes?: Puzzle[];
  imgs?: string[];
}

@Component({
  selector: 'app-tutorial-parser',
  templateUrl: './tutorial-parser.component.html',
  styleUrls: ['./tutorial-parser.component.scss']
})
export class TutorialParserComponent {
  title: string;
  blocks: BlockType[];

  constructor(private router: Router) {
    let sheet = `[{"type":"title","content":"2x2x2 Beginner's tutorial"},{"type":"text","content":"This is an example test"},{"type":"cubes","content":[{"type":"rubik","order":2,"mode":"NORMAL","view":"trans","tips":[1,1,2,0],"scramble":"R U D B F'"},{"type":"$","scramble":"R U'","tips":[]},{"type":"rubik","order":2,"mode":"NORMAL","view":"trans","tips":[],"scramble":""}]}]`;

    this.title = '';
    this.blocks = [];

    this.init(sheet);

  }


  init(sheet: string) {
    let arr = <any[]>JSON.parse(sheet);
    this.title = this.router.url.split('/').pop();

    this.blocks = [];
    let pos = [];
    let allCubes: Puzzle[] = [];

    for (let i = 0, l = 0, maxi = arr.length; i < maxi; i += 1) {
      switch( arr[i].type ) {
        case "title": {
          this.title = arr[i].content;
          break;
        }
        case "text": {
          this.blocks.push({
            type: 'text',
            content: arr[i].content,
            cubes: [],
            imgs: []
          });
          l += 1;
          break;
        }
        case "cubes": {
          let cubes: Puzzle[] = [];

          for (let j = 0, maxj = arr[i].content.length; j < maxj; j += 1) {
            let cnt = arr[i].content[j];
            switch( cnt.type ) {
              case '$': {
                if ( cubes.length > 0 ) {
                  let cp = cubes[ cubes.length - 1 ].clone();
                  cp.move(cnt.scramble);
                  cubes.push(cp);
                  allCubes.push(cp);
                  pos.push([l, j]);
                }
                break;
              }
              case 'arrow': {
                break;
              }
              default: {
                let p = Puzzle.fromSequence(cnt.scramble, {
                  type: cnt.type,
                  order: [cnt.order],
                  mode: CubeMode[ <string> cnt.mode ],
                  tips: cnt.tips,
                  view: cnt.view
                });
                cubes.push(p);
                allCubes.push(p);
                pos.push([l, j]);
              }
            }
          }

          this.blocks.push({
            type: 'cubes',
            cubes: cubes,
            imgs: [],
          });
          l += 1;
          break;
        }
      }
    }

    let subs = generateCubeBundle(allCubes, 150, true).subscribe({
      next: (str: string[]) => {
        for (let i = 0, maxi = str.length; i < maxi; i += 1) {
          let p = pos[i];
          this.blocks[ p[0] ].imgs[ p[1] ] = str[i];
        }
      },
      complete: () => {
        subs.unsubscribe();
      }
    });
  }
}
