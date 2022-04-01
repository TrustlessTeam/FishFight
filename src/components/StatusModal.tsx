import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { useFishFight } from '../context/fishFightContext';
import fishFightLogo from "../img/FishFight.png"
import { useFishPool } from '../context/fishPoolContext';
import web3 from 'web3';
import Countdown from 'react-countdown';
import BN from 'bn.js'
import { StyledModal } from './BaseStyles';
import BaseButton from "../components/BaseButton";
import { useContractWrapper } from '../context/contractWrapperContext';
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

	const UserFishControls = () => {
		const fishToFeed = userFish.filter((fish) => {return fish.fishModifiers.canFeed()}).length;
		const fishToCollect = userFish.filter((fish) => {return fish.fishModifiers.canCollect()}).length;

		return (
			<DataContainer>
				<StatusContainer>
					<Title>{`My FISH`}</Title>
					<DataItem>
						<BaseButton onClick={() => {feedAllFish(); closeModal()}}>{`Feed All`}</BaseButton>
						<StatusText>{`Available to Feed: ${fishToFeed} for ${web3.utils.fromWei(new BN(fishToFeed).mul(new BN(Constants._feedFee)))} $FISHFOOD`}</StatusText>
					</DataItem>
					<DataItem>
						<BaseButton onClick={() => {claimAllFishFood(); closeModal()}}>{`Claim All`}</BaseButton>
						<StatusText>{`Available to Claim: ${fishToCollect} for ${web3.utils.fromWei(new BN(fishToCollect).mul(new BN(Constants._claimAmount)))} $FISHFOOD`}</StatusText>
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

	const GameData = () => {
		if(currentPhase == null) return null;

		return (
			<DataContainer>
				<MobileButtons>
					{children}
				</MobileButtons>
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
							</span>
						</Title>
					</Time>
				</StatusContainer>
				
				<StatusContainer>
					<ToggleButton items={StatViewOptions} selected={statToShow}></ToggleButton>
					<Title>{`${StatView[statToShow]} Stats`}</Title>

					{statToShow === StatView.Fishing &&
					<StatusContainer>
						<DataItem>
							<StatusText>{`Cost to Fish: ${web3.utils.fromWei(currentPhase.phase === 1 ? Constants._fishingPriceInPhase : Constants._fishingPrice)} ONE`}</StatusText>
							<StatusText>{`Fish Available: ${maxSupply - totalSupply}`}</StatusText>
							
							{totalSupply > 10000 ? 
							<StatusText>{`Chance to Catch: ${(((maxSupply - totalSupply) / maxSupply) * 100).toFixed(2)}%`}</StatusText>
							:
							<StatusText>{`Chance to Catch: 100%`}</StatusText>
							}
							<StatusText>{`All Fish: ${totalSupply}`}</StatusText>
							<StatusText>{`Total Caught: ${totalCaught}`}</StatusText>
						</DataItem>
					</StatusContainer>
						
					}
					{statToShow === StatView.Fighting &&
					<>
						<DataItem>
							<SubTitle>{`Fight Pool Stats:`}</SubTitle>
							<StatusText>{`Fish in Fight Pool: ${fightingWatersSupply}`}</StatusText>
							<StatusText>{`$FISHFOOD per Win: ${web3.utils.fromWei(currentPhase.phase === 2 ? Constants._fishFoodPerWinInPhase : Constants._fishFoodPerWin)}`}</StatusText>
							<StatusText>{`Total Fights: ${totalFights}`}</StatusText>
						</DataItem>
						{account &&
							<DataItem>
								<SubTitle>{`User Fighting Fish:`}</SubTitle>
								<StatusText>{`User Fish in Fight Pool: ${balanceFightFish}`}</StatusText>
								<StatusText>{`Pending from Wins: ${parseFloat(pendingFightFood ? pendingFightFood : '0').toFixed(2)} $FISHFOOD`}</StatusText>
								<StatusText>{`Pending from Staking: ${parseFloat(pendingAward ? pendingAward : '0').toFixed(2)} $FISHFOOD`}</StatusText>
							</DataItem>
						}
					</>
					}
					{statToShow === StatView.Breeding &&
					<>
						<DataItem>
							<SubTitle>{`Breed Pool Stats:`}</SubTitle>
							<StatusText>{`Fish in Breed Pool: ${breedingWatersSupply}`}</StatusText>
							<StatusText>{`Cost to Breed: ${web3.utils.fromWei(currentPhase.phase === 4 ? Constants._oneBreedFeeInPhase : Constants._oneBreedFee)} ONE`}</StatusText>
							<StatusText>{`$FISHFOOD per Win: ${web3.utils.fromWei(currentPhase.phase === 2 ? Constants._fishFoodPerWinInPhase : Constants._fishFoodPerWin)}`}</StatusText>
							<StatusText>{`Total Breeds: ${totalBreeds}`}</StatusText>
							
						</DataItem>
						{account &&
							<DataItem>
								<SubTitle>{`User Breeding Fish:`}</SubTitle>
								<StatusText>{`User Fish in Breed Pool: ${balanceBreedFish}`}</StatusText>
								<StatusText>{`Pending from Alpha Breeds: ${parseFloat(pendingBreedFood ? pendingBreedFood : '0').toFixed(2)} $FISHFOOD`}</StatusText>
							</DataItem>
						}
					</>
					}
				</StatusContainer>

				{account &&
					<UserFishControls></UserFishControls>
				}
				
			</DataContainer>
		)
	}

	return (
		<ImgContainer>
				<LogoButton onClick={toggleModel}><img src={fishFightLogo} alt="FishFight Logo"></img></LogoButton>
				<DesktopButtons>{children}</DesktopButtons>
			<LeftModal
				isOpen={modalIsOpen}
				overlayClassName="Overlay"
				onRequestClose={closeModal}
				shouldCloseOnOverlayClick
			>
				<StatusModalContainer>
					<GameData></GameData>
				</StatusModalContainer>
			</LeftModal>
		</ImgContainer>
	)
	
};

const MobileButtons = styled.div`
	display: block;
	padding: ${props => props.theme.spacing.gapSmall};
	@media ${props => props.theme.device.tablet} {
	  display: none;
  }
`;

const DesktopButtons = styled.div`
	display: none;
	@media ${props => props.theme.device.tablet} {
	  display: block;
		padding: ${props => props.theme.spacing.gap};
  }
`;

const NextButton = styled(BaseButton)`
	margin-right: ${props => props.theme.spacing.gapSmall};
	height: 100%;

	@media ${props => props.theme.device.tablet} {
	  height: ${props => props.theme.font.large};
  }
`

const Time = styled.div`
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	justify-content: space-between;
`;

const Text = styled.p`
	color: #61daff;
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
	top: 60px;
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
	align-items: flex-start;
	justify-content: center;
	/* padding: ${props => props.theme.spacing.gap}; */
	/* justify-content: space-evenly;
	align-items: flex-start; */
	width: 33%;
	max-width: 350px;

	@media ${props => props.theme.device.tablet} {
		display: flex;
		flex-flow: row nowrap;
		justify-content: flex-start;
		align-items: center;
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
`;

const Title = styled.h1`
	color: #61daff;
	font-size: ${props => props.theme.font.medium};
	margin: 0;
	padding-right: ${props => props.theme.spacing.gapSmall};
	padding-top: ${props => props.theme.spacing.gapSmall};
	text-transform: uppercase;

	@media ${props => props.theme.device.tablet} {
		display: block;
	  font-size: ${props => props.theme.font.large};
  }
	
	span {
		color: white;
	}
`;

const SubTitle = styled.h2`
	color: #61daff;
	font-size: ${props => props.theme.font.small};
	margin: 0;
	padding-right: ${props => props.theme.spacing.gapSmall};
	text-transform: uppercase;

	@media ${props => props.theme.device.tablet} {
		display: block;
	  font-size: ${props => props.theme.font.medium};
  }	
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
	color: white;
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

const LogoButton = styled.button`
	position: relative;
	background: none;
	border: none;
	/* padding: ${props => props.theme.spacing.gapSmall}; */
	cursor: pointer;
	/* background-image: radial-gradient(circle at 50% 50%, rgba(220, 13, 51, 1) 0%, rgba(0, 188, 212, 0) 60%, rgba(238, 130, 238, 0) 100%); */
  transition: all 0.2s ease-in-out;
	z-index: 5;
	
	img {
		position: relative;
		height: 40px;
		z-index: 5;

		@media ${props => props.theme.device.tablet} {
			height: 80px;
		}
	}

	&::before {
    position: absolute;
    content: "";
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-image: radial-gradient(circle at 50% 50%, rgba(220, 13, 51, 1) 0%, rgba(0, 188, 212, 0) 60%, rgba(238, 130, 238, 0) 100%);
    z-index: 4;
    transition: opacity 0.25s ease-in-out;
    opacity: 0;
  }

	&:hover::before {
    opacity: 1;
  }
`;

export default StatusModal;
