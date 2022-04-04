import {ethers} from 'ethers'

const ENV = 'MAINNET';

export let Constants = {
  _MAXFISH: 18,
  _explorer: 'https://explorer.harmony.one/',
  _fishFightMultiSig : '0xA3607dbe94ab9cFBd89AeD6687e0e96B7A6CCfd7',
  _baseTokenURI : 'https://fishfight.io/',
  _maxPower : 10,
  // Fishing Waters
  _fishingPrice : ethers.utils.parseEther('300').toString(), // ONE
  _fishingPriceInPhase : ethers.utils.parseEther('150').toString(),
  _fishingPriceFishFood : ethers.utils.parseEther('0').toString(), // FISHFOOD
  _catchFoodAmount : ethers.utils.parseEther('50').toString(), // FISHFOOD
  _fishTypeMinRange : 0,
  _fishTypeMaxRange : 1,
  // Fighting Waters
  _fishFoodPerBlock : ethers.utils.parseEther('0.023').toString(), // FISHFOOD
  _fishFoodPerWin : ethers.utils.parseEther('400').toString(), // FISHFOOD
  _fishFoodPerWinInPhase : ethers.utils.parseEther('800').toString(), // FISHFOOD
  _lockTime : 60 * 10, // 10 mins
  _fightPowerFee : 5,
  // Breeding Waters
  _fishFoodBreedFee : ethers.utils.parseEther('0').toString(), // FISHFOOD
  _oneBreedFee : ethers.utils.parseEther('960').toString(), // ONE,
  _oneBreedFeeInPhase : ethers.utils.parseEther('420').toString(), // ONE,
  _alphaFoodOwedFee : ethers.utils.parseEther('100').toString(), // FISHFOOD
  _alphaFoodOwedFeeInPhase : ethers.utils.parseEther('200').toString(),
  _bettaBreedPowerFee : 10,
  _bettaBreedCooldown : '10 days',
  // Training Waters
  _feedFee : ethers.utils.parseEther('5').toString(), // FISHFOOD
  _eggFee : ethers.utils.parseEther('1').toString(), // FISHFOOD
  _scaleFee : ethers.utils.parseEther('2').toString(), // FISHFOOD
  _claimAmount : ethers.utils.parseEther('1').toString(), // FISHFOOD
  _questFee : ethers.utils.parseEther('0').toString(), // FISHFOOD
  _claimCooldown : 60 * 24, //60 * 60 * 24, // 24 hours
  _feedCooldown : 60 * 10, //60 * 10 10 mins
  _powerIncrease : 2,
  _fightModifierUses : 3,
  _fightModifierCost : 10,
  _fightModifierValue : 10,
  // Cycles
  _fishPhaseLength : 60 * 60 * 4, // 60 * 60 * 24 * 4 // 4 hours
  _fightPhaseLength : 60 * 60 * 4, // 60 * 60 * 24 * 4 // 4 hours
  _breedPhaseLength : 60 * 60 * 4, // 60 * 60 * 24 * 4 // 4 hours
  _maxSupply : 20000,
  _supplyIncreaseNumerator : 0,
  _supplyIncreaseDenominator : 100,

  MODIFIER_ALPHA : 0,
  MODIFIER_BETTA : 1,
  MODIFIER_COLLECT : 2,
  MODIFIER_FEED : 3,
  MODIFIER_STR : 4,
  MODIFIER_INT : 5,
  MODIFIER_AGI : 6,
  MODIFIER_POWER : 7,

  _bloaterAddress : '0x78aED65A2Cc40C7D8B0dF1554Da60b38AD351432'
}

