// Big Number
import web3 from 'web3';

export enum PhaseMapping {
	"Paused",
	"Fishing",
	"Fighting",
	"Breeding",
	"Completed",
}


export class Season {
	index: number;
	startBlock: number;
	endBlock: number;
	startTime: Date;
	endTime: Date;
	startTs: number;
	endTs: number;
	startSupply: number;
	endSupply: number;
	phase: number;
	phaseString: string
	fishCatch: number;
	fishDeath: number;
	fishBreed: number;

  constructor(
    seasonObject: any
  ) 
  {
    this.index = web3.utils.toNumber(seasonObject.index);
		this.startBlock = web3.utils.toNumber(seasonObject.startBlock);
		this.endBlock = web3.utils.toNumber(seasonObject.startBlock);
		this.startTs = web3.utils.toNumber(seasonObject.startTime)
		this.endTs = web3.utils.toNumber(seasonObject.endTime)
		this.startTime = new Date(web3.utils.toNumber(seasonObject.startTime) * 1000);
		this.endTime = new Date(web3.utils.toNumber(seasonObject.endTime) * 1000);
		this.startSupply = web3.utils.toNumber(seasonObject.startSupply);
		this.endSupply = web3.utils.toNumber(seasonObject.endSupply);
		this.phase = web3.utils.toNumber(seasonObject.phase);
		this.phaseString = PhaseMapping[web3.utils.toNumber(seasonObject.phase)];
		this.fishCatch = web3.utils.toNumber(seasonObject.fishCatch);
		this.fishDeath = web3.utils.toNumber(seasonObject.fishDeath);
		this.fishBreed = web3.utils.toNumber(seasonObject.fishBreed);
  };
}