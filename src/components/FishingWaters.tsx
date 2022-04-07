import { useEffect } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { useFishFight } from '../context/fishFightContext';
import { useUnity } from '../context/unityContext';
import { BaseContainer } from './BaseStyles';
import { useContractWrapper } from '../context/contractWrapperContext';
import BaseButton from "../components/BaseButton";
import web3 from 'web3';
import Countdown, {zeroPad} from 'react-countdown';
import { Constants } from '../utils/constants';

type RenderProps = {
	hours: any;
	minutes: any;
	seconds: any;
	completed: boolean;
}



const FishingWaters = () => {
	const unityContext = useUnity()
	const { account } = useWeb3React();
	const { maxSupply, totalSupply, currentPhase } = useFishFight()
	const { catchFish, clearCatchFishResult, catchFishResult } = useContractWrapper();

	

	useEffect(() => {
		unityContext.showFishingLocation();
		clearCatchFishResult();
	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		unityContext.UnityInstance.on('UISelectionConfirm', function (data: any) {
			// console.log('UI changed catch fish');
			// console.log(data)
			switch (data) {
				case 'mint_fish':
					catchFish();
					return;
				case 'fishingresults_confirm':
					unityContext.showFishingUI();
					return;
				default:
					return;
			}

		});
	}, [unityContext.isFishPoolReady, account]);

	const renderer = ({ hours, minutes, seconds, completed }: RenderProps) => {
		// Render a countdown
		return <DataText>{hours}:{zeroPad(minutes)}:{zeroPad(seconds)}</DataText>;

	};

	const FishingUI = () => {
		if(!currentPhase) return(<></>)

		let timeTilPhase = currentPhase.phase === 2 ? currentPhase.phaseEndtime + (Constants._breedPhaseLength) : currentPhase.phaseEndtime;

		return (
			<BaseContainer>
			{catchFishResult != null && !catchFishResult.success &&
				<MissedCatchContainer>
					<CaughtFish>
						{/* <Text>Missed the big one! Looks like you caught some $FISHFOOD...</Text> */}
						<Text>{`You rolled a ${catchFishResult?.roll}, but needed less than ${maxSupply - totalSupply}`}</Text>
					</CaughtFish>

					<BaseButton onClick={() => {
						clearCatchFishResult();
					}}>
						Try again!
					</BaseButton>
				</MissedCatchContainer>
			}

			<InfoContainer>
				<DataContainer>
					{currentPhase.phase === 1 ?
						<DataText>
							{`Cost: ${web3.utils.fromWei(Constants._fishingPriceInPhase)} ONE ->`} 
							<StyledCountdown><Countdown renderer={renderer} date={new Date(currentPhase.phaseEndtime * 1000)} /></StyledCountdown>
							{`then ${web3.utils.fromWei(Constants._fishingPrice)} ONE`} 
						</DataText>
						:
						<DataText>
							{`Cost: ${web3.utils.fromWei(Constants._fishingPrice)} ONE ->`} 
							<StyledCountdown><Countdown renderer={renderer} date={new Date(timeTilPhase * 1000)} /></StyledCountdown>
							{`then ${web3.utils.fromWei(Constants._fishingPriceInPhase)} ONE`} 
						</DataText>
					}
					
					<DataText>
						{`Fish Left: ${maxSupply - totalSupply} -> Chance: ${totalSupply > 10000 ? (((maxSupply - totalSupply) / maxSupply) * 100).toFixed(2) : 100}%`}
					</DataText>

				</DataContainer>
			</InfoContainer>

			</BaseContainer>
		);
	}




	if(!unityContext.isFishPoolReady) return null;


	return (
		<FishingUI></FishingUI>
	)
};

const StyledCountdown = styled.span`
	padding: 0 3px;
`;

const DataContainer = styled.div`
	display: flex;
	flex-flow: column;
	background-color: rgba(255, 255, 255, 0.8);
	border-radius: 10px;
	padding: ${props => props.theme.spacing.gap};
`

const InfoContainer = styled.div`
	display: flex;
	flex-direction: row nowrap;
	justify-content: center;
	align-items: flex-start;
	height: 100%;
	width: 100%;
	margin-top: 70px;
	pointer-events: none;

	@media ${props => props.theme.device.tablet} {
		margin-top: 120px;
  }
`;

const CaughtFish = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background-color: white;
	padding: ${props => props.theme.spacing.gap};
	margin: ${props => props.theme.spacing.gap};
	border-radius: 25px;
`;

const DataText = styled.p`
	display: flex;
	flex-flow: row;
	justify-content: center;
	align-items: center;
	color: black;
	border-radius: 20px;
	margin: 0;

	padding-bottom: ${props => props.theme.spacing.gapSmall};

	&:last-child{
		padding-bottom: 0;
	}

	& > span {
		margin-left: 4px;
	}

	@media ${props => props.theme.device.tablet} {
		margin: 0;
  }
`;

const MissedCatchContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 100%;
	@media ${props => props.theme.device.tablet} {
		justify-content: center;
  }
`;

const Text = styled.p`
	display: flex;
	flex-flow: column;
	justify-content: center;
	align-items: center;
	padding: ${props => props.theme.spacing.gap};
	margin: 0;
	background-color: white;
	color: #61daff;
	font-size: ${props => props.theme.font.medium};
	border-radius: 25px;
	margin-left: ${props => props.theme.spacing.gapSmall};

	@media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.large};

  }
`;


export default FishingWaters;
