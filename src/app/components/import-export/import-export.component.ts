import { DataService } from './../../services/data.service';
import { Solve, Penalty, Session } from './../../interfaces/interfaces';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as Moment from 'moment';
import { NgxCsvParser } from "ngx-csv-parser";

let lens = [ 0, 0, 70, 0, 0, 10, 0, 40, 60, 80, 100 ];
let modes = [ "sqrs", "clkwca", "mgmp", "222so", "skbso", "pyrso", "333", "444wca", "555wca", "666wca", "777wca" ];

function str2time(str: string): number {
  let t = str
  .match(/(\d*)?:?(\d*)?:?(\d*).(\d*)/)
  .filter((v, pos) => pos >= 1 && pos <= 4 && v && v != '');
  // console.log("str2time: ", t);
  let mults = [ 24, 60, 60, 1000 ];
  return t.reduce((ac, e, pos) => ac * mults[ mults.length - t.length + pos] + (+e), 0);
}

function identifyPuzzle(scramble: string) {
  let ini = [ 11, 11, 12, 16, 44, 60, 80, 100 ];
  let fin = [ 11, 11, 15, 22, 46, 62, 80, 100 ];
  
  if ( scramble.indexOf('/') > -1 ) {
    return { mode: "sqrs", len: 0 };
  } else if ( scramble.indexOf("++") > -1 || scramble.indexOf("--") > -1 ) {
    return { mode: "mgmp", len: 70 };
  } else if ( scramble.indexOf('ALL') > -1 ) {
    return { mode: "clkwca", len: 0 };
  }
  
  let slen = scramble.split(' ').length;
  let minIdx = -1;
  
  if ( slen === 11 ) {
    minIdx = /^[LRBU\s']+$/.test(scramble) ? 4 : 3;
  } else {
    for (let i = 5, maxi = ini.length; i < maxi; i += 1) {
      if ( ini[i] <= slen && slen <= fin[i] ) {
        minIdx = i;
        break;
      }
    }
  }
  
  return { mode: modes[ minIdx ], len: lens[ minIdx ] };
  
}

function puzzleToIndex(puzzle: string): number {
  let pz = [ 'sq1', 'clock', 'mega', '222', 'skewb', 'pyra', '333', '444', '555', '666', '777' ];
  return pz.indexOf(puzzle);
}

@Component({
  selector: 'app-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.scss']
})
export class ImportExportComponent implements OnInit {
  @ViewChild('file') file: ElementRef< HTMLInputElement >;
  timer: string;
  parsed: any[];
  solves: Solve[];
  error: string;
  message: string;
  session: Session;
  constructor(private dataService: DataService, private parser: NgxCsvParser) {
    this.timer = 'csTimer';
    this.solves = [];
    this.error = null;
    this.message = null;
    this.session = {
      _id: '',
      name: ''
    };
  }

  ngOnInit(): void {
  }

  save() {
    this.session.name = this.session.name.trim();
    if ( this.session.name === '' ) {
      this.error = "Empty name";
      return;
    }

    let sLen = this.solves.length;

    let ssub;
    let svSub = this.dataService.solveSub.subscribe({
      next: (a) => {
        if ( a.type === 'add-solve' ) {
          sLen -= 1;
          this.message = "Remaining: " + sLen;
          if ( sLen === 0 ) {
            this.message = 'Saved correctly!!';
            this.solves.length = 0;
            svSub.unsubscribe();
            ssub.unsubscribe();
            return;
          }
        }
      }
    });

    ssub = this.dataService.sessSub.subscribe({
      next: (a: { type: string, data: Session }) => {
        // console.log("SESSION_NEXT: ", a);
        if ( a.type === 'add-session' ) {
          if ( a.data ) {
            for (let i = 0, maxi = this.solves.length; i < maxi; i += 1) {
              if ( a.data.name === this.solves[i].session ) {
                this.solves[i].session = a.data._id;
                this.dataService.addSolve(this.solves[i]);
              }
            }
          }
        }
      }
    });

    this.message = "Creating session...";

    let sessions: Map<string, string> = new Map<string, string>();

    for (let i = 0, maxi = this.solves.length; i < maxi; i += 1) {
      if ( this.solves[i].session != '' ) {
        sessions.set( this.solves[i].session, this.session.name + ' ' + this.solves[i].session );
        this.solves[i].session = this.session.name + ' ' + this.solves[i].session;
      } else {
        sessions.set( this.session.name, this.session.name );
        this.solves[i].session = this.session.name;
      }
    }

    if ( sessions.size === 0 ) {
      sessions.set('session', this.session.name);
    }

    for (let value of sessions.values()) {
      this.dataService.addSession({ _id: '', name: value });
    }
  }

  parseFile() {
    this.error = null;
    this.message = null;

    let fr = new FileReader();

    fr.addEventListener('load', (e) => {
      let res: string = <string> e.target.result;
      res = res.replace(/\r/g, '').replace(/\nR/g, ' R');

      this.parsed = this.parser.csvStringToArray(res, ';');
      
      // console.log('PARSED: ', this.parsed);
      
      switch( this.timer ) {
        case 'csTimer': {
          this.parseCsTimer();
          break;
        }
        case 'cubeTimer': {
          this.parseCubeTimer();
          break;
        }
        case 'twistyTimer': {
          this.parseTwistyTimer();
          break;
        }
      }    
    }, false);

    fr.readAsText(this.file.nativeElement.files[0]);
  }

