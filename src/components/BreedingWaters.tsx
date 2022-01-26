import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useWeb3React } from '@web3-react/core';
import { Fish } from '../utils/fish'
import { useUnity } from '../context/unityContext';
import { useFishPool } from '../context/fishPoolContext';
import FishViewer from './FishViewer';
import {  BaseLinkButton, BaseOverlayContainer, ContainerControls } from './BaseStyles';
import { ToggleGroup, ToggleOption } from './ToggleButton';
import { useContractWrapper } from '../context/contractWrapperContext';

enum FishSelectionEnum {
  MyFish,
  AlphaFish
}

const BreedingWaters = () => {
	// State
	const [fishSelectionToShow, setFishSelectionToShow] = useState<number>(FishSelectionEnum.AlphaFish);
	const [myBettaFish, setMyBettaFish] = useState<Fish | null>(null);
	const [alphaFish, setAlphaFish] = useState<Fish | null>(null);

	const [breedResult, setBreedResult] = useState<Fish | null>();
	const [showBreedResult, setShowBreedResult] = useState(false);
	const [isBreeding, setIsBreeding] = useState<boolean>(false);

	// Context
	const unityContext = useUnity();
	const { account } = useWeb3React();
	const { userFish, breedingFish } = useFishPool()
	const { breedFish, depositBreedingFish, withdrawBreedingFish, pendingTransaction} = useContractWrapper();

	useEffect(() => {
		console.log("Breeding Fish")
		unityContext.showBreedingLocation();
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
		setAlphaFish(fish);
		unityContext.addFishFight2(fish)
	}

	const setUserBetta = async (fish : Fish) => {
		console.log("Betta Fish: " + fish.tokenId)
		setMyBettaFish(fish);
		unityContext.addFishFight1(fish)
	}

	const breedAgain = () => {
		setBreedResult(null)
		setIsBreeding(false)
		setMyBettaFish(null)
		setAlphaFish(null)
		setShowBreedResult(false);
		unityContext.showFightingLocation();
	}

	return (
		<BaseOverlayContainer
			active={pendingTransaction}
			spinner
			text='Waiting for confirmation...'
			>
			{myBettaFish != null &&
			<OptionsContainer>
				{myBettaFish.stakedBreeding &&
					<GameButton onClick={() => withdrawBreedingFish(myBettaFish)}>{'Withdraw Breeder'}</GameButton>
				}
				{myBettaFish.seasonStats.fightWins > 0 && !myBettaFish.stakedFighting &&
					<GameButton onClick={() => depositBreedingFish(myBettaFish)}>{'Deposit'}</GameButton>
				}
				{myBettaFish && alphaFish &&
					<GameButton onClick={() => breedFish(alphaFish, myBettaFish)}>{'Breed Fish'}</GameButton>
				}
			</OptionsContainer>
			}
			<ContainerControls>
				{account &&
					<ToggleGroup>
						<ToggleOption className={fishSelectionToShow === FishSelectionEnum.MyFish ? 'active' : ''} onClick={() => setFishSelectionToShow(FishSelectionEnum.MyFish)}>My Betta $FISH</ToggleOption>
						<ToggleOption className={fishSelectionToShow === FishSelectionEnum.AlphaFish ? 'active' : ''} onClick={() => setFishSelectionToShow(FishSelectionEnum.AlphaFish)}>Alpha $FISH</ToggleOption>
					</ToggleGroup>
				}
			</ContainerControls>
			{account && userFish.length > 0 && fishSelectionToShow === FishSelectionEnum.MyFish && 
				<FishViewer selectedFish={myBettaFish} fishCollection={userFish} onClick={setUserBetta} />
			}
			{account && userFish.length === 0 && fishSelectionToShow === FishSelectionEnum.MyFish &&
				<BaseLinkButton to={'/catch'}>Catch a Fish!</BaseLinkButton>
			}
			{(fishSelectionToShow === FishSelectionEnum.AlphaFish || !account ) &&
				<FishViewer depositAlpha={true} selectedOpponent={alphaFish} fishCollection={breedingFish} onClick={setAlpha} />
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

export default BreedingWaters;
