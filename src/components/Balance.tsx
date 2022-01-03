import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';

import { useHarmony } from '../context/harmonyContext';
import { useFishFight } from '../context/fishFightContext';
import fishImg from "../img/icons/fish.svg"
import deadImg from "../img/icons/dead.svg"
import foodImg from "../img/icons/food.svg"


const Balance = () => {
	const { balance, balanceFish, balanceDeadFish, balanceFood, balanceFightFish, balanceBreedFish  } = useFishFight();

	if (!balance) return null;

	return (
		<Balances>
			<BalanceComponent>
				<b>{balance.split('.')[0]}</b> <span>ONE</span>
			</BalanceComponent>
			<BalanceComponent title="FISH Balance">
				<BalanceText>
					{balanceFish}<LogoImg src={fishImg} alt="FISH" ></LogoImg>
				</BalanceText>
			</BalanceComponent>
			<BalanceComponent title="DEADFISH Balance">
				<BalanceText>
					{balanceDeadFish}<LogoImg src={deadImg} alt="DEADFISH"></LogoImg>
				</BalanceText>
			</BalanceComponent>
			<BalanceComponent title="FISHFOOD Balance">
				<BalanceText>
					{parseFloat(balanceFood ? balanceFood : '0').toFixed(2)}<LogoImg src={foodImg} alt="FISHFOOD"></LogoImg>
				</BalanceText>
			</BalanceComponent>
			<BalanceComponent title="FIGHTFISH Balance">
				<BalanceText>
					{balanceFightFish}<LogoImg src={fishImg} alt="FIGHTFISH"></LogoImg>F
				</BalanceText>
			</BalanceComponent>
			<BalanceComponent title="BREEDFISH Balance">
				<BalanceText>
					{balanceBreedFish}<LogoImg src={fishImg} alt="BREEDFISH"></LogoImg>B
				</BalanceText>
			</BalanceComponent>
		</Balances>
		
	);
};

const Balances = styled.div`
	display: flex;
	flex-flow: column;
	align-items: flex-end;
`;

const BalanceText = styled.b`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
	/* margin-right: ${props => props.theme.spacing.gapSmall}; */
	cursor: default;
`;

const BalanceComponent = styled.div`
	display: flex;
	flex-flow: row;
	justify-content: center;
	font-size: ${props => props.theme.font.large}vmin;
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
	height: 30px;
	margin-left: ${props => props.theme.spacing.gapSmall};
`;

export default Balance;
