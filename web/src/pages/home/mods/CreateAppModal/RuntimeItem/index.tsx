import React from "react";
import { CheckIcon } from "@chakra-ui/icons";

import { TBundle } from "@/apis/typing";

export default function RuntimeItem(props: { bundle?: TBundle }) {
  return (
    <div className="p-2 flex items-center bg-lafWhite-400 text-primary-500 font-semibold rounded border-primary-300 border">
      <CheckIcon className="mr-2" />
      <img src="/node.svg" alt="" className="mr-1" /> - latest
    </div>
  );
}
