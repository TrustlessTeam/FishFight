import { createContext, useContext, useEffect, useState } from 'react';
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
import Web3 from 'web3';

const MAX_APPROVE = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

interface ProviderInterface {
	catchFish: () => void;
	approveAndCatchFishwFood: () => void;
	catchFishwFood: () => void;	
	fightFish: (fishA: Fish | null, fishB: Fish | null) => Promise<boolean | undefined>;
	fightFishWeak: (fishA: Fish | null, fishB: Fish | null) => Promise<boolean | undefined>;
	fightFishNonLethal: (fishA: Fish | null, fishB: Fish | null) => Promise<boolean | undefined>;
	depositFightingFish: (fish: Fish | null) => void;
	depositFightingFishWeak: (fish: Fish | null) => void;
	depositFightingFishNonLethal: (fish: Fish | null) => void;
	withdrawFightingFish: (fish: Fish | null) => void;
	withdrawFightingFishWeak: (fish: Fish | null) => void;
	withdrawFightingFishNonLethal: (fish: Fish | null) => void;
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
	contractApproveFishForFightingNonLethal: (approvalType: number, callback: any) => void;
	contractApproveFishForBreeding: (approvalType: number, callback: any) => void;
	contractApproveFoodForBreeding: (amount: string, callback: any) => void;
	contractApproveFoodForTraining: (amount: string, callback: any) => void;
	contractApproveFoodForFighting: (amount: string, callback: any) => void;
	contractApproveFoodForFishing: (amount: string, callback: any) => void;
	contractApproveERC20Modifiers: (erc20Contract: Contract | null, amountToApprove: string, callBack: any) => void;
	setPerTransactionApproval: (value: boolean) => void;
	contractModifierDFK: (fish: Fish, type: number) => void;
	contractModifierFishProducts: (fish: Fish, type: number) => void;
	smartWithdraw: (fish: Fish | null) => void;
	testWithdrawSimple: (fish: Fish | null) => void;
	testWithdrawRaw: (fish: Fish | null) => void;
	onAccept: any;
	perTransactionApproval: boolean;
	pendingTransaction: boolean;
	showTrainingFoodApproval: boolean;
	showFightingFoodApproval: boolean;
	showFishingFoodApproval: boolean;
	showFightingFishApproval: boolean;
	showBreedingFishApproval: boolean;
	showBreedingFoodApproval: boolean;
	showFightingDisclaimer: boolean;
	showFightingNonLethalDisclaimer: boolean;
	showFightingNonLethalDepositDisclaimer: boolean;
	showBreedingDisclaimer: boolean;
	showFishingDisclaimer: boolean;
	showERC20Approval: boolean;
	isFighting: boolean;
	catchFishResult: CatchFishResponse | null;
	clearCatchFishResult: () => void;
	updateIsFighting:(value: boolean) => void;
}

type ProviderProps = { children: React.ReactNode };

interface CatchFishResponse {
	success: boolean;
	roll?: number;
	fish?: Fish | null;
}

const ContractWrapperContext = createContext<ProviderInterface | undefined>(undefined);

