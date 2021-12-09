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
import FishViewer from './FishViewer';
import Menu from './Menu';
import StakedStatus from './StakedStatus';


enum FishToShow {
  Public,
  User
}

const ModeOptions = ['Staked Fish', 'Available Fish']


const UserFightingWaters = () => {
	const { FishFight, refetchBalance, userConnected } = useFishFight()
	const { userFish, userFightingFish, fightingFish, addUserFightingFish } = useFishPool()
	const [viewToShow, setViewToShow] = useState<string>(ModeOptions[0]);
	const [renderedFish, setRenderedFish] = useState<number[]>([]);

	// Fish selected for fight
	const [mySelectedFish, setMySelectedFish] = useState<Fish | null>(null);

	// Context
	const { account } = useWeb3React();
	const unityContext = useUnity();

	useEffect(() => {
		console.log("UserFightingFish")
		unityContext.showFight();
	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		console.log("Fightintg Fish Changed")
		console.log(fightingFish)
		if(!unityContext.isFishPoolReady) return;
		let i = 0;
		fightingFish.forEach(fish => {
			if(!renderedFish.includes(fish.tokenId)) {
				unityContext.addFishOcean(fish);
				setRenderedFish(prevData => [...prevData, fish.tokenId])
				i++;
			}
		})
		console.log(i)
	}, [fightingFish, unityContext.isFishPoolReady]);

	const setUserFish = (fish : Fish) => {
		console.log("User Fish: " + fish.tokenId)
		setMySelectedFish(fish);
		unityContext.addFishFight1(fish);
		// unityContext.showFish(fish);
	}

	const selectAnother = () => {
		setMySelectedFish(null);
		// unityContext.showFight(); // switch to FightingWaters view
	}

	const depositFish = async (fish : Fish) => {
		if (account && mySelectedFish != null) {
			try {
				const approve = await FishFight.fishFactory?.methods.approve(FishFight.readFightingWaters.options.address, fish.tokenId).send({
					from: account,
					gasPrice: 1000000000,
					gasLimit: 500000,
				})
				console.log(approve)
				unityContext.addFishFight1(fish)
				const addToFightingWaters = await FishFight.fightingWaters?.methods.deposit(fish.tokenId).send({
					from: account,
					gasPrice: 1000000000,
					gasLimit: 800000,
				})
				console.log(addToFightingWaters)
				addUserFightingFish(fish);
				toast.success('Transaction done', {
					onClose: async () => {
						refetchBalance()
						// call to refresh userFish and userFightingWaters Fish
					},
				});
			} catch (error: any) {
				toast.error(error);
			}
		} else {
			toast.error('Connect your wallet');
		}
		setMySelectedFish(null)
	}

	const withdrawFish = async (fish : Fish) => {
		if (account && mySelectedFish != null) {
			try {
				// const approve = await FishFight.fishFactory?.methods.approve(FishFight.readFightingWaters.options.address, fish.tokenId).send({
				// 	from: account,
				// 	gasPrice: 1000000000,
				// 	gasLimit: 500000,
				// })
				// console.log(approve)
				// unityContext.addFishFight1(fish)
				const withdrawFightingWaters = await FishFight.fightingWaters?.methods.withdraw(fish.tokenId).send({
					from: account,
					gasPrice: 1000000000,
					gasLimit: 800000,
				})
				console.log(withdrawFightingWaters)
				toast.success('Transaction done', {
					onClose: async () => {
						refetchBalance()
						// call to refresh userFish and userFightingWaters Fish
					},
				});
			} catch (error: any) {
				toast.error(error);
			}
		} else {
			toast.error('Connect your wallet');
		}
		setMySelectedFish(null)
	}

	const setView = (selection: string) => {
		console.log(selection)
		setMySelectedFish(null);
		setViewToShow(selection)
	}

	return (
		<>
		{viewToShow === ModeOptions[0] &&
			<Container>
					{mySelectedFish != null &&
						<OptionsContainer>
							<GameButton onClick={() => withdrawFish(mySelectedFish)}>{'Withdraw'}</GameButton>
							{/* <GameButton onClick={() => startFightFish(mySelectedFish)}>{'Use in Fight'}</GameButton> */}
							<GameButton onClick={() => selectAnother()}>{'Back to Fish'}</GameButton>
						</OptionsContainer>
					}
					<StakedStatus></StakedStatus>
					<Menu name={viewToShow} onClick={setView} items={ModeOptions}></Menu>
					<FishViewer selectedFish={mySelectedFish} fishCollection={userFightingFish} onClick={setUserFish}></FishViewer>
			</Container>
		}
		{viewToShow === ModeOptions[1] &&
			<Container>
					{mySelectedFish != null &&
					<OptionsContainer>
						<GameButton onClick={() => depositFish(mySelectedFish)}>{'Deposit'}</GameButton>
						{/* <GameButton onClick={() => startFightFish(mySelectedFish)}>{'Use in Fight'}</GameButton> */}
						<GameButton onClick={() => selectAnother()}>{'Back to Fish'}</GameButton>
					</OptionsContainer>
					}
					<Menu name={viewToShow} onClick={setView} items={ModeOptions}></Menu>
					<FishViewer selectedFish={mySelectedFish} fishCollection={userFish} onClick={setUserFish}></FishViewer>
			</Container>
		} 
		{/* Staked Fish*/}
		
		</>
	);
};

interface GridProps {
	ref?: any;
}

const Container = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	width: 100%;
	height: 100%;
`


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

const FishGrid = styled.div<GridProps>`
	display: flex;
	flex-direction: row nowrap;
	justify-content: space-between;
	height: 72%;
	overflow-y: hidden;
	overflow-x: hidden;
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



export default UserFightingWaters;
