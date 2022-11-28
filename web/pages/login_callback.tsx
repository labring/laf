import React from "react";
import { Center, Spinner } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { AppControllerCode2token } from "services/v1/code2token";

export default function LoginCallBack() {
  const router = useRouter();
  const { code } = router.query;

  const tokenRes = useQuery(["tokenRes"], () => {
    return AppControllerCode2token({
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
