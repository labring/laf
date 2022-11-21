/****************************
 * cloud functions siderbar menu
 ***************************/

import React from "react";
import { AiFillDatabase, AiOutlineFunction } from "react-icons/ai";
import { GrCatalogOption, GrStorage } from "react-icons/gr";
import { Center } from "@chakra-ui/react";
import clsx from "clsx";

import { Pages, SiderBarWidth } from "@/constants/index";

import styles from "./index.module.scss";

export default function SiderBar(props: { pageId: string; setPageId: (pageId: string) => void }) {
  const { pageId, setPageId } = props;
  const ICONS = [
    { pageId: Pages.function, component: <AiOutlineFunction size="24" /> },
    { pageId: Pages.database, component: <AiFillDatabase size="22" /> },
    { pageId: Pages.storage, component: <GrStorage size="20" /> },
    { pageId: Pages.logs, component: <GrCatalogOption size="18" /> },
  ];
  return (
    <div
      style={{ width: SiderBarWidth, borderRight: "1px solid #eee" }}
      className="absolute top-0 bottom-0"
    >
      {ICONS.map((item, index) => {
        return (
          <Center
            key={index}
            className={clsx(styles.icon, {
              [styles.current]: pageId === item.pageId,
            })}
            style={{
              height: SiderBarWidth,
            }}
            onClick={() => setPageId(item.pageId)}
          >
            {item.component}
          </Center>
        );
      })}
    </div>
  );
}
