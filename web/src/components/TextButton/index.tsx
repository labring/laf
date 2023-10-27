import { forwardRef } from "react";
import { Button } from "@chakra-ui/react";
const TextButton = function (
  props: {
    text: string;
    onClick?: () => void;
    className?: string;
    type?: "submit" | undefined;
  },
  ref: any,
) {
  const { text, type, onClick, className } = props;
  return (
    <Button
      variant={"link"}
      size="xs"
      className={className + " !text-[#219BF4]"}
      type={type}
      onClick={() => {
        onClick && onClick();
      }}
    >
      {text}
    </Button>
  );
};
export default forwardRef(TextButton);
