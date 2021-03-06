export enum CubeMode {
  NORMAL = 0, OLL, PLL, CMLL, F2L, COLL, WV, ELL, VLS, ZBLL, OLLCP, GRAY, CENTERS, CROSS, FL, YCROSS
};

export const CubeModeMap = [
  [ 'Normal', CubeMode.NORMAL ],
  [ 'OLL', CubeMode.OLL ],
  [ 'PLL', CubeMode.PLL ],
  [ 'CMLL', CubeMode.CMLL ],
  [ 'F2L', CubeMode.F2L ],
  [ 'COLL', CubeMode.COLL ],
  [ 'WV', CubeMode.WV ],
  [ 'ELL', CubeMode.ELL ],
  [ 'VLS', CubeMode.VLS ],
  [ 'ZBLL', CubeMode.ZBLL ],
  [ 'OLLCP', CubeMode.OLLCP ],
  [ 'Gray', CubeMode.GRAY ],
  [ 'Centers', CubeMode.CENTERS ],
  [ 'Cross', CubeMode.CROSS ],
  [ 'First Layer', CubeMode.FL ],
  [ 'Yellow Cross', CubeMode.YCROSS ],
];

// export declare type ColorName = 'green' | 'red' | 'blue' | 'orange' | 'yellow' | 'white' | 'gray' | 'black';
export declare type ColorName = string;

const COLORS = {
  "green": "rgb(0, 157, 84)",
  "red": "rgb(220,66,47)",
  "blue": "rgb(61, 129, 246)",
  "orange": "rgb(232, 112, 0)",
  "yellow": "rgb(255,235,59)",
  "white": "rgb(230, 230, 230)",
  "black": "rgb(0, 0, 0)",
  "gray": "rgb(80, 80, 80)",
  "violet": "rgb(138, 27, 255)",
};

export function getColorByName(colorName: ColorName) {
  if ( COLORS.hasOwnProperty(colorName) ) {
    return COLORS[colorName];
  }

  return "rgb(150, 150, 150)";
}

export function getNameByColor(color: string): ColorName {
  for (let i in COLORS) {
    if ( COLORS[i] === color ) {
      return i;
    }
   }
  
  return "gray";
}

export function strToHex(color: string): number {
  let nums = color.split('(')[1].split(')')[0].split(',').map(Number);
  return (nums[0] << 16) | (nums[1] << 8) | (nums[2]);
}

export const STANDARD_PALETTE = {
  y: getColorByName('yellow'),
  r: getColorByName('red'),
  o: getColorByName('orange'),
  b: getColorByName('blue'),
  g: getColorByName('green'),
  w: getColorByName('white'),
  x: getColorByName('gray'),
  d: getColorByName('black'),
  v: getColorByName('violet'),
};

export const LOADING_IMG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAADnklEQVR4nO2csbGzMAzH1bpLT5MFfJcN/EZghMcGOTYIC7zCA6RgACrXKSkZQaPkKz47R3IB7FgyCfH/Tt0jFj+MLcniAWRlZWUBtG37I6XshBADAOAzK8vyr23bnxXdXF9N0/zCfyBXD8OvBmZnkw+oG7B1PF1Zfd/vwX9W3WDZ675LxpgDhIG6AsDVXvddyrAC9HWwEHE33vaVUmffa7XWJbwAy+6gXr4ppc6v+Eauvu/3T3YzFEIMiLibuqau66OUsoPwxf1ujLquj1OLPSLunvkGa2wQE6Bu9gjMGHOIBDQJTkrZjeOvCVDr7KhLoJwJIQatdckE6Sk0rXXpGbvxA/MF9SHGB8xjen+i4dT6GiW7m6x9c+RWFMWFFJQVrn1jTIaUkJwyLF8l2tWSG2ewuilYcwF0tF4sq7ylCSEG9jxzC8CSgHKq6/q4xk1SmfU/jT49OLX+8yvwkCHEUAgxSCk7KWVng0XkGquqqhMHnzsRzyqUUnZN0/zOlXW01uUI3mfMLsJZha4qETL+qKpA4kPo+EGygSnJbCLwIxoYV14I9jWJdTAalBMRMKTwBfq+3xtjDs4owgXqJ0mwfmJVVafxfQbVuOq6PhKuC3eOUR+/28CS3E/wWc/sH1APfgXgS1iJ1tGn0Gaj/LIs/1YZOEJ2trI84Nn1lSsyTxAxs8Ba8jv9EyIQ56s4Ny4LLO7TYMbzgfSwuPMw+/vbgGU3DjZxbkxz47LAymtWgHHvhoz1tWlYnE+Iq3mWKYpffiM4B+baETl3wsWUZ1SzooZGHsVz5YbBtbZxJm6MOdgdJ8ox6qqD/b0oMFFVhwXFPkWydkWKhwecffUET/IKBAVAIlC8IY0tAFKsESiEGEJ3SGPMgfDgAn2beWNE4ejdLJtbTBFxx9FumeTs0OZhlMDc2oFFUVyUUmel1Pnh7JByrGSzyonjBpJZshNpANbENYkl63XYQscya1+W0xZAOWMFtsXWbra1a6Ot3WwfQOEb3BwLMEpIThmWr4jywrczltdwC423jyaEGNg+dtoSsLdq7XZfmzLmd2PDoiguvlWRpK3dS8AeneHoCYURpHHVItS3JJpyas4ZY8xhVLV4FRwKIYaqqk5T680rvrELEXfjFmyl1Nk3hbAlkmBYvgXDR9+klB17Psilr/u/DjHKsAKUYQXoxQNStnbLT1AQrKTl4HdT4NFa0kOGt5TWurTJLD4z96UY63c2WVlZn6B/0UWegDs2u+cAAAAASUVORK5CYII=";