import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useWeb3React } from '@web3-react/core';
import BN from 'bn.js';
import useHorizontalScroll from "../utils/horizontalScrolling";

import { Fish } from '../utils/fish'
import { Fight} from '../utils/fight'
import { useFishFight } from '../context/fishFightContext';
import { useUnity } from '../context/unityContext';
import FishNFT from './FishNFT';
import { useFishPool } from '../context/fishPoolContext';
import Account from './Account';
import JoinFightingWaters from './JoinFightingWaters';
import FishViewer from './FishViewer';

enum ViewToShow {
  AllFightingFish,
  UserFightingFish,
	UserFish,
	StartFight,
	ViewStakedFish,
	JoinFightingWaters
}


const FightingWaters = () => {
	const { FishFight, refetchBalance, userConnected } = useFishFight()
	const { userFish, fightingFish, userFightingFish, areUserFishLoaded, areFightingFishLoaded, areUserFightingFishLoaded } = useFishPool()

	// Fish selected for fight
	const [mySelectedFish, setMySelectedFish] = useState<Fish | null>(null);
	const [opponentFish, setopponentFish] = useState<Fish | null>(null);
	const [viewToShow, setViewToShow] = useState<number>(ViewToShow.AllFightingFish);
	const [fightResult, setFightResult] = useState<Fight | null>();
	const [showFightResult, setShowFightResult] = useState(false);
	const [isFighting, setIsFighting] = useState<boolean>(false);

	// Context
	const { account } = useWeb3React();
	const unityContext = useUnity();

	useEffect(() => {
		unityContext.showFight();
	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		unityContext.UnityInstance.on('FishPoolFightWinner', function () {
			console.log('Confirm FishPoolFightWinner');
			setShowFightResult(true);
		});
		unityContext.UnityInstance.on('FishPoolFightTie', function () {
			console.log('Confirm FishPoolFightTie');
			setShowFightResult(true);
		});
	}, [unityContext.isFishPoolReady]);

	const getUserFight = async (fightIndex: number) => {
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
		if(newFight.winner == mySelectedFish?.tokenId) {
			unityContext.sendWinner(mySelectedFish);
		}
		else if(newFight.winner == opponentFish?.tokenId) {
			unityContext.sendWinner(opponentFish);
		}
		else if(newFight.winner == -1) {
			unityContext.sendTie()
		}
		setFightResult(newFight)
	}

	const setOpponent = (fish : Fish) => {
		console.log("Opponent Fish: " + fish.tokenId)
		//unityContext.clearFishPool('ShowFight');
		if(mySelectedFish != null) {
			unityContext.addFishFight2(mySelectedFish);
		}
		setopponentFish(fish);
		unityContext.addFishFight2(fish)
	}

	const setUserFish = async (fish : Fish) => {
		console.log("UserSelected Fish: " + fish.tokenId)
		//unityContext.clearFishPool('ShowFight');
		if(opponentFish != null) {
			unityContext.addFishFight1(opponentFish);
		}
		setMySelectedFish(fish);
		unityContext.addFishFight1(fish)
		const approve = await FishFight.fishFactory?.methods.approve(FishFight.readFightingWaters.options.address, fish.tokenId).send({
			from: account,
			gasPrice: 1000000000,
			gasLimit: 500000,
		})
		console.log(approve)
		const addToFightingWaters = await FishFight.fightingWaters?.methods.deposit(fish.tokenId).send({
			from: account,
			gasPrice: 1000000000,
			gasLimit: 800000,
		})
		console.log(addToFightingWaters)
	}

	const fightFish = () => async () => {
		if (account && mySelectedFish != null && opponentFish != null) {
			try {
				setIsFighting(true);
				const result = await FishFight.fightingWaters?.methods.deathFight(mySelectedFish.tokenId, opponentFish.tokenId).send({
					from: account,
					gasPrice: 1000000000,
					gasLimit: 500000,
				});
				console.log(result)
				const fightIndex = new BN(result.events.FightCompleted.returnValues._fightIndex).toNumber()
				getUserFight(fightIndex);
				setIsFighting(false);
				toast.success('Transaction done', {
					onClose: async () => {
						refetchBalance()
					},
				});
			} catch (error: any) {
				toast.error(error);
				setIsFighting(false)
				setMySelectedFish(null)
				setopponentFish(null)
			}
		} else {
			toast.error('Connect your wallet');
		}
		return null
	};

	const fightAgain = () => {
		setFightResult(null)
		setIsFighting(false)
		setMySelectedFish(null)
		setopponentFish(null)
		setShowFightResult(false);		
	}

	const setView = (selection: ViewToShow) => {
		console.log(selection)
		setViewToShow(selection)
	}

	const scrollRef = useHorizontalScroll();

	return (
	<>
	<FightingWatersContainer>
		<FishingWatersOptions>
			{account &&
				<>
					<GameButton onClick={() => setViewToShow(ViewToShow.UserFightingFish)}>{'My Fighting Fish'}</GameButton>
					<GameButton onClick={() => setViewToShow(ViewToShow.AllFightingFish)}>{'All Fighting Fish'}</GameButton>
					<GameButton onClick={() => setViewToShow(ViewToShow.JoinFightingWaters)}>{'Deposit Fish'}</GameButton>
				</>
			}
			{!account &&
				<>
					{/* <GameButton onClick={() => setViewToShow(ViewToShow.ViewFightingWaters)}>{'Fighting Waters'}</GameButton> */}
				</>
			}
			
			{/* {mySelectedFish == null &&
				<Text>Select your fighter from My Fish!</Text>
			}
			{opponentFish == null &&
				<Text>Select your opponent from Public Fish!</Text>
			}
			{mySelectedFish != null && opponentFish != null &&
				<GameButton onClick={fightFish()}>
					Fight Fish
				</GameButton>
			}
			{viewToShow == ViewToShow.User && account && !areUserFishLoaded &&
				<Text>Loading you fish...</Text>
			}
			{viewToShow == ViewToShow.User && account && areUserFishLoaded && userFish?.length == 0 &&
				<CatchButton to={'/catch'}>Catch a Fish!</CatchButton>
			}
			{viewToShow == ViewToShow.User && !account &&
				<Account/>
			} */}
		</FishingWatersOptions>
		{account && viewToShow == ViewToShow.JoinFightingWaters &&
			<JoinFightingWaters></JoinFightingWaters>
		}
		{viewToShow == ViewToShow.AllFightingFish && 
			<FishViewer fishCollection={fightingFish}></FishViewer>
		}
		{viewToShow == ViewToShow.UserFightingFish && 
			<FishViewer fishCollection={userFightingFish}></FishViewer>
		}
	</FightingWatersContainer>
	
	</>
	);
};

