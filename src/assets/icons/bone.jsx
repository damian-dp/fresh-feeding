import React from 'react';

function Bone(props) {
	const fill = props.fill || 'currentColor';
	const secondaryfill = props.secondaryfill || fill;
	const strokewidth = props.strokewidth || 1;
	const width = props.width || '1em';
	const height = props.height || '1em';

	return (
		<svg height={height} width={width} viewBox="0 0 27 27" xmlns="http://www.w3.org/2000/svg">
	<g fill="none" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}>
		<path d="M19.21 11.3c0.79-0.79 1.91 0 2.82 0a2.82 2.82 0 1 0 0-5.65 0.56 0.56 0 0 1-0.56-0.57 2.82 2.82 0 1 0-5.65 0c0 0.92 0.79 2.03 0 2.83l-7.91 7.91c-0.79 0.79-1.91 0-2.83 0a2.82 2.82 0 0 0 0 5.65c0.32 0 0.56 0.25 0.57 0.56a2.82 2.82 0 1 0 5.65 0c0-0.92-0.79-2.03 0-2.82z"/>
	</g>
</svg>
	);
};

export default Bone;