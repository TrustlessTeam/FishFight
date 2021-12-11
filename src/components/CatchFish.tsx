import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useWeb3React } from '@web3-react/core';
import BN from 'bn.js';
import { hexToNumber, Unit } from '@harmony-js/utils';

import { Fish } from '../utils/fish'
import { useFishFight } from '../context/fishFightContext';
import { useUnity } from '../context/unityContext';
import { useFishPool } from '../context/fishPoolContext';
import web3 from 'web3';

// const catchRates = [
// 	{value: 1000, chance: "100%"},
// 	{value: 100, chance: "~10%"},
// 	{value: 50, chance: "~5%"},
// 	{value: 25, chance: "~2.5%"}
// ];

const CatchFish = () => {
	const unityContext = useUnity()
	const { account } = useWeb3React();
	const { FishFight, refetchBalance } = useFishFight()
	const { addUserFish} = useFishPool();
	const [caughtFish, setCaughtFish] = useState<Fish | null>(null);
	const [caughtFishHash, setCaughtFishHash] = useState<string | null>(null);
	const [noCatch, setNoCatch] = useState<boolean>(false);
	const [currentPhase, setCurrentPhase] = useState<string>('');

	useEffect(() => {
		unityContext.showFishing();
		getSeason()
	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		unityContext.clearFishPool('ShowFishing');
	}, []);

	useEffect(() => {
		unityContext.UnityInstance.on('UISelectionConfirm', function (data: any) {
			console.log('UI changed catch fish');
			console.log(data)
			mintFish(100);
			return;
		});
	}, [unityContext.isFishPoolReady]);

	const getUserFish = async (tokenId: number) => {
		console.log(tokenId)
		const fishInfo = await FishFight.readFishFactory.methods.getFishInfo(tokenId).call();
		console.log(fishInfo)
		const newFish = new Fish(
			fishInfo.tokenId,
      fishInfo.birthTime,
      fishInfo.genes,
      fishInfo.fishType,
      fishInfo.rarity,
      fishInfo.strength,
      fishInfo.intelligence,
      fishInfo.agility,
      fishInfo.cooldownMultiplier,
      fishInfo.lifetimeWins,
      fishInfo.lifetimeAlphaBreeds,
      fishInfo.lifetimeBettaBreeds,
      fishInfo.parentA,
      fishInfo.parentB,
      fishInfo.breedKey,
      fishInfo.deathTime
		);
		console.log(newFish)
		setCaughtFish(newFish)
		unityContext.addFishFishing(newFish);
		addUserFish(newFish)
	}


	const mintFish = async (value: number) => {
		console.log(account)
		
		if (account) {
			if(FishFight.type == 'web3') {
				const provider = FishFight.provider as web3;
				if(await provider.eth.getChainId() != 1666700000) {
					toast.error('Wrong Network');
					return;
				}
			}
			console.log("catch fish")
			setNoCatch(false);
			setCaughtFish(null);
			setCaughtFishHash(null);
			unityContext.clearFishPool('ShowFishing');
			try {
				const currentBlockNum = await FishFight.provider.eth.getBlockNumber();
				console.log(currentBlockNum)
				
				const fish = await FishFight.fishingWaters?.methods.goFishing().send({
					from: account,
					gasPrice: 1000000000,
					gasLimit: 500000,
					value: new Unit(value).asOne().toWei()
				});
				console.log(fish)
				if(fish.events.FishingResult.returnValues.index == 0) {
					console.log("set no catch")
					setNoCatch(true);
				} else {
					setCaughtFishHash(fish.transactionHash)
					// const returnedTokenId = new BN().toNumber()
					getUserFish(fish.events.FishingResult.returnValues.index);
				}

				toast.success('Transaction done', {
					onClose: async () => {
						refetchBalance()
					},
				});
			} catch (error: any) {
				toast.error(error);
				console.log(error)
			}
		} else {
			toast.error('Connect your wallet');
		}
	};

	const getSeason = async () => {
		let seasonPhase = await FishFight.readSeasons.methods.getCurrentSeasonPhase().call();
		console.log(seasonPhase)
		switch (web3.utils.toNumber(seasonPhase)) {
			case 1:
				setCurrentPhase('FISHING')
				break;
			case 2:
				setCurrentPhase('FIGHTING')
				break;
			case 3:
				setCurrentPhase('BREEDING')
				break;
			default:
				break;
		}
		
	}


	return (
		<>
		<h1>{currentPhase}</h1>
		{caughtFish && caughtFishHash &&
			<>
				<CaughtFish>
					<FishData><b>Token ID: {caughtFish.tokenId}</b></FishData>
					<FishData>Strength: {caughtFish.strength}</FishData>
					<FishData>Intelligence: {caughtFish.intelligence}</FishData>
					<FishData>Agiltiy: {caughtFish.agility}</FishData>
					<FishData>Rarity: {caughtFish.rarity}</FishData>
					<TransactionLink target="_blank" href={`https://explorer.pops.one/tx/${caughtFishHash}`}>View Transaction</TransactionLink>
				</CaughtFish>

				<GameButton onClick={() => {
					setCaughtFish(null);
					setCaughtFishHash(null);
					unityContext.clearFishPool('ShowFishing');
				}}>
					Catch another fish!
				</GameButton>
			</>
		}
		
		{noCatch &&
			<MissedCatchContainer>
				<CaughtFish>
					<Text>Sorry... It got away!</Text>
				</CaughtFish>

				<GameButton onClick={() => {
					setCaughtFish(null);
					setCaughtFishHash(null);
					setNoCatch(false)
					unityContext.clearFishPool('ShowFishing');
				}}>
					Try again!
				</GameButton>
			</MissedCatchContainer>
		}
		
		</>
	);
};

const CaughtFish = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background-color: white;
	padding: ${props => props.theme.spacing.gap};
	margin: ${props => props.theme.spacing.gap};
	border-radius: 25px;
`;

const TransactionLink = styled.a`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;

const FishData = styled.p`
	display: flex;
	flex-flow: column;
	align-items: center;
	justify-content: center;
	color: ${"black"};
	text-align: center;
	font-size: ${props => props.theme.font.medium}vmin;
	background-color: rgba(255, 255, 255, 0.7);
	margin: 0 ${props => props.theme.spacing.gapSmall};
	padding: ${props => props.theme.spacing.gapSmall};
	border-radius: 50%;
	height: ${props => props.theme.font.small}vmin;
`;

const MissedCatchContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	height: 100%;
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

const GameButton = styled.button`
	text-align: center;
	padding: ${props => props.theme.spacing.gap};
	border-radius: 25px;
	background-color: white;
	opacity: 0.7;
	border: none;
	box-shadow: 1px 2px 4px 4px rgba(0, 0, 0, 0.25);
	color: black;
	margin-left: ${props => props.theme.spacing.gapSmall};
	transition: opacity 0.3s ease, box-shadow 0.25s ease-in-out;
	text-transform: uppercase;
	font-weight: bolder;
	text-decoration: none;
	font-size: ${props => props.theme.font.large}vmin;

	&:hover {
		opacity: 1;
		box-shadow: 1px 2px 2px 2px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}
`;

export default CatchFish;
