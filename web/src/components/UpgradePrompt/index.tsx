import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Box, useToast, VStack } from "@chakra-ui/react";
import { useRegisterSW } from "virtual:pwa-register/react";

const UpgradePrompt = () => {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (!r) return;
      r.update();

      setInterval(() => {
        if (!(!r.installing && navigator)) return;
        if ("connection" in navigator && !navigator.onLine) return;
        r.update();
      }, 5 * 60 * 1000); // check new version every 5 mins
    },
  });

  const toast = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (needRefresh && !toast.isActive("laf-version-upgrade")) {
      toast({
        id: "laf-version-upgrade",
        position: "bottom-right",
        duration: null,
        render: () => (
          <div className="flex justify-end">
            <Box
              color="white"
              w={210}
              p={3}
              m={3}
              bg="primary.500"
              borderRadius={10}
              shadow="2xl"
              className="animate-bounce cursor-pointer select-none hover:scale-105 focus:outline-none active:bg-primary-700"
              onClick={() => updateServiceWorker(true)}
            >
              <VStack>
                <p className="text-lg font-bold">🎉 {t("UpgradeVersionTip.Title")}</p>
                <p className="tracking-wider">{t("UpgradeVersionTip.Description")}</p>
              </VStack>
            </Box>
          </div>
        ),
      });
    }
  }, [needRefresh]);

  return <></>;
};

export default UpgradePrompt;
