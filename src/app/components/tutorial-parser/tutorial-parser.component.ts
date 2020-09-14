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
    let sheet = `
      [$title,2x2x2 Beginner's tutorial]
      [$text, This is an example text]

      [$cubes, (rubik, 2, NORMAL, trans, [1, 1, 2, 0], "R U D B F'"), ($, "R U'", []), (rubik, 2, NORMAL, trans, [], "")]
    `;

    this.title = '';
    this.blocks = [];

    this.init(sheet);

    // let cube = new Puzzle({
    //   type: 'rubik',
    //   order: [2],
    //   mode: CubeMode.NORMAL,
    //   view: 'trans'
    // });

    // cube.move("R U R' U'");

    // let cube1 = cube.clone();

    // this.blocks.push({
    //   type: 'cubes',
    //   cubes: [ cube, cube1 ],
    //   imgs: [ LOADING_IMG, LOADING_IMG ],
    // });

    // let idx = 0;

    // let sub = generateCubeBundle([cube, cube1]).subscribe({
    //   next: (str) => {
    //     this.blocks[0].imgs[idx] = str;
    //     idx += 1;
    //   },
    //   complete: () => {
    //     sub.unsubscribe();
    //   }
    // })

  }

  init(sheet: string) {
    let res = this.parse(sheet);

    if ( res[0] ) {
      console.log('ERROR: ', res[0]);
    } else {
      let content = res[1];
      let t = (<BlockType[]> content).filter(b => b.type === 'title');

      if ( t.length === 0 ) {
        this.title = this.router.url.split('/').pop();
      } else {
        this.title = t[0].content;
      }

      this.blocks = (<BlockType[]> content).filter(b => b.type != 'title');

      let allCubes: Puzzle[] = [];
      let pos = [];
      
      for (let i = 0, maxi = this.blocks.length; i < maxi; i += 1) {
        if ( this.blocks[i].type === 'cubes' ) {
          for (let j = 0, maxj = this.blocks[i].cubes.length; j < maxj; j += 1) {
            allCubes.push( this.blocks[i].cubes[j] );
            pos.push([i, j]);
          }
        }
      }

      let p = 0;

      let subs = generateCubeBundle(allCubes, 150).subscribe({
        next: (str) => {
          let coords = pos[p];
          this.blocks[ coords[0] ].imgs[ coords[1] ] = str;
          p += 1;
        },
        complete: () => {
          subs.unsubscribe();
        }
      });

    }
    console.log("PARSED: ", res);
  }

  parse(sheet: string) {
    const cubeShort = /^\((\$), (\".*\"), (\[.*?\])\)$/;
    const shortRepl = "$1 | $2 | $3";

    const cubeLong = /^\((.*?), (.*?), (.*?), (.*?), (\[.*?\]), (\".*\")\)$/;
    const longRepl = "$1 | $2 | $3 | $4 | $5 | $6";
    
    let lines = sheet.split('\n');
    let res: BlockType[] = [];

    let errorFunc = (msg: string) => { return [ { message: msg }, [] ]; };

    for (let i = 0, maxi = lines.length; i < maxi; i += 1) {
      let line = lines[i].trim();
      
      if ( line === '' ) {
        continue;
      }

      if ( line.match(/^\[\$title/) ) {
        let title = line.substr(8, line.length - 9).trim();

        res.push({
          type: "title",
          content: title,
        });

        console.log("TITLE: ", title);

      } else if ( line.match(/^\[\$text/) ) {
        let text = line.substr(7, line.length - 8).trim();

        res.push({
          type: "text",
          content: text,
        });

        console.log("TEXT: ", text);

      } else if ( line.match(/^\[\$cubes/) ) {
        
        let cubesStr = line.match(/\(.*?\)/g);

        let cubeBundle: BlockType = {
          type: "cubes",
          cubes: [],
          imgs: [],
        };

        let cubes = cubeBundle.cubes;
        let imgs = cubeBundle.imgs;

        for (let j = 0, maxj = cubesStr.length; j < maxj; j += 1) {
          if ( cubeShort.test(cubesStr[j]) ) {
            let args = cubesStr[j].replace(cubeShort, shortRepl).split('|').map(e => e.trim());

            if ( cubes.length === 0 ) {
              return errorFunc("Cube reference to null at line " + i);
            }

            console.log("CUBES: ", cubes.slice(0, cubes.length ));

            let newCube = cubes[ cubes.length - 1 ].clone();
            let error = false;

            try {
              console.log('MOVING: ', args[1].replace(/\"/g, ''));
              console.log('TIPS: ', JSON.parse(args[2]));
              newCube.move(args[1].replace(/\"/g, ''));
              newCube.setTips(JSON.parse(args[2]));
            } catch(e) {
              error = true;
            }

            if ( error ) {
              return errorFunc(`Cube tips parse error at line ${i}.`);
            }

            cubes.push(newCube);
            imgs.push(LOADING_IMG);

          } else if ( cubeLong.test(cubesStr[j]) ) {
            let args = cubesStr[j].replace(cubeLong, longRepl).split('|').map(e => e.trim());
            let type = args[0];
            let order: any = args[1];
            let mode = args[2];
            let view = args[3];
            let tips = args[4];
            let scramble = args[5];

            let commonErr = `Cube parse error at line ${i}`;

            if ( PuzzleTypeStr.indexOf( type ) < 0 ) {
              return errorFunc(`${commonErr}. "${type}" is not a puzzle.`);
            }

            if ( isNaN( parseInt(order) ) ) {
              return errorFunc(`${commonErr}. "${order}" should be a number.`);
            } else {
              order = parseInt(order);
            }

            if ( !CubeMode.hasOwnProperty(mode) ) {
              return errorFunc(`${commonErr}. "${mode}" should be a valid CubeMode.`);
            }

            if ( [ "plan", "trans" ].indexOf(view) < 0 ) {
              return errorFunc(`${commonErr}. "${view}" must be "plan" or "trans".`);
            }

            let error = false;
            let cb: Puzzle;

            try {
              cb = Puzzle.fromSequence(scramble.replace(/\"/g, ''), {
                type: <PuzzleType> type,
                mode: CubeMode[mode],
                order: order,
                tips: JSON.parse(tips),
                view: <CubeView> view,
              });
            } catch(e) {
              error = true;
            }

            if ( error ) {
              return errorFunc(`Cube tips parse error at line ${i}.`);
            }

            cubes.push(cb);
            imgs.push(LOADING_IMG);
            console.log('CubeLong\n', args);

          } else {
            return errorFunc(`Cube parse error at line ${i}. UNKNOWN_ERROR.`);
          }
        }

        res.push(cubeBundle);

      }
    }

    return [null, res];

  }

}
