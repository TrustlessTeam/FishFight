import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';

import { useHarmony } from '../context/harmonyContext';
import { useFishFight } from '../context/fishFightContext';
import fishImg from "../img/icons/fish.svg"
import deadImg from "../img/icons/dead.svg"
import foodImg from "../img/icons/food.svg"
import { useFishPool } from '../context/fishPoolContext';
import Web3 from 'web3';


const StakedStatus = () => {
	const { FishFight } = useFishFight();
	const { userFightingFish } = useFishPool();
	const [pendingAward, setPendingAward] = useState<string>();

	const { account } = useWeb3React();

	useEffect(() => {
		const loadData = async (account: any) => {
      if(!account) return;
			getPendingFood();
    }
		loadData(account);
	}, [account, userFightingFish]);


	if (!account) return null;

	
	const getPendingFood = async () => {
		if(!account) return;
		const result = await FishFight.readFightingWaters.methods.pendingAward(account).call();
		setPendingAward(Web3.utils.fromWei(result));
	}

	return (
		<SeasonStatusContainer>
			{/* <StatusComponent>
				<b>{balance.split('.')[0]}</b> <span>ONE</span>
			</StatusComponent> */}
			<StatusComponent title="">
				<StatusText>{`Staked Fight Fish ${userFightingFish.length}`}</StatusText>
				{/* <LogoImg src={fishImg} alt="FISH" ></LogoImg> */}
			</StatusComponent>
			<StatusComponent title="">
				<StatusText>{`Pending FishFood ${pendingAward}`}</StatusText>
				<Refresh onClick={() => getPendingFood()}>Refresh</Refresh>
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
	font-size: ${props => props.theme.font.small};
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

const Refresh = styled.button`
	pointer-events: auto;
`;

export default StakedStatus;
