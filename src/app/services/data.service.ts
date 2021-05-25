import { Subject } from 'rxjs';
import { RawCard } from '../interfaces/interfaces';
import { Tutorial } from '../interfaces/interfaces';
import { Injectable, NgZone } from '@angular/core';
import { Algorithm, Solve, Session } from '../interfaces/interfaces';
import { IpcRenderer, BrowserWindow } from 'electron';
import { HttpClient } from '@angular/common/http';

interface TutorialData {
  0: string;
  1: Tutorial | Tutorial[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  ipc: IpcRenderer;
  window: BrowserWindow;
  algSub: Subject< Algorithm[] >;
  cardSub: Subject< RawCard[] >;
  tutSub: Subject< TutorialData >;
  solveSub: Subject< { type: string, data: Solve[] } >;
  sessSub: Subject< { type: string, data: Session | Session[] } >;
  isElectron: boolean;
  constructor(private http: HttpClient, private ngZone: NgZone) {
    this.algSub = new Subject< Algorithm[] >();
    this.cardSub = new Subject< RawCard[] >();
    this.tutSub = new Subject< TutorialData >();
    this.solveSub = new Subject< { type: string, data: Solve[] } >();
    this.sessSub = new Subject< { type: string, data: Session[] } >();

    if ( window.require ) {
      let electron = window.require('electron');
      this.ipc = electron.ipcRenderer;
      this.window = electron.remote.getCurrentWindow();
      this.isElectron = true;
      this.setIpc();
    } else {
      this.isElectron = false;
    }

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

    this.ipc.on('tutorial', (event, tuts) => {
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
    this.isElectron && this.ipc.send('algorithms', dir);
  }

  getCards(): void {
    this.isElectron && this.ipc.send('cards');
  }

  // sendCard(card: RawCard): Observable<any> {
  //   return this.http.post('http://localhost/cards', card);
  // }

  getTutorials() {
    this.isElectron && this.ipc.send('get-tutorials');
  }

  addTutorial(t: Tutorial) {
    this.isElectron && this.ipc.send('add-tutorial', t);
  }

  saveTutorial(t: Tutorial) {
    this.isElectron && this.ipc.send('update-tutorial', t);
  }

  getSolves() {
    this.isElectron && this.ipc.send('get-solves');
  }

  addSolve(s: Solve) {
    this.isElectron && this.ipc.send('add-solve', s);
  }

  updateSolve(s: Solve) {
    this.isElectron && this.ipc.send('update-solve', s);
  }

  removeSolves(s: Solve[]) {
    this.isElectron && this.ipc.send('remove-solves', s.map(e => e._id));
  }

  getSessions() {
    this.isElectron && this.ipc.send('get-sessions');
  }

  addSession(s: Session) {
    this.isElectron && this.ipc.send('add-session', s);
  }

  removeSession(s: Session) {
    this.isElectron && this.ipc.send('remove-session', s);
  }

  renameSession(s: Session) {
    this.isElectron && this.ipc.send('rename-session', s);
  }

  minimize() {
    this.isElectron && this.ipc.send('minimize');
  }

  maximize() {
    this.isElectron && this.ipc.send('maximize');
  }

  close() {
    this.isElectron && this.ipc.send('close');
  }
}
