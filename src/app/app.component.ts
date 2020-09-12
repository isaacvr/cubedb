import { CubeView } from './types';
import { Puzzle } from './classes/puzzle/puzzle';
import { CubeMode } from './constants/constants';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  cube: Puzzle;
  view: CubeView;
  constructor() {
    this.cube = new Puzzle({
      type: 'rubik',
      mode: CubeMode.NORMAL
    });
    this.cube.move("r b d");

    this.view = 'trans';
  }
}
