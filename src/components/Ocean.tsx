import { useState, useEffect } from 'react';

import { useFishPool } from '../context/fishPoolContext';
import { useUnity } from '../context/unityContext';
import { useWeb3React } from '@web3-react/core';

import Account from './Account';
import FishViewer from './FishViewer';
import Menu, { MenuItem } from './Menu';
import { BaseContainer, ContainerControls, BaseLinkButton, BaseOverlayContainer, ApprovalsContainer, ApprovalDisclaimer, OptionsContainer, BaseButton } from './BaseStyles';
import { ToggleGroup, ToggleOption } from './ToggleButton';
import Fish from '../utils/fish';
import { useContractWrapper } from '../context/contractWrapperContext';
import { useFishFight } from '../context/fishFightContext';
import FishDrawer from './FishDrawer';

enum FishView {
	Ocean,
	User
}

const Ocean = () => {
	const { userFish, oceanFish } = useFishPool();
	const [fishToShow, setFishToShow] = useState<number>(FishView.Ocean);
	const [mySelectedFish, setMySelectedFish] = useState<Fish | null>(null);

	const [renderedFish, setRenderedFish] = useState<number[]>([]);
	const unityContext = useUnity();
	const { feedFish, contractApproveFoodForTraining, pendingTransaction } = useContractWrapper();
	const { account } = useWeb3React();
	const { trainingFoodApproval } = useFishFight();


	const FishViewOptions: MenuItem[] = [
		{
			name: 'Ocean Fish',
			onClick: () => setFishToShow(FishView.Ocean)
		},
		{
			name: 'My Fish',
			onClick: () => setFishToShow(FishView.User)
		}
	]

	useEffect(() => {
		unityContext.UnityInstance.on('UISelectionConfirm', function (data: any) {
			console.log(data)
			if(data == 'feed_confirm') {
				console.log('feed')
				feedFish(mySelectedFish)
			}
			
		});
	}, [unityContext.isFishPoolReady, mySelectedFish]);

	useEffect(() => {
		console.log("CLEAR OCEAN")
		unityContext.clearUIFish();
		unityContext.hideUI();
		unityContext.showOceanLocation();
	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		if(!unityContext.isFishPoolReady) return;

		let fishToRender = fishToShow === FishView.Ocean ? oceanFish : userFish;
		fishToRender.forEach(fish => {
			if(renderedFish.some(prevTokenId => prevTokenId === fish.tokenId)) return;
			unityContext.addFishOcean(fish);
			setRenderedFish(prevTokens => [...prevTokens, fish.tokenId])
		})
		
		// if(mySelectedFish != null) {
		// 	let matchingUserFish = userFish.find(fish => fish.tokenId === mySelectedFish.tokenId);
		// 	let matchingOceanFish = oceanFish.find(fish => fish.tokenId === mySelectedFish.tokenId);
		// 	if(matchingUserFish != null) {
		// 		unityContext.showFish(matchingUserFish)
		// 	} else if(matchingOceanFish != null) {
		// 		unityContext.showFish(matchingOceanFish)
		// 	}
		// }
	}, [unityContext.isFishPoolReady, fishToShow, oceanFish, userFish]);

	

	// useEffect(() => {
	// 	console.log("CLEAR OCEAN")
	// 	unityContext.clearFishPool('showOceanLocation')
	// 	unityContext.showOceanLocation();
	// }, []);

	useEffect(() => {
		console.log("Account changed")
		if(account) {
			setFishToShow(FishView.User)
		} else {
			setFishToShow(FishView.Ocean)
		}
	}, [account]);

	const oceanFishClick = (fish: Fish) => {
		setMySelectedFish(fish);
		unityContext.showFish(fish)
	}

	// useEffect(() => {
	// 	console.log("Ocean Fish Changed")
	// 	// console.log(oceanFish)
	// 	if(!unityContext.isFishPoolReady) return;
	// 	let i = 0;
	// 	oceanFish.forEach(fish => {
	// 		if(!renderedFish.includes(fish.tokenId)) {
	// 			unityContext.addFishOcean(fish);
	// 			setRenderedFish(prevData => [...prevData, fish.tokenId])
	// 			i++;
	// 		}
	// 	})
	// 	console.log(i)
	// }, [oceanFish, unityContext.isFishPoolReady]);

	// useEffect(() => {
	// 	unityContext.showOceanLocation();
	// }, [unityContext.isFishPoolReady]);
	const ApprovalUI = () => {
		return (
				<ApprovalDisclaimer>
					<p>Approval Required: Training contract approval to control your $FISH is required for $FISH interations.</p>
					<OptionsContainer>
						{!trainingFoodApproval &&
							<BaseButton onClick={() => contractApproveFoodForTraining()}>{'Approve $FISHFOOD'}</BaseButton>
						}
					</OptionsContainer>
				</ApprovalDisclaimer>
		)
	}

	if(account && !trainingFoodApproval) {
		return (
			<ApprovalsContainer
			active={pendingTransaction}
			spinner
			text='Waiting for confirmation...'
			>
				<ContainerControls>
					<ApprovalUI></ApprovalUI>
				</ContainerControls>
			</ApprovalsContainer>
		)
	}

	const ViewOptions = () => {
		return (
			<>
				<ToggleGroup>
					<ToggleOption className={fishToShow === FishView.Ocean ? 'active' : ''} onClick={() => setFishToShow(FishView.Ocean)}>Ocean Fish</ToggleOption>
					<ToggleOption className={fishToShow === FishView.User ? 'active' : ''} onClick={() => setFishToShow(FishView.User)}>My Fish</ToggleOption>
				</ToggleGroup>
				{/* <Menu name={FishView[fishToShow]} items={FishViewOptions}></Menu> */}
				{!account && fishToShow === FishView.User &&
					<Account mobile={false}/>
				}
				{fishToShow === FishView.User && userFish?.length === 0 &&
					<BaseLinkButton to={'/fishing'}>Catch a Fish!</BaseLinkButton>
				}
			</>
		)
	}


	return (

		<BaseOverlayContainer
			active={pendingTransaction}
			spinner
			text='Waiting for confirmation...'
			>
				{account && fishToShow === FishView.User && !trainingFoodApproval &&

						<ContainerControls>

							<ApprovalUI></ApprovalUI>

						</ContainerControls>

				}
				{/* <FishDrawer fishCollection={oceanFish}></FishDrawer> */}
				{fishToShow === FishView.Ocean &&
					<FishDrawer selectedOpponent={mySelectedFish} fishCollection={oceanFish} onClick={oceanFishClick}>
						<ViewOptions></ViewOptions>
					</FishDrawer>
				}
				{fishToShow === FishView.User &&
					<FishDrawer selectedFish={mySelectedFish} fishCollection={userFish} onClick={oceanFishClick}>
						<ViewOptions></ViewOptions>
					</FishDrawer>
				}
				
		</BaseOverlayContainer>
		
	);
};

export default Ocean;