export const ContractWrapperProvider = ({ children }: ProviderProps) => {
	const [pendingTransaction, setPendingTransaction] = useState<boolean>(false);
	const [isFighting, setIsFighting] = useState<boolean>(false);
	const [catchFishResult, setCatchFishResult] = useState<CatchFishResponse | null>(null);

	// Account Approvals
  const [perTransactionApproval, setPerTransactionApproval] = useState<boolean>(false);
  const [fightingFishApproval, setFightingFishApproval] = useState<boolean>(false);
  const [fightingFishWeakApproval, setFightingFishWeakApproval] = useState<boolean>(false);
  const [fightingFishNonLethalApproval, setFightingFishNonLethalApproval] = useState<boolean>(false);
  const [breedingFishApproval, setBreedingFishApproval] = useState<boolean>(false);
  // const [trainingFishApproval, setTrainingFishApproval] = useState<boolean>(false);
	
  const [trainingFoodApproval, setTrainingFoodApproval] = useState<BN>(new BN(0));
  const [breedingFoodApproval, setBreedingFoodApproval] = useState<BN>(new BN(0));
  const [fightingFoodApproval, setFightingFoodApproval] = useState<BN>(new BN(0));
  const [fishingFoodApproval, setFishingFoodApproval] = useState<BN>(new BN(0));
  
	// Show Approval Disclaimer
	const [showFightingFishApproval, setShowFightingFishApproval] = useState<boolean>(false);
	const [showBreedingFishApproval, setShowBreedingFishApproval] = useState<boolean>(false);
	const [showTrainingFoodApproval, setShowTrainingFoodApproval] = useState<boolean>(false);
	const [showBreedingFoodApproval, setShowBreedingFoodApproval] = useState<boolean>(false);
	const [showFightingFoodApproval, setShowFightingFoodApproval] = useState<boolean>(false);
	const [showFishingFoodApproval, setShowFishingFoodApproval] = useState<boolean>(false);
	const [showERC20Approval, setShowERC20Approval] = useState<boolean>(false);


	const [showFightingDisclaimer, setShowFightingDisclaimer] = useState<boolean>(false);
	const [showFightingNonLethalDisclaimer, setShowFightingNonLethalDisclaimer] = useState<boolean>(false);
	const [showFightingNonLethalDepositDisclaimer, setShowFightingNonLethalDepositDisclaimer] = useState<boolean>(false);
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

		const approvedFishFightingNonLethal = await FishFight.readFishFactory.methods.isApprovedForAll(account, FishFight.readFightingWatersNonLethal.options.address).call();
    setFightingFishNonLethalApproval(approvedFishFightingNonLethal);

    // Fighting Waters Food allowance
    const approvedFoodFighting = new BN(await FishFight.readFishFood.methods.allowance(account, FishFight.readFightingWatersNonLethal.options.address).call());
    setFightingFoodApproval(approvedFoodFighting);

	    // Fighting Waters Food allowance
		const approvedFoodFishing = new BN(await FishFight.readFishFood.methods.allowance(account, FishFight.readFishingWaters.options.address).call());
		setFishingFoodApproval(approvedFoodFishing);
	

    // Breeding Waters approvals
    const approvedFishBreeding = await FishFight.readFishFactory.methods.isApprovedForAll(account, FishFight.readBreedingWaters.options.address).call();
    setBreedingFishApproval(approvedFishBreeding);

    // Breeding Waters Food allowance
    const approvedFoodBreeding = new BN(await FishFight.readFishFood.methods.allowance(account, FishFight.readBreedingWaters.options.address).call());
    setBreedingFoodApproval(approvedFoodBreeding);

    // Training Waters Food allowance
    const approvedFoodTraining = new BN(await FishFight.readFishFood.methods.allowance(account, FishFight.readTrainingWaters.options.address).call());
    setTrainingFoodApproval(approvedFoodTraining);

    // const approvedFishTraining = await FishFightInstance.readFishFactory.methods.isApprovedForAll(account, FishFightInstance.readTrainingWaters.options.address).call();
    // setTrainingFishApproval(true);
    
    
  }

	const smartWithdraw = async (fish: Fish | null) => {
		console.log(fish)
		if(!fish) return;
		
		// Ensure account is available before proceeding
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		
		const ownerAddress = await FishFight.readFishFactory.methods.ownerOf(fish.tokenId).call();
		console.log(ownerAddress)
		if(ownerAddress === FishFight.readFightingWaters.options.address) {
			await withdrawFightingFish(fish)
		}
		else if(ownerAddress === FishFight.readFightingWatersWeak.options.address) {
			await withdrawFightingFishWeak(fish)
		}
		else if(ownerAddress === FishFight.readFightingWatersNonLethal.options.address) {
			await withdrawFightingFishNonLethal(fish)
		}
		else if(ownerAddress === FishFight.readBreedingWaters.options.address) {
			await withdrawBreedingFish(fish)
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
				contractApproveFoodForBreeding(Constants._fishFoodBreedFee, () => contractBreed(fishAlpha, fishBetta))
			} else if(Constants._fishFoodBreedFee !== '0' && !perTransactionApproval && breedingFoodApproval.lt(new BN(Constants._fishFoodBreedFee))) {
				contractApproveFoodForBreeding(MAX_APPROVE, () => contractBreed(fishAlpha, fishBetta))
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
						const fish = await createUserFish(Number(web3.utils.toNumber(data.events.BreedingResult.returnValues.tokenId)));
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
		let currentAccount = account;
		
		// Fallback: Get account from provider if hook value is undefined
		if(!currentAccount && FishFight.providerWallet) {
			try {
				const web3Provider = FishFight.providerWallet as any;
				if (web3Provider.eth) {
					const accounts = await web3Provider.eth.getAccounts();
					if (accounts && accounts.length > 0) {
						currentAccount = accounts[0];
					}
				}
			} catch (error) {
				console.error('Failed to get account from provider:', error);
			}
		}
		
		if(!currentAccount) {
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

		// EXACT copy of deposit function pattern - but with 1 confirmation block like working approval function
		return FishFight.breedingWaters?.methods.withdraw(fish.tokenId).estimateGas({from: currentAccount}).then(async (gas: any) => {
			FishFight.breedingWaters?.methods.withdraw(fish.tokenId).send({
				from: currentAccount,
				gasPrice: await getGasPrice(),
				gasLimit: gas,
			}, 1) // Pass 1 as second parameter to only wait for 1 confirmation block
			.on('error', (error: any) => {
				console.log(error)
				toast.error('Withdraw Failed');
				setPendingTransaction(false);
			})
			.on('transactionHash', () => {
				setPendingTransaction(true);
			})
			.on('receipt', async (data: any) => {
				setPendingTransaction(false);
				toast.success('Transaction done', {
					onOpen: async () => {
						refetchBalance()
						const updatedFish = await refreshFish(fish.tokenId, false, false)
						if(updatedFish != null) unityContext.refreshFishUnity(updatedFish);
					},
				});
			})
		})
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


	const contractApproveFoodForBreeding = async (amountToApprove: string, callback?: any) => {
		setShowBreedingFoodApproval(true);
		setOnAccept(() => async () => {
			setShowBreedingFoodApproval(false);
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
				if(data.events.Approval.returnValues.spender === FishFight.readBreedingWaters.options.address &&
					new BN(data.events.Approval.returnValues.value).gte(new BN(amountToApprove))) {
					callback();
				}
			})
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
		
		let currentAccount = account;
		
		// Fallback: Get account from provider if hook value is undefined
		if(!currentAccount && FishFight.providerWallet) {
			try {
				const web3Provider = FishFight.providerWallet as any;
				if (web3Provider.eth) {
					const accounts = await web3Provider.eth.getAccounts();
					if (accounts && accounts.length > 0) {
						currentAccount = accounts[0];
					}
				}
			} catch (error) {
				console.error('Failed to get account from provider:', error);
			}
		}
		
		if(!currentAccount) {
			toast.error('Connect your wallet');
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

		// Set defaultAccount on provider and contract as fallback (like working approval function does)
		if (FishFight.providerWallet && typeof FishFight.providerWallet === 'object' && 'eth' in FishFight.providerWallet) {
			const web3Provider = FishFight.providerWallet as any;
			if (web3Provider.eth) {
				web3Provider.eth.defaultAccount = currentAccount;
			}
		}
		
		if (FishFight.fightingWaters) {
			(FishFight.fightingWaters as any).defaultAccount = currentAccount;
			if (FishFight.fightingWaters.options) {
				FishFight.fightingWaters.options.from = currentAccount;
			}
		}

		// EXACT copy of deposit function pattern - but with 1 confirmation block like working approval function
		return FishFight.fightingWaters?.methods.withdraw(fish.tokenId).estimateGas({from: currentAccount}).then(async (gas: any) => {
			return FishFight.fightingWaters?.methods.withdraw(fish.tokenId).send({
				from: currentAccount,
			gasPrice: await getGasPrice(),
			gasLimit: gas,
			}, 1) // Pass 1 as second parameter to only wait for 1 confirmation block
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Withdraw Failed');
			setPendingTransaction(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
			})
			.on('receipt', async (data: any) => {
			setPendingTransaction(false);
			toast.success('Transaction done', {
				onOpen: async () => {
					refetchBalance()
					const updatedFish = await refreshFish(fish.tokenId, false, false)
					if(updatedFish != null) unityContext.refreshFishUnity(updatedFish);
				},
			});
			})
		}).catch((error: any) => {
			// Catch errors before web3.js processes them to prevent err.data.substring errors
			console.error('Withdraw transaction error:', error);
			setPendingTransaction(false);
			const errorMessage = error?.message || error?.reason || 'Withdraw Failed';
			toast.error(errorMessage);
		});
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
				const fightIndex = Number(web3.utils.toNumber(result.events.FightCompleted.returnValues._fightIndex));
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

		if(myFish.stakedFighting && myFish.stakedFighting.poolType !== 0) {
			toast.error("In other Fight Pool");
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
			toast.error(`Power Up requires ${Constants._fightModifierCost} POWER (You have ${fish.power})`);
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
		return newFish || null;
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
			}).on('receipt', async (result: any) => {
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
					setCatchFishResult({success: false, roll: result.events.FishingResult.returnValues.roll})
				}
				
				// Fish Caught
				const newFish = await getUserFish(result.events.FishingResult.returnValues.index);
				toast.success('Fish Caught!', {
					onOpen: async () => {
						refetchBalance()
					},
				});
				setCatchFishResult({success: true, fish: newFish})
				
			})
		} catch (error: any) {
			toast.error(error.message || 'Error');
			console.log(error)
		}
	};

	const approveAndCatchFishwFood = async () => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}

		if(await wrongNetwork()) {
			toast.error('Wrong Network');
			return;
		}

		try {
			// Check if we need approval - only send transaction if approval is insufficient
			// For fishing, we use MAX_APPROVE (unlimited) if not using per-transaction approval
			if (!perTransactionApproval && fishingFoodApproval.lt(new BN(MAX_APPROVE))) {
				contractApproveFoodForFishing(MAX_APPROVE, () => catchFishwFood() );
			} else if (perTransactionApproval) {
				// Per-transaction approval mode - check if we need to approve
				// For now, fishing doesn't have a specific fee constant, so we'll check if approval is very low
				// If approval is less than 1 FISHFOOD (1e18), we'll approve MAX
				const minApproval = new BN('1000000000000000000'); // 1 FISHFOOD
				if (fishingFoodApproval.lt(minApproval)) {
					contractApproveFoodForFishing(MAX_APPROVE, () => catchFishwFood() );
				} else {
					// Already have approval, proceed directly
					catchFishwFood();
				}
			} else {
				// Already have sufficient approval, proceed directly
				catchFishwFood();
			}

		} catch (error: any) {
			toast.error(error.message || 'Error');
			console.log(error)
		}
	};

	const catchFishwFood = async () => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}

		if(await wrongNetwork()) {
			toast.error('Wrong Network');
			return;
		}

		try {

						// Not enough allowance of Fish food spend, so approve and use MAX int
						//if(fishingFoodApproval.lt(new BN(Constants._feedFee)) && !perTransactionApproval) {
						//	contractApproveFoodForFishing(MAX_APPROVE, null );
			
						//}

			const isFishing = await FishFight.readCycles.methods.isFishingPhase().call();
			await FishFight.fishingWaters?.methods.goFishing().send({
				from: account,
				gasPrice: await getGasPrice(),
				gasLimit: 500000,
				// gasLimit: await FishFight.fishingWaters?.methods.goFishing().estimateGas({from: account, value: web3.utils.toWei(COSTPERCASTONE)}),
//				value: 0
			})
			.on('error', (error: any) => {
				console.log(error)
				toast.error('Transaction Failed');
				setPendingTransaction(false);
			})
			.on('transactionHash', () => {
				setPendingTransaction(true);
			}).on('receipt', async (result: any) => {
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
					setCatchFishResult({success: false, roll: result.events.FishingResult.returnValues.roll})
				}
				
				// Fish Caught
				const newFish = await getUserFish(result.events.FishingResult.returnValues.index);
				toast.success('Fish Caught!', {
					onOpen: async () => {
						refetchBalance()
					},
				});
				setCatchFishResult({success: true, fish: newFish})
				
			})
		} catch (error: any) {
			toast.error(error.message || 'Error');
			console.log(error)
		}
	};

	const getGasPrice = async () => {
		try {
			const estimate = await FishFight.provider.eth.getGasPrice();
			// console.log(estimate)

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
		if(await FishFight.provider.eth.getChainId() !== Number(web3.utils.toNumber(currentProvider.networkId))) {
			return true;
		}
		return false;
	}


	// Fighting Weak Functions
	const contractIsFighterWeakDeposited = async (tokenId: number) => {
		const owner = await FishFight.readFishFactory.methods.ownerOf(tokenId).call();
		// console.log(owner)
		// console.log(FishFight.readFishingWaters.options.address)
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
		if(fish.strength > 50 || fish.intelligence > 50 || fish.agility > 50) {
			toast.error("Fighter Selection: Stats must be <= 50");
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
		
		let currentAccount = account;
		
		// Fallback: Get account from provider if hook value is undefined
		if(!currentAccount && FishFight.providerWallet) {
			try {
				const web3Provider = FishFight.providerWallet as any;
				if (web3Provider.eth) {
					const accounts = await web3Provider.eth.getAccounts();
					if (accounts && accounts.length > 0) {
						currentAccount = accounts[0];
					}
				}
			} catch (error) {
				console.error('Failed to get account from provider:', error);
			}
		}
		
		if(!currentAccount) {
			toast.error('Connect your wallet');
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

		// Set defaultAccount on provider and contract as fallback (like working approval function does)
		if (FishFight.providerWallet && typeof FishFight.providerWallet === 'object' && 'eth' in FishFight.providerWallet) {
			const web3Provider = FishFight.providerWallet as any;
			if (web3Provider.eth) {
				web3Provider.eth.defaultAccount = currentAccount;
			}
		}
		
		if (FishFight.fightingWatersWeak) {
			(FishFight.fightingWatersWeak as any).defaultAccount = currentAccount;
			if (FishFight.fightingWatersWeak.options) {
				FishFight.fightingWatersWeak.options.from = currentAccount;
			}
		}

		// EXACT copy of deposit function pattern - but with 1 confirmation block like working approval function
		return FishFight.fightingWatersWeak?.methods.withdraw(fish.tokenId).estimateGas({from: currentAccount}).then(async (gas: any) => {
			return FishFight.fightingWatersWeak?.methods.withdraw(fish.tokenId).send({
				from: currentAccount,
			gasPrice: await getGasPrice(),
			gasLimit: gas,
			}, 1) // Pass 1 as second parameter to only wait for 1 confirmation block
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Withdraw Failed');
			setPendingTransaction(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
			})
			.on('receipt', async (data: any) => {
			setPendingTransaction(false);
			toast.success('Transaction done', {
				onOpen: async () => {
					refetchBalance()
					const updatedFish = await refreshFish(fish.tokenId, false, false)
					if(updatedFish != null) unityContext.refreshFishUnity(updatedFish);
				},
			});
			})
		}).catch((error: any) => {
			// Catch errors before web3.js processes them to prevent err.data.substring errors
			console.error('Withdraw transaction error:', error);
			setPendingTransaction(false);
			const errorMessage = error?.message || error?.reason || 'Withdraw Failed';
			toast.error(errorMessage);
		});
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
				
				const fightResult = await getFightWeakByIndex(Number(fightIndex), myFish)
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

		if(myFish.strength > 50 || myFish.intelligence > 50 || myFish.agility > 50) {
			toast.error("Fighter Selection: Stats must 50 or less");
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

		if(myFish.stakedFighting && myFish.stakedFighting.poolType !== 1) {
			toast.error("In other Fight Pool");
			return false;
		}

		setIsFighting(true)

		try {
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


	//Fighting Functions Non Lethal
	// Fighting Functions
	const contractIsFighterNonLethalDeposited = async (tokenId: number) => {
		const owner = await FishFight.readFishFactory.methods.ownerOf(tokenId).call();
		// console.log(owner)
		// console.log(FishFight.readFishingWaters.options.address)
		return owner === FishFight.readFightingWatersNonLethal.options.address;
	}

	const contractApproveFishForFightingNonLethal = async (tokenId: number, callback?: any) => {
		console.log("approve fish called")
		setShowFightingFishApproval(true);
		setOnAccept(() => async () => {
			setShowFightingFishApproval(false);
			if(tokenId === -1) { // revoke approval for all $FISH
				return FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readFightingWatersNonLethal.options.address, false).send({
					from: account,
					gasPrice: await getGasPrice(),
					gasLimit: await FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readFightingWatersNonLethal.options.address, false).estimateGas({from: account}),
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
					setFightingFishNonLethalApproval(false);
				})
			}
			else if(tokenId === 0) { // approve all FISH
				return FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readFightingWatersNonLethal.options.address, true).send({
					from: account,
					gasPrice: await getGasPrice(),
					gasLimit: await FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readFightingWatersNonLethal.options.address, true).estimateGas({from: account}),
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
					setFightingFishNonLethalApproval(true);
					setPendingTransaction(false);
					callback();
				})
			}
			else { // aprove indivdual FISH
				return FishFight.fishFactory?.methods.approve(FishFight.readFightingWatersNonLethal.options.address, tokenId).send({
					from: account,
					gasPrice: await getGasPrice(),
					gasLimit: await FishFight.fishFactory?.methods.approve(FishFight.readFightingWatersNonLethal.options.address, tokenId).estimateGas({from: account}),
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
					callback();
				})
			}	
		})	
	}

	const contractDepositFightingFishNonLethal = (fish: Fish) => {
		console.log("contract deposit called")
		setShowFightingNonLethalDepositDisclaimer(true);
		setOnAccept(() => () => {
			setShowFightingNonLethalDepositDisclaimer(false);
			return FishFight.fightingWatersNonLethal?.methods.deposit(fish.tokenId).estimateGas({from: account}).then(async (gas: any) => {
				FishFight.fightingWatersNonLethal?.methods.deposit(fish.tokenId).send({
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
							refetchBalance()
							const updatedFish = await refreshFish(fish.tokenId, true, false);
							if(updatedFish != null) unityContext.refreshFishUnity(updatedFish);
						},
					});
				})
			})
		})

	}

	const contractApproveFoodForFighting = async (amountToApprove: string, callback?: any) => {
		console.log("contract food called")
		setShowFightingFoodApproval(true);
		setOnAccept(() => async () => {
			setShowFightingFoodApproval(false);
			return FishFight.fishFood?.methods.approve(FishFight.readFightingWatersNonLethal.options.address, amountToApprove).send({
				from: account,
				gasPrice: await getGasPrice(),
				gasLimit: await FishFight.fishFood?.methods.approve(FishFight.readFightingWatersNonLethal.options.address, amountToApprove).estimateGas({from: account})
			})
			.on('error', (error: any) => {
				console.log(error)
				toast.error('Approval Failed');
				setPendingTransaction(false);
				setShowFightingFoodApproval(false);
			})
			.on('transactionHash', () => {
				setPendingTransaction(true);
			})
			.on('receipt', (data: any) => {
				console.log(data)
				console.log('FishFood Approval completed')
				toast.success('FishFood Approval Completed')
				setFightingFoodApproval(new BN(amountToApprove))
				setPendingTransaction(false);
				setShowFightingFoodApproval(false);
				callback();
			})
		})
	}


	const contractApproveFoodForFishing = async (amountToApprove: string, callback?: any) => {
		console.log("contract food called")
		
		if (!account) {
			toast.error('No wallet connected');
			return;
		}
		
		if (!FishFight.fishFood) {
			toast.error('Contract not initialized');
			return;
		}
		
		// Check current on-chain allowance before sending transaction
		try {
			const currentAllowance = new BN(await FishFight.readFishFood.methods.allowance(account, FishFight.readFishingWaters.options.address).call());
			const amountToApproveBN = new BN(amountToApprove);
			
			// If current allowance is already sufficient, skip the transaction
			if (currentAllowance.gte(amountToApproveBN)) {
				console.log('Sufficient approval already exists:', currentAllowance.toString(), '>=', amountToApprove);
				// Update state to reflect current allowance
				setFishingFoodApproval(currentAllowance);
				// Call callback immediately without sending transaction
				if (callback) {
					callback();
				}
				return;
			}
		} catch (error) {
			console.error('Failed to check current allowance, proceeding with approval:', error);
			// Continue with approval if check fails
		}
		
		setShowFishingFoodApproval(true);
		setOnAccept(() => async () => {
			setShowFishingFoodApproval(false);
	
			// Ensure account is available - log for debugging
			console.log('Approval callback - account:', account, 'type:', typeof account);
			if (!account) {
				console.error('Account is undefined in approval callback!');
				toast.error('No wallet connected');
				setPendingTransaction(false);
				setShowFishingFoodApproval(false);
				return;
			}
			
			// Set defaultAccount on provider and contract as fallback
			if (FishFight.providerWallet && typeof FishFight.providerWallet === 'object' && 'eth' in FishFight.providerWallet) {
				const web3Provider = FishFight.providerWallet as any;
				if (web3Provider.eth) {
					web3Provider.eth.defaultAccount = account;
					console.log('Set defaultAccount on provider:', account);
				}
			}
			
			if (FishFight.fishFood) {
				(FishFight.fishFood as any).defaultAccount = account;
				console.log('Set defaultAccount on contract:', account);
			}
			
			// Match the exact pattern used in contractApproveFoodForBreeding which works
			const txOptions = {
				from: account,
				gasPrice: await getGasPrice(),
				gasLimit: await FishFight.fishFood?.methods.approve(FishFight.readFishingWaters.options.address, amountToApprove).estimateGas({from: account})
			};
			
			console.log('Sending approval with options:', txOptions);
			
			// Track if we got a transaction hash (transaction was sent successfully)
			let txHashReceived = false;
			let receiptReceived = false;
			let txHash: string | null = null;
			
			// Set a timeout to proceed if we get hash but no receipt
			let timeoutId: NodeJS.Timeout | null = null;
			let pollInterval: NodeJS.Timeout | null = null;
			
			// Pass 1 as second parameter to only wait for 1 confirmation block (Harmony is fast)
			const txPromise = FishFight.fishFood?.methods.approve(FishFight.readFishingWaters.options.address, amountToApprove).send(txOptions, 1)
			.on('error', (error: any) => {
				console.log('Approval error event:', error)
				if (timeoutId) clearTimeout(timeoutId);
				if (pollInterval) clearInterval(pollInterval);
				// Don't fail on timeout if we got a transaction hash
				if (error.message && error.message.includes('not mined within') && txHashReceived) {
					console.log('Transaction timeout but hash was received - transaction was sent successfully');
					toast.info('Transaction sent! Proceeding...');
					setFishingFoodApproval(new BN(amountToApprove));
				setPendingTransaction(false);
				setShowFishingFoodApproval(false);
					if (callback && !receiptReceived) {
						callback();
					}
				} else {
					toast.error('Approval Failed: ' + (error.message || 'Unknown error'));
					setPendingTransaction(false);
					setShowFishingFoodApproval(false);
				}
			})
			.on('transactionHash', (hash: string) => {
				console.log('Approval transaction hash received:', hash);
				txHash = hash;
				txHashReceived = true;
				setPendingTransaction(true);
				toast.info('Transaction sent! Waiting for confirmation...');
				
				// Poll for receipt manually if web3.js doesn't get it
				// This helps when transactions take longer than expected
				const pollForReceipt = async () => {
					if (!FishFight.providerWallet || receiptReceived) return false;
					
					try {
						const web3Provider = FishFight.providerWallet as any;
						if (web3Provider.eth) {
							const receipt = await web3Provider.eth.getTransactionReceipt(hash);
							if (receipt && receipt.status) {
								console.log('Manually polled receipt received:', receipt);
								receiptReceived = true;
								if (timeoutId) clearTimeout(timeoutId);
								if (pollInterval) clearInterval(pollInterval);
								console.log('FishFood Approval completed (via polling)');
								toast.success('FishFood Approval Completed');
								setFishingFoodApproval(new BN(amountToApprove));
								setPendingTransaction(false);
								setShowFishingFoodApproval(false);
								if (callback) {
									callback();
								}
								return true;
							}
						}
					} catch (error) {
						// Receipt not ready yet, continue polling
						// Only log occasionally to avoid spam
						if (Math.random() < 0.1) { // Log ~10% of the time
							console.log('Receipt not ready yet, will retry...');
						}
					}
					return false;
				};
				
				// Start polling every 2 seconds
				pollInterval = setInterval(async () => {
					if (receiptReceived) {
						if (pollInterval) clearInterval(pollInterval);
						return;
					}
					const gotReceipt = await pollForReceipt();
					if (gotReceipt && pollInterval) {
						clearInterval(pollInterval);
					}
				}, 2000); // Poll every 2 seconds
				
				// Set a longer timeout - if we don't get receipt in 60 seconds, proceed anyway
				// Harmony is fast, but sometimes web3.js doesn't get the receipt
				timeoutId = setTimeout(() => {
					if (pollInterval) clearInterval(pollInterval);
					if (!receiptReceived && txHashReceived) {
						console.log('Transaction hash received but no receipt after 60s - checking one more time then proceeding');
						// Try one final check
						pollForReceipt().then((gotReceipt) => {
							if (!gotReceipt) {
								console.log('Final check failed - proceeding anyway (transaction was sent)');
								toast.info('Transaction sent! Proceeding...');
								setFishingFoodApproval(new BN(amountToApprove));
								setPendingTransaction(false);
								setShowFishingFoodApproval(false);
								if (callback) {
									callback();
								}
							}
						});
					}
				}, 60000); // 60 second timeout
			})
			.on('receipt', (data: any) => {
				console.log('Approval receipt received:', data)
				receiptReceived = true;
				if (timeoutId) clearTimeout(timeoutId);
				if (pollInterval) clearInterval(pollInterval);
				console.log('FishFood Approval completed')
				toast.success('FishFood Approval Completed')
				setFishingFoodApproval(new BN(amountToApprove))
				setPendingTransaction(false);
				setShowFishingFoodApproval(false);
				if(data.events.Approval.returnValues.spender === FishFight.readFishingWaters.options.address &&
					new BN(data.events.Approval.returnValues.value).gte(new BN(amountToApprove))) {
				callback();
				}
			})
			.catch((error: any) => {
				// Handle promise rejection (timeout)
				console.log('Approval catch (timeout):', error)
				if (timeoutId) clearTimeout(timeoutId);
				if (pollInterval) clearInterval(pollInterval);
				if (error.message && error.message.includes('not mined within')) {
					if (txHashReceived && !receiptReceived) {
						// Transaction was sent (got hash) but timed out waiting for confirmation
						// This is OK - proceed anyway
						console.log('Transaction timeout but was sent successfully - proceeding');
						toast.info('Transaction sent! Proceeding...');
						setFishingFoodApproval(new BN(amountToApprove));
						setPendingTransaction(false);
						setShowFishingFoodApproval(false);
						if (callback) {
							callback();
						}
					} else {
						// No hash received - transaction might not have been sent
						toast.error('Transaction timeout. Please check MetaMask.');
						setPendingTransaction(false);
						setShowFishingFoodApproval(false);
					}
				} else {
					toast.error('Approval Failed: ' + (error.message || 'Unknown error'));
					setPendingTransaction(false);
					setShowFishingFoodApproval(false);
				}
			});
			
			return txPromise;
		})
	}


	const depositFightingFishNonLethal = async (fish : Fish | null) => {
		console.log("here")
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
			// User wants to approve per transactions approvals, approve FISHFOOD, then FISH, then deposit
			if(perTransactionApproval) {
				contractApproveFoodForFighting(
					Constants._fishFoodDepositFee,
					() => contractApproveFishForFightingNonLethal(fish.tokenId, () => contractDepositFightingFishNonLethal(fish))
				);
				return;
			}

			// Check existing approvals
			// Case: FishFood MAX Allowance not set, and FISH approve all not set
			if(fightingFoodApproval.lt(new BN(Constants._fishFoodDepositFee)) && !fightingFishNonLethalApproval) {
				console.log("Case 1")
				contractApproveFoodForFighting(
					MAX_APPROVE,
					() => contractApproveFishForFightingNonLethal(0, () => contractDepositFightingFishNonLethal(fish))
				);
				return;
			}

			// Case: FISH approveAll required, FISHFOOD MAX already set
			if(!fightingFishNonLethalApproval && fightingFoodApproval.gte(new BN(Constants._fishFoodDepositFee))) {
				console.log("Case 2")
				contractApproveFishForFightingNonLethal(0, () => contractDepositFightingFishNonLethal(fish))
				return;
			}

			// Case: FISHFOOD allowance not set, FISH already approved
			// Not enough allowance, but user wants to not use Max int, so approve just enough
			if(fightingFoodApproval.lt(new BN(Constants._fishFoodDepositFee)) && fightingFishNonLethalApproval) {
				console.log("Case 3")
				contractApproveFoodForFighting(MAX_APPROVE, () => contractDepositFightingFishNonLethal(fish));
				return;
			}

			// Case: Both Food and Fish are approved
			console.log("Case 4")
			contractDepositFightingFishNonLethal(fish);
			
		} catch (error: any) {
			console.log(error)
		}
	}

	// SIMPLE TEST WITHDRAW FUNCTION - Minimal code to test
	const testWithdrawSimple = async (fish: Fish | null) => {
		console.log('=== TEST WITHDRAW CALLED ===');
		console.log('Fish:', fish);
		console.log('Account:', account);
		
		if(!fish) {
			console.error('❌ No fish provided');
			toast.error('Missing fish');
			return;
		}
		
		if(!account) {
			console.error('❌ No account');
			toast.error('Missing account - connect wallet');
			return;
		}

		if(!FishFight.fightingWatersNonLethal) {
			console.error('❌ Contract not initialized');
			toast.error('Contract not initialized');
			return;
		}

		console.log('=== SIMPLE TEST WITHDRAW ===');
		console.log('Account:', account);
		console.log('TokenId:', fish.tokenId);
		console.log('Contract exists:', !!FishFight.fightingWatersNonLethal);
		console.log('Read contract exists:', !!FishFight.readFightingWatersNonLethal);
		
		try {
			// Step 1: Check if we own the stake token
			console.log('Step 1: Checking stake token ownership...');
			if (!FishFight.readFightingWatersNonLethal) {
				throw new Error('Read contract not initialized');
			}
			const stakeOwner = await FishFight.readFightingWatersNonLethal.methods.ownerOf(fish.tokenId).call();
			console.log('✅ Stake token owner:', stakeOwner);
			console.log('My account:', account);
			console.log('Match:', stakeOwner?.toLowerCase() === account.toLowerCase());
			
			if (stakeOwner?.toLowerCase() !== account.toLowerCase()) {
				toast.error('You do not own the stake token');
				return;
			}

			// Step 2: Try to estimate gas
			console.log('Step 2: Estimating gas...');
			if (!FishFight.fightingWatersNonLethal) {
				throw new Error('Write contract not initialized');
			}
			const gas = await FishFight.fightingWatersNonLethal.methods.withdraw(fish.tokenId).estimateGas({from: account});
			console.log('✅ Gas estimated:', gas.toString());

			// Step 3: Send transaction with 1 confirmation block (like working approval function)
			console.log('Step 3: Sending transaction...');
			console.log('Transaction options:', { from: account, gasLimit: gas.toString() });
			const tx = FishFight.fightingWatersNonLethal.methods.withdraw(fish.tokenId).send({
				from: account,
				gasPrice: await getGasPrice(),
				gasLimit: gas,
			}, 1); // Pass 1 as second parameter to only wait for 1 confirmation block

			tx.on('transactionHash', (hash: string) => {
				console.log('✅ Transaction hash:', hash);
				setPendingTransaction(true);
				toast.success('Transaction sent! Hash: ' + hash.substring(0, 10) + '...');
			});

			tx.on('receipt', (receipt: any) => {
				console.log('✅ Transaction confirmed:', receipt);
				setPendingTransaction(false);
				toast.success('Withdraw successful!');
				refetchBalance();
				refreshFish(fish.tokenId, false, false).then((updatedFish) => {
					if(updatedFish != null) unityContext.refreshFishUnity(updatedFish);
				});
			});

			tx.on('error', (error: any) => {
				console.error('❌ Transaction error event:', error);
				console.error('Error type:', typeof error);
				console.error('Error keys:', Object.keys(error));
				console.error('Error message:', error.message);
				console.error('Error code:', error.code);
				console.error('Error data:', error.data);
				setPendingTransaction(false);
				toast.error('Error: ' + (error.message || JSON.stringify(error)));
			});

			// Also catch promise rejection
			tx.catch((error: any) => {
				console.error('❌ Transaction promise rejection:', error);
				setPendingTransaction(false);
				toast.error('Promise rejected: ' + (error.message || JSON.stringify(error)));
			});

			return tx;
		} catch (error: any) {
			console.error('❌ Catch error:', error);
			console.error('Error type:', typeof error);
			console.error('Error name:', error.name);
			console.error('Error message:', error.message);
			console.error('Error stack:', error.stack);
			toast.error('Failed: ' + (error.message || JSON.stringify(error)));
			setPendingTransaction(false);
		}
	}

	const withdrawFightingFishNonLethal = async (fish : Fish | null) => {
		if(fish == null) {
			toast.error('Select a Fish');
			return;
		}
		
		// CRITICAL: Get account from hook - it might be undefined
		let currentAccount = account;
		console.log('=== WITHDRAW START ===');
		console.log('Account from hook:', currentAccount);
		console.log('Account type:', typeof currentAccount);
		
		// Fallback: Get account from provider if hook value is undefined
		if(!currentAccount && FishFight.providerWallet) {
			try {
				const web3Provider = FishFight.providerWallet as any;
				if (web3Provider.eth) {
					const accounts = await web3Provider.eth.getAccounts();
					if (accounts && accounts.length > 0) {
						currentAccount = accounts[0];
						console.log('Got account from provider:', currentAccount);
					}
				}
			} catch (error) {
				console.error('Failed to get account from provider:', error);
			}
		}
		
		if(!currentAccount) {
			console.error('❌ Account is undefined after all attempts!');
			toast.error('Connect your wallet');
			return;
		}
		
		if(await wrongNetwork()) {
			toast.error('Wrong Network');
			return;
		}

		try {
			console.log('TokenId:', fish.tokenId);
			console.log('Contract:', FishFight.fightingWatersNonLethal);
			console.log('Provider:', FishFight.providerWallet);
			console.log('Using account for transaction:', currentAccount);

			// Set defaultAccount on provider and contract as fallback (like working approval function does)
			if (FishFight.providerWallet && typeof FishFight.providerWallet === 'object' && 'eth' in FishFight.providerWallet) {
				const web3Provider = FishFight.providerWallet as any;
				if (web3Provider.eth) {
					web3Provider.eth.defaultAccount = currentAccount;
					console.log('Set defaultAccount on provider:', currentAccount);
				}
			}
			
			if (FishFight.fightingWatersNonLethal) {
				(FishFight.fightingWatersNonLethal as any).defaultAccount = currentAccount;
				if (FishFight.fightingWatersNonLethal.options) {
					FishFight.fightingWatersNonLethal.options.from = currentAccount;
					console.log('Set contract options.from:', currentAccount);
				}
				console.log('Set defaultAccount on contract:', currentAccount);
			}

			// EXACT copy of deposit function pattern - but with 1 confirmation block like working approval function
			return FishFight.fightingWatersNonLethal?.methods.withdraw(fish.tokenId).estimateGas({from: currentAccount}).then(async (gas: any) => {
				console.log('Gas estimated successfully:', gas);
				console.log('Sending with account:', currentAccount);
		return FishFight.fightingWatersNonLethal?.methods.withdraw(fish.tokenId).send({
					from: currentAccount,
			gasPrice: await getGasPrice(),
			gasLimit: gas,
				}, 1) // Pass 1 as second parameter to only wait for 1 confirmation block
		.on('error', (error: any) => {
					console.error('=== WITHDRAW ERROR EVENT ===');
					console.error('Full error object:', error);
					console.error('Error message:', error.message);
					console.error('Error code:', error.code);
					console.error('Error data:', error.data);
					console.error('Transaction hash:', error.transactionHash);
					toast.error('Withdraw Failed: ' + (error.message || 'Unknown error'));
			setPendingTransaction(false);
		})
				.on('transactionHash', (hash: string) => {
					console.log('Transaction hash received:', hash);
			setPendingTransaction(true);
				})
				.on('receipt', async (data: any) => {
					console.log('Transaction receipt received:', data);
			setPendingTransaction(false);
			toast.success('Transaction done', {
				onOpen: async () => {
					refetchBalance()
					const updatedFish = await refreshFish(fish.tokenId, false, false)
					if(updatedFish != null) unityContext.refreshFishUnity(updatedFish);
				},
			});
		})
			}).catch((error: any) => {
				console.error('=== WITHDRAW CATCH ERROR ===');
				console.error('Full error object:', error);
				console.error('Error message:', error.message);
				console.error('Error code:', error.code);
				console.error('Error data:', error.data);
				toast.error('Withdraw Failed: ' + (error.message || 'Unknown error'));
				setPendingTransaction(false);
			});
		} catch (error: any) {
			console.error('=== WITHDRAW OUTER CATCH ===');
			console.error('Full error object:', error);
			console.error('Error message:', error.message);
			toast.error('Withdraw Error: ' + (error.message || 'Unknown error'));
			setPendingTransaction(false);
		}
	}

	const contractDeathFightNonLethal = (myFish: Fish, opponentFish: Fish) => {
		setShowFightingNonLethalDisclaimer(true);
		setOnAccept(() => async () => {
			setShowFightingNonLethalDisclaimer(false);
			setOnAccept(() => () => {})
			// try {
			// 	const gas = await FishFight.fightingWatersNonLethal?.methods.deathFight(myFish.tokenId, opponentFish.tokenId).estimateGas({from: account});
			// } catch (error: any) {
			// 	toast.error(error)
			// }
			return FishFight.fightingWatersNonLethal?.methods.deathFight(myFish.tokenId, opponentFish.tokenId).send({
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
				
				const fightResult = await getFightNonLethalByIndex(Number(fightIndex), myFish)
				unityContext.sendFightResult(fightResult, myFish, opponentFish);
				toast.success('Fight Completed!', {
					onOpen: async () => {
						refetchBalance()
						if(fightResult.winner === 0) {
							refreshFish(myFish.tokenId, true, false);
							refreshFish(opponentFish.tokenId, true, false);
						}
						if(myFish.tokenId === fightResult.winner) {
							refreshFish(myFish.tokenId, true, false)
							refreshFish(opponentFish.tokenId, false, false);
							// unityContext.refreshFishUnity(opponentFish)
						}

						if(opponentFish.tokenId === fightResult.winner) {
							refreshFish(opponentFish.tokenId, true, false);
							refreshFish(myFish.tokenId, false, false)
						}

					},
				});
			})
		})
		
	}

	const fightFishNonLethal = async (myFish: Fish | null, opponentFish: Fish | null) => {
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

		if(myFish.stakedFighting == null) {
			toast.error("Must deposit Fish before you can Fight!")
			return false;
		}

		const secondsSinceEpoch = Math.round(Date.now() / 1000)
		if(myFish.stakedFighting != null && myFish.stakedFighting.lockedExpire > secondsSinceEpoch) {
			const expireTime = (myFish.stakedFighting.lockedExpire - secondsSinceEpoch) / 60;
			const lockedFor = (Math.round(expireTime * 10) / 10).toFixed(1);
			toast.error(`Fish Locked for ${lockedFor} minutes`)
			return;
		}

		if(myFish.stakedBreeding) {
			toast.error("Can't use Fish that's in the Breed Pool");
			return false;
		}

		if(myFish.stakedFighting && myFish.stakedFighting.poolType !== 2) {
			toast.error("In other Fight Pool");
			return false;
		}

		setIsFighting(true)

		try {
			const deposited = await contractIsFighterNonLethalDeposited(myFish.tokenId);

			// User Fish is already in fight pool, so no deposit or approvals required
			if(deposited) {
				contractDeathFightNonLethal(myFish, opponentFish);
				return true;
			}

		} catch (error: any) {
			console.log(error);
			return false;
		}
	};


	const getFightNonLethalByIndex = async (fightIndex: number, myFish: Fish) => {
		const fightInfo = await FishFight.fightingWatersNonLethal?.methods.getFightInfo(fightIndex).call();
		let fightResult = new Fight(fightInfo);
		if(myFish.tokenId === fightResult.winner) fightResult.playerResult = 1;
		else if(fightResult.winner === 0) fightResult.playerResult = 0;
		else fightResult.playerResult = -1;

		return fightResult;
	}

	// Add this new function after testWithdrawSimple
	const testWithdrawRaw = async (fish: Fish | null) => {
	  if (!fish || !account) {
		toast.error('Missing fish or account');
		return;
	  }

	  console.log('=== RAW TEST WITHDRAW ===');
	  console.log('Account:', account);
	  console.log('TokenId:', fish.tokenId);
	  
	  if (!FishFight.fightingWatersNonLethal) {
		console.error('FightingWatersNonLethal not initialized');
		toast.error('Contract not initialized');
		return;
	  }
	  console.log('Contract address:', FishFight.fightingWatersNonLethal.options.address);

	  if (!FishFight.providerWallet) {
		console.error('ProviderWallet not initialized');
		toast.error('Provider not initialized');
		return;
	  }

	  try {
		// Get gas price
		let gasPrice = '40000000000'; // Default gas price
		if (FishFight.providerWallet instanceof Web3) {
		  const web3Provider = FishFight.providerWallet as Web3;
		  try {
			gasPrice = await web3Provider.eth.getGasPrice();
			console.log('Gas price:', gasPrice);
		  } catch (error) {
			console.error('Failed to get gas price:', error);
		  }
		} else {
		  console.error('Provider is not Web3 instance, using default gas price');
		}

		// Encode the method call
		const data = FishFight.fightingWatersNonLethal.methods.withdraw(fish.tokenId).encodeABI();
		console.log('Encoded data:', data.substring(0, 50) + '...');

		// Estimate gas
		if (FishFight.providerWallet instanceof Web3) {
		  const web3Provider = FishFight.providerWallet as Web3;
		  const gas = await web3Provider.eth.estimateGas({
			from: account,
			to: FishFight.fightingWatersNonLethal.options.address,
			data: data
		  });
		  console.log('Gas estimated:', gas);

		// Send legacy transaction
		const receipt = await web3Provider.eth.sendTransaction({
			from: account,
			to: FishFight.fightingWatersNonLethal.options.address,
			gas: gas.toString(),
			gasPrice: gasPrice,
			data: data
		});
		console.log('Transaction receipt:', receipt);

		toast.success('Transaction sent!');
		  
		  toast.success('Withdraw successful!');
		  refetchBalance();
		  const updatedFish = await refreshFish(fish.tokenId, false, false);
		  if (updatedFish != null) unityContext.refreshFishUnity(updatedFish);
		} else {
		  throw new Error('Provider is not Web3 instance');
		}
	  } catch (error: any) {
		console.error('❌ Raw Withdraw Error:', error);
		toast.error('Failed: ' + (error.message || 'Unknown error'));
	  }
	};

	const value: ProviderInterface = {
		catchFish: catchFish,
		approveAndCatchFishwFood: approveAndCatchFishwFood,
		catchFishwFood: catchFishwFood,
		fightFish: fightFish,
		fightFishWeak: fightFishWeak,
		fightFishNonLethal: fightFishNonLethal,
		depositFightingFish: depositFightingFish,
		depositFightingFishWeak: depositFightingFishWeak,
		depositFightingFishNonLethal: depositFightingFishNonLethal,
		withdrawFightingFish: withdrawFightingFish,
		withdrawFightingFishWeak: withdrawFightingFishWeak,
		withdrawFightingFishNonLethal: withdrawFightingFishNonLethal,
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
		contractApproveFishForFightingNonLethal: contractApproveFishForFightingNonLethal,
		contractApproveFishForBreeding: contractApproveFishForBreeding,
		contractApproveFoodForBreeding: contractApproveFoodForBreeding,
		contractApproveFoodForTraining: contractApproveFoodForTraining,
		contractApproveFoodForFighting: contractApproveFoodForFighting,
		contractApproveFoodForFishing: contractApproveFoodForFishing,
		contractApproveERC20Modifiers: contractApproveERC20Modifiers,
		setPerTransactionApproval: setPerTransactionApproval,
		contractModifierDFK: contractModifierDFK,
		contractModifierFishProducts: contractModifierFishProducts,
		onAccept: onAccept,
		smartWithdraw: smartWithdraw,
		testWithdrawSimple: testWithdrawSimple,
		testWithdrawRaw: testWithdrawRaw,
		perTransactionApproval: perTransactionApproval,
		pendingTransaction: pendingTransaction,
		showTrainingFoodApproval: showTrainingFoodApproval,
		showFightingFoodApproval: showFightingFoodApproval,
		showFishingFoodApproval: showFishingFoodApproval,
		showFightingFishApproval: showFightingFishApproval,
		showBreedingFishApproval: showBreedingFishApproval,
		showBreedingFoodApproval: showBreedingFoodApproval,
		showFightingDisclaimer: showFightingDisclaimer,
		showFightingNonLethalDisclaimer: showFightingNonLethalDisclaimer,
		showFightingNonLethalDepositDisclaimer: showFightingNonLethalDepositDisclaimer,
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
