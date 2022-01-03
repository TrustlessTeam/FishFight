import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';

import { useHarmony } from '../context/harmonyContext';
import { useFishFight } from '../context/fishFightContext';
import fishImg from "../img/icons/fish.svg"
import deadImg from "../img/icons/dead.svg"
import foodImg from "../img/icons/food.svg"


const SeasonStatus = () => {
	const { currentSeason, currentPhaseEndTime, FishFight } = useFishFight();
	const { account } = useWeb3React();

	if (!currentSeason) return null;
	// console.log(currentPhaseEndTime)
	// console.log(currentSeason)

	const nextPhase = async () => {
		if(!account) return;
		await FishFight.seasons?.methods.ownerPhaseOverride().send({
			from: account,
			gasPrice: 1000000000,
			gasLimit: 500000,
		})
		// refetchSeason();
	}

	return (
		<SeasonStatusContainer>
			{/* <StatusComponent>
				<b>{balance.split('.')[0]}</b> <span>ONE</span>
			</StatusComponent> */}
			<StatusComponent title="">
				<StatusText>{`Season: `}</StatusText>
				<StatusText>{`${currentSeason.index}`}</StatusText>
				{/* <LogoImg src={fishImg} alt="FISH" ></LogoImg> */}
			</StatusComponent>
			<StatusComponent title="">
				<StatusText>{`Phase: `}</StatusText>
				<StatusText>{`${currentSeason.phaseString}`}</StatusText>

				{/* <LogoImg src={deadImg} alt="DEADFISH"></LogoImg> */}
			</StatusComponent>
			<StatusComponent onClick={nextPhase} title="">
				<StatusText>{`Next:`}</StatusText>
				<StatusText>{`${currentPhaseEndTime?.toLocaleString()}`}</StatusText>
				{/* <LogoImg src={foodImg} alt="FISHFOOD"></LogoImg> */}
			</StatusComponent>
		</SeasonStatusContainer>
		
	);
};

const SeasonStatusContainer = styled.div`
	display: flex;
	flex-flow: column;
	align-items: flex-start;
	justify-content: center;
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
	pointer-events: auto;
`;

const LogoImg = styled.img`
	height: 100%;
`;

export default SeasonStatus;
