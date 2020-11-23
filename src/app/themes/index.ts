export var THEMES: Map<string, string[][]> = new Map<string, string[][]>();
export var THEME_NAMES: Map<string, string> = new Map<string, string>();

export function regTheme(code: string, name: string, rules: string[][]) {
  THEMES.set(code, rules);
  THEME_NAMES.set(code, name);
}

/// DEFAULT
regTheme('default', 'Mixed (default)', [
  [ "rgb(236,64,122)" ],
  [ "rgb(100,181,246)" ],
  ['--primary', 'rgb(91, 116, 226)' ],
  ['--accent', 'rgba(255, 255, 255, 0.3)' ],
  ['--light', 'rgba(255, 255, 255, 0.6)' ],
  ['--bgcard', 'rgba(255, 255, 255, 0.93)' ],
  ['--text-dark', 'black' ],
  ['--text-light', 'white' ],
]);

/// DARK 
regTheme('dark', 'Dark', [
  [ "rgb(33,33,33)" ],
  [ "rgb(33,33,33)" ],
  ['--primary', 'rgb(125,89,156)', ],
  ['--accent', 'rgb(116, 16, 109)', ],
  ['--light', 'rgba(255, 255, 255, 0.1)', ],
  ['--bgcard', '#323232', ],
  ['--text-dark', '#ffffff63', ],
  ['--text-light', 'white', ],
]);

/// GREEN
regTheme('green', 'Green', [
  [ "#00dde0" ],
  [ "#01ad07" ],
  ['--primary', 'rgb(0, 170, 84)' ],
  ['--accent', 'rgba(255, 255, 255, 0.3)' ],
  ['--light', 'rgba(255, 255, 255, 0.6)' ],
  ['--bgcard', 'rgba(255, 255, 255, 0.93)' ],
  ['--text-dark', 'black' ],
  ['--text-light', 'white' ],
]);