import React from "react";

type Props = {};

const circle = (props: Props) => {
  return (
    <div className="relative mt-10 flex items-center justify-center">
      <div className="absolute h-[120px] w-[120px] rounded-full border border-white opacity-20 " />
      <div className="absolute h-[180px] w-[180px] rounded-full border border-gray-400 opacity-20" />
      <div className="absolute h-[240px] w-[240px] rounded-full border border-gray-400 opacity-40" />
      <div className="absolute h-[320px] w-[320px] rounded-full border border-gray-500 opacity-40" />
    </div>
  );
};

export default circle;
