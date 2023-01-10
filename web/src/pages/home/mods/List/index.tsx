import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { RiApps2Fill, RiCodeBoxFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { AddIcon, Search2Icon } from "@chakra-ui/icons";
import {
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { t } from "i18next";

import ConfirmButton from "@/components/ConfirmButton";
import IconWrap from "@/components/IconWrap";
import { Pages } from "@/constants";
import { formatDate } from "@/utils/format";

import CreateAppModal from "../CreateAppModal";
import StatusBadge from "../StatusBadge";

import { ApplicationControllerRemove } from "@/apis/v1/applications";
import useGlobalStore from "@/pages/globalStore";

function List(props: { appListQuery: any }) {
  const navigate = useNavigate();

  const { showSuccess, setCurrentApp } = useGlobalStore();

  const [searchKey, setSearchKey] = useState("");

  const { appListQuery } = props;

  const deleteAppMutation = useMutation((params: any) => ApplicationControllerRemove(params), {
    onSuccess: () => {
      appListQuery.refetch();
      showSuccess("delete success.");
    },
    onError: () => {
      // debugger;
    },
  });

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-xl flex items-center">
          <RiApps2Fill className="mr-1 text-second" size={18} /> 我的应用
        </h2>
        <div className="flex">
          <InputGroup className="mr-4">
            <InputLeftElement
              height={"10"}
              pointerEvents="none"
              children={<Search2Icon color="gray.300" />}
            />
            <Input
              rounded={"full"}
              placeholder={"搜索"}
              bg={"white"}
              onChange={(e) => setSearchKey(e.target.value)}
            />
          </InputGroup>
          <CreateAppModal>
            <Button colorScheme="primary" style={{ padding: "0 40px" }} leftIcon={<AddIcon />}>
              {t("NewApplication")}
            </Button>
          </CreateAppModal>
        </div>
      </div>

      <div>
        <div className="flex bg-white rounded-lg h-12 items-center px-6 mb-3">
          <div className="w-2/12 text-second ">应用名称</div>
          <div className="w-2/12 text-second ">App ID</div>
          <div className="w-2/12 text-second  pl-2">State</div>
          <div className="w-2/12 text-second ">Region</div>
          <div className="w-3/12 text-second ">创建时间</div>
          <div className="w-1/12 text-second  pl-2">操作</div>
        </div>
        {(appListQuery.data?.data || [])
          .filter((item: any) => item?.name.indexOf(searchKey) >= 0)
          .map((item: any) => {
            return (
              <div
                key={item?.appid}
                className="flex bg-white rounded-lg h-16 items-center px-6 mb-3"
              >
                <div className="w-2/12 font-bold text-lg">{item?.name}</div>
                <div className="w-2/12 ">{item?.appid}</div>
                <div className="w-2/12 ">
                  <StatusBadge statusConditions={item?.phase} />
                </div>
                <div className="w-2/12 ">{item.regionName}</div>
                <div className="w-3/12 ">{formatDate(item.createdAt)}</div>
                <div className="w-1/12 flex">
                  <Button
                    className="mr-2 font-semibold"
                    size={"sm"}
                    variant={"ghost"}
                    onClick={(event) => {
                      event?.preventDefault();
                      setCurrentApp(item?.appid);
                      navigate(`/app/${item?.appid}/${Pages.function}`);
                    }}
                  >
                    <RiCodeBoxFill size={14} className="mr-2" />
                    开发
                  </Button>
                  <Menu>
                    <MenuButton>
                      <IconWrap>
                        <BsThreeDotsVertical size={16} />
                      </IconWrap>
                    </MenuButton>
                    <MenuList width={12} minW={24}>
                      <MenuItem minH="40px">
                        <CreateAppModal application={item}>
                          <a className="text-primary" href="/edit">
                            编辑
                          </a>
                        </CreateAppModal>
                      </MenuItem>
                      <MenuItem minH="40px">
                        <ConfirmButton
                          headerText="Delete App?"
                          bodyText="Are you sure you want to delete this app."
                          onSuccessAction={() => {
                            deleteAppMutation.mutate({ appid: item?.appid });
                          }}
                        >
                          <a className="text-danger" href="/delete">
                            删除
                          </a>
                        </ConfirmButton>
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
}

export default List;
