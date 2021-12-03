import React, { Fragment } from 'react';
import styled from 'styled-components';


import Unity, { UnityContent } from 'react-unity-webgl';
import { Fish } from '../utils/fish';

import { useUnity } from '../context/unityContext';

type Props = {
  children?: React.ReactNode;
};

const UnityWindow = ({ children }: Props) => {

	const unityContext = useUnity();
	
	return (
		<UnityWindowComponent>
			{!unityContext.isLoaded && <p className="loading-text">Loading {unityContext.progression * 100} percent...</p>}
			<Fragment>
				{unityContext.isUnityMounted === true && <Unity unityContent={unityContext.UnityInstance} />}
				{children}
			</Fragment>
			
		</UnityWindowComponent>
	);
};

const UnityWindowComponent = styled.div`
	position: relative;
	width: 100%;
	height: calc(100% - 1px);
	& > div {
		background: none !important;
	}
`;

export default UnityWindow;
