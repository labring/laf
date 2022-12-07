import React from "react";
import { Center, Spinner } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { AuthControllerCode2token } from "apis/v1/code2token";
import { useRouter } from "next/router";

import LoginReg from "@/components/Layout/LoginReg";

export default function LoginCallBack() {
  const router = useRouter();
  const { code } = router.query;

  const tokenRes = useQuery(["tokenRes"], () => {
    return AuthControllerCode2token({
      code,
    });
  });

  if (!tokenRes.isLoading && tokenRes.data?.data) {
    localStorage.setItem("token", tokenRes.data?.data);
    router.replace("/");
  }

  return (
    <Center minHeight={300}>{tokenRes.isLoading ? <Spinner /> : <>{tokenRes.data.error}</>}</Center>
  );
}

LoginCallBack.getLayout = (page: React.ReactElement) => {
  return <LoginReg>{page}</LoginReg>;
};
