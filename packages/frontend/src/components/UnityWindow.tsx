import React, { Fragment, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';

import { useHarmony } from '../context/harmonyContext';

import Unity, { UnityContent } from 'react-unity-webgl';

const unityContent = new UnityContent('../Build/fishfight-one.json', '../Build/UnityLoader.js');

const UnityWindow = () => {


	const [isUnityMounted, setIsUnityMounted] = useState(true);
	const [isLoaded, setIsLoaded] = useState(false);
	const [progression, setProgression] = useState(0);
	const [rotation, setRotation] = useState(0);
	const [message, setMessage] = useState('');
	const [clickedPosition, setClickedPosition] = useState({ x: 0, y: 0 });

	useEffect(function () {
		unityContent.on('progress', setProgression);
		unityContent.on('loaded', function () {
			setIsLoaded(true);
		});
		unityContent.on('error', function ( message: any ) {
			console.log('An error!', message);
		});
		unityContent.on('log', function (message: any ) {
			console.log('A message!', message);
		});
		unityContent.on('canvas', function (element: any ) {
			console.log('Canvas', element);
		});
		unityContent.on('RotationDidUpdate', setRotation);
		unityContent.on('Say', setMessage);
		unityContent.on('ClickedPosition', function (x: any, y: any ) {
			setClickedPosition({ x, y });
		});
	}, []);

	function startRotation() {
		unityContent.send('MeshCrate', 'StartRotation');
	}

	function stopRotation() {
		unityContent.send('MeshCrate', 'StopRotation');
	}

	function toggleIsUnityMounted() {
		setIsUnityMounted(!isUnityMounted);
	}

	return (
		<UnityWindowComponent>
			<Unity unityContent={unityContent} />
			<Fragment>
				<h1>React Unity WebGL Test</h1>
				<p>Loading {progression * 100} percent...</p>
				{isLoaded === true && <p>Loaded!</p>}
				<p>Rotation {rotation}deg</p>
				<p>Message {message}</p>
				<p>
					Clicked Position {clickedPosition.x}, {clickedPosition.y}
				</p>
				<button children={'Start Rotation'} onClick={startRotation} />
				<button children={'Stop Rotation'} onClick={stopRotation} />
				<button children={'(Un)mount'} onClick={toggleIsUnityMounted} />
				<br />
				{isUnityMounted === true && <Unity unityContent={unityContent} />}
			</Fragment>
		</UnityWindowComponent>
	);
};

const UnityWindowComponent = styled.div`
	position: relative;
	padding: 10px 20px;
	border-radius: 25px;
	background-color: white;
	color: black;

	& > span {
		margin-left: 4px;
	}
`;

export default UnityWindow;
