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


const FightFish = () => {
	const { FishFight, refetchBalance, userFish, publicFish, refetchUserFish, refetchPublicFish} = useFishFight()

	// Fish selected for fight
	const [mySelectedFish, setMySelectedFish] = useState<Fish | null>(null);
	const [opponentFish, setopponentFish] = useState<Fish | null>(null);
	const [fightResult, setFightResult] = useState<Fight | null>();
	const [isFighting, setIsFighting] = useState<boolean>(false);

	// Context
	const { account } = useWeb3React();
	const unityContext = useUnity();

	useEffect(() => {
		unityContext.showFight();
	}, []);

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
						refetchUserFish()
						refetchPublicFish()
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

	const FightResults = () => {
		if(fightResult) {
			return (
				<ResultContainer>
					<FishNFT>
						<FishData>Challenger: {fightResult.fishChallenger} Vs. Challenged: {fightResult.fishChallenged}</FishData>
						<FishData>Round 1: {fightResult.round1.description}</FishData>
						<FishData>Round 2: {fightResult.round2.description}</FishData>
						<FishData>Round 3: {fightResult.round3.description}</FishData>
						<FishData>Winner: {fightResult.winner}</FishData>
					</FishNFT>

					<FightButton onClick={() => fightAgain()}>
						Fight Another Fish!
					</FightButton>
				</ResultContainer>
			)
		}
		return(<></>)
	}

	const Fighting = () => {
		if(isFighting && mySelectedFish && opponentFish) {
			return (
				<FightContainer>
					<FightingContainer>
						<FishNFT>
							<FishName>{mySelectedFish.tokenId}</FishName>
							<FishData>Strength: {mySelectedFish.strength}</FishData>
							<FishData>Intelligence: {mySelectedFish.intelligence}</FishData>
							<FishData>Agility: {mySelectedFish.agility}</FishData>
							<FishData>Wins: {mySelectedFish.wins}</FishData>
						</FishNFT>
						<h2>VS.</h2>
						<FishNFT>
							<FishName>{opponentFish.tokenId}</FishName>
							<FishData>Strength: {opponentFish.strength}</FishData>
							<FishData>Intelligence: {opponentFish.intelligence}</FishData>
							<FishData>Agility: {opponentFish.agility}</FishData>
							<FishData>Wins: {opponentFish.wins}</FishData>
						</FishNFT>
					</FightingContainer>
					<FightResults />
				</FightContainer>
			)
		}
		return(<></>)
	}

	const SelectFighters = () => {
		if(!fightResult && !isFighting) {
			return(
				<FightContainer>
					<h1>Let's Fight!</h1>
					<FishSelector>
						<h2>Select Opponent!</h2>
						<FishGrid>
						{publicFish?.map((fish, index) => (
								<FishNFT  key={index} onClick={() => {setOpponent(fish)}}>
									<FishName>{fish.tokenId}</FishName>
									<FishData>Strength: {fish.strength}</FishData>
									<FishData>Intelligence: {fish.intelligence}</FishData>
									<FishData>Agility: {fish.agility}</FishData>
									<FishData>Wins: {fish.wins}</FishData>
									<FishData>{fish.tokenId == opponentFish?.tokenId ? "Selected Fish" : ""}</FishData>
								</FishNFT>
							))}
						</FishGrid>
					</FishSelector>
					
					<FishSelector>
						<h2>Select your Fish!</h2>
						<FishGrid>
						{userFish?.map((fish, index) => (
								<FishNFT key={index} onClick={() => {setUserFish(fish)}}>
									<FishName>{fish.tokenId}</FishName>
									<FishData>Strength: {fish.strength}</FishData>
									<FishData>Intelligence: {fish.intelligence}</FishData>
									<FishData>Agility: {fish.agility}</FishData>
									<FishData>Wins: {fish.wins}</FishData>
									<FishData>{fish.tokenId == mySelectedFish?.tokenId ? "Selected Fish": ""}</FishData>
								</FishNFT>
							))}
						</FishGrid>
					</FishSelector>

					<FightButton onClick={fightFish()}>
						Fight Fish
					</FightButton>
				</FightContainer>
			)
		}
		return(<></>)
	}

	return (
		<>
			<Fighting />
			<SelectFighters />
		</>
		
	);
};


const ResultContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
`;

const FightContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
`;

const FightingContainer = styled.div`
	display: flex;
	flex-direction: row nowrap;
	justify-content: space-evenly;
	width: 100%;
`;

const FishGrid = styled.div`
	display: flex;
	flex-direction: row wrap;
	width: 100%;
	margin: 15px;
	border: 8px solid blue;
	border-radius: 5px;
	color: #a70000;
`;

const FishSelector = styled.div`
	display: flex;
	flex-flow: column;
	align-items: center;
	justify-content: space-evenly;
	width: 100%;
`;

const FishNFT = styled.div`
	display: flex;
	flex-flow: column;
	align-items: center;
	border-radius: 25px;
	padding: 30px;
	margin: 15px;
	background-color: white;
	box-shadow: 2px 8px 10px 4px rgba(0, 0, 0, 0.3);
`;

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
