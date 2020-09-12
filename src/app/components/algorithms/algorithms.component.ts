import { Puzzle } from '../../classes/puzzle/puzzle';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Card, Algorithm } from '../../interfaces/interfaces';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

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

      // console.log('Subscribing...');
      this.algSubs = this.algorithms.algSub.subscribe((algs: Algorithm[]) => {
        // console.log('LLEGARON LAS LLEGUAS');
        this.handleAlgorithms(algs);
      });

      this.eventSubs = this.router.events.subscribe((event) => {
        // console.log('EVENT: ', event instanceof NavigationEnd, event);
        if ( event instanceof NavigationEnd ) {
          let url = this.router.parseUrl( event.url );
          let segments;

          if ( !url.root.children.primary ) {
            segments = [];
          } else {
            segments = url.root.children.primary.segments.map(e => e.path);
            segments.shift();
          }

          // console.log('SEGMENTS: ', segments, url);

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

          // console.log('getAlgorithms', newUrl, Date.now());

          this.algorithms.getAlgorithms(newUrl);    

        }

      });
  }

  ngOnDestroy() {
    // console.log('Unsubscribe');
    this.algSubs.unsubscribe();
    this.eventSubs.unsubscribe();
  }

  escape() {
    console.log('ESC pressed');
  }

  handleAlgorithms(list: Algorithm[]) {
    this.type = 0;

    if ( list.length > 0 ) {
      let hasSolutions = false;

      for (let i = 0, maxi = list.length; i < maxi; i += 1) {
        if ( list[i].hasOwnProperty('solutions') ) {
          hasSolutions = true;
          break;
        }
      }
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
      } else {
        // console.log('List does not have property "solutions"');
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

    console.log('SORTED LIST', list);

    for (let i = 0, maxi = list.length; i < maxi; i += 1) {
      let e = list[i];
      let args = nameToPuzzle(e.puzzle);

      let cube = Puzzle.fromSequence(e.scramble, {
        type: args[0],
        order: args.slice(1, args.length),
        mode: e.mode,
        view: e.view,
        tips: e.tips
      }, true);

      if ( this.type < 2 ) {
        this.cards.push({
          title: e.name,
          cube,
          route: '/algorithms/' + e.parentPath + '/' + e.shortName
        });
      } else {
        e.cube = cube;
        e.parentPath = '/algorithms/' + e.parentPath;
        this.cases.push(e);
      }
    }
  }
}
