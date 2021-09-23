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
  imgSrc: string | null;

  constructor(tokenId: number, fishTypeIndex: number, name: string,
              birth: number, strength: string, intelligence: string, agility: string,
              wins: number, challenger: number, challenged: number,
              traitsA: string, traitsB: string, traitsC: string, imgSrc?: string | null) {
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
    this.imgSrc = imgSrc ? imgSrc : null;
  };

  parseTraits(): VisualTraits {
    const traitsA = this.traitsA;
    const traitsB = this.traitsB;
    const traitsC = this.traitsC;
    const fishTypeIndex = this.fishTypeIndex;
    const strength = traitsA[0];
    const intelligence = traitsB[0];
    const agility = traitsC[0];
    const reservedA = traitsA[31];
    const reservedB = traitsB[31];
    const reservedC = traitsC[31];

    const fishTraits: VisualTraits = {
      // Color trait mapping traits
      ColorBodyPrimary: {r: traitsA[1], g: traitsA[2], b: traitsA[3], a: 255},
      ColorBodySecondary: {r: traitsA[4], g: traitsA[5], b: traitsA[6], a: 255},
      ColorBodyTertiary: {r: traitsA[7], g: traitsA[8], b: traitsA[9], a: 255},

      ColorHeadPrimary: {r: traitsA[10], g: traitsA[11], b: traitsA[12], a: 255},
      ColorHeadSeconday: {r: traitsA[13], g: traitsA[14], b: traitsA[15], a: 255},
      ColorHeadTertiary: {r: traitsA[16], g: traitsA[17], b: traitsA[18], a: 255},

      ColorTailPrimary: {r: traitsA[19], g: traitsA[20], b: traitsA[21], a: 255},
      ColorTailSecondary: {r: traitsA[22], g: traitsA[23], b: traitsA[24], a: 255},
      ColorTailTertiary: {r: traitsA[25], g: traitsA[26], b: traitsA[27], a: 255},

      ColorPectoralPrimary: {r: traitsA[28], g: traitsA[29], b: traitsA[30], a: 255},
      ColorPectoralSecondary: {r: traitsB[1], g: traitsB[2], b: traitsB[3], a: 255},
      ColorPectoralTertiary: {r: traitsB[4], g: traitsB[5], b: traitsB[6], a: 255},

      ColorDorsalPrimary: {r: traitsB[7], g: traitsB[8], b: traitsB[9], a: 255},
      ColorDorsalSecondary: {r: traitsB[10], g: traitsB[11], b: traitsB[12], a: 255},
      ColorDorsalTertiary: {r: traitsB[13], g: traitsB[14], b: traitsB[15], a: 255},

      ColorJawPrimary: {r: traitsB[16], g: traitsB[17], b: traitsB[18], a: 255},
      ColorJawSecondary: {r: traitsB[19], g: traitsB[20], b: traitsB[21], a: 255},
      ColorJawTertiary: {r: traitsB[22], g: traitsB[23], b: traitsB[24], a: 255},

      ColorEyePrimary: {r: traitsB[25], g: traitsB[26], b: traitsB[27], a: 255},
      ColorEyeSecondary: {r: traitsB[28], g: traitsB[29], b: traitsB[30], a: 255},
      ColorEyeTertiary: {r: traitsC[1], g: traitsC[2], b: traitsC[3], a: 255},
      
      // Head trait mapping
      HeadEdges: this.mapTraitValueToRange(traitsC[4], fishType[fishTypeIndex].ranges.HeadEdges), // range (0 - ?)
      HeadNose: this.mapTraitValueToRange(traitsC[5], fishType[fishTypeIndex].ranges.HeadNose),
      HeadFrills: this.mapTraitValueToRange(traitsC[6], fishType[fishTypeIndex].ranges.HeadFrills),
      HeadFlat: this.mapTraitValueToRange(traitsC[7], fishType[fishTypeIndex].ranges.HeadFlat),
      HeadSplit: this.mapTraitValueToRange(traitsC[8], fishType[fishTypeIndex].ranges.HeadSplit),
      HeadFlatnose: this.mapTraitValueToRange(traitsC[9], fishType[fishTypeIndex].ranges.HeadFlatnose),
      BodyFat: this.mapTraitValueToRange(traitsC[10], fishType[fishTypeIndex].ranges.BodyFat),

      // Texture trait mapping
      TextureBodyPrimary: this.mapTraitValueToRange(traitsC[11], fishType[fishTypeIndex].ranges.TextureBodyPrimary), // range (0 - ?)
      TextureBodySecondary: this.mapTraitValueToRange(traitsC[12], fishType[fishTypeIndex].ranges.TextureBodySecondary),
      
      TextureHeadPrimary: this.mapTraitValueToRange(traitsC[13], fishType[fishTypeIndex].ranges.TextureHeadPrimary),
      TextureHeadSecondary: this.mapTraitValueToRange(traitsC[14], fishType[fishTypeIndex].ranges.TextureHeadSecondary),
      
      TexturePectoralPrimary: this.mapTraitValueToRange(traitsC[15], fishType[fishTypeIndex].ranges.TexturePectoralPrimary),
      TexturePectoralSecondary: this.mapTraitValueToRange(traitsC[16], fishType[fishTypeIndex].ranges.TexturePectoralSecondary),

      TextureDorsalPrimary: this.mapTraitValueToRange(traitsC[17], fishType[fishTypeIndex].ranges.TextureDorsalPrimary),
      TextureDorsalSecondary: this.mapTraitValueToRange(traitsC[18], fishType[fishTypeIndex].ranges.TextureDorsalSecondary),
      
      TextureTailPrimary: this.mapTraitValueToRange(traitsC[19], fishType[fishTypeIndex].ranges.TextureTailPrimary),
      TextureTailSecondary: this.mapTraitValueToRange(traitsC[20], fishType[fishTypeIndex].ranges.TextureTailSecondary),
      
      TextureJawPrimary: this.mapTraitValueToRange(traitsC[21], fishType[fishTypeIndex].ranges.TextureJawPrimary),
      TextureJawSecondary: this.mapTraitValueToRange(traitsC[22], fishType[fishTypeIndex].ranges.TextureJawSecondary),

      // Mesh Mapping
      MeshBodyIndex: this.mapTraitValueToRange(traitsC[23], fishType[fishTypeIndex].ranges.MeshBodyIndex),
      MeshJawIndex: this.mapTraitValueToRange(traitsC[24], fishType[fishTypeIndex].ranges.MeshJawIndex),
      MeshEyeIndex: this.mapTraitValueToRange(traitsC[25], fishType[fishTypeIndex].ranges.MeshEyeIndex),
      MeshDorsalIndex: this.mapTraitValueToRange(traitsC[26], fishType[fishTypeIndex].ranges.MeshDorsalIndex),
      MeshPectoralIndex: this.mapTraitValueToRange(traitsC[27], fishType[fishTypeIndex].ranges.MeshPectoralIndex),
      MeshTailIndex: this.mapTraitValueToRange(traitsC[28], fishType[fishTypeIndex].ranges.MeshTailIndex),

      // Glimmer Mapping
      GlimmerStrength: this.mapTraitValueToRange(traitsC[29], fishType[fishTypeIndex].ranges.GlimmerStrength),
    };

    return fishTraits;
  }

  mapTraitValueToRange(value: number, range: Array<number>) {
    if(range[1] == 0) return 0;
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
  b: number,
  a: number
}

type VisualTraits = {
  // Colors
  ColorBodyPrimary: Color,
  ColorBodySecondary: Color,
  ColorBodyTertiary: Color,

  ColorHeadPrimary: Color,
  ColorHeadSeconday: Color,
  ColorHeadTertiary: Color,

  ColorTailPrimary: Color,
  ColorTailSecondary: Color,
  ColorTailTertiary: Color,

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

  TexturePectoralPrimary: number,
  TexturePectoralSecondary: number,

  TextureDorsalPrimary: number,
  TextureDorsalSecondary: number,

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
}

const fishType = [
  {
    name: "GenesisFish",
    ranges: {
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
      
      TexturePectoralPrimary: [0, 8],
      TexturePectoralSecondary: [0, 1],

      TextureDorsalPrimary: [0, 8],
      TextureDorsalSecondary: [0, 1],

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
