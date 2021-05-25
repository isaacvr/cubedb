import { generateCubeBundle } from 'app/cube-drawer';
import { Puzzle } from './classes/puzzle/puzzle';
import { ThemeService } from './services/theme.service';
import { Component, AfterViewInit } from '@angular/core';
import { CubeMode } from './constants/constants';
import { PuzzleType } from './types';
import { Vector3D } from './classes/vector3d';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  cube: Puzzle;
  constructor(private theme: ThemeService) {
    // this.cube = new Puzzle({
    //   type: 'megaminx',
    //   order: [3],
    //   view: '2d'
    // });

    // let sub = generateCubeBundle([this.cube], 500, null, true).subscribe({
    //   next: () => { sub.unsubscribe(); }
    // });
  }

  ngAfterViewInit() {
    this.theme.initialize();
    // this.theme.setTheme('dark');
  }
}
