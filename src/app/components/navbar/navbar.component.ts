import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NavigationRoute } from '../../interfaces/interfaces';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  parts: NavigationRoute[];

  constructor(private router: Router) {
    this.parts = [];  
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        let parts = event.url.split(/[/?]/);
        console.log('PARTS', parts);

        this.parts.length = 0;

        this.parts.push({
          name: 'Home',
          link: '/'
        });

        for (let i = 1, maxi = parts.length; i < maxi; i += 1) {
          if ( parts[i].trim() === '' ) {
            continue;
          }
          
          if ( parts[i].indexOf('=') > -1 ) {
            break;
          } else {
            this.parts.push({
              name: parts[i],
              link: parts.slice(0, i + 1).join('/')
            });
          }
        }
      }
    });
  }

}
