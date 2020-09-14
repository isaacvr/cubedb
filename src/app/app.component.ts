import { Component, AfterViewInit } from '@angular/core';
import { perlin2 } from 'app/utils/perlin';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  constructor() {}

  ngAfterViewInit() {
    const W = window.screen.width;
    const H = window.screen.height;
    
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');

    canvas.width = W;
    canvas.height = H;

    let data = ctx.createImageData(W, H);

    const f = 0.002;
    
    let A = [
      [236, 100],
      [64, 181],
      [122, 246],
    ];
    
    for (let x = 0; x < W; x += 1) {
      for (let y = 0; y < H; y += 1) {
        let noise = perlin2(x * f, y * f);
        let pos = 4 * (W * y + x);
        for (let k = 0; k < 3; k += 1) {
          data.data[ pos + k ] = A[k][0] * (1 - noise) + A[k][1] * noise;
        }
        data.data[ pos + 3 ] = 255;
      }
    }

    ctx.putImageData(data, 0, 0);

    document.body.style.backgroundImage = "url(" + canvas.toDataURL() + ")";

  }
}
