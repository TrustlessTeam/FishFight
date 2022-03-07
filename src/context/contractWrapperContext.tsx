import { createContext, useContext, useEffect, useState } from 'react';
import { Contract } from '@harmony-js/contract';
import { toast } from 'react-toastify';

import { useWeb3React } from '@web3-react/core';
import { useFishFight } from '../context/fishFightContext';
import web3 from 'web3';


import Fish from '../utils/fish';
import { useUnity } from './unityContext';
import { useFishPool } from './fishPoolContext';
import { Fight } from '../utils/fight';
import BN from 'bn.js';
import { Constants } from '../utils/constants';

const BREEDCOSTONE = web3.utils.toBN(1);
const BREEDCOSTFISHFOOD = web3.utils.toBN(100);
const MAX_APPROVE = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

interface ProviderInterface {
	fightFish: (fishA: Fish | null, fishB: Fish | null) => void;
	depositFightingFish: (fish: Fish | null) => void;
	withdrawFightingFish: (fish: Fish | null) => void;
	breedFish: (fishA: Fish | null, fishB: Fish | null) => void;
	withdrawBreedingFish: (fish: Fish | null) => void;
	depositBreedingFish: (fish: Fish | null) => void;
	feedFish: (fish: Fish | null) => void;
	questFish: (fish: Fish | null) => void;
	claimFishFood: (fish: Fish | null) => void;
	claimAllFishFood: () => void;
	feedAllFish: () => void;
	contractApproveAllForFighting: () => void;
	contractApproveAllFishForBreeding: () => void;
	contractApproveFoodForBreeding: () => void;
	contractApproveFoodForTraining: () => void;
	pendingTransaction: boolean;
}

type ProviderProps = { children: React.ReactNode };

const ContractWrapperContext = createContext<ProviderInterface | undefined>(undefined);

export const ContractWrapperProvider = ({ children }: ProviderProps) => {
	const [pendingTransaction, setPendingTransaction] = useState<boolean>(false);
	const { account } = useWeb3React();
	const { FishFight, refetchBalance, checkApprovals, balanceFoodWei } = useFishFight();
	const { userFish, refreshFish, createUserFish, refreshLoadedFish } = useFishPool();
	const unityContext = useUnity();

	// Breeding Functions
	const breedFish = async (fishAlpha: Fish | null, fishBetta: Fish | null) => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(fishAlpha == null) {
			toast.error('Select Your Fish to Breed');
			return;
		}
		if(fishBetta == null) {
			toast.error('Select Fish to Breed with');
			return;
		}
		if(!await FishFight.readSeasons.methods.isBreedingPhase().call()) {
			toast.error('Must be Breeding Season to Breed');
			return;
		}
		if(balanceFoodWei && balanceFoodWei.lt(new BN(Constants._fishFoodBreedFee))) {
			toast.error('Not enough $FISHFOOD');
			return;
		}
		try {
			FishFight.fishFood?.methods.allowance(account, FishFight.readBreedingWaters.options.address).call()
			.then(async (approvedAmount: any) => {
				console.log(approvedAmount)
				console.log(web3.utils.fromWei(approvedAmount))
				if(web3.utils.fromWei(approvedAmount) >= '100') {
					contractBreed(fishAlpha, fishBetta)
				} else {
					const approveResult = await contractApproveFoodForBreeding()
					approveResult.on('receipt', () => {
						contractBreed(fishAlpha, fishBetta)
					})
				}
			})

		} catch (error: any) {
			// toast.error("Transaction Failed")
			console.log(error)
			// setPendingTransaction(false);
			// toast.error(error);
			// setIsBreeding(false)
			// setSelectedUserFish(null)
			// setSelectedPoolFish(null)
		}
	};

	const contractBreed = async (fishAlpha: Fish, fishBetta: Fish) => {
		console.log(fishAlpha)
		console.log(fishBetta)
		// const gas = await FishFight.breedingWaters?.methods.breedFish(fishAlpha.tokenId, fishBetta.tokenId).estimateGas({from: account});
		return FishFight.breedingWaters?.methods.breedFish(fishAlpha.tokenId, fishBetta.tokenId).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: 15000000,
			value: Constants._oneBreedFee
		})
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Breed Failed');
			setPendingTransaction(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
		})
		.on('receipt', async (data: any) => {
			console.log(data)
			setPendingTransaction(false);
			toast.success('Breeding completed!', {
				onClose: async () => {
					const fish = await createUserFish(web3.utils.toNumber(data.events.BreedingResult.returnValues.tokenId));
					if(fish != null) {
						// unityContext.showFish(fish);
						unityContext.addBreedOffspring(fish)
					}
					refetchBalance()
					refreshFish(fishAlpha.tokenId, false, true);
					refreshFish(fishBetta.tokenId, false, false);
				},
			});
		})
	}

	const withdrawBreedingFish = async (fish: Fish | null) => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(fish == null) {
			toast.error('Select a Fish');
			return;
		}
		try {
			const gas = await FishFight.breedingWaters?.methods.withdraw(fish.tokenId).estimateGas({from: account})
			await FishFight.breedingWaters?.methods.withdraw(fish.tokenId).send({
				from: account,
				gasPrice: 30000000000,
				gasLimit: gas,
			})
			.on('transactionHash', () => {
				setPendingTransaction(true);
			})
			.on('receipt', async (data: any) => {
				setPendingTransaction(false);
				// withdrawUserBreedingFish(fish);
				// setFishSelectionToShow(FishSelectionEnum.UserFish)
				toast.success('Transaction done', {
					onClose: async () => {
						refetchBalance()
						// refreshFish(fish.tokenId, false, false)
					},
				});
			})
		} catch (error: any) {
			toast.error(error);
		}
	}

	const contractApproveAllFishForBreeding = async () => {
		return FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readBreedingWaters.options.address, true).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: await FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readBreedingWaters.options.address, true).estimateGas({from: account}),
		})
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Approval Failed');
			setPendingTransaction(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
		})
		.on('receipt', () => {
			console.log('Breeding Approval completed')
			toast.success('Breeding Approval completed')
			checkApprovals();
			setPendingTransaction(false);
		})
	
	}

	const depositBreedingFish = async (fish: Fish | null) => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(fish == null) {
			toast.error('Select a Fish');
			return;
		}
		try {
			FishFight.fishFactory?.methods.isApprovedForAll(account, FishFight.readBreedingWaters.options.address).call()
			.then(async (isApproved: boolean) => {
				if(isApproved) {
					contractBreedDeposit(fish);
				} else {
					const approveResults = await contractApproveAllFishForBreeding();
					approveResults.on('receipt', () => {
						contractBreedDeposit(fish);
					})
				}
			})
		} catch (error: any) {
			console.log(error)
		}
	}

	const contractApproveFoodForBreeding = async () => {
			return FishFight.fishFood?.methods.approve(FishFight.readBreedingWaters.options.address, MAX_APPROVE).send({
				from: account,
				gasPrice: 30000000000,
				gasLimit: await FishFight.fishFood?.methods.approve(FishFight.readBreedingWaters.options.address, MAX_APPROVE).estimateGas({from: account})
			})
			.on('error', (error: any) => {
				console.log(error)
				toast.error('Approval Failed');
				setPendingTransaction(false);
			})
			.on('transactionHash', () => {
				setPendingTransaction(true);
			})
			.on('receipt', () => {
				console.log('FishFood Approval completed')
				toast.success('FishFood Approval Completed')
				checkApprovals();
				setPendingTransaction(false);
			})
		
	}

	const contractBreedDeposit = async (fish: Fish) => {
		const gas = await FishFight.breedingWaters?.methods.deposit(fish.tokenId).estimateGas({from: account})
		return FishFight.breedingWaters?.methods.deposit(fish.tokenId).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: gas,
		})
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Deposit Failed');
			setPendingTransaction(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
		})
		.on('receipt', async () => {
			setPendingTransaction(false);
			toast.success('Fish Deposited', {
				onClose: async () => {
					refetchBalance()
				},
			});
		})
	}

	// Event Handlers
	const handleError = (name: string, error: any) => {
		console.log(error)
		toast.error(`${name} Failed`);
		setPendingTransaction(false);
	}


	// Fighting Functions
	const contractIsFighterDeposited = async (tokenId: number) => {
		const owner = await FishFight.readFishFactory.methods.ownerOf(tokenId).call();
		console.log(owner)
		console.log(FishFight.readFishingWaters.options.address)
		return owner == FishFight.readFightingWaters.options.address;
	}

	const contractApproveAllForFighting = async () => {
		return FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readFightingWaters.options.address, true).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: await FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readFightingWaters.options.address, true).estimateGas({from: account}),
		})
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Approval Failed');
			setPendingTransaction(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
		})
		.on('receipt', () => {
			console.log('Fighting Approval completed')
			toast.success('Fighting Approval completed')
			checkApprovals();
			setPendingTransaction(false);
		})
		
	}

	const contractDepositFightingFish = (fish: Fish) => {
		return FishFight.fightingWaters?.methods.deposit(fish.tokenId).estimateGas({from: account}).then((gas: any) => {
			FishFight.fightingWaters?.methods.deposit(fish.tokenId).send({
				from: account,
				gasPrice: 30000000000,
				gasLimit: gas,
			})
			.on('error', (error: any) => {
				console.log(error)
				toast.error('Deposit Failed');
				setPendingTransaction(false);
			})
			.on('transactionHash', () => {
				setPendingTransaction(true);
			})
			.on('receipt', async () => {
				setPendingTransaction(false);
				// depositUserFightingFish(fish);
				toast.success('Fish Deposited', {
					onClose: async () => {
						refetchBalance()
						refreshFish(fish.tokenId, true, false);
					},
				});
			})
		})
		
	}

	const depositFightingFish = async (fish : Fish | null) => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(fish == null) {
			toast.error('Select a Fish');
			return;
		}
		try {
			FishFight.fishFactory?.methods.isApprovedForAll(account, FishFight.readFightingWaters.options.address).call()
			.then(async (isApproved: boolean) => {
				if(isApproved) {
					contractDepositFightingFish(fish);
				} else {
					const approveResult = await contractApproveAllForFighting()
					approveResult.on('receipt', () => {
						contractDepositFightingFish(fish);
					})
				}
			})
		} catch (error: any) {
			console.log(error)
		}
	}

	const withdrawFightingFish = async (fish : Fish | null) => {
		if(fish == null) {
			toast.error('Select a Fish');
			return;
		}

		const secondsSinceEpoch = Math.round(Date.now() / 1000)
		if(fish.stakedFighting != null && fish.stakedFighting.lockedExpire > secondsSinceEpoch) {
			const expireTime = (fish.stakedFighting.lockedExpire - secondsSinceEpoch) / 60;
			const lockedFor = (Math.round(expireTime * 10) / 10).toFixed(1);
			toast.error(`Fish Locked for ${lockedFor} minutes`)
			return;
		}

		const gas = await FishFight.fightingWaters?.methods.withdraw(fish.tokenId).estimateGas({from: account});

		return FishFight.fightingWaters?.methods.withdraw(fish.tokenId).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: gas,
		}).on('transactionHash', () => {
			setPendingTransaction(true);
		}).on('receipt', async (data: any) => {
			setPendingTransaction(false);
			// withdrawUserFightingFish(fish);
			// setFishSelectionToShow(FishSelectionEnum.FightFish)
			toast.success('Transaction done', {
				onClose: async () => {
					refetchBalance()
					refreshFish(fish.tokenId, false, false)
				},
			});
		})
	}

	const contractDeathFight = (myFish: Fish, opponentFish: Fish, contractIsFighterDeposited: boolean) => {
		return FishFight.fightingWaters?.methods.deathFight(myFish.tokenId, opponentFish.tokenId, contractIsFighterDeposited).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: 5000000,
			value: Constants._fightFee
		}).on('transactionHash', () => {
			setPendingTransaction(true);
		}).on('receipt', async (result: any) => {
			const fightIndex = web3.utils.toNumber(result.events.FightCompleted.returnValues._fightIndex);
			setPendingTransaction(false);
			const fightResult = await getFightByIndex(fightIndex, myFish)
			unityContext.sendFightResult(fightResult);
			refreshFish(fightResult.winner, true, false);
			// unityContext.
			toast.success('Fight Completed!', {
				onClose: async () => {
					refetchBalance()
				},
			});
		})
	}

	const fightFish = async (myFish: Fish | null, opponentFish: Fish | null) => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(myFish == null) {
			toast.error('Select your Fighter');
			return;
		}
		if(opponentFish == null) {
			toast.error('Select your opponent');
			return;
		}

		try {
			const deposited = await contractIsFighterDeposited(myFish.tokenId);
			// Must approve not deposited fish before fighting, then trigger death fight with deposit flag = true
			if(deposited) {
				contractDeathFight(myFish, opponentFish, false);
			}
			else { // If User selected fish is already deposited, we can just fight them
				FishFight.fishFactory?.methods.isApprovedForAll(account, FishFight.readFightingWaters.options.address).call()
				.then(async (isApproved: boolean) => {
					if(isApproved) {
						contractDeathFight(myFish, opponentFish, true);
					} else {
						const approveResult = await contractApproveAllForFighting()
						approveResult.on('receipt', () => {
							contractDeathFight(myFish, opponentFish, true);
						})
					}
				})
			}
		} catch (error: any) {
			console.log(error);
			// toast.error(error);
			// setIsFighting(false);
			// setMySelectedFish(null);
			// setOpponentFish(null);
			// setPendingTransaction(false);
		}
	};

	const feedFish = async (fish: Fish | null) => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(fish == null) {
			toast.error('Select a Fish');
			return;
		}
		if(balanceFoodWei && balanceFoodWei.lt(new BN(Constants._feedFee))) {
			toast.error('Not enough $FISHFOOD');
			return;
		}
		const secondsSinceEpoch = Math.round(Date.now() / 1000)
		if(fish.trainingStatus != null && !fish.trainingStatus.canFeed()) {
			const expireTime = (fish.trainingStatus.feedCooldown - secondsSinceEpoch) / 60;
			const lockedFor = (Math.round(expireTime * 10) / 10).toFixed(1);
			toast.error(`Can't feed for ${lockedFor} minutes`)
			return;
		}

		try {
			FishFight.fishFood?.methods.allowance(account, FishFight.readTrainingWaters.options.address).call()
			.then(async (approvedAmount: any) => {
				console.log(approvedAmount)
				console.log(Constants._feedFee)

				console.log(new BN(approvedAmount).gte(new BN(Constants._feedFee)))
				if(new BN(approvedAmount).gte(new BN(Constants._feedFee))) {
					contractFeedFish(fish)
				} else {
					const approveResult = await contractApproveFoodForTraining();
					approveResult.on('receipt', () => {
						console.log("approve")
						contractFeedFish(fish)
					})
				}
			})
		} catch (error: any) {
			console.log(error);
		}
		
	}

	const questFish = async (fish: Fish | null) => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(fish == null) {
			toast.error('Select a Fish');
			return;
		}
		if(balanceFoodWei && balanceFoodWei.lt(new BN(Constants._questFee))) {
			toast.error('Not enough $FISHFOOD');
			return;
		}
		if(!fish.canQuest) {
			toast.error(`${fish.power}/${Constants._modifierCost} POWER Required`);
			return;
		}
		if(fish.seasonStats != null && (fish.seasonStats.agiModifier > 0 || fish.seasonStats.strModifier > 0 || fish.seasonStats.intModifier > 0)) {
			toast.error(`Only 1 Attribute Upgrade allowed per season!`)
			return;
		}
		try {
			FishFight.fishFood?.methods.allowance(account, FishFight.readTrainingWaters.options.address).call()
			.then(async (approvedAmount: any) => {
				console.log(approvedAmount)
				console.log(Constants._feedFee)

				console.log(new BN(approvedAmount).gte(new BN(Constants._feedFee)))
				if(new BN(approvedAmount).gte(new BN(Constants._feedFee))) {
					contractQuestFish(fish)
				} else {
					const approveResult = await contractApproveFoodForTraining();
					approveResult.on('receipt', () => {
						console.log("approve")
						contractQuestFish(fish)
					})
				}
			})
		} catch (error: any) {
			console.log(error);
		}
		
	}

	const claimAllFishFood = async () => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		try {
			contractClaimAllFishFood()	
		} catch (error: any) {
			console.log(error);
		}
	}

	const feedAllFish = async () => {
		const tokenIds = userFish.filter((fish) => {
			return fish.trainingStatus.canFeed()
		}).map(fish => fish.tokenId)
		console.log(tokenIds)
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(balanceFoodWei && balanceFoodWei.lt(new BN(Constants._feedFee).mul(new BN(tokenIds.length))) ) {
			toast.error('Not enough $FISHFOOD');
			return;
		}
		try {
			FishFight.fishFood?.methods.allowance(account, FishFight.readTrainingWaters.options.address).call()
			.then(async (approvedAmount: any) => {
				if(new BN(approvedAmount).gte(new BN(Constants._feedFee).mul(new BN(tokenIds.length))) ) {
					contractFeedMultipleFish(tokenIds)
				} else {
					const approveResult = await contractApproveFoodForTraining();
					approveResult.on('receipt', () => {
						console.log("approve")
						contractFeedMultipleFish(tokenIds)
					})
				}
			})
		} catch (error: any) {
			console.log(error);
		}
	}

	const claimFishFood = async (fish: Fish | null) => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(fish == null) {
			toast.error('Select a Fish');
			return;
		}

		const secondsSinceEpoch = Math.round(Date.now() / 1000)
		if(fish.trainingStatus != null && !fish.trainingStatus.canClaim()) {
			const expireTime = (fish.trainingStatus.claimCooldown - secondsSinceEpoch) / 60;
			const lockedFor = (Math.round(expireTime * 10) / 10).toFixed(1);
			toast.error(`Can't claim for ${lockedFor} minutes`)
			return;
		}
		try {
			contractClaimFishFood(fish)	
		} catch (error: any) {
			console.log(error);
		}
		
	}

	const contractFeedFish = async (fish: Fish) => {
		console.log("here")
		console.log(fish)
		console.log(account)
		const gas = await FishFight.trainingWaters?.methods.feedFish(fish.tokenId).estimateGas({from: account});
		return FishFight.trainingWaters?.methods.feedFish(fish.tokenId).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: gas,
		})
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Feed Failed');
			setPendingTransaction(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
			//unityContext.isFighting ?
		})
		.on('receipt', async (result: any) => {
			setPendingTransaction(false);
			refreshFish(fish.tokenId, fish.stakedBreeding != null, fish.stakedFighting != null)
			toast.success('Fish Fed!', {
				onClose: async () => {
					refetchBalance()
				},
			});
		})
	}

	const contractQuestFish = async (fish: Fish) => {
		const gas = await FishFight.trainingWaters?.methods.questFish(fish.tokenId, 2).estimateGas({from: account})
		return FishFight.trainingWaters?.methods.questFish(fish.tokenId, getRandomIntInclusive(0, 2)).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: gas,
		})
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Quest Failed');
			setPendingTransaction(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
		})
		.on('receipt', async (result: any) => {
			setPendingTransaction(false);
			refreshFish(fish.tokenId, false, false)
			toast.success('Quest Successful!', {
				onClose: async () => {
					refetchBalance()
				},
			});
		})
	}

	const contractClaimFishFood = async (fish: Fish) => {
		const gas = await FishFight.trainingWaters?.methods.claimFishFood(fish.tokenId).estimateGas({from: account});
		return FishFight.trainingWaters?.methods.claimFishFood(fish.tokenId).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: gas,
		})
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Quest Failed');
			setPendingTransaction(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
		})
		.on('receipt', async (result: any) => {
			setPendingTransaction(false);
			refreshFish(fish.tokenId, false, false)
			toast.success('Claim Successful!', {
				onClose: async () => {
					refetchBalance()
				},
			});
		})
	}

	const contractClaimAllFishFood = async () => {
		const gas = await FishFight.trainingWaters?.methods.claimAllFishFood().estimateGas({from: account});
		return FishFight.trainingWaters?.methods.claimAllFishFood().send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: gas,
		})
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Claim All Failed');
			setPendingTransaction(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
		})
		.on('receipt', async (result: any) => {
			setPendingTransaction(false);
			refreshLoadedFish()
			toast.success('Claim Successful!', {
				onClose: async () => {
					refetchBalance()
				},
			});
		})
	}

	const contractFeedMultipleFish = async (tokenIds: number[]) => {
		const gas = await FishFight.trainingWaters?.methods.feedMultipleFish(tokenIds).estimateGas({from: account});
		return FishFight.trainingWaters?.methods.feedMultipleFish(tokenIds).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: gas,
		})
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Feed All Failed');
			setPendingTransaction(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
		})
		.on('receipt', async (result: any) => {
			setPendingTransaction(false);
			refreshLoadedFish()
			toast.success('Feed All Successful!', {
				onClose: async () => {
					refetchBalance()
				},
			});
		})
	}

	const contractApproveFoodForTraining = async () => {
		return FishFight.fishFood?.methods.approve(FishFight.readTrainingWaters.options.address, MAX_APPROVE).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: await FishFight.fishFood?.methods.approve(FishFight.readTrainingWaters.options.address, MAX_APPROVE).estimateGas({from: account})
		})
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Approval Failed');
			setPendingTransaction(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
		})
		.on('receipt', () => {
			console.log('FishFood Approval completed')
			toast.success('FishFood Approval Completed')
			checkApprovals();
			setPendingTransaction(false);
		})

	}

	const getFightByIndex = async (fightIndex: number, myFish: Fish) => {
		const fightInfo = await FishFight.fightingWaters?.methods.getFightInfo(fightIndex).call();
		let fightResult = new Fight(fightInfo);
		if(myFish.tokenId === fightResult.winner) fightResult.playerResult = 1;
		else if(fightResult.winner === 0) fightResult.playerResult = 0;
		else fightResult.playerResult = -1;

		return fightResult;
	}

	function getRandomIntInclusive(min: number, max: number) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
	}

	const value: ProviderInterface = {
		fightFish: fightFish,
		depositFightingFish: depositFightingFish,
		withdrawFightingFish: withdrawFightingFish,
		breedFish: breedFish,
		withdrawBreedingFish: withdrawBreedingFish,
		depositBreedingFish: depositBreedingFish,
		feedFish: feedFish,
		questFish: questFish,
		claimFishFood: claimFishFood,
		claimAllFishFood: claimAllFishFood,
		feedAllFish: feedAllFish,
		contractApproveAllForFighting: contractApproveAllForFighting,
		contractApproveAllFishForBreeding: contractApproveAllFishForBreeding,
		contractApproveFoodForBreeding: contractApproveFoodForBreeding,
		contractApproveFoodForTraining: contractApproveFoodForTraining,
		pendingTransaction: pendingTransaction
	};
	return <ContractWrapperContext.Provider value={value}>{children}</ContractWrapperContext.Provider>;
};

export const useContractWrapper = () => {
	const context = useContext(ContractWrapperContext);

	if (!context) {
		throw 'useContractWrapper must be used within a ContractWrapperProvider';
	}
	return context;
};
