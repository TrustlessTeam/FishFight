import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useWeb3React } from '@web3-react/core';
import BN from 'bn.js';
import { Fish } from '../utils/fish'
import { Fight} from '../utils/fight'
import { useFishFight } from '../context/fishFightContext';
import { useUnity } from '../context/unityContext';
import { hexToNumber, Unit } from '@harmony-js/utils';
import FishNFT from './FishNFT';
import { useFishPool } from '../context/fishPoolContext';
import { BaseContainer, ContainerControls,  BaseButton, BaseOverlayContainer } from './BaseStyles';
import FishViewer from './FishViewer';
import Menu, { MenuItem } from './Menu';
import web3 from 'web3';

enum FishSelectionEnum {
  UserBreedingFish,
  UserFish
}

enum BreedingSelectionEnum {
  MyFishToBreed,
	FishToBreedWith
}

const StartBreed = () => {
	const { FishFight, refetchBalance } = useFishFight()
	const { userFish, breedingFish, userBreedingFish, refreshFish, createUserFish } = useFishPool()

	// Fish selected for fight
	const [myBettaFish, setMyBettaFish] = useState<Fish | null>(null);
	const [alphaFish, setAlphaFish] = useState<Fish | null>(null);
	const [breederSelectionToShow, setBreederSelectionToShow] = useState<number>(BreedingSelectionEnum.MyFishToBreed);
	const [fishSelectionToShow, setFishSelectionToShow] = useState<number>(FishSelectionEnum.UserFish);
	const [breedResult, setBreedResult] = useState<Fish | null>();
	const [showBreedResult, setShowBreedResult] = useState(false);
	const [isBreeding, setIsBreeding] = useState<boolean>(false);
	const [pendingTransaction, setPendingTransaction] = useState<boolean>(false);


	// Context
	const { account } = useWeb3React();
	const unityContext = useUnity();

	const FishViewOptions: MenuItem[] = [
		// {
		// 	name: 'My Fighting Fish',
		// 	onClick: () => setFishSelectionToShow(FishSelectionEnum.UserBreedingFish)
		// },
		{
			name: 'My Betta Fish',
			onClick: () => setFishSelectionToShow(FishSelectionEnum.UserFish)
		}
	]

	const BreederSelectionOptions: MenuItem[] = [
		{
			name: 'Select Fish to Breed',
			onClick: () => setBreederSelectionToShow(BreedingSelectionEnum.MyFishToBreed)
		},
		{
			name: 'Select Alpha to Breed with',
			onClick: () => setBreederSelectionToShow(BreedingSelectionEnum.FishToBreedWith)
		}
	]

	useEffect(() => {
		unityContext.showFight();
	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		unityContext.UnityInstance.on('FishPoolFightWinner', function () {
			console.log('Confirm FishPoolFightWinner');
			setShowBreedResult(true);
		});
		unityContext.UnityInstance.on('FishPoolFightTie', function () {
			console.log('Confirm FishPoolFightTie');
			setShowBreedResult(true);
		});
	}, [unityContext.isFishPoolReady]);

	const setAlpha = (fish : Fish) => {
		console.log("Alpha Fish: " + fish.tokenId)
		//unityContext.clearFishPool('ShowFight');
		if(myBettaFish != null) {
			unityContext.addFishFight2(myBettaFish);
		}
		setAlphaFish(fish);
		unityContext.addFishFight2(fish)
	}

	const setUserFish = async (fish : Fish) => {
		console.log("UserSelected Fish: " + fish.tokenId)
		//unityContext.clearFishPool('ShowFight');
		if(alphaFish != null) {
			unityContext.addFishFight1(alphaFish);
		}
		setMyBettaFish(fish);
		unityContext.addFishFight1(fish)
	}

	const contractApprove = () => {
		return FishFight.fishFood?.methods.approve(FishFight.readBreedingWaters.options.address, new Unit(100).asOne().toWei()).send({
			from: account,
			gasPrice: 1000000000,
			gasLimit: 300000,
		}).on('transactionHash', () => {
			setPendingTransaction(true);
		})
	}

	const contractBreed = (fishAlpha: Fish, fishBetta: Fish) => {
		return FishFight.breedingWaters?.methods.breedFish(fishAlpha.tokenId, fishBetta.tokenId).send({
			from: account,
			gasPrice: 1000000000,
			gasLimit: 1500000,
			value: new Unit(50).asOne().toWei()
		}).on('transactionHash', () => {
			setPendingTransaction(true);
		}).on('receipt', async (data: any) => {
			console.log(data)
			setPendingTransaction(false);
			setFishSelectionToShow(FishSelectionEnum.UserFish)
			const fish = await createUserFish(web3.utils.toNumber(data.events.BreedingResult.returnValues.tokenId));
			if(fish != null) {
				unityContext.showFish(fish);
			}
			toast.success('Transaction done', {
				onClose: async () => {
					refetchBalance()
				},
			});
			setIsBreeding(false);
		})
	}

	const breedFish = async () => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(myBettaFish == null) {
			toast.error('Select Your Fish to Breed');
			return;
		}
		if(alphaFish == null) {
			toast.error('Select Fish to Breed with');
			return;
		}

		try {
			if(FishFight.type === 'web3') {
				const web3WalletProvider = FishFight.providerWallet as web3;
				const approveAndBreed = new web3WalletProvider.BatchRequest();
				approveAndBreed.add(
					contractApprove()
				);
				approveAndBreed.add(
					contractBreed(alphaFish, myBettaFish)
				);
				console.log("Batch call execute")
				approveAndBreed.execute();
			} else {
				await contractApprove()
				await contractBreed(alphaFish, myBettaFish)
			}
		} catch (error: any) {
			console.log(error)
			// toast.error(error);
			// setIsBreeding(false)
			// setMyBettaFish(null)
			// setAlphaFish(null)
		}
	};

	const breedAgain = () => {
		setBreedResult(null)
		setIsBreeding(false)
		setMyBettaFish(null)
		setAlphaFish(null)
		setShowBreedResult(false);		
	}

	return (
		<>
		{/* Select Fish to Fight */}
		{!breedResult && !isBreeding &&
			<BaseOverlayContainer
			active={pendingTransaction}
			spinner
			text='Waiting for confirmation...'>
				{
					<FightGrid>
						{myBettaFish &&
							<FishNFT selectedUser={true} fish={myBettaFish}></FishNFT>
						}
						<VersusContainer>
							<Text>with</Text>
							{myBettaFish != null && alphaFish != null ?
								<BaseButton onClick={() => breedFish()}>
									Breed Fish
								</BaseButton>
								:
								<Text>Select Fish to Breed</Text>
							}
						</VersusContainer>
						{alphaFish &&
							<FishNFT selectedOpponent={true} fish={alphaFish}></FishNFT>
						}
					</FightGrid>
				}
				<ContainerControls>
					<Menu name={BreedingSelectionEnum[breederSelectionToShow]} items={BreederSelectionOptions}></Menu>
					{breederSelectionToShow === BreedingSelectionEnum.MyFishToBreed &&
						<Menu name={FishSelectionEnum[fishSelectionToShow]} items={FishViewOptions}></Menu>
					}
				</ContainerControls>
				{breederSelectionToShow === BreedingSelectionEnum.MyFishToBreed &&
					<FishViewer selectedFish={myBettaFish} fishCollection={fishSelectionToShow === FishSelectionEnum.UserBreedingFish ? userBreedingFish : userFish} onClick={setUserFish}></FishViewer>
				}
				{breederSelectionToShow === BreedingSelectionEnum.FishToBreedWith &&
					<FishViewer selectedOpponent={alphaFish} fishCollection={breedingFish} onClick={setAlpha}></FishViewer>
				}
			</BaseOverlayContainer>
		}

		{/* Fish are Fighting */}
		{isBreeding && myBettaFish && alphaFish &&
			<BaseOverlayContainer
			active={pendingTransaction}
			spinner
			text='Waiting for confirmation...'>
				<FightGrid >
					<FishNFT selectedUser={true} fish={myBettaFish}></FishNFT>
					<VersusContainer>
						<Text>with</Text>
						<Text>Awaiting breeding results from blockchain...</Text>
					</VersusContainer>
					<FishNFT selectedOpponent={true} fish={alphaFish}></FishNFT>
				</FightGrid>
			</BaseOverlayContainer>
		}

		{/* Show Breed Results */}
		{breedResult && myBettaFish && alphaFish &&
			<BaseOverlayContainer
			active={pendingTransaction}
			spinner
			text='Waiting for confirmation...'>
				<ContainerControls>
					<BaseButton onClick={() => breedAgain()}>
						Breed More Fish!
					</BaseButton>
				</ContainerControls>
				<FightGrid>
					<FishNFT selectedUser={true} fish={myBettaFish}></FishNFT>
					{showBreedResult ? 
					<ResultContainer>
						<ResultData>New Fish</ResultData>
					</ResultContainer>
					:
					<VersusContainer><Text>Breed Results</Text></VersusContainer>
					}
					
					<FishNFT selectedOpponent={true} fish={alphaFish}></FishNFT>
				</FightGrid>
			</BaseOverlayContainer>
		}
		</>
	);
};

const VersusContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

const FightGrid = styled.div`
	display: flex;
	flex-direction: row nowrap;
	justify-content: center;
	/* height: 72%; */
	overflow-y: hidden;
	overflow-x: auto;
	pointer-events: auto;
`;

const Text = styled.p`
	display: flex;
	flex-flow: column;
	justify-content: center;
	padding: ${props => props.theme.spacing.gap};
	margin: 0;
	background-color: white;
	font-size: ${props => props.theme.font.large}vmin;
	border-radius: 25px;
	margin-left: ${props => props.theme.spacing.gapSmall};
`;

const ResultData = styled.p`
	color: ${"black"};
	font-size: ${props => props.theme.font.medium}vmin;
	margin: 0;
`;

const ResultContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background-color: white;
	padding: ${props => props.theme.spacing.gap};
	margin: ${props => props.theme.spacing.gap};
	border-radius: 25px;
`;



export default StartBreed;
