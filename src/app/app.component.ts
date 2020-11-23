import { generateCubeBundle } from 'app/cube-drawer';
import { Puzzle } from './classes/puzzle/puzzle';
import { ThemeService } from './services/theme.service';
import { Component, AfterViewInit } from '@angular/core';
import { CubeMode } from './constants/constants';
import { PuzzleType } from './types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  constructor(private theme: ThemeService) {}

  ngAfterViewInit() {
    this.theme.initialize();
    this.theme.setTheme('default');
  }
}
