// React
import React, { Fragment, useState, useEffect } from 'react';

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



const catchRates = [
	{value: 100, chance: "100%"},
	{value: 50, chance: "~25%"},
	{value: 25, chance: "~6.25%"},
	{value: 5, chance: "~1.25%"}
];

const CatchFish = () => {
	const unityContext = useUnity()
	const { FishFight, refetchBalance, refetchUserFish} = useFishFight()
	const [caughtFish, setCaughtFish] = useState<Fish | null>(null);

	// Name of the fish that the user is creating/minting
	const [fishName, setFishName] = useState("Fishy")

	// Contract balance
	const [contractBalance, setContractBalance] = useState("");
	console.log("Contract Balance: " + contractBalance)

	// Context
	const { account } = useWeb3React();

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
		const newFish = new Fish(
			tokenId,
			new BN(fishInfo.fishTypeIndex).toNumber(),
			fishInfo.name,
			new BN(fishInfo.birth).toNumber(),
			new BN(fishInfo.strength).toNumber(),
			new BN(fishInfo.intelligence).toNumber(),
			new BN(fishInfo.agility).toNumber(),
			new BN(fishInfo.wins).toNumber(),
			new BN(fishInfo.challenger).toNumber(),
			new BN(fishInfo.challenged).toNumber(),
			fishInfo.traitsA,
			fishInfo.traitsB,
			fishInfo.traitsC
		);
		setCaughtFish(newFish)
		//unityContext.fishCaught(newFish);
		//unityContext.stopRotation();
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFishName(e.target.value);
	}

	const handleClickCatch = (value: number) => async () => {
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
						refetchUserFish()
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
		if(caughtFish) {
			return (
				<div>
					<FishNFT onClick={handleFishClick(caughtFish.tokenId)}>
						<FishData>{caughtFish.birth}</FishData>
						<FishData>Strength: {caughtFish.strength} Intelligence: {caughtFish.intelligence} Agility: {caughtFish.agility}</FishData>
					</FishNFT>

					<CatchFishButton onClick={() => {setCaughtFish(null)}}>
						Catch another fish!
					</CatchFishButton>
				</div>
			)
		}

		return (
			<div>
				<h2>Cast a Line!</h2>
				<p>What type of bait do you want?</p>
				{catchRates.map((rate, index) => (
					<CatchFishButton key={index} onClick={handleClickCatch(rate.value)}>
						{rate.chance} Cast  {rate.value} ONE
					</CatchFishButton>
				))}
			</div>
		)
	}

	return (
		<>
			<CreateFishComponent>
				<FishingOptions />
			</CreateFishComponent>
		</>
	);
};


const CreateFishComponent = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 50%;
`;

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: -10vh;
	padding: 40px 60px;
	border-radius: 25px;
	width: 100%;
	background-color: white;
	box-shadow: 2px 8px 10px 4px rgba(0, 0, 0, 0.3);
	color: #a70000;
	font-size: 1.5rem;
`;

const FlexGrid = styled.div`
	display: flex;
	flex-flow: row wrap;
	justify-content: center;
	width: 100%;
`;

const FishNFT = styled.div`
	flex: 1;
	border-radius: 25px;
	width: 100%;
	padding: 15px;
	background-color: white;
	box-shadow: 2px 8px 10px 4px rgba(0, 0, 0, 0.3);
`;

const FishName = styled.h3`
	color: ${"black"};
`;

const FishData = styled.p`
	color: ${"black"};
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

const TotalStaked = styled.div`
	font-size: 3.5rem;
	margin-top: 16px;
	color: black;
`;

export default CatchFish;
