import { DataService } from '../../services/data.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent {
  date;
  constructor(private dataService: DataService) {
    this.date = Date.now();

    setInterval(() => {
      this.date = Date.now();
    }, 1000);
  }

  minimize() {
    this.dataService.window.minimize();
  }

  maximize() {
    if ( this.dataService.window.isMaximized ) {
      this.dataService.window.unmaximize();
    } else {
      this.dataService.window.maximize();
    }
  }

  close() {
    this.dataService.close();
  }

}
