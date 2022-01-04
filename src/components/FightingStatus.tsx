import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';

import { useHarmony } from '../context/harmonyContext';
import { useFishFight } from '../context/fishFightContext';
import fishImg from "../img/icons/fish.svg"
import deadImg from "../img/icons/dead.svg"
import foodImg from "../img/icons/food.svg"
import { useFishPool } from '../context/fishPoolContext';
import web3 from 'web3';


const FightingStatus = () => {
	const { currentSeason, maxKilled, fightingWatersSupply, FishFight } = useFishFight();
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

	const getPendingFood = async () => {
		if(!account) return;
		const result = await FishFight.readFightingWaters.methods.pendingAward(account).call();
		setPendingAward(web3.utils.fromWei(result));
	}

	if (!currentSeason) return null;
	// console.log(currentPhaseEndTime)
	// console.log(currentSeason)

	return (
		<Container>
			<Title>Fighting Waters</Title>
			<StatusContainer>
				<StatusComponent title="">
					<StatusText>{`Season Deaths: ${currentSeason.fishDeath} / ${maxKilled}`}</StatusText>
				</StatusComponent>
				<StatusComponent title="">
					<StatusText>{`Fighting Fish: ${fightingWatersSupply}`}</StatusText>
				</StatusComponent>
				{account &&
				<>
					<StatusComponent title="">
						<StatusText>{`Pending Fight Rewards: ${userFightingFish.map(fish => fish.stakedFighting != null ? web3.utils.toNumber(fish.stakedFighting.earnedFishFood) : 0).reduce((x,y) => x + y, 0)} FISHFOOD`}</StatusText>
					</StatusComponent>
					<StatusComponent title="">
						<StatusText>{`Pending Staking Rewards: ${pendingAward} FISHFOOD`}</StatusText>
					</StatusComponent>
				</>
					
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
	  font-size: ${props => props.theme.font.small}vmin;
  }
	text-decoration: underline;
	color: white;
`;

const StatusText = styled.b`
	display: flex;
	cursor: default;
	font-size: ${props => props.theme.font.medium}vmax;
	@media ${props => props.theme.device.tablet} {
	  font-size: ${props => props.theme.font.small}vmin;
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

export default FightingStatus;
