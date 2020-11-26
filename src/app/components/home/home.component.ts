import { DataService } from '../../services/data.service';
import { Puzzle } from '../../classes/puzzle/puzzle';
import { Component } from '@angular/core';
import { CubeMode } from '../../constants/constants';
import { Router } from '@angular/router';
import { Card } from '../../interfaces/interfaces';
import { generateCubeBundle } from 'app/cube-drawer';
import { pochscramble } from 'app/cstimer/scramble/utilscramble';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  cards: Card[];
  testImg: string;
  isProduction: boolean;

  constructor(
    private router: Router,
    private dataService: DataService
    ) {
    this.isProduction = true;

    this.cards = [
      {
        title: "Tutorials",
        route: "/tutorials",
        ready: false,
        timer: false,
        cube: '',
        puzzle: Puzzle.fromSequence("z2", { type: 'rubik', mode: CubeMode.NORMAL, order: [3] }, true)
      }, {
        title: "Algorithms",
        route: "/algorithms",
        timer: false,
        ready: false,
        cube: '',
        puzzle: Puzzle.fromSequence("F R' F' R U R U' R' z2", { type: 'rubik', mode: CubeMode.ZBLL, order: [3] }, true)
      }, {
        title: "Timer",
        route: "/timer",
        timer: true,
        ready: false,
        cube: '',
        puzzle: Puzzle.fromSequence("z2", { type: 'rubik', mode: CubeMode.NORMAL, order: [3] }, true)
      }, {
        title: "Puzzle simulator",
        route: "/simulator",
        timer: true,
        ready: false,
        cube: '',
        puzzle: Puzzle.fromSequence(pochscramble(10, 7), { type: 'megaminx', mode: CubeMode.NORMAL, order: [3] }, true)
      }, {
        title: "Settings",
        route: "/settings",
        timer: false,
        ready: false,
        cube: '',
        puzzle: Puzzle.fromSequence("z2", { type: 'rubik', mode: CubeMode.GRAY, order: [2] }, true)
      }, {
        title: "PLL Recognition",
        route: "/pll-trainer",
        timer: true,
        ready: false,
        cube: '',
        puzzle: Puzzle.fromSequence("M2 U M2 U2 M2 U M2 z2", { type: 'rubik', mode: CubeMode.PLL, order: [3] }, true)
      }, {
        title: 'Import / Export',
        route: '/import_export',
        cube: './assets/cube_apps.png',
        ready: true,
        timer: false,
      }
    ];

    let cubes = this.cards.reduce((ac, e) => {
      if ( e.puzzle ) {
        ac.push(e.puzzle);
      }
      return ac;
    }, []);

    let subsc = generateCubeBundle(cubes, null, false, true).subscribe({
      error: (err) => {
        subsc.unsubscribe();
      },
      complete: () => {
        for (let i = 0, maxi = this.cards.length; i < maxi; i += 1) {
          this.cards[i].ready = true;
          if ( this.cards[i].puzzle ) {
            this.cards[i].cube = (<any>this.cards[i].puzzle).img;
          }
        }
        subsc.unsubscribe();
      }
    });
  }

  sendTo(route: string) {
    this.router.navigateByUrl(route);
  }

  // save(
  //   title: string, scramble: string, route: string, cubeType: PuzzleType,
  //   cubeMode: CubeMode, order: number, timer: boolean) {

  //   let card: Card = {
  //     cube: LOADING_IMG,
  //     route,
  //     title,
  //     timer,
  //     ready: false
  //   };

  //   this.cards.push(card);

  //   this.dataService.sendCard({
  //     title,
  //     scramble,
  //     route,
  //     cubeType,
  //     cubeMode: +cubeMode,
  //     order: [+order],
  //     timer: !!timer
  //   }).pipe(take(1))
  //     .subscribe({
  //       error: () => {
  //         let pos = this.cards.indexOf(card);
  //         this.cards.splice(pos, 1);
  //       }
  //     });  
  // }

}
