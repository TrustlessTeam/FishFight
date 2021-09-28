// React
import { useEffect, useState } from 'react';

// Styled Components
import styled from 'styled-components';

// Toast
import { toast } from 'react-toastify';

// Web3
import { useWeb3React } from '@web3-react/core';

// Big Number
import BN from 'bn.js';

// Utils
import { Fish } from '../utils/fish'
import { Fight} from '../utils/fight'
import { useFishFight } from '../context/fishFightContext';
import { useUnity } from '../context/unityContext';

import FishNFT from './FishNFT';
import { useFishPool } from '../context/fishPoolContext';

enum FishToShow {
  Public,
  User
}


const FightFish = () => {
	const { FishFight, refetchBalance } = useFishFight()
	const { userFish, publicFish } = useFishPool()

	// Fish selected for fight
	const [mySelectedFish, setMySelectedFish] = useState<Fish | null>(null);
	const [opponentFish, setopponentFish] = useState<Fish | null>(null);
	const [fishToShow, setFishToShow] = useState<FishToShow>(FishToShow.Public);
	const [fightResult, setFightResult] = useState<Fight | null>();
	const [isFighting, setIsFighting] = useState<boolean>(false);

	// Context
	const { account } = useWeb3React();
	const unityContext = useUnity();

	useEffect(() => {
		unityContext.showFight();
	}, [unityContext.isFishPoolReady]);

	const getUserFight = async (fightIndex: number) => {
		const fightInfo = await FishFight.fight.methods.getFightInfo(fightIndex).call();
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
		setFightResult(newFight)
	}

	const setOpponent = (fish : Fish) => {
		console.log("Opponent Fish: " + fish.tokenId)
		unityContext.setFishModeFighting();
		unityContext.clearFishPool();
		if(mySelectedFish != null) {
			unityContext.addFish(mySelectedFish);
		}
		setopponentFish(fish);
		unityContext.addFish(fish)
	}

	const setUserFish = (fish : Fish) => {
		console.log("UserSelected Fish: " + fish.tokenId)
		unityContext.setFishModeFighting();
		unityContext.clearFishPool();
		if(opponentFish != null) {
			unityContext.addFish(opponentFish);
		}
		setMySelectedFish(fish);
		unityContext.addFish(fish)
	}

	const fightFish = () => async () => {
		if (account && mySelectedFish != null && opponentFish != null) {
			try {
				setIsFighting(true);
				const result = await FishFight.fight.methods.fight(mySelectedFish.tokenId, opponentFish.tokenId, 0).send({
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
	}

	const setFishToView = () => {
		if(fishToShow == FishToShow.Public) {
			setFishToShow(FishToShow.User)
		}
		else {
			setFishToShow(FishToShow.Public)
		}
	}

	const FightResults = () => {
		if(fightResult && mySelectedFish && opponentFish) {
			return (
				<FishViewerContainer>
					<FishViewerButtons>
						<GameButton onClick={() => fightAgain()}>
							Fight Another Fish!
						</GameButton>
					</FishViewerButtons>
					<FightGrid>
						<FishNFT selectedUser={true} fish={mySelectedFish}></FishNFT>
						<ResultContainer>
							<ResultData>Results</ResultData>
							<ResultData>Round 1: {fightResult.round1.description}</ResultData>
							<ResultData>Round 2: {fightResult.round2.description}</ResultData>
							<ResultData>Round 3: {fightResult.round3.description}</ResultData>
							<ResultData>Winner: {fightResult.winner}</ResultData>
						</ResultContainer>
						<FishNFT selectedOpponent={true} fish={opponentFish}></FishNFT>
					</FightGrid>
				</FishViewerContainer>
			)
		}
		return(<></>)
	}

	const Fighting = () => {
		if(isFighting && mySelectedFish && opponentFish) {
			return (
				<FishViewerContainer>
					<FightGrid>
						<FishNFT selectedUser={true} fish={mySelectedFish}></FishNFT>
						<VersusContainer>
							<Text>VS</Text>
							<Text>Awaiting results from blockchain...</Text>
						</VersusContainer>
						<FishNFT selectedOpponent={true} fish={opponentFish}></FishNFT>
					</FightGrid>
				</FishViewerContainer>
			)
		}
		return(<></>)
	}

	const SelectFighters = () => {
		if(!fightResult && !isFighting) {
			return(
				<FishViewerContainer>
					<FishViewerButtons>
						<GameButton onClick={() => setFishToView()}>{fishToShow == FishToShow.Public ? "Show my Fish" : "Show public Fish"}</GameButton>
						{mySelectedFish == null &&
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
					</FishViewerButtons>

						<FishGrid>
						{fishToShow == FishToShow.Public &&
							publicFish?.map((fish, index) => (
								<FishNFT selectedOpponent={opponentFish?.tokenId == fish.tokenId} fish={fish} key={index} onClick={() => {setOpponent(fish)}}></FishNFT>
							))
						}
						{fishToShow == FishToShow.User &&
							userFish?.map((fish, index) => (
								<FishNFT selectedUser={mySelectedFish?.tokenId == fish.tokenId ? true : false} fish={fish} key={index} onClick={() => {setUserFish(fish)}}></FishNFT>
							))
						}
						</FishGrid>

					
				</FishViewerContainer>
			)
		}
		return(<></>)
	}

	return (
		<>
			<Fighting />
			<FightResults />
			<SelectFighters />
		</>
		
	);
};


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

	&:hover {
		opacity: 1;
		box-shadow: 1px 2px 2px 2px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}
`;

const FishViewerContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-evenly;
	width: 100%;
	height: 100%;
`;

const FishViewerButtons = styled.div`
	display: flex;
	flex-flow: row nowrap;
	height: 15%;
`;

const FishGrid = styled.div`
	display: flex;
	flex-direction: row nowrap;
	justify-content: space-between;
	height: 72%;
	overflow-y: hidden;
	overflow-x: auto;
`;

const FightGrid = styled.div`
	display: flex;
	flex-direction: row nowrap;
	justify-content: center;
	height: 72%;
	overflow-y: hidden;
	overflow-x: auto;
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



export default FightFish;
