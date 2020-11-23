import { Subject, Observable } from 'rxjs';
import { RawCard } from '../interfaces/interfaces';
import { Tutorial } from '../interfaces/interfaces';
import { Injectable, NgZone } from '@angular/core';
import { Algorithm, Solve, Session } from '../interfaces/interfaces';
import { IpcRenderer, BrowserWindow } from 'electron';
import { HttpClient } from '@angular/common/http';
// import { records } from './data';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  ipc: IpcRenderer;
  window: BrowserWindow;
  algSub: Subject< Algorithm[] >;
  cardSub: Subject< RawCard[] >;
  tutSub: Subject< Tutorial[] >;
  solveSub: Subject< { type: string, data: Solve[] } >;
  sessSub: Subject< { type: string, data: Session | Session[] } >;

  constructor(private http: HttpClient, private ngZone: NgZone) {
    this.algSub = new Subject< Algorithm[] >();
    this.cardSub = new Subject< RawCard[] >();
    this.tutSub = new Subject< Tutorial[] >();
    this.solveSub = new Subject< { type: string, data: Solve[] } >();
    this.sessSub = new Subject< { type: string, data: Session[] } >();
  
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

    this.ipc.on('solves', (event, recs) => {
      this.ngZone.run(() => {
        this.solveSub.next({
          type: recs[0],
          data: recs[1]
        });
      });
    });

    this.ipc.on('session', (event, sess) => {
      this.ngZone.run(() => {
        this.sessSub.next({
          type: sess[0],
          data: sess[1]
        });
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

  getSolves() {
    this.ipc.send('get-solves');
    // this.solveSub.next(records.split('\n').map(e => e.trim()).filter(e => e != '').map(e => {
    //   let arr: string[] = JSON.parse('[' + e.replace(/;/g, ',') + ']');
    //   return {
    //     session: 'b19ahf90719fed9787c',
    //     time: +arr[2],
    //     date: +arr[3],
    //     scramble: arr[4],
    //     penalty: (arr[5] === "0") ? Penalty.NONE : (arr[5] === "1") ? Penalty.P2 : Penalty.DNF,
    //     comments: arr[6],
    //     selected: false
    //   };
    // }));
  }

  addSolve(s: Solve) {
    this.ipc.send('add-solve', s);
  }

  updateSolve(s: Solve) {
    this.ipc.send('update-solve', s);
  }

  removeSolves(s: Solve[]) {
    this.ipc.send('remove-solves', s.map(e => e._id));
  }

  getSessions() {
    this.ipc.send('get-sessions');
  }

  addSession(s: Session) {
    this.ipc.send('add-session', s);
  }

  removeSession(s: Session) {
    this.ipc.send('remove-session', s);
  }

  renameSession(s: Session) {
    this.ipc.send('rename-session', s);
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
