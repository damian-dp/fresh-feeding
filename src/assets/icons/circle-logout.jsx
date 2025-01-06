import React from 'react';

function CircleLogout(props) {
	const fill = props.fill || 'currentColor';
	const secondaryfill = props.secondaryfill || fill;
	const strokewidth = props.strokewidth || 1;
	const width = props.width || '1em';
	const height = props.height || '1em';

	return (
		<svg height={height} width={width} viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
	<g fill={fill}>
		<path d="M6.64,6c.981-1.505,2.68-2.5,4.61-2.5,3.038,0,5.5,2.462,5.5,5.5s-2.462,5.5-5.5,5.5c-1.931,0-3.629-.995-4.61-2.5" fill="none" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}/>
		<polyline fill="none" points="3.25 6.5 .75 9 3.25 11.5" stroke={secondaryfill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}/>
		<line fill="none" stroke={secondaryfill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth} x1=".75" x2="11.25" y1="9" y2="9"/>
	</g>
</svg>
	);
};

export default CircleLogout;