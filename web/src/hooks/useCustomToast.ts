import React from "react";
import { useToast } from "@chakra-ui/react";
import { useThrottle } from "@/utils/other";

function useCustomToast() {
  const toast = useToast();

  const showSuccess = (text: string | React.ReactNode) => {
    useThrottle(() => {
      toast({
        position: "top",
        title: text,
        status: "success",
        duration: 1000,
      });
    }, 500);
  };

  const showError = (text: string | React.ReactNode) => {
    useThrottle(() => {
      toast({
        position: "top",
        title: text,
        status: "error",
        duration: 1000,
      });
    }, 500);
  };
  return {
    showSuccess,
    showError,
  };
}

export default useCustomToast;
