import React from "react";
import { useToast } from "@chakra-ui/react";

function useCustomToast() {
  const toast = useToast();

  const showSuccess = (text: string | React.ReactNode) => {
    toast({
      position: "top",
      title: text,
      status: "success",
      duration: 1000,
    });
  };

  const showError = (text: string | React.ReactNode) => {
    toast({
      position: "top",
      title: text,
      status: "error",
      duration: 1000,
    });
  };
  return {
    showSuccess,
    showError,
  };
}

export default useCustomToast;
