import { Subscription } from 'rxjs';
import { DataService } from './../../services/data.service';
import { generateCubeBundle } from 'app/cube-drawer';
import { Router } from '@angular/router';
import { CubeMode } from './../../constants/constants';
import { Puzzle } from './../../classes/puzzle/puzzle';
import { Component, OnDestroy } from '@angular/core';
import { BlockType, Tutorial } from 'app/interfaces/interfaces';
import { DialogComponent } from '../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CubeType } from './../../interfaces/interfaces';

@Component({
  selector: 'app-tutorial-parser',
  templateUrl: './tutorial-parser.component.html',
  styleUrls: ['./tutorial-parser.component.scss']
})
export class TutorialParserComponent implements OnDestroy {
  blocks: BlockType[];
  _id: string;
  sub: Subscription;
  tut: Tutorial;
  constructor(private dataService: DataService, private router: Router, public dialog: MatDialog) {

    this.blocks = [];

    let url = decodeURIComponent( this.router.url );
    this._id = url.split("=")[1];
    this.tut = null;
    
    this.sub = this.dataService.tutSub.subscribe({
      next: (list) => {
        let type = list[0];
        let content = <Tutorial[]>list[1];

        if ( type === 'get-tutorials' ) {
          let current = content.find(t => t._id == this._id);
          if ( current ) {
            this.tut = current;
            this.tut.content = this.tut.content || [];
            this.init( this.tut.content );
          }
        }
      }
    });
    
    this.dataService.getTutorials();

  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  init(sheet: any) {
    console.log("SHEET: ", sheet);

    this.blocks.length = 0;
    let allCubes: Puzzle[] = [];

    for (let i = 0, maxi = sheet.length; i < maxi; i += 1) {
      switch( (sheet[i].type || sheet[i].t ) ) {
        case "tl":
        case "title":
        case "s":
        case "tx":
        case "subtitle":
        case "text": {
          this.blocks.push({
            type: (sheet[i].type || sheet[i].t),
            content: (sheet[i].content || sheet[i].c).replace(/\n/g, '<br>'),
            cubes: []
          });
          break;
        }
        case "c":
        case "cubes": {
          let cubes: CubeType[] = [];
          let content = sheet[i].cubes;
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
                let p = Puzzle.fromSequence((cnt.scramble || cnt.s || ""), {
                  type: (cnt.type || cnt.t),
                  order: (Array.isArray(cnt.order)) ? cnt.order : [cnt.order],
                  mode: ( typeof cnt.mode === 'number' ) ? cnt.mode : CubeMode[ <string> cnt.mode ],
                  tips: cnt.tips || [],
                  view: cnt.view,
                });
                p.rotation = cnt.rotation || cnt.r || p.rotation;
                cubes.push(p);
                allCubes.push(p);
              }
            }
          }

          this.blocks.push({
            type: 'cubes',
            cubes,
          });
          break;
        }
      }
    }

    let subs = generateCubeBundle(allCubes, 150, false, true).subscribe({
      complete: () => { subs.unsubscribe(); }
    });
  }

  private openDialog(type: string, data: any, handler) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        type,
        data
      }
    });

    const subscr = dialogRef.afterClosed().subscribe((data) => {
      document.documentElement.style.setProperty('--panel-height', '');
      document.documentElement.style.setProperty('--panel-padding', '24px');
      subscr.unsubscribe();
      handler(data);
    });
  }

  beginAdd(pos: number) {
    this.openDialog('add-block', null, (data) => {
      console.log("ADD-BLOCK: ", pos, data);
      if ( data ) {
        data.content.type = ['title', 'subtitle', 'text', 'cubes'][ data.tab ];
        let title = this.tut.content.find(b => b.type === 'title');

        if ( data.content.type === 'cubes' ) {
          data.content.cubes.forEach(c => {
            if ( c.type != 'arrow' ) {
              c.rotation.x = c.rotation.x * Math.PI / 180;
              c.rotation.y = c.rotation.y * Math.PI / 180;
              c.rotation.z = c.rotation.z * Math.PI / 180;
            }
          })
        }

        if ( !(data.tab === 0 && title) ) {
          this.tut.content.splice(pos, 0, data.content);
          this.init(this.tut.content);
        }
      }
    });
  }

  swapBlocks(i: number, j: number) {
    let bi = this.blocks[i];
    this.blocks.splice(i, 1, this.blocks[j]);
    this.blocks.splice(j, 1, bi);
  }

  deleteBlock(i: number) {
    this.blocks.splice(i, 1);
  }

  saveTutorial() {
    if ( this.tut ) {
      this.dataService.saveTutorial(this.tut);
    }
  }
}