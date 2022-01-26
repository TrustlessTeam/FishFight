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

const BREEDCOSTONE = web3.utils.toBN(1);
const BREEDCOSTFISHFOOD = web3.utils.toBN(100);

interface ProviderInterface {
	fightFish: (fishA: Fish | null, fishB: Fish | null) => void;
	depositFightingFish: (fish: Fish | null) => void;
	withdrawFightingFish: (fish: Fish | null) => void;
	breedFish: (fishA: Fish | null, fishB: Fish | null) => void;
	withdrawBreedingFish: (fish: Fish | null) => void;
	depositBreedingFish: (fish: Fish | null) => void;
	pendingTransaction: boolean;
}

type ProviderProps = { children: React.ReactNode };

const ContractWrapperContext = createContext<ProviderInterface | undefined>(undefined);

export const ContractWrapperProvider = ({ children }: ProviderProps) => {
	const [pendingTransaction, setPendingTransaction] = useState<boolean>(false);
	const { account } = useWeb3React();
	const { FishFight, refetchBalance } = useFishFight();
	const { refreshFish, createUserFish } = useFishPool();
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

		try {
			FishFight.fishFood?.methods.allowance(account, FishFight.readBreedingWaters.options.address).call()
			.then((approvedAmount: any) => {
				console.log(approvedAmount)
				console.log(web3.utils.fromWei(approvedAmount))
				if(web3.utils.fromWei(approvedAmount) >= '100') {
					contractBreed(fishAlpha, fishBetta)
				} else {
					contractApproveFoodForBreeding()
					.on('receipt', () => {
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

	const contractBreed = (fishAlpha: Fish, fishBetta: Fish) => {
		console.log(fishAlpha)
		console.log(fishBetta)
		return FishFight.breedingWaters?.methods.breedFish(fishAlpha.tokenId, fishBetta.tokenId).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: 6000000,
			value: web3.utils.toWei(BREEDCOSTONE)
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
						unityContext.showFish(fish);
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
			await FishFight.breedingWaters?.methods.withdraw(fish.tokenId).send({
				from: account,
				gasPrice: 30000000000,
				gasLimit: 800000,
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

	const contractApproveAllFishForBreeding = () => {
		return FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readBreedingWaters.options.address, true).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: 500000,
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
			.then((isApproved: boolean) => {
				if(isApproved) {
					contractBreedDeposit(fish);
				} else {
					contractApproveAllFishForBreeding()
					.on('receipt', () => {
						contractBreedDeposit(fish);
					})
				}
			})
		} catch (error: any) {
			console.log(error)
		}
	}

	const contractApproveFoodForBreeding = () => {
		return FishFight.fishFood?.methods.approve(FishFight.readBreedingWaters.options.address, web3.utils.toWei(BREEDCOSTFISHFOOD)).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: 500000
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
		})
	}

	const contractBreedDeposit = (fish: Fish) => {
		return FishFight.breedingWaters?.methods.deposit(fish.tokenId).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: 800000,
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

	const contractApproveAllForFighting = () => {
		return FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readFightingWaters.options.address, true).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: 500000,
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
		})
	}

	const contractDepositFightingFish = (fish: Fish) => {
		return FishFight.fightingWaters?.methods.deposit(fish.tokenId).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: 800000,
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
			.then((isApproved: boolean) => {
				if(isApproved) {
					contractDepositFightingFish(fish);
				} else {
					contractApproveAllForFighting()
					.on('receipt', () => {
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

		return FishFight.fightingWaters?.methods.withdraw(fish.tokenId).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: 800000,
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
			value: web3.utils.toWei('1')
		}).on('transactionHash', () => {
			setPendingTransaction(true);
			//unityContext.isFighting ?
		}).on('receipt', async (result: any) => {
			// console.log(result)
			//unityContext.isFighting ?
			const fightIndex = web3.utils.toNumber(result.events.FightCompleted.returnValues._fightIndex);
			setPendingTransaction(false);
			await getUserFight(fightIndex, myFish, opponentFish);
			toast.success('Fight Commpleted!', {
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
				.then((isApproved: boolean) => {
					if(isApproved) {
						contractDeathFight(myFish, opponentFish, true);
					} else {
						contractApproveAllForFighting()
						.on('receipt', () => {
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

	

	

	const getUserFight = async (fightIndex: number, myFish: Fish, opponentFish: Fish) => {
		const fightInfo = await FishFight.fightingWaters?.methods.getFightInfo(fightIndex).call();
		const newFight = new Fight(
			new BN(fightInfo.typeOfFight).toNumber(),
			new BN(fightInfo.fishChallenger).toNumber(),
			new BN(fightInfo.fishChallenged).toNumber(),
			new BN(fightInfo.timeOfFight).toNumber(),
			fightInfo.round1,
			fightInfo.round2,
			fightInfo.round3,
			new BN(fightInfo.winner).toNumber()
		);
		unityContext.sendRound(1, newFight.round1.value);
		unityContext.sendRound(2, newFight.round2.value);
		unityContext.sendRound(3, newFight.round3.value);
		if(newFight.winner == myFish.tokenId) {
			unityContext.sendWinner(myFish);
			// depositUserFightingFish(userFish);
		}
		else if(newFight.winner == opponentFish?.tokenId) {
			unityContext.sendWinner(opponentFish);
		}
		else if(newFight.winner == 0) {
			unityContext.sendTie()
		}
		// unityContext.showFightingLocationResult?
		refreshFish(newFight.winner, true, false);
	}

	const value: ProviderInterface = {
		fightFish: fightFish,
		depositFightingFish: depositFightingFish,
		withdrawFightingFish: withdrawFightingFish,
		breedFish: breedFish,
		withdrawBreedingFish: withdrawBreedingFish,
		depositBreedingFish: depositBreedingFish,
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
