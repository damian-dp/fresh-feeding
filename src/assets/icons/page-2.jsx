import React from "react";

function Page2(props) {
    const fill = props.fill || "currentColor";
    const secondaryfill = props.secondaryfill || fill;
    const strokewidth = props.strokewidth || 1.5;
    const width = props.width || "1em";
    const height = props.height || "1em";

    return (
        <svg
            height={height}
            width={width}
            viewBox="0 0 18 18"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g fill={fill}>
                <line
                    fill="none"
                    stroke={secondaryfill}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={strokewidth}
                    x1="5.75"
                    x2="9"
                    y1="11.25"
                    y2="11.25"
                />
                <line
                    fill="none"
                    stroke={secondaryfill}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={strokewidth}
                    x1="5.75"
                    x2="12.25"
                    y1="8.25"
                    y2="8.25"
                />
                <line
                    fill="none"
                    stroke={secondaryfill}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={strokewidth}
                    x1="5.75"
                    x2="12.25"
                    y1="5.25"
                    y2="5.25"
                />
                <rect
                    height="14.5"
                    width="12.5"
                    fill="none"
                    rx="2"
                    ry="2"
                    stroke={fill}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={strokewidth}
                    x="2.75"
                    y="1.75"
                />
            </g>
        </svg>
    );
}

export default Page2;
