import { rn, rndEl, rndProb } from '../lib/mathlib';

const DEBUG = false;

export function mega(turns, suffixes, length) {
  turns = turns || [[""]];
  suffixes = suffixes || [""];
  length = length || 0;
  var donemoves = 0;
  var lastaxis = -1;
  var s = [];
  var first, second;
  for (var i = 0; i < length; i++) {
    do {
      first = rn(turns.length);
      second = rn(turns[first].length);
      if (first != lastaxis) {
        donemoves = 0;
        lastaxis = first;
      }
    } while (((donemoves >> second) & 1) != 0);
    donemoves |= 1 << second;
    if (turns[first][second].constructor == Array) {
      s.push(rndEl(turns[first][second]) + rndEl(suffixes));
    } else {
      s.push(turns[first][second] + rndEl(suffixes));
    }
  }
  return s.join(' ');
}

/**
 *	{type: callback(type, length, state)}
  *	callback return: scramble string or undefined means delay
  */
export let scramblers: Map<string, Function> = new Map<string, Function> ();

/**
 *	{type: [str1, str2, ..., strN]}
  */
export let filters: Map<string, string[]> = new Map<string, string[]>();

/**
 *	{type: [prob1, prob2, ..., probN]}
  */
export let probs: Map<string, number[]> = new Map<string, number[]>();

/**
 *	filter_and_probs: [[str1, ..., strN], [prob1, ..., probN]]
  */
export function regScrambler(mode: string | string[], callback: Function, filter_and_probs?) {
  DEBUG && console.log('[regscr]', mode);

  if ( Array.isArray(mode) ) {
    for (let i = 0; i < mode.length; i++) {
      scramblers.set(mode[i], callback);
      filters.set(mode[i], []);
      probs.set(mode[i], []);
    }
  } else {
    scramblers.set(mode, callback);
    if (filter_and_probs != undefined) {
      filters.set(mode, filter_and_probs[0]);
      probs.set(mode, filter_and_probs[1]);
    }
  }

  return regScrambler;
}

/**
 *	format string,
  *		${args} => scramblers[scrType](scrType, scrArg)
  *		#{args} => mega(args)
  */
export function formatScramble(str) {
  var repfunc = function(match, p1) {
    if (match[0] == '$') {
      var args = [p1];
      if (p1[0] == '[') {
        args = JSON.parse(p1);
      }
      return scramblers.get(args[0]).apply(this, args);
    } else if (match[0] == '#') {
      return mega.apply(this, JSON.parse('[' + p1 + ']'));
    } else {
      return '';
    }
  };
  var re1 = /[$#]\{([^\}]+)\}/g;
  return str.replace(re1, repfunc);
}

export function rndState(filter, probs) {
  if (probs == undefined) {
    return undefined;
  }
  var ret = probs.slice();
  if (filter == undefined) {
    filter = ret;
  }
  for (var i = 0; i < filter.length; i++) {
    if (!filter[i]) {
      ret[i] = 0;
    }
  }
  return rndProb(ret);
}

export function fixCase(cases, probs) {
  return cases == undefined ? rndProb(probs) : cases;
}