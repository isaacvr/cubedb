import { Color } from './../classes/Color';
import { perlin2, noiseSeed } from 'app/utils/perlin';
import { Injectable } from '@angular/core';
import { THEMES } from '../themes';
import { FONTS } from './../fonts/index';
import { Subject } from 'rxjs';

export function generateRandomImage(from: string, to: string, W: number, H: number, factor?: number): string {
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');

  canvas.width = W;
  canvas.height = H;

  let data = ctx.createImageData(W, H);

  const f = factor || 0.001;
  let rgb1 = (new Color(from)).toArray();
  let rgb2 = (new Color(to)).toArray();
  
  noiseSeed(Date.now());

  for (let x = 0; x < W; x += 1) {
    for (let y = 0; y < H; y += 1) {
      let noise = perlin2(x * f, y * f);
      let pos = 4 * (W * y + x);
      for (let k = 0; k < 3; k += 1) {
        data.data[ pos + k ] = rgb1[k] * (1 - noise) + rgb2[k] * noise;
      }
      data.data[ pos + 3 ] = 255;
    }
  }

  ctx.putImageData(data, 0, 0);

  return canvas.toDataURL();
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  subscr: Subject<string>;
  constructor() {
    this.subscr = new Subject<string>();
  }

  initialize() {
    let theme = localStorage.getItem('theme');
    let rfont = localStorage.getItem('--regular-font');
    let tfont = localStorage.getItem('--timer-font');

    this.setTheme(theme);
    this.setRegularFont(rfont);
    this.setTimerFont(tfont);
  }

  setBackground(from: string, to: string) {
    const W = window.screen.width;
    const H = window.screen.height;
    let res = generateRandomImage(from, to, W, H);
    document.body.style.backgroundImage = "url(" + res + ")";
  }

  setTheme(name: string) {
    let theme;

    if ( THEMES.has(name) ) {
      theme = THEMES.get(name);
      localStorage.setItem('theme', name);
    } else {
      theme = THEMES.get('default');
      localStorage.setItem('theme', 'default');
    }

    this.subscr.next(localStorage.getItem('theme'));
    this.setBackground(theme[0][0], theme[1][0]);

    for (let i = 2, maxi = theme.length; i < maxi; i += 1) {
      document.documentElement.style.setProperty(theme[i][0], theme[i][1]);
    }
  }

  getTheme(): string {
    let t = localStorage.getItem('theme') || 'default';
    this.subscr.next(t);
    return t;
  }

  private setFont(key: string, font: string) {
    if ( FONTS.has(font) ) {
      document.documentElement.style.setProperty(
        key,
        FONTS.get(font)
      );
      localStorage.setItem(key, font);
    } else {
      document.documentElement.style.setProperty(key, 'Roboto');
      localStorage.setItem(key, 'Roboto');
    }
  }

  setRegularFont(font: string) {
    this.setFont('--regular-font', font);
  }

  getRegularFont() {
    return localStorage.getItem('--regular-font');
  }
  
  setTimerFont(font: string) {
    this.setFont('--timer-font', font);
  }

  getTimerFont() {
    return localStorage.getItem('--timer-font');
  }
}
