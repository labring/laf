import { useMemo, useState } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { SearchIcon, SmallCloseIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Center,
  Checkbox,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { debounce } from "lodash";

import DependenceList from "@/components/DependenceList";

import {
  TDependenceItem,
  usePackageSearchQuery,
} from "@/pages/app/functions/mods/DependencePanel/service";

const AddDependenceModal = (props: {
  children?: React.ReactElement;
  packageList: any[];
  setPackageList: React.Dispatch<React.SetStateAction<any[]>>;
}) => {
  const { children = null, setPackageList } = props;
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState("");
  const [clickItem, setClickItem] = useState({ package: "", loading: false });
  const [isShowChecked, setIsShowChecked] = useState(false);
  const [checkList, setCheckList] = useState<TDependenceItem[]>([]);
  const [list, setList] = useState<TDependenceItem[]>([]);

  const packageSearchQuery = usePackageSearchQuery(name, (data) => {
    const list: TDependenceItem[] = (data || []).map((item: any) => {
      const existItem = checkList.find((checkItem: TDependenceItem) => {
        return checkItem.package.name === item.package.name;
      });
      return existItem ? existItem : { ...item, versions: [] };
    });
    setList(list);
  });

  const search = useMemo(
    () =>
      debounce((val: string) => {
        setName(val);
      }, 1000),
    [setName],
  );

  const setCheck = (dependence: TDependenceItem) => {
    let list: TDependenceItem[] = [...checkList];
    let index: number = list.findIndex(
      (item: TDependenceItem) => item.package.name === dependence.package.name,
    );
    if (index === -1) {
      list.push(dependence);
    } else {
      list.splice(index, 1);
    }
    setCheckList(list);
  };

  const renderList = (list: TDependenceItem[]) => {
    return list.length === 0 ? (
      <Center minH={200} className="text-grayIron-600">
        {t("NoData")}
      </Center>
    ) : (
      <DependenceList>
        {(list || []).map((packageItem: TDependenceItem) => {
          return (
            <DependenceList.Item
              style={{ minHeight: "45px" }}
              isActive={false}
              key={packageItem.package.name}
              className="group"
              onClick={() => {
                if (packageItem.versions.length === 0 && !clickItem.loading) {
                  setClickItem({ package: packageItem.package.name, loading: true });
                }
              }}
            >
              <Checkbox
                colorScheme="primary"
                size="lg"
                onChange={() => {
                  setCheck(packageItem);
                }}
                isChecked={checkList.some(
                  (item: TDependenceItem) => item.package.name === packageItem.package.name,
                )}
              >
                <Box ml={5} width="350px">
                  <b>{packageItem.package.name}</b>
                  <p className="overflow-hidden text-ellipsis whitespace-nowrap text-base text-second ">
                    {packageItem.package.description}
                  </p>
                </Box>
              </Checkbox>
              <div className="flex items-center space-x-2">
                {clickItem.package === packageItem.package.name && clickItem.loading ? (
                  <Spinner size="xs" color="primary.500" />
                ) : null}
                <Select
                  width="150px"
                  size="sm"
                  variant="filled"
                  placeholder={packageItem.package.version}
                  onClick={() => {
                    if (packageItem.versions.length === 0 && !clickItem.loading) {
                      setClickItem({ package: packageItem.package.name, loading: true });
                    }
                  }}
                >
                  {packageItem.versions.map((subItem: string | undefined) => {
                    return (
                      <option key={subItem} value={subItem}>
                        {subItem}
                      </option>
                    );
                  })}
                </Select>
              </div>
            </DependenceList.Item>
          );
        })}
      </DependenceList>
    );
  };

  return (
    <>
      {children &&
        React.cloneElement(children, {
          onClick: () => {
            onOpen();
          },
        })}

      <Modal isOpen={isOpen} onClose={onClose} size={"2xl"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("FunctionPanel.DependenceAdd")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div>
              <InputGroup mb={3}>
                <InputLeftElement pointerEvents="none" children={<SearchIcon color="gray.300" />} />
                <Input
                  rounded={"full"}
                  onChange={(e: any) => {
                    search(e.target.value);
                  }}
                  placeholder={t("FunctionPanel.DependenceTip").toString()}
                />
              </InputGroup>
              {packageSearchQuery.isFetching ? (
                <Center className="min-h-[200px]">
                  <Spinner size="lg" />
                </Center>
              ) : isShowChecked ? (
                renderList(checkList)
              ) : (
                renderList(list)
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            {checkList.length > 0 && (
              <span
                className="mr-2 text-lg hover:cursor-pointer "
                onClick={() => {
                  setIsShowChecked((pre) => !pre);
                }}
              >
                {t("FunctionPanel.Select")}:
                <span className="mx-2 text-blue-500 ">
                  {isShowChecked ? (
                    <SmallCloseIcon fontSize={16} className="align-middle" />
                  ) : (
                    checkList.length
                  )}
                </span>
              </span>
            )}

            <Button
              onClick={() => {
                setPackageList(checkList);
                onClose();
              }}
            >
              {t("Confirm")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddDependenceModal;
