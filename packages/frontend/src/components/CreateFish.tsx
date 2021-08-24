import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useWeb3React } from '@web3-react/core';
import { toBech32 } from '@harmony-js/crypto';
import { isBech32Address, fromWei, hexToNumber, Units, Unit } from '@harmony-js/utils';

import { Contract } from '@harmony-js/contract';

import { useHarmony } from '../context/harmonyContext';

import { createFishFactoryContract, getFishFactoryContractFromConnector } from '../helpers/contractHelper';

interface Fish {
	tokenId: number;
	name: string;
	birth: Date;
	traits: Array<number>;
}

interface Traits {
	fishType: number;
	isGenisis: number;
}

const catchRates = ["100", "75", "50", "25"];

const CreateFish = () => {
	const [randomValue, setRandomValue] = useState('0');
	const { hmy, fetchBalance } = useHarmony();
	const [contract, setContract] = useState<Contract | null>(createFishFactoryContract(hmy));
	const [myFish, setMyFish] = useState<Fish[]>([]);
	const [myFishCount, setMyFishCount] = useState(0);
	const [fishName, setFishName] = useState("Name Your Fish")
	const [contractBalance, setContractBalance] = useState("");

	const { account, connector, library } = useWeb3React();
	
	useEffect(() => {
		if (!account) {
			setContract(null);
		}
	}, [account]);

	useEffect(() => {
		if (connector) {
			(async () => {
				const contract = await getFishFactoryContractFromConnector(connector, library);
				setContract(contract);
				getContractBalance();
				loadUsersFish(contract);
			})();
		}
	}, [connector, setContract]);

	const loadUsersFish = async (contract : Contract) => {
		console.log(account)
		console.log(contract)
		const fishUserOwns = await contract.methods.balanceOf(account).call();
		console.log(fishUserOwns)
		setMyFishCount(fishUserOwns);
		const tempFish = [];
		for(let i = 0; i < fishUserOwns; i++) {
			const tokenId = await contract.methods.tokenOfOwnerByIndex(account, i).call();
			const fishInfo = await contract.methods.getFishInfo(tokenId).call();
			console.log(fishInfo.traits)
			const fish = {
				tokenId: tokenId,
				name: fishInfo.name,
				birth: fishInfo.birth,
				traits: parseTraits(fishInfo.traits)
			};
			tempFish.push(fish);
		}
		setMyFish(tempFish);
	}

	const getContractBalance = async () => {
		if (contract) {
			try {
				const balance = await contract.methods.getContractBalance().call();
				const parsedBalance = fromWei(balance, Units.one);
				setContractBalance(parsedBalance);
			} catch (error) {
				console.error(error);
			}
		}
	};

	const rollDice = async () => {
		if (contract) {
			try {
				const diceRoll = await contract.methods.diceRoll().call();
				console.log(diceRoll)
			} catch (error) {
				console.error(error);
			}
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFishName(e.target.value);
	}

	function parseTraits(traits : string) {
		const hashPairs = [];

		for (let j = 0; j < 32; j++) {
				hashPairs.push(traits.slice(2 + (j * 2), 4 + (j * 2)));
		}
		const decPairs = hashPairs.map(x => {
				return parseInt(x, 16);
		});


		console.log(decPairs);
		return decPairs;
	}

	const handleClickCatch = (value: string, name: string) => async () => {
		if (account && contract) {
			try {
				const fish = await contract.methods.catchFish(name).send({
					from: account,
					gasPrice: 1000000000,
					gasLimit: 210000,
					value: new Unit(value).asOne().toWei(),
				});
				console.log(fish);
				toast.success('Transaction done', {
					onClose: async () => {
						getContractBalance()
						loadUsersFish(contract)
					},
				});
			} catch (error) {
				toast.error(error);
			}
		} else {
			toast.error('Connect your wallet');
		}
	};

	return (
		<CreateFishComponent>
			<Wrapper>
				Contract Balance:
				<TotalStaked>{contractBalance}</TotalStaked>
			</Wrapper>
			<FlexGrid>
			{catchRates.map((rate, index) => (
				<CatchFishButton key={index} onClick={handleClickCatch(rate, fishName)}>
					{rate}% Catch Rate for {rate} ONE
				</CatchFishButton>
			))}
			</FlexGrid>
			<form>
				<label>
					Fish Name:
					<input type="text" value={fishName} onChange={handleChange} />
				</label>
			</form>
			<h1>Fished Owned: {myFishCount}</h1>
			<FlexGrid>
			{myFish.map((fish, index) => (
					<FishNFT key={index}>
						<FishName>{fish.name}</FishName>
						<FishData>{fish.birth}</FishData>
						<FishData>{fish.traits}</FishData>
					</FishNFT>
				))}
			</FlexGrid>
			<CatchFishButton onClick={rollDice}>
					Roll Dice
				</CatchFishButton>
		</CreateFishComponent>
	);
};

const CreateFishComponent = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 50%;
`;

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: -10vh;
	padding: 40px 60px;
	border-radius: 25px;
	width: 100%;
	background-color: white;
	box-shadow: 2px 8px 10px 4px rgba(0, 0, 0, 0.3);
	color: #a70000;
	font-size: 1.5rem;
`;

const FlexGrid = styled.div`
	display: flex;
	flex-flow: row wrap;
	justify-content: center;
	width: 100%;
`;

const FishNFT = styled.div`
	flex: 1;
	border-radius: 25px;
	width: 100%;
	padding: 15px;
	background-color: white;
	box-shadow: 2px 8px 10px 4px rgba(0, 0, 0, 0.3);
`;

const FishName = styled.h3`
	color: ${"black"};
`;

const FishData = styled.p`
	color: ${"black"};
`;

const CatchFishButton = styled.button`
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: rgba(255, 255, 255, 0.7);
	color: black;
	padding: 20px 20px;
	border-radius: 10px;
	box-shadow: 1px 2px 4px 4px rgba(0, 0, 0, 0.2);
	font-size: 1.5rem;
	transition: background-color 0.3s ease;

	&:hover {
		background-color: rgba(255, 255, 255, 1);
		cursor: pointer;
	}

	span {
		font-size: 1rem;
		margin-left: 8px;
		align-self: flex-end;
	}
`;

const TotalStaked = styled.div`
	font-size: 3.5rem;
	margin-top: 16px;
	color: black;
`;

export default CreateFish;
