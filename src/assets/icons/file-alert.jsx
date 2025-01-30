import React from 'react';

function FileAlert(props) {
	const fill = props.fill || 'currentColor';
	const secondaryfill = props.secondaryfill || fill;
	const strokewidth = props.strokewidth || 1;
	const width = props.width || '1em';
	const height = props.height || '1em';

	return (
		<svg height={height} width={width} viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
	<g fill={fill}>
		<path d="M10.336 1.75C10.4801 1.75 10.6212 1.78103 10.75 1.83956V5.24999C10.75 5.80199 11.198 6.24999 11.75 6.24999H15.1603C15.2189 6.37883 15.25 6.51978 15.25 6.664V14.25C15.25 15.2191 14.5616 16.0267 13.6468 16.2107C13.8704 15.8611 14 15.4457 14 15V12.25C14 11.0074 12.9926 10 11.75 10C10.5074 10 9.5 11.0074 9.5 12.25V15C9.5 15.4625 9.63957 15.8925 9.87889 16.25H4.75C3.645 16.25 2.75 15.355 2.75 14.25V3.75C2.75 2.645 3.645 1.75 4.75 1.75H10.336Z" fill={secondaryfill} fillOpacity="0.3" fillRule="evenodd" stroke="none"/>
		<path d="M5.75 6.75H7.75" fill="none" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}/>
		<path d="M5.75 9.75H10.25" fill="none" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}/>
		<path d="M15.16 6.24999H11.75C11.198 6.24999 10.75 5.80199 10.75 5.24999V1.85199" fill="none" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}/>
		<path d="M14.25 15.973C14.845 15.627 15.25 14.989 15.25 14.25V6.664C15.25 6.399 15.145 6.144 14.957 5.957L11.043 2.043C10.855 1.855 10.601 1.75 10.336 1.75H4.75C3.645 1.75 2.75 2.646 2.75 3.75V14.25C2.75 15.354 3.645 16.25 4.75 16.25H9.25" fill="none" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}/>
		<path d="M11.75 15V12.25" fill="none" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokewidth}/>
		<path d="M11.75 18C12.1642 18 12.5 17.6642 12.5 17.25C12.5 16.8358 12.1642 16.5 11.75 16.5C11.3358 16.5 11 16.8358 11 17.25C11 17.6642 11.3358 18 11.75 18Z" fill={fill} stroke="none"/>
	</g>
</svg>
	);
};

export default FileAlert;