// React
import React, { useState, useEffect } from 'react';

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

// Utils
import { Fish } from '../utils/fish'
import { useFishFight } from '../context/fishFightContext';
import { useUnity } from '../context/unityContext';


const ViewFish = () => {
	const { FishFight, userFish, refetchUserFish, publicFish, refetchPublicFish } = useFishFight()

	const unityContext = useUnity();

	useEffect(() => {
		unityContext.showOcean();
	}, [userFish, publicFish]);

	useEffect(() => {
		if(publicFish) {
			unityContext.addFish(publicFish[0]);
		}
	}, [publicFish]);

	if(!userFish) {
		return(
			<CreateFishComponent>
				<h1>Viewing Public Fish</h1>
				<FlexGrid>
				{publicFish?.map((fish, index) => (
						<FishNFT  key={index}>
							<FishData>Strength: {fish.strength}</FishData>
							<FishData>Intelligence: {fish.intelligence}</FishData>
							<FishData>Agility: {fish.agility}</FishData>
							<FishData>Wins: {fish.wins}</FishData>
						</FishNFT>
					))}
				</FlexGrid>
			</CreateFishComponent>
		)
		
	}
	return (
		<CreateFishComponent>
			<h1>Viewing Your Fish</h1>
			<FlexGrid>
			{userFish?.map((fish, index) => (
					<FishNFT  key={index}>
						<FishName>Token Id: {fish.tokenId}</FishName>
							<FishData>Strength: {fish.strength}</FishData>
							<FishData>Intelligence: {fish.intelligence}</FishData>
							<FishData>Agility: {fish.agility}</FishData>
							<FishData>Wins: {fish.wins}</FishData>
					</FishNFT>
				))}
			</FlexGrid>
		</CreateFishComponent>
	);
};



const CreateFishComponent = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
`;

const FlexGrid = styled.div`
	display: flex;
	flex-flow: row wrap;
	justify-content: space-evenly;
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


export default ViewFish;
