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

enum FishToShow {
  Public,
  User
}


const FightFish = () => {
	const { FishFight, refetchBalance, userFish, publicFish} = useFishFight()

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
		setopponentFish(fish);
	}

	const setUserFish = (fish : Fish) => {
		console.log("UserSelected Fish: " + fish.tokenId)
		setMySelectedFish(fish);
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
		if(fightResult) {
			return (
				<ResultContainer>
					<div>
						<FishData>Challenger: {fightResult.fishChallenger} Vs. Challenged: {fightResult.fishChallenged}</FishData>
						<FishData>Round 1: {fightResult.round1.description}</FishData>
						<FishData>Round 2: {fightResult.round2.description}</FishData>
						<FishData>Round 3: {fightResult.round3.description}</FishData>
						<FishData>Winner: {fightResult.winner}</FishData>
					</div>

					<FightButton onClick={() => fightAgain()}>
						Fight Another Fish!
					</FightButton>
				</ResultContainer>
			)
		}
		return(<></>)
	}

	// const Fighting = () => {
	// 	if(isFighting && mySelectedFish && opponentFish) {
	// 		return (
	// 			<FightContainer>
	// 				<FightingContainer>
	// 					<FishNFT fish={mySelectedFish}></FishNFT>
	// 					<h2>VS.</h2>
	// 					<FishNFT fish={opponentFish}></FishNFT>
	// 				</FightingContainer>
	// 				<FightResults />
	// 			</FightContainer>
	// 		)
	// 	}
	// 	return(<></>)
	// }

	const SelectFighters = () => {
		if(!fightResult && !isFighting) {
			return(
				<FishViewerContainer>
					<FishViewerButtons>
						<GameButton onClick={() => setFishToView()}>{fishToShow == FishToShow.Public ? "Show my Fish" : "Show public Fish"}</GameButton>
						<GameButton onClick={fightFish()}>
							Fight Fish
						</GameButton>
					</FishViewerButtons>

						<FishGrid>
						{fishToShow == FishToShow.Public &&
							publicFish?.map((fish, index) => (
								<FishNFT fish={fish} key={index} onClick={() => {setOpponent(fish)}}></FishNFT>
							))
						}
						{fishToShow == FishToShow.User &&
							userFish?.map((fish, index) => (
								<FishNFT fish={fish} key={index} onClick={() => {setUserFish(fish)}}></FishNFT>
							))
						}
						</FishGrid>

					
					{/* <FishSelector>
						<h2>Select your Fish!</h2>
						<FishGrid>
						{userFish?.map((fish, index) => (
							<FishNFT fish={fish} key={index} onClick={() => {setUserFish(fish)}}></FishNFT>
						))}
						</FishGrid>
					</FishSelector> */}

					
				</FishViewerContainer>
			)
		}
		return(<></>)
	}

	return (
		<>
			{/* <Fighting /> */}
			<SelectFighters />
		</>
		
	);
};


const ResultContainer = styled.div`
	display: flex;
	flex-direction: row nowrap;
	align-items: center;
	width: 100%;
`;

const GameButton = styled.button`
	text-align: center;
	padding: 2.2vmin;
	border-radius: 10%;
	background-color: white;
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
	height: 85%;
	overflow-y: hidden;
	overflow-x: auto;
`;


// const FishNFT = styled.div`
// 	display: flex;
// 	flex-flow: column;
// 	align-items: center;
// 	border-radius: 25px;
// 	padding: 30px;
// 	margin: 15px;
// 	background-color: white;
// 	box-shadow: 2px 8px 10px 4px rgba(0, 0, 0, 0.3);
// `;

const FishName = styled.h3`
	color: ${"black"};
`;

const FishData = styled.p`
	color: ${"black"};
	margin: 0;
`;

const FightButton = styled.button`
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: rgba(255, 255, 255, 0.7);
	color: black;
	padding: 20px 20px;
	border-radius: 10px;
	max-width: 20%;
	box-shadow: 1px 2px 4px 4px rgba(0, 0, 0, 0.2);
	font-size: 1.5rem;
	transition: background-color 0.3s ease;

	&:hover {
		background-color: rgba(255, 255, 255, 1);
		cursor: pointer;
	}

	span {
		font-size: 1rem;
		margin-left: 8px;
		align-self: flex-end;
	}
`;


export default FightFish;
