const fishType = [
  {
    name: "GenesisFish",
    ranges: {
      // Models
      ModelsTailFin: [0, 4],
      ModelsDorsalFin: [0, 5],
      ModelsPectoralFin: [0, 3],

      // Colors
      ColorBodyPrimary: [0, 255],
      ColorBodySecondary: [0, 255],
      ColorBodyTertiary: [0, 255],

      ColorTailPrimary: [0, 255],
      ColorTailSecondary: [0, 255],
      ColorTailTertiary: [0, 255],

      ColorPectoralPrimary: [0, 255],
      ColorPectoralSecondary: [0, 255],
      ColorPectoralTertiary: [0, 255],

      ColorDorsalPrimary: [0, 255],
      ColorDorsalSecondary: [0, 255],
      ColorDorsalTertiary: [0, 255],

      ColorJawPrimary: [0, 255],
      ColorJawSecondary: [0, 255],
      ColorJawTertiary: [0, 255],
      
      ColorEyePrimary: [0, 255],
      ColorEyeSecondary: [0, 255],
      ColorEyeTertiary: [0, 255],

      // Head options
      HeadEdges: [0, 100], // need to know upper range index for each option, using 2 for now
      HeadNose: [0, 60],
      HeadFrills: [0, 100],
      HeadFlat: [0, 80],
      HeadSplit: [0, 70], // map to intelligence
      HeadFlatnose: [0, 100], // map to agility
      BodyFat: [0, 100], // map to strength

      // Textures
      TextureBodyPrimary: [0, 8], // need to know upper range index for each option, using 2 for now
      TextureBodySecondary: [0, 1],

      TextureHeadPrimary: [0, 8],
      TextureHeadSecondary: [0, 1],
      
      TextureFinPrimary: [0, 8],
      TextureFinSecondary: [0, 1],

      TexturePectoralPrimary: [0, 8],
      TexturePectoralSecondary: [0, 1],

      TextureDorsalPrimary: [0, 8],
      TextureDorralSecondary: [0, 1],

      TextureTailPrimary: [0, 8],
      TextureTailSecondary: [0, 1],

      TextureJawPrimary: [0, 8],
      TextureJawSecondary: [0, 1],

      MeshBodyIndex: [0, 0],
      MeshJawIndex: [0, 0],
      MeshEyeIndex: [0, 0],
      MeshDorsalIndex: [0, 4],
      MeshPectoralIndex: [0, 2],
      MeshTailIndex: [0, 3],


      // Glimmer strength
      GlimmerStrength: [0, 4]
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
  fishTypeIndex: number;
	name: string;
	birth: number;
  strength: number;
  intelligence: number;
  agility: number;
  wins: number;
  challenger: number;
  challenged: number;
  traitsA: Array<number>;
	traitsB: Array<number>;
	traitsC: Array<number>;
	visualTraits: VisualTraits;

  constructor(tokenId: number, fishTypeIndex: number, name: string,
              birth: number, strength: string, intelligence: string, agility: string,
              wins: number, challenger: number, challenged: number,
              traitsA: string, traitsB: string, traitsC: string) {
    this.tokenId = tokenId;
    this.fishTypeIndex = fishTypeIndex;
    this.name = name;
    this.birth = birth;
    this.strength = parseInt(strength);
    this.intelligence = parseInt(intelligence);
    this.agility = parseInt(agility);
    this.wins = wins;
    this.challenger = challenger;
    this.challenged = challenged;
    this.traitsA = this.parseVrf(traitsA);
    this.traitsB = this.parseVrf(traitsB);
    this.traitsC = this.parseVrf(traitsC);
    this.visualTraits = this.parseTraits();
  };

  parseTraits(): VisualTraits {
    const traitsA = this.traitsA;
    const traitsB = this.traitsB;
    const traitsC = this.traitsC;
    const fishTypeIndex = this.fishTypeIndex;
    const reservedTrait0 = traitsA[0];
    const reservedTrait1 = traitsA[1]
    const reservedTrait2 = traitsA[2]
    // const colorSaturation = traitsA[3];
    // const colorValue = traitsA[4];

    const fishTraits: VisualTraits = {
      // Color trait mapping traits
      ColorBodyPrimary: {r: traitsA[3], g: traitsA[4], b: traitsA[5]},
      ColorBodySecondary: {r: traitsA[6], g: traitsA[7], b: traitsA[8]},
      ColorBodyTertiary: {r: traitsA[9], g: traitsA[10], b: traitsA[11]},

      ColorTailPrimary: {r: traitsA[12], g: traitsA[13], b: traitsA[14]},
      ColorTailSecondary: {r: traitsA[15], g: traitsA[16], b: traitsA[17]},
      ColorTailTertiary: {r: traitsA[18], g: traitsA[19], b: traitsA[20]},

      ColorPectoralPrimary: {r: traitsA[21], g: traitsA[22], b: traitsA[23]},
      ColorPectoralSecondary: {r: traitsA[24], g: traitsA[25], b: traitsA[26]},
      ColorPectoralTertiary: {r: traitsA[27], g: traitsA[28], b: traitsA[29]},

      ColorDorsalPrimary: {r: traitsA[30], g: traitsA[31], b: traitsB[0]},
      ColorDorsalSecondary: {r: traitsB[1], g: traitsB[2], b: traitsB[3]},
      ColorDorsalTertiary: {r: traitsB[4], g: traitsB[5], b: traitsB[6]},

      ColorEyePrimary: {r: traitsB[7], g: traitsB[8], b: traitsB[9]},
      ColorEyeSecondary: {r: traitsB[10], g: traitsB[11], b: traitsB[12]},
      ColorEyeTertiary: {r: traitsB[13], g: traitsB[14], b: traitsB[15]},
      
      // Head trait mapping
      HeadEdges: this.mapTraitValueToRange(traitsB[16], fishType[fishTypeIndex].ranges.HeadEdges), // range (0 - ?)
      HeadNose: this.mapTraitValueToRange(traitsB[17], fishType[fishTypeIndex].ranges.HeadNose),
      HeadFrills: this.mapTraitValueToRange(traitsB[18], fishType[fishTypeIndex].ranges.HeadFrills),
      HeadFlat: this.mapTraitValueToRange(traitsB[19], fishType[fishTypeIndex].ranges.HeadFlat),
      HeadSplit: this.mapTraitValueToRange(traitsB[20], fishType[fishTypeIndex].ranges.HeadSplit),
      HeadFlatnose: this.mapTraitValueToRange(traitsB[21], fishType[fishTypeIndex].ranges.HeadFlatnose),
      BodyFat: this.mapTraitValueToRange(traitsB[22], fishType[fishTypeIndex].ranges.BodyFat),

      // Texture trait mapping
      TextureBodyPrimary: this.mapTraitValueToRange(traitsB[23], fishType[fishTypeIndex].ranges.TextureBodyPrimary), // range (0 - ?)
      TextureBodySecondary: this.mapTraitValueToRange(traitsB[24], fishType[fishTypeIndex].ranges.TextureBodySecondary),
      TextureFinPrimary: this.mapTraitValueToRange(traitsB[25], fishType[fishTypeIndex].ranges.TextureFinPrimary),
      TextureFinSecondary: this.mapTraitValueToRange(traitsB[26], fishType[fishTypeIndex].ranges.TextureFinSecondary),
      TextureTailPrimary: this.mapTraitValueToRange(traitsB[27], fishType[fishTypeIndex].ranges.TextureTailPrimary),
      TextureTailSecondary: this.mapTraitValueToRange(traitsB[28], fishType[fishTypeIndex].ranges.TextureTailSecondary),
      TextureJawPrimary: this.mapTraitValueToRange(traitsB[29], fishType[fishTypeIndex].ranges.TextureJawPrimary),
      TextureJawSecondary: this.mapTraitValueToRange(traitsB[30], fishType[fishTypeIndex].ranges.TextureJawSecondary),

      GlimmerStrength: this.mapTraitValueToRange(traitsB[31], fishType[fishTypeIndex].ranges.TextureJawSecondary),
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

		return decPairs;
	}

  mapToHue(value: number, in_min = 0, in_max = 255, out_min = 0, out_max = 360): number {
    return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  } 
}

type Color = {
  r: number,
  g: number,
  b: number
}

type VisualTraits = {
  // Colors
  ColorBodyPrimary: Color,
  ColorBodySecondary: Color,
  ColorBodyTertiary: Color,

  ColorTailPrimary: Color,
  ColorTailSecondary: Color,
  ColorTailTertiary: Color,

  ColorHeadPrimary: Color,
  ColorHeadSeconday: Color,
  ColorHeadTertiary: Color,


  ColorPectoralPrimary: Color,
  ColorPectoralSecondary: Color,
  ColorPectoralTertiary: Color,

  ColorDorsalPrimary: Color,
  ColorDorsalSecondary: Color,
  ColorDorsalTertiary: Color,

  ColorJawPrimary: Color,
  ColorJawSecondary: Color,
  ColorJawTertiary: Color,

  ColorEyePrimary: Color,
  ColorEyeSecondary: Color,
  ColorEyeTertiary: Color,

  // Head options
  HeadEdges: number,
  HeadNose: number,
  HeadFrills: number,
  HeadFlat: number,
  HeadSplit: number,
  HeadFlatnose: number,
  BodyFat: number,

  // Textures
  TextureBodyPrimary: number,
  TextureBodySecondary: number,

  TextureHeadPrimary: number,
  TextureHeadSecondary: number,

  TextureFinPrimary: number,
  TextureFinSecondary: number,

  TexturePectoralPrimary: number,
  TexturePectoralSecondary: number,

  TextureDorsalPrimary: number,
  TextureDorralSecondary: number,

  TextureTailPrimary: number,
  TextureTailSecondary: number,

  TextureJawPrimary: number,
  TextureJawSecondary: number,

  // Mesh Body
  MeshBodyIndex: number,
  MeshJawIndex: number,
  MeshEyeIndex: number,
  MeshDorsalIndex: number,
  MeshPectoralIndex: number,
  MeshTailIndex: number,

  // Glimmer strength
  GlimmerStrength: number

  // Sizes
  // HeadSize: number,
  // EyeSize: number,
  // FinSize: number,
  // JawSize: number,
}
