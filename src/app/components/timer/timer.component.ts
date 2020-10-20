import { ThemeService } from './../../services/theme.service';
import { Penalty, Solve } from './../../interfaces/interfaces';
import { Component, HostListener, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, OnChanges } from '@angular/core';
import { Label, Color } from 'ng2-charts';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { transform } from 'app/pipes/timer.pipe';
import { MENU } from './menu';
import * as all from '../../cstimer/scramble';
import { solve_cross, solve_xcross } from 'app/cstimer/tools/cross';
import { MatMenuTrigger } from '@angular/material/menu';
import { DataService } from 'app/services/data.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

enum TimerState {
  CLEAN = 0, STOPPED = 1, PREVENTION = 2, INSPECTION = 3, RUNNING = 4
};

function debug(...args) {
  // console.log.apply(null, args);
}

function getTime(n: number, ndec: boolean, suff): string {
  return transform(n, ndec, suff);
}

interface Metric {
  value: number;
  better: boolean;
}

interface Statistics {
  best: Metric;
  worst: Metric;
  avg: Metric;
  count: Metric;
  Ao5: Metric;
  Ao12: Metric;
  Ao50: Metric;
  Ao100: Metric;
  Ao200: Metric;
  Ao500: Metric;
  Ao1k: Metric;
  Ao2k: Metric;
  __counter: number;
}

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit, OnDestroy {
  @ViewChild(MatMenuTrigger) pillMenu: MatMenuTrigger;

  state: TimerState;
  decimals: boolean;
  time: number;
  inspectionTime: number;
  scramble: string;
  cross: string[];
  xcross: string;
  stateMessage: string;
  stats: Statistics;
  AoX: number;

  group: number;
  groups: string[];
  
  mode: { 0: string, 1: string, 2: number };
  modes: { 0: string, 1: string, 2: number }[];
  
  filters: string[];

  prob: number;

  solves: Solve[];
  lastSolve: Solve;

  private ref: number;
  private refPrevention: number;
  private ready: boolean;
  private itv: any;
  private isValid: boolean;
  private tab: number;
  private hint: boolean;
  private hintDialog: boolean;
  private selected: number;
  private enableKeyboard: boolean;

  /// Subscription
  private recSub: Subscription;
  private themeSub: Subscription;

  /// Test
  lineChartData: ChartDataSets[] = [];
  lineChartLabels: Label[] = [];
  lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      labels: {
        // fontColor: 'black'
        fontColor: '#bbbbbb'
      },
    },
    scales: {
      xAxes: [
        {
          ticks: {
            display: false, 
          },
          gridLines: {
            display: false
          },
        }
      ],
      yAxes: [
        {
          id: 'y',
          position: 'left',
          gridLines: {
            color: '#555'
          },
          ticks: {
            // fontColor: 'black',
            fontColor: '#bbbbbb',
            callback: (value) => {
              return getTime(<number> value, false, true);
            }
          }
        }
      ]
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
      },
    },
    tooltips: {
      mode: 'nearest',
      intersect: false,
      callbacks: {
        label: function(tooltipItem, data) {
          let label = data.datasets[ tooltipItem.datasetIndex ].label;
          return label + ": " + getTime(+tooltipItem.yLabel, false, true);
        },
        title: (items) => 'Solve #' + (+items[0].xLabel + 1)
      },
    }
  };
  lineChartColors: Color[] = [];
  lineChartLegend = true;
  lineChartType = 'line';
  lineChartPlugins = [];

  constructor(
    private dataService: DataService,
    private themeService: ThemeService,
    public dialog: MatDialog) {
    this.inspectionTime = 15000;
    this.time = 0;
    this.ref = 0;
    this.refPrevention = 0;
    this.state = TimerState.CLEAN;
    this.tab = 1;
    this.hint = false;
    this.selected = 0;
    this.AoX = 100;
    this.enableKeyboard = true;

    this.ready = false;
    this.decimals = true;
    this.isValid = true;

    this.scramble = null;
    this.stateMessage = 'Starting...';

    this.groups = MENU.map(e => e[0]);

    this.modes = [];
    this.filters = [];
    this.cross = [];

    this.lastSolve = null;

    this.stats = {
      best: { value: 0, better: false },
      worst: { value: 0, better: false },
      count: { value: 0, better: false },
      avg: { value: 0, better: false },
      Ao5: { value: -1, better: false },
      Ao12: { value: -1, better: false },
      Ao50: { value: -1, better: false },
      Ao100: { value: -1, better: false },
      Ao200: { value: -1, better: false },
      Ao500: { value: -1, better: false },
      Ao1k: { value: -1, better: false },
      Ao2k: { value: -1, better: false },
      __counter: 0,
    };

    this.recSub = this.dataService.recSub.subscribe({
      next: (solves: Solve[]) => {
        this.solves = solves;
        this.setSolves();
      }
    });

    this.themeSub = themeService.subscr.subscribe((name) => {
      if ( name === 'dark' ) {
        this.lineChartOptions.legend.labels.fontColor = '#bbbbbb';
        this.lineChartOptions.scales.yAxes[0].ticks.fontColor = '#bbbbbb';
        this.lineChartColors = [
          { borderColor: "#e23c7e", pointBackgroundColor: "#e23c7e", pointRadius: 2, borderWidth: 1 },
          { borderColor: "#b651e1", pointBackgroundColor: "#b651e1", pointRadius: 2, borderWidth: 1 },
          { borderColor: "#3166c9", pointBackgroundColor: "#3166c9", pointRadius: 2, borderWidth: 1 },
          { borderColor: "#63ab75", pointBackgroundColor: "#63ab75", pointRadius: 2, borderWidth: 1 },
          { borderColor: "#ab8254", pointBackgroundColor: "#ab8254", pointRadius: 2, borderWidth: 1 },
          { borderColor: "#ffffff", pointBackgroundColor: "#ffffff", pointRadius: 2, borderWidth: 2 },
        ];
      } else {
        this.lineChartColors = [
          { borderColor: "#cc0063", pointBackgroundColor: "#cc0063", pointRadius: 2, borderWidth: 1 },
          { borderColor: "#8d28b8", pointBackgroundColor: "#8d28b8", pointRadius: 2, borderWidth: 1 },
          { borderColor: "#0359b5", pointBackgroundColor: "#0359b5", pointRadius: 2, borderWidth: 1 },
          { borderColor: "#0b982f", pointBackgroundColor: "#0b982f", pointRadius: 2, borderWidth: 1 },
          { borderColor: "#ad5f05", pointBackgroundColor: "#ad5f05", pointRadius: 2, borderWidth: 1 },
          { borderColor: "#555555", pointBackgroundColor: "#555555", pointRadius: 2, borderWidth: 2 },
        ];
        this.lineChartOptions.legend.labels.fontColor = 'black';
        this.lineChartOptions.scales.yAxes[0].ticks.fontColor = 'black';
      }
    });

    this.themeService.getTheme();
    this.dataService.getRecords();

  }

  ngOnInit() {

    this.group = 0;
    this.selectedGroup();
    this.updateChart();
    this.updateStatistics(false);
    
    debug('SCRAMBLERS', all.pScramble.scramblers);

  }

  ngOnDestroy() {
    this.recSub.unsubscribe();
    this.themeSub.unsubscribe();
  }

  changeAoX(event: { target: HTMLInputElement }) {
    this.AoX = Math.min(Math.max(10, ~~event.target.value), 10000);
    this.lineChartData[4].data = TimerComponent.getAverage(this.AoX, this.solves)
    this.lineChartData[4].label = 'Ao' + this.AoX;
  }

  static getAverage(n: number, arr: Solve[]): number[] {
    let res = [];
    let len = arr.length - 1;
    let elems = [];
    let disc = Math.ceil(n * 0.05);

    for (let i = 0, maxi = len; i <= maxi; i += 1) {
      elems.push( arr[len - i].time );
      if ( i < n - 1 ) {
        res.push(null);
      } else {
        elems.sort();
        let sumd = elems.reduce((s, e, p) => {
          return (p >= disc && p < n - disc) ? s + e : s;
        }, 0);
        res.push( sumd / (n - disc * 2) );
        let pos = elems.indexOf(arr[len - i + n - 1].time);
        elems.splice(pos, 1);
      }
    }

    return res;
  }

  static getBest(arr: Solve[], rev?: boolean): any[] {
    let best = Infinity;
    let bests = [];
    let len = arr.length - 1;
    
    let idx = (i: number) => rev ? len - i : i;

    for (let i = 0, maxi = len + 1; i < maxi; i += 1) {
      if ( arr[ idx(i) ].time < best ) {
        best = arr[ idx(i) ].time;
        bests.push({ x: i.toString(), y: best });
      }
    }

    return bests;
  }

  updateStatistics(inc ?: boolean) {
    let AON = [ 5, 12, 50, 100, 200, 500, 1000, 2000 ];
    let AVG = [ 0, 0, 0, 0, 0, 0, 0, 0 ];
    let BEST = [ Infinity, Infinity, Infinity, Infinity, Infinity, Infinity, Infinity, Infinity ];
    let len = this.solves.length;
    let sum = 0;
    let bw = this.solves.reduce((ac: number[], e, p) => {
      sum += e.time;
      return [ Math.min(ac[0], e.time), Math.max(ac[1], e.time) ];
    }, [Infinity, 0]);

    for (let i = 0, maxi = AON.length; i < maxi; i += 1) {
      let avgs = TimerComponent.getAverage(AON[i], this.solves);
      BEST[i] = avgs.reduce((b, e) => (e) ? Math.min(b, e) : b, BEST[i]);
      let lastAvg = avgs.pop();
      AVG[i] = ( lastAvg ) ? lastAvg : -1;
    }

    let ps = Object.assign({}, this.stats);

    this.stats = {
      best:  { value: bw[0], better: ps.best.value > bw[0] },
      worst: { value: bw[1], better: false },
      avg:   { value: len === 0 ? null : sum / len, better: false },
      count: { value: len, better: false },
      Ao5:   { value: AVG[0], better: AVG[0] <= BEST[0] },
      Ao12:  { value: AVG[1], better: AVG[1] <= BEST[1] },
      Ao50:  { value: AVG[2], better: AVG[2] <= BEST[2] },
      Ao100: { value: AVG[3], better: AVG[3] <= BEST[3] },
      Ao200: { value: AVG[4], better: AVG[4] <= BEST[4] },
      Ao500: { value: AVG[5], better: AVG[5] <= BEST[5] },
      Ao1k:  { value: AVG[6], better: AVG[6] <= BEST[6] },
      Ao2k:  { value: AVG[7], better: AVG[7] <= BEST[7] },
      __counter: (inc) ? ps.__counter + 1 : ps.__counter,
    };
  }

  updateChart() {

    let len = this.solves.length - 1;
    this.lineChartLabels = this.solves.map((e, p) => p.toString());
    this.lineChartData = [
      {
        data: this.solves.map((e, p) => this.solves[len - p].time),
        type: 'line',
        fill: false,
        label: 'Time',
        lineTension: 0
      }
    ];
    let avgs = [ 5, 12, 50, this.AoX ];
    
    avgs.forEach(e => {
      this.lineChartData.push({
        data: TimerComponent.getAverage(e, this.solves),
        type: 'line',
        fill: false,
        label: 'Ao' + e,
        lineTension: 0,
        hidden: true,
      });
    });

    this.lineChartData.push({
      data: TimerComponent.getBest(this.solves, true),
      type: 'line',
      fill: false,
      label: 'Best',
      lineTension: 0,
      borderDash: [5, 5]
    });
  }

  createNewSolve() {
    this.lastSolve = {
      date: null,
      penalty: Penalty.NONE,
      scramble: this.scramble,
      time: this.time,
      comments: '',
      selected: false,
    };
  }

  setSolves() {
    this.sortSolves();
    this.updateChart();
    this.updateStatistics(true);
  }

  initScrambler(scr?: string, mode ?: string) {
    this.scramble = null;
    this.hintDialog = false;

    debug('CROSS NULL');

    setTimeout(() => {
      debug('PUZZLE_MODE_FILTER_PROB: ', this.mode);
      let md = (mode) ? mode : this.mode[1];

      this.scramble = (scr) ? scr : all.pScramble.scramblers.get(md).apply(null, [
        md, Math.abs(this.mode[2]), this.prob < 0 ? undefined : this.prob
      ]);

      let modes = ["333", "333fm" ,"333oh" ,"333o" ,"easyc" ,"333ft"];

      if ( modes.indexOf(md) > -1 ) {
        this.cross = solve_cross(this.scramble).map(e => e.map(e1 => e1.trim()).join(' '))[0];
        this.xcross = solve_xcross(this.scramble, 0).map(e => e.trim()).join(' ');
        debug("CROSS", this.cross);
        debug("XCROSS", this.xcross);
        this.hintDialog = true;
      } else {
        this.hint = false;
        this.hintDialog = false;
      }

      debug(this.scramble);
    }, 10);
  }

  runTimer(direction: number, roundUp ?: boolean) {
    this.itv = setInterval(() => {
      let t = (direction < 0) ? this.ref - performance.now() : performance.now() - this.ref;

      if ( roundUp ) {
        t = Math.ceil(t / 1000) * 1000;
      }

      if ( t <= 0 ) {
        this.time = 0;
        this.stopTimer();
        debug('+2');
        this.lastSolve.penalty = Penalty.P2;
        return;
      }

      this.time = ~~t;
    }, 47);
  }

  stopTimer() {
    if ( this.time != 0 ) {
      this.time = performance.now() - this.ref;
    }
    clearInterval(this.itv);
  }

  deleteLastSolve() {
    this.lastSolve = null;
  }

  dnf() {
    if ( this.lastSolve.penalty === Penalty.P2 ) {
      this.lastSolve.time -= 2000;
      this.time -= 2000;
    }
    this.lastSolve.penalty = (this.lastSolve.penalty != Penalty.DNF) ? Penalty.DNF : Penalty.NONE;
  }

  plus2() {
    this.lastSolve.penalty = (this.lastSolve.penalty != Penalty.P2) ? Penalty.P2 : Penalty.NONE;
    if ( this.lastSolve.penalty === Penalty.P2 ) {
      this.lastSolve.time += 2000;
      this.time += 2000;
    } else {
      this.lastSolve.time -= 2000;
      this.time -= 2000;
    }
  }

  addComment() {

  }

  addSolve() {
    this.lastSolve.date = Date.now();
    this.lastSolve.time = this.time;
    this.lastSolve.mode = this.mode[1];
    this.lastSolve.len = this.mode[2];
    this.lastSolve.prob = this.prob;
    this.solves.push( this.lastSolve );
    this.sortSolves();
    this.updateChart();
    this.updateStatistics(true);
  }

  sortSolves() {
    this.solves.sort((a, b) => b.date - a.date);
  }

  selectedGroup() {
    this.modes = MENU[ this.group ][1];
    this.mode = this.modes[0];
    debug('MENU_GROUP_MODES_MODE: ', MENU, this.group, this.modes, this.mode);
    this.selectedMode();
  }

  selectedMode() {
    this.filters = all.pScramble.filters.get(this.mode[1]) || [];
    debug('FILTERS_PUZZLE: ', this.filters);
    this.prob = -1;
    this.selectedFilter();
  }

  selectedFilter() {
    this.initScrambler();
  }

  solveClick(solve: Solve, force?: boolean) {
    if ( this.selected || force ) {
      this.pillMenu.closeMenu();
      solve.selected = !solve.selected;
      if ( solve.selected ) {
        this.selected += 1;
      } else {
        this.selected -= 1;
      }
    }
  }

  selectAll() {
    this.selected = this.solves.length;
    for (let i = 0, maxi = this.selected; i < maxi; i += 1) {
      this.solves[i].selected = true;
    }
  }

  selectInvert() {
    this.selected = this.solves.length - this.selected;
    for (let i = 0, maxi = this.solves.length; i < maxi; i += 1) {
      this.solves[i].selected = !this.solves[i].selected;
    }
  }

  selectInterval() {
    let i1, i2;
    let len = this.solves.length;

    for (i1 = 0; i1 < len && !this.solves[i1].selected; i1 += 1);
    for (i2 = len - 1; i2 >= 0 && !this.solves[i2].selected; i2 -= 1);

    for (let i = i1; i <= i2; i += 1) {
      if ( !this.solves[i].selected ) {
        this.solves[i].selected = true;
        this.selected += 1;
      }
    }
  }

  selectNone() {
    this.selected = 0;
    for(let i = 0, maxi = this.solves.length; i < maxi; i += 1) {
      this.solves[i].selected = false;
    }
  }

  delete() {

  }

  private openDialog(type: string, data: any, handler) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        type,
        data
      }
    });

    this.enableKeyboard = false;    

    const subscr = dialogRef.afterClosed().subscribe((data) => {
      document.documentElement.style.setProperty('--panel-height', '');
      document.documentElement.style.setProperty('--panel-padding', '24px');
      this.enableKeyboard = true;
      subscr.unsubscribe();
      handler(data);
    });
  }

  editSolve(solve: Solve) {
    this.openDialog('edit-solve', solve, (s: Solve) => {
      if ( s ) {
        this.dataService.updateSolve(s);
      }
    });
  }

  editScramble() {
    this.openDialog('edit-scramble', undefined, (s: string) => {
      if ( s.trim() != '' ) {
        this.initScrambler(s.trim());
      }
    });
  }

  oldScrambles() {
    this.openDialog('old-scrambles', this.solves, (s: Solve) => {
      if ( s ) {
        this.initScrambler(s.scramble, s.mode);
      }
    });
  }

  @HostListener('window:keydown', ['$event'])
  keyDown(event: KeyboardEvent) {
    if ( !this.enableKeyboard ) {
      return;
    }
    switch(this.tab) {
      case 0: {
        // debug("KEYDOWN EVENT: ", event);
        if ( event.code === 'Space' ) {
          if ( !this.isValid && this.state === TimerState.RUNNING ) {
            return;
          }
          this.isValid = false;

          if ( this.state === TimerState.STOPPED || this.state === TimerState.CLEAN ) {
            debug('PREVENTION');
            this.state = TimerState.PREVENTION;
            this.time = 0;
            this.refPrevention = performance.now();
          }
          else if ( this.state === TimerState.PREVENTION ) {
            if ( performance.now() - this.refPrevention > 500 ) {
              debug('READY');
              this.ready = true;
            }
          } else if ( this.state === TimerState.RUNNING ) {
            debug('STOP');
            this.stopTimer();
            this.time = ~~(performance.now() - this.ref);
            this.addSolve();
            this.state = TimerState.STOPPED;
            this.ready = false;
            this.lastSolve.time = this.time;
            this.initScrambler();
          }
        } else if ( ['KeyR', 'Escape', 'KeyS'].indexOf(event.code) > -1 ) {
          debug("RESET");
          this.stopTimer();
          this.time = 0;
          this.state = TimerState.CLEAN;
          this.ready = false;
          this.decimals = true;
          this.lastSolve = null;

          if ( event.code === 'KeyS' ) {
            this.initScrambler();
          }
        }
        break;
      }
      case 1: {
        if ( event.code === 'Escape' && this.selected ) {
          this.selectNone();
        }
        break;
      }
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyUp(event: KeyboardEvent) {
    if ( !this.enableKeyboard ) {
      return;
    }

    if ( this.tab ) {
      return;
    }
    this.isValid = true;
    // debug("KEYUP EVENT: ", event);
    if ( event.code === 'Space' ) {
      if ( this.state === TimerState.PREVENTION ) {
        if ( this.ready ) {
          debug('INSPECTION');
          this.createNewSolve();
          this.state = TimerState.INSPECTION;
          this.decimals = false;
          this.time = 0;
          this.ready = false;
          this.ref = performance.now() + this.inspectionTime;
          this.runTimer(-1, true);
        } else {
          debug("CLEAN");
          this.state = TimerState.CLEAN;
        }
      } else if ( this.state === TimerState.INSPECTION ) {
        debug('RUNNING');
        this.state = TimerState.RUNNING;
        this.ref = performance.now();
        this.decimals = true;
        this.stopTimer();

        if ( this.lastSolve.penalty === Penalty.P2 ) {
          this.ref -= 2000;
        }

        this.runTimer(1);
      }
    }
  }

}
