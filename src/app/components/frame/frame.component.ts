import { DataService } from '../../services/data.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent {

  constructor(private dataService: DataService) { }

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
