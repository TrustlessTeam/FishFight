import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useWeb3React } from '@web3-react/core';
import { Fish } from '../utils/fish'
import { useFishFight } from '../context/fishFightContext';
import { useUnity } from '../context/unityContext';
import { useFishPool } from '../context/fishPoolContext';
import web3 from 'web3';
import { ApprovalDisclaimer, ApprovalsContainer, BaseButton, BaseOverlayContainer, ContainerControls, OptionsContainer } from './BaseStyles';
import { Constants } from '../utils/constants';
import { useContractWrapper } from '../context/contractWrapperContext';
import Account from './Account';


const FishingWaters = () => {
	const unityContext = useUnity()
	const { account } = useWeb3React();
	const { currentPhase, FishFight, maxSupply, totalSupply, refetchBalance } = useFishFight()
	const { createUserFish } = useFishPool();
	const { contractApproveFoodForTraining } = useContractWrapper();

	const [caughtFish, setCaughtFish] = useState<Fish | null>(null);
	const [caughtFishHash, setCaughtFishHash] = useState<string | null>(null);
	const [noCatch, setNoCatch] = useState<boolean>(false);
	const [pendingTransaction, setPendingTransaction] = useState<boolean>(false);
	const [diceRoll, setDiceRoll] = useState<number>(0);

	useEffect(() => {
		unityContext.showFishingLocation();
		unityContext.hideUI();
	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		if(account) {
			unityContext.clearUIFish();
			unityContext.hideUI();
			unityContext.showFishingUI();
		}
	}, [account]);

	useEffect(() => {
		unityContext.UnityInstance.on('UISelectionConfirm', function (data: any) {
			console.log('UI changed catch fish');
			console.log(data)
			switch (data) {
				case 'mint_fish':
					catchFish();
					return;
				default:
					return;
			}
			
		});
	}, [unityContext.isFishPoolReady, account]);

	const getUserFish = async (tokenId: number) => {
		console.log(tokenId)
		const newFish = await createUserFish(tokenId)
		if(newFish != null) {
			console.log(newFish)
			setCaughtFish(newFish)
			unityContext.addFishFishing(newFish);
		}
	}


	const catchFish = async () => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		
		if(FishFight.type == 'web3') {
			const provider = FishFight.provider as web3;
			if(await provider.eth.getChainId() != 1666700000) {
				toast.error('Wrong Network');
				return;
			}
		}
		console.log("catch fish")
		setNoCatch(false);
		setCaughtFish(null);
		setCaughtFishHash(null);
		unityContext.clearFishPool('showFishingLocation');
		try {
			await FishFight.fishingWaters?.methods.goFishing().send({
				from: account,
				gasPrice: 30000000000,
				gasLimit: 500000,
				// gasLimit: await FishFight.fishingWaters?.methods.goFishing().estimateGas({from: account, value: web3.utils.toWei(COSTPERCASTONE)}),
				value: Constants._fishingPrice
			}).on('transactionHash', () => {
				setPendingTransaction(true);
			}).on('receipt', (result: any) => {
				console.log(result)
				if(result.events.FishingResult.returnValues.index == 0) {
					console.log("set no catch")
					setNoCatch(true);
					setDiceRoll(result.events.FishingResult.returnValues.roll)
					setPendingTransaction(false);
					toast.success('Missed `Em!', {
						onClose: async () => {
							refetchBalance()
						},
					});
					return;
				}

				setCaughtFishHash(result.transactionHash)
				getUserFish(result.events.FishingResult.returnValues.index);
				setPendingTransaction(false);
				toast.success('Fish Caught!', {
					onClose: async () => {
						refetchBalance()
					},
				});
			})
		} catch (error: any) {
			toast.error(error);
			console.log(error)
		}
	};

	const FishingUI = () => {
		return (
			<BaseOverlayContainer
				active={pendingTransaction}
				spinner
				text='Fishing from the blockchain...'>
			{caughtFish && caughtFishHash &&
				<CatchContainer>
					<CaughtFish>
						<FishData><b>Token ID: {caughtFish.tokenId}</b></FishData>
						<FishData>Strength: {caughtFish.strength}</FishData>
						<FishData>Intelligence: {caughtFish.intelligence}</FishData>
						<FishData>Agiltiy: {caughtFish.agility}</FishData>
						<FishData>Rarity: {caughtFish.rarity}</FishData>
						<TransactionLink target="_blank" href={`https://explorer.pops.one/tx/${caughtFishHash}`}>View Transaction</TransactionLink>
					</CaughtFish>
	
					<BaseButton onClick={() => {
						setCaughtFish(null);
						setCaughtFishHash(null);
						unityContext.clearFishPool('showFishingLocation');
					}}>
						Catch another fish!
					</BaseButton>
				</CatchContainer>
			}
			
			{noCatch &&
				<MissedCatchContainer>
					<CaughtFish>
						{/* <Text>Missed the big one! Looks like you caught some $FISHFOOD...</Text> */}
						<Text>{`You rolled a ${diceRoll}, but needed less than ${maxSupply - totalSupply}`}</Text>
					</CaughtFish>
	
					<BaseButton onClick={() => {
						setCaughtFish(null);
						setCaughtFishHash(null);
						setNoCatch(false)
						unityContext.clearFishPool('showFishingLocation');
					}}>
						Try again!
					</BaseButton>
				</MissedCatchContainer>
			}
			{!caughtFish &&
				<InfoContainer>
					<DataContainer>
						<DataText>
							{`Fish Available: ${maxSupply - totalSupply}`}
						</DataText>
						{totalSupply > 10000 ? 
							<DataText>
								{`Chance to Catch: ${(((maxSupply - totalSupply) / maxSupply) * 100).toFixed(2)}%`}
							</DataText>
							:
							<DataText>
								{`Chance to Catch: 100% until ${totalSupply} = 10,000`}
							</DataText>
						}
					</DataContainer>
				</InfoContainer>
			}
			
			
			</BaseOverlayContainer>
		);
	}

	


	if(!unityContext.isFishPoolReady) return null;

	if(account) {
		return (
			<FishingUI></FishingUI>
		)
	} 
	return null;
};

const CatchContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: center;
	height: 100%;
	padding: ${props => props.theme.spacing.gap};
	margin-top: 50px;

	@media ${props => props.theme.device.tablet} {
		width: 25%;
		justify-content: center;
  }
`;

const DataContainer = styled.div`
	background-color: rgba(255, 255, 255, 0.8);
	border-radius: 25px;
	padding: ${props => props.theme.spacing.gap};
`

const InfoContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: flex-start;
	height: 100%;
	margin: 100px;

	@media ${props => props.theme.device.tablet} {
		margin: 120px;
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
	margin-top: ${props => props.theme.spacing.gapSmall};
	/* background-color: white; */
	color: black;
	/* border: 2px solid white; */
	border-radius: 50%;

	& > span {
		margin-left: 4px;
	}

	@media ${props => props.theme.device.tablet} {
		margin: 0;
  }
`;

const TransactionLink = styled.a`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;

const FishData = styled.p`
	display: flex;
	flex-flow: column;
	align-items: center;
	justify-content: center;
	color: ${"black"};
	text-align: center;
	font-size: ${props => props.theme.font.small};
	background-color: rgba(255, 255, 255, 0.7);
	margin: 0 ${props => props.theme.spacing.gapSmall};
	padding: ${props => props.theme.spacing.gapSmall};
	border-radius: 50%;

	@media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.medium};

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
	color: black;
	font-size: ${props => props.theme.font.medium};
	border-radius: 25px;
	margin-left: ${props => props.theme.spacing.gapSmall};

	@media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.large};

  }
`;

export default FishingWaters;
