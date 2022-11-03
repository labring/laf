import React from "react";

export default function Icon(props: { children: React.ReactNode; onClick: () => void }) {
  return (
    <span
      onClick={props.onClick}
      className="hover:bg-slate-200 rounded inline-block text-center"
      style={{ width: 20, height: 20, lineHeight: "18px" }}
    >
      {props.children}
    </span>
  );
}
