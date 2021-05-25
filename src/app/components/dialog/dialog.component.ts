import { DataService } from 'app/services/data.service';
import { generateCubeBundle } from 'app/cube-drawer';
import { Puzzle } from './../../classes/puzzle/puzzle';
import { Solve, Penalty, Session, BlockType, RawPuzzle, CubeType } from './../../interfaces/interfaces';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { options } from 'app/cstimer/scramble/scramble';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { CubeMode, CubeModeMap } from 'app/constants/constants';
import { puzzleReg } from 'app/classes/puzzle/puzzleRegister';

interface Setting {
  hasInspection: boolean;
  inspection: number;
  showElapsedTime: boolean;
  calcAoX: number;
}

interface Tutorial {
  title: string;
  titleLower: string;
  puzzle: string;
  algs: number;
}

interface Block {
  tab: number;
  content: BlockType;
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  type: string;
  rawData: any;
  columns: string[];
  cube: Puzzle;
  preview: string;
  creatingSession: boolean;
  newSessionName: string;
  settings: Setting;
  tutorial: Tutorial;
  block: Block;
  modes;
  puzzles: any[];
  cubes: Puzzle[];
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private dataService: DataService
  ) {
    this.type = this.data.type;
    this.preview = "";
    this.creatingSession = false;
    this.settings = {
      hasInspection: true,
      inspection: 0,
      showElapsedTime: true,
      calcAoX: 0
    };
    this.tutorial = {
      title: '',
      titleLower: '',
      puzzle: '',
      algs: 0
    };
    this.block = {
      tab: 0,
      content: {
        type: 'title',
        content: "",
        cubes: []
      }
    };
    this.modes = CubeModeMap;
    this.puzzles = [];
    this.cubes = [];

    for (let [key, value] of puzzleReg ) {
      this.puzzles.push({
        name: value.name,
        value: key,
        order: value.order
      });
    }

    document.documentElement.style.setProperty('--panel-height', '');
    document.documentElement.style.setProperty('--panel-padding', '24px');
    switch( this.type ) {
      case 'edit-scramble': {
        this.rawData = this.data.data;
        break;
      }
      case 'edit-solve': {
        this.rawData = Object.assign({}, this.data.data);
        let md = options.has(this.rawData.mode) ? this.rawData.mode : '333';
        this.cube = new Puzzle(options.get(md));
        this.cube.move(this.rawData.scramble);
        
        let subscr = generateCubeBundle([this.cube], 200).subscribe({
          next: (img: string) => {
            this.preview = img;
          },
          complete: () => {
            subscr.unsubscribe();
          },
          error: () => {
            subscr.unsubscribe();
          }
        });
        break;
      }
      case 'old-scrambles': {
        document.documentElement.style.setProperty('--panel-height', '80%');
        document.documentElement.style.setProperty('--panel-padding', '0');
        this.rawData = this.data.data;
        this.columns = [ 'Scramble', 'Time' ];
        break;
      }
      case 'edit-sessions': {
        document.documentElement.style.setProperty('--panel-height', '80%');
        this.rawData = this.data.data;
        break;
      }
      case 'settings': {
        this.settings = {
          hasInspection: this.data.data.hasInspection,
          inspection: this.data.data.inspection / 1000,
          showElapsedTime: this.data.data.showElapsedTime,
          calcAoX: this.data.data.calcAoX,
        };
      }
    }
  }

  ngOnInit(): void {
  }

  close(data?) {
    this.dialogRef.close(data);
  }

  select(s: Solve) {
    this.close(s);
  }

  deleteSolve(s: Solve) {
    this.dataService.removeSolves([s]);
    this.close();
  }

  updateSession(s: Session, newName: string) {
    if ( newName.trim() === '' ) {
      return;
    }

    this.dataService.renameSession({ _id: s._id, name: newName.trim() });
    (<any> s).editing = false;
  }

  newSession() {
    let name = this.newSessionName.trim();

    if ( name != '' ) {
      this.dataService.addSession({ _id: null, name });
      this.closeAddSession();
    }
  }

  openAddSession() {
    this.creatingSession = true;
    this.newSessionName = "";
  }

  closeAddSession() {
    this.creatingSession = false;
  }

  deleteSession(s: Session) {
    if ( confirm('Do you really want to remove this session?') ) {
      this.dataService.removeSession(s);
      for (let i = 0, maxi = this.rawData.length; i < maxi; i += 1) {
        if ( s._id === this.rawData[i]._id ) {
          this.rawData.splice(i, 1);
          break;
        }
      }
    }
  }

  setPenalty(p: Penalty) {
    if ( p === Penalty.P2 ) {
      this.rawData.penalty != Penalty.P2 && (this.rawData.time += 2000);
    } else if ( this.rawData.penalty === Penalty.P2 ) {
      this.rawData.time -= 2000;
    }
    this.rawData.penalty = p;
  }

  selectGroup(e: MatSlideToggleChange) {
    this.settings.calcAoX = ~~e.checked;
  }

  refreshCube(i: number) {
    const PI_180 = Math.PI / 180;
    let ci = (<RawPuzzle>this.block.content.cubes[i]);

    if ( typeof ci.tips === 'string' ) {
      ci.tips = (<string> ci.tips).split(',').map(Number);
    }

    let c = this.cubes[i] = Puzzle.fromSequence(ci.scramble, ci);
    
    c.rotation = { x: ci.rotation.x * PI_180, y: ci.rotation.y * PI_180, z: ci.rotation.z * PI_180 };

    let s = generateCubeBundle([c], 150, false, true).subscribe({
      complete: () => { s.unsubscribe(); }
    });
  }

  deleteCube(i: number) {
    this.block.content.cubes.splice(i, 1);
    this.cubes.splice(i, 1);
  }

  addCube(type: string) {
    if ( type === 'cube' ) {
      let cnt: RawPuzzle = {
        type: 'rubik',
        mode: CubeMode.NORMAL,
        order: [3],
        tips: [],
        view: 'trans',
        scramble: '',
        rotation: { x: 0, y: 0, z: 0 },
        raw: false
      };

      (<CubeType[]>this.block.content.cubes).push(cnt);
      this.cubes.push(null);
      this.refreshCube(this.cubes.length - 1);

    } else if ( type === 'arrow' ) {
      (<CubeType[]>this.block.content.cubes).push({
        type: 'arrow',
        text: ''
      });
      this.cubes.push(null);
    }
  }
}
