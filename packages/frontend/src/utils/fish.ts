const NUM_BODY_TEXTURES = 2;
const NUM_JAW_TEXTURES = 2;

export class Fish {
  tokenId: number;
	name: string;
	birth: number;
  vrf: string;
  rawValues: Array<number>;
	traits: Traits;

  constructor(tokenId: number, name: string, birth: number, traits: string) {
    this.tokenId = tokenId;
    this.name = name;
    this.birth = birth;
    this.vrf = traits;
    this.rawValues = this.parseVrf(traits);
    this.traits = this.parseTraits(this.rawValues);
  };

  parseTraits(traits: Array<number>): Traits {
    const colorSaturation = traits[0];
    const colorValue = traits[1];

    const fishTraits: Traits = {
      BodyColor1: {h: this.mapToHue(traits[2]), s: colorSaturation, v: colorValue},
      BodyColor2: {h: this.mapToHue(traits[3]), s: colorSaturation, v: colorValue},
      BodyColor3: {h: this.mapToHue(traits[4]), s: colorSaturation, v: colorValue},
      BodyTextures: traits[5] % NUM_BODY_TEXTURES,

      JawColor1: {h: this.mapToHue(traits[6]), s: colorSaturation, v: colorValue},
      JawColor2: {h: this.mapToHue(traits[7]), s: colorSaturation, v: colorValue},
      JawColor3: {h: this.mapToHue(traits[8]), s: colorSaturation, v: colorValue},
      JawTextures: traits[9] % NUM_JAW_TEXTURES,

      EyeColor1: {h: this.mapToHue(traits[10]), s: colorSaturation, v: colorValue},
      EyeColor2: {h: this.mapToHue(traits[11]), s: colorSaturation, v: colorValue},
      EyeColor3: {h: this.mapToHue(traits[12]), s: colorSaturation, v: colorValue}
    };
    

    return fishTraits;
  }

  parseVrf(vrf : string) {
		const hashPairs = [];

		for (let j = 0; j < 32; j++) {
				hashPairs.push(vrf.slice(2 + (j * 2), 4 + (j * 2)));
		}
		const decPairs = hashPairs.map(x => {
				return parseInt(x, 16);
		});

		console.log(decPairs);
		return decPairs;
	}

  mapToHue(value: number, in_min = 0, in_max = 255, out_min = 0, out_max = 360): number {
    return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  } 
}

type Color = {
  h: number,
  s: number,
  v: number
}


type Traits = {
  EyeColor1: Color,
  EyeColor2: Color,
  EyeColor3: Color,
  // EyeSize: number,

  BodyTextures: number,
  BodyColor1: Color,
  BodyColor2: Color,
  BodyColor3: Color,
  // BodySize: number,

  JawTextures: number,
  JawColor1: Color,
  JawColor2: Color,
  JawColor3: Color,
  // JawSize: number,

  // TopFins: number,
  // TopFinsTextures: number,
  // TopFinsColor1: Color,
  // TopFinsColor2: Color,
  // TopFinsColor3: Color,
  // TopFinsSize: number,

  // BottomFin: number, // type of model, do we want this as a string?
  // BottomFinsCount: number
  // BottomFinsTextures: number,
  // BottomFinsColor1: Color,
  // BottomFinsColor2: Color,
  // BottomFinsColor3: Color,
  // BottomFinsSize: number,

  // SideFin: number,
  // SideFinCount: number //=2-4
  // SideFinTextures: number,
  // SideFinColor1: Color,
  // SideFinColor2: Color,
  // SideFinColor3: Color,
  // SideFinSize: number,

  // TailFin: number, //model*
  // TailFinTextures: number,
  // TailFinColor1: Color,
  // TailFinColor2: Color,
  // TailFinColor3: Color,
  // TailFinSize: number
}