// React
import React, { useState, useEffect } from 'react';

// Styled Components
import styled from 'styled-components';

// Utils
import { Fish } from '../utils/fish'
import { useFishFight } from '../context/fishFightContext';
import { useUnity } from '../context/unityContext';
import Account from '../components/Account';

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

	return (
		<>
			<FishListContainer>
				<h2>Your Fish</h2>
				{userFish ? 
				<FishList>
				{userFish?.map((fish, index) => (
						<FishNFT  key={index}>
							<FishName>Token Id: {fish.tokenId}</FishName>
								<FishData>Strength: {fish.strength}</FishData>
								<FishData>Intelligence: {fish.intelligence}</FishData>
								<FishData>Agility: {fish.agility}</FishData>
								<FishData>Wins: {fish.wins}</FishData>
						</FishNFT>
					))}
				</FishList>
				:
				<Account />
				}
			</FishListContainer>
			<PublicFishListContainer>
				<h2>Public Fish</h2>
				<FishList>
				{publicFish?.map((fish, index) => (
						<FishNFT  key={index}>
							<FishData>Strength: {fish.strength}</FishData>
							<FishData>Intelligence: {fish.intelligence}</FishData>
							<FishData>Agility: {fish.agility}</FishData>
							<FishData>Wins: {fish.wins}</FishData>
						</FishNFT>
					))}
				</FishList>
			</PublicFishListContainer>
		</>
		
	);
};

const Container = styled.div`
	display: flex;
	width: 100vw;
	flex-direction: row nowrap;
	justify-content: space-evenly;
	padding-top: 5vh;
`;

const FishListContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	max-width: 20vw;
	order: -1;
	max-height: 80vh;
	overflow: auto;
`;

const PublicFishListContainer = styled(FishListContainer)`
	order: 1;
`;

const FishList = styled.div`
	display: flex;
	flex-flow: column;
	justify-content: space-evenly;
	width: 100%;
`;

const FishNFT = styled.div`
	display: flex;
	flex-flow: column;
	justify-content: center;
	align-items: center;
	border-radius: 25px;
	width: 100%;
	/* padding: 15px; */
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
