import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BsThreeDotsVertical } from "react-icons/bs";
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
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";

import { CopyIcon, DevelopIcon } from "@/components/CommonIcon";
import ConfirmButton from "@/components/ConfirmButton";
import CopyText from "@/components/CopyText";
import FileTypeIcon from "@/components/FileTypeIcon";
import { APP_PHASE_STATUS, APP_STATUS, Pages } from "@/constants";
import { formatDate } from "@/utils/format";
import getRegionById from "@/utils/getRegionById";

import { APP_LIST_QUERY_KEY } from "../../index";
import CreateAppModal from "../CreateAppModal";
import DeleteAppModal from "../DeleteAppModal";
import StatusBadge from "../StatusBadge";

import BundleInfo from "./BundleInfo";

import { TApplicationItem } from "@/apis/typing";
import { ApplicationControllerUpdateState } from "@/apis/v1/applications";
import useGlobalStore from "@/pages/globalStore";

function List(props: { appList: TApplicationItem[] }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const darkMode = useColorMode().colorMode === "dark";

  const { setCurrentApp, regions, userInfo } = useGlobalStore();

  const [searchKey, setSearchKey] = useState("");

  const queryClient = useQueryClient();
  const { appList } = props;
  const bg = useColorModeValue("lafWhite.200", "lafDark.200");

  const updateAppStateMutation = useMutation((params: any) =>
    ApplicationControllerUpdateState(params),
  );

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center text-2xl font-medium">
          <FileTypeIcon type="app" className="mr-3" />
          {t("HomePanel.MyApp")}
        </h2>
        <div className="flex phone:px-3">
          <InputGroup className="mr-4">
            <InputLeftElement
              height={"9"}
              left="2"
              pointerEvents="none"
              children={<Search2Icon color="gray.300" fontSize={12} />}
            />
            <Input
              rounded={"full"}
              placeholder={t("Search").toString()}
              variant="outline"
              height="36px"
              border={darkMode ? "1px solid #485058" : "1px solid #DEE0E2"}
              onChange={(e: any) => setSearchKey(e.target.value)}
            />
          </InputGroup>
          <CreateAppModal type="create">
            <Button
              colorScheme="primary"
              style={{ padding: "0 40px", height: "36px" }}
              className="!bg-primary-600 hover:!bg-primary-700"
              leftIcon={<AddIcon />}
            >
              {t("Create")}
            </Button>
          </CreateAppModal>
        </div>
      </div>

      <div className="flex flex-col overflow-auto">
        <Box bg={bg} className="mb-3 flex h-12 flex-none items-center rounded-[10px] px-6">
          <div className="w-3/12 text-second ">{t("HomePanel.Application") + t("Name")}</div>
          <div className="w-2/12 whitespace-nowrap text-second">App ID</div>
          <div className="w-2/12 pl-2 text-second">{t("HomePanel.State")}</div>
          <div className="w-2/12 text-second ">{t("HomePanel.Region")}</div>
          <div className="w-4/12 text-second ">{t("Time")}</div>
          <div className="w-1/12 min-w-[150px] pl-4 text-second">{t("Operation")}</div>
        </Box>
        <div className="flex-grow overflow-auto">
          {(appList || [])
            .filter((item: TApplicationItem) => item?.name.indexOf(searchKey) >= 0)
            .map((item: TApplicationItem) => {
              return (
                <Box
                  key={item?.appid}
                  bg={bg}
                  className="group mb-3 flex h-[68px] items-center rounded-[10px] px-6"
                >
                  <div className="w-3/12">
                    <div className="flex w-44">
                      <div className="truncate text-lg font-medium">{item?.name}</div>
                      {item?.createdBy !== userInfo?._id && (
                        <span
                          className={clsx(
                            "flex scale-[.83] items-center whitespace-nowrap rounded-full border border-dashed border-[#DEE0E2] px-2",
                            darkMode ? "" : "text-grayModern-600",
                          )}
                        >
                          {t("Collaborative")}
                        </span>
                      )}
                    </div>
                    <BundleInfo bundle={item.bundle} />
                  </div>
                  <div className={clsx(darkMode ? "" : "text-grayIron-900", "w-2/12")}>
                    <CopyText className="flex space-x-1 font-mono" text={item?.appid}>
                      <span>
                        <p>{item?.appid}</p>
                        <CopyIcon size={14} color="#CDCDD0" />
                      </span>
                    </CopyText>
                  </div>
                  <div className="w-2/12">
                    <StatusBadge
                      className="!bg-transparent"
                      statusConditions={item?.phase}
                      state={item?.state}
                    />
                  </div>
                  <div className={clsx("w-2/12 font-medium", darkMode ? "" : " text-grayIron-700")}>
                    {getRegionById(regions, item.regionId)?.displayName}
                  </div>
                  <div
                    className={
                      darkMode
                        ? "text-white/16 w-4/12 font-medium"
                        : "w-4/12 font-medium text-grayIron-700"
                    }
                  >
                    <p>
                      {t("CreateTime")}: {formatDate(item.createdAt)}{" "}
                    </p>
                  </div>
                  <div className="flex w-1/12 min-w-[150px]">
                    <Button
                      className="mr-4 !px-4 !py-1.5 !font-medium !text-primary-600"
                      fontWeight={"semibold"}
                      variant={"text"}
                      disabled={item?.phase === APP_PHASE_STATUS.Deleting}
                      onClick={(event: any) => {
                        event?.preventDefault();
                        setCurrentApp(item);
                        navigate(`/app/${item?.appid}/${Pages.function}`);
                      }}
                      leftIcon={<DevelopIcon boxSize="6" color={"primary.500"} />}
                    >
                      {t("HomePanel.Develop")}
                    </Button>
                    <Menu placement="bottom-end">
                      <MenuButton className="h-8 w-8 rounded-full hover:bg-lafWhite-600">
                        <BsThreeDotsVertical color="#828289" size={16} className="m-auto" />
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
                            <a className="text-primary block whitespace-nowrap" href="/edit">
                              {t("Change")}
                            </a>
                          </MenuItem>
                        </CreateAppModal>

                        {item.phase === APP_STATUS.Stopped ? (
                          <MenuItem
                            minH="40px"
                            display={"block"}
                            onClick={async (event) => {
                              event?.preventDefault();
                              const res = await updateAppStateMutation.mutateAsync({
                                appid: item.appid,
                                state: APP_STATUS.Running,
                              });
                              if (!res.error) {
                                queryClient.setQueryData(APP_LIST_QUERY_KEY, (old: any) => {
                                  return {
                                    ...old,
                                    data: old.data.map((app: any) => {
                                      if (app.appid === item.appid) {
                                        return {
                                          ...app,
                                          phase: APP_PHASE_STATUS.Starting,
                                        };
                                      }
                                      return app;
                                    }),
                                  };
                                });
                              }
                            }}
                          >
                            <span className="text-primary block">{t("SettingPanel.Start")}</span>
                          </MenuItem>
                        ) : (
                          <ConfirmButton
                            headerText={t("SettingPanel.Restart")}
                            bodyText={t("SettingPanel.RestartTips")}
                            confirmButtonText={String(t("Confirm"))}
                            onSuccessAction={async (event) => {
                              event?.preventDefault();
                              const res = await updateAppStateMutation.mutateAsync({
                                appid: item.appid,
                                state: APP_STATUS.Restarting,
                              });
                              if (!res.error) {
                                queryClient.setQueryData(APP_LIST_QUERY_KEY, (old: any) => {
                                  return {
                                    ...old,
                                    data: old.data.map((app: any) => {
                                      if (app.appid === item.appid) {
                                        return {
                                          ...app,
                                          phase: APP_STATUS.Restarting,
                                        };
                                      }
                                      return app;
                                    }),
                                  };
                                });
                              }
                            }}
                          >
                            <MenuItem minH="40px" display={"block"}>
                              <span className="text-primary block">
                                {t("SettingPanel.Restart")}
                              </span>
                            </MenuItem>
                          </ConfirmButton>
                        )}

                        {item.phase === APP_PHASE_STATUS.Started && (
                          <ConfirmButton
                            headerText={t("SettingPanel.Pause")}
                            bodyText={t("SettingPanel.PauseTips")}
                            confirmButtonText={String(t("Confirm"))}
                            onSuccessAction={async (event: any) => {
                              event?.preventDefault();
                              const res = await updateAppStateMutation.mutateAsync({
                                appid: item.appid,
                                state: APP_STATUS.Stopped,
                              });
                              if (!res.error) {
                                queryClient.setQueryData(APP_LIST_QUERY_KEY, (old: any) => {
                                  return {
                                    ...old,
                                    data: old.data.map((app: any) => {
                                      if (app.appid === item.appid) {
                                        return {
                                          ...app,
                                          phase: APP_PHASE_STATUS.Stopping,
                                        };
                                      }
                                      return app;
                                    }),
                                  };
                                });
                              }
                            }}
                          >
                            <MenuItem minH="40px" display={"block"}>
                              {t("SettingPanel.Pause")}
                            </MenuItem>
                          </ConfirmButton>
                        )}

                        <DeleteAppModal
                          item={item}
                          onSuccess={() => queryClient.invalidateQueries(APP_LIST_QUERY_KEY)}
                        >
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
