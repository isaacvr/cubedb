import { generateCubeBundle } from 'app/cube-drawer';
import { Puzzle } from './classes/puzzle/puzzle';
import { ThemeService } from './services/theme.service';
import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  cube: Puzzle;
  img: string;
  constructor(private theme: ThemeService) {
    this.img = '';
    this.cube = Puzzle.fromSequence('R U R U2', {
      type: 'rubik',
      view: 'trans',
    });

    let subsc = generateCubeBundle([this.cube]).subscribe({
      next: (res: string) => {
        this.img = res;
      },
      complete: () => {
        subsc.unsubscribe();
      }
    });
  }

  ngAfterViewInit() {
    this.theme.initialize();
  }
}
