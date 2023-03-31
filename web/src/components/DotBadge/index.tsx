import { Box } from "@chakra-ui/react";

export default function DotBadge({
  text,
  type = "success",
}: {
  text: React.ReactNode;
  type?: "success" | "warning" | "error" | "info";
}) {
  let color = "";
  let bgColor = "bg-primary-600";
  switch (type) {
    case "success":
      color = "text-primary-600";
      bgColor = "bg-primary-600";
      break;
    case "warning":
      color = "text-warn-600";
      bgColor = "bg-warn-600";
      break;
    case "error":
      color = "text-error-600";
      bgColor = "bg-error-600";
      break;
    case "info":
      color = "text-blue-500";
      bgColor = "bg-blue-600";
      break;
    default:
      break;
  }
  return (
    <Box>
      <span className={"mr-1 inline-block h-[6px] w-[6px] rounded-full " + bgColor}></span>
      <span className={color}>{text}</span>
    </Box>
  );
}
