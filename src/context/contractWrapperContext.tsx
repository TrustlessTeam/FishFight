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
	questFish: (fish: Fish | null, choice: number) => void;
	claimFishFood: (fish: Fish | null) => void;
	claimAllFishFood: () => void;
	feedAllFish: () => void;
	contractApproveAllForFighting: (revoke?: boolean) => void;
	contractApproveAllFishForBreeding: (revoke?: boolean) => void;
	contractApproveFoodForBreeding: (amount: string) => void;
	contractApproveFoodForTraining: (amount: string) => void;
	setPerTransactionApproval: (value: boolean) => void;
	perTransactionApproval: boolean;
	pendingTransaction: boolean;
	showTrainingFoodApproval: boolean;
	showFightingFishApproval: boolean;
	showBreedingFishApproval: boolean;
	showFightingDisclaimer: boolean;
	showBreedingDisclaimer: boolean;
	showFishingDisclaimer: boolean;
}

type ProviderProps = { children: React.ReactNode };

const ContractWrapperContext = createContext<ProviderInterface | undefined>(undefined);

export const ContractWrapperProvider = ({ children }: ProviderProps) => {
	const [pendingTransaction, setPendingTransaction] = useState<boolean>(false);

	// Account Approvals
  const [perTransactionApproval, setPerTransactionApproval] = useState<boolean>(false);
  const [fightingFishApproval, setFightingFishApproval] = useState<boolean>(false);
  const [breedingFishApproval, setBreedingFishApproval] = useState<boolean>(false);
  // const [trainingFishApproval, setTrainingFishApproval] = useState<boolean>(false);

  const [trainingFoodApproval, setTrainingFoodApproval] = useState<BN>(new BN(0));
  const [breedingFoodApproval, setBreedingFoodApproval] = useState<BN>(new BN(0));
  const [fightingFoodApproval, setFightingFoodApproval] = useState<BN>(new BN(0));

	// Show Approval Disclaimer
	const [showFightingFishApproval, setShowFightingFishApproval] = useState<boolean>(false);
	const [showBreedingFishApproval, setShowBreedingFishApproval] = useState<boolean>(false);
	const [showTrainingFoodApproval, setShowTrainingFoodApproval] = useState<boolean>(false);
	const [showBreedingFoodApproval, setShowBreedingFoodApproval] = useState<boolean>(false);

	const [showFightingDisclaimer, setShowFightingDisclaimer] = useState<boolean>(false);
	const [showBreedingDisclaimer, setShowBreedingDisclaimer] = useState<boolean>(false);
	const [showFishingDisclaimer, setShowFishingDisclaimer] = useState<boolean>(false);



	const { account } = useWeb3React();
	const { FishFight, refetchBalance, balanceFoodWei } = useFishFight();
	const { userFish, refreshFish, createUserFish, refreshLoadedFish } = useFishPool();
	const unityContext = useUnity();

	useEffect(() => {
		if(account) {
			checkApprovals(account)
		}
	}, [account]);


  const checkApprovals = async (account: any) => {
    // Fighting Waters Fish approvals
    const approvedFishFighting = await FishFight.readFishFactory.methods.isApprovedForAll(account, FishFight.readFightingWaters.options.address).call();
    setFightingFishApproval(approvedFishFighting);
    console.log(approvedFishFighting)

    // Fighting Waters Food allowance
    // let approvedFoodFighting = new BN(await FishFightInstance.readFishFood.methods.allowance(account, FishFightInstance.readFightingWaters.options.address).call());
    // setFightingFoodApproval(approvedFoodFighting);

    // Breeding Waters approvals
    const approvedFishBreeding = await FishFight.readFishFactory.methods.isApprovedForAll(account, FishFight.readBreedingWaters.options.address).call();
    setBreedingFishApproval(approvedFishBreeding);
    console.log(approvedFishBreeding)

    // Breeding Waters Food allowance
    // let approvedFoodBreeding = new BN(await FishFightInstance.readFishFood.methods.allowance(account, FishFightInstance.readBreedingWaters.options.address).call());
    // setBreedingFoodApproval(approvedFoodBreeding);

    // Training Waters Food allowance
    const approvedFoodTraining = new BN(await FishFight.readFishFood.methods.allowance(account, FishFight.readTrainingWaters.options.address).call());
    setTrainingFoodApproval(approvedFoodTraining);
    console.log(approvedFoodTraining)

    // const approvedFishTraining = await FishFightInstance.readFishFactory.methods.isApprovedForAll(account, FishFightInstance.readTrainingWaters.options.address).call();
    // setTrainingFishApproval(true);
    
    
  }

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
		if(fishAlpha.fishModifiers.alphaModifier.uses === 0) {
			toast.error(`Alpha Selection: No longer Alpha`)
			return;
		}

		if(fishBetta.stakedFighting) {
			toast.error('Betta Selection: Withdraw from Fight Pool');
			return;
		} 
		if(fishBetta.fishModifiers.alphaModifier.uses > 0 || fishBetta.stakedBreeding) {
			toast.error('Betta Selection: Fish is Alpha');
			return;
		}

		if(fishBetta.stakedBreeding && fishBetta.fishModifiers.inBettaCooldown()) {
			toast.error('Betta Selection: In breed cooldown');
			return;
		}
		if(fishBetta.power < Constants._bettaBreedPowerFee) {
			toast.error(`Betta Selection: ${fishBetta.power} of ${Constants._bettaBreedPowerFee} power required to breed`)
			return;
		}
		if(balanceFoodWei && balanceFoodWei.lt(new BN(Constants._fishFoodBreedFee))) {
			toast.error('Not enough $FISHFOOD');
			return;
		}
		try {
			if(Constants._fishFoodBreedFee !== '0' && perTransactionApproval && breedingFoodApproval.lt(new BN(Constants._fishFoodBreedFee))) {
				const approveResults = await contractApproveFoodForBreeding(Constants._fishFoodBreedFee)
				console.log(approveResults)
				if(approveResults.events.Approval.returnValues.approved === FishFight.readBreedingWaters.options.address) {
					contractBreed(fishAlpha, fishBetta)
				}
			} else {
				contractBreed(fishAlpha, fishBetta)
			}
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
		const isBreeding = await FishFight.readCycles.methods.isBreedingPhase().call(); // check per call to prevent use from over/under paying
		return FishFight.breedingWaters?.methods.breedFish(fishAlpha.tokenId, fishBetta.tokenId).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: 15000000,
			value: isBreeding ? Constants._oneBreedFeeInPhase : Constants._oneBreedFee
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
				onOpen: async () => {
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
					onOpen: async () => {
						refetchBalance()
						refreshFish(fish.tokenId, false, false)
					},
				});
			})
		} catch (error: any) {
			toast.error(error);
		}
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
			// All $FISH are approved
			if(breedingFishApproval) {
				contractBreedDeposit(fish);
				return;
			}

			// Need to Approve All $FISH
			if(!perTransactionApproval && !breedingFishApproval) {
				const approvalAllResult = await contractApproveAllFishForBreeding()
				if(approvalAllResult.events.ApprovalForAll.returnValues.approved) {
					contractBreedDeposit(fish);
					return;
				}
			}

			// User wants to approve per $FISH / Transaction
			if(perTransactionApproval && !breedingFishApproval) {
				FishFight.fishFactory?.methods.getApproved(fish.tokenId).call()
				.then(async (address: string) => {
					if(address === FishFight.readBreedingWaters.options.address) {
						contractBreedDeposit(fish);
					} else {
						const approveResults = await contractApproveFishForBreeding(fish.tokenId);
						console.log(approveResults)
						if(approveResults.events.Approval.returnValues.approved === FishFight.readBreedingWaters.options.address) {
							contractBreedDeposit(fish);
						}
					}
				})
			}
			
		} catch (error: any) {
			console.log(error)
		}
	}

	const contractApproveAllFishForBreeding = async (revoke?: boolean) => {
		let grant = true;
		if(revoke) grant = false;
		setShowBreedingFishApproval(true);
		return FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readBreedingWaters.options.address, grant).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: await FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readBreedingWaters.options.address, grant).estimateGas({from: account}),
		})
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Approval Failed');
			setPendingTransaction(false);
			setShowBreedingFishApproval(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
		})
		.on('receipt', (data: any) => {
			console.log('Breeding Approval completed')
			toast.success('Breeding Approval completed')
			console.log(data)
			setBreedingFishApproval(true)
			setPendingTransaction(false);
			setShowBreedingFishApproval(false);
		})
	}

	const contractApproveFishForBreeding = async (tokenId: number) => {
		setShowBreedingFishApproval(true);
		return FishFight.fishFactory?.methods.approve(FishFight.readBreedingWaters.options.address, tokenId).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: await FishFight.fishFactory?.methods.approve(FishFight.readBreedingWaters.options.address, tokenId).estimateGas({from: account}),
		})
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Approval Failed');
			setPendingTransaction(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
		})
		.on('receipt', (data: any) => {
			console.log('Breeding Approval completed')
			toast.success('Breeding Approval completed')
			console.log(data)
			setPendingTransaction(false);
			setShowBreedingFishApproval(false);
		})
	}

	const contractApproveFoodForBreeding = async (amountToApprove: string) => {
		setShowBreedingFoodApproval(true);
		return FishFight.fishFood?.methods.approve(FishFight.readBreedingWaters.options.address, amountToApprove).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: await FishFight.fishFood?.methods.approve(FishFight.readBreedingWaters.options.address, amountToApprove).estimateGas({from: account})
		})
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Approval Failed');
			setPendingTransaction(false);
			setShowBreedingFoodApproval(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
		})
		.on('receipt', (data: any) => {
			console.log(data)
			console.log('FishFood Approval completed')
			toast.success('FishFood Approval Completed')
			setBreedingFoodApproval(new BN(amountToApprove))
			setPendingTransaction(false);
			setShowBreedingFoodApproval(false);
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
				onOpen: async () => {
					refetchBalance();
					refreshFish(fish.tokenId, false, true);
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
		return owner === FishFight.readFightingWaters.options.address;
	}

	const contractApproveAllForFighting = async (revoke?: boolean) => {
		setShowFightingFishApproval(true);
		let grant = true;
		if(revoke) grant = false;
		return FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readFightingWaters.options.address, grant).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: await FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readFightingWaters.options.address, grant).estimateGas({from: account}),
		})
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Approval Failed');
			console.log("Failed here")
			setPendingTransaction(false);
			setShowFightingFishApproval(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
		})
		.on('receipt', (data: any) => {
			console.log(data)
			console.log('Fighting Approval completed')
			toast.success('Fighting Approval completed')
			setFightingFishApproval(true);
			setPendingTransaction(false);
			setShowFightingFishApproval(false);
		})
		
	}

	const contractApproveFishForFighting = async (tokenId: number) => {
		setShowFightingFishApproval(true);
		return FishFight.fishFactory?.methods.approve(FishFight.readFightingWaters.options.address, tokenId).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: await FishFight.fishFactory?.methods.approve(FishFight.readFightingWaters.options.address, tokenId).estimateGas({from: account}),
		})
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Approval Failed');
			setPendingTransaction(false);
			setShowFightingFishApproval(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
		})
		.on('receipt', (data: any) => {
			console.log(data)
			console.log('Fighting Approval completed')
			toast.success('Fighting Approval completed')
			setPendingTransaction(false);
			setShowFightingFishApproval(false);
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
					onOpen: async () => {
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
			// All $FISH are approved
			if(fightingFishApproval) {
				contractDepositFightingFish(fish);
				return;
			}

			// Need to Approve All $FISH
			if(!perTransactionApproval && !fightingFishApproval) {
				const approvalAllResult = await contractApproveAllFishForBreeding()
				if(approvalAllResult.events.ApprovalForAll.returnValues.approved) {
					contractBreedDeposit(fish);
					return;
				}
			}

			// User wants to approve per $FISH / Transaction
			if(perTransactionApproval && !breedingFishApproval) {
				FishFight.fishFactory?.methods.getApproved(fish.tokenId).call()
				.then(async (address: string) => {
					if(address === FishFight.readFightingWaters.options.address) {
						contractDepositFightingFish(fish);
					} else {
						const approveResult = await contractApproveFishForFighting(fish.tokenId)
						console.log(approveResult)
						if(approveResult.events.Approval.returnValues.approved === FishFight.readFightingWaters.options.address) {
							contractDepositFightingFish(fish);
						}
					}
				})
			}
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
		})
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Withdraw Failed');
			setPendingTransaction(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
		}).on('receipt', async (data: any) => {
			setPendingTransaction(false);
			// withdrawUserFightingFish(fish);
			// setFishSelectionToShow(FishSelectionEnum.FightFish)
			toast.success('Transaction done', {
				onOpen: async () => {
					refetchBalance()
					refreshFish(fish.tokenId, false, false)
				},
			});
		})
	}

	const contractDeathFight = (myFish: Fish, opponentFish: Fish, contractIsFighterDeposited: boolean) => {
		console.log('adasdasdasda')
		setShowFightingDisclaimer(true);
		return FishFight.fightingWaters?.methods.deathFight(myFish.tokenId, opponentFish.tokenId, contractIsFighterDeposited).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: 5000000,
			value: Constants._fightFee
		})
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Fight Failed');
			setPendingTransaction(false);
			setShowFightingDisclaimer(false);

		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
			setShowFightingDisclaimer(false);
		}).on('receipt', async (result: any) => {
			const fightIndex = web3.utils.toNumber(result.events.FightCompleted.returnValues._fightIndex);
			setPendingTransaction(false);
			const fightResult = await getFightByIndex(fightIndex, myFish)
			unityContext.sendFightResult(fightResult);
			// unityContext.
			toast.success('Fight Completed!', {
				onOpen: async () => {
					refetchBalance()
					if(myFish.tokenId === fightResult.winner) refreshFish(myFish.tokenId, true, false);
					if(opponentFish.tokenId === fightResult.winner) refreshFish(opponentFish.tokenId, true, false);	
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

		if(myFish.tokenId === opponentFish.tokenId) {
			toast.error("Can't Fight the same Fish")
			return;
		}

		if(myFish.stakedBreeding) {
			toast.error("Can't use Fish that's in the Breed Pool");
			return;
		}

		try {
			console.log("fight fish")
			console.log(fightingFishApproval)
			const deposited = await contractIsFighterDeposited(myFish.tokenId);

			// User Fish is already in fight pool, so no deposit or approvals required
			if(deposited) {
				contractDeathFight(myFish, opponentFish, false);
				return;
			}

			// User fish not deposited, but is approved
			if(fightingFishApproval) {
				contractDeathFight(myFish, opponentFish, true);
				return;
			}
			
			// Fish is not deposited, so approveAll Fish and then fight & deposit
			if(!fightingFishApproval && !perTransactionApproval) {
				const approvalAllResult = await contractApproveAllForFighting()
				console.log(approvalAllResult)
				if(approvalAllResult.events.ApprovalForAll.returnValues.approved) {
					contractDeathFight(myFish, opponentFish, true);
					return;
				}				
			}

			// Fish is not deposited and owner wants per transaction approval
			if(!fightingFishApproval && perTransactionApproval) {
				console.log("here")
				FishFight.fishFactory?.methods.getApproved(myFish.tokenId).call()
				.then(async (address: string) => {
					if(address === FishFight.readFightingWaters.options.address) {
						contractDeathFight(myFish, opponentFish, true);
					} else {
						const approveResult = await contractApproveFishForFighting(myFish.tokenId)
						console.log(approveResult)
						if(approveResult.events.Approval.returnValues.approved === FishFight.readFightingWaters.options.address) {
							contractDeathFight(myFish, opponentFish, true);
						}
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
		if(fish.fishModifiers.powerModifier.value === Constants._maxPower) {
			toast.error('Power Max');
			return;
		}
		const secondsSinceEpoch = Math.round(Date.now() / 1000)
		if(fish.fishModifiers != null && !fish.fishModifiers.canFeed()) {
			const expireTime = (fish.fishModifiers.feedModifier.time - secondsSinceEpoch) / 60;
			const lockedFor = (Math.round(expireTime * 10) / 10).toFixed(1);
			toast.error(`Can't feed for ${lockedFor} minutes`)
			return;
		}

		try {
			// User has allowance to Feed Fish
			if(trainingFoodApproval.gte(new BN(Constants._feedFee))) {
				contractFeedFish(fish);
				return;
			}
			// Not enough allowance of Fish food spend, so approve and use MAX int
			if(trainingFoodApproval.lt(new BN(Constants._feedFee)) && !perTransactionApproval) {
				const approveResult = await contractApproveFoodForTraining(MAX_APPROVE);
				console.log(approveResult)
				if(approveResult.events.Approval.returnValues.spender === FishFight.readTrainingWaters.options.address &&
					new BN(approveResult.events.Approval.returnValues.value).gte(new BN(Constants._feedFee))) {
					contractFeedFish(fish);
				}
			}

			// Not enough allowance, but user wants to not use Max int, so approve just enough
			if(trainingFoodApproval.lt(new BN(Constants._feedFee)) && perTransactionApproval) {
				const approveResult = await contractApproveFoodForTraining(Constants._feedFee);
				console.log(approveResult)
				if(approveResult.events.Approval.returnValues.spender === FishFight.readTrainingWaters.options.address &&
					new BN(approveResult.events.Approval.returnValues.value).gte(new BN(Constants._feedFee))) {
					contractFeedFish(fish);
				}
			}
			
		} catch (error: any) {
			console.log(error);
		}
		
	}

	const questFish = async (fish: Fish | null, choice: number) => {
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
			toast.error(`${fish.power}/${Constants._fightModifierCost} POWER Required`);
			return;
		}
		// if(fish.seasonStats != null && (fish.seasonStats.agiModifier > 0 || fish.seasonStats.strModifier > 0 || fish.seasonStats.intModifier > 0)) {
		// 	toast.error(`Only 1 Attribute Upgrade allowed per season!`)
		// 	return;
		// }
		try {
			// User has allowance to Feed Fish
			if(trainingFoodApproval.gte(new BN(Constants._questFee))) {
				console.log("quest approved")
				contractQuestFish(fish, choice);
				return;
			}

		// Not enough allowance of Fish food spend, so approve and use MAX int
		if(trainingFoodApproval.lt(new BN(Constants._feedFee)) && !perTransactionApproval) {
			const approveResult = await contractApproveFoodForTraining(MAX_APPROVE);
			console.log(approveResult)
			if(approveResult.events.Approval.returnValues.spender === FishFight.readTrainingWaters.options.address &&
				new BN(approveResult.events.Approval.returnValues.value).gte(new BN(Constants._questFee))) {
				contractFeedFish(fish);
			}
		}

		// Not enough allowance, but user wants to not use Max int, so approve just enough
		if(trainingFoodApproval.lt(new BN(Constants._feedFee)) && perTransactionApproval) {
			const approveResult = await contractApproveFoodForTraining(Constants._questFee);
			console.log(approveResult)
			if(approveResult.events.Approval.returnValues.spender === FishFight.readTrainingWaters.options.address &&
				new BN(approveResult.events.Approval.returnValues.value).gte(new BN(Constants._questFee))) {
				contractFeedFish(fish);
			}
		}
			
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
			return fish.fishModifiers.canFeed()
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

			const requiredAllowance = new BN(Constants._feedFee).mul(new BN(tokenIds.length))
			if(trainingFoodApproval.gte(requiredAllowance) ) {
				contractFeedMultipleFish(tokenIds)
			} 

			// Not enough allowance of Fish food spend, so approve and use MAX int
			if(trainingFoodApproval.lt(new BN(Constants._feedFee)) && !perTransactionApproval) {
				const approveResult = await contractApproveFoodForTraining(MAX_APPROVE);
				console.log(approveResult)
				if(approveResult.events.Approval.returnValues.spender === FishFight.readTrainingWaters.options.address &&
					new BN(approveResult.events.Approval.returnValues.value).gte(requiredAllowance)) {
					contractFeedMultipleFish(tokenIds)
				}
			}

			// Not enough allowance, but user wants to not use Max int, so approve just enough
			if(trainingFoodApproval.lt(new BN(Constants._feedFee)) && perTransactionApproval) {
				const approveResult = await contractApproveFoodForTraining(requiredAllowance.toString());
				console.log(approveResult)
				if(approveResult.events.Approval.returnValues.spender === FishFight.readTrainingWaters.options.address &&
					new BN(approveResult.events.Approval.returnValues.value).gte(requiredAllowance)) {
					contractFeedMultipleFish(tokenIds)
				}
			}

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
		if(fish.fishModifiers != null && !fish.fishModifiers.canCollect()) {
			const expireTime = (fish.fishModifiers.collectModifier.time - secondsSinceEpoch) / 60;
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
			toast.success('Fish Fed!', {
				onOpen: async () => {
					refetchBalance()
					refreshFish(fish.tokenId, fish.stakedBreeding != null, fish.stakedFighting != null)
				},
			});
		})
	}

	const contractQuestFish = async (fish: Fish, choice: number) => {
		const gas = await FishFight.trainingWaters?.methods.questFish(fish.tokenId, choice).estimateGas({from: account})
		return FishFight.trainingWaters?.methods.questFish(fish.tokenId, choice).send({
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
			toast.success('Quest Successful!', {
				onOpen: async () => {
					refetchBalance()
					refreshFish(fish.tokenId, false, false)
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
			toast.success('Claim Successful!', {
				onOpen: async () => {
					refetchBalance()
					refreshFish(fish.tokenId, false, false)
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
			
			toast.success('Claim Successful!', {
				onOpen: async () => {
					refetchBalance()
					refreshLoadedFish()
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
			toast.success('Feed All Successful!', {
				onOpen: async () => {
					refetchBalance()
					refreshLoadedFish()
				},
			});
		})
	}

	const contractApproveFoodForTraining = async (amountToApprove: string) => {
		setShowTrainingFoodApproval(true);
		return FishFight.fishFood?.methods.approve(FishFight.readTrainingWaters.options.address, amountToApprove).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: await FishFight.fishFood?.methods.approve(FishFight.readTrainingWaters.options.address, amountToApprove).estimateGas({from: account})
		})
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Approval Failed');
			setPendingTransaction(false);
			setShowTrainingFoodApproval(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
		})
		.on('receipt', (data: any) => {
			console.log(data)
			console.log('FishFood Approval completed')
			toast.success('FishFood Approval Completed')
			setTrainingFoodApproval(new BN(amountToApprove))
			setPendingTransaction(false);
			setShowTrainingFoodApproval(false);
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
		setPerTransactionApproval: setPerTransactionApproval,
		perTransactionApproval: perTransactionApproval,
		pendingTransaction: pendingTransaction,
		showTrainingFoodApproval: showTrainingFoodApproval,
		showFightingFishApproval: showFightingFishApproval,
		showBreedingFishApproval: showBreedingFishApproval,
		showFightingDisclaimer: showFightingDisclaimer,
		showBreedingDisclaimer: showBreedingDisclaimer,
		showFishingDisclaimer: showFishingDisclaimer
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
