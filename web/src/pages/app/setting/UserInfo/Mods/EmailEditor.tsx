import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Box, Button, FormControl, Input, VStack } from "@chakra-ui/react";

export default function EmailEditor(props: { handleBack: any }) {
  const { handleBack } = props;
  return (
    <>
      <span
        onClick={() => handleBack()}
        className="absolute left-[280px] flex cursor-pointer items-center"
      >
        <ChevronLeftIcon boxSize={6} /> 返回
      </span>
      <VStack className="flex w-full flex-col">
        <span className="w-full text-center text-xl">更改邮箱</span>
        <Box className="flex h-[400px] items-center pb-32 ">
          <FormControl className="flex flex-col justify-center">
            <div className="pb-2">邮箱</div>
            <Input width={64} bg={"#F8FAFB"} border={"1px"} borderColor={"#D5D6E1"} />
            <Button width={64} mt={8}>
              保存
            </Button>
          </FormControl>
        </Box>
      </VStack>
    </>
  );
}
