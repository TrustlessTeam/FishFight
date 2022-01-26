import web3 from 'web3'

export class FightingStake {
  lockedExpire: number;
  earnedFishFood: string;
  constructor(
    stakedFightFishObject: any,
  ) {
    this.lockedExpire = web3.utils.toNumber(stakedFightFishObject.lockedExpire);
    this.earnedFishFood = web3.utils.fromWei(stakedFightFishObject.earnedFishFood);
  }
}

export class BreedingStake {
  breedCooldown: number;
  earnedFishFood: string;
  
  constructor(
    stakedBreedFishObject: any,
    breedsForFishObject: any
  ) {
    this.breedCooldown = web3.utils.toNumber(stakedBreedFishObject.breedCooldown);
    this.earnedFishFood = web3.utils.fromWei(stakedBreedFishObject.earnedFishFood);
  }
}

export class FishSeasonStats {
	fightWins: number;
	alphaBreeds: number;
	bettaBreeds: number;
	challenges: number;

  constructor(
    seasonObject: any
  ) 
  {
		this.fightWins = web3.utils.toNumber(seasonObject.fightWins);
		this.alphaBreeds = web3.utils.toNumber(seasonObject.alphaBreeds);
		this.bettaBreeds = web3.utils.toNumber(seasonObject.bettaBreeds);
		this.challenges = web3.utils.toNumber(seasonObject.challenges);
	}
}

export class Fish {
  tokenId: number;
  birthTime: number;
  genes: string;
  fishType: number;
  rarity: number;
  strength: number;
  intelligence: number;
  agility: number;
  cooldownMultiplier: number;
  lifetimeWins: number;
  lifetimeAlphaBreeds: number;
  lifetimeBettaBreeds: number;
  parentA: number;
  parentAFish: Fish | null;
  parentB: number;
  parentBFish: Fish | null;
  breedKey: string;
  deathTime: number;
  genesArray: Array<number>;
	visualTraits: VisualTraits;
  imgSrc: string | null;
  ipfsLink: string | null;
  seasonStats: FishSeasonStats;
  offspringHistory: number[] | null;
  fightingHistory: number[] | null;
  stakedFighting: FightingStake | undefined;
  stakedBreeding: BreedingStake | null;

  constructor(
    fishInfo: any,
    fishSeasonStats: any,
    imgSrc: string | null,
    ipfsLink: string | null,
    // offspringHistory: number[] | null,
    // fightingHistory: number[] | null,
    // fightingWaters: FightingWatersData | null,
    // breedingWaters: BreedingWatersData | null,
    
  ) 
  {
    this.tokenId = web3.utils.toNumber(fishInfo.tokenId);
    this.birthTime = web3.utils.toNumber(fishInfo.birthTime);
    this.genes = fishInfo.genes;
    this.fishType = web3.utils.toNumber(fishInfo.fishType);
    this.rarity = web3.utils.toNumber(fishInfo.rarity);
    this.strength = web3.utils.toNumber(fishInfo.strength);
    this.intelligence = web3.utils.toNumber(fishInfo.intelligence);
    this.agility = web3.utils.toNumber(fishInfo.agility);
    this.cooldownMultiplier = web3.utils.toNumber(fishInfo.cooldownMultiplier);
    this.lifetimeWins = web3.utils.toNumber(fishInfo.lifetimeWins);
    this.lifetimeAlphaBreeds = web3.utils.toNumber(fishInfo.lifetimeAlphaBreeds);
    this.lifetimeBettaBreeds = web3.utils.toNumber(fishInfo.lifetimeBettaBreeds);
    this.parentA = web3.utils.toNumber(fishInfo.parentA);
    this.parentAFish = null;
    this.parentB = web3.utils.toNumber(fishInfo.parentB);
    this.parentBFish = null;
    this.breedKey = fishInfo.breedKey;
    this.deathTime = web3.utils.toNumber(fishInfo.deathTime);
    this.genesArray = this.parseGenes(this.genes);
    this.visualTraits = this.parseTraits();
    this.imgSrc = imgSrc;
    this.ipfsLink = ipfsLink;
    this.seasonStats = new FishSeasonStats(fishSeasonStats);
    this.offspringHistory = null;
    this.fightingHistory = null;
    this.stakedFighting = undefined;
    this.stakedBreeding = null;
  };

