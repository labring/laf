import { Button } from "@chakra-ui/react";
const TextButton = function (props: {
  text: string;
  onClick?: () => void;
  className?: string;
  type?: "submit" | undefined;
}) {
  const { text, type, onClick, className } = props;
  return (
    <Button
      variant={"link"}
      size="xs"
      colorScheme={"blue"}
      className={className}
      type={type}
      onClick={() => {
        onClick && onClick();
      }}
    >
      {text}
    </Button>
  );
};
export default TextButton;
