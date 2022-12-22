import React, { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { AddIcon, SearchIcon, SmallCloseIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Center,
  Checkbox,
  Flex,
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
  Spacer,
  Spinner,
  Tag,
  useDisclosure,
} from "@chakra-ui/react";
import loadsh from "lodash";

import DepenceList from "@/components/DepenceList";
import IconWrap from "@/components/IconWrap";

import { TDependenceItem, usePackageSearchQuery, usePackageVersionsQuery } from "../service";

type TPackage =
  | {
      name: string;
      version: string;
    }
  | undefined;

const AddDepenceModal = forwardRef((_, ref) => {
  const { t } = useTranslation();
  const [checkList, setCheckList] = useState<TDependenceItem[]>([]);
  const [name, setName] = useState("");
  const [clickItem, setClickItem] = useState("");
  const [list, setList] = useState<TDependenceItem[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [isShowChecked, setIsShowChecked] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const initialRef = React.useRef(null);
  const packageSearchQuery = usePackageSearchQuery(name, setList, checkList);
  usePackageVersionsQuery(clickItem, (versions: string[]) => {
    const newList: TDependenceItem[] = list.map((item: TDependenceItem) => {
      if (item.package.name === clickItem) {
        item.versions = versions;
        syncDataToCheckList(clickItem, item);
      }
      return item;
    });
    setList(newList);
  });

  useImperativeHandle(ref, () => ({
    edit: (item: TPackage) => {
      // setItem(item);
      setIsEdit(true);
      onOpen();
    },
  }));

  const search = useCallback(
    loadsh.debounce((val: string) => {
      setIsShowChecked(false);
      setName(val);
    }, 1000),
    [],
  );

  const initModal = () => {
    setCheckList([]);
    setIsShowChecked(false);
    setName("");
    setList([]);
  };

  const syncDataToCheckList = (targetName: string, item: TDependenceItem) => {
    const newCheckList = checkList.map((oldItem: TDependenceItem) => {
      if (oldItem.package.name === targetName) {
        return item;
      }
      return oldItem;
    });
    setCheckList(newCheckList);
  };

  const submitDependece = () => {
    const data: TPackage[] = [];
    checkList.map((item: TDependenceItem) => {
      data.push({
        name: item.package.name,
        version: item.package.version,
      });
    });
    console.log(data);
    // addPackageMutation.mutate(data);
  };

  const setVersion = (version: string, key: string) => {
    const data: TDependenceItem[] = list.map((item: TDependenceItem) => {
      if (item.package.name === key) {
        item.package.version = version;
        syncDataToCheckList(key, item);
      }
      return item;
    });
    setList(data);
  };

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

  // const addPackageMutation = useAddPackageMutation(() => {
  //   onClose();
  // });

  const renderList = (list: TDependenceItem[]) => {
    return (
      <DepenceList>
        {(list || []).map((packageItem: TDependenceItem) => {
          return (
            <DepenceList.Item
              isActive={false}
              key={packageItem.package.name}
              className="group"
              onClick={() => {}}
            >
              <Checkbox
                size="lg"
                onChange={() => {
                  setCheck(packageItem);
                }}
                isChecked={checkList.some(
                  (item: TDependenceItem) => item.package.name === packageItem.package.name,
                )}
              >
                <Box ml={5} width="400px">
                  <b>{packageItem.package.name}</b>
                  <p>
                    {packageItem.package.description &&
                    packageItem.package.description?.length > 100
                      ? packageItem.package.description?.slice(0, 100)
                      : packageItem.package.description}
                  </p>
                </Box>
              </Checkbox>
              <Select
                width="150px"
                size="sm"
                placeholder={packageItem.package.version}
                onChange={(e) => {
                  setVersion(e.target.value, packageItem.package.name);
                }}
                onClick={() => {
                  if (packageItem.versions.length === 0) setClickItem(packageItem.package.name);
                }}
              >
                {packageItem.versions.map((subItem: string) => {
                  return (
                    <option key={subItem} value={subItem}>
                      {subItem}
                    </option>
                  );
                })}
              </Select>
            </DepenceList.Item>
          );
        })}
      </DepenceList>
    );
  };

  return (
    <>
      <IconWrap
        tooltip="添加依赖"
        onClick={() => {
          initModal();
          setIsEdit(false);
          onOpen();
        }}
      >
        <AddIcon fontSize={10} />
      </IconWrap>

      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("DependenceTitle")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Flex mb={6} minWidth="max-content" alignItems="center" gap="2">
              <InputGroup>
                <InputLeftElement pointerEvents="none" children={<SearchIcon color="gray.300" />} />
                <Input
                  disabled={isEdit}
                  onChange={(e: any) => {
                    search(e.target.value);
                  }}
                  ref={initialRef}
                  placeholder={String(t("DependenceName"))}
                />
              </InputGroup>
              <Spacer />
            </Flex>
            {packageSearchQuery.isLoading ? (
              <Center>
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="blue.500"
                  size="md"
                />
              </Center>
            ) : isShowChecked ? (
              renderList(checkList)
            ) : (
              renderList(list)
            )}
          </ModalBody>
          <ModalFooter>
            <Tag
              mr={3}
              size="lg"
              variant="solid"
              colorScheme="blue"
              className="hover:cursor-pointer"
              onClick={() => {
                setIsShowChecked((pre) => !pre);
              }}
            >
              {isShowChecked ? <SmallCloseIcon /> : checkList.length}
            </Tag>
            <Button
              mr={3}
              onClick={() => {
                onClose();
                initModal();
              }}
            >
              {t("Common.Dialog.Cancel")}
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => {
                submitDependece();
              }}
            >
              {t("Common.Dialog.Confirm")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
});

AddDepenceModal.displayName = "AddDepenceModal";

export default AddDepenceModal;
