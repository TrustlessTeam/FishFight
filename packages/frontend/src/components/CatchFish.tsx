// React
import React, { Fragment, useState, useEffect, useCallback } from 'react';

// Styled Components
import styled from 'styled-components';

// Toast
import { toast } from 'react-toastify';

// Web3
import { useWeb3React } from '@web3-react/core';

// Big Number
import BN from 'bn.js';

// Harmony SDK
import { numberToString, fromWei, hexToNumber, Units, Unit } from '@harmony-js/utils';
import Unity from 'react-unity-webgl';
// Utils
import { Fish } from '../utils/fish'
import { useFishFight } from '../context/fishFightContext';
import { useUnity } from '../context/unityContext';
import { useFishPool } from '../context/fishPoolContext';
import FishNFT from './FishNFT';

type Props = {
  children?: React.ReactNode;
};


const catchRates = [
	{value: 100, chance: "100%"},
	{value: 50, chance: "~25%"},
	{value: 25, chance: "~6.25%"},
	{value: 5, chance: "~1.25%"}
];

const CatchFish = ({ children }: Props) => {
	const unityContext = useUnity()
	const { FishFight, refetchBalance } = useFishFight()
	const { addUserPoolTokenId } = useFishPool();
	const [caughtFish, setCaughtFish] = useState<Fish | null>(null);
	const [caughtFishHash, setCaughtFishHash] = useState<string | null>(null);


	// Name of the fish that the user is creating/minting
	const [fishName, setFishName] = useState("Fishy")

	// Contract balance
	const [contractBalance, setContractBalance] = useState("");
	console.log("Contract Balance: " + contractBalance)

	// Context
	const { account } = useWeb3React();

	useEffect(() => {
		console.log("Calling Show Fishing")
		// FishFight.factory.events.FishMinted(function(error: any, event: any){ console.log("THE EVENT ", event); })
		unityContext.showFishing();
	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		unityContext.UnityInstance.on('UISelectionConfirm', function (data: any) {
			console.log('UI changed catch fish');
			console.log(data)
			switch (data) {
				case 'mint_fish_5p':
					mintFish(5, account);
					return;
				case 'mint_fish_25p':
					mintFish(25, account);
					return;
				case 'mint_fish_50p':
					mintFish(50, account);
					return;
				case 'mint_fish_75p':
					mintFish(100, account);
					return;
				default:
					return;
			}
		});
	}, [unityContext.isFishPoolReady]);

	// Get contract balance and parse it to One
	const getContractBalance = async () => {
		try {
			const balance = await FishFight.factory.methods.getContractBalance().call();
			const parsedBalance = fromWei(balance, Units.one);
			setContractBalance(parsedBalance);
		} catch (error) {
			console.error(error);
		}
		return null
	};

	const getUserFish = async (tokenId: number) => {
		const fishInfo = await FishFight.factory.methods.getFishInfo(tokenId).call();
		console.log(fishInfo)
		const newFish = new Fish(
			tokenId,
			new BN(fishInfo.fishTypeIndex).toNumber(),
			fishInfo.name,
			new BN(fishInfo.birth).toNumber(),
			hexToNumber(fishInfo.strength),
			hexToNumber(fishInfo.intelligence),
			hexToNumber(fishInfo.agility),
			new BN(fishInfo.wins).toNumber(),
			new BN(fishInfo.challenger).toNumber(),
			new BN(fishInfo.challenged).toNumber(),
			fishInfo.traitsA,
			fishInfo.traitsB,
			fishInfo.traitsC
		);
		console.log(newFish)
		setCaughtFish(newFish)

		// unityContext.setFishModeCatching();
		unityContext.addFish(newFish);

		// addUserPoolTokenId(newFish.tokenId)
		// unityContext.setFishModeOcean();
		// unityContext.addFish(newFish);
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFishName(e.target.value);
	}

	const mintFish = useCallback(async (value: number, account: string | null | undefined)=>{
		console.log(account)
		if (account) {
			console.log("catch fish")
			try {
				const fish = await FishFight.factory.methods.catchFish().send({
					from: account,
					gasPrice: 1000000000,
					gasLimit: 500000,
					value: new Unit(value).asOne().toWei(),
				});
				console.log(fish)
				setCaughtFishHash(fish.transactionHash)
				const returnedTokenId = new BN(fish.events.Transfer.returnValues.tokenId).toNumber()
				getUserFish(returnedTokenId);
				toast.success('Transaction done', {
					onClose: async () => {
						getContractBalance()
						refetchBalance()
					},
				});
			} catch (error: any) {
				toast.error(error);
			}
		} else {
			toast.error('Connect your wallet');
		}
	}, []);

	const handleClickCatch = (value: number) => async () => {
		console.log("in caught")
		if (account) {
			try {
				const fish = await FishFight.factory.methods.catchFish().send({
					from: account,
					gasPrice: 1000000000,
					gasLimit: 500000,
					value: new Unit(value).asOne().toWei(),
				});
				const returnedTokenId = new BN(fish.events.Transfer.returnValues.tokenId).toNumber()
				getUserFish(returnedTokenId);
				toast.success('Transaction done', {
					onClose: async () => {
						getContractBalance()
						refetchBalance()
					},
				});
			} catch (error) {
				// toast.error(error);
			}
		} else {
			toast.error('Connect your wallet');
		}
		return null
	};

	const handleFishClick = (tokenId: number) => async () => {
		const tokenUri = await FishFight.factory.methods.tokenURI(tokenId).call();
		console.log(tokenUri)
	}

	const FishingOptions = () => {
		if(caughtFish && caughtFishHash) {
			return (
				<div>
					<CaughtFish>
						<FishData><b>Token ID: {caughtFish.tokenId}</b></FishData>
						<FishData>Strength: {caughtFish.strength}</FishData>
						<FishData>Intelligence: {caughtFish.intelligence}</FishData>
						<FishData>Agiltiy: {caughtFish.agility}</FishData>
						<TransactionLink target="_blank" href={`https://explorer.pops.one/tx/${caughtFishHash}`}>View Transaction</TransactionLink>
					</CaughtFish>

					<GameButton onClick={() => {
						setCaughtFish(null);
						setCaughtFishHash(null);
					}}>
						Catch another fish!
					</GameButton>
				</div>
			)
		}
		return null;

		// return (
		// 	<FishingContainer>
		// 		<Text>Catch a fish! Select the amount of ONE to use as bait!</Text>
		// 		<OptionsContainer>
		// 			{catchRates.map((rate, index) => (
		// 				<GameButton key={index} onClick={handleClickCatch(rate.value)}>
		// 					Bait with {rate.value} ONE<br></br>{rate.chance} catch rate
		// 				</GameButton>
		// 			))}
		// 		</OptionsContainer>
		// 	</FishingContainer>
			
		// )
	}

	return (
		<FishingOptions />
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
	/* width: 100%; */
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


const FishingContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-end;
	width: 100%;
`;

const Text = styled.p`
	padding: ${props => props.theme.spacing.gap};
	margin: 0;
	background-color: white;
	font-size: ${props => props.theme.font.large}vmin;
	border-radius: 25px;
	margin: ${props => props.theme.spacing.gap} 0;
`;

const OptionsContainer = styled.div`
	display: flex;
	flex-direction: row nowrap;
	align-items: center;
	justify-content: space-evenly;
	width: 100%;
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


const CatchFishButton = styled.button`
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: rgba(255, 255, 255, 0.7);
	color: black;
	padding: 20px 20px;
	border-radius: 10px;
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


export default CatchFish;
