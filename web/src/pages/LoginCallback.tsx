import { Center, Spinner } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { AuthControllerCode2token } from "@/apis/v1/code2token";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function LoginCallBack() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  const tokenRes = useQuery(["tokenRes"], () => {
    return AuthControllerCode2token({
      code,
    });
  });

  if (!tokenRes.isLoading && tokenRes.data?.data) {
    localStorage.setItem("token", tokenRes.data?.data);
    navigate("/", { replace: true });
  }

  return (
    <Center minHeight={300}>{tokenRes.isLoading ? <Spinner /> : <>{tokenRes.data.error}</>}</Center>
  );
}
