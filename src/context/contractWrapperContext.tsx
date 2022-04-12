import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Contract } from "web3-eth-contract";
import { useWeb3React } from '@web3-react/core';
import { useFishFight } from '../context/fishFightContext';
import web3 from 'web3';


import Fish from '../utils/fish';
import { useUnity } from './unityContext';
import { useFishPool } from './fishPoolContext';
import { Fight } from '../utils/fight';
import BN from 'bn.js';
import { Constants } from '../utils/constants';
import { getProvider } from '../utils/provider';

const BREEDCOSTONE = web3.utils.toBN(1);
const BREEDCOSTFISHFOOD = web3.utils.toBN(100);
const MAX_APPROVE = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

interface ProviderInterface {
	catchFish: () => void;
	fightFish: (fishA: Fish | null, fishB: Fish | null) => Promise<boolean | undefined>;
	fightFishWeak: (fishA: Fish | null, fishB: Fish | null) => Promise<boolean | undefined>;
	depositFightingFish: (fish: Fish | null) => void;
	depositFightingFishWeak: (fish: Fish | null) => void;
	withdrawFightingFish: (fish: Fish | null) => void;
	withdrawFightingFishWeak: (fish: Fish | null) => void;
	breedFish: (fishA: Fish | null, fishB: Fish | null) => void;
	withdrawBreedingFish: (fish: Fish | null) => void;
	depositBreedingFish: (fish: Fish | null) => void;
	feedFish: (fish: Fish | null) => void;
	questFish: (fish: Fish | null, choice: number) => void;
	claimFishFood: (fish: Fish | null) => void;
	claimAllFishFood: () => void;
	feedAllFish: () => void;
	contractApproveFishForFighting: (approvalType: number, callback: any) => void;
	contractApproveFishForFightingWeak: (approvalType: number, callback: any) => void;
	contractApproveFishForBreeding: (approvalType: number, callback: any) => void;
	contractApproveFoodForBreeding: (amount: string) => void;
	contractApproveFoodForTraining: (amount: string, callback: any) => void;
	contractApproveERC20Modifiers: (erc20Contract: Contract | null, amountToApprove: string, callBack: any) => void;
	setPerTransactionApproval: (value: boolean) => void;
	contractModifierDFK: (fish: Fish, type: number) => void;
	contractModifierFishProducts: (fish: Fish, type: number) => void;
	smartWithdraw: (fish: Fish | null) => void;
	onAccept: any;
	perTransactionApproval: boolean;
	pendingTransaction: boolean;
	showTrainingFoodApproval: boolean;
	showFightingFishApproval: boolean;
	showBreedingFishApproval: boolean;
	showFightingDisclaimer: boolean;
	showBreedingDisclaimer: boolean;
	showFishingDisclaimer: boolean;
	showERC20Approval: boolean;
	isFighting: boolean;
	catchFishResult: CatchFishResponse | null;
	clearCatchFishResult: () => void;
	updateIsFighting:(value: boolean) => void;
}

type ProviderProps = { children: React.ReactNode };

type CatchFishResponse = {success: boolean, roll: number}

const ContractWrapperContext = createContext<ProviderInterface | undefined>(undefined);

