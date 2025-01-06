import React from 'react';

function Pill(props) {
	const fill = props.fill || 'currentColor';
	const secondaryfill = props.secondaryfill || fill;
	const strokewidth = props.strokewidth || 1;
	const width = props.width || '1em';
	const height = props.height || '1em';

	return (
		<svg height={height} width={width} viewBox="0 0 27 27" xmlns="http://www.w3.org/2000/svg">
	<g fill="none" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}>
		<path d="M11.86 23.16l11.3-11.29a5.59 5.59 0 1 0-7.91-7.92l-11.3 11.3a5.59 5.59 0 1 0 7.91 7.91z" stroke={fill}/>
		<path d="M9.6 9.6l7.91 7.91" stroke={secondaryfill}/>
	</g>
</svg>
	);
};

export default Pill;