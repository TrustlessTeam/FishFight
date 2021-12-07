import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';

import { useFishPool } from '../context/fishPoolContext';
import { useFishFight } from '../context/fishFightContext';
import { useUnity } from '../context/unityContext';
import useHorizontalScroll from "../utils/horizontalScrolling";
import Account from './Account';
import FishViewer from './FishViewer';

enum FishToShow {
  Public,
  User
}

const Ocean = () => {
	const { userFish, oceanFish, arePublicFishLoaded, areUserFishLoaded } = useFishPool();
	const [fishToShow, setFishToShow] = useState<FishToShow>(FishToShow.Public);
	const [renderedFish, setRenderedFish] = useState<number[]>([]);
	const unityContext = useUnity();
	const { userConnected } = useFishFight();

	useEffect(() => {
		console.log("CLEAR OCEAN")
		unityContext.clearFishPool('ShowOcean')
	}, []);

	useEffect(() => {
		console.log("Account changed")
		if(userConnected) {
			setFishToShow(FishToShow.User)
		} else {
			setFishToShow(FishToShow.Public)
		}
	}, [userConnected]);

	useEffect(() => {
		console.log("Ocean Fish Changed")
		// console.log(oceanFish)
		if(!unityContext.isFishPoolReady) return;
		let i = 0;
		oceanFish.forEach(fish => {
			if(!renderedFish.includes(fish.tokenId)) {
				unityContext.addFishOcean(fish);
				setRenderedFish(prevData => [...prevData, fish.tokenId])
				i++;
			}
		})
		console.log(i)
	}, [oceanFish, unityContext.isFishPoolReady]);

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

		<OceanContainer>
				{/* <HighLevelOptions>

				</HighLevelOptions> */}
				<FishViewerButtons>
					{fishToShow == FishToShow.Public ? <Text>Public Fish</Text> : <Text>Your Fish</Text>}
					{fishToShow == FishToShow.Public && !arePublicFishLoaded &&
						<Text>Loading public fish...</Text>
					}
					{fishToShow == FishToShow.User && userConnected && !areUserFishLoaded &&
						<Text>Loading your fish...</Text>
					}
					{userConnected ?
					<GameButton onClick={() => setFishToView()}>{fishToShow == FishToShow.Public ? "Show my Fish" : "Show public Fish"}</GameButton>
					:
					<Account/>
					}
					{fishToShow == FishToShow.User && userConnected && areUserFishLoaded && userFish?.length == 0 &&
						<CatchButton to={'/catch'}>Catch a Fish!</CatchButton>
					}
					
				</FishViewerButtons>

				<FishViewer fishCollection={fishToShow == FishToShow.Public ? oceanFish : userFish} onClick={unityContext.showFish}></FishViewer>
		</OceanContainer>
		
	);
};

interface GridProps {
	ref?: any;
}

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
	display: flex;
	flex-flow: column;
	justify-content: center;
	padding: 0 1vmin;
	border-radius: 25px;
	background-color: white;
	border: none;
	opacity: 0.7;
	box-shadow: 1px 2px 4px 4px rgba(0, 0, 0, 0.25);
	color: black;
	margin-top: 0;
	margin-bottom: 0;
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

const OceanContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	width: 100%;
	height: 100%;
	/* pointer-events: auto; */
`;

const FishViewerButtons = styled.div`
	display: flex;
	flex-flow: row nowrap;
	/* height: 17%; */
	pointer-events: auto;

`;

const FishGrid = styled.div<GridProps>`
	display: flex;
	flex-direction: row nowrap;
	justify-content: space-between;
	height: 72%;
	overflow-y: hidden;
	overflow-x: hidden;
`;


export default Ocean;
