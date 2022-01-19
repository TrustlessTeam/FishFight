import { useState, useEffect } from 'react';

import { useFishPool } from '../context/fishPoolContext';
import { useUnity } from '../context/unityContext';
import { useWeb3React } from '@web3-react/core';

import Account from './Account';
import FishViewer from './FishViewer';
import Menu, { MenuItem } from './Menu';
import { BaseContainer, ContainerControls, BaseLinkButton } from './BaseStyles';
import { ToggleGroup, ToggleOption } from './ToggleButton';

enum FishView {
	Ocean,
	User
}

const Ocean = () => {
	const { userFish, oceanFish } = useFishPool();
	const [fishToShow, setFishToShow] = useState<number>(FishView.Ocean);

	const [renderedFish, setRenderedFish] = useState<number[]>([]);
	const unityContext = useUnity();
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
		setRenderedFish(prevData => []);
		if(fishToShow === FishView.User) {
			console.log("Show Tank")
			// console.log(oceanFish)
			if(!unityContext.isFishPoolReady) return;
			let i = 0;
			userFish.forEach(fish => {
				if(!renderedFish.includes(fish.tokenId)) {
					unityContext.addFishTank(fish);
					setRenderedFish(prevData => [...prevData, fish.tokenId])
					i++;
				}
			})
			console.log(i)
			unityContext.showTank();
		}
		if(fishToShow === FishView.Ocean) {
			console.log("Show Ocean")
			// console.log(oceanFish)
			if(!unityContext.isFishPoolReady) return;
			let i = 0;
			oceanFish.forEach(fish => {
				if(!renderedFish.includes(fish.tokenId)) {
					unityContext.addFishOcean(fish);
					setRenderedFish(prevData => [...prevData, fish.tokenId])
					i++;
				}
			})
			console.log(i)
			unityContext.showOcean();
		}
	}, [unityContext.isFishPoolReady, fishToShow, oceanFish, userFish]);

	useEffect(() => {
		console.log("CLEAR OCEAN")
		unityContext.clearFishPool('ShowOcean')
	}, []);

	useEffect(() => {
		console.log("Account changed")
		if(account) {
			setFishToShow(FishView.User)
		} else {
			setFishToShow(FishView.Ocean)
		}
	}, [account]);

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
	// 	unityContext.showOcean();
	// }, [unityContext.isFishPoolReady]);

	return (

		<BaseContainer>
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

				<FishViewer fishCollection={fishToShow === FishView.Ocean ? oceanFish : userFish} onClick={unityContext.showFish}></FishViewer>
		</BaseContainer>
		
	);
};

export default Ocean;
