import { useTranslation } from "react-i18next";
import { Box, Select } from "@chakra-ui/react";

export default function ProfileSetting() {
  const { i18n, t } = useTranslation();

  return (
    <div className="flex items-center">
      <span className="w-[80px] text-lg font-bold ">{t("SwitchLanguage")}</span>
      <Box w="250px">
        <Select
          defaultValue={i18n.language}
          onChange={(event) => {
            i18n.changeLanguage(event.target.value);
          }}
        >
          <option value="en">English</option>
          <option value="zh-CN">中文</option>
        </Select>
      </Box>
    </div>
  );
}
