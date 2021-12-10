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
import { BaseContainer, ContainerControls, BaseLinkButton, BaseButton } from './BaseStyles';
import FishViewer from './FishViewer';
import Menu from './Menu';
import Web3 from 'web3';


enum FishToShow {
  Public,
  User
}

const ViewOptions = ['Select Fighter', 'Select Opponent']
const FishOptions = ['Staked Fish', 'Fish']

const StartFight = () => {
	const { FishFight, refetchBalance, userConnected } = useFishFight()
	const { userFish, fightingFish, userFightingFish, refreshFish } = useFishPool()

	// Fish selected for fight
	const [mySelectedFish, setMySelectedFish] = useState<Fish | null>(null);
	const [opponentFish, setOpponentFish] = useState<Fish | null>(null);
	const [viewToShow, setViewToShow] = useState<string>(ViewOptions[0]);
	const [fishToShow, setFishToShow] = useState<string>(FishOptions[0]);
	const [fightResult, setFightResult] = useState<Fight | null>();
	const [showFightResult, setShowFightResult] = useState(false);
	const [isFighting, setIsFighting] = useState<boolean>(false);

	// Context
	const { account } = useWeb3React();
	const unityContext = useUnity();

	// useEffect(() => {
	// 	console.log("Account changed")
	// 	console.log(userConnected)
	// 	if(userConnected) {
	// 		setFishToShow(FishToShow.User)
	// 	} else {
	// 		setFishToShow(FishToShow.Public)
	// 	}
	// }, [userConnected]);

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
		else if(newFight.winner == 0) {
			unityContext.sendTie()
		}
		setFightResult(newFight)
		refreshFish(newFight.winner)
	}

	const setOpponent = (fish : Fish) => {
		console.log("Opponent Fish: " + fish.tokenId)
		//unityContext.clearFishPool('ShowFight');
		if(mySelectedFish != null) {
			unityContext.addFishFight2(mySelectedFish);
		}
		setOpponentFish(fish);
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
	}

	const isDeposited = async (tokenId: number) => {
		const owner = await FishFight.readFishFactory.methods.ownerOf(tokenId).call();
		console.log(owner)
		console.log(FishFight.readFishingWaters.options.address)
		return owner == FishFight.readFightingWaters.options.address;
	}

	const fightFish = async () => {
		if (account && mySelectedFish != null && opponentFish != null) {
			const deposited = await isDeposited(mySelectedFish.tokenId);
			// Must approve not deposited fish before fighting, then trigger depositAndDeathFight
			if(!deposited) {
				try {
					const approve = await FishFight.fishFactory?.methods.approve(FishFight.readFightingWaters.options.address, mySelectedFish.tokenId).send({
						from: account,
						gasPrice: 1000000000,
						gasLimit: 500000,
					})
					console.log(approve)

					setIsFighting(true);
					const result = await FishFight.fightingWaters?.methods.depositAndDeathFight(mySelectedFish.tokenId, opponentFish.tokenId).send({
						from: account,
						gasPrice: 1000000000,
						gasLimit: 5000000,
					})
					console.log(result)
					const fightIndex = new BN(result.events.FightCompleted.returnValues._fightIndex).toNumber()
					getUserFight(fightIndex);
					setIsFighting(false);
					toast.success('Transaction done', {
						onClose: async () => {
							refetchBalance()
							// refetchFightingFish()
						},
					});
				} catch (error: any) {
					console.log(error)
					toast.error(error);
					setIsFighting(false)
					setMySelectedFish(null)
					setOpponentFish(null)
				}
			}
			else { // If User selected fish is already deposited, we can just fight them
				try {
					setIsFighting(true);
					// FishFight.fightingWaters?.methods.deathFight(mySelectedFish.tokenId, opponentFish.tokenId).estimateGas({gas: 5000000}, function(error: any, gasAmount: any){
					// 	console.log(gasAmount)
					// 	if(gasAmount == 5000000)
					// 		console.log('Method ran out of gas');
					// });
					// const estimateGas = await FishFight.fightingWaters?.methods.deathFight(mySelectedFish.tokenId, opponentFish.tokenId).estimateGas({
					// 	from: account,
					// 	gas: 1000000,
					// });
					// console.log(Web3.utils.toNumber(estimateGas))
					const result = await FishFight.fightingWaters?.methods.deathFight(mySelectedFish.tokenId, opponentFish.tokenId).send({
						from: account,
						gasPrice: 1000000000,
						gasLimit: 5000000,
					});
					console.log(result)
					const fightIndex = new BN(result.events.FightCompleted.returnValues._fightIndex).toNumber()
					getUserFight(fightIndex);
					setIsFighting(false);
					toast.success('Transaction done', {
						onClose: async () => {
							refetchBalance()
							// refetchFightingFish()
						},
					});
				} catch (error: any) {
					toast.error(error);
					setIsFighting(false)
					setMySelectedFish(null)
					setOpponentFish(null)
				}
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
		setOpponentFish(null)
		setShowFightResult(false);		
	}

	// const setFishToView = () => {
	// 	if(fishToShow == FishToShow.Public) {
	// 		setFishToShow(FishToShow.User)
	// 	}
	// 	else {
	// 		setFishToShow(FishToShow.Public)
	// 	}
	// }

	const scrollRef = useHorizontalScroll();

	return (
		<>
		{/* Select Fish to Fight */}
		{!fightResult && !isFighting &&
			<BaseContainer>
				{
					<FightGrid>
						{mySelectedFish &&
							<FishNFT selectedUser={true} fish={mySelectedFish}></FishNFT>
						}
						<VersusContainer>
							<Text>VS</Text>
							{mySelectedFish != null && opponentFish != null ?
								<BaseButton onClick={() => fightFish()}>
									Fight Fish
								</BaseButton>
								:
								<Text>Select Fish to Fight</Text>
							}
						</VersusContainer>
						{opponentFish &&
							<FishNFT selectedOpponent={true} fish={opponentFish}></FishNFT>
						}
					</FightGrid>
				}
				<ContainerControls>
					
					{viewToShow == ViewOptions[0] && account && userFish?.length === 0 &&
						<CatchButton to={'/catch'}>Catch a Fish!</CatchButton>
					}
					<Menu name={viewToShow} onClick={setViewToShow} items={ViewOptions}></Menu>
					{viewToShow == ViewOptions[0] &&
						<Menu name={fishToShow} onClick={setFishToShow} items={FishOptions}></Menu>
					}
				</ContainerControls>
				{viewToShow == ViewOptions[0] &&
					<FishViewer selectedFish={mySelectedFish} fishCollection={fishToShow == FishOptions[0] ? userFightingFish : userFish} onClick={setUserFish}></FishViewer>
				}
				{viewToShow == ViewOptions[1] &&
					<FishViewer selectedOpponent={opponentFish} fishCollection={fightingFish} onClick={setOpponent}></FishViewer>
				}
			</BaseContainer>
		}

		{/* Fish are Fighting */}
		{isFighting && mySelectedFish && opponentFish &&
			<BaseContainer>
				<FightGrid >
					<FishNFT selectedUser={true} fish={mySelectedFish}></FishNFT>
					<VersusContainer>
						<Text>VS</Text>
						<Text>Awaiting results from blockchain...</Text>
					</VersusContainer>
					<FishNFT selectedOpponent={true} fish={opponentFish}></FishNFT>
				</FightGrid>
			</BaseContainer>
		}

		{/* Show Fight Results */}
		{fightResult && mySelectedFish && opponentFish &&
			<BaseContainer>
				<ContainerControls>
					<BaseButton onClick={() => fightAgain()}>
						Fight Another Fish!
					</BaseButton>
				</ContainerControls>
				<FightGrid>
					<FishNFT selectedUser={true} fish={mySelectedFish}></FishNFT>
					{showFightResult ? 
					<ResultContainer>
						<ResultData>Results</ResultData>
						<ResultData>Round 1: {fightResult.round1.description}</ResultData>
						<ResultData>Round 2: {fightResult.round2.description}</ResultData>
						<ResultData>Round 3: {fightResult.round3.description}</ResultData>
						<ResultData>Winner: {fightResult.winner}</ResultData>
					</ResultContainer>
					:
					<VersusContainer><Text>Fight Starting!</Text></VersusContainer>
					}
					
					<FishNFT selectedOpponent={true} fish={opponentFish}></FishNFT>
				</FightGrid>
			</BaseContainer>
		}
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

const FishViewerContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	width: 100%;
	height: 100%;
`;

const FishViewerButtons = styled.div`
	display: flex;
	flex-flow: row nowrap;
	height: 17%;
`;

const FightGrid = styled.div`
	display: flex;
	flex-direction: row nowrap;
	justify-content: center;
	/* height: 72%; */
	overflow-y: hidden;
	overflow-x: auto;
	pointer-events: auto;
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



export default StartFight;
