import { Solve } from './../../interfaces/interfaces';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  type: string;
  rawData: any;
  dontCare: boolean;
  columns: string[];
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.type = this.data.type;
    this.dontCare = false;

    document.documentElement.style.setProperty('--panel-height', '');
    document.documentElement.style.setProperty('--panel-padding', '24px');
    switch( this.type ) {
      case 'edit-scramble': {
        this.rawData = "";
        break;
      }
      case 'edit-solve': {
        this.rawData = this.data.data;
        break;
      }
      case 'old-scrambles': {
        document.documentElement.style.setProperty('--panel-height', '80%');
        document.documentElement.style.setProperty('--panel-padding', '0');
        this.rawData = this.data.data;
        this.columns = [ 'Scramble', 'Time' ];
        break;
      }
    }
  }

  ngOnInit(): void {
  }

  close(data) {
    this.dialogRef.close(data);
  }

  select(s: Solve) {
    this.close(s);
  }

  validateScramble(data: string): boolean {
    if ( this.dontCare ) {
      return true;
    }
    let str = data.trim().split(/\s+/);
    for (let i = 0, maxi = str.length; i < maxi; i += 1) {
      if ( !str[i].match(/^[RUFBDL]{1}('|2|2'|'2){0,1}$/) ) {
        return false;
      }
    }
    return true;
  }

}
