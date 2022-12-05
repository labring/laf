import React, { ReactNode, useEffect } from "react";
import { AiFillHeart } from "react-icons/ai";
import { Spinner } from "@chakra-ui/react";
import useGlobalStore from "pages/globalStore";

import Header from "@/components/Header";

export default function BasicLayout(props: { children: ReactNode }) {
  const { init, loading } = useGlobalStore((state) => state);
  useEffect(() => {
    init();
  }, [init]);

  return (
    <div>
      <Header size="lg" />
      <div className="pb-6">{loading ? <Spinner /> : props.children}</div>
      <div className="text-center bg-white absolute bottom-0 py-4 w-full">
        Made <AiFillHeart className="inline text-red-500" />️ by LAF Team
      </div>
    </div>
  );
}
