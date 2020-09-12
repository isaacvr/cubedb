import { Subject, Observable } from 'rxjs';
import { RawCard } from '../interfaces/interfaces';
import { Tutorial } from '../interfaces/interfaces';
import { Injectable } from '@angular/core';
import { Algorithm } from '../interfaces/interfaces';
import { IpcRenderer } from 'electron';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  ipc: IpcRenderer;
  algSub: Subject< Algorithm[] >
  cardSub: Subject< RawCard[] >

  constructor(private http: HttpClient) {
    this.algSub = new Subject<Algorithm[]>();
    this.cardSub = new Subject<RawCard[]>();
    this.ipc = window.require('electron').ipcRenderer;
    this.setIpc();
  }

  setIpc() {
    this.ipc.on('algorithms', (event, algs) => {
      console.log('ALGORITHMS RECEIVED: ', algs);
      this.algSub.next(algs);
    });

    this.ipc.on('cards', (event, cards) => {
      console.log('CARDS RECEIVED: ', cards);
      this.cardSub.next(cards);
    });
  }

  getAlgorithms(dir: string): void {
    this.ipc.send('algorithms', dir);
    // fetch('http://localhost/algorithms/' + dir)
    //   .then(res => res.json())
    //   .then((algs: Algorithm[]) => {
    //     // console.log('ALGORITMOS!!!!!', algs);
    //     this.algSub.next( algs );
    //   });
  }

  getCards(): void {
    this.ipc.send('cards');
    // return fetch('http://localhost/cards')
    //   .then(res => res.json());
    // let subscription = this.http.get('http://localhost/' + dir)
    //   .subscribe((algs: Algorithm[]) => {
    //     console.log('ALGORITMOS!!!!!');
    //     this.subject.next( algs );

    //     subscription.unsubscribe();
    //   });
    /*return new Observable((observer: Observer<Algorithm[]>) => {
      this.ipc.on('algorithms', (event, algs) => {
        console.log('ALGORITHMS RECEIVED: ', algs);
        observer.next(algs);
        observer.complete();
        this.ipc.removeAllListeners('algorithms');
      });

      this.ipc.send('algorithm', dir);

      return {
        unsubscribe: () => {}
      }
    });//*/
  }

  sendCard(card: RawCard): Observable<any> {
    console.log('CARD: ', card);
    return this.http.post('http://localhost/cards', card);
  }

  getTutorials(): Promise< Tutorial[] > {
    return fetch('http://localhost/tutorials').then((res) => res.json());
  }
}
