import { Puzzle } from './../../classes/puzzle/puzzle';
import { Component, OnInit } from '@angular/core';
import { getPLLScramble, pllfilter } from 'app/cstimer/scramble/scramble_333';
import { generateCubeBundle } from 'app/cube-drawer';

@Component({
  selector: 'app-pll-trainer',
  templateUrl: './pll-trainer.component.html',
  styleUrls: ['./pll-trainer.component.scss']
})
export class PllTrainerComponent {
  SAMPLES: number[] = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  topFace: string = 'random';
  cases: number = 20;
  stage: number = 0;
  correct: number = 0;

  idx: number;
  pllCases: string[];
  caseName: string[];
  images: string[];
  answers: string[];
  filters: string[];
  times: number[];
  bundle: any[];

  showAnswer: boolean = false;
  lastAnswer: string = null;

  columns: string[];

  lastTime: number;
  
  constructor() {
    this.pllCases = [];
    this.caseName = [];
    this.images = [];
    this.answers = [];
    this.times = [];
    this.filters = pllfilter.map(s => s).sort();
    this.columns = ['No', 'Case', 'Expected', 'Answer', 'Time'];
    this.bundle = [];
  }

  next() {
    
    switch(this.stage) {
      case 0: {

        this.pllCases.length = 0;
        this.caseName.length = 0;
        this.images.length = 0;
        this.answers.length = 0;
        this.times.length = 0;
        this.idx = 0;

        let len = pllfilter.length;
        let puzzles: Puzzle[] = [];

        for (let i = 0, maxi = this.cases; i < maxi; i += 1) {
          let idx = ~~( Math.random() * len );
          let scr = getPLLScramble(null, null, idx);
          this.pllCases.push( scr );
          this.caseName.push( pllfilter[idx] );
          
          let pref = this.topFace === 'random' ?
            [ "x", "x'", "", "z", "z'", "x2" ][ ~~(Math.random() * 6) ]
            : this.topFace;

          let rot = ["", "y", "y'", "y2"][ ~~(Math.random() * 4) ];

          puzzles.push( Puzzle.fromSequence(pref + " " + rot + " " + scr, {
            type: 'rubik',
            view: 'trans'
          }) );
        }

        let subscr = generateCubeBundle(puzzles, null, true).subscribe({
          next: (img) => {
            this.images.push(...img);
          },
          complete: () => {
            this.lastTime = Date.now();
            this.stage = 1;
            subscr.unsubscribe();
          }
        });

        break;
      }
      case 1: {
        this.bundle.length = 0;

        for (let i = 0, maxi = this.cases; i < maxi; i += 1) {
          this.bundle.push({
            id: i + 1,
            img: this.images[i],
            expected: this.caseName[i],
            answer: this.answers[i],
            time: this.times[i],
          });
        }

        this.stage = 2;
        break;
      }
      case 2: {
        this.correct = 0;
        this.stage = 0;
        break;
      }
    }
  }

  addAnswer(ans: string) {
    this.answers.push(ans);
    this.times.push( Date.now() - this.lastTime );
    this.lastAnswer = ans;
    this.showAnswer = true;

    if ( ans === this.caseName[ this.idx ] ) {
      this.correct += 1;
    }

    setTimeout(() => {
      this.showAnswer = false;
      this.idx += 1;
      this.lastTime = Date.now();

      if ( this.idx === this.cases ) {
        this.next();
      }
    }, 1000);
  }

}
