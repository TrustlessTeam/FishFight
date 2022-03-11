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
import { StakedFighting } from '../utils/fish';
import { Route, Routes } from 'react-router-dom';
import infoImg from "../img/icons/info.svg";
import waterImg from "../img/icons/water-dark.svg";
import { StyledModal } from './BaseStyles';
import BaseButton from "../components/BaseButton";
import { useContractWrapper } from '../context/contractWrapperContext';


type Props = {
  // open: boolean;
};

const StatusModal = ({}: Props) => {
	const {
					currentCycle,			
					currentPhase, 
					maxCaught,
					maxBred,
					maxKilled,
					maxSupply,
					totalSupply,
					fightingWatersSupply,
					breedingWatersSupply,
					FishFight
				} = useFishFight();
	const { userFish } = useFishPool();
	const [pendingAward, setPendingAward] = useState<string>();
	const [pendingCollectAward, setPendingCollectAward] = useState<string>();
	const [pendingFightFood, setPendingFightFood] = useState<string>();
	const [pendingBreedFood, setPendingBreedFood] = useState<string>();
	const [modalIsOpen, setModalIsOpen] = useState(false);
	
	const { account } = useWeb3React();
	const { balanceFish, balanceDeadFish, balanceFood, balanceFightFish, balanceBreedFish  } = useFishFight();
	const { feedAllFish, claimAllFishFood } = useContractWrapper();
	useEffect(() => {
		const loadData = async (account: any) => {
      if(!account) return;
			getPendingFood();
			getPendingFoodFromCollect();
			getUserFishStats();
    }
		loadData(account);
	}, [account, userFish]);

	const toggleModel = () => {
		setModalIsOpen(!modalIsOpen);
	};

	const closeModal = () => {
		setModalIsOpen(false);
	};

	const getPendingFood = async () => {
		if(!account) return;
		const result = await FishFight.readFightingWaters.methods.pendingAward(account).call();
		setPendingAward(web3.utils.fromWei(result));
	}

	const getPendingFoodFromCollect = async () => {
		if(!account) return;
		const result = await FishFight.readTrainingWaters.methods.checkRewards().call({
			from: account
		});
		setPendingCollectAward(web3.utils.fromWei(result));
	}

	const getUserFishStats = () => {
		let totalFight = web3.utils.toBN(0);
		let totalBreed = web3.utils.toBN(0);
		for(let i = 0; i < userFish.length; i++) {
			if(userFish[i].stakedFighting && userFish[i].stakedFighting?.earnedFishFood != null) {
				totalFight = totalFight.add(web3.utils.toBN(userFish[i].stakedFighting!.earnedFishFood))

			}
			if(userFish[i].stakedBreeding && userFish[i].stakedBreeding?.earnedFishFood != null) {
				totalBreed = totalBreed.add(web3.utils.toBN(userFish[i].stakedBreeding!.earnedFishFood))
			}
		}
		setPendingFightFood(totalFight.toString());
		setPendingBreedFood(totalBreed.toString());
	}

	const oceanData = () => {
		return (
			<DataContainer>
				<Title>Ocean Stats</Title>
				<StatusContainer>
					<DataItem title="">
						<StatusText>{`All Fish: ${totalSupply}`}</StatusText>
					</DataItem>
					<DataItem title="">
						<StatusText>{`Fish to Catch: ${maxSupply - totalSupply}`}</StatusText>
					</DataItem>
				</StatusContainer>
			</DataContainer>
		);
	}

	const fishingData = () => {
		return (
			<DataContainer>
				<Title>Fishing Waters</Title>
				<StatusContainer>
					<DataItem title="">
						<StatusText>{`Fish Available: ${maxSupply - totalSupply}`}</StatusText>
					</DataItem>
					{totalSupply > 10000 ? 
							<DataItem>
								<StatusText>{`Chance to Catch: ${(((maxSupply - totalSupply) / maxSupply) * 100).toFixed(2)}%`}</StatusText>
							</DataItem>
							:
							<DataItem>
								<StatusText>{`Chance to Catch: 100% until ${totalSupply} = 10,000`}</StatusText>
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
					<Title>Fighting Pool</Title>
	
					<DataItem>
						<StatusText>{`Available to Fight: ${fightingWatersSupply}`}</StatusText>
					</DataItem>
					{account &&
					<>
						<DataItem>
							<StatusText>{`My Fighters: ${balanceFightFish}`}</StatusText>
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
					{account &&
					<>
						<DataItem>
							<StatusText>{`My Breeders: ${balanceBreedFish}`}</StatusText>
						</DataItem>
					</>
					}
				</StatusContainer>
			</DataContainer>
		);
	}

	const userData = () => {
		if(!account) return null;
		return (
			<DataContainer>
				<DataItem>
					<Title>{`My FISH`}</Title>
				</DataItem>
				<StatusContainer>
						<DataRow>
							<StatusText>Total: {parseInt(balanceFish ? balanceFish : '0') + parseInt(balanceFightFish ? balanceFightFish : '0') + parseInt(balanceBreedFish ? balanceBreedFish : '0')}</StatusText>
							<StatusText>{`Available to Feed: ${userFish.filter((fish) => {return fish.fishModifiers.canFeed()}).length}`}</StatusText>
						</DataRow>
						<DataItem>
							<BaseButton onClick={() => {feedAllFish(); closeModal()}}>{`Feed Eligible Fish`}</BaseButton>
							<BaseButton onClick={() => {claimAllFishFood(); closeModal()}}>{`Send $FISH to Collect: ${pendingCollectAward}`}</BaseButton>
						</DataItem>
				</StatusContainer>
				<SubTitle>Fighters</SubTitle>
				<StatusContainer>
					<DataItem>
						<StatusText>{`Deposited Fighters: ${balanceFightFish}`}</StatusText>
					</DataItem>
					<DataItem>
						<StatusText>{`Pending $FISHFOOD from Wins: ${parseFloat(pendingFightFood ? pendingFightFood : '0').toFixed(2)}, from Staking: ${parseFloat(pendingAward ? pendingAward : '0').toFixed(2)}`}</StatusText>
					</DataItem>
						
				</StatusContainer>
				<SubTitle>Breeders</SubTitle>
				<StatusContainer>
					<DataItem>
						<StatusText>{`Deposited Alphas: ${balanceBreedFish}`}</StatusText>
					</DataItem>
					<DataItem>
						<StatusText>{`Pending $FISHFOOD from Breeds: ${pendingBreedFood}`}</StatusText>
					</DataItem>
				</StatusContainer>
				
			</DataContainer>
		);
	}

	const seasonData = () => {
		if(currentPhase == null) return;

		return (
			<DataContainer>
				<Title>{`Cycle ${currentCycle}`}</Title>
				<SubTitle>{`Phase Stats`}</SubTitle>
				<DataItem title="">
					<StatusText></StatusText>
					<StatusText>{`Current: ${currentPhase.phaseString} -> `}</StatusText>
					{currentPhase.phase === 1 &&
						<StatusText>Next: Fighting</StatusText>
					}
					{currentPhase.phase === 2 &&
						<StatusText>Next: Breeding</StatusText>
					}
					{currentPhase.phase === 3 &&
						<StatusText>Next: Fishing</StatusText>
					}
				</DataItem>
				<DataItem>
					<StatusText>{`Time Left: `}<Countdown date={currentPhase.phaseEndtimeDate} /></StatusText>
				</DataItem>
				{/* <StatusText>OR</StatusText> */}
				{/* <DataItem>
				{currentPhase.phase == 1 &&
					<StatusText>{`Catches Left: ${currentPhase.fishCatch} / ${maxCaught}`}</StatusText>
				}
				{currentSeason.phase == 2 &&
					<StatusText>{`Deaths Left: ${currentSeason.fishDeath} / ${maxKilled}`}</StatusText>
				}
				{currentSeason.phase == 3 &&
					<StatusText>{`Births Left: ${currentSeason.fishBreed} / ${maxBred}`}</StatusText>
				}
				</DataItem> */}
			</DataContainer>
		)
	}


		return (
			<ImgContainer>
				<WaterStats onClick={toggleModel}>
					Info<LogoImg open={modalIsOpen} src={waterImg}></LogoImg>
				</WaterStats>
				<StyledModal
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
						<Route path="ocean" element={oceanData()} />
						<Route path="ocean:id" element={oceanData()} />
						<Route path="fishing" element={fishingData()} />
						<Route path="fishing/:id" element={fishingData()} />
						<Route path="fighting" element={fightingData()} />
						<Route path="fighting/:id" element={fightingData()} />
						<Route path="breeding" element={breedingData()} />
						<Route path="breeding/:id" element={breedingData()} />
					</Routes>
					{userData()}
				</StatusModalContainer>
				</StyledModal>
			</ImgContainer>
			
			
		)
	
};

const ImgContainer = styled.div`
	display: flex;
	flex-flow: column;
	justify-content: center;
	/* padding: ${props => props.theme.spacing.gap}; */
	/* justify-content: space-evenly;
	align-items: flex-start; */

	@media ${props => props.theme.device.tablet} {
		display: flex;
		flex-flow: row nowrap;
		justify-content: flex-start;
		align-items: center;
		width: 33%;
  }
`;

const StatusModalContainer = styled.div`
	position: relative;
	display: flex;
	flex-flow: column;
	/* background-color: white; */
	padding: ${props => props.theme.spacing.gapMedium};
	z-index: 10;
	/* justify-content: space-evenly;
	align-items: flex-start; */
`;

const DataContainer = styled.div`
	display: flex;
	flex-flow: column;
	align-items: flex-start;
	/* @media ${props => props.theme.device.tablet} {
		display: flex;
		flex-flow: row nowrap;
		justify-content: space-evenly;
		align-items: flex-start;
  } */
`;

const StatusContainer = styled.div`
	display: flex;
		flex-flow: column;
		align-items: flex-start;
		flex-flow: column;
		/* justify-content: center; */

	@media ${props => props.theme.device.tablet} {

  }
`;

const Title = styled.h1`
	color: black;
	font-size: ${props => props.theme.font.medium};

	@media ${props => props.theme.device.tablet} {
		display: block;
	  font-size: ${props => props.theme.font.large};
  }
	/* text-decoration: underline; */
	text-transform: uppercase;
`;

const SubTitle = styled.h2`
	color: black;
	font-size: ${props => props.theme.font.small};
	text-decoration: underline;

	@media ${props => props.theme.device.tablet} {
		display: block;
	  font-size: ${props => props.theme.font.medium};
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
	font-size: ${props => props.theme.font.small};
	margin-bottom: ${props => props.theme.spacing.gapSmall};
	padding: 0 ${props => props.theme.spacing.gapSmall};

	cursor: default;
	@media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.medium};
  }
`;


const DataItem = styled.div`
	display: flex;
	flex-flow: row;
	justify-content: center;
	margin-top: ${props => props.theme.spacing.gapSmall};
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

const DataRow = styled.div`
	display: flex;
	flex-flow: row;
	/* justify-content: space-between; */
	margin-top: ${props => props.theme.spacing.gapSmall};
	/* padding: ${props => props.theme.spacing.gap} ${props => props.theme.spacing.gap}; */
	/* background-color: white; */
	color: white;
	width: 100%;
`;

const WaterStats = styled(BaseButton)`
	border-radius: 25px;
	&::before {
    border-radius: 25px;
  }
	padding: 10px 10px;

	@media ${props => props.theme.device.tablet} {
	  padding: 14px 24px;
  }
`;

const LogoImg = styled.img<{open: boolean}>`
	/* padding: ${props => props.theme.spacing.gapSmall}; */
	height: 0px;

	@media ${props => props.theme.device.tablet} {
	  height: 30px;
  }
`;

export default StatusModal;
