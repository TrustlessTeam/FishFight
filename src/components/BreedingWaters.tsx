import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useWeb3React } from '@web3-react/core';
import { Fish } from '../utils/fish'
import { useUnity } from '../context/unityContext';
import { useFishPool } from '../context/fishPoolContext';
import {  BaseLinkButton, BaseOverlayContainer, BaseContainerCentered } from './BaseStyles';
import ToggleButton, { ToggleGroup, ToggleItem, ToggleOption } from './ToggleButton';
import { useContractWrapper } from '../context/contractWrapperContext';
import { useFishFight } from '../context/fishFightContext';
import Account from './Account';
import { Constants } from '../utils/constants';
import FishDrawer from './FishDrawer';
import BaseButton from "../components/BaseButton";

enum FishView {
  MyFish,
  AlphaFish
}


const BreedingWaters = () => {
	// State
	const [fishToShow, setFishToShow] = useState<number>(FishView.AlphaFish);
	const [myBettaFish, setMyBettaFish] = useState<Fish | null>(null);
	const [alphaFish, setAlphaFish] = useState<Fish | null>(null);
	const [modalIsOpen, setModalIsOpen] = useState(false);


	const [breedResult, setBreedResult] = useState<Fish | null>();
	const [showBreedResult, setShowBreedResult] = useState(false);
	const [isBreeding, setIsBreeding] = useState<boolean>(false);

	// Context
	const unityContext = useUnity();
	const { account } = useWeb3React();
	const { userFish, breedingFish } = useFishPool()
	const { breedFish, pendingTransaction} = useContractWrapper();
	const { breedingFishApproval, breedingFoodApproval } = useFishFight();

	const FishViewOptions: ToggleItem[] = [
		{
			name: 'My $FISH',
			id: FishView.MyFish,
			onClick: () => setFishToShow(FishView.MyFish)
		},
		{
			name: 'Alpha $FISH',
			id: FishView.AlphaFish,
			onClick: () => setFishToShow(FishView.AlphaFish)
		}
	]

	useEffect(() => {
		console.log("Breeding Fish")
		unityContext.clearUIFish();
		// unityContext.clearFishPool("ShowBreeding")
		unityContext.hideUI();
		unityContext.showBreedingLocation();
	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		console.log("Breeding Fish Changed")
		console.log(breedingFish)
		if(!unityContext.isFishPoolReady) return;
		breedingFish.forEach(fish => {
			unityContext.addFishBreedingPool(fish);
		})
	}, [breedingFish, unityContext.isFishPoolReady]);

	useEffect(() => {
		if(!unityContext.isFishPoolReady) return;
		unityContext.UnityInstance.on('UISelectionConfirm', function (data: any) {
			// console.log('UI changed catch fish');
			console.log(account)
			console.log(myBettaFish)
			console.log(data)
			switch (data) {
				case 'breed_confirm':
					breedFish(alphaFish, myBettaFish);
					return;
				default:
					return;
			}
			
		});
	}, [unityContext.isFishPoolReady, account, alphaFish, myBettaFish, breedingFishApproval]);

	useEffect(() => {
		unityContext.UnityInstance.on('UI_Breeding_Start_Request', function () {
			console.log('Confirm UI_Breeding_Start_Request');
			// setShowBreedResult(true);
		});
	}, [unityContext.isFishPoolReady]);

	const toggleModel = () => {
		setModalIsOpen(!modalIsOpen);
	};

	const closeModal = () => {
		setModalIsOpen(false);
	};

	const setAlpha = (fish : Fish) => {
		// const secondsSinceEpoch = Math.round(Date.now() / 1000)
		// if(fish.power < Constants._alphaBreedPowerFee) {
		// 	setAlphaFish(fish);
		// 	toast.error(`Alpha Fish has ${fish.power} power, at least ${Constants._alphaBreedPowerFee} power required to breed!`)
		// 	return;
		// }
		if(fish.fishModifiers.alphaModifier.uses === 0) {
			setAlphaFish(fish);
			toast.error(`Not Alpha this Season`)
			return;
		}
		console.log("Alpha Fish: " + fish.tokenId)
		unityContext.showBreedingUI();
		setAlphaFish(fish);
		unityContext.addFishBreed2(fish)
	}

	const setUserBetta = async (fish : Fish) => {
		if(fish.stakedFighting) {
			toast.error('Withdraw from Fight Pool');
			setMyBettaFish(fish);
			return;
		} 
		if(fish.fishModifiers.alphaModifier.uses > 0 && fish.stakedBreeding) {
			toast.error('Already in Alpha Pool');
			setMyBettaFish(fish);
			return;
		}
		// if(fish.parentA > 0 && currentSeason != null && fish.birthTime > currentSeason?.startTs) {
		// 	console.log(fish.birthTime)
		// 	console.log(currentSeason.startTs)
		// 	toast.error('Too Young');
		// 	return;
		// }
		if(fish.stakedBreeding && fish.fishModifiers.alphaModifier.uses > 0) {
			toast.error('Not betta fish');
			setMyBettaFish(fish);
			return;
		}
		if(fish.stakedBreeding && fish.fishModifiers.inBettaCooldown()) {
			toast.error('In breed cooldown');
			setMyBettaFish(fish);
			return;
		}
		if(fish.power < Constants._bettaBreedPowerFee) {
			setMyBettaFish(fish);
			toast.error(`Betta Fish has ${fish.power} power, at least ${Constants._bettaBreedPowerFee} power required to breed!`)
			return;
		}

		console.log("Betta Fish: " + fish.tokenId)
		unityContext.showBreedingUI();
		setMyBettaFish(fish);
		unityContext.addFishBreed1(fish)
	}

	const breedAgain = () => {
		setBreedResult(null)
		setIsBreeding(false)
		setMyBettaFish(null)
		setAlphaFish(null)
		setShowBreedResult(false);
		unityContext.showFightingLocation();
	}

	const ViewOptions = () => {
		return (
			<>
			{account &&
				<ToggleGroup>
					<ToggleOption className={fishToShow === FishView.MyFish ? 'active' : ''} onClick={() => setFishToShow(FishView.MyFish)}>My $FISH</ToggleOption>
					<ToggleOption className={fishToShow === FishView.AlphaFish ? 'active' : ''} onClick={() => setFishToShow(FishView.AlphaFish)}>Alpha $FISH</ToggleOption>
				</ToggleGroup>
			}
			</>
		)
	}


	if(!unityContext.isFishPoolReady) return null;

	return(
		<BaseOverlayContainer
			active={pendingTransaction}
			spinner
			text='Waiting for confirmation...'
			>
			{!account &&
				<OptionsContainer>
					<Account mobile={false} textOverride={"Connect Wallet to Breed $FISH"}/>
				</OptionsContainer>
			}

				{fishToShow === FishView.MyFish && 
					<FishDrawer type="Breeding" selectedFish={myBettaFish} fishCollection={userFish} onClick={setUserBetta}>
						<ToggleButton items={FishViewOptions} selected={fishToShow}></ToggleButton>
					</FishDrawer>
				}
				{account && userFish.length === 0 && fishToShow === FishView.MyFish &&
					<BaseLinkButton to={'/catch'}>Catch a Fish!</BaseLinkButton>
				}
				{fishToShow === FishView.AlphaFish &&
					<FishDrawer selectedOpponent={alphaFish} fishCollection={breedingFish} onClick={setAlpha}>
						<ToggleButton items={FishViewOptions} selected={fishToShow}></ToggleButton>
					</FishDrawer>
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
