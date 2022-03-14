import React from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import BaseButton from "../components/BaseButton";
import { useFishFight } from '../context/fishFightContext';


export interface Props {
	
}

const Phase = () => {

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

	// const handleClick = () => {
	// 	deactivate();
	// 	closeModal();
	// };

	return (
		<div>

		</div>

	// 	<CircleContainer>
	// 		{/* <a href='#' className='center'><img src='http://imgsrc.hubblesite.org/hu/db/images/hs-2003-28-a-thumb.jpg'></a> */}
	// 		<Deg45><a>Fishing</a></Deg45>
	// 		<Deg135><a>Fishing</a></Deg135>
	// 		<Deg270><a>Fishing</a></Deg270>

	// 		{/* <a href='#' className='deg0'><img src='http://imgsrc.hubblesite.org/hu/db/images/hs-1994-02-c-thumb.jpg'></a>
	// 		<a href='#' className='deg45'><img src='http://imgsrc.hubblesite.org/hu/db/images/hs-2005-37-a-thumb.jpg'></a>
	// 		<a href='#' className='deg135'><img src='http://imgsrc.hubblesite.org/hu/db/images/hs-2010-26-a-thumb.jpg'></a>
	// 		<a href='#' className='deg180'><img src='http://imgsrc.hubblesite.org/hu/db/images/hs-2004-27-a-thumb.jpg'></a>
	// 		<a href='#' className='deg225'><img src='http://imgsrc.hubblesite.org/hu/db/images/hs-1992-17-a-thumb.jpg'></a>
	// 		<a href='#' className='deg315'><img src='http://imgsrc.hubblesite.org/hu/db/images/hs-2004-32-d-thumb.jpg'></a> */}
	// 	</CircleContainer>
	// );
	)
};



export default Phase;


const CircleContainer = styled.div`
	position: relative;
	width: 12em;
	height: 12em;
	padding: 2.8em; /*= 2em * 1.4 (2em = half the width of an img, 1.4 = sqrt(2))*/
	border: dashed 1px;
	border-radius: 50%;
	margin: 0.875em auto 0;

	a {
		display: block;
		overflow: hidden;
		position: absolute;
		top: 50%; left: 50%;
		width: 4em; height: 4em;
		margin: -2em; /* 2em = 4em/2 */ /* half the width */
	}

	img {
		display: block; width: 100%; 
	}
`;

const Deg0 = styled.div`
	transform: translate(6em);
`;
const Deg45 = styled.div`
	transform: rotate(45deg) translate(6em) rotate(-45deg);
`;
const Deg135 = styled.div`
	transform: rotate(135deg) translate(6em) rotate(-135deg);
`;
const Deg180 = styled.div`
	transform: translate(-12em);
`;
const Deg225 = styled.div`
	transform: rotate(120deg) translate(6em) rotate(-120deg);
`;
const Deg315 = styled.div`
	transform: rotate(315deg) translate(6em) rotate(-315deg);
`;
const Deg270 = styled.div`
	transform: rotate(270deg) translate(6em) rotate(-270deg);
`;


