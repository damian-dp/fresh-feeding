import React from 'react';

function PhotoPlus(props) {
	const fill = props.fill || 'currentColor';
	const secondaryfill = props.secondaryfill || fill;
	const strokewidth = props.strokewidth || 1.2;
	const width = props.width || '1em';
	const height = props.height || '1em';

	return (
		<svg height={height} width={width} viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
	<g fill={fill}>
		<path d="m4,14.75l5.836-5.836c.781-.781,2.047-.781,2.828,0l3.586,3.586" fill="none" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}/>
		<path d="m9.3004,3.25H3.75c-1.1046,0-2,.8955-2,2v7.5c0,1.1045.8954,2,2,2h10.5c1.1046,0,2-.8955,2-2v-5.0137" fill="none" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}/>
		<circle cx="5.75" cy="7.25" fill={fill} r="1.25" strokeWidth="0"/>
		<line fill="none" stroke={secondaryfill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth} x1="14.25" x2="14.25" y1="1.25" y2="6.25"/>
		<line fill="none" stroke={secondaryfill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth} x1="16.75" x2="11.75" y1="3.75" y2="3.75"/>
	</g>
</svg>
	);
};

export default PhotoPlus;