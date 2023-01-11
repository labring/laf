/****************************
 * laf website header nav
 ***************************/

// import { BiHelpCircle } from "react-icons/bi";
// import { GrGithub, GrLanguage } from "react-icons/gr";
import { RiCodeBoxFill } from "react-icons/ri";

// import { useNavigate } from "react-router-dom";
// import { HStack } from "@chakra-ui/react";
// import { SmallNavHeight } from "@/constants/index";
// import IconWrap from "../../components/IconWrap";
import UserSetting from "./UserSetting";

import useGlobalStore from "@/pages/globalStore";

export default function Header(props: { size: "sm" | "lg" }) {
  const { size } = props;
  // const navigate = useNavigate();

  const { userInfo } = useGlobalStore((state) => state);

  return size === "sm" ? //   <div className="flex items-center"> // > //   style={{ height: SmallNavHeight }} //   className="flex justify-between items-center  px-5 border-b" // <div
  //     <div
  //       className="mr-5 cursor-pointer"
  //       onClick={() => {
  //         navigate("/");
  //       }}
  //     >
  //       <RiCodeBoxFill size={32} className="mr-2" />
  //     </div>
  //     <span className="mr-4 font-bold text-gray-500 text-lg">{userInfo.username}</span>
  //   </div>

  //   <HStack spacing={5}>
  //     <GrLanguage fontSize={16} />
  //     <IconWrap tooltip="Doc">
  //       <BiHelpCircle fontSize={20} />
  //     </IconWrap>
  //     <IconWrap
  //       tooltip="Star on Github"
  //       onClick={() => {
  //         window.open("https://www.github.com/labring/laf", "_blank");
  //       }}
  //     >
  //       <GrGithub fontSize={18} className="cursor-pointer" />
  //     </IconWrap>
  //     <UserSetting avator={userInfo.profile?.avatar} width={20} />
  //   </HStack>
  // </div>
  null : (
    <div className="flex justify-between px-10 py-4">
      <div className="flex items-center">
        <RiCodeBoxFill size={32} className="mr-2" />
        <span className="text-2xl font-semibold">LaF</span>
      </div>

      <div>
        {userInfo.profile ? <UserSetting avator={userInfo.profile?.avatar} width={30} /> : null}
      </div>
    </div>
  );
}
