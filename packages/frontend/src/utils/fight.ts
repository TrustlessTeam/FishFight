// Big Number
import BN from 'bn.js';

export enum RoundMapping {
	"Strength",
	"Intelligence",
	"Agility"
}

type Round = {
	value: number;
	description: string;
}

export class Fight {
    typeOfFight: number;
		fishChallenger: number;
		fishChallenged: number;
		timeOfFight: number;
		round1: Round;
		round2: Round;
		round3: Round;
		winner: number;

  constructor(
    typeOfFight: number,
		fishChallenger: number,
		fishChallenged: number,
		timeOfFight: number,
		round1: string,
		round2: string,
		round3: string,
		winner: number
  ) 
  {
    this.typeOfFight = typeOfFight;
		this.fishChallenger = fishChallenger;
		this.fishChallenged = fishChallenged;
		this.timeOfFight = timeOfFight;
		this.round1 = this.parseRound(round1);
		this.round2 = this.parseRound(round2);
		this.round3 = this.parseRound(round3);
		this.winner = winner;
  };


  mapTraitValueToRange(value: number, range: Array<number>) {
    return (value % range[1]) + range[0];
  }

	parseRound(round: string) {
		const bytesRound = new BN(round);
		const roundType = bytesRound.modn(3);
		return {value: roundType, description: RoundMapping[roundType]};
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
}