import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { CloseIcon } from "@chakra-ui/icons";
import {
  Button,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorMode,
} from "@chakra-ui/react";
import { t } from "i18next";

type Params = {
  name: string;
  value: string;
};

type FormValues = {
  params: Params[];
};

function HeaderParamsTab(props: { onChange(values: Params[]): void; paramsList: Params[] }) {
  const { onChange, paramsList } = props;
  const { register, control, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      params: [{ name: "", value: "" }],
    },
    mode: "onBlur",
  });
  const { fields, append, remove } = useFieldArray({
    name: "params",
    control,
  });
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  useEffect(() => {
    const subscription = watch((value) => {
      onChange && onChange(value?.params as Params[]);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  useEffect(() => {
    setValue("params", paramsList ?? []);
  }, [setValue, paramsList]);

  return (
    <div>
      <form>
        <TableContainer>
          <Table size="sm" variant={"params"}>
            <Thead>
              <Tr>
                <Th className="text-grayModern-500">{t("FunctionPanel.Name")}</Th>
                <Th className="text-grayModern-500">{t("FunctionPanel.Value")}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {fields.map((field, index) => {
                return (
                  <Tr key={field.id}>
                    <Td>
                      <Input
                        size="sm"
                        variant={"unstyled"}
                        placeholder="key"
                        {...register(`params.${index}.name` as const, {
                          required: true,
                        })}
                      />
                    </Td>
                    <Td className="relative">
                      <Input
                        size="sm"
                        variant={"unstyled"}
                        placeholder="value"
                        {...register(`params.${index}.value` as const, {
                          required: true,
                        })}
                      />
                      <CloseIcon
                        fontSize={9}
                        className="absolute right-2 top-3 cursor-pointer hover:text-red-500"
                        onClick={() => remove(index)}
                      />
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </form>
      <Button
        size="sm"
        mt={1}
        width={"100%"}
        variant="outline"
        className="!rounded-sm !font-medium !text-grayModern-600"
        bg={darkMode ? "lafDark.300" : "lafWhite.400"}
        border={darkMode ? "1px solid" : "1px solid #EFF0F1"}
        onClick={() =>
          append({
            name: "",
            value: "",
          })
        }
      >
        {t("Add")}
      </Button>
    </div>
  );
}

export default HeaderParamsTab;
