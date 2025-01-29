import React from 'react';

function DietFood(props) {
	const fill = props.fill || 'currentColor';
	const secondaryfill = props.secondaryfill || fill;
	const strokewidth = props.strokewidth || 1;
	const width = props.width || '1em';
	const height = props.height || '1em';

	return (
		<svg height={height} width={width} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
	<g fill={fill}>
		<path d="M42.717,13.308c-3.835-3.083-7.987-2.393-11.655-1.786-1.081.18-2.117.352-3.1.425-.438-3.967-3.274-8.6-7.646-9.908a1,1,0,0,0-.574,1.916C23.231,5,25.525,8.7,25.947,11.933c-.944-.078-1.93-.24-2.959-.411-3.667-.607-7.82-1.3-11.655,1.786C9.148,15.068,7.667,18.206,7.18,22H32a1,1,0,0,1,1,1V35a1,1,0,0,1-1,1H9.636a28.293,28.293,0,0,0,1.553,2.871c5.1,8.158,10.42,7.352,13.94,6.819a13.63,13.63,0,0,1,1.9-.208,13.6,13.6,0,0,1,1.9.208,21.151,21.151,0,0,0,3.226.31c3.167,0,7-1.187,10.714-7.129C49.1,28.9,47.794,17.4,42.717,13.308Z" fill={fill}/>
		<path d="M27,24v4a1,1,0,0,1-1,1h0a1,1,0,0,1-1-1V24H21v2a1,1,0,0,1-1,1h0a1,1,0,0,1-1-1V24H15v4a1,1,0,0,1-1,1h0a1,1,0,0,1-1-1V24H9v2a1,1,0,0,1-1,1H8a1,1,0,0,1-1-1V24H6.118a3.081,3.081,0,0,1-3.06-2.4A3.005,3.005,0,0,1,6,18h.024a16.792,16.792,0,0,1,.807-2H6a5,5,0,0,0-5,5v8a5,5,0,0,0,5,5H31V24Z" fill={secondaryfill}/>
		<path d="M30,9a7,7,0,0,0,7-7V0a7,7,0,0,0-7,7Z" fill={fill}/>
	</g>
</svg>
	);
};

export default DietFood;