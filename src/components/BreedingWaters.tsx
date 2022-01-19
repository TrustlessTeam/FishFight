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
  FightFish
}

const BREEDCOSTONE = web3.utils.toBN(1);
const BREEDCOSTFISHFOOD = web3.utils.toBN(100);


const BreedingWaters = () => {
	const unityContext = useUnity();
	const { account } = useWeb3React();
	const { userFish, breedingFish, userBreedingFish, refreshFish, createUserFish } = useFishPool()
	const { FishFight, refetchBalance } = useFishFight()

	const [showOpponentSelection, setShowOpponentSelection] = useState<boolean>(false);
	const [mySelectedFish, setMySelectedFish] = useState<Fish | null>(null);
	const [opponentFish, setOpponentFish] = useState<Fish | null>(null);
	// const [fighterSelectionToShow, setFighterSelectionToShow] = useState<number>(FishViewOptions.MyFish);
	const [fishSelectionToShow, setFishSelectionToShow] = useState<number>(FishSelectionEnum.FightFish);
	const [fightResult, setFightResult] = useState<Fight | null>();
	const [showFightResult, setShowFightResult] = useState(false);
	const [isFighting, setIsFighting] = useState<boolean>(false);
	const [pendingTransaction, setPendingTransaction] = useState<boolean>(false);
	const [renderedFish, setRenderedFish] = useState<number[]>([]);

	const [myBettaFish, setMyBettaFish] = useState<Fish | null>(null);
	const [alphaFish, setAlphaFish] = useState<Fish | null>(null);
	
	
	const [breedResult, setBreedResult] = useState<Fish | null>();
	const [showBreedResult, setShowBreedResult] = useState(false);
	const [isBreeding, setIsBreeding] = useState<boolean>(false);
	

	useEffect(() => {
		console.log("Breeding Fish")
		unityContext.showBreeding();
		// unityContext.showBreed() ?
	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		unityContext.showFight();
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

	const setAlpha = (fish : Fish) => {
		const secondsSinceEpoch = Math.round(Date.now() / 1000)
		if(fish.stakedBreeding != null && fish.stakedBreeding.breedCooldown > secondsSinceEpoch) {
			const expireTime = (fish.stakedBreeding.breedCooldown - secondsSinceEpoch) / 60;
			const lockedFor = (Math.round(expireTime * 10) / 10).toFixed(1);
			toast.error(`Fish on cooldown for ${lockedFor} minutes`)
			return;
		}
		console.log("Alpha Fish: " + fish.tokenId)
		//unityContext.clearFishPool('ShowFight');
		if(myBettaFish != null) {
			unityContext.addFishFight2(myBettaFish);
		}
		setAlphaFish(fish);
		unityContext.addFishFight2(fish)
	}

	const setUserBetta = async (fish : Fish) => {
		console.log("Betta Fish: " + fish.tokenId)
		//unityContext.clearFishPool('ShowFight');
		if(alphaFish != null) {
			unityContext.addFishFight1(alphaFish);
		}
		setMyBettaFish(fish);
		unityContext.addFishFight1(fish)
	}

	const contractApprove = () => {
		return FishFight.fishFood?.methods.approve(FishFight.readBreedingWaters.options.address, web3.utils.toWei(BREEDCOSTFISHFOOD)).send({
			from: account,
			gasPrice: 1000000000,
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
			gasPrice: 1000000000,
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
		if(myBettaFish == null) {
			toast.error('Select Your Fish to Breed');
			return;
		}
		if(alphaFish == null) {
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
					contractBreed(alphaFish, myBettaFish)
				} else {
					contractApprove()
					.on('receipt', () => {
						contractBreed(alphaFish, myBettaFish)
					})
				}
			})

		} catch (error: any) {
			// toast.error("Transaction Failed")
			console.log(error)
			// setPendingTransaction(false);
			// toast.error(error);
			// setIsBreeding(false)
			// setMyBettaFish(null)
			// setAlphaFish(null)
		}
	};

	const breedAgain = () => {
		setBreedResult(null)
		setIsBreeding(false)
		setMyBettaFish(null)
		setAlphaFish(null)
		setShowBreedResult(false);
		unityContext.showFight();
	}

	return (
		<BaseOverlayContainer
			active={pendingTransaction}
			spinner
			text='Waiting for confirmation...'
			>
			{mySelectedFish != null &&
			<OptionsContainer>
				{/* {mySelectedFish.stakedFighting ?
					<GameButton onClick={() => withdrawFish(mySelectedFish)}>{'Withdraw'}</GameButton>
					:
					<GameButton onClick={() => depositFish(mySelectedFish)}>{'Deposit'}</GameButton>
				}
				{!showOpponentSelection &&
					<GameButton onClick={() => setShowOpponentSelection(true)}>{'Start Fight'}</GameButton>
				} */}
				{/* <GameButton onClick={() => selectAnother()}>{'Back to Fish'}</GameButton> */}
			</OptionsContainer>
			}
			<ContainerControls>
				{account &&
					<ToggleGroup>
						<ToggleOption className={fishSelectionToShow === FishSelectionEnum.MyFish ? 'active' : ''} onClick={() => setFishSelectionToShow(FishSelectionEnum.MyFish)}>My $FISH</ToggleOption>
						<ToggleOption className={fishSelectionToShow === FishSelectionEnum.FightFish ? 'active' : ''} onClick={() => setFishSelectionToShow(FishSelectionEnum.FightFish)}>Opponent $FISH</ToggleOption>
					</ToggleGroup>
				}
				{/* <ToggleButton nameA={'My $FISH'} nameB={'Fight $FISH'} toggle={() => setShowOpponentSelection(!showOpponentSelection)} selectedOption={showOpponentSelection} /> */}
				{/* {fishSelectionToShow === FishSelectionEnum.MyFish &&
					<StakedStatus></StakedStatus>
				} */}
			</ContainerControls>
			{account && userFish.length > 0 && fishSelectionToShow === FishSelectionEnum.MyFish && 
				<FishViewer selectedFish={mySelectedFish} fishCollection={userFish} onClick={setUserBetta} />
			}
			{account && userFish.length === 0 && fishSelectionToShow === FishSelectionEnum.MyFish &&
				<BaseLinkButton to={'/catch'}>Catch a Fish!</BaseLinkButton>
			}
			{(fishSelectionToShow === FishSelectionEnum.FightFish || !account ) &&
				<FishViewer selectedOpponent={opponentFish} fishCollection={breedingFish} onClick={setAlpha} />
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


export default BreedingWaters;
