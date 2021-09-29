// React
import React, { useState, useEffect } from 'react';

// Styled Components
import styled from 'styled-components';

// Utils
import useHorizontalScroll from "../utils/horizontalScrolling";
import { Fish } from '../utils/fish'
import { useFishFight } from '../context/fishFightContext';
import { useUnity } from '../context/unityContext';
import Account from '../components/Account';
import FishNFT from './FishNFT';
import { useFishPool } from '../context/fishPoolContext';

enum FishToShow {
  Public,
  User
}


const ViewFish = () => {
	const { FishFight } = useFishFight();
	const { userFish, publicFish, arePublicFishLoaded, areUserFishLoaded } = useFishPool();
	const [fishToShow, setFishToShow] = useState<FishToShow>(FishToShow.Public);
	const unityContext = useUnity();

	// useEffect(() => {
	// 	// add function to clear fish pool
	// 	unityContext.showOcean();
	// 	unityContext.clearFishPool();
	// 	if(arePublicFishLoaded) {
	// 		console.log("Adding fish from publicFish")
	// 		publicFish.forEach(fish => {
	// 			unityContext.addFish(fish);
	// 		});
	// 	}
		
	// 	if(areUserFishLoaded) {
	// 		console.log("Adding fish from userFish")
	// 		userFish.forEach(fish => {
	// 			unityContext.addFish(fish);
	// 		});
	// 	}
		
	// }, [arePublicFishLoaded, areUserFishLoaded]);
	useEffect(() => {
		console.log("Fish arrays changed")
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

	const scrollRef = useHorizontalScroll();

	return (
		<FishViewerContainer>
				<FishViewerButtons>
					<GameButton onClick={() => setFishToView()}>{fishToShow == FishToShow.Public ? "Show my Fish" : "Show public Fish"}</GameButton>
				</FishViewerButtons>

				<FishGrid ref={scrollRef}>
				{fishToShow == FishToShow.Public &&
					publicFish?.map((fish, index) => (
						<FishNFT onClick={() => unityContext.showFish(fish)} fish={fish} key={index}></FishNFT>
					))
				}
				{fishToShow == FishToShow.User &&
					userFish?.map((fish, index) => (
						<FishNFT onClick={() => unityContext.showFish(fish)} fish={fish} key={index}></FishNFT>
					))
				}
				</FishGrid>
		</FishViewerContainer>
		
	);
};

interface GridProps {
	ref?: any;
}

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

const FishGrid = styled.div<GridProps>`
	display: flex;
	flex-direction: row nowrap;
	justify-content: space-between;
	height: 72%;
	overflow-y: hidden;
	overflow-x: hidden;
`;


export default ViewFish;
