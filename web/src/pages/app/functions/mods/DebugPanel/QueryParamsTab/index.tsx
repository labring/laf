import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { CloseIcon } from "@chakra-ui/icons";
import { Button, Input, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { t } from "i18next";

type Params = {
  name: string;
  value: string;
};

type FormValues = {
  params: Params[];
};

function HeaderParamsTab(props: { onChange(values: Params[]): void }) {
  const { onChange } = props;
  const { register, control, watch } = useForm<FormValues>({
    defaultValues: {
      params: [{ name: "", value: "" }],
    },
    mode: "onBlur",
  });
  const { fields, append, remove } = useFieldArray({
    name: "params",
    control,
  });

  useEffect(() => {
    const subscription = watch((value) => {
      onChange && onChange(value?.params as Params[]);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <div>
      <form>
        <TableContainer>
          <Table size="sm" className="rounded border border-grayModern-600">
            <Thead>
              <Tr>
                <Th>{t("FunctionPanel.Name")}</Th>
                <Th>{t("FunctionPanel.Value")}</Th>
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
        mt={2}
        width={"100%"}
        variant="outline"
        color={"gray.500"}
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
