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

type Props = {
  type: string
};

const PhaseStatus = ({type}: Props) => {
	const { currentSeason, maxSupply, totalSupply, maxKilled, fightingWatersSupply, breedingWatersSupply, FishFight } = useFishFight();
	const { userFightingFish, userBreedingFish } = useFishPool();
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

	// console.log(currentPhaseEndTime)
	// console.log(currentSeason)
	if(type === 'Fishing') {
		return (
			<Container>
				<Title>Fishing Waters</Title>
				<StatusContainer>
					<StatusComponent title="">
						<StatusText>{`Fish Available: ${maxSupply - totalSupply}`}</StatusText>
					</StatusComponent>
					{currentSeason?.phaseString === 'Fishing' ? 
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
	}

	if(type === 'Fighting') {
		return (
			<Container>
				<StatusContainer>
					<Title>Fighting Waters</Title>
	
					<StatusComponent>
						<StatusText>{`All Fight Fish: ${fightingWatersSupply}`}</StatusText>
					</StatusComponent>
					{account &&
					<>
						<StatusComponent>
							<StatusText>My Fight Fish: {userFightingFish.length}</StatusText>
						</StatusComponent>
					</>
						
					}
				</StatusContainer>
				<StatusContainer>
					
					{account &&
					<>
					<Title>Pending Rewards</Title>
						<StatusComponent>
							{/* <StatusText>{`Fights: ${userFightingFish.map(fish => fish.stakedFighting != null ? web3.utils.toNumber(fish.stakedFighting.earnedFishFood) : 0).reduce((x,y) => x + y, 0)} FISHFOOD`}</StatusText> */}
						</StatusComponent>
						<StatusComponent>
							<StatusText>{`Staking: ${pendingAward} FISHFOOD`}</StatusText>
						</StatusComponent>
						<StatusComponent>
							<StatusText>{`Breeds: ${pendingAward} FISHFOOD`}</StatusText>
						</StatusComponent>
					</>
						
					}
				</StatusContainer>
			</Container>
		);
	}

	if(type === 'Breeding') {
		return (
			<Container>
				<Title>Breeding Waters</Title>
				<StatusContainer>
					<StatusComponent>
						<StatusText>{`Breeding Fish: ${breedingWatersSupply}`}</StatusText>
					</StatusComponent>
					<StatusComponent>
						{/* <StatusText>{`Pending FISHFOOD: ${userBreedingFish.map(fish => fish.stakedBreeding != null ? web3.utils.toBN(fish.stakedBreeding.earnedFishFood) : web3.utils.toBN(0)).reduce((x: BN, y: web3.utils.BN) => x.add(y))}`}</StatusText> */}
					</StatusComponent>
				</StatusContainer>
			</Container>
		);
	}

	return null;
};

const Container = styled.div`
	@media ${props => props.theme.device.tablet} {
		display: flex;
		flex-flow: row nowrap;
		justify-content: space-evenly;
		align-items: flex-start;
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
		/* align-items: center; */
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
	/* text-decoration: underline; */
	text-transform: uppercase;
	color: white;
`;

const StatusText = styled.b`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
	font-size: ${props => props.theme.font.medium}vmax;
	/* margin-right: ${props => props.theme.spacing.gapSmall}; */
	cursor: default;
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
	height: 25px;
	margin: 0 ${props => props.theme.spacing.gapSmall};

	@media ${props => props.theme.device.tablet} {
	  height: 25px;
  }
`;

export default PhaseStatus;
