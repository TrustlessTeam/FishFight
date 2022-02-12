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
    fightInfo: any
  ) 
  {
    this.typeOfFight = new BN(fightInfo.typeOfFight).toNumber();
		this.fishChallenger = new BN(fightInfo.fishChallenger).toNumber();
		this.fishChallenged = new BN(fightInfo.fishChallenged).toNumber();
		this.timeOfFight = new BN(fightInfo.timeOfFight).toNumber();
		this.round1 = this.parseRound(fightInfo.round1);
		this.round2 = this.parseRound(fightInfo.round2);
		this.round3 = this.parseRound(fightInfo.round3);
		this.winner = new BN(fightInfo.winner).toNumber();
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