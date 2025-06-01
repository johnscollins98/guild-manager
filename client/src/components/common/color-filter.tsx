import { type HTMLProps } from 'react';

export const ColorFilter = (props: HTMLProps<SVGImageElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      width={props.width}
      height={props.height}
      style={{ float: 'left' }}
    >
      <defs>
        <filter id="colorMask1">
          <feFlood floodColor={props.color} result="flood" />
          <feComposite
            in="SourceGraphic"
            in2="flood"
            operator="arithmetic"
            k1="1"
            k2="0"
            k3="0"
            k4="0"
          />
        </filter>
      </defs>
      <image {...props} filter={'url(#colorMask1)'} />
    </svg>
  );
};
