import { DataService } from '../../services/data.service';
import { Component, OnInit } from '@angular/core';
import { Tutorial } from '../../interfaces/interfaces';

interface TutorialGroup {
  [name: string]: Tutorial[]
}

@Component({
  selector: 'app-tutorials',
  templateUrl: './tutorials.component.html',
  styleUrls: ['./tutorials.component.scss']
})
export class TutorialsComponent {
  tutorials: TutorialGroup;
  keys: string[];

  constructor(private dataService: DataService) {

    this.dataService.getTutorials().then(list => {
      this.tutorials = {};

      console.log('LIST', list);

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
    // this.keys = [ "2x2x2", "3x3x3", "4x4x4" ];
    // this.tutorials = {
    //   "2x2x2": [
    //     {
    //       title: "Beginner",
    //       puzzle: "2x2x2",
    //     },
    //   ],
    //   "3x3x3": [
    //     {
    //       title: "Beginner",
    //       puzzle: "3x3x3",
    //     },
    //     {
    //       title: "Reduced CFOP",
    //       puzzle: "3x3x3",
    //     },
    //   ],
    //   "4x4x4": [
    //     {
    //       title: "Beginner",
    //       puzzle: "4x4x4",
    //     },
    //     {
    //       title: "Yau",
    //       puzzle: "4x4x4",
    //     },
    //     {
    //       title: "Free Slice",
    //       puzzle: "4x4x4",
    //     },
    //   ],
    // };
  }

}
