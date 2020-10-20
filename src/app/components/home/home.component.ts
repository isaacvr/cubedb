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
// import { environment } from '../../../environments/environment';

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
        cards.sort((c1, c2) => {
          return c1['createdAt'] - c2['createdAt'];
        });
        
        this.cards = cards.map((e) => {
          return {
            cube: LOADING_IMG,
            route: e.route,
            title: e.title,
            timer: e.timer,
            createdAt: e.createdAt,
            ready: false,
          };
        });

        let cubes = cards.map(e => {
          return Puzzle.fromSequence(e.scramble, {
            type: e.cubeType || 'rubik',
            mode: e.cubeMode || CubeMode.NORMAL,
            order: e.order || [3],
            tips: e.tips || [],
            view: e.view || "trans"
          }, true)
        });

        // console.log('CUBES: ', cubes);

        let idx = 0;

        let subsc = generateCubeBundle(cubes).subscribe({
          next: (img) => {
            this.cards[idx].cube = <string>img;
            this.cards[idx].ready = true;
            idx += 1;
            // console.log("IMAGE!");
          },
          error: (err) => {
            // console.log("BUNDLE ERROR!!!", err);
          },
          complete: () => {
            // console.log("COMPLETE!!!");
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