  parseTraits(): VisualTraits {
    const genesArray = this.genesArray;

    // Indices 0-5 are already used
    const fishTraits: VisualTraits = {
      // Color trait mapping traits
      ColorBodyPrimary: {r: genesArray[6], g: genesArray[7], b: genesArray[8], a: 255},
      ColorBodySecondary: {r: genesArray[9], g: genesArray[10], b: genesArray[11], a: 255},
      ColorBodyTertiary: {r: genesArray[12], g: genesArray[13], b: genesArray[14], a: 255},

      ColorHeadPrimary: {r: genesArray[15], g: genesArray[16], b: genesArray[17], a: 255},
      ColorHeadSecondary: {r: genesArray[18], g: genesArray[19], b: genesArray[20], a: 255},
      ColorHeadTertiary: {r: genesArray[21], g: genesArray[22], b: genesArray[23], a: 255},

      ColorTailPrimary: {r: genesArray[24], g: genesArray[25], b: genesArray[26], a: 255},
      ColorTailSecondary: {r: genesArray[27], g: genesArray[28], b: genesArray[29], a: 255},
      ColorTailTertiary: {r: genesArray[30], g: genesArray[31], b: genesArray[32], a: 255},

      ColorPectoralPrimary: {r: genesArray[33], g: genesArray[34], b: genesArray[35], a: 255},
      ColorPectoralSecondary: {r: genesArray[36], g: genesArray[37], b: genesArray[38], a: 255},
      ColorPectoralTertiary: {r: genesArray[39], g: genesArray[40], b: genesArray[41], a: 255},

      ColorDorsalPrimary: {r: genesArray[42], g: genesArray[43], b: genesArray[44], a: 255},
      ColorDorsalSecondary: {r: genesArray[45], g: genesArray[46], b: genesArray[47], a: 255},
      ColorDorsalTertiary: {r: genesArray[48], g: genesArray[49], b: genesArray[50], a: 255},

      ColorJawPrimary: {r: genesArray[51], g: genesArray[52], b: genesArray[53], a: 255},
      ColorJawSecondary: {r: genesArray[54], g: genesArray[55], b: genesArray[56], a: 255},
      ColorJawTertiary: {r: genesArray[57], g: genesArray[58], b: genesArray[59], a: 255},

      ColorEyePrimary: {r: genesArray[60], g: genesArray[61], b: genesArray[62], a: 255},
      ColorEyeSecondary: {r: genesArray[63], g: genesArray[64], b: genesArray[65], a: 255},
      ColorEyeTertiary: {r: genesArray[66], g: genesArray[67], b: genesArray[68], a: 255},
      
      // Head trait mapping
      HeadEdges: this.mapTraitValueToRange(genesArray[69], fishTypes[this.fishType].ranges.HeadEdges), // range (0 - ?)
      HeadNose: this.mapTraitValueToRange(genesArray[70], fishTypes[this.fishType].ranges.HeadNose),
      HeadFrills: this.mapTraitValueToRange(genesArray[71], fishTypes[this.fishType].ranges.HeadFrills),
      HeadFlat: this.mapTraitValueToRange(genesArray[72], fishTypes[this.fishType].ranges.HeadFlat),
      HeadSplit: this.mapTraitValueToRange(genesArray[73], fishTypes[this.fishType].ranges.HeadSplit),
      HeadFlatnose: this.mapTraitValueToRange(genesArray[74], fishTypes[this.fishType].ranges.HeadFlatnose),
      BodyFat: this.mapTraitValueToRange(genesArray[75], fishTypes[this.fishType].ranges.BodyFat),

      // Texture trait mapping
      TextureBodyPrimary: this.mapTraitValueToRange(genesArray[76], fishTypes[this.fishType].ranges.TextureBodyPrimary), // range (0 - ?)
      TextureBodySecondary: this.mapTraitValueToRange(genesArray[77], fishTypes[this.fishType].ranges.TextureBodySecondary),
      
      TextureHeadPrimary: this.mapTraitValueToRange(genesArray[78], fishTypes[this.fishType].ranges.TextureHeadPrimary),
      TextureHeadSecondary: this.mapTraitValueToRange(genesArray[79], fishTypes[this.fishType].ranges.TextureHeadSecondary),
      
      TexturePectoralPrimary: this.mapTraitValueToRange(genesArray[80], fishTypes[this.fishType].ranges.TexturePectoralPrimary),
      TexturePectoralSecondary: this.mapTraitValueToRange(genesArray[81], fishTypes[this.fishType].ranges.TexturePectoralSecondary),

      TextureDorsalPrimary: this.mapTraitValueToRange(genesArray[82], fishTypes[this.fishType].ranges.TextureDorsalPrimary),
      TextureDorsalSecondary: this.mapTraitValueToRange(genesArray[83], fishTypes[this.fishType].ranges.TextureDorsalSecondary),
      
      TextureTailPrimary: this.mapTraitValueToRange(genesArray[84], fishTypes[this.fishType].ranges.TextureTailPrimary),
      TextureTailSecondary: this.mapTraitValueToRange(genesArray[85], fishTypes[this.fishType].ranges.TextureTailSecondary),
      
      TextureJawPrimary: this.mapTraitValueToRange(genesArray[86], fishTypes[this.fishType].ranges.TextureJawPrimary),
      TextureJawSecondary: this.mapTraitValueToRange(genesArray[87], fishTypes[this.fishType].ranges.TextureJawSecondary),

      // Mesh Mapping
      MeshBodyIndex: this.mapTraitValueToRange(genesArray[88], fishTypes[this.fishType].ranges.MeshBodyIndex),
      MeshJawIndex: this.mapTraitValueToRange(genesArray[89], fishTypes[this.fishType].ranges.MeshJawIndex),
      MeshEyeIndex: this.mapTraitValueToRange(genesArray[90], fishTypes[this.fishType].ranges.MeshEyeIndex),
      MeshDorsalIndex: this.mapTraitValueToRange(genesArray[91], fishTypes[this.fishType].ranges.MeshDorsalIndex),
      MeshPectoralIndex: this.mapTraitValueToRange(genesArray[92], fishTypes[this.fishType].ranges.MeshPectoralIndex),
      MeshTailIndex: this.mapTraitValueToRange(genesArray[93], fishTypes[this.fishType].ranges.MeshTailIndex),

      // Glimmer Mapping
      GlimmerStrength: this.mapTraitValueToRange(genesArray[94], fishTypes[this.fishType].ranges.GlimmerStrength),
    };

    return fishTraits;
  }

  mapTraitValueToRange(value: number, range: Array<number>) {
    if(range[1] == 0) return 0;
    return (value % range[1]) + range[0];
  }

  parseGenes(genes : string) {
		const hashPairs = [];

		for (let j = 0; j < 128; j++) {
				hashPairs.push(genes.slice(2 + (j * 2), 4 + (j * 2)));
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
  ColorHeadSecondary: Color,
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

const fishTypes = [
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
      BodyFat: [0, 75], // map to strength

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
      GlimmerStrength: [1, 5]
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

export default Fish;