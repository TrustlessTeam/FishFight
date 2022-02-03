import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useWeb3React } from '@web3-react/core';
import { Fish } from '../utils/fish'
import { Fight} from '../utils/fight'
import { useUnity } from '../context/unityContext';
import { useFishPool } from '../context/fishPoolContext';
import FishViewer from './FishViewer';
import { BaseLinkButton, BaseOverlayContainer, ContainerControls } from './BaseStyles';
import { ToggleGroup, ToggleOption } from './ToggleButton';
import { useContractWrapper } from '../context/contractWrapperContext';

enum FishSelectionEnum {
  MyFish,
  FightFish
}

const FightingWaters = () => {
	// State
	const [mySelectedFish, setMySelectedFish] = useState<Fish | null>(null);
	const [opponentFish, setOpponentFish] = useState<Fish | null>(null);
	const [fishSelectionToShow, setFishSelectionToShow] = useState<number>(FishSelectionEnum.FightFish);
	const [fightResult, setFightResult] = useState<Fight | null>();
	const [showFightingLocationResult, setshowFightingLocationResult] = useState(false);
	const [isFighting, setIsFighting] = useState<boolean>(false);
	const [renderedFish, setRenderedFish] = useState<number[]>([]);

	// Context
	const { userFish, fightingFish } = useFishPool()
	const { account } = useWeb3React();
	const unityContext = useUnity();
	const { fightFish, depositFightingFish, withdrawFightingFish, pendingTransaction} = useContractWrapper();

	useEffect(() => {
		unityContext.UnityInstance.on('UISelectionConfirm', function (data: any) {
			console.log('UI changed catch fish');
			console.log(data)
			switch (data) {
				case 'breed_confirm':
					fightFish(mySelectedFish, opponentFish);
					return;
				case 'depositFighter':
					depositFightingFish(mySelectedFish);
					return;
				case 'withdrawFighter':
					withdrawFightingFish(mySelectedFish);
					return;
				default:
					return;
			}
			
		});
	}, [unityContext.isFishPoolReady, account]);

	useEffect(() => {
		if(account) {
			setFishSelectionToShow(FishSelectionEnum.MyFish)
		} else {
			setFishSelectionToShow(FishSelectionEnum.FightFish)
		}
	}, [account]);

	useEffect(() => {
		console.log("Show Fighting Location")
		unityContext.showFightingLocation();
	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		console.log("Fightintg Fish Changed")
		console.log(fightingFish)
		console.log(userFish)
		if(!unityContext.isFishPoolReady) return;
		let i = 0;
		fightingFish.forEach(fish => {
			if(!renderedFish.includes(fish.tokenId)) {
				unityContext.addFishFightingPool(fish);
				setRenderedFish(prevData => [...prevData, fish.tokenId])
				i++;
			}
		})
		console.log(i)
	}, [fightingFish, userFish, unityContext.isFishPoolReady]);


	const setUserFighter = async (fish : Fish) => {
		console.log("User Selected Fish: " + fish.tokenId)
		setMySelectedFish(fish);
		unityContext.addFish1(fish)
		unityContext.addFishFight1(fish)
	}

	const setOpponentFighter = (fish : Fish) => {
		console.log("Opponent Fish: " + fish.tokenId)
		if(fish.tokenId == mySelectedFish?.tokenId) {
			toast.error("Can't Fight the same Fish")
			return;
		}
		setOpponentFish(fish);
		unityContext.addFish2(fish)
		unityContext.addFishFight2(fish)
	}

	const selectAnother = () => {
		setMySelectedFish(null);
		// unityContext.showFightingLocation(); // switch to FightingWaters view
	}

	useEffect(() => {
		unityContext.UnityInstance.on('FishPoolFightWinner', function () {
			console.log('Confirm FishPoolFightWinner');
			setshowFightingLocationResult(true);
		});
		unityContext.UnityInstance.on('FishPoolFightTie', function () {
			console.log('Confirm FishPoolFightTie');
			setshowFightingLocationResult(true);
		});
	}, [unityContext.isFishPoolReady]);

	const fightAgain = () => {
		setFightResult(null)
		setIsFighting(false)
		setMySelectedFish(null)
		setOpponentFish(null)
		setshowFightingLocationResult(false);
	}

	const FighterSelection = () => {
		return (
			<>
				{mySelectedFish != null &&
				<OptionsContainer>
					{mySelectedFish.stakedFighting ?
						<GameButton onClick={() => withdrawFightingFish(mySelectedFish)}>{'Withdraw'}</GameButton>
						:
						<GameButton onClick={() => depositFightingFish(mySelectedFish)}>{'Deposit'}</GameButton>
					}
					{mySelectedFish && opponentFish &&
						<GameButton onClick={() => fightFish(mySelectedFish, opponentFish)}>{'Start Fight'}</GameButton>
					}
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
				</ContainerControls>
				{account && userFish.length > 0 && fishSelectionToShow === FishSelectionEnum.MyFish && 
					<FishViewer selectedFish={mySelectedFish} fishCollection={userFish} onClick={setUserFighter} />
				}
				{account && userFish.length === 0 && fishSelectionToShow === FishSelectionEnum.MyFish &&
					<BaseLinkButton to={'/catch'}>Catch a Fish!</BaseLinkButton>
				}
				{(fishSelectionToShow === FishSelectionEnum.FightFish || !account ) &&
					<FishViewer depositFighter selectedOpponent={opponentFish} fishCollection={fightingFish} onClick={setOpponentFighter} />
				}
			</>
		)
	}

	return (
		<BaseOverlayContainer
			active={pendingTransaction}
			spinner
			text='Waiting for confirmation...'
			>
			{!isFighting && !showFightingLocationResult && !fightResult &&
				<FighterSelection />
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


export default FightingWaters;
