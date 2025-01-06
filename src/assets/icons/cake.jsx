import React from 'react';

function Cake(props) {
	const fill = props.fill || 'currentColor';
	const secondaryfill = props.secondaryfill || fill;
	const strokewidth = props.strokewidth || 1;
	const width = props.width || '1em';
	const height = props.height || '1em';

	return (
		<svg height={height} width={width} viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
	<g fill={fill}>
		<line fill="none" stroke={secondaryfill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth} x1="9" x2="9" y1="7.75" y2="4.75"/>
		<path d="M9,4.75c.838,0,1.517-.681,1.517-1.522,0-1.156-1.517-2.478-1.517-2.478,0,0-1.517,1.322-1.517,2.478,0,.841,.679,1.522,1.517,1.522Z" fill="none" stroke={secondaryfill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}/>
		<path d="M15.75,11c-.992,0-1.259,1-2.25,1s-1.259-1-2.25-1-1.259,1-2.25,1-1.259-1-2.25-1-1.259,1-2.25,1-1.259-1-2.25-1" fill="none" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}/>
		<rect height="7.5" width="13.5" fill="none" rx="2" ry="2" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth} x="2.25" y="7.75"/>
	</g>
</svg>
	);
};

export default Cake;