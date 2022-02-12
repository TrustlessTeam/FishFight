import {ethers} from 'ethers'

export let Constants = {
  _fishFightMultiSig : '0xdbcc0f24617131C33A3c1d06E6a86A458e0d32b0',
  _baseTokenURI : 'https://gateway.pinata.cloud/ipfs/',
  _maxPower : 10,
  // Fishing Waters
  _fishingPrice : ethers.utils.parseEther('100').toString(), // ONE
  _fishingPriceFishFood : ethers.utils.parseEther('0').toString(), // FISHFOOD
  _catchFoodAmount : ethers.utils.parseEther('10').toString(), // FISHFOOD
  _fishTypeMinRange : 0,
  _fishTypeMaxRange : 1,
  // Fighting Waters
  _fishFoodPerBlock : ethers.utils.parseEther('0.1').toString(), // FISHFOOD
  _fightFee : ethers.utils.parseEther('1').toString(), // ONE
  _fishFoodPerWin : ethers.utils.parseEther('10').toString(), // FISHFOOD
  _fishFoodPerWinInPhase : ethers.utils.parseEther('20').toString(), // FISHFOOD
  _lockTime : 60, // 60 seconds
  _fightPowerFee : 1,
  // Breeding Waters
  _fishFoodBreedFee : ethers.utils.parseEther('100').toString(), // FISHFOOD
  _oneBreedFee : ethers.utils.parseEther('150').toString(), // ONE,
  _alphaFoodOwedFee : ethers.utils.parseEther('10').toString(), // FISHFOOD
  _alphaBreedPowerFee : 1,
  _bettaBreedPowerFee : 1,
  // Training Waters
  _feedFee : ethers.utils.parseEther('1').toString(), // FISHFOOD
  _claimAmount : ethers.utils.parseEther('0.5').toString(), // FISHFOOD
  _questFee : ethers.utils.parseEther('1').toString(), // FISHFOOD
  _claimCooldown : 60 * 5, //60 * 60 * 24, // 24 hours
  _feedCooldown : 60 * 5, //60 * 60 * 24, // 24 hours
  _powerIncrease : 1,
  _modifierCost : 5,
  _modifierValue : 10,
  // Seasons
  _fishPhaseLength : 60 * 60 * 24, // 60 * 60 * 24 * 7, // 7 days
  _fightPhaseLength : 60 * 60 * 24, // 60 * 60 * 24 * 7, // 7 days
  _breedPhaseLength : 60 * 60 * 24, // 60 * 60 * 24 * 7, // 7 days
  _maxSupply : 1000,
  _supplyIncreaseNumerator : 1,
  _supplyIncreaseDenominator : 10,
  _maxAlphaBreedsPerSeason : 10,
  _maxBettaBreedsPerSeason : 1
}

