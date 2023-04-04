import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { CloseIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Input,
  Radio,
  RadioGroup,
  Select,
  Stack,
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

import JsonEditor from "@/components/Editor/JsonEditor";

type TContentType = "application/json" | "multipart/form-data";

type Params = {
  name: string;
  value: string | File[];
  type: string;
};

type FormValues = {
  params: Params[];
};

const ContentType = {
  JSON: "application/json",
  FORM_DATA: "multipart/form-data",
};

function BodyParamsTab(props: { onChange(values: { contentType: string; data: any }): void }) {
  const { onChange } = props;
  const { colorMode } = useColorMode();

  const [dataType, setDataType] = useState<string>(ContentType.JSON);

  const { register, control, watch, getValues } = useForm<FormValues>({
    defaultValues: {
      params: [{ name: "", value: "", type: ContentType.FORM_DATA }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "params",
    control,
  });

  useWatch({
    control,
    name: "params",
  });

  useEffect(() => {
    const subscription = watch((value) => {
      const formData = new FormData();
      (value.params || []).forEach((v: any) => {
        formData.append(v.name, v.type === ContentType.FORM_DATA ? v.value[0] : v.value);
      });

      onChange &&
        onChange({
          contentType: ContentType.FORM_DATA,
          data: formData,
        });
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <div className="h-full">
      <RadioGroup
        defaultValue={ContentType.JSON}
        size="sm"
        px="4"
        mb="2"
        onChange={(v: TContentType) => setDataType(v)}
      >
        <Stack spacing={4} direction="row">
          <Radio value={ContentType.JSON}>json</Radio>
          <Radio value={ContentType.FORM_DATA}>form data</Radio>
        </Stack>
      </RadioGroup>
      {dataType === ContentType.JSON ? (
        <JsonEditor
          colorMode={colorMode}
          onChange={(values) => {
            try {
              const jsonValues = JSON.parse(values || "{}");
              onChange &&
                onChange({
                  contentType: ContentType.JSON,
                  data: jsonValues,
                });
            } catch (e) {}
          }}
          value={JSON.stringify({}, null, 2)}
        />
      ) : (
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
                      <Tr key={field.id} className="w-full overflow-hidden">
                        <Td className="relative " w={"120px"} maxW={"120px"}>
                          <Input
                            size="sm"
                            w={"120px"}
                            maxW={"120px"}
                            variant={"unstyled"}
                            placeholder="key"
                            {...register(`params.${index}.name` as const, {
                              required: true,
                            })}
                          />
                          <Box className="absolute right-0 top-1 text-slate-400" w="46px">
                            <Select
                              border={0}
                              paddingRight={0}
                              style={{ padding: 0 }}
                              size="xs"
                              {...register(`params.${index}.type` as const, {
                                required: true,
                              })}
                            >
                              <option value={ContentType.JSON}>text</option>
                              <option value={ContentType.FORM_DATA}>file</option>
                            </Select>
                          </Box>
                        </Td>
                        <Td className="relative ">
                          {getValues(`params.${index}.type`) === ContentType.FORM_DATA ? (
                            <>
                              <label
                                htmlFor={`params.${index}`}
                                className="cursor-pointer rounded bg-slate-200 px-[4px] py-[2px]"
                              >
                                {t("FunctionPanel.UploadButton")}
                              </label>
                              <span className="text-ellipsis pr-2">
                                {(getValues(`params.${index}.value`)[0] as File)?.name}
                              </span>
                              <Input
                                className="hidden"
                                id={`params.${index}`}
                                type="file"
                                size="sm"
                                variant={"unstyled"}
                                placeholder="value"
                                {...register(`params.${index}.value` as const, {
                                  required: true,
                                })}
                              />
                            </>
                          ) : (
                            <Input
                              id={`params.${index}`}
                              type={getValues(`params.${index}.type`)}
                              size="sm"
                              variant={"unstyled"}
                              placeholder="value"
                              {...register(`params.${index}.value` as const, {
                                required: true,
                              })}
                            />
                          )}

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
                type: "text",
              })
            }
          >
            {t("Add")}
          </Button>
        </div>
      )}
    </div>
  );
}

export default BodyParamsTab;
