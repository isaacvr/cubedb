import { LOADING_IMG } from './../../constants/constants';
import { Puzzle } from '../../classes/puzzle/puzzle';
import { Component, OnDestroy, HostListener } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Card, Algorithm } from '../../interfaces/interfaces';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { generateCubeBundle } from '../../cube-drawer';

function nameToPuzzle(name: string) {
  const reg1 = /^(\d*)[xX](\d*)$/;
  const reg2 = /^(\d*)[xX](\d*)[xX](\d*)$/;
  const reg3 = /^(\d){3}$/;

  let dims;

  if ( reg1.test(name) ) {
    return [ 'rubik', +name.replace(reg1, "$1") ];
  } else if ( reg2.test(name) ) {
    dims = name.replace(reg2, "$1 $2 $3").split(" ").map(Number);
    return [ 'rubik', ...dims ];
  } else if ( reg3.test(name) ) {
    dims = name.split('').map(Number);
    return ['rubik', ...dims];
  }

  switch(name) {

    case 'sq1':
    case 'Square-1': {
      return [ 'square1' ];
    }
    case 'Skewb': {
      return [ 'skewb' ];
    }
    case 'Pyraminx': {
      return [ 'pyraminx' ];
    }
    case 'Axis': {
      return [ 'axis' ];
    }
    case 'Fisher': {
      return [ 'fisher' ];
    }
    case 'Ivy': {
      return [ 'ivy' ];
    }
    default: {
      return [ 'rubik', 3 ];
    }
  }
  
}

@Component({
  selector: 'app-algorithms',
  templateUrl: './algorithms.component.html',
  styleUrls: ['./algorithms.component.scss']
})
export class AlgorithmsComponent implements OnDestroy {
  cards: Card[]
  cases: Algorithm[]
  type: number;
  columns: string[];
  MAX_ELEMENTS: number;
  selectedCase: Algorithm;

  private lastUrl: string;
  private algSubs: Subscription;
  private eventSubs: Subscription;

  constructor(
    // private route: ActivatedRoute,
    private router: Router,
    private algorithms: DataService) {
      
      this.columns = [ 'case', 'image', 'algorithms' ];
      this.cards = [];
      this.cases = [];
      this.type = 0;
      this.MAX_ELEMENTS = 4;
      this.selectedCase = null;
      this.lastUrl = '';

      this.algSubs = this.algorithms.algSub.subscribe((algs: Algorithm[]) => {
        this.handleAlgorithms(algs);
      });

      this.eventSubs = this.router.events.subscribe((event) => {
        if ( event instanceof NavigationEnd ) {
          let url = this.router.parseUrl( event.url );
          let segments;

          if ( !url.root.children.primary ) {
            segments = [];
          } else {
            segments = url.root.children.primary.segments.map(e => e.path);
            segments.shift();
          }

          let newUrl = segments.join('/');

          if ( newUrl === this.lastUrl && newUrl != '' ) {

            let caseName = url.queryParamMap.get('case');
            let selectedCase = this.cases.filter(e => e.shortName === caseName);
            
            if ( selectedCase.length === 0 ) {
              this.type = 2;
            } else {
              this.selectedCase = selectedCase[0];
              this.type = 3;
            }

            return;
          }

          this.lastUrl = newUrl;
          
          this.cards.length = 0;
          this.cases.length = 0;

          this.algorithms.getAlgorithms(newUrl);    

        }

      });
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if ( event.code === 'Escape' ) {
      if ( this.type === 3 ) {
        let dir = this.router.url.split('?');
        this.router.navigateByUrl(dir[0]);
      }
    }
  }

  ngOnDestroy() {
    this.algSubs.unsubscribe();
    this.eventSubs.unsubscribe();
  }

  handleAlgorithms(list: Algorithm[]) {
    this.type = 0;
    this.cards.length = 0;
    this.cases.length = 0;

    if ( list.length > 0 ) {
      let hasSolutions = list.find(l => l.hasOwnProperty('solutions'));
      if ( hasSolutions ) {
        for (let i = 0, maxi = list.length; i < maxi; i += 1) {
          if ( !list[i].hasOwnProperty('solutions') ) {
            list[i].solutions = [{
              moves: list[i].scramble,
              votes: 0
            }];
          }
        }
        this.type = 2;
      }
    }

    list.sort(function(a, b): number {
      let A = a.name.split(' ').map(e => e.toLowerCase());
      let B = b.name.split(' ').map(e => e.toLowerCase());

      for (let i = 0, maxi = Math.min(A.length, B.length); i < maxi; i += 1) {
        if ( A[i] != B[i] ) {
          if ( !isNaN( parseInt(A[i]) ) && !isNaN( parseInt(B[i]) ) ) {
            return parseInt(A[i]) - parseInt(B[i]);
          } else {
            return A[i] < B[i] ? -1 : 1;
          }
        }
      }

      return a < b ? -1 : 1;
    });

    let cubes = list.map(e => {
      let args = nameToPuzzle(e.puzzle);
      let seq = e.scramble + " z2";
      return Puzzle.fromSequence(seq, {
        type: args[0],
        order: args.slice(1, args.length),
        mode: e.mode,
        view: e.view,
        tips: e.tips
      }, true);
    });

    for (let i = 0, maxi = list.length; i < maxi; i += 1) {
      let e = list[i];
      if ( this.type < 2 ) { 
        this.cards.push({
          title: e.name,
          cube: LOADING_IMG,
          ready: false,
          route: '/algorithms/' + e.parentPath + '/' + e.shortName
        });
      } else {
        e.cube = LOADING_IMG;
        e.ready = false;
        e.parentPath = '/algorithms/' + e.parentPath;
        this.cases.push(e);
      }
    }
    
    let subs = generateCubeBundle(cubes, null, true).subscribe({
      next: (imgs: string[]) => {
        if ( this.type < 2 ) {
          for (let i = 0, maxi = imgs.length; i < maxi; i += 1) {
            this.cards[i].cube = imgs[i];
            this.cards[i].ready = true;
          }
        } else {
          for (let i = 0, maxi = imgs.length; i < maxi; i += 1) {
            this.cases[i].cube = imgs[i];
            this.cases[i].ready = true;
          }
        }
      },
      complete: () => { subs.unsubscribe(); },
      error: () => { subs.unsubscribe(); },
    });//*/

  }
}
