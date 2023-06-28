import React, { useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { HStack } from "@chakra-ui/react";
import clsx from "clsx";

import { PanelMinHeight } from "@/constants";

import styles from "./index.module.scss";

import useCustomSettingStore, { page } from "@/pages/customSetting";

const PanelHeader: React.FC<{
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  actions?: React.ReactNode[];
  title?: React.ReactNode | string;
  pageId?: page;
  panelId?: string;
}> = (props) => {
  const { title, actions, children, style = {}, className, pageId, panelId } = props;
  const store = useCustomSettingStore();

  const [isUp, setIsUp] = React.useState(false);

  useEffect(() => {
    if (!pageId || !panelId) return;
    const { id = "", style } = store.getLayoutInfo(pageId, panelId);
    if (!id) return;

    if (style.height < PanelMinHeight + 10) {
      // 10px is the margin
      setIsUp(false);
    } else {
      setIsUp(true);
    }
  }, [pageId, panelId, store]);

  const _defaultActions = [
    <div
      key="zoomIn"
      className="cursor-pointer"
      onClick={() => {
        if (!pageId || !panelId) return;
        const { id = "", style } = store.getLayoutInfo(pageId, panelId);

        const element = document.getElementById(id);
        if (element !== null) {
          // get element height
          const currentHeight = element.style.height;
          if (currentHeight === `${PanelMinHeight}px`) {
            const height = element.getAttribute("data-height");
            element.style.height = height || "100px";
            setIsUp(true);
          } else {
            setIsUp(false);
            element.setAttribute("data-height", style.height + "px");
            element.style.height = `${PanelMinHeight}px`;
          }
        }
      }}
    >
      {isUp ? <ChevronDownIcon fontSize={16} /> : <ChevronUpIcon fontSize={16} />}
    </div>,
  ];

  return title ? (
    <div className={styles.sectionHeader + " flex justify-between"}>
      <h4>{title}</h4>
      <HStack spacing="2">{actions ? actions : _defaultActions}</HStack>
    </div>
  ) : (
    <div style={style} className={clsx(styles.sectionHeader + " flex justify-between", className)}>
      {children}
    </div>
  );
};

export default PanelHeader;
