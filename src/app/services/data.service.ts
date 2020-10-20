import { Solve, Penalty } from './../interfaces/interfaces';
import { Subject, Observable } from 'rxjs';
import { RawCard } from '../interfaces/interfaces';
import { Tutorial } from '../interfaces/interfaces';
import { Injectable, NgZone } from '@angular/core';
import { Algorithm } from '../interfaces/interfaces';
import { IpcRenderer, BrowserWindow } from 'electron';
import { HttpClient } from '@angular/common/http';
import { records } from './data';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  ipc: IpcRenderer;
  window: BrowserWindow;
  algSub: Subject< Algorithm[] >;
  cardSub: Subject< RawCard[] >;
  tutSub: Subject< Tutorial[] >;
  recSub: Subject< Solve[] >;
  scrambleSub: Subject< any[] >;

  constructor(private http: HttpClient, private ngZone: NgZone) {
    this.algSub = new Subject< Algorithm[] >();
    this.cardSub = new Subject< RawCard[] >();
    this.tutSub = new Subject< Tutorial[] >();
    this.recSub = new Subject< Solve[] >();
    this.scrambleSub = new Subject< any[] >();
    
    let electron = window.require('electron');
    
    this.ipc = electron.ipcRenderer;
    this.window = electron.remote.getCurrentWindow();
    
    this.setIpc();
  }

  setIpc() {
    this.ipc.on('algorithms', (event, algs) => {
      this.ngZone.run(() => {
        this.algSub.next(algs);
      });
    });

    this.ipc.on('cards', (event, cards) => {     
      this.ngZone.run(() => {
        this.cardSub.next(cards);
      });
    });

    this.ipc.on('tutorials', (event, tuts) => {
      this.ngZone.run(() => {
        this.tutSub.next(tuts);
      });
    });

    this.ipc.on('scramble', (event, tuts) => {
      this.ngZone.run(() => {
        this.scrambleSub.next(tuts);
      });
    });

    this.ipc.on('records', (event, recs) => {
      this.ngZone.run(() => {
        this.recSub.next(recs);
      });
    });

  }

  getAlgorithms(dir: string): void {
    this.ipc.send('algorithms', dir);
  }

  getCards(): void {
    this.ipc.send('cards');
  }

  sendCard(card: RawCard): Observable<any> {
    return this.http.post('http://localhost/cards', card);
  }

  getTutorials() {
    this.ipc.send('tutorials');
  }

  getCrosses(scramble: string) {
    this.ipc.send('scramble', scramble);
  }

  getRecords() {
    // this.ipc.send('records');
    this.recSub.next(records.split('\n').map(e => e.trim()).filter(e => e != '').map(e => {
      let arr: string[] = JSON.parse('[' + e.replace(/;/g, ',') + ']');
      return {
        time: +arr[2],
        date: +arr[3],
        scramble: arr[4],
        penalty: (arr[5] === "0") ? Penalty.NONE : (arr[5] === "1") ? Penalty.P2 : Penalty.DNF,
        comments: arr[6],
        selected: false
      };
    }));
  }

  updateSolve(s: Solve) {
    // this.ipc.send('updateSolve', s);
  }

  minimize() {
    this.ipc.send('minimize');
  }

  maximize() {
    this.ipc.send('maximize');
  }

  close() {
    this.ipc.send('close');
  }
}
