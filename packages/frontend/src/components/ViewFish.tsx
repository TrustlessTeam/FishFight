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

const ViewFish = () => {
	const { FishFight, userFish, refetchUserFish, publicFish, refetchPublicFish } = useFishFight()

	if(!userFish) {
		return(
			<CreateFishComponent>
				<h1>Public Fish: {publicFish?.length}</h1>
				<FlexGrid>
				{publicFish?.map((fish, index) => (
						<FishNFT  key={index}>
							<FishName>{fish.name}</FishName>
							<FishData>{fish.birth}</FishData>
							<FishData>Strength: {fish.strength} Intelligence: {fish.intelligence} Agility: {fish.agility}</FishData>
						</FishNFT>
					))}
				</FlexGrid>
			</CreateFishComponent>
		)
		
	}
	return (
		<CreateFishComponent>
			<h1>Fished Owned: {userFish?.length}</h1>
			<FlexGrid>
			{userFish?.map((fish, index) => (
					<FishNFT  key={index}>
						<FishName>{fish.name}</FishName>
						<FishData>{fish.birth}</FishData>
						<FishData>Strength: {fish.strength} Intelligence: {fish.intelligence} Agility: {fish.agility}</FishData>
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

export default ViewFish;
