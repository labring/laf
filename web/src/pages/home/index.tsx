import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddIcon, Search2Icon } from "@chakra-ui/icons";
import { Button, Center, Input, InputGroup, InputLeftElement, Spinner } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";

import ConfirmButton from "@/components/ConfirmButton";
import CopyText from "@/components/CopyText";
import { formatDate } from "@/utils/format";

import { APP_PHASE_STATUS } from "../../constants";
import useGlobalStore from "../globalStore";

import CreateAppModal from "./mods/CreateAppModal";
import StatusBadge from "./mods/StatusBadge";

import {
  ApplicationsControllerFindAll,
  ApplicationsControllerRemove,
} from "@/apis/v1/applications";

function HomePage() {
  const navigate = useNavigate();

  const { showSuccess, setCurrentApp } = useGlobalStore();

  const [searchKey, setSearchKey] = useState("");

  const [shouldRefetch, setShouldRefetch] = useState(false);

  const appListQuery = useQuery(
    ["appListQuery"],
    () => {
      return ApplicationsControllerFindAll({});
    },
    {
      refetchInterval: shouldRefetch ? 1000 : false,
      onSuccess(data) {
        setShouldRefetch(
          data?.data?.filter((item: any) => item?.phase !== APP_PHASE_STATUS.Started).length > 0,
        );
      },
    },
  );

  const deleteAppMutation = useMutation((params: any) => ApplicationsControllerRemove(params), {
    onSuccess: () => {
      appListQuery.refetch();
      showSuccess("delete success.");
    },
    onError: () => {
      // debugger;
    },
  });

  return (
    <div className="w-8/12 mt-10 mx-auto">
      <div className="flex mb-8">
        <div className="bg-white flex-1 mr-2">
          <InputGroup>
            <InputLeftElement
              height={"12"}
              pointerEvents="none"
              children={<Search2Icon color="gray.300" />}
            />
            <Input placeholder={"搜索"} size="lg" onChange={(e) => setSearchKey(e.target.value)} />
          </InputGroup>
        </div>
        <CreateAppModal>
          <Button
            size={"lg"}
            colorScheme="primary"
            style={{ padding: "0 40px" }}
            leftIcon={<AddIcon />}
          >
            应用列表
          </Button>
        </CreateAppModal>
      </div>

      {appListQuery.isLoading ? (
        <Center>
          <Spinner size="xl" />
        </Center>
      ) : (
        <div>
          {(appListQuery.data?.data || [])
            .filter((item: any) => item?.name.indexOf(searchKey) >= 0)
            .map((item: any) => {
              return (
                <div
                  key={item?.appid}
                  className="flex justify-between items-center p-4 py-6 bg-white rounded-lg shadow mb-6 hover:bg-slate-100"
                >
                  <div style={{ width: 300 }}>
                    <span className="text-lg font-semibold ">{item?.name}</span>

                    <p className="mt-1">
                      App ID: {item?.appid} <CopyText text={item?.appid} />
                    </p>
                  </div>
                  <div className="flex-1">
                    <p>Region: {item.regionName}</p>
                    <p className="mt-1">创建时间: {formatDate(item.createdAt)}</p>
                  </div>

                  <div className="flex-1">
                    <StatusBadge statusConditions={item?.phase} />
                  </div>

                  {item?.phase === APP_PHASE_STATUS.Started ? (
                    <div style={{ width: 200 }}>
                      <Button
                        colorScheme="teal"
                        variant="ghost"
                        onClick={(event) => {
                          event?.preventDefault();
                          setCurrentApp(item?.appid);
                          navigate(`/app/${item?.appid}`);
                        }}
                      >
                        进入开发
                      </Button>

                      <CreateAppModal application={item}>
                        <Button colorScheme="teal" variant="ghost">
                          编辑
                        </Button>
                      </CreateAppModal>

                      <ConfirmButton
                        headerText="Delete App?"
                        bodyText="Are you sure you want to delete this app."
                        onSuccessAction={() => {
                          deleteAppMutation.mutate({ appid: item?.appid });
                        }}
                      >
                        <Button colorScheme="red" variant="ghost">
                          删除
                        </Button>
                      </ConfirmButton>
                    </div>
                  ) : (
                    <div style={{ width: 200 }}></div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

export default HomePage;
