import React from 'react';
import styled from 'styled-components';

const DefaultButton = () => {


	return (
		<ButtonComponent>
			<b>test</b> <span>ONE</span>
		</ButtonComponent>
	);
};

const ButtonComponent = styled.button`
	padding: 10px 20px;
	border-radius: 25px;
	background-color: white;
	color: black;

	& > span {
		margin-left: 4px;
	}
`;

export default DefaultButton;