/****************************
 * cloud functions siderbar menu
 ***************************/

import React from "react";
import { AiFillDatabase, AiOutlineFunction } from "react-icons/ai";
import { GrCatalogOption, GrStorage } from "react-icons/gr";
import { useNavigate, useParams } from "react-router-dom";
import { Center } from "@chakra-ui/react";
import clsx from "clsx";

import { Pages, SiderBarWidth } from "@/constants/index";

import styles from "./index.module.scss";

import useGlobalStore from "@/pages/globalStore";

export default function SiderBar() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { currentApp, setCurrentPage } = useGlobalStore();

  const ICONS = [
    { pageId: Pages.function, component: <AiOutlineFunction size="24" /> },
    { pageId: Pages.database, component: <AiFillDatabase size="22" /> },
    { pageId: Pages.storage, component: <GrStorage size="20" /> },
    { pageId: Pages.logs, component: <GrCatalogOption size="18" /> },
  ];
  return (
    <div
      style={{ width: SiderBarWidth, background: "#f2f3f9" }}
      className="absolute top-0 bottom-0 "
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
            onClick={() => {
              setCurrentPage(item.pageId);
              navigate(`/app/${currentApp?.appid}/${item.pageId}`);
            }}
          >
            {item.component}
          </Center>
        );
      })}
    </div>
  );
}
