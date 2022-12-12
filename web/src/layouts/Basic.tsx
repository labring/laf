import { useEffect } from "react";
import { AiFillHeart } from "react-icons/ai";
import { Spinner } from "@chakra-ui/react";

import Header from "@/layouts/Header";
import useGlobalStore from "@/pages/globalStore";
import { Outlet } from "react-router-dom";

export default function BasicLayout() {
  const { init, loading } = useGlobalStore((state) => state);
  useEffect(() => {
    init();
  }, [init]);

  return (
    <div>
      <Header size="lg" />
      <div className="pb-16">{loading ? <Spinner /> : <Outlet />}</div>
      <div className="text-center bg-white fixed bottom-0 py-4 w-full">
        Made with <AiFillHeart className="inline text-red-500" />️ by LaF Team
      </div>
    </div>
  );
}
