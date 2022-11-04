import React from "react";
import { AddIcon, CopyIcon, Search2Icon } from "@chakra-ui/icons";
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

import request from "@/utils/request";

function HomePage() {
  const appListRes = useQuery(["getAppDetailInfo"], () => {
    return request.get("/api/app");
  });

  return (
    <div className="w-8/12 mt-10 mx-auto">
      <div className="flex mb-8">
        <div className="bg-white flex-1 mr-2">
          <InputGroup>
            <InputLeftElement
              style={{ height: 48 }}
              pointerEvents="none"
              children={<Search2Icon color="gray.300" />}
            />
            <Input placeholder={t`Search`} size="lg" />
          </InputGroup>
        </div>
        <Button
          size={"lg"}
          colorScheme="brand"
          style={{ padding: "0 40px" }}
          leftIcon={<AddIcon />}
        >
          {t`NewApplication`}
        </Button>
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
                className="flex justify-between items-center p-4 bg-white rounded-lg shadow mb-4"
              >
                <div style={{ width: 300 }}>
                  <Link href="https://chakra-ui.com" isExternal>
                    <span className="text-base font-semibold">{item.name}</span>
                  </Link>

                  <p>
                    App ID: {item.appid} <CopyIcon />
                  </p>
                </div>
                <div className="flex-1">
                  <p>规格: {item.spec.name}</p>
                  <p>创建时间: {item.created_at}</p>
                </div>
                <div>
                  <a className="mr-4">开发</a>
                  <a>配置</a>
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
