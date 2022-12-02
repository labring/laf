import React, { useRef, useState } from "react";
import { Search2Icon } from "@chakra-ui/icons";
import {
  Button,
  Center,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Spinner,
} from "@chakra-ui/react";
import { t } from "@lingui/macro";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import {
  ApplicationsControllerFindAll,
  ApplicationsControllerRemove,
} from "services/v1/applications";

import ConfirmButton from "@/components/ConfirmButton";
import CopyText from "@/components/CopyText";
import { formatDate } from "@/utils/format";

import CreateAppModal from "./mods/CreateAppModal";
import StatusBadge from "./mods/StatusBadge";
import useGlobalStore from "./globalStore";
function HomePage() {
  const router = useRouter();

  const { showSuccess, setCurrentApp } = useGlobalStore();

  const [searchKey, setSearchKey] = useState("");

  const createAppRef = useRef<any>(null);

  const appListQuery = useQuery(["appListQuery"], () => {
    return ApplicationsControllerFindAll({});
  });

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
            <Input
              placeholder={t`Search`}
              size="lg"
              onChange={(e) => setSearchKey(e.target.value)}
            />
          </InputGroup>
        </div>
        <CreateAppModal ref={createAppRef} />
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
                    <Link isExternal>
                      <span className="text-lg font-semibold ">{item?.name}</span>
                    </Link>

                    <p className="mt-1">
                      App ID: {item?.appid} <CopyText text={item?.appid} />
                    </p>
                  </div>
                  <div className="flex-1">
                    <p>Region: {item.regionName}</p>
                    <p className="mt-1">创建时间: {formatDate(item.createdAt)}</p>
                  </div>

                  <div className="flex-1">
                    <StatusBadge appid={item?.appid} statusConditions={item?.status?.conditions} />
                  </div>

                  <div>
                    <Button
                      colorScheme="teal"
                      variant="ghost"
                      onClick={(event) => {
                        event?.preventDefault();
                        setCurrentApp(item?.appid);
                        router.push(`/app/${item?.appid}`);
                      }}
                    >
                      进入开发
                    </Button>

                    <Button
                      colorScheme="teal"
                      variant="ghost"
                      onClick={() => {
                        createAppRef.current?.edit(item);
                      }}
                    >
                      编辑
                    </Button>

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
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

export default HomePage;
