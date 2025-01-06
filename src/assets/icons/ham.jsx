import React from 'react';

function Ham(props) {
	const fill = props.fill || 'currentColor';
	const secondaryfill = props.secondaryfill || fill;
	const strokewidth = props.strokewidth + .5 || 1;
	const width = props.width || '1em';
	const height = props.height || '1em';

	return (
		<svg height={height} width={width} viewBox="0 0 27 27" xmlns="http://www.w3.org/2000/svg">
	<g fill="none" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}>
		<path d="M14.85 23.89a8.22 11.8 45 1 0-11.62-11.62" stroke={fill}/>
		<path d="M14.85 23.89a8.22 4.93 45 0 0-11.62-11.62 8.22 4.93 45 0 0 11.62 11.62" stroke={fill}/>
		<path d="M18.72 11.79l2.3-2.3a2.83 2.83 0 1 0 1.86-5.25 2.82 2.82 0 1 0-5.26 1.87l-2.29 2.29" stroke={secondaryfill}/>
		<path d="M9.6 18.64l-1.13-1.13" stroke={secondaryfill}/>
	</g>
</svg>
	);
};

export default Ham;