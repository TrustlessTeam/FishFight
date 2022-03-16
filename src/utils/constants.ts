import {ethers} from 'ethers'

const ENV = 'TESTNET';

export let Constants = {
  _explorer: ENV === 'TESTNET' ? 'https://explorer.pops.one/' : 'https://explorer.harmony.one/',
  _fishFightMultiSig : '0xdbcc0f24617131C33A3c1d06E6a86A458e0d32b0',
  _baseTokenURI : 'https://gateway.pinata.cloud/ipfs/',
  _maxPower : 10,
  // Fishing Waters
  _fishingPrice : ethers.utils.parseEther('300').toString(), // ONE
  _fishingPriceInPhase : ethers.utils.parseEther('150').toString(),
  _fishingPriceFishFood : ethers.utils.parseEther('0').toString(), // FISHFOOD
  _catchFoodAmount : ethers.utils.parseEther('10').toString(), // FISHFOOD
  _fishTypeMinRange : 0,
  _fishTypeMaxRange : 1,
  // Fighting Waters
  _fishFoodPerBlock : ethers.utils.parseEther('0.1').toString(), // FISHFOOD
  _fightFee : ethers.utils.parseEther('0').toString(), // ONE
  _fishFoodPerWin : ethers.utils.parseEther('5').toString(), // FISHFOOD
  _fishFoodPerWinInPhase : ethers.utils.parseEther('10').toString(), // FISHFOOD
  _lockTime : 60 * 15, // 15 mins
  _fightPowerFee : 2,
  // Breeding Waters
  _fishFoodBreedFee : ethers.utils.parseEther('0').toString(), // FISHFOOD
  _oneBreedFee : ethers.utils.parseEther('960').toString(), // ONE,
  _oneBreedFeeInPhase : ethers.utils.parseEther('420').toString(), // ONE,
  _alphaFoodOwedFee : ethers.utils.parseEther('10').toString(), // FISHFOOD
  _alphaFoodOwedFeeInPhase : ethers.utils.parseEther('20'),
  _bettaBreedPowerFee : 10,
  // Training Waters
  _feedFee : ethers.utils.parseEther('1').toString(), // FISHFOOD
  _claimAmount : ethers.utils.parseEther('0.5').toString(), // FISHFOOD
  _questFee : ethers.utils.parseEther('0').toString(), // FISHFOOD
  _claimCooldown : 60 * 24, //60 * 60 * 24, // 24 hours
  _feedCooldown : 60 * 10, //60 * 10 10 mins
  _powerIncrease : 2,
  _fightModifierUses : 5,
  _fightModifierCost : 10,
  _fightModifierValue : 10,
  // Cycles
  _fishPhaseLength : 60 * 60 * 4, // 60 * 60 * 24 * 4 // 4 hours
  _fightPhaseLength : 60 * 60 * 4, // 60 * 60 * 24 * 4 // 4 hours
  _breedPhaseLength : 60 * 60 * 4, // 60 * 60 * 24 * 4 // 4 hours
  _maxSupply : 20000,
  _supplyIncreaseNumerator : 10,
  _supplyIncreaseDenominator : 100,

  MODIFIER_ALPHA : 0,
  MODIFIER_BETTA : 1,
  MODIFIER_COLLECT : 2,
  MODIFIER_FEED : 3,
  MODIFIER_STR : 4,
  MODIFIER_INT : 5,
  MODIFIER_AGI : 6,
  MODIFIER_POWER : 7,
}

