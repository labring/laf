import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BsThreeDotsVertical } from "react-icons/bs";
import { RiCodeBoxFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { AddIcon, Search2Icon } from "@chakra-ui/icons";
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
  useColorModeValue,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";

import CopyText from "@/components/CopyText";
import FileTypeIcon from "@/components/FileTypeIcon";
import IconWrap from "@/components/IconWrap";
import { APP_PHASE_STATUS, APP_STATUS, Pages } from "@/constants";
import { formatDate } from "@/utils/format";
import getRegionById from "@/utils/getRegionById";

import CreateAppModal from "../CreateAppModal";
import DeleteAppModal from "../DeleteAppModal";
import StatusBadge from "../StatusBadge";

import BundleInfo from "./BundleInfo";

import { TApplicationItem } from "@/apis/typing";
import { ApplicationControllerUpdateState } from "@/apis/v1/applications";
import useGlobalStore from "@/pages/globalStore";

function List(props: { appListQuery: any; setShouldRefetch: any }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { setCurrentApp, regions } = useGlobalStore();

  const [searchKey, setSearchKey] = useState("");

  const { appListQuery, setShouldRefetch } = props;
  const bg = useColorModeValue("lafWhite.200", "lafDark.200");

  const updateAppStateMutation = useMutation((params: any) =>
    ApplicationControllerUpdateState(params),
  );

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center text-2xl font-semibold phone:text-base">
          <FileTypeIcon type="app" className="mr-1 " />
          {t("HomePanel.MyApp")}
        </h2>
        <div className="flex phone:px-3">
          <InputGroup className="mr-4">
            <InputLeftElement
              height={"8"}
              left="2"
              pointerEvents="none"
              children={<Search2Icon color="gray.300" fontSize={12} />}
            />
            <Input
              rounded={"full"}
              placeholder={t("Search").toString()}
              variant="outline"
              size={"sm"}
              onChange={(e: any) => setSearchKey(e.target.value)}
            />
          </InputGroup>
          <CreateAppModal type="create">
            <Button colorScheme="primary" style={{ padding: "0 40px" }} leftIcon={<AddIcon />}>
              {t("Create")}
            </Button>
          </CreateAppModal>
        </div>
      </div>

      <div className="flex flex-col overflow-auto">
        <Box
          bg={bg}
          className="mb-3 flex h-12 flex-none items-center rounded-lg px-3 lg:px-6 phone:px-2"
        >
          <div className="w-3/12 text-second ">{t("HomePanel.Application") + t("Name")}</div>
          <div className="w-2/12 whitespace-nowrap text-second">App ID</div>
          <div className="w-2/12 pl-2 text-second">{t("HomePanel.State")}</div>
          <div className="w-2/12 text-second ">{t("HomePanel.Region")}</div>
          <div className="w-4/12 text-second ">{t("Time")}</div>
          <div className="w-1/12 min-w-[100px] pl-2 text-second">{t("Operation")}</div>
        </Box>
        <div className="flex-grow overflow-auto">
          {(appListQuery.data?.data || [])
            .filter((item: TApplicationItem) => item?.name.indexOf(searchKey) >= 0)
            .map((item: TApplicationItem) => {
              return (
                <Box
                  key={item?.appid}
                  bg={bg}
                  className="group mb-3 flex items-center rounded-xl px-3 py-5 lg:px-6"
                >
                  <div className="w-3/12 ">
                    <div className="text-lg font-bold">{item?.name}</div>
                    <BundleInfo bundle={item.bundle} />
                  </div>
                  <div className="w-2/12 font-mono">
                    {item?.appid} <CopyText text={item?.appid} />
                  </div>
                  <div className="w-2/12 ">
                    <StatusBadge statusConditions={item?.phase} state={item?.state} />
                  </div>
                  <div className="w-2/12 ">
                    {getRegionById(regions, item.regionId)?.displayName}
                  </div>
                  <div className="w-4/12 ">
                    <p>
                      {t("CreateTime")}: {formatDate(item.createdAt)}{" "}
                    </p>
                  </div>
                  <div className="flex w-1/12 min-w-[100px]">
                    <Button
                      className="mr-2"
                      fontWeight={"semibold"}
                      size={"sm"}
                      variant={"text"}
                      disabled={item?.phase === APP_PHASE_STATUS.Deleting}
                      onClick={(event: any) => {
                        event?.preventDefault();
                        setCurrentApp(item);
                        navigate(`/app/${item?.appid}/${Pages.function}`);
                      }}
                    >
                      <RiCodeBoxFill size={25} className="mr-2" />
                      {t("HomePanel.Develop")}
                    </Button>
                    <Menu placement="bottom-end">
                      <MenuButton>
                        <IconWrap>
                          <BsThreeDotsVertical size={16} />
                        </IconWrap>
                      </MenuButton>
                      <MenuList width={12} minW={24}>
                        <CreateAppModal application={item} type="edit">
                          <MenuItem minH="40px" display={"block"}>
                            <a className="text-primary block" href="/edit">
                              {t("Edit")}
                            </a>
                          </MenuItem>
                        </CreateAppModal>

                        <CreateAppModal application={item} type="change">
                          <MenuItem minH="40px" display={"block"}>
                            <a className="text-primary block" href="/edit">
                              {t("Change")}
                            </a>
                          </MenuItem>
                        </CreateAppModal>

                        <MenuItem
                          minH="40px"
                          display={"block"}
                          onClick={async (event) => {
                            event?.preventDefault();
                            const res = await updateAppStateMutation.mutateAsync({
                              appid: item.appid,
                              state:
                                item.phase === APP_STATUS.Stopped
                                  ? APP_STATUS.Running
                                  : APP_STATUS.Restarting,
                            });
                            if (!res.error) {
                              setShouldRefetch(true);
                            }
                          }}
                        >
                          <span className="text-primary block">
                            {item.phase === APP_STATUS.Stopped
                              ? t("SettingPanel.Start")
                              : t("SettingPanel.Restart")}
                          </span>
                        </MenuItem>

                        {item.phase === APP_PHASE_STATUS.Started && (
                          <MenuItem
                            minH="40px"
                            display={"block"}
                            onClick={async (event: any) => {
                              event?.preventDefault();
                              await updateAppStateMutation.mutateAsync({
                                appid: item.appid,
                                state: APP_PHASE_STATUS.Stopped,
                              });
                              setShouldRefetch(true);
                            }}
                          >
                            <a className="text-primary block" href="/stop">
                              {t("SettingPanel.Pause")}
                            </a>
                          </MenuItem>
                        )}

                        <DeleteAppModal item={item} onSuccess={() => setShouldRefetch(true)}>
                          <MenuItem minH="40px" display={"block"}>
                            <a className="block text-error-500" href="/delete">
                              {t("DeleteApp")}
                            </a>
                          </MenuItem>
                        </DeleteAppModal>
                      </MenuList>
                    </Menu>
                  </div>
                </Box>
              );
            })}
        </div>
      </div>
    </>
  );
}

export default List;
