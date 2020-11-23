import { RawCard } from './../../interfaces/interfaces';
import { DataService } from '../../services/data.service';
import { Puzzle } from '../../classes/puzzle/puzzle';
import { Component, OnDestroy } from '@angular/core';
import { CubeMode, LOADING_IMG } from '../../constants/constants';
import { Router } from '@angular/router';
import { Card } from '../../interfaces/interfaces';
import { PuzzleType } from '../../types';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { generateCubeBundle } from 'app/cube-drawer';

const CARDS: Card[] = [
  {
    title: "Tutorials",
    route: "/tutorials",
    ready: false,
    timer: false,
    cube: Puzzle.fromSequence("z2", { type: 'rubik', mode: CubeMode.NORMAL, order: [3] }, true)
  }, {
    title: "Algorithms",
    route: "/algorithms",
    timer: false,
    ready: false,
    cube: Puzzle.fromSequence("F R' F' R U R U' R' z2", { type: 'rubik', mode: CubeMode.ZBLL, order: [3] }, true)
  }, {
    title: "Timer",
    route: "/timer",
    timer: true,
    ready: false,
    cube: Puzzle.fromSequence("z2", { type: 'rubik', mode: CubeMode.NORMAL, order: [3] }, true)
  }, {
    title: "Settings",
    route: "/settings",
    timer: false,
    ready: false,
    cube: Puzzle.fromSequence("z2", { type: 'rubik', mode: CubeMode.GRAY, order: [2] }, true)
  }, {
    title: "PLL Recognition",
    route: "/pll-trainer",
    timer: true,
    ready: false,
    cube: Puzzle.fromSequence("M2 U M2 U2 M2 U M2 z2", { type: 'rubik', mode: CubeMode.PLL, order: [3] }, true)
  }, {
    title: 'Import / Export',
    route: '/import_export',
    cube: './assets/cube_apps.png',
    ready: true,
    timer: false,
  }
];

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnDestroy {
  cards: Card[];
  testImg: string;
  isProduction: boolean;
  subscription: Subscription;

  constructor(
    private router: Router,
    private dataService: DataService
    ) {

    // this.isProduction = environment.production;
    this.isProduction = true;

    this.subscription = this.dataService.cardSub
      .subscribe((cards: RawCard[]) => {
        // cards.sort((c1, c2) => {
        //   return c1['createdAt'] - c2['createdAt'];
        // });
        
        // this.cards = cards.map((e) => {
        //   return {
        //     cube: LOADING_IMG,
        //     route: e.route,
        //     title: e.title,
        //     timer: e.timer,
        //     createdAt: e.createdAt,
        //     ready: false
        //   };
        // });

        // let cubes = cards.map(e => {
        //   return Puzzle.fromSequence(e.scramble + ' z2', {
        //     type: e.cubeType || 'rubik',
        //     mode: e.cubeMode || CubeMode.NORMAL,
        //     order: e.order || [3],
        //     tips: e.tips || [],
        //     view: e.view || "trans"
        //   }, true)
        // });

        // this.cards.push({
        //   cube: './assets/cube_apps.png',
        //   route: "/import_export",
        //   title: "Import / Export",
        //   timer: false,
        //   ready: true,
        // });

        this.cards = CARDS;
        let cubes = CARDS.reduce((ac, e) => {
          if ( e.cube instanceof Puzzle ) {
            ac.push(e.cube);
          }
          return ac;
        }, []);

        let subsc = generateCubeBundle(cubes, null, true, true).subscribe({
          next: (imgs: string[]) => {
            // for (let i = 0, maxi = cubes.length; i < maxi; i += 1) {
            //   this.cards[i].cube = imgs[i];
            //   this.cards[i].ready = true;
            // }
          },
          error: (err) => {
            subsc.unsubscribe();
          },
          complete: () => {
            subsc.unsubscribe();
          }
        });
        
        // console.log('CARDS: ', cards);
      });

    this.dataService.getCards();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  sendTo(route: string) {
    this.router.navigateByUrl(route);
  }

  save(
    title: string, scramble: string, route: string, cubeType: PuzzleType,
    cubeMode: CubeMode, order: number, timer: boolean) {
    console.log(title, scramble, route, cubeType, cubeMode, order, timer);

    let card: Card = {
      cube: LOADING_IMG,
      route,
      title,
      timer,
      ready: false
    };

    this.cards.push(card);

    this.dataService.sendCard({
      title,
      scramble,
      route,
      cubeType,
      cubeMode: +cubeMode,
      order: [+order],
      timer: !!timer
    }).pipe(take(1))
      .subscribe({
        error: () => {
          let pos = this.cards.indexOf(card);
          this.cards.splice(pos, 1);
        }
      });
  }

}
