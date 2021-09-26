// React
import React, { useState, useEffect } from 'react';

// Styled Components
import styled from 'styled-components';

// Utils
import { Fish } from '../utils/fish'
import { useFishFight } from '../context/fishFightContext';
import { useUnity } from '../context/unityContext';
import Account from '../components/Account';
import FishNFT from './FishNFT';

enum FishToShow {
  Public,
  User
}


const ViewFish = () => {
	const { FishFight, userFish, publicFish } = useFishFight();
	const [fishToShow, setFishToShow] = useState<FishToShow>(FishToShow.Public);
	const unityContext = useUnity();

	useEffect(() => {
		// add function to clear fish pool
		unityContext.clearFishPool();
		// unityContext.showOcean();
		console.log("adding fish from public Fish")
		publicFish.forEach(fish => {
			unityContext.addFish(fish);
		});

		console.log("adding fish from user Fish")
		userFish.forEach(fish => {
			unityContext.addFish(fish);
		});
		
	}, [userFish, publicFish]);

	useEffect(() => {
		unityContext.showOcean();
	}, [unityContext.isFishPoolReady]);

	const setFishToView = () => {
		if(fishToShow == FishToShow.Public) {
			setFishToShow(FishToShow.User)
		}
		else {
			setFishToShow(FishToShow.Public)
		}
	}

	return (
		<FishViewerContainer>
				<FishViewerButtons>
					<GameButton onClick={() => setFishToView()}>{fishToShow == FishToShow.Public ? "Show my Fish" : "Show public Fish"}</GameButton>
				</FishViewerButtons>

				<FishGrid>
				{fishToShow == FishToShow.Public &&
					publicFish?.map((fish, index) => (
						<FishNFT fish={fish} key={index}></FishNFT>
					))
				}
				{fishToShow == FishToShow.User &&
					userFish?.map((fish, index) => (
						<FishNFT fish={fish} key={index}></FishNFT>
					))
				}
				</FishGrid>
		</FishViewerContainer>
		
	);
};

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


export default ViewFish;
