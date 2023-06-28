import React from "react";
import { motion } from "framer-motion";

type Props = {};

const smallcircle = (props: Props) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        scale: [1, 1.5, 1, 1],
        opacity: [0.1, 0.2, 0.4, 0.8, 0.1, 1.0],
        borderRadius: ["20%", "20%", "50%", "88%", "20%"],
      }}
      transition={{
        duration: 2.5,
      }}
      className="relative mt-10 flex items-center justify-center"
    >
      <div className="absolute h-[100px] w-[100px] animate-ping rounded-full border border-gray-400" />
      <div className="absolute h-[150px] w-[150px] rounded-full border border-gray-400" />
      <div className="absolute h-[250px] w-[250px] rounded-full border border-gray-400" />
      <div className="absolute h-[200px] w-[200px] animate-pulse rounded-full border border-gray-400" />
      <div className="absolute h-[150px] w-[150px] animate-pulse rounded-full border border-gray-400" />
    </motion.div>
  );
};

export default smallcircle;
