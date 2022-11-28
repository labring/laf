import React, { ReactNode, useEffect } from "react";
import useGlobalStore from "pages/app_store";

import Header from "@/components/Header";

export default function BasicLayout(props: { children: ReactNode }) {
  const { init } = useGlobalStore((state) => state);
  useEffect(() => {
    init();
  }, [init]);

  return (
    <div>
      <Header size="lg" />
      {props.children}
    </div>
  );
}
