import { useEffect, useState } from 'react';
import { Link, Outlet } from "react-router-dom";
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useWeb3React } from '@web3-react/core';
import BN from 'bn.js';
import useHorizontalScroll from "../utils/horizontalScrolling";

import { Fish } from '../utils/fish'
import { Fight} from '../utils/fight'
import { useFishFight } from '../context/fishFightContext';
import { useUnity } from '../context/unityContext';
import FishNFT from './FishNFT';
import { useFishPool } from '../context/fishPoolContext';
import Account from './Account';
import UserFightingWaters from './UserFightingWaters';
import FishViewer from './FishViewer';
import Menu from './Menu';
import { BaseContainer, ContainerControls, BaseLinkButton } from './BaseStyles';


enum ViewToShow {
  AllFightingFish,
  UserFightingFish,
	UserFish,
	StartFight,
	ViewStakedFish,
	JoinFightingWaters
}

const ModeOptions = ['View', 'My Fighting Fish', 'Withdraw', 'Fight']


const FightingWaters = () => {
	const unityContext = useUnity();

	useEffect(() => {
		console.log("UserFightingFish")
		unityContext.showFight();
	}, [unityContext.isFishPoolReady]);

	return (
		<Outlet />
	);
};

interface GridProps {
	ref?: any;
}

const Title = styled.h1`
	display: flex;
	flex-flow: column;
	justify-content: center;
	padding: ${props => props.theme.spacing.gap};
	margin: 0;
	color: white;
	/* background-color: white; */
	/* font-size: ${props => props.theme.font.large}vmin; */
	border-radius: 25px;
	/* margin-left: ${props => props.theme.spacing.gapSmall}; */
`;


const VersusContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

const GameButton = styled.button`
	display: flex;
	flex-flow: column;
	justify-content: center;
	padding: 2.2vmin;
	border-radius: 25px;
	background-color: white;
	border: none;
	opacity: 0.7;
	box-shadow: 1px 2px 4px 4px rgba(0, 0, 0, 0.25);
	color: black;
	margin-left: ${props => props.theme.spacing.gapSmall};
	transition: opacity 0.3s ease, box-shadow 0.25s ease-in-out;
	text-transform: uppercase;
	font-weight: bolder;
	text-decoration: none;
	font-size: ${props => props.theme.font.medium}vmin;
	pointer-events: auto;

	&:hover {
		opacity: 1;
		box-shadow: 1px 2px 2px 2px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}
`;

const CatchButton = styled(Link)`
	display: flex;
	flex-flow: column;
	justify-content: center;
	padding: 2.2vmin;
	border-radius: 25px;
	background-color: white;
	border: none;
	opacity: 0.7;
	box-shadow: 1px 2px 4px 4px rgba(0, 0, 0, 0.25);
	color: black;
	margin-left: ${props => props.theme.spacing.gapSmall};
	transition: opacity 0.3s ease, box-shadow 0.25s ease-in-out;
	text-transform: uppercase;
	font-weight: bolder;
	text-decoration: none;
	font-size: ${props => props.theme.font.medium}vmin;

	&:hover {
		opacity: 1;
		box-shadow: 1px 2px 2px 2px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}
`;

const FightingWatersContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	width: 100%;
	height: 100%;
`;

const FishingWatersControl = styled.div`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	position: absolute;
	top: 10%;
	width: 100%;
	pointer-events: auto;
	/* height: 17%; */
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



export default FightingWaters;