interface GridProps {
	ref?: any;
}


const VersusContainer = styled.div`
	display: flex;
	flex-direction: column;
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
	font-size: ${props => props.theme.font.medium}vmin;
	pointer-events: auto;

	&:hover {
		opacity: 1;
		box-shadow: 1px 2px 2px 2px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}
`;

const CatchButton = styled(Link)`
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
	font-size: ${props => props.theme.font.medium}vmin;

	&:hover {
		opacity: 1;
		box-shadow: 1px 2px 2px 2px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}
`;

const FightingWatersContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	width: 100%;
	height: 100%;
`;

const FishingWatersOptions = styled.div`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	position: absolute;
	top: 10%;
	width: 100%;
	/* height: 17%; */
`;


const Text = styled.p`
	display: flex;
	flex-flow: column;
	justify-content: center;
	padding: ${props => props.theme.spacing.gap};
	margin: 0;
	background-color: white;
	font-size: ${props => props.theme.font.large}vmin;
	border-radius: 25px;
	margin-left: ${props => props.theme.spacing.gapSmall};
`;

const ResultData = styled.p`
	color: ${"black"};
	font-size: ${props => props.theme.font.medium}vmin;
	margin: 0;
`;

const ResultContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background-color: white;
	padding: ${props => props.theme.spacing.gap};
	margin: ${props => props.theme.spacing.gap};
	border-radius: 25px;
`;



export default FightingWaters;
