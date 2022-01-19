
import styled from "styled-components";

export const ToggleGroup = styled.div`
	display: flex;
	flex-flow: row nowrap;
	/* box-shadow: 2px 2px 8px 2px gray, -2px -2px 8px 2px white; */

	border-radius: 10px;
	&:after {
		content: "";
		clear: both;
		display: table;
	}
`;

export const ToggleOption = styled.button`
	background-color: #f0f1eb;
  border: 2px solid white;
  color: white;
  padding: 10px 24px;
  cursor: pointer;
  float: left;
	color: black;
	font-size: ${props => props.theme.font.small};
	text-transform: uppercase;

	&:first-child {
		border-top-left-radius: 10px;
		border-bottom-left-radius: 10px;
	}

	&:last-child {
		border-top-right-radius: 10px;
		border-bottom-right-radius: 10px;
	}

	&:not(:last-child) {
		border-right: none; /* Prevent double borders */
	}

	&:hover {
		background-color: #e3e3e3;
	}

	&.active {
		background-color: #aeaeae;
		pointer-events: none;

		&:hover {
			background-color: #aeaeae;
		}
	}

	@media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.medium};
  }
`;