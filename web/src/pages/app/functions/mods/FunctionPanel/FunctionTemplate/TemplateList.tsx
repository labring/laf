import { useState } from "react";
import { Box, VStack } from "@chakra-ui/react";
import clsx from "clsx";

export default function FunctionTemplate(props: { title: string; data: any[] }) {
  const { title, data } = props;
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <div>
      <div className="mb-2 border-l-4 border-primary-600 pl-2 text-second">{title}</div>
      <VStack spacing={4} className="pb-4">
        {data.map((item: any) => (
          <Box
            key={item.id}
            className={clsx(
              "mx-2 flex h-8 w-full cursor-pointer items-center rounded-md px-4 text-lg hover:bg-primary-100 hover:text-primary-600 hover:drop-shadow-md",
              selectedItem === item && "bg-primary-100 text-primary-600 drop-shadow-md",
            )}
            onClick={() => setSelectedItem(item)}
          >
            {item.name}
          </Box>
        ))}
      </VStack>
    </div>
  );
}
