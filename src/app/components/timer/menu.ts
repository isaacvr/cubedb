interface Menu {
  0: string,
  1: { 0: string, 1: string, 2: number }[]
}

export const MENU: Menu[] = [
  [
    'WCA',
    [
      ['3x3x3', "333", 0],
      ['2x2x2', "222so", 0],
      ['4x4x4', "444wca", -40],
      ['5x5x5', "555wca", -60],
      ['6x6x6', "666wca", -80],
      ['7x7x7', "777wca", -100],
      ['3x3x3 BLD', "333ni", 0],
      ['3x3 FM', "333fm", 0],
      ['3x3 OH', "333oh", 0],
      ['Clock', "clkwca", 0],
      ['Megaminx', "mgmp", -70],
      ['Pyraminx', "pyrso", -10],
      ['Skewb', "skbso", 0],
      ['Sq-1', "sqrs", 0],
      ['4x4 BLD', "444bld", -40],
      ['5x5 BLD', "555bld", -60],
      ['MBLD', "r3ni", 5],
    ]
  ],
  [
    '3x3x3',
    [
      ["Random State (WCA)", "333", 0],
      ['Random Move', "333o", 25],
      ['Edges only', "edges", 0],
      ['Corners only', "corners", 0],
      ['Last Layer (LL)', "ll", 0],
      ['ZBLL', "zbll", 0],
      ['LL Corners', "cll", 0],
      ['LL Edges', "ell", 0],
      ['Last six edges', "lse", 0],
      ['Last six edges <M,U>', "lsemu", 0],
      ['Roux L10P', "cmll", 0],
      ['F2L', "f2l", 0],
      ['LL and LE', "lsll2", 0],
      ['2GLL', "2gll", 0],
      ['ZBLS', "zbls", 0],
      ['ZZLL', "zzll", 0],
      ['OLL', "oll", 0],
      ['PLL', "pll", 0],
      ['EOLine', "eoline", 0],
      ['Easy Cross', "easyc", 3],
      ['3x3 FT', "333ft", 0]
    ]
  ],
  [
    '3x3x3 subsets', 
    [
      ['2-generator R,U', "2gen", 25],
      ['2-generator L,U', "2genl", 25],
      ['Roux-generator M,U', "roux", 25],
      ['3-generator F,R,U', "3gen_F", 25],
      ['3-generator R,U,L', "3gen_L", 25],
      ['3-generator R,r,U', "RrU", 25],
      ['half turns only', "half", 25],
      ['last slot + last layer (old)', "lsll", 15]
    ]
  ],
	[
    '2x2x2',
    [
      ["Random State (WCA)", "222so", 0],
      ['Optimal', "222o", 0],
      ['3-gen', "2223", 25],
      ['EG', "222eg", 0],
      ['EG0', "222eg0", 0],
      ['EG1', "222eg1", 0],
      ['EG2', "222eg2", 0],
      ['No Bar', "222nb", 0]
    ]
  ],
	[
    '4x4x4',
    [
      ["WCA", "444wca", -40],
      ['Random State', "444m", 40],
      ['SiGN', "444", 40],
      ['YJ', "444yj", 40],
      ['Edges', "4edge", 8],
      ['R,r,U,u', "RrUu", 40]
    ]
  ],
	[
    '5x5x5',
    [
      ["WCA", "555wca", 60],
      ['SiGN', "555", 60],
      ['Edges', "5edge", 8]
    ]
  ],
	[
    '6x6x6',
    [
      ["WCA", "666wca", 80],
      ['SiGN', "666si", 80],
      ['Prefix', "666p", 80],
      ['Suffix', "666s", 80],
      ['Edges', "6edge", 8]
    ]
  ],
	[
    '7x7x7',
    [
      ["WCA", "777wca", 100],
      ['SiGN', "777si", 100],
      ['Prefix', "777p", 100],
      ['Suffix', "777s", 100],
      ['Edges', "7edge", 8]
    ]
  ],
	[
    'Clock',
    [
      ['JAAP', "clk", 0],
      ['WCA', "clkwca", 0],
      ['Optimal', "clko", 0],
      ['Conciso', "clkc", 0],
      ['Efficient Pin Order', "clke", 0]
    ]
  ],
	[
    'Megaminx',
    [
      ["WCA", "mgmp", 70],
      ['Carrot', "mgmc", 70],
      ['Old Style', "mgmo", 70]
    ]
  ],
	[
    'Pyraminx',
    [
      ["Random State (WCA)", "pyrso", 10],
      ['Optimal', "pyro", 0],
      ['Random Move', "pyrm", 25],
      ['L4E', "pyrl4e", 0],
      ['4 tips', "pyr4c", 0],
      ['No bar', "pyrnb", 0]
    ]
  ],
	[
    'Skewb',
    [
      ["Random State (WCA)", "skbso", 0],
      ['Optimal', "skbo", 0],
      ['Random Move', "skb", 25],
      ['No bar', "skbnb", 0]
    ]
  ],
	[
    'Square-1',
    [
      ["Random State (WCA)", "sqrs", 0],
      ["CSP", "sqrcsp", 0],
      ['Face Turn Metric', "sq1h", 40],
      ['Twist Metric', "sq1t", 20]
    ]
  ],
];