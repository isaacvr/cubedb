import { DataService } from 'app/services/data.service';
import { generateCubeBundle } from 'app/cube-drawer';
import { Puzzle } from './../../classes/puzzle/puzzle';
import { Solve, Penalty, Session } from './../../interfaces/interfaces';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { options } from 'app/cstimer/scramble/scramble';

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
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private dataService: DataService
  ) {
    this.type = this.data.type;
    this.preview = "";
    this.creatingSession = false;

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
}
