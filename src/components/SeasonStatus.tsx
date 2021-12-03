import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';

import { useHarmony } from '../context/harmonyContext';
import { useFishFight } from '../context/fishFightContext';
import fishImg from "../img/icons/fish.svg"
import deadImg from "../img/icons/dead.svg"
import foodImg from "../img/icons/food.svg"


const SeasonStatus = () => {
	const { balance, balanceFish, balanceDeadFish, balanceFood  } = useFishFight();

	if (!balance) return null;

	return (
		<Balances>
			{/* <BalanceComponent>
				<b>{balance.split('.')[0]}</b> <span>ONE</span>
			</BalanceComponent> */}
			<BalanceComponent title="FISH Balance">
				<BalanceText>{balanceFish}</BalanceText>
				<LogoImg src={fishImg} alt="FISH" ></LogoImg>
			</BalanceComponent>
			<BalanceComponent title="DEADFISH Balance">
				<BalanceText>{balanceDeadFish}</BalanceText>
				<LogoImg src={deadImg} alt="DEADFISH"></LogoImg>
			</BalanceComponent>
			<BalanceComponent title="FISHFOOD Balance">
				<BalanceText>{balanceFood}</BalanceText>
				<LogoImg src={foodImg} alt="FISHFOOD"></LogoImg>
			</BalanceComponent>
		</Balances>
		
	);
};

const Balances = styled.div`
	display: flex;
	flex-flow: row;

`;

const BalanceText = styled.b`
	display: flex;
	flex-flow: column;
	justify-content: center;
	align-items: center;
	margin-right: ${props => props.theme.spacing.gapSmall};
	cursor: default;
`;

const BalanceComponent = styled.div`
	display: flex;
	flex-flow: row;
	justify-content: center;
	font-size: ${props => props.theme.font.large}vmin;
	margin-left: ${props => props.theme.spacing.gap};
	padding: ${props => props.theme.spacing.gap} ${props => props.theme.spacing.gap};
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
