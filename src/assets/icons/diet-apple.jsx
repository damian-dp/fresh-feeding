import React from 'react';

function DietApple(props) {
	const fill = props.fill || 'currentColor';
	const secondaryfill = props.secondaryfill || fill;
	const strokewidth = props.strokewidth || 1;
	const width = props.width || '1em';
	const height = props.height || '1em';

	return (
		<svg height={height} width={width} viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
	<g fill={fill}>
		<path d="M5.923,14.638c1.448,1.095,2.792,.385,3.634,.385,1.081,0,2.992,1.174,4.886-1.817,1.973-3.114,1.489-6.639,.021-7.801-1.595-1.267-3.391-.223-4.909-.223s-3.131-1.107-4.909,.223c-.137,.102-.264,.217-.382,.342" fill="none" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}/>
		<path d="M12,.25h0c.276,0,.5,.224,.5,.5h0c0,1.38-1.12,2.5-2.5,2.5h0c-.276,0-.5-.224-.5-.5h0c0-1.38,1.12-2.5,2.5-2.5Z" fill={secondaryfill} stroke="none"/>
		<rect height="4" width="10" fill="none" rx="1" ry="1" stroke={secondaryfill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth} x="1.25" y="8.25"/>
		<line fill="none" stroke={secondaryfill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth} x1="8.75" x2="8.75" y1="8.25" y2="9.75"/>
		<line fill="none" stroke={secondaryfill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth} x1="6.25" x2="6.25" y1="8.25" y2="9.75"/>
		<line fill="none" stroke={secondaryfill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth} x1="3.75" x2="3.75" y1="8.25" y2="9.75"/>
	</g>
</svg>
	);
};

export default DietApple;