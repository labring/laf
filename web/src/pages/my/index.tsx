import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddIcon } from "@chakra-ui/icons";
import { ChevronDownIcon, Search2Icon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorMode,
} from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import FunctionTemplate from "./FunctionTemplate";

import styles from "../functionTemplate/Mods/SideBar/index.module.scss";

export default function Mine() {
  const sortList = ["按时间", "按收藏数", "按使用数"];
  // const explore_data = ["应用模板", "函数模板"];
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";
  const [sorting, setSorting] = useState("按时间");

  return (
    <div className={clsx("w-full", darkMode ? "" : "bg-white")}>
      <div className="absolute bottom-0 top-[60px] flex flex-col justify-between">
        <Box className="pl-16">
          <div className={darkMode ? styles.title_dark : styles.title}>{t("Template.My")}</div>
          {/* {sideBar_data.map((item) => {
            return (
              <div key={item} className={styles.explore_item}>
                {item}
              </div>
            );
          })} */}
        </Box>
      </div>
      <Box className="pl-64">
        <Box className="flex justify-between pt-8">
          <Button
            padding={5}
            onClick={() => {
              navigate("/my/create");
            }}
            leftIcon={<AddIcon />}
          >
            {t("Template.CreateTemplate")}
          </Button>
          <div className="flex items-center">
            <InputGroup>
              <InputLeftElement children={<Search2Icon />} height={"2rem"} />
              <Input
                width={"18.75rem"}
                height={"2rem"}
                borderRadius={"6.25rem"}
                placeholder={String(t("Search"))}
              />
            </InputGroup>
            <InputGroup className="flex items-center justify-end pl-8 pr-16">
              <span className="text-lg text-grayModern-400">{t("Template.SortOrd")} </span>
              <span className="pl-2 text-lg">{sorting}</span>
              <Menu>
                <MenuButton className="cursor-pointer">
                  <ChevronDownIcon boxSize={6} color="gray.400" />
                </MenuButton>
                <MenuList>
                  {sortList.map((item) => {
                    return (
                      <MenuItem
                        key={item}
                        value={item}
                        onClick={(e) => {
                          setSorting(e.currentTarget.value);
                        }}
                      >
                        {item}
                      </MenuItem>
                    );
                  })}
                </MenuList>
              </Menu>
            </InputGroup>
          </div>
        </Box>
      </Box>
      <div>
        <FunctionTemplate />
      </div>
    </div>
  );
}
