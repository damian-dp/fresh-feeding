import React from 'react';

function Dog(props) {
	const fill = props.fill || 'currentColor';
	const secondaryfill = props.secondaryfill || fill;
	const strokewidth = props.strokewidth || 1;
	const width = props.width || '1em';
	const height = props.height || '1em';

	return (
		<svg height={height} width={width} viewBox="0 0 17.5 16" xmlns="http://www.w3.org/2000/svg">
	<g fill="none">
		<path d="M13.6 8.4v-2.46a4.99 4.99 0 1 0-9.98 0v2.46a2.85 2.85 0 0 0 4.99 2.71 2.85 2.85 0 1 0 4.99-2.71z" fill={fill} fillOpacity="0.300"/>
		<path d="M10.27 12.82v0.72a1.66 1.66 0 0 1-3.32 0v-0.72" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}/>
		<path d="M5.37 2.15l-0.59-0.47a1.42 1.42 0 0 0-2.08 0.33l-1.66 2.54c-0.73 1.11 0.07 2.58 1.39 2.57h1.13" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}/>
		<path d="M11.85 2.15l0.59-0.47a1.42 1.42 0 0 1 2.08 0.33l1.67 2.54c0.73 1.11-0.07 2.58-1.39 2.57h-1.14" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}/>
		<path d="M13.6 8.4v-2.46a4.99 4.99 0 1 0-9.98 0v2.46a2.85 2.85 0 0 0 4.99 2.71 2.85 2.85 0 1 0 4.99-2.71z" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}/>
		<path d="M7.42 9.5h2.38l-1.19 1.66-1.19-1.66z" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}/>
		<path d="M6.24 7.84a0.95 0.95 0 1 0 0-1.9 0.95 0.95 0 0 0 0 1.9z" fill={fill}/>
		<path d="M10.99 7.84a0.95 0.95 0 1 0 0-1.9 0.95 0.95 0 0 0 0 1.9z" fill={fill}/>
	</g>
</svg>
	);
};

export default Dog;