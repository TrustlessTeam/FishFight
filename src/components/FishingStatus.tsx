import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';

import { useHarmony } from '../context/harmonyContext';
import { useFishFight } from '../context/fishFightContext';
import fishImg from "../img/icons/fish.svg"
import deadImg from "../img/icons/dead.svg"
import foodImg from "../img/icons/food.svg"


const FishingStatus = () => {
	const { currentSeason, maxSupply, totalSupply, maxCaught } = useFishFight();
	const { account } = useWeb3React();

	if (!currentSeason) return null;
	// console.log(currentPhaseEndTime)
	// console.log(currentSeason)

	return (
		<Container>
			<Title>Fishing Waters</Title>
			<StatusContainer>
				<StatusComponent title="">
					<StatusText>{`Fish Available: ${maxSupply - totalSupply}`}</StatusText>
				</StatusComponent>
				{currentSeason.phaseString === 'Fishing' ? 
					<StatusComponent title="">
						<StatusText>{`Chance to Catch: ${((maxSupply - totalSupply) / maxSupply) * 100}%`}</StatusText>
					</StatusComponent>
					:
					<StatusComponent title="">
						<StatusText>{`Chance to Catch: ${((maxSupply - totalSupply) / (maxSupply * 2)) * 100}%`}</StatusText>
					</StatusComponent>
				}
				
			</StatusContainer>
		</Container>
	);
};

const Container = styled.div`
	@media ${props => props.theme.device.tablet} {
		display: flex;
		flex-flow: column;
		align-items: center;
  }
`;

const StatusContainer = styled.div`
	display: flex;
	flex-flow: row wrap;
	justify-content: space-evenly;
	align-items: flex-start;
	padding: ${props => props.theme.spacing.gap} ${props => props.theme.spacing.gapSmall};

	@media ${props => props.theme.device.tablet} {
		display: flex;
		flex-flow: column;
		align-items: center;
		flex-flow: column;
		justify-content: center;
		padding: 0;
  }
`;

const Title = styled.h1`
	display: none;
	@media ${props => props.theme.device.tablet} {
		display: block;
	  font-size: ${props => props.theme.font.small};
  }
	text-decoration: underline;
	color: white;
`;

const StatusText = styled.b`
	display: flex;
	cursor: default;
	font-size: ${props => props.theme.font.medium}vmax;
	@media ${props => props.theme.device.tablet} {
	  font-size: ${props => props.theme.font.small};
  }
`;

const StatusComponent = styled.div`
	display: flex;
	flex-flow: row;
	justify-content: center;
	margin-top: ${props => props.theme.spacing.gapSmall};
	/* padding: ${props => props.theme.spacing.gap} ${props => props.theme.spacing.gap}; */
	/* background-color: white; */
	color: white;
	/* border: 2px solid white; */
	border-radius: 50%;

	& > span {
		margin-left: 4px;
	}

	@media ${props => props.theme.device.tablet} {
		margin: 0;
  }
`;

const LogoImg = styled.img`
	height: 100%;
`;

export default FishingStatus;
