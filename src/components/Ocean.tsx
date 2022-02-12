import { useState, useEffect } from 'react';

import { useFishPool } from '../context/fishPoolContext';
import { useUnity } from '../context/unityContext';
import { useWeb3React } from '@web3-react/core';

import Account from './Account';
import FishViewer from './FishViewer';
import Menu, { MenuItem } from './Menu';
import { BaseContainer, ContainerControls, BaseLinkButton, BaseOverlayContainer } from './BaseStyles';
import { ToggleGroup, ToggleOption } from './ToggleButton';
import Fish from '../utils/fish';
import { useContractWrapper } from '../context/contractWrapperContext';

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
	const { feedFish, pendingTransaction } = useContractWrapper();
	const { account } = useWeb3React();

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
		unityContext.clearFishPool("Ocean")
		fishToRender.forEach(fish => {
			unityContext.addFishOcean(fish);
		})

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

	return (

		<BaseOverlayContainer
			active={pendingTransaction}
			spinner
			text='Waiting for confirmation...'
			>
				<ContainerControls>
					<ToggleGroup>
						<ToggleOption className={fishToShow === FishView.Ocean ? 'active' : ''} onClick={() => setFishToShow(FishView.Ocean)}>Ocean Fish</ToggleOption>
						<ToggleOption className={fishToShow === FishView.User ? 'active' : ''} onClick={() => setFishToShow(FishView.User)}>My Fish</ToggleOption>
					</ToggleGroup>
					{/* <Menu name={FishView[fishToShow]} items={FishViewOptions}></Menu> */}
					{!account && fishToShow === FishView.User &&
						<Account mobile={false}/>
					}
					{fishToShow === FishView.User && account && userFish?.length === 0 &&
						<BaseLinkButton to={'/catch'}>Catch a Fish!</BaseLinkButton>
					}
				</ContainerControls>

				<FishViewer selectedFish={mySelectedFish} fishCollection={fishToShow === FishView.Ocean ? oceanFish : userFish} onClick={oceanFishClick}></FishViewer>
		</BaseOverlayContainer>
		
	);
};

export default Ocean;
