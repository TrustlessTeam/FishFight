import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import Modal from 'react-modal';


import { useHarmony } from '../context/harmonyContext';
import { useFishFight } from '../context/fishFightContext';
import fishFightLogo from "../img/FishFight.png"
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
import Phase from './Phase';
import { Constants } from '../utils/constants';
import ToggleButton, { ToggleItem } from './ToggleButton';
import { toast } from 'react-toastify';


type Props = {
  children?: React.ReactNode;
};

enum StatView {
	Fishing,
	Fighting,
	Breeding
}

const StatusModal = ({children}: Props) => {
	const {
					currentCycle,			
					currentPhase, 
					totalCaught,
					totalBreeds,
					totalFights,
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
	const [statToShow, setStatToShow] = useState<number>(StatView.Fishing);

	
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

	const nextPhase = async () => {
		if(!account) toast.error("Connect Wallet");
		FishFight.cycles?.methods.checkLimit().send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: await FishFight.cycles?.methods.checkLimit().estimateGas({from: account})
		})
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

	type RenderProps = {
		hours: any;
		minutes: any;
		seconds: any;
		completed: boolean;
	}
	const renderer = ({ hours, minutes, seconds, completed }: RenderProps) => {
		if (completed) {
			// Render a completed state
			return <NextButton onClick={nextPhase}>Next Phase</NextButton>;
			
		} else {
			// Render a countdown
			return <Time><Hour>{hours} hrs</Hour><Minute>{minutes} mins</Minute><Second>{seconds} secs</Second></Time>;
		}
	};

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

	const StatViewOptions: ToggleItem[] = [
		{
			name: 'Fishing',
			id: StatView.Fishing,
			onClick: () => setStatToShow(StatView.Fishing)
		},
		{
			name: 'Fighting',
			id: StatView.Fighting,
			onClick: () => setStatToShow(StatView.Fighting)
		},
		{
			name: 'Breeding',
			id: StatView.Breeding,
			onClick: () => setStatToShow(StatView.Breeding)
		}
	]

	const seasonData = () => {
		if(currentPhase == null) return;

		return (
			<DataContainer>
				<StatusContainer>
					<MobileButtons>
						{children}
					</MobileButtons>
				</StatusContainer>
				<StatusContainer>
					<Time>
						<Title>Phase <span>{currentPhase.phaseString}</span></Title>
						<Countdown renderer={renderer} date={currentPhase.phaseEndtimeDate} />
						<Title>Next 
							<span>
								{currentPhase.phase === 1 && 
									" Fighting"
								}
								{currentPhase.phase === 2 && 
									" Breeding"
								}
								{currentPhase.phase === 3 && 
									" Fishing"
								}
							</span></Title>
						
					</Time>
				</StatusContainer>
				
				<StatusContainer>
					<ToggleButton items={StatViewOptions} selected={statToShow}></ToggleButton>
					<SubTitle>{`${StatView[statToShow]} Stats`}</SubTitle>

					{statToShow === StatView.Fishing &&
					<>
						<DataItem>
							<StatusText>{`Cost to Fish: ${web3.utils.fromWei(currentPhase.phase === 1 ? Constants._fishingPriceInPhase : Constants._fishingPrice)} ONE`}</StatusText>
							<StatusText>{`Fish Available: ${maxSupply - totalSupply}`}</StatusText>
							
							{totalSupply > 10000 ? 
							<StatusText>{`Chance to Catch: ${(((maxSupply - totalSupply) / maxSupply) * 100).toFixed(2)}%`}</StatusText>
							:
							<StatusText>{`Chance to Catch: 100%`}</StatusText>
							}
							<StatusText>{`All Fish: ${totalSupply}`}</StatusText>
							<StatusText>{`Total Fish Caught: ${totalCaught}`}</StatusText>
						</DataItem>
					</>
						
					}
					{statToShow === StatView.Fighting &&
					<>
						<DataItem>
							<StatusText>{`$FISHFOOD per Win: ${web3.utils.fromWei(currentPhase.phase === 2 ? Constants._fishFoodPerWinInPhase : Constants._fishFoodPerWin)}`}</StatusText>
							<StatusText>{`Fighting Fish: ${fightingWatersSupply}`}</StatusText>
							<StatusText>{`Total Fights: ${totalFights}`}</StatusText>
						</DataItem>
					</>
					}
					{statToShow === StatView.Breeding &&
					<>
						<DataItem>
							<StatusText>{`Cost to Breed: ${web3.utils.fromWei(currentPhase.phase === 4 ? Constants._oneBreedFeeInPhase : Constants._oneBreedFee)} ONE`}</StatusText>
							<StatusText>{`Breeding Fish: ${breedingWatersSupply}`}</StatusText>
							<StatusText>{`Total Breeds: ${totalBreeds}`}</StatusText>
						</DataItem>
					</>
						
					}
				</StatusContainer>
				
				
			</DataContainer>
		)
	}


		return (
			<ImgContainer>
				{/* <WaterStats onClick={toggleModel}> */}
					<LogoImg onClick={toggleModel} open={modalIsOpen} src={fishFightLogo}></LogoImg>
					<DesktopButtons>{children}</DesktopButtons>
				{/* </WaterStats> */}
				<LeftModal
					isOpen={modalIsOpen}
					overlayClassName="Overlay"
					onRequestClose={closeModal}
					shouldCloseOnOverlayClick
				>
					{/* {active ? <SignOut account={parsedAccount} closeModal={closeModal} /> : <Wallets closeModal={closeModal} />} */}
					<StatusModalContainer>
					{seasonData()}
					{/* <Phase></Phase> */}
					{/* <Routes>
						<Route path="ocean" element={oceanData()} />
						<Route path="ocean:id" element={oceanData()} />
						<Route path="fishing" element={fishingData()} />
						<Route path="fishing/:id" element={fishingData()} />
						<Route path="fighting" element={fightingData()} />
						<Route path="fighting/:id" element={fightingData()} />
						<Route path="breeding" element={breedingData()} />
						<Route path="breeding/:id" element={breedingData()} />
					</Routes> */}
					{/* {userData()} */}
					</StatusModalContainer>
				</LeftModal>
			</ImgContainer>
			
			
		)
	
};

const MobileButtons = styled.div`
	display: block;
	@media ${props => props.theme.device.tablet} {
	  display: none;
  }
`;

const DesktopButtons = styled.div`
	display: none;
	@media ${props => props.theme.device.tablet} {
	  display: block;
  }
`;

const NextButton = styled(BaseButton)`
	margin-right: ${props => props.theme.spacing.gapSmall};
	height: ${props => props.theme.font.medium};

	@media ${props => props.theme.device.tablet} {
	  height: ${props => props.theme.font.large};
  }
`

const Time = styled.div`
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
`;

const Text = styled.p`
	color: black;
	margin: 0;
	font-weight: bold;

	span {
		color: white;
	}
`;

const Hour = styled(Text)`
	font-size: ${props => props.theme.font.medium};
	padding-right: ${props => props.theme.spacing.gapSmall};
	
	@media ${props => props.theme.device.tablet} {
	  font-size: ${props => props.theme.font.large};
  }
`;

const Minute = styled(Text)`
	font-size: ${props => props.theme.font.small};
	padding-right: ${props => props.theme.spacing.gapSmall};

	@media ${props => props.theme.device.tablet} {
	  font-size: ${props => props.theme.font.medium};
  }
`;

const Second = styled(Text)`
	font-size: 10px;
	padding-right: ${props => props.theme.spacing.gapSmall};

	@media ${props => props.theme.device.tablet} {
	  font-size: ${props => props.theme.font.small};
  }
`;

const LeftModal = styled(StyledModal)`
	top: 80px;
  left: 0;
  transform: translate(0%, 0%);
	width: 100%;
	
	@media ${props => props.theme.device.tablet} {
		width: 50%;
		top: 100px;
	}
`;

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
	justify-content: flex-start;
	align-items: flex-start;
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
	padding: ${props => props.theme.spacing.gap};

	@media ${props => props.theme.device.tablet} {

  }
`;

const Title = styled.h1`
	color: black;
	font-size: ${props => props.theme.font.medium};
	margin: 0;
	padding-right: ${props => props.theme.spacing.gapSmall};

	@media ${props => props.theme.device.tablet} {
		display: block;
	  font-size: ${props => props.theme.font.large};
  }
	/* text-decoration: underline; */
	text-transform: uppercase;

	span {
		color: white;
	}
`;

const SubTitle = styled.h2`
	color: black;
	font-size: ${props => props.theme.font.medium};
	margin: 0;
	padding-right: ${props => props.theme.spacing.gapSmall};

	@media ${props => props.theme.device.tablet} {
		display: block;
	  font-size: ${props => props.theme.font.large};
  }
	/* text-decoration: underline; */
	text-transform: uppercase;
`;

const StatusText = styled.b`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
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
	flex-flow: row wrap;
	justify-content: flex-start;
	margin-top: ${props => props.theme.spacing.gapSmall};
	/* background-color: white; */
	color: white;
	/* border: 2px solid white; */
	border-radius: 50%;
	padding: ${props => props.theme.spacing.gapSmall} 0;

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
	/* border-radius: 25px;
	&::before {
    border-radius: 25px;
  }
	padding: 10px 10px;

	@media ${props => props.theme.device.tablet} {
	  padding: 14px 24px;
  } */
	height: 100%;
`;

const LogoImg = styled.img<{open: boolean}>`
	/* padding: ${props => props.theme.spacing.gapSmall}; */
	height: 40px;

	@media ${props => props.theme.device.tablet} {
	  height: 80px;
  }
`;

export default StatusModal;
