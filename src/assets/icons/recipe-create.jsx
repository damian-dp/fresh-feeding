import React from 'react';

function RecipeCreate(props) {
	const fill = props.fill || 'currentColor';
	const secondaryfill = props.secondaryfill || fill;
	const strokewidth = props.strokewidth || 1;
	const width = props.width || '1em';
	const height = props.height || '1em';

	return (
		<svg height={height} width={width} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
	<g fill={fill}>
		<path d="M26,38A10.976,10.976,0,0,1,41,27.764V3a2,2,0,0,0-2-2H5A2,2,0,0,0,3,3V45a2,2,0,0,0,2,2H30.7A10.99,10.99,0,0,1,26,38ZM20,11H32a1,1,0,0,1,0,2H20a1,1,0,0,1,0-2Zm0,8H32a1,1,0,0,1,0,2H20a1,1,0,0,1,0-2Zm-7-9a2,2,0,1,1-2,2A2,2,0,0,1,13,10Zm0,8a2,2,0,1,1-2,2A2,2,0,0,1,13,18Zm0,8a2,2,0,1,1-2,2A2,2,0,0,1,13,26Zm7,11H12a1,1,0,0,1,0-2h8a1,1,0,0,1,0,2Zm5-8H20a1,1,0,0,1,0-2h5a1,1,0,0,1,0,2Z" fill={fill}/>
		<path d="M28,38a9,9,0,1,0,9-9A9,9,0,0,0,28,38Zm10-4v3h3a1,1,0,0,1,0,2H38v3a1,1,0,0,1-2,0V39H33a1,1,0,0,1,0-2h3V34a1,1,0,0,1,2,0Z" fill={secondaryfill}/>
	</g>
</svg>
	);
};

export default RecipeCreate;