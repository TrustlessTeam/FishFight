import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';

import { useHarmony } from '../context/harmonyContext';
import { useFishFight } from '../context/fishFightContext';
import Countdown from 'react-countdown';
import fishImg from "../img/icons/fish.svg"
import deadImg from "../img/icons/dead.svg"
import foodImg from "../img/icons/food.svg"


const SeasonStatus = () => {
	const { currentSeason, currentPhaseEndTime, FishFight, maxCaught, maxKilled, maxBred } = useFishFight();
	const { account } = useWeb3React();

	if (!currentSeason) return null;
	console.log(currentPhaseEndTime)
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

	const Completed = () => <StatusText>00:00:00</StatusText>;

	return (
		<Container>
			<StatusContainer>
				{/* <StatusComponent>
					<b>{balance.split('.')[0]}</b> <span>ONE</span>
				</StatusComponent> */}
				<StatusComponent title="">
					<StatusText>{`Season ${currentSeason.index}`}</StatusText>
					<StatusText>{`${currentSeason.phaseString} Phase`}</StatusText>
				</StatusComponent>
				<StatusComponent><StatusText>➜</StatusText></StatusComponent>
				<StatusComponent onClick={nextPhase} title="">
					{currentSeason.phase == 1 &&
						<StatusText>Fighting Phase in</StatusText>
					}
					{currentSeason.phase == 2 &&
						<StatusText>Breeding Phase in</StatusText>
					}
					{currentSeason.phase == 3 &&
						<StatusText>New Season in</StatusText>
					}
						<StatusTextContainer>
							{currentPhaseEndTime != undefined &&
								<Countdown date={new Date(currentPhaseEndTime)} />

							}
							

							<StatusText>or</StatusText>
							{currentSeason.phase == 1 &&
								<StatusText>{`${currentSeason.fishCatch} / ${maxCaught} Catches`}</StatusText>
							}
							{currentSeason.phase == 2 &&
								<StatusText>{`${currentSeason.fishDeath} / ${maxKilled} Deaths`}</StatusText>
							}
							{currentSeason.phase == 3 &&
								<StatusText>{`${currentSeason.fishBreed} / ${maxBred} Births`}</StatusText>
							}
						</StatusTextContainer>
				</StatusComponent>
				<StatusComponent title="">
				</StatusComponent>
			</StatusContainer>
		</Container>
	);
};

const Container = styled.div`
	@media ${props => props.theme.device.tablet} {
		display: flex;
		flex-flow: column;
		align-items: center;
		justify-content: center;
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
		flex-flow: row;
		align-items: center;
		justify-content: center;
		padding: 0;
  }
`;

const Title = styled.h1`
	font-size: ${props => props.theme.font.medium}vmax;
	@media ${props => props.theme.device.tablet} {
		/* display: block; */
	  font-size: ${props => props.theme.font.medium}vmin;
		text-transform: uppercase;
		margin-right: ${props => props.theme.spacing.gap};
  }
	color: white;
`;

const StatusText = styled.b`
	cursor: default;
	margin-right: ${props => props.theme.spacing.gapSmall};
	font-size: ${props => props.theme.font.medium}vmax;
	@media ${props => props.theme.device.tablet} {
	  font-size: ${props => props.theme.font.small}vmin;
		text-transform: uppercase;
		margin-right: ${props => props.theme.spacing.gapSmall};
  }
`;

const StatusTextContainer = styled.div`
	display: flex;
	flex-flow: row;
	align-items: center;
`;

const StatusComponent = styled.div`
	display: flex;
	flex-flow: column;
	/* justify-content: center; */
	/* margin-top: ${props => props.theme.spacing.gapSmall}; */
	/* padding: ${props => props.theme.spacing.gap} ${props => props.theme.spacing.gap}; */
	/* background-color: white; */
	color: white;
	/* border: 2px solid white; */
	border-radius: 50%;

	@media ${props => props.theme.device.tablet} {
		margin: 0;
  }
`;

const LogoImg = styled.img`
	height: 100%;
`;

export default SeasonStatus;
