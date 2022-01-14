import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import Modal from 'react-modal';


import { useHarmony } from '../context/harmonyContext';
import { useFishFight } from '../context/fishFightContext';
import fishImg from "../img/icons/fish.svg"
import deadImg from "../img/icons/dead.svg"
import foodImg from "../img/icons/food.svg"
import { useFishPool } from '../context/fishPoolContext';
import web3 from 'web3';
import Countdown from 'react-countdown';
import BN from 'bn.js'
import { FightingStake } from '../utils/fish';
import { Route, Routes } from 'react-router-dom';
import infoImg from "../img/icons/info.svg"


type Props = {
  // open: boolean;
};

const StatusModal = ({}: Props) => {
	const {
					currentSeason,			
					currentPhaseEndTime, 
					maxCaught,
					maxBred,
					maxKilled,
					maxSupply,
					totalSupply,
					fightingWatersSupply,
					breedingWatersSupply,
					FishFight
				} = useFishFight();
	const { userFightingFish, userBreedingFish } = useFishPool();
	const [pendingAward, setPendingAward] = useState<string>();
	const [modalIsOpen, setModalIsOpen] = useState(false);
	
	const { account } = useWeb3React();

	useEffect(() => {
		const loadData = async (account: any) => {
      if(!account) return;
			getPendingFood();
    }
		loadData(account);
	}, [account, userFightingFish]);

	const openModal = () => {
		setModalIsOpen(true);
	};

	const closeModal = () => {
		setModalIsOpen(false);
	};

	const getPendingFood = async () => {
		if(!account) return;
		const result = await FishFight.readFightingWaters.methods.pendingAward(account).call();
		setPendingAward(web3.utils.fromWei(result));
	}

	const getFoodFromFights = () => {
		let total = web3.utils.toBN(0);
		for(let i = 0; i < userFightingFish.length; i++) {
			if(userFightingFish[i].stakedFighting) {
				total = total.add(web3.utils.toBN(userFightingFish[i].stakedFighting!.earnedFishFood))
			}
		}
		return web3.utils.fromWei(total);
	}

	const getFoodFromBreeds = () => {
		let total = web3.utils.toBN(0);
		for(let i = 0; i < userBreedingFish.length; i++) {
			if(userBreedingFish[i].stakedFighting) {
				total = total.add(web3.utils.toBN(userBreedingFish[i].stakedBreeding!.earnedFishFood))
			}
		}
		return web3.utils.fromWei(total);
	}

	const fishingData = () => {
		return (
			<DataContainer>
				<Title>Fishing Waters</Title>
				<StatusContainer>
					<DataItem title="">
						<StatusText>{`Fish Available: ${maxSupply - totalSupply}`}</StatusText>
					</DataItem>
					{currentSeason?.phaseString === 'Fishing' ? 
						<DataItem title="">
							<StatusText>{`Chance to Catch: ${((maxSupply - totalSupply) / maxSupply) * 100}%`}</StatusText>
						</DataItem>
						:
						<DataItem title="">
							<StatusText>{`Chance to Catch: ${((maxSupply - totalSupply) / (maxSupply * 2)) * 100}%`}</StatusText>
						</DataItem>
					}
					
				</StatusContainer>
			</DataContainer>
		);
	}

	const fightingData = () => {
		return (
			<DataContainer>
				<StatusContainer>
					<Title>Fighting Waters</Title>
	
					<DataItem>
						<StatusText>{`All Fight Fish: ${fightingWatersSupply}`}</StatusText>
					</DataItem>
					{account &&
					<>
						<DataItem>
							<StatusText>My Fight Fish: {userFightingFish.length}</StatusText>
						</DataItem>
					</>
						
					}
				</StatusContainer>
				<StatusContainer>
					
					{account &&
					<>
					<Title>My Pending $FISHFOOD</Title>
						<DataItem>
							<StatusText>{`Fights: ${getFoodFromFights()}`}</StatusText>
						</DataItem>
						<DataItem>
							<StatusText>{`Staking: ${pendingAward}`}</StatusText>
						</DataItem>
						<DataItem>
							<StatusText>{`Breeds: ${getFoodFromBreeds()}`}</StatusText>
						</DataItem>
					</>
						
					}
				</StatusContainer>
			</DataContainer>
		);
	}

	const breedingData = () => {
		return (
			<DataContainer>
				<Title>Breeding Waters</Title>
				<StatusContainer>
					<DataItem>
						<StatusText>{`Breeding Fish: ${breedingWatersSupply}`}</StatusText>
					</DataItem>
					<DataItem>
						{/* <StatusText>{`Pending FISHFOOD: ${userBreedingFish.map(fish => fish.stakedBreeding != null ? web3.utils.toBN(fish.stakedBreeding.earnedFishFood) : web3.utils.toBN(0)).reduce((x: BN, y: web3.utils.BN) => x.add(y))}`}</StatusText> */}
					</DataItem>
				</StatusContainer>
			</DataContainer>
		);
	}

	const seasonData = () => {
		if(currentSeason == null) return;

		return (
			<DataContainer>
				<Title>{`Season ${currentSeason.index}`}</Title>
				<DataItem title="">
					<StatusText></StatusText>
					<StatusText>{`Current Phase: ${currentSeason.phaseString}`}</StatusText>
				</DataItem>
				<DataItem title="">
					{currentSeason.phase == 1 &&
						<StatusText>Next Phase: Fighting</StatusText>
					}
					{currentSeason.phase == 2 &&
						<StatusText>Next Phase: Breeding</StatusText>
					}
					{currentSeason.phase == 3 &&
						<StatusText>Next Phase: Season Change</StatusText>
					}
				</DataItem>

				<DataItem>
				{currentPhaseEndTime != undefined &&
					<StatusText>Time Limit: <Countdown date={new Date(currentPhaseEndTime)} /></StatusText>
				}
				</DataItem>
				<DataItem>
				{currentSeason.phase == 1 &&
					<StatusText>{`Limit: ${currentSeason.fishCatch} / ${maxCaught} Catches`}</StatusText>
				}
				{currentSeason.phase == 2 &&
					<StatusText>{`Limit: ${currentSeason.fishDeath} / ${maxKilled} Deaths`}</StatusText>
				}
				{currentSeason.phase == 3 &&
					<StatusText>{`Limit: ${currentSeason.fishBreed} / ${maxBred} Births`}</StatusText>
				}
				</DataItem>
			</DataContainer>
		)
	}


		return (
			<>
				<LogoImg src={infoImg} open={modalIsOpen} onClick={openModal}></LogoImg>
				<Modal
					isOpen={modalIsOpen}
					className="Modal"
					overlayClassName="Overlay"
					onRequestClose={closeModal}
					shouldCloseOnOverlayClick
				>
					{/* {active ? <SignOut account={parsedAccount} closeModal={closeModal} /> : <Wallets closeModal={closeModal} />} */}
					<StatusModalContainer>
					{seasonData()}
					<Routes>
						<Route path="fishing" element={fishingData()} />
						<Route path="fishing/:id" element={fishingData()} />
						<Route path="fighting" element={fightingData()} />
						<Route path="fighting/:id" element={fightingData()} />
						<Route path="breeding" element={breedingData()} />
						<Route path="breeding/:id" element={breedingData()} />
					</Routes>
				</StatusModalContainer>
				</Modal>
			</>
			
			
		)
	
};

