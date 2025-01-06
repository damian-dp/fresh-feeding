import React from 'react';

function Target(props) {
	const fill = props.fill || 'currentColor';
	const secondaryfill = props.secondaryfill || fill;
	const strokewidth = props.strokewidth || 1;
	const width = props.width || '1em';
	const height = props.height || '1em';

	return (
		<svg height={height} width={width} viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
	<g fill={fill}>
		<line fill="none" stroke={secondaryfill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth} x1="9" x2="12.25" y1="9" y2="5.75"/>
		<polygon fill="none" points="12.25 5.75 12.25 3.5 14.75 1 14.75 3.25 17 3.25 14.5 5.75 12.25 5.75" stroke={secondaryfill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}/>
		<path d="M10.36,1.882c-.441-.084-.895-.132-1.36-.132C4.996,1.75,1.75,4.996,1.75,9s3.246,7.25,7.25,7.25,7.25-3.246,7.25-7.25c0-.465-.048-.919-.132-1.36" fill="none" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}/>
		<path d="M9.649,4.815c-.213-.033-.427-.065-.649-.065-2.347,0-4.25,1.903-4.25,4.25s1.903,4.25,4.25,4.25,4.25-1.903,4.25-4.25c0-.222-.033-.436-.065-.649" fill="none" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}/>
	</g>
</svg>
	);
};

export default Target;