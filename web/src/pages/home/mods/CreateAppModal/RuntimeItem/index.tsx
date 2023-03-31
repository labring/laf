import React from "react";
import { CheckIcon } from "@chakra-ui/icons";

import { TBundle } from "@/apis/typing";

export default function RuntimeItem(props: { bundle?: TBundle }) {
  return (
    <div className="flex items-center rounded border border-primary-300 bg-lafWhite-400 p-2 font-semibold text-primary-500">
      <CheckIcon className="mr-2" />
      <img src="/node.svg" alt="" className="mr-1" /> - latest
    </div>
  );
}
