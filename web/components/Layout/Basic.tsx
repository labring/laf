import React, { ReactNode, useEffect } from "react";
import { Spinner } from "@chakra-ui/react";
import useGlobalStore from "pages/app_store";

import Header from "@/components/Header";

export default function BasicLayout(props: { children: ReactNode }) {
  const { init, loading } = useGlobalStore((state) => state);
  useEffect(() => {
    init();
  }, [init]);

  return (
    <div>
      <Header size="lg" />
      {loading ? <Spinner /> : props.children}
    </div>
  );
}