export const ContractWrapperProvider = ({ children }: ProviderProps) => {
	const [pendingTransaction, setPendingTransaction] = useState<boolean>(false);
	const [isFighting, setIsFighting] = useState<boolean>(false);
	const [catchFishResult, setCatchFishResult] = useState<CatchFishResponse | null>(null);

	// Account Approvals
  const [perTransactionApproval, setPerTransactionApproval] = useState<boolean>(false);
  const [fightingFishApproval, setFightingFishApproval] = useState<boolean>(false);
  const [fightingFishWeakApproval, setFightingFishWeakApproval] = useState<boolean>(false);
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
	const [showERC20Approval, setShowERC20Approval] = useState<boolean>(false);


	const [showFightingDisclaimer, setShowFightingDisclaimer] = useState<boolean>(false);
	const [showBreedingDisclaimer, setShowBreedingDisclaimer] = useState<boolean>(false);
	const [showFishingDisclaimer, setShowFishingDisclaimer] = useState<boolean>(false);

	const DefaultAccept = () => console.log("Default Accept");
	const [onAccept, setOnAccept] = useState(() => DefaultAccept);

	const { account } = useWeb3React();
	const { FishFight, refetchBalance, balanceFoodWei } = useFishFight();
	const { userFish, refreshFish, createUserFish, refreshLoadedFish } = useFishPool();
	const unityContext = useUnity();

	useEffect(() => {
		if(account) {
			checkApprovals(account)
		}
	}, [account]);

	const updateIsFighting = (value: boolean) => {
		setIsFighting(value);
	}

	const clearCatchFishResult = () => {
		setCatchFishResult(null);
	}

	// const onAccept = () => {
	// 	if(showFightingDisclaimer) {

	// 	}
	// }

	// const acceptFunction = useCallback(
	// 	() => {
	// 		doSomething(a, b);
	// 	},
	// 	[callback],
	// );


  const checkApprovals = async (account: any) => {
    // Fighting Waters Fish approvals
    const approvedFishFighting = await FishFight.readFishFactory.methods.isApprovedForAll(account, FishFight.readFightingWaters.options.address).call();
    setFightingFishApproval(approvedFishFighting);

		const approvedFishFightingWeak = await FishFight.readFishFactory.methods.isApprovedForAll(account, FishFight.readFightingWatersWeak.options.address).call();
    setFightingFishWeakApproval(approvedFishFightingWeak);

    // Fighting Waters Food allowance
    // let approvedFoodFighting = new BN(await FishFightInstance.readFishFood.methods.allowance(account, FishFightInstance.readFightingWaters.options.address).call());
    // setFightingFoodApproval(approvedFoodFighting);

    // Breeding Waters approvals
    const approvedFishBreeding = await FishFight.readFishFactory.methods.isApprovedForAll(account, FishFight.readBreedingWaters.options.address).call();
    setBreedingFishApproval(approvedFishBreeding);

    // Breeding Waters Food allowance
    // let approvedFoodBreeding = new BN(await FishFightInstance.readFishFood.methods.allowance(account, FishFightInstance.readBreedingWaters.options.address).call());
    // setBreedingFoodApproval(approvedFoodBreeding);

    // Training Waters Food allowance
    const approvedFoodTraining = new BN(await FishFight.readFishFood.methods.allowance(account, FishFight.readTrainingWaters.options.address).call());
    setTrainingFoodApproval(approvedFoodTraining);

    // const approvedFishTraining = await FishFightInstance.readFishFactory.methods.isApprovedForAll(account, FishFightInstance.readTrainingWaters.options.address).call();
    // setTrainingFishApproval(true);
    
    
  }

	const smartWithdraw = async (fish: Fish | null) => {
		console.log(fish)
		if(!fish) return;
		const ownerAddress = await FishFight.readFishFactory.methods.ownerOf(fish.tokenId).call();
		console.log(ownerAddress)
		if(ownerAddress === FishFight.readFightingWaters.options.address) {
			withdrawFightingFish(fish)
		}
		else if(ownerAddress === FishFight.readFightingWatersWeak.options.address) {
			withdrawFightingFishWeak(fish)
		}
		else if(ownerAddress === FishFight.readBreedingWaters.options.address) {
			withdrawBreedingFish(fish)
		}
	}

	// Breeding Functions
	const breedFish = async (fishAlpha: Fish | null, fishBetta: Fish | null) => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(await wrongNetwork()) {
			toast.error('Wrong Network');
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
		setShowBreedingDisclaimer(true);
		setOnAccept(() => async () => {
			setShowBreedingDisclaimer(false);
			const isBreeding = await FishFight.readCycles.methods.isBreedingPhase().call(); // check per call to prevent use from over/under paying
			return FishFight.breedingWaters?.methods.breedFish(fishAlpha.tokenId, fishBetta.tokenId).send({
				from: account,
				gasPrice: await getGasPrice(),
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
		})
		
	}

	const withdrawBreedingFish = async (fish: Fish | null) => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(await wrongNetwork()) {
			toast.error('Wrong Network');
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
				gasPrice: await getGasPrice(),
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
						const updatedFish = await refreshFish(fish.tokenId, false, false)
						if(updatedFish != null) unityContext.refreshFishUnity(updatedFish);
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
		if(await wrongNetwork()) {
			toast.error('Wrong Network');
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
				contractApproveFishForBreeding(0, () => contractBreedDeposit(fish))
			}

			// User wants to approve per $FISH / Transaction
			if(perTransactionApproval && !breedingFishApproval) {
				FishFight.fishFactory?.methods.getApproved(fish.tokenId).call()
				.then(async (address: string) => {
					if(address === FishFight.readBreedingWaters.options.address) {
						contractBreedDeposit(fish);
					} else {
						contractApproveFishForBreeding(fish.tokenId, () => contractBreedDeposit(fish));
					}
				})
			}
			
		} catch (error: any) {
			console.log(error)
		}
	}

	const contractApproveFishForBreeding = async (tokenId: number, callback?: any) => {
		setShowBreedingFishApproval(true);
		setOnAccept(() => async () => {
			setShowBreedingFishApproval(false);
			if(tokenId === -1) { // revoke approval for all $FISH
				return FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readBreedingWaters.options.address, false).send({
					from: account,
					gasPrice: await getGasPrice(),
					gasLimit: await FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readBreedingWaters.options.address, false).estimateGas({from: account}),
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
					console.log(data)
					console.log('Breeding Approval revoked')
					toast.success('Breeding Approval revoked')
					setPendingTransaction(false);
					setBreedingFishApproval(false);
				})
			}
			else if(tokenId === 0) { // approve all FISH
				return FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readBreedingWaters.options.address, true).send({
					from: account,
					gasPrice: await getGasPrice(),
					gasLimit: await FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readBreedingWaters.options.address, true).estimateGas({from: account}),
				})
				.on('error', (error: any) => {
					console.log(error)
					toast.error('Approval Failed');
					console.log("Failed here")
					setPendingTransaction(false);
				})
				.on('transactionHash', () => {
					setPendingTransaction(true);
				})
				.on('receipt', (data: any) => {
					console.log(data)
					console.log('Breeding Approval completed')
					toast.success('Breeding Approval completed')
					setBreedingFishApproval(true);
					setPendingTransaction(false);
					// if(approvalAllResult.events.ApprovalForAll.returnValues.approved) {
					// 	contractBreedDeposit(fish);
					// 	return;
					// }
					callback();
				})
			}
			else { // aprove indivdual FISH
				return FishFight.fishFactory?.methods.approve(FishFight.readBreedingWaters.options.address, tokenId).send({
					from: account,
					gasPrice: await getGasPrice(),
					gasLimit: await FishFight.fishFactory?.methods.approve(FishFight.readBreedingWaters.options.address, tokenId).estimateGas({from: account}),
				})
				.on('transactionHash', () => {
					setPendingTransaction(true);
				})
				.on('receipt', (data: any) => {
					console.log(data)
					console.log('Breeding Approval completed')
					toast.success('Breeding Approval completed')
					setPendingTransaction(false);
					setShowBreedingFishApproval(false);
					// console.log(approveResult)
					// if(approveResult.events.Approval.returnValues.approved === FishFight.readFightingWaters.options.address) {
					// 	contractDeathFight(myFish, opponentFish, true);
					// }
					callback();
				})
			}	
		})	
	}


	const contractApproveFoodForBreeding = async (amountToApprove: string) => {
		setShowBreedingFoodApproval(true);
		return FishFight.fishFood?.methods.approve(FishFight.readBreedingWaters.options.address, amountToApprove).send({
			from: account,
			gasPrice: await getGasPrice(),
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
		setShowBreedingDisclaimer(true);
		setOnAccept(() => async () => {
			setShowBreedingDisclaimer(false);
			const gas = await FishFight.breedingWaters?.methods.deposit(fish.tokenId).estimateGas({from: account})
			return FishFight.breedingWaters?.methods.deposit(fish.tokenId).send({
				from: account,
				gasPrice: await getGasPrice(),
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
						const updatedFish = await refreshFish(fish.tokenId, false, true);
						if(updatedFish != null) unityContext.refreshFishUnity(updatedFish);
					},
				});
			})
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

	const contractApproveFishForFighting = async (tokenId: number, callback?: any) => {
		setShowFightingFishApproval(true);
		setOnAccept(() => async () => {
			setShowFightingFishApproval(false);
			if(tokenId === -1) { // revoke approval for all $FISH
				return FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readFightingWaters.options.address, false).send({
					from: account,
					gasPrice: await getGasPrice(),
					gasLimit: await FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readFightingWaters.options.address, false).estimateGas({from: account}),
				})
				.on('error', (error: any) => {
					console.log(error)
					toast.error('Approval Failed');
					setPendingTransaction(false);
					setIsFighting(false)
				})
				.on('transactionHash', () => {
					setPendingTransaction(true);
				})
				.on('receipt', (data: any) => {
					console.log(data)
					console.log('Fighting Approval revoked')
					toast.success('Fighting Approval revoked')
					setPendingTransaction(false);
					setFightingFishApproval(false);
				})
			}
			else if(tokenId === 0) { // approve all FISH
				return FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readFightingWaters.options.address, true).send({
					from: account,
					gasPrice: await getGasPrice(),
					gasLimit: await FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readFightingWaters.options.address, true).estimateGas({from: account}),
				})
				.on('error', (error: any) => {
					console.log(error)
					toast.error('Approval Failed');
					setIsFighting(false)
					setPendingTransaction(false);
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
					// if(approvalAllResult.events.ApprovalForAll.returnValues.approved) {
					// 	contractBreedDeposit(fish);
					// 	return;
					// }
					callback();
				})
			}
			else { // aprove indivdual FISH
				return FishFight.fishFactory?.methods.approve(FishFight.readFightingWaters.options.address, tokenId).send({
					from: account,
					gasPrice: await getGasPrice(),
					gasLimit: await FishFight.fishFactory?.methods.approve(FishFight.readFightingWaters.options.address, tokenId).estimateGas({from: account}),
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
					// console.log(approveResult)
					// if(approveResult.events.Approval.returnValues.approved === FishFight.readFightingWaters.options.address) {
					// 	contractDeathFight(myFish, opponentFish, true);
					// }
					callback();
				})
			}	
		})	
	}

	const contractDepositFightingFish = (fish: Fish) => {
		console.log("called")
		setShowFightingDisclaimer(true);
		setOnAccept(() => () => {
			setShowFightingDisclaimer(false);
			return FishFight.fightingWaters?.methods.deposit(fish.tokenId).estimateGas({from: account}).then(async (gas: any) => {
				FishFight.fightingWaters?.methods.deposit(fish.tokenId).send({
					from: account,
					gasPrice: await getGasPrice(),
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
							const updatedFish = await refreshFish(fish.tokenId, true, false);
							if(updatedFish != null) unityContext.refreshFishUnity(updatedFish);
						},
					});
				})
			})
		})

	}

	const depositFightingFish = async (fish : Fish | null) => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(await wrongNetwork()) {
			toast.error('Wrong Network');
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
				contractApproveFishForFighting(0, () => contractDepositFightingFish(fish))
				
			}

			// User wants to approve per $FISH / Transaction
			if(perTransactionApproval && !fightingFishApproval) {
				FishFight.fishFactory?.methods.getApproved(fish.tokenId).call()
				.then(async (address: string) => {
					if(address === FishFight.readFightingWaters.options.address) {
						contractDepositFightingFish(fish);
					} else {
						contractApproveFishForFighting(fish.tokenId, () => contractDepositFightingFish(fish))
						// console.log(approveResult)
						// if(approveResult.events.Approval.returnValues.approved === FishFight.readFightingWaters.options.address) {
						// 	contractDepositFightingFish(fish);
						// }
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
		if(await wrongNetwork()) {
			toast.error('Wrong Network');
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
			gasPrice: await getGasPrice(),
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
					const updatedFish = await refreshFish(fish.tokenId, false, false)
					if(updatedFish != null) unityContext.refreshFishUnity(updatedFish);
				},
			});
		})
	}

	const contractDeathFight = (myFish: Fish, opponentFish: Fish, contractIsFighterDeposited: boolean) => {
		console.log('adasdasdasda')
		setShowFightingDisclaimer(true);
		setOnAccept(() => async () => {
			setShowFightingDisclaimer(false);
			setOnAccept(() => () => {})
			return FishFight.fightingWaters?.methods.deathFight(myFish.tokenId, opponentFish.tokenId, contractIsFighterDeposited).send({
				from: account,
				gasPrice: await getGasPrice(),
				gasLimit: 5000000
			})
			.on('error', (error: any) => {
				console.log(error)
				toast.error('Fight Failed');
				setPendingTransaction(false);
				setIsFighting(false)
			})
			.on('transactionHash', () => {
				setPendingTransaction(true);
			}).on('receipt', async (result: any) => {
				const fightIndex = web3.utils.toNumber(result.events.FightCompleted.returnValues._fightIndex);
				setPendingTransaction(false);
				
				const fightResult = await getFightByIndex(fightIndex, myFish)
				unityContext.sendFightResult(fightResult, myFish, opponentFish);
				// unityContext.
				toast.success('Fight Completed!', {
					onOpen: async () => {
						refetchBalance()
						if(fightResult.winner === 0) {
							refreshFish(myFish.tokenId, true, false);
							refreshFish(opponentFish.tokenId, true, false);
						}
						if(myFish.tokenId === fightResult.winner) {
							refreshFish(myFish.tokenId, true, false)
							// unityContext.refreshFishUnity(opponentFish)
						}

						if(opponentFish.tokenId === fightResult.winner) {
							refreshFish(opponentFish.tokenId, true, false);
							// unityContext.refreshFishUnity(myFish)
						}

					},
				});
			})
		})
		
	}

	const fightFish = async (myFish: Fish | null, opponentFish: Fish | null) => {
		if(!account) {
			toast.error('Connect your wallet');
			return false;
		}
		if(await wrongNetwork()) {
			toast.error('Wrong Network');
			return;
		}
		if(myFish == null) {
			toast.error('Select your Fighter');
			return false;
		}
		if(opponentFish == null) {
			toast.error('Select your opponent');
			return false;
		}

		if(myFish.tokenId === opponentFish.tokenId) {
			toast.error("Can't Fight the same Fish")
			return false;
		}

		if(myFish.stakedBreeding) {
			toast.error("Can't use Fish that's in the Breed Pool");
			return false;
		}

		if(myFish.fishModifiers.alphaModifier.uses > 0) {
			toast.error("Alpha can't start Fight");
			return false;
		}

		setIsFighting(true)

		try {
			console.log("fight fish")
			console.log(fightingFishApproval)
			const deposited = await contractIsFighterDeposited(myFish.tokenId);

			// User Fish is already in fight pool, so no deposit or approvals required
			if(deposited) {
				contractDeathFight(myFish, opponentFish, false);
				return true;
			}

			// User fish not deposited, but is approved
			if(fightingFishApproval) {
				contractDeathFight(myFish, opponentFish, true);
				return true;
			}
			
			// Fish is not deposited, so approveAll Fish and then fight & deposit
			if(!fightingFishApproval && !perTransactionApproval) {
				contractApproveFishForFighting(0, () => contractDeathFight(myFish, opponentFish, true))
				return true;		
			}

			// Fish is not deposited and owner wants per transaction approval
			if(!fightingFishApproval && perTransactionApproval) {
				console.log("here")
				FishFight.fishFactory?.methods.getApproved(myFish.tokenId).call()
				.then(async (address: string) => {
					if(address === FishFight.readFightingWaters.options.address) {
						contractDeathFight(myFish, opponentFish, true);
						return true;
					} else {
						contractApproveFishForFighting(myFish.tokenId, () => contractDeathFight(myFish, opponentFish, true))
						return true;
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
			return false;
		}
	};

	const feedFish = async (fish: Fish | null) => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(await wrongNetwork()) {
			toast.error('Wrong Network');
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
		console.log(fish)

		try {
			// User has allowance to Feed Fish
			if(trainingFoodApproval.gte(new BN(Constants._feedFee))) {
				contractFeedFish(fish);
				return;
			}
			// Not enough allowance of Fish food spend, so approve and use MAX int
			if(trainingFoodApproval.lt(new BN(Constants._feedFee)) && !perTransactionApproval) {
				contractApproveFoodForTraining(MAX_APPROVE, () => contractFeedFish(fish));

			}

			// Not enough allowance, but user wants to not use Max int, so approve just enough
			if(trainingFoodApproval.lt(new BN(Constants._feedFee)) && perTransactionApproval) {
				contractApproveFoodForTraining(Constants._feedFee, () => contractFeedFish(fish));
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
		if(await wrongNetwork()) {
			toast.error('Wrong Network');
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
			contractApproveFoodForTraining(MAX_APPROVE, () => contractQuestFish(fish, choice));
		}

		// Not enough allowance, but user wants to not use Max int, so approve just enough
		if(trainingFoodApproval.lt(new BN(Constants._feedFee)) && perTransactionApproval) {
			await contractApproveFoodForTraining(Constants._questFee, () => contractQuestFish(fish, choice));
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
		if(await wrongNetwork()) {
			toast.error('Wrong Network');
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
		if(await wrongNetwork()) {
			toast.error('Wrong Network');
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
				contractApproveFoodForTraining(MAX_APPROVE, () => contractFeedMultipleFish(tokenIds));
			}

			// Not enough allowance, but user wants to not use Max int, so approve just enough
			if(trainingFoodApproval.lt(new BN(Constants._feedFee)) && perTransactionApproval) {
				contractApproveFoodForTraining(requiredAllowance.toString(), () => contractFeedMultipleFish(tokenIds));
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
		if(await wrongNetwork()) {
			toast.error('Wrong Network');
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
			gasPrice: await getGasPrice(),
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
					const updatedFish = await refreshFish(fish.tokenId, fish.stakedBreeding != null, fish.stakedFighting != null)
					if(updatedFish != null) unityContext.refreshFishUnity(updatedFish);
				},
			});
		})
	}

	const contractQuestFish = async (fish: Fish, choice: number) => {
		const gas = await FishFight.trainingWaters?.methods.questFish(fish.tokenId, choice).estimateGas({from: account})
		return FishFight.trainingWaters?.methods.questFish(fish.tokenId, choice).send({
			from: account,
			gasPrice: await getGasPrice(),
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
					const updatedFish = await refreshFish(fish.tokenId, false, false);
					if(updatedFish != null) unityContext.refreshFishUnity(updatedFish);
				},
			});
		})
	}

	const contractClaimFishFood = async (fish: Fish) => {
		const gas = await FishFight.trainingWaters?.methods.claimFishFood(fish.tokenId).estimateGas({from: account});
		return FishFight.trainingWaters?.methods.claimFishFood(fish.tokenId).send({
			from: account,
			gasPrice: await getGasPrice(),
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
					const updatedFish = await refreshFish(fish.tokenId, false, false);
					if(updatedFish != null) unityContext.refreshFishUnity(updatedFish);
				},
			});
		})
	}

	const contractClaimAllFishFood = async () => {
		const gas = await FishFight.trainingWaters?.methods.claimAllFishFood().estimateGas({from: account});
		return FishFight.trainingWaters?.methods.claimAllFishFood().send({
			from: account,
			gasPrice: await getGasPrice(),
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
			gasPrice: await getGasPrice(),
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

	const contractApproveFoodForTraining = async (amountToApprove: string, callBack: any) => {
		setShowTrainingFoodApproval(true);
		setOnAccept(() => async () => {
			setShowTrainingFoodApproval(false);
			setOnAccept(() => () => {})
			return FishFight.fishFood?.methods.approve(FishFight.readTrainingWaters.options.address, amountToApprove).send({
				from: account,
				gasPrice: await getGasPrice(),
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
				
				if(data.events.Approval.returnValues.spender === FishFight.readTrainingWaters.options.address &&
					new BN(data.events.Approval.returnValues.value).gte(new BN(amountToApprove))) {
					callBack();
				}
			})
		})
		
	}

	const contractModifierFishProducts = async (fish: Fish, fishProductType: number) => {
		return FishFight.modifierWaters?.methods.modifierFishProducts(fish.tokenId, fishProductType).send({
			from: account,
			gasPrice: await getGasPrice(),
			gasLimit: await FishFight.modifierWaters?.methods.modifierFishProducts(fish.tokenId, fishProductType).estimateGas({from: account})
		})
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Set Modifier Failed');
			setPendingTransaction(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
		})
		.on('receipt', async (result: any) => {
			setPendingTransaction(false);
			toast.success('Set Modifier Successful!', {
				onOpen: async () => {
					refetchBalance()
					const updatedFish = await refreshFish(fish.tokenId, fish.stakedFighting != null, fish.stakedBreeding != null)
					if(updatedFish != null) unityContext.refreshFishUnity(updatedFish);
				},
			});
		})
	}

	const contractModifierDFK = async (fish: Fish, dfkType: number) => {
		return FishFight.modifierWaters?.methods.modifierDFK(fish.tokenId, dfkType).send({
			from: account,
				gasPrice: await getGasPrice(),
				gasLimit: await FishFight.modifierWaters?.methods.modifierDFK(fish.tokenId, dfkType).estimateGas({from: account})
		})
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Set Modifier Failed');
			setPendingTransaction(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
		})
		.on('receipt', async (result: any) => {
			setPendingTransaction(false);
			toast.success('Set Modifier Successful!', {
				onOpen: async () => {
					refetchBalance()
					const updatedFish = await refreshFish(fish.tokenId, fish.stakedFighting != null, fish.stakedBreeding != null)
					if(updatedFish != null) unityContext.refreshFishUnity(updatedFish);
				},
			});
		})
	}

	const contractApproveERC20Modifiers = async (erc20Contract: Contract | null, amountToApprove: string, callBack: any) => {
		if(erc20Contract == null) return;
		setShowERC20Approval(true);
		setOnAccept(() => async () => {
			setShowERC20Approval(false);
			setOnAccept(() => () => {})
			return erc20Contract.methods.approve(FishFight.readModifierWaters.options.address, amountToApprove).send({
				from: account,
				gasPrice: await getGasPrice(),
				gasLimit: await erc20Contract.methods.approve(FishFight.readModifierWaters.options.address, amountToApprove).estimateGas({from: account})
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
				console.log('ERC20 Approval completed')
				toast.success('ERC20 Approval Completed')
				setPendingTransaction(false);
				
				if(data.events.Approval.returnValues.spender === FishFight.readModifierWaters.options.address &&
					new BN(data.events.Approval.returnValues.value).gte(new BN(amountToApprove))) {
					callBack();
				}
			})
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

	const getUserFish = async (tokenId: number) => {
		// console.log(tokenId)
		const newFish = await createUserFish(tokenId)
		if(newFish != null) {
			unityContext.addFishFishing(newFish);
		}
	}

	const catchFish = async () => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}

		if(await wrongNetwork()) {
			toast.error('Wrong Network');
			return;
		}

		try {
			const isFishing = await FishFight.readCycles.methods.isFishingPhase().call();
			await FishFight.fishingWaters?.methods.goFishing().send({
				from: account,
				gasPrice: await getGasPrice(),
				gasLimit: 500000,
				// gasLimit: await FishFight.fishingWaters?.methods.goFishing().estimateGas({from: account, value: web3.utils.toWei(COSTPERCASTONE)}),
				value: isFishing ? Constants._fishingPriceInPhase : Constants._fishingPrice
			})
			.on('error', (error: any) => {
				console.log(error)
				toast.error('Transaction Failed');
				setPendingTransaction(false);
			})
			.on('transactionHash', () => {
				setPendingTransaction(true);
			}).on('receipt', (result: any) => {
				console.log(result)
				setPendingTransaction(false);
				
				// No catch
				if(result.events.FishingResult.returnValues.index === 0) {
					console.log("set no catch")

					toast.success('Missed `Em!', {
						onOpen: async () => {
							refetchBalance()
						},
					});
					setCatchFishResult({success: true, roll: result.events.FishingResult.returnValues.roll})
				}
				
				// Fish Caught
				getUserFish(result.events.FishingResult.returnValues.index);
				toast.success('Fish Caught!', {
					onOpen: async () => {
						refetchBalance()
					},
				});
				setCatchFishResult(null)
				
			})
		} catch (error: any) {
			toast.error(error);
			console.log(error)
		}
	};

	const getGasPrice = async () => {
		try {
			const estimate = await FishFight.provider.eth.getGasPrice();
			console.log(estimate)

			let boosted = new BN(estimate);
			let multiplierToAdd = boosted.div(new BN(10));
			boosted = boosted.add(multiplierToAdd);
			return boosted.toString();
		} catch (error) {
			console.log("Estimate GasPrice Error:")
			console.log(error)
			return '40000000000'
		}
	}

	const wrongNetwork = async () => {
		const currentProvider = getProvider();
		if(await FishFight.provider.eth.getChainId() !== web3.utils.toNumber(currentProvider.networkId)) {
			return true;
		}
		return false;
	}





	// Fighting Functions
	const contractIsFighterWeakDeposited = async (tokenId: number) => {
		const owner = await FishFight.readFishFactory.methods.ownerOf(tokenId).call();
		console.log(owner)
		console.log(FishFight.readFishingWaters.options.address)
		return owner === FishFight.readFightingWatersWeak.options.address;
	}

	const contractApproveFishForFightingWeak = async (tokenId: number, callback?: any) => {
		setShowFightingFishApproval(true);
		setOnAccept(() => async () => {
			setShowFightingFishApproval(false);
			if(tokenId === -1) { // revoke approval for all $FISH
				return FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readFightingWatersWeak.options.address, false).send({
					from: account,
					gasPrice: await getGasPrice(),
					gasLimit: await FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readFightingWatersWeak.options.address, false).estimateGas({from: account}),
				})
				.on('error', (error: any) => {
					console.log(error)
					toast.error('Approval Failed');
					setPendingTransaction(false);
					setIsFighting(false)
				})
				.on('transactionHash', () => {
					setPendingTransaction(true);
				})
				.on('receipt', (data: any) => {
					console.log(data)
					console.log('Fighting Approval revoked')
					toast.success('Fighting Approval revoked')
					setPendingTransaction(false);
					setFightingFishWeakApproval(false);
				})
			}
			else if(tokenId === 0) { // approve all FISH
				return FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readFightingWatersWeak.options.address, true).send({
					from: account,
					gasPrice: await getGasPrice(),
					gasLimit: await FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readFightingWatersWeak.options.address, true).estimateGas({from: account}),
				})
				.on('error', (error: any) => {
					console.log(error)
					toast.error('Approval Failed');
					setIsFighting(false)
					setPendingTransaction(false);
				})
				.on('transactionHash', () => {
					setPendingTransaction(true);
				})
				.on('receipt', (data: any) => {
					console.log(data)
					console.log('Fighting Approval completed')
					toast.success('Fighting Approval completed')
					setFightingFishWeakApproval(true);
					setPendingTransaction(false);
					// if(approvalAllResult.events.ApprovalForAll.returnValues.approved) {
					// 	contractBreedDeposit(fish);
					// 	return;
					// }
					callback();
				})
			}
			else { // aprove indivdual FISH
				return FishFight.fishFactory?.methods.approve(FishFight.readFightingWatersWeak.options.address, tokenId).send({
					from: account,
					gasPrice: await getGasPrice(),
					gasLimit: await FishFight.fishFactory?.methods.approve(FishFight.readFightingWatersWeak.options.address, tokenId).estimateGas({from: account}),
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
					// console.log(approveResult)
					// if(approveResult.events.Approval.returnValues.approved === FishFight.readFightingWaters.options.address) {
					// 	contractDeathFight(myFish, opponentFish, true);
					// }
					callback();
				})
			}	
		})	
	}

	const contractDepositFightingFishWeak = (fish: Fish) => {
		console.log("called")
		setShowFightingDisclaimer(true);
		setOnAccept(() => () => {
			setShowFightingDisclaimer(false);
			return FishFight.fightingWatersWeak?.methods.deposit(fish.tokenId).estimateGas({from: account}).then(async (gas: any) => {
				FishFight.fightingWatersWeak?.methods.deposit(fish.tokenId).send({
					from: account,
					gasPrice: await getGasPrice(),
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
							const updatedFish = await refreshFish(fish.tokenId, true, false);
							if(updatedFish != null) unityContext.refreshFishUnity(updatedFish);
						},
					});
				})
			})
		})

	}

	const depositFightingFishWeak = async (fish : Fish | null) => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(await wrongNetwork()) {
			toast.error('Wrong Network');
			return;
		}
		if(fish == null) {
			toast.error('Select a Fish');
			return;
		}
		try {
			// All $FISH are approved
			if(fightingFishWeakApproval) {
				contractDepositFightingFishWeak(fish);
				return;
			}

			// Need to Approve All $FISH
			if(!perTransactionApproval && !fightingFishWeakApproval) {
				contractApproveFishForFightingWeak(0, () => contractDepositFightingFishWeak(fish))
				
			}

			// User wants to approve per $FISH / Transaction
			if(perTransactionApproval && !fightingFishWeakApproval) {
				FishFight.fishFactory?.methods.getApproved(fish.tokenId).call()
				.then(async (address: string) => {
					if(address === FishFight.readFightingWatersWeak.options.address) {
						contractDepositFightingFishWeak(fish);
					} else {
						contractApproveFishForFightingWeak(fish.tokenId, () => contractDepositFightingFishWeak(fish))
						// console.log(approveResult)
						// if(approveResult.events.Approval.returnValues.approved === FishFight.readFightingWaters.options.address) {
						// 	contractDepositFightingFish(fish);
						// }
					}
				})
			}
		} catch (error: any) {
			console.log(error)
		}
	}

	const withdrawFightingFishWeak = async (fish : Fish | null) => {
		if(fish == null) {
			toast.error('Select a Fish');
			return;
		}
		if(await wrongNetwork()) {
			toast.error('Wrong Network');
			return;
		}

		const secondsSinceEpoch = Math.round(Date.now() / 1000)
		if(fish.stakedFighting != null && fish.stakedFighting.lockedExpire > secondsSinceEpoch) {
			const expireTime = (fish.stakedFighting.lockedExpire - secondsSinceEpoch) / 60;
			const lockedFor = (Math.round(expireTime * 10) / 10).toFixed(1);
			toast.error(`Fish Locked for ${lockedFor} minutes`)
			return;
		}

		const gas = await FishFight.fightingWatersWeak?.methods.withdraw(fish.tokenId).estimateGas({from: account});

		return FishFight.fightingWatersWeak?.methods.withdraw(fish.tokenId).send({
			from: account,
			gasPrice: await getGasPrice(),
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
					const updatedFish = await refreshFish(fish.tokenId, false, false)
					if(updatedFish != null) unityContext.refreshFishUnity(updatedFish);
				},
			});
		})
	}

	const contractDeathFightWeak = (myFish: Fish, opponentFish: Fish, contractIsFighterDeposited: boolean) => {
		console.log('adasdasdasda')
		setShowFightingDisclaimer(true);
		setOnAccept(() => async () => {
			setShowFightingDisclaimer(false);
			setOnAccept(() => () => {})
			return FishFight.fightingWatersWeak?.methods.deathFight(myFish.tokenId, opponentFish.tokenId, contractIsFighterDeposited).send({
				from: account,
				gasPrice: await getGasPrice(),
				gasLimit: 5000000
			})
			.on('error', (error: any) => {
				console.log(error)
				toast.error('Fight Failed');
				setPendingTransaction(false);
				setIsFighting(false)
			})
			.on('transactionHash', () => {
				setPendingTransaction(true);
			}).on('receipt', async (result: any) => {
				const fightIndex = web3.utils.toNumber(result.events.FightCompleted.returnValues._fightIndex);
				setPendingTransaction(false);
				
				const fightResult = await getFightWeakByIndex(fightIndex, myFish)
				unityContext.sendFightResult(fightResult, myFish, opponentFish);
				// unityContext.
				toast.success('Fight Completed!', {
					onOpen: async () => {
						refetchBalance()
						if(fightResult.winner === 0) {
							refreshFish(myFish.tokenId, true, false);
							refreshFish(opponentFish.tokenId, true, false);
						}
						if(myFish.tokenId === fightResult.winner) {
							refreshFish(myFish.tokenId, true, false)
							// unityContext.refreshFishUnity(opponentFish)
						}

						if(opponentFish.tokenId === fightResult.winner) {
							refreshFish(opponentFish.tokenId, true, false);
							// unityContext.refreshFishUnity(myFish)
						}

					},
				});
			})
		})
		
	}

	const fightFishWeak = async (myFish: Fish | null, opponentFish: Fish | null) => {
		if(!account) {
			toast.error('Connect your wallet');
			return false;
		}
		if(await wrongNetwork()) {
			toast.error('Wrong Network');
			return;
		}
		if(myFish == null) {
			toast.error('Select your Fighter');
			return false;
		}
		if(opponentFish == null) {
			toast.error('Select your opponent');
			return false;
		}

		if(myFish.tokenId === opponentFish.tokenId) {
			toast.error("Can't Fight the same Fish")
			return false;
		}

		if(myFish.stakedBreeding) {
			toast.error("Can't use Fish that's in the Breed Pool");
			return false;
		}

		if(myFish.fishModifiers.alphaModifier.uses > 0) {
			toast.error("Alpha can't start Fight");
			return false;
		}

		setIsFighting(true)

		try {
			console.log("fight fish")
			console.log(fightingFishWeakApproval)
			const deposited = await contractIsFighterWeakDeposited(myFish.tokenId);

			// User Fish is already in fight pool, so no deposit or approvals required
			if(deposited) {
				contractDeathFightWeak(myFish, opponentFish, false);
				return true;
			}

			// User fish not deposited, but is approved
			if(fightingFishWeakApproval) {
				contractDeathFightWeak(myFish, opponentFish, true);
				return true;
			}
			
			// Fish is not deposited, so approveAll Fish and then fight & deposit
			if(!fightingFishWeakApproval && !perTransactionApproval) {
				contractApproveFishForFightingWeak(0, () => contractDeathFightWeak(myFish, opponentFish, true))
				return true;		
			}

			// Fish is not deposited and owner wants per transaction approval
			if(!fightingFishWeakApproval && perTransactionApproval) {
				console.log("here")
				FishFight.fishFactory?.methods.getApproved(myFish.tokenId).call()
				.then(async (address: string) => {
					if(address === FishFight.readFightingWatersWeak.options.address) {
						contractDeathFightWeak(myFish, opponentFish, true);
						return true;
					} else {
						contractApproveFishForFightingWeak(myFish.tokenId, () => contractDeathFightWeak(myFish, opponentFish, true))
						return true;
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
			return false;
		}
	};


	const getFightWeakByIndex = async (fightIndex: number, myFish: Fish) => {
		const fightInfo = await FishFight.fightingWatersWeak?.methods.getFightInfo(fightIndex).call();
		let fightResult = new Fight(fightInfo);
		if(myFish.tokenId === fightResult.winner) fightResult.playerResult = 1;
		else if(fightResult.winner === 0) fightResult.playerResult = 0;
		else fightResult.playerResult = -1;

		return fightResult;
	}


	const value: ProviderInterface = {
		catchFish: catchFish,
		fightFish: fightFish,
		fightFishWeak: fightFishWeak,
		depositFightingFish: depositFightingFish,
		depositFightingFishWeak: depositFightingFishWeak,
		withdrawFightingFish: withdrawFightingFish,
		withdrawFightingFishWeak: withdrawFightingFishWeak,
		breedFish: breedFish,
		withdrawBreedingFish: withdrawBreedingFish,
		depositBreedingFish: depositBreedingFish,
		feedFish: feedFish,
		questFish: questFish,
		claimFishFood: claimFishFood,
		claimAllFishFood: claimAllFishFood,
		feedAllFish: feedAllFish,
		contractApproveFishForFighting: contractApproveFishForFighting,
		contractApproveFishForFightingWeak: contractApproveFishForFightingWeak,
		contractApproveFishForBreeding: contractApproveFishForBreeding,
		contractApproveFoodForBreeding: contractApproveFoodForBreeding,
		contractApproveFoodForTraining: contractApproveFoodForTraining,
		contractApproveERC20Modifiers: contractApproveERC20Modifiers,
		setPerTransactionApproval: setPerTransactionApproval,
		contractModifierDFK: contractModifierDFK,
		contractModifierFishProducts: contractModifierFishProducts,
		onAccept: onAccept,
		smartWithdraw: smartWithdraw,
		perTransactionApproval: perTransactionApproval,
		pendingTransaction: pendingTransaction,
		showTrainingFoodApproval: showTrainingFoodApproval,
		showFightingFishApproval: showFightingFishApproval,
		showBreedingFishApproval: showBreedingFishApproval,
		showFightingDisclaimer: showFightingDisclaimer,
		showBreedingDisclaimer: showBreedingDisclaimer,
		showFishingDisclaimer: showFishingDisclaimer,
		showERC20Approval: showERC20Approval,
		isFighting: isFighting,
		catchFishResult: catchFishResult,
		clearCatchFishResult: clearCatchFishResult,
		updateIsFighting: updateIsFighting
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
