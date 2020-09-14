import { Subject, Observable } from 'rxjs';
import { RawCard } from '../interfaces/interfaces';
import { Tutorial } from '../interfaces/interfaces';
import { Injectable, NgZone } from '@angular/core';
import { Algorithm } from '../interfaces/interfaces';
import { IpcRenderer, BrowserWindow } from 'electron';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  ipc: IpcRenderer;
  window: BrowserWindow;
  algSub: Subject< Algorithm[] >
  cardSub: Subject< RawCard[] >
  tutSub: Subject< Tutorial[] >

  constructor(private http: HttpClient, private ngZone: NgZone) {
    this.algSub = new Subject< Algorithm[] >();
    this.cardSub = new Subject< RawCard[] >();
    this.tutSub = new Subject< Tutorial[] >();
    
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
