import { DataService } from '../../services/data.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Tutorial } from '../../interfaces/interfaces';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

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

  constructor(private dataService: DataService,
    public dialog: MatDialog) {

    this.subscription = this.dataService.tutSub.subscribe(list => {
      let type = list[0];
      let content = <Tutorial[]> list[1];

      console.log("RESPONSE: ", list);

      if ( type === 'get-tutorials' || type === 'add-tutorial' ) {

        if ( type === 'add-tutorial' && content ) {
          content = [ <any>content ];
        } else {
          this.tutorials = {};
        }

        for (let i = 0, maxi = content.length; i < maxi; i += 1) {
          if ( !this.tutorials.hasOwnProperty(content[i].puzzle) ) {
            this.tutorials[ content[i].puzzle ] = [];
          }

          this.tutorials[ content[i].puzzle ].push( content[i] );
        }

        this.keys = Object.keys(this.tutorials);
        this.keys.sort();

        for (let i = 0, maxi = this.keys.length; i < maxi; i += 1) {
          this.tutorials[ this.keys[i] ].sort((t1, t2) => t1.title < t2.title ? -1 : 1);
        }
      }

    });
    
    this.dataService.getTutorials();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private openDialog(type: string, data: any, handler) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        type,
        data
      }
    });

    const subscr = dialogRef.afterClosed().subscribe((data) => {
      document.documentElement.style.setProperty('--panel-height', '');
      document.documentElement.style.setProperty('--panel-padding', '24px');
      subscr.unsubscribe();
      handler(data);
    });
  }

  addTutorial() {
    this.openDialog('add-tutorial', null, (data) => {
      if ( data ) {
        this.dataService.addTutorial(data);
      }
    });
  }

}