const StatusModalContainer = styled.div`
	display: flex;
	flex-flow: column;
	background-color: white;
	padding: ${props => props.theme.spacing.gap};
	/* justify-content: space-evenly;
	align-items: flex-start; */
`;

const DataContainer = styled.div`
	display: flex;
	flex-flow: column;
	align-items: center;
	/* @media ${props => props.theme.device.tablet} {
		display: flex;
		flex-flow: row nowrap;
		justify-content: space-evenly;
		align-items: flex-start;
  } */
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
	color: black;
	font-size: ${props => props.theme.font.large}vmax;

	@media ${props => props.theme.device.tablet} {
		display: block;
	  font-size: ${props => props.theme.font.large}vmin;
  }
	/* text-decoration: underline; */
	text-transform: uppercase;
`;

const StatusText = styled.b`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
	color: black;
	font-size: ${props => props.theme.font.medium}vmax;
	/* margin-right: ${props => props.theme.spacing.gapSmall}; */
	cursor: default;
	@media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.medium}vmin;
  }
`;


const DataItem = styled.div`
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

const LogoImg = styled.img<{open: boolean}>`
	background-color: ${p => (p.open ? "gray" : "white")};
	padding: ${props => props.theme.spacing.gapSmall};
	height: 25px;
	margin-left: ${props => props.theme.spacing.gapSmall};
	border-radius: 50%;

	@media ${props => props.theme.device.tablet} {
	  height: 30px;
  }
`;

export default StatusModal;
