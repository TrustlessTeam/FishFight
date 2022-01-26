import { useEffect, useState } from 'react';
import { Link, Routes, Route } from "react-router-dom";
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useWeb3React } from '@web3-react/core';
import { Fish } from '../utils/fish'
import { Fight} from '../utils/fight'
import { useFishFight } from '../context/fishFightContext';
import { useUnity } from '../context/unityContext';
import { useFishPool } from '../context/fishPoolContext';
import FishViewer from './FishViewer';
import Menu, { MenuItem } from './Menu';
import StakedStatus from './StakedStatus';
import { BaseContainer, BaseLinkButton, BaseOverlayContainer, ContainerControls } from './BaseStyles';
import LoadingOverlay from 'react-loading-overlay';
import web3 from 'web3';
import BN from 'bn.js';
import { ToggleGroup, ToggleOption } from './ToggleButton';

enum FishSelectionEnum {
  MyFish,
  AlphaFish
}

const BREEDCOSTONE = web3.utils.toBN(1);
const BREEDCOSTFISHFOOD = web3.utils.toBN(100);


const FishOptions = () => {
	const unityContext = useUnity();
	const { account } = useWeb3React();
	const { userFish, breedingFish, fightingFish, refreshFish, createUserFish } = useFishPool()
	const { FishFight, refetchBalance } = useFishFight()

	// const [fighterSelectionToShow, setFighterSelectionToShow] = useState<number>(FishViewOptions.MyFish);
	const [fishSelectionToShow, setFishSelectionToShow] = useState<number>(FishSelectionEnum.AlphaFish);
	const [fightResult, setFightResult] = useState<Fight | null>();
	const [showFightResult, setShowFightResult] = useState(false);
	const [isFighting, setIsFighting] = useState<boolean>(false);
	const [pendingTransaction, setPendingTransaction] = useState<boolean>(false);
	const [renderedFish, setRenderedFish] = useState<number[]>([]);

	const [selectedUserFish, setSelectedUserFish] = useState<Fish | null>(null);
	const [selectedPoolFish, setSelectedPoolFish] = useState<Fish | null>(null);
	
	
	const [breedResult, setBreedResult] = useState<Fish | null>();
	const [showBreedResult, setShowBreedResult] = useState(false);
	const [isBreeding, setIsBreeding] = useState<boolean>(false);
	

	useEffect(() => {
		console.log("Breeding Fish")
		unityContext.showBreeding();
		// unityContext.showBreed() ?
	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		unityContext.UnityInstance.on('FishPoolFightWinner', function () {
			console.log('Confirm FishPoolFightWinner');
			setShowBreedResult(true);
		});
		unityContext.UnityInstance.on('FishPoolFightTie', function () {
			console.log('Confirm FishPoolFightTie');
			setShowBreedResult(true);
		});
	}, [unityContext.isFishPoolReady]);

	// On Click Set Selected Fish Functions

	const setAlphaFish = (fish : Fish) => {
		const secondsSinceEpoch = Math.round(Date.now() / 1000)
		if(fish.stakedBreeding != null && fish.stakedBreeding.breedCooldown > secondsSinceEpoch) {
			const expireTime = (fish.stakedBreeding.breedCooldown - secondsSinceEpoch) / 60;
			const lockedFor = (Math.round(expireTime * 10) / 10).toFixed(1);
			toast.error(`Fish on cooldown for ${lockedFor} minutes`)
			return;
		}
		console.log("Alpha Fish: " + fish.tokenId)
		setSelectedPoolFish(fish);
		unityContext.addFishBreed2(fish)
	}

	const setBettaFish = async (fish : Fish) => {
		// add check for no wins?
		console.log("Betta Fish: " + fish.tokenId)
		setSelectedUserFish(fish);
		unityContext.addFishBreed1(fish)
	}

	const setUserFighter = async (fish : Fish) => {
		console.log("User Selected Fish: " + fish.tokenId)
		setSelectedUserFish(fish);
		unityContext.addFishFight1(fish)
	}

	const setOpponentFighter = (fish : Fish) => {
		console.log("Opponent Fish: " + fish.tokenId)
		setSelectedPoolFish(fish);
		unityContext.addFishFight2(fish)
	}

	const withdrawFightingFish = async (fish : Fish) => {
		const secondsSinceEpoch = Math.round(Date.now() / 1000)
		if(fish.stakedFighting != null && fish.stakedFighting.lockedExpire > secondsSinceEpoch) {
			const expireTime = (fish.stakedFighting.lockedExpire - secondsSinceEpoch) / 60;
			const lockedFor = (Math.round(expireTime * 10) / 10).toFixed(1);
			toast.error(`Fish Locked for ${lockedFor} minutes`)
			return;
		}
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(selectedUserFish == null) {
			toast.error('Select a Fish');
		}

		try {
			await FishFight.fightingWaters?.methods.withdraw(fish.tokenId).send({
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
						// refreshFish(fish.tokenId, false, false)
					},
				});
			})
			
		} catch (error: any) {
			toast.error(error);
		}
	}

	const contractApproveAll = () => {
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

	const contractDeposit = (fish: Fish) => {
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

	const depositFish = async (fish : Fish) => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(selectedUserFish == null) {
			toast.error('Select a Fish');
			return;
		}
		try {
			FishFight.fishFactory?.methods.isApprovedForAll(account, FishFight.readBreedingWaters.options.address).call()
			.then((isApproved: boolean) => {
				if(isApproved) {
					contractDeposit(fish);
				} else {
					contractApproveAll()
					.on('receipt', () => {
						contractDeposit(fish);
					})
				}
			})
		} catch (error: any) {
			console.log(error)
		}
	}

	const contractApprove = () => {
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
			setFishSelectionToShow(FishSelectionEnum.MyFish)
			toast.success('Breeding completed!', {
				onClose: async () => {
					const fish = await createUserFish(web3.utils.toNumber(data.events.BreedingResult.returnValues.tokenId));
					setBreedResult(fish);
					if(fish != null) {
						unityContext.showFish(fish);
					}
					refetchBalance()
					refreshFish(fishAlpha.tokenId, false, true);
					refreshFish(fishBetta.tokenId, false, false);
				},
			});
			setIsBreeding(false);
		})
	}

	const breedFish = async () => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(selectedUserFish == null) {
			toast.error('Select Your Fish to Breed');
			return;
		}
		if(selectedPoolFish == null) {
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
					contractBreed(selectedPoolFish, selectedUserFish)
				} else {
					contractApprove()
					.on('receipt', () => {
						contractBreed(selectedPoolFish, selectedUserFish)
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

	const breedAgain = () => {
		setBreedResult(null)
		setIsBreeding(false)
		setSelectedUserFish(null)
		setSelectedPoolFish(null)
		setShowBreedResult(false);
		unityContext.showFight();
	}

	return (
		<BaseOverlayContainer
			active={pendingTransaction}
			spinner
			text='Waiting for confirmation...'
			>
			{selectedUserFish != null &&
			<OptionsContainer>
				{selectedUserFish.stakedFighting &&
					<GameButton onClick={() => withdrawFightingFish(selectedUserFish)}>{'Withdraw Fighter'}</GameButton>
				}
				{selectedUserFish.seasonStats.fightWins > 0 && !selectedUserFish.stakedFighting &&
					<GameButton onClick={() => depositFish(selectedUserFish)}>{'Deposit'}</GameButton>
				}
				{/* {!showOpponentSelection &&
					<GameButton onClick={() => setShowOpponentSelection(true)}>{'Start Fight'}</GameButton>
				} */}
				{/* <GameButton onClick={() => selectAnother()}>{'Back to Fish'}</GameButton> */}
			</OptionsContainer>
			}
			<ContainerControls>
				{account &&
					<ToggleGroup>
						<ToggleOption className={fishSelectionToShow === FishSelectionEnum.MyFish ? 'active' : ''} onClick={() => setFishSelectionToShow(FishSelectionEnum.MyFish)}>My Betta $FISH</ToggleOption>
						<ToggleOption className={fishSelectionToShow === FishSelectionEnum.AlphaFish ? 'active' : ''} onClick={() => setFishSelectionToShow(FishSelectionEnum.AlphaFish)}>Alpha $FISH</ToggleOption>
					</ToggleGroup>
				}
				{/* <ToggleButton nameA={'My $FISH'} nameB={'Fight $FISH'} toggle={() => setShowOpponentSelection(!showOpponentSelection)} selectedOption={showOpponentSelection} /> */}
				{/* {fishSelectionToShow === FishSelectionEnum.MyFish &&
					<StakedStatus></StakedStatus>
				} */}
			</ContainerControls>
			{account && userFish.length > 0 && fishSelectionToShow === FishSelectionEnum.MyFish && 
				<FishViewer selectedFish={selectedUserFish} fishCollection={userFish} onClick={setBettaFish} />
			}
			{account && userFish.length === 0 && fishSelectionToShow === FishSelectionEnum.MyFish &&
				<BaseLinkButton to={'/catch'}>Catch a Fish!</BaseLinkButton>
			}
			{(fishSelectionToShow === FishSelectionEnum.AlphaFish || !account ) &&
				<FishViewer depositAlpha={true} selectedOpponent={selectedPoolFish} fishCollection={breedingFish} onClick={setAlphaFish} />
			}
		</BaseOverlayContainer>
	);
};

const OptionsContainer = styled.div`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
`;

const GameButton = styled.button`
	display: flex;
	flex-flow: column;
	justify-content: center;
	padding: 2.2vmin;
	border-radius: 25px;
	background-color: white;
	border: none;
	opacity: 0.7;
	box-shadow: 1px 2px 4px 4px rgba(0, 0, 0, 0.25);
	color: black;
	margin-left: ${props => props.theme.spacing.gapSmall};
	transition: opacity 0.3s ease, box-shadow 0.25s ease-in-out;
	text-transform: uppercase;
	font-weight: bolder;
	text-decoration: none;
	font-size: ${props => props.theme.font.medium};
	pointer-events: auto;

	&:hover {
		opacity: 1;
		box-shadow: 1px 2px 2px 2px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}
`;


export default FishOptions;
