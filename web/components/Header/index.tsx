/****************************
 * laf website header nav
 ***************************/

import React from "react";
import { BiHelpCircle } from "react-icons/bi";
import { GrGithub, GrLanguage } from "react-icons/gr";
import { HStack, Tag, TagLabel } from "@chakra-ui/react";
import { useRouter } from "next/router";
import useGlobalStore from "pages/globalStore";

import { SmallNavHeight } from "@/constants/index";

import IconWrap from "../IconWrap";

export default function Header(props: { size: "sm" | "lg" }) {
  const { size } = props;
  const router = useRouter();

  const { userInfo } = useGlobalStore((state) => state);

  return size === "sm" ? (
    <div
      className="flex justify-between items-center bg-white px-5 border-b"
      style={{ height: SmallNavHeight }}
    >
      <div className="flex items-center">
        <div
          className="mr-5 cursor-pointer"
          onClick={() => {
            router.push("/");
          }}
        >
          <img src="/logo.png" alt="logo" className="mr-2 rounded-full" width={30} />
        </div>
        <span className="mr-4 font-bold text-lg">{userInfo.username}</span>
      </div>

      <HStack spacing={5}>
        <GrLanguage fontSize={16} />
        <IconWrap tooltip="Doc">
          <BiHelpCircle fontSize={20} />
        </IconWrap>
        <IconWrap
          tooltip="Star on Github"
          onClick={() => {
            window.open("https://www.github.com/labring/laf", "_blank");
          }}
        >
          <GrGithub fontSize={18} className="cursor-pointer" />
        </IconWrap>
        <img src={userInfo.profile?.avatar} className="rounded-full" width={20} alt="avatar" />
      </HStack>
    </div>
  ) : (
    <div className="flex justify-between p-4 bg-white	border-b">
      <div className="flex items-center">
        <img src="/logo.png" alt="logo" className="mr-2 rounded-full" width={30} />
        <span className=" font-bold text-lg">Laf 云开发</span>
        <span className="ml-4 mr-4"> / </span>
        <span>{userInfo.username}</span>
      </div>

      <div>
        <img src={userInfo.profile?.avatar} className="rounded-full" width={30} alt="avatar" />
      </div>
    </div>
  );
}
