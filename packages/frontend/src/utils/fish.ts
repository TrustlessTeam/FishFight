const fishType = [
  {
    name: "GenesisFish",
    ranges: {
      ColorPrimary: [0, 360],
      ColorSecondary: [0, 360],
      ColorTertiary: [0, 360],
      ColorEyePrimary: [0, 360],
      ColorEyeSecondary: [0, 360],
      ColorEyeTertiary: [0, 360],

      // Head options
      HeadEdges: [0, 100], // need to know upper range index for each option, using 2 for now
      HeadNose: [0, 100],
      HeadFrills: [0, 100],
      HeadFlat: [0, 100],
      HeadSplit: [0, 100],
      HeadFlatnose: [0, 100],
      HeadFat: [0, 100], // refers to body

      // Textures
      TextureBodyPrimary: [0, 2], // need to know upper range index for each option, using 2 for now
      TextureBodySecondary: [0, 2],
      TextureFinPrimary: [0, 2],
      TextureFinSecondary: [0, 2],
      TextureTailPrimary: [0, 2],
      TextureTailSecondary: [0, 2],
      TextureJawPrimary: [0, 2],
      TextureJawSecondary: [0, 2]
    }
  },
  // {
  //   name: "Location2Fish", //ex: location 2 fish could be favored to the blue color spectrum
  //   ranges: {
  //     ColorPrimary: [180, 260], // so to favor blue spectrum we set the hue range to be 180-260
  //     ColorSecondary: [180, 260],
  //     ColorTertiary: [180, 260],
  //     ColorEyePrimary: [180, 260],
  //     ColorEyeSecondary: [180, 260],
  //     ColorEyeTertiary: [180, 260],

  //     // Head options
  //     HeadEdges: [3, 5], // Let's say we added more head options specifically for the location 2 fish,
  //     HeadNose: [3, 5], // they get the range 3 - 5, in this case I did all ranges, but it could be just one property
  //     HeadFrills: [3, 5],
  //     HeadFlat: [3, 5],
  //     HeadSplit: [3, 5],
  //     HeadFlatnose: [3, 5],
  //     HeadFat: [3, 5],

  //     // Textures
  //     TextureBodyPrimary: [0, 3], // similar as above, let's say location 2 fish have the chance have a new body texture type
  //     TextureBodySecondary: [0, 2], // so we now have a TextureBodyPrimary [0, 3], so they still can get the original as well
  //     TextureFinPrimary: [0, 2],
  //     TextureFinSecondary: [0, 2],
  //     TextureTailPrimary: [0, 2],
  //     TextureTailSecondary: [0, 2],
  //     TextureJawPrimary: [0, 2],
  //     TextureJawSecondary: [0, 2]
  //   }
  // }
];

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
    const fishTypeIndex = 0;//traits[0];
    const colorSaturation = traits[1];
    const colorValue = traits[2];

    const fishTraits: Traits = {
      // Color trait mapping
      ColorPrimary: {h: this.mapToHue(traits[3]), s: colorSaturation, v: colorValue},
      ColorSecondary: {h: this.mapToHue(traits[4]), s: colorSaturation, v: colorValue},
      ColorTertiary: {h: this.mapToHue(traits[5]), s: colorSaturation, v: colorValue},
      ColorEyePrimary: {h: this.mapToHue(traits[6]), s: colorSaturation, v: colorValue},
      ColorEyeSecondary: {h: this.mapToHue(traits[7]), s: colorSaturation, v: colorValue},
      ColorEyeTertiary: {h: this.mapToHue(traits[8]), s: colorSaturation, v: colorValue},
      
      // Head trait mapping
      HeadEdges: this.mapTraitValueToRange(traits[9], fishType[fishTypeIndex].ranges.HeadEdges), // range (0 - ?)
      HeadNose: this.mapTraitValueToRange(traits[10], fishType[fishTypeIndex].ranges.HeadNose),
      HeadFrills: this.mapTraitValueToRange(traits[11], fishType[fishTypeIndex].ranges.HeadFrills),
      HeadFlat: this.mapTraitValueToRange(traits[12], fishType[fishTypeIndex].ranges.HeadFlat),
      HeadSplit: this.mapTraitValueToRange(traits[13], fishType[fishTypeIndex].ranges.HeadSplit),
      HeadFlatnose: this.mapTraitValueToRange(traits[14], fishType[fishTypeIndex].ranges.HeadFlatnose),
      HeadFat: this.mapTraitValueToRange(traits[15], fishType[fishTypeIndex].ranges.HeadFat),

      // Texture trait mapping
      TextureBodyPrimary: this.mapTraitValueToRange(traits[16], fishType[fishTypeIndex].ranges.TextureBodyPrimary), // range (0 - ?)
      TextureBodySecondary: this.mapTraitValueToRange(traits[17], fishType[fishTypeIndex].ranges.TextureBodySecondary),
      TextureFinPrimary: this.mapTraitValueToRange(traits[18], fishType[fishTypeIndex].ranges.TextureFinPrimary),
      TextureFinSecondary: this.mapTraitValueToRange(traits[19], fishType[fishTypeIndex].ranges.TextureFinSecondary),
      TextureTailPrimary: this.mapTraitValueToRange(traits[20], fishType[fishTypeIndex].ranges.TextureTailPrimary),
      TextureTailSecondary: this.mapTraitValueToRange(traits[21], fishType[fishTypeIndex].ranges.TextureTailSecondary),
      TextureJawPrimary: this.mapTraitValueToRange(traits[22], fishType[fishTypeIndex].ranges.TextureJawPrimary),
      TextureJawSecondary: this.mapTraitValueToRange(traits[23], fishType[fishTypeIndex].ranges.TextureJawSecondary),
    };

    return fishTraits;
  }

  mapTraitValueToRange(value: number, range: Array<number>) {
    return (value % range[1]) + range[0];
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
  // Colors
  ColorPrimary: Color,
  ColorSecondary: Color,
  ColorTertiary: Color,
  ColorEyePrimary: Color,
  ColorEyeSecondary: Color,
  ColorEyeTertiary: Color,

  // Head options
  HeadEdges: number, // range (0 - ?)
  HeadNose: number,
  HeadFrills: number,
  HeadFlat: number,
  HeadSplit: number,
  HeadFlatnose: number,
  HeadFat: number,

  // Textures
  TextureBodyPrimary: number, // range (0 - ?)
  TextureBodySecondary: number,
  TextureFinPrimary: number,
  TextureFinSecondary: number,
  TextureTailPrimary: number,
  TextureTailSecondary: number,
  TextureJawPrimary: number,
  TextureJawSecondary: number,

  // Sizes
  // HeadSize: number,
  // EyeSize: number,
  // FinSize: number,
  // JawSize: number,
}
