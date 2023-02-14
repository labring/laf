import React from "react";

export default function IconText(props: {
  icon: React.ReactElement;
  text: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={props.onClick}
      className="text-grayIron-600 flex flex-col items-center hover:text-black"
    >
      {React.cloneElement(props.icon, {
        height: "20px",
      })}
      {props.text}
    </div>
  );
}