  parseCsTimer() {
    let arr = this.parsed;
    let vals = [ /^\d+$/, /^(DNF\()?[\d+.:]+\+?\)?$/, /.*/, /.*/, /^\d+-\d+-\d+ \d+:\d+:\d+$/, /[\d+.:]+/ ];

    for (let i = 1, maxi = arr.length; i < maxi; i += 1) {
      if ( arr[i].length != vals.length ) {
        this.solves.length = 0;
        this.error = "Invalid row format";
        return;
      }
      for (let j = 0, maxj = arr[i].length; j < maxj; j += 1) {
        if ( !vals[j].test(arr[i][j]) ) {
          // console.log(vals[j], arr[i][j]);
          this.solves.length = 0;
          this.error = "Columns does not match";
          return;
        }
      }

      let p = arr[i][1];
      let time = str2time(arr[i][5]);
      let puzzle = identifyPuzzle(arr[i][3].trim());
      // console.log('T_TIME: ', time);

      let s: Solve = {
        date: Moment(arr[i][4], 'YYYY-MM-DD HH:mm:ss').toDate().getTime(),
        penalty: /^DNF/.test(p) ? Penalty.DNF : /\+$/.test(p) ? Penalty.P2 : Penalty.NONE,
        scramble: arr[i][3].trim(),
        selected: false,
        session: '',
        time,
        comments: arr[i][2],
        group: 0,
        mode: puzzle.mode,
        len: puzzle.len,
      };

      this.solves.push(s);
    }

    this.error = null;
  }

  parseCubeTimer() {
    let vals = [ /.*/, /^\d+:\d+\.\d+$/, /.*/, /^\d+-\d+-\d+ \d+:\d+$/, /^(yes|no)$/, /^(yes|no)$/, /.*/, /.*/ ];
    let arr = this.parsed.filter(s => s.length === vals.length);

    if ( arr.length === 0 ) {
      this.message = "Empty dataset :(";
    }

    for (let i = 1, maxi = arr.length; i < maxi; i += 1) {
      for (let j = 0, maxj = arr[i].length; j < maxj; j += 1) {
        if ( !vals[j].test(arr[i][j]) ) {
          // console.log(vals[j], arr[i][j]);
          this.solves.length = 0;
          this.error = "Columns does not match";
          return;
        }
      }

      let p1 = arr[i][4];
      let p2 = arr[i][5];
      let time = str2time(arr[i][1]);      

      let puzzle = identifyPuzzle(arr[i][2].trim());

      let s: Solve = {
        date: Moment(arr[i][3], 'YYYY-MM-DD HH:mm:ss').toDate().getTime(),
        penalty: /^yes/.test(p1) ? Penalty.P2 : /^yes/.test(p2) ? Penalty.DNF : Penalty.NONE,
        scramble: arr[i][2].trim(),
        selected: false,
        session: arr[i][0],
        time,
        comments: '',
        group: 0,
        mode: puzzle.mode,
        len: puzzle.len,
      };

      this.solves.push(s);
    }

    // console.log('SOLVES: ', this.solves);

    this.error = null;
  }

  parseTwistyTimer() {
    /// Puzzle,Category,Time(millis),Date(millis),Scramble,Penalty,Comment
    let vals = [ /.*/, /.*/, /^\d+$/, /^\d+$/, /.*/, /[012]/, /.*/ ];
    let arr = this.parsed.filter(s => s.length === vals.length);

    if ( arr.length === 0 ) {
      this.message = "Empty dataset :(";
    }

    for (let i = 1, maxi = arr.length; i < maxi; i += 1) {
      for (let j = 0, maxj = arr[i].length; j < maxj; j += 1) {
        if ( !vals[j].test(arr[i][j]) ) {
          // console.log(vals[j], arr[i][j]);
          this.solves.length = 0;
          this.error = "Columns does not match";
          return;
        }
      }

      let puzzle = arr[i][0];
      let cat = arr[i][1];
      let time = +arr[i][2];
      let date = +arr[i][3];
      let scramble = arr[i][4];
      let penalty = [ Penalty.NONE, Penalty.P2, Penalty.DNF ][ +arr[i][5] ];
      let comments = arr[i][6] || "";
      let idx = puzzleToIndex(puzzle);

      let s: Solve = {
        date,
        penalty,
        scramble,
        selected: false,
        session: puzzle + '-' + cat,
        time,
        comments,
        group: 0,
        mode: modes[idx],
        len: lens[idx],
      };

      this.solves.push(s);
    }

    this.solves.sort((a, b) => a.date - b.date);

    for (let i = 0, maxi = this.solves.length; i < maxi;) {
      let j = i + 1;
      for (; j < maxi && this.solves[i].date === this.solves[j].date; j += 1);

      if ( j == maxi ) {
        for (let k = i; k < j; k += 1) {
          this.solves[k].date = this.solves[i].date + k - i;
        }
      } else {
        for (let k = i; k < j; k += 1) {
          let a = (k - i) / (j - i);
          this.solves[k].date = this.solves[i].date * (1 - a) + this.solves[j].date * a;
        }
      }

      i = j;
    }

    // console.log('SOLVES: ', this.solves);

    this.error = null;
  }

}
