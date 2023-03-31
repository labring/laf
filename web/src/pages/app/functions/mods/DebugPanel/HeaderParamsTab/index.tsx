import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { CloseIcon } from "@chakra-ui/icons";
import { Input, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
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
          <Table size="sm" className="rounded border  border-grayModern-600" variant={"unstyled"}>
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
                        width={"40px"}
                        size="sm"
                        placeholder="key"
                        {...register(`params.${index}.name` as const, {
                          required: true,
                        })}
                      />
                    </Td>
                    <Td className="relative">
                      <Input
                        size="sm"
                        width={"80px"}
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
      <button
        type="button"
        onClick={() =>
          append({
            name: "",
            value: "",
          })
        }
      >
        {t("Add")}
      </button>
    </div>
  );
}

export default HeaderParamsTab;
