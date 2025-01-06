import React from 'react';

function Leaf(props) {
	const fill = props.fill || 'currentColor';
	const secondaryfill = props.secondaryfill || fill;
	const strokewidth = props.strokewidth || 1;
	const width = props.width || '1em';
	const height = props.height || '1em';

	return (
		<svg height={height} width={width} viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
	<g fill={fill}>
		<path d="M9.097,15.247c5.627-.186,7.126-8.11,4.168-13.497-1.709,3.571-5.652,3.034-7.858,5.754-.654,.806-1.158,1.901-1.158,3.082,0,1.577,.779,2.972,1.972,3.816" fill="none" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}/>
		<path d="M2.75,16.25s4.598-1.265,7.5-6.5" fill="none" stroke={secondaryfill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}/>
	</g>
</svg>
	);
};

export default Leaf;