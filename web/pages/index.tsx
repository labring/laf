import React from "react";
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
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";

import CopyText from "@/components/CopyText";
import { formatDate } from "@/utils/format";
import request from "@/utils/request";

import CreateAppModal from "./mods/CreateModal";
function HomePage() {
  const appListRes = useQuery(["getAppDetailInfo"], () => {
    return request.get("/api/app");
  });

  const router = useRouter();

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
            <Input placeholder={t`Search`} size="lg" />
          </InputGroup>
        </div>
        <CreateAppModal />
      </div>

      {appListRes.isLoading ? (
        <Center>
          <Spinner size="xl" />
        </Center>
      ) : (
        <div>
          {(appListRes.data?.data?.created || []).map((item: any) => {
            return (
              <div
                key={item.appid}
                className="flex justify-between items-center p-4 py-6 bg-white rounded-lg shadow mb-6 hover:bg-slate-100"
              >
                <div style={{ width: 300 }}>
                  <Link href="https://chakra-ui.com" isExternal>
                    <span className="text-lg font-semibold">{item.name}</span>
                  </Link>

                  <p>
                    App ID: {item.appid} <CopyText text={item.appid} />
                  </p>
                </div>
                <div className="flex-1">
                  <p>规格: {item.spec.name}</p>
                  <p>创建时间: {formatDate(item.created_at)}</p>
                </div>
                <div>
                  <Button
                    colorScheme="teal"
                    variant="ghost"
                    onClick={(event) => {
                      event?.preventDefault();
                      router.push(`/app/${item.appid}`);
                    }}
                  >
                    开发
                  </Button>

                  <Button colorScheme="teal" variant="ghost">
                    配置
                  </Button>
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
