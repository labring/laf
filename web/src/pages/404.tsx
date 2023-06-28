import { useNavigate } from "react-router-dom";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { Button, Center, HStack } from "@chakra-ui/react";
import { t } from "i18next";

import { Routes } from "@/constants";

export default function Index() {
  const navigate = useNavigate();
  return (
    <div className=" h-screen bg-white">
      <Center h="80vh" w="80vw" className="m-auto flex-col !items-start">
        <h1 style={{ fontSize: 38 }}>404</h1>
        <p className="mb-8 font-semibold" style={{ fontSize: 60 }}>
          {t(`404Message`)}
        </p>
        <HStack spacing={6}>
          <Button
            rightIcon={<ArrowForwardIcon />}
            size={"lg"}
            onClick={() => navigate(Routes.dashboard, { replace: true })}
          >
            {t("Take me home")}
          </Button>
        </HStack>
      </Center>
    </div>
  );
}
