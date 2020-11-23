import { DataService } from '../../services/data.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Tutorial } from '../../interfaces/interfaces';
import { Subscription } from 'rxjs';

interface TutorialGroup {
  [name: string]: Tutorial[]
}

@Component({
  selector: 'app-tutorials',
  templateUrl: './tutorials.component.html',
  styleUrls: ['./tutorials.component.scss']
})
export class TutorialsComponent implements OnDestroy {
  tutorials: TutorialGroup;
  keys: string[];
  subscription: Subscription;

  constructor(private dataService: DataService) {

    this.subscription = this.dataService.tutSub.subscribe(list => {
      this.tutorials = {};

      for (let i = 0, maxi = list.length; i < maxi; i += 1) {
        if ( !this.tutorials.hasOwnProperty(list[i].puzzle) ) {
          this.tutorials[ list[i].puzzle ] = [];
        }

        this.tutorials[ list[i].puzzle ].push( list[i] );
      }

      this.keys = Object.keys(this.tutorials);
      this.keys.sort();

      for (let i = 0, maxi = this.keys.length; i < maxi; i += 1) {
        this.tutorials[ this.keys[i] ].sort((t1, t2) => t1.title < t2.title ? -1 : 1);
      }

    });
    
    this.dataService.getTutorials();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
