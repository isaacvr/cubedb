import { Pipe, PipeTransform } from '@angular/core';

export function transform(val: number, dec?: boolean, suff?: boolean, html?: boolean): string {
  // console.log("transform: ", value, decimals, suffix);
  if ( isNaN(val) ) {
    // console.log('transform: ISNAN');
    return ( dec ) ? "0.00" : "0";
  }

  let v = ~~(val / 10);
  let ms = v % 100;
  v = ~~(v / 100);
  
  let s = v % 60;
  v = ~~(v / 60);

  let m = v % 60;
  v = ~~(v / 60);

  let h = v % 60;
  v = ~~(v / 60);

  let p1 = [h, m].filter(e => e != 0);
  p1.push(s);

  let sf = [ 's', 'm', 'h' ][ p1.length - 1 ];

  let newP1 = p1.map((e, p) => {
    if ( p > 0 ) {
      return ['', '<span class="digit">'][~~html] + ("00" + e).substr(-2, 2) + ['', '</span>'][~~html];
    } else {
      return ['', '<span class="digit">'][~~html] + e + ['', '</span>'][~~html];
    }
  }).join(":");

  let time = (( dec || (suff && sf === 's') )
    ? newP1 + `.${['', '<span class="digit">'][~~html] + ('00' + ms).substr(-2, 2) + ['', '</span>'][~~html]}`
    : newP1);

  let sfx = (suff) ? sf : '';

  return time + sfx;

}

@Pipe({
  name: 'timer'
})
export class TimerPipe implements PipeTransform {

  transform(v: number, d?: boolean, s ?: boolean, h?: boolean): string {
    return transform(v, d, s, h);
  }

}
