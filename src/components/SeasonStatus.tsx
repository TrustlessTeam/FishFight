import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';

import { useHarmony } from '../context/harmonyContext';
import { useFishFight } from '../context/fishFightContext';
import fishImg from "../img/icons/fish.svg"
import deadImg from "../img/icons/dead.svg"
import foodImg from "../img/icons/food.svg"


const SeasonStatus = () => {
	const { currentSeason, currentPhaseEndTime } = useFishFight();

	if (!currentSeason) return null;
	console.log(currentPhaseEndTime)
	console.log(currentSeason)

	return (
		<SeasonStatusContainer>
			{/* <StatusComponent>
				<b>{balance.split('.')[0]}</b> <span>ONE</span>
			</StatusComponent> */}
			<StatusComponent title="">
				<StatusText>{`Season ${currentSeason.index}`}</StatusText>
				{/* <LogoImg src={fishImg} alt="FISH" ></LogoImg> */}
			</StatusComponent>
			<StatusComponent title="">
				<StatusText>{`Phase ${currentSeason.phaseString}`}</StatusText>
				{/* <LogoImg src={deadImg} alt="DEADFISH"></LogoImg> */}
			</StatusComponent>
			<StatusComponent title="">
				<StatusText>{`Phase End ${currentPhaseEndTime?.toLocaleString()}`}</StatusText>
				{/* <LogoImg src={foodImg} alt="FISHFOOD"></LogoImg> */}
			</StatusComponent>
		</SeasonStatusContainer>
		
	);
};

const SeasonStatusContainer = styled.div`
	display: flex;
	flex-flow: row;

`;

const StatusText = styled.b`
	display: flex;
	/* flex-flow: column;
	justify-content: center;
	align-items: center; */
	margin-right: ${props => props.theme.spacing.gapSmall};
	cursor: default;
`;

const StatusComponent = styled.div`
	display: flex;
	flex-flow: row;
	justify-content: center;
	font-size: ${props => props.theme.font.small}vmin;
	margin-left: ${props => props.theme.spacing.gap};
	/* padding: ${props => props.theme.spacing.gap} ${props => props.theme.spacing.gap}; */
	/* background-color: white; */
	color: white;
	/* border: 2px solid white; */
	border-radius: 50%;

	& > span {
		margin-left: 4px;
	}
`;

const LogoImg = styled.img`
	height: 100%;
`;

export default SeasonStatus;
