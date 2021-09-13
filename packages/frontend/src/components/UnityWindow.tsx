import React, { Fragment, useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";


import Unity, { UnityContent } from 'react-unity-webgl';
import { Fish } from '../utils/fish';

import { useUnity } from '../context/unityContext';

const UnityWindow = (children: React.ReactNode) => {

	const unityContext = useUnity()
	

	return (
		<UnityWindowComponent>
			{!unityContext.isLoaded && <p>Loading {unityContext.progression * 100} percent...</p>}
			{/* <Unity unityContent={unityContext.UnityInstance} /> */}
			<Fragment>
				{unityContext.isUnityMounted === true && <Unity unityContent={unityContext.UnityInstance} />}
			</Fragment>
			<Nav>
				<LinkButton to="/">View Fish</LinkButton>
				<LinkButton to="/catch">Catch Fish</LinkButton>
				<LinkButton to="/fight">Fight Fish</LinkButton>
			</Nav>
		</UnityWindowComponent>
	);
};

const UnityWindowComponent = styled.div`
	position: relative;
	margin-top: -280px;
	padding: 200px;
	border-radius: 50%;
	width: 960px;
	height: 960px;
	background-color: white;
	color: black;

	& > span {
		margin-left: 4px;
	}
`;

const LinkButton = styled(Link)`
	padding: 80px 50px;
	border-radius: 50%;
	font-weight: bold;
	text-decoration: none;
	text-transform: uppercase;
	background-color: darkblue;
	box-shadow: 1px 2px 4px 4px rgba(0, 0, 0, 0.25);
	color: white;
	transition: opacity 0.3s ease, box-shadow 0.25s ease-in-out;

	&:hover {
		opacity: 1;
		box-shadow: 1px 2px 2px 2px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}
`;

const Flex = styled.div`
	display: flex;
	align-items: center;
`;

const Nav = styled.nav`
	postion: absolute;
	display: flex;
	flex-flow: row nowrap;
	justify-content: space-evenly;
	width: 100%;
	margin: 20px;
`;

export default UnityWindow;
