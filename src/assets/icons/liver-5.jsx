import React from 'react';

function Liver5(props) {
	const fill = props.fill || 'currentColor';
	const secondaryfill = props.secondaryfill || fill;
	const strokewidth = props.strokewidth + .25 || 1;
	const width = props.width || '1em';
	const height = props.height || '1em';

	return (
		<svg height={height} width={width} strokeMiterlimit="4" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
	<g fill={fill} fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
		<g id="1729072120773-1039513_Layer1" fill={fill}>
			<path d="M10.193,10.272C11.079,9.499 11.693,7.972 11.048,6.455" fill="none" stroke={secondaryfill} strokeWidth={strokewidth}/>
			<path d="M65.377,37.521C64.032,37.219 62.752,37.08 61.352,37.08C60.443,37.08 59.634,37.137 58.851,37.191C57.358,37.294 56.017,37.332 54.914,37.139C53.116,36.821 51.487,36.456 49.912,36.104C46.952,35.442 44.398,34.857 41.664,34.857C39.763,34.857 37.944,35.159 36.105,35.778C31.374,37.37 28.768,40.929 28.788,45.814C28.801,49.102 29.625,51.473 30.34,53.567C31.059,55.671 31.65,57.495 31.572,59.664C31.497,61.763 31.806,63.282 32.738,64.248C33.324,64.854 34.148,65.145 35.102,65.145C36.81,65.145 38.908,64.33 41.378,62.833C46.588,59.673 48.983,57.474 50.908,55.705C54.034,52.834 55.904,51.067 66.411,47.888C69.215,47.039 71.298,44.777 71.208,42.38C71.167,41.228 70.351,38.637 65.377,37.521Z" fill="none" stroke={fill} strokeWidth={strokewidth + 3} transform="translate(-8.77 -8.77) scale(.355)"/>
		</g>
	</g>
</svg>
	);
};

export default Liver5;