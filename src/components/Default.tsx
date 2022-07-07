/* eslint-disable react-hooks/exhaustive-deps */
import { useWeb3React } from '@web3-react/core';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useFishPool } from '../context/fishPoolContext';
import { useUnity } from '../context/unityContext';

import fishingImg from "../img/icons/fishing-dark.svg"
import breedingImg from "../img/icons/breeding-dark.svg"
import fightingImg from "../img/icons/fighting-dark.svg"
import oceanImg from "../img/icons/ocean-dark.svg"

const Default = () => {
	const unityContext = useUnity();
	const { account } = useWeb3React();
	const { oceanFish } = useFishPool();
	const [renderedFish, setRenderedFish] = useState<number[]>([]);
	const [disclaimerApproved, setDisclaimerApproved] = useState<boolean>(false);

	useEffect(() => {
		unityContext.UnityInstance.on('UISelectionConfirm', function (data: any) {
			console.log('UI changed catch fish');
			console.log(data)
			switch (data) {
				case 'disclaimer_confirm':
					setDisclaimerApproved(true)
					return;
				default:
					return;
			}
			
		});
	}, [unityContext.isFishPoolReady, account]);


	useEffect(() => {
		unityContext.showHome();
	}, []);

	useEffect(() => {
		if(!unityContext.isFishPoolReady) return;
		oceanFish.forEach(fish => {
			if(renderedFish.some(prevTokenId => prevTokenId === fish.tokenId)) return;
			unityContext.addFishOcean(fish);
			setRenderedFish(prevTokens => [...prevTokens, fish.tokenId])
		})
	}, [unityContext.isFishPoolReady, oceanFish]);

	return (
	<>
		{disclaimerApproved &&
			<WelcomeWrapper>
				<WelcomeContainer>
					<Item to="/ocean">
						<LogoImg src={oceanImg} alt="Ocean"></LogoImg>
						<Text>Interact with $FISH! Feed, Manage, and Quest your $FISH at the Ocean</Text>
					</Item>
					<Item to="/fishing">
						<LogoImg src={fishingImg} alt="Ocean"></LogoImg>
						<Text>Catch $FISH or $FISHFOOD at the Fishing Waters</Text>
					</Item>
					<Item to="/fighting">
						<LogoImg src={fightingImg} alt="Fighting"></LogoImg>
						<Text>Fight $FISH to earn $FISHFOOD and become an ALPHA at the Fighting Waters</Text>
					</Item>
					<Item to="/breeding">
						<LogoImg src={breedingImg} alt="Breeding"></LogoImg>
						<Text>Breed BETTA and ALPHA $FISH at the Breeding Waters</Text>
					</Item>
				</WelcomeContainer>

			</WelcomeWrapper>
		}
	</>
	);
};

const LogoImg = styled.img`
	height: 50px;
	border-radius: 50%;
  &.active {
    background-color: rgba(255, 255, 255, 0.5);
  }

  @media ${props => props.theme.device.tablet} {
		height: 70px;
  }
`;

const Text = styled.p`
	color: black;
	text-align: center;
	font-size: ${props => props.theme.font.small};

	@media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.medium};
  }
`;

const WelcomeWrapper = styled.div`
	display: flex;
	flex-flow: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
`;

const WelcomeContainer = styled.div`
	display: flex;
	flex-flow: row wrap;
	justify-content: center;
	align-items: flex-start;
`;

const Item = styled(Link)`
	display: flex;
	flex-flow: column;
	justify-content: flex-start;
	align-items: center;
	background-color: rgba(255,255,255,0.7);
	padding: ${props => props.theme.spacing.gap};
	margin: ${props => props.theme.spacing.gap};
	border-radius: 30px;
	pointer-events: auto;
	width: 120px;
	height: 120px;
	text-decoration: none;
  transition: all 0.25s ease-in-out;

	@media ${props => props.theme.device.tablet} {
		width: 160px;
		height: 160px;
  }

	&:hover {
		background-color: rgba(255,255,255,1);
	}
`;

export default Default;
