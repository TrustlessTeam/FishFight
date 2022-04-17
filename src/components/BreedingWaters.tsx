import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useWeb3React } from '@web3-react/core';
import { Fish } from '../utils/fish'
import { useUnity } from '../context/unityContext';
import { PoolFish, useFishPool } from '../context/fishPoolContext';
import {  BaseLinkButton, BaseContainer, Error, ContainerColumn, BaseText } from './BaseStyles';
import ToggleButton, { ToggleItem } from './ToggleButton';
import { useContractWrapper } from '../context/contractWrapperContext';
import Account from './Account';
import { Constants } from '../utils/constants';
import FishDrawer from './FishDrawer';

enum FishView {
  MyFish,
  AlphaFish
}

let renderedBreedFish: number[] = [];

const BreedingWaters = () => {
	// State
	const [fishToShow, setFishToShow] = useState<number>(FishView.AlphaFish);
	const [myBettaFish, setMyBettaFish] = useState<Fish | null>(null);
	const [alphaFish, setAlphaFish] = useState<Fish | null>(null);
	const [bettaError, setBettaError] = useState<string | null>(null);
	// const [unityBreedFish, setUnityBreedFish] = useState<number[]>([]);

	const [breedResult, setBreedResult] = useState<Fish | null>();
	const [showBreedResult, setShowBreedResult] = useState(false);
	const [isBreeding, setIsBreeding] = useState<boolean>(false);

	// Context
	const unityContext = useUnity();
	const { account } = useWeb3React();
	const { userFish, breedingFish } = useFishPool()
	const { breedFish, pendingTransaction } = useContractWrapper();

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
		// console.log("Breeding Fish")
		unityContext.clearUIFish();
		// unityContext.clearFishPool("ShowBreeding")
		unityContext.hideUI();
		unityContext.showBreedingLocation();
	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		// console.log("Breeding Fish Changed")
		// console.log(breedingFish)

		if(!unityContext.isFishPoolReady) return;
		
		breedingFish.forEach(poolFish => {
			if(!renderedBreedFish.some(tokenId => poolFish.tokenId === tokenId)) {
				unityContext.addFishBreedingPool(poolFish);
				renderedBreedFish.push(poolFish.tokenId)
			}
			
		})
	}, [breedingFish, unityContext.isFishPoolReady]);

	useEffect(() => {
		if(!unityContext.isFishPoolReady) return;
		unityContext.UnityInstance.on('UISelectionConfirm', function (data: any) {
			// console.log('UI changed catch fish');
			// console.log(account)
			// console.log(myBettaFish)
			// console.log(data)
			switch (data) {
				case 'breed_confirm':
					breedFish(alphaFish, myBettaFish);
					return;
				default:
					return;
			}
			
		});
	}, [unityContext.isFishPoolReady, account, alphaFish, myBettaFish]);

	useEffect(() => {
		unityContext.UnityInstance.on('UI_Breeding_Start_Request', function () {
			console.log('Confirm UI_Breeding_Start_Request');
			// setShowBreedResult(true);
		});
	}, [unityContext.isFishPoolReady]);


	const setAlpha = (fish : Fish) => {
		if(fish.fishModifiers.alphaModifier.uses === 0) {
			setAlphaFish(fish);
			toast.error(`Not Alpha this Season`)
			return;
		}
		// console.log("Alpha Fish: " + fish.tokenId)
		unityContext.showBreedingUI();
		setAlphaFish(fish);
		unityContext.addFishBreed2(fish)
	}

	const setUserBetta = async (fish : Fish) => {
		if(fish.fishModifiers.alphaModifier.uses > 0 || fish.stakedBreeding) {
			toast.error('Betta Selection: Fish is Alpha');
			setBettaError('Not Betta');
		}
		else if(fish.stakedFighting) {
			toast.error('Betta Selection: Withdraw from Fight Pool');
			setBettaError('Withdraw from Fight Pool');
		} 
		else if(fish.stakedBreeding && fish.fishModifiers.inBettaCooldown()) {
			toast.error('Betta Selection: In breed cooldown');
			setBettaError('In Cooldown');
		}
		else if(fish.power < Constants._bettaBreedPowerFee) {
			toast.error(`Betta Selection: ${fish.power} of ${Constants._bettaBreedPowerFee} power required to breed`)
			setBettaError('Not enough Power');
		}
		else {
			setBettaError(null);
		}

		// console.log("Betta Fish: " + fish.tokenId)
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


	if(!unityContext.isFishPoolReady) return null;

	return(
		<BaseContainer>
			<OptionsContainer>
			{/* {!account &&
				<Account textOverride={"Connect Wallet to Breed $FISH"}/>
			} */}
			{bettaError &&
				<ContainerColumn>
					<Error><BaseText>{bettaError}</BaseText></Error>
				</ContainerColumn>
			}
				
			</OptionsContainer>
		

			{fishToShow === FishView.MyFish && 
				<FishDrawer fishPool={PoolFish.User} type="Breeding" selectedFish={myBettaFish} fishCollection={userFish} onClick={setUserBetta}>
					<ToggleButton items={FishViewOptions} selected={fishToShow}></ToggleButton>
				</FishDrawer>
			}
			{account && userFish.length === 0 && fishToShow === FishView.MyFish &&
				<BaseLinkButton to={'/catch'}>Catch a Fish!</BaseLinkButton>
			}
			{fishToShow === FishView.AlphaFish &&
				<FishDrawer fishPool={PoolFish.Breeding} selectedOpponent={alphaFish} fishCollection={breedingFish} onClick={setAlpha}>
					<ToggleButton items={FishViewOptions} selected={fishToShow}></ToggleButton>
				</FishDrawer>
			}
		</BaseContainer>
	);
};



const OptionsContainer = styled.div`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
`;


export default BreedingWaters;
