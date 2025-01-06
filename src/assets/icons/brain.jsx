import React from 'react';

function Brain(props) {
	const fill = props.fill || 'currentColor';
	const secondaryfill = props.secondaryfill || fill;
	const strokewidth = props.strokewidth + .8 || 1;
	const width = props.width || '1em';
	const height = props.height || '1em';

	return (
		<svg height={height} width={width} viewBox="0 0 27 27" xmlns="http://www.w3.org/2000/svg">
	<g fill="none" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}>
		<path d="M13.56 5.65a3.39 3.39 0 1 0-6.78 0.14 4.52 4.52 0 0 0-2.85 6.52 4.52 4.52 0 0 0 0.63 7.45 4.52 4.52 0 1 0 9 0.58z" stroke={fill}/>
		<path d="M13.56 5.65a3.39 3.39 0 1 1 6.78 0.14 4.52 4.52 0 0 1 2.85 6.52 4.52 4.52 0 0 1-0.63 7.45 4.52 4.52 0 1 1-9 0.58z" stroke={fill}/>
		<path d="M16.95 14.69a5.08 5.08 0 0 1-3.39-4.52 5.08 5.08 0 0 1-3.39 4.52" stroke={secondaryfill}/>
		<path d="M19.89 7.34a3.39 3.39 0 0 0 0.45-1.55" stroke={fill}/>
		<path d="M6.78 5.79a3.39 3.39 0 0 0 0.45 1.55" stroke={fill}/>
		<path d="M3.93 12.31a4.52 4.52 0 0 1 0.66-0.45" stroke={fill}/>
		<path d="M22.53 11.86a4.52 4.52 0 0 1 0.66 0.45" stroke={fill}/>
		<path d="M6.78 20.34a4.52 4.52 0 0 1-2.22-0.58" stroke={fill}/>
		<path d="M22.56 19.76a4.52 4.52 0 0 1-2.22 0.58" stroke={fill}/>
	</g>
</svg>
	);
};

export default Brain;