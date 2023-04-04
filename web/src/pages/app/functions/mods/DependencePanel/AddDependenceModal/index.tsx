import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AddIcon, EditIcon, SearchIcon, SmallCloseIcon } from "@chakra-ui/icons";
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
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { debounce } from "lodash";

import DependenceList from "@/components/DependenceList";
import IconWrap from "@/components/IconWrap";

import {
  TDependenceItem,
  TPackage,
  useAddPackageMutation,
  useEditPackageMutation,
  usePackageQuery,
  usePackageSearchQuery,
  usePackageVersionsQuery,
} from "../service";

import useGlobalStore from "@/pages/globalStore";

const AddDependenceModal = () => {
  const { t } = useTranslation();
  const globalStore = useGlobalStore((state) => state);
  const [checkList, setCheckList] = useState<TDependenceItem[]>([]);
  const [name, setName] = useState("");
  const [clickItem, setClickItem] = useState({ package: "", loading: false });
  const [list, setList] = useState<TDependenceItem[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [isShowChecked, setIsShowChecked] = useState(false);
  const [packageList, setPackageList] = useState<TDependenceItem[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  usePackageQuery((data) => {
    const newList = (data || [])
      .filter((item: any) => !item.builtin)
      .map((item: any) => {
        return {
          package: {
            name: item.name,
            version: item.spec,
          },
          versions: [],
        };
      });
    setPackageList(newList);
  });

  const addPackageMutation = useAddPackageMutation(() => {
    onClose();
    globalStore.updateCurrentApp(globalStore.currentApp!);
  });

  const editPackageMutation = useEditPackageMutation(() => {
    onClose();
    globalStore.updateCurrentApp(globalStore.currentApp!);
  });

  const packageSearchQuery = usePackageSearchQuery(name, (data) => {
    const list: TDependenceItem[] = (data || []).map((item: any) => {
      const existItem = checkList.find((checkItem: TDependenceItem) => {
        return checkItem.package.name === item.package.name;
      });
      return existItem ? existItem : { ...item, versions: [] };
    });
    setList(list);
  });

  usePackageVersionsQuery(clickItem.package, (versions: string[]) => {
    const newList: TDependenceItem[] = (isEdit ? packageList : list).map(
      (item: TDependenceItem) => {
        if (item.package.name === clickItem.package) {
          item.versions = versions;
          if (!isEdit) {
            syncDataToCheckList(clickItem.package, item);
          }
          setClickItem({ ...clickItem, loading: false });
        }
        return item;
      },
    );
    isEdit ? setPackageList(newList) : setList(newList);
  });

  const search = useMemo(
    () =>
      debounce((val: string) => {
        setIsShowChecked(false);
        setName(val);
      }, 1000),
    [setIsShowChecked, setName],
  );

  const initModal = () => {
    setCheckList([]);
    setIsShowChecked(false);
    setName("");
    setList([]);
    onOpen();
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

  const submitDependence = () => {
    const data: TPackage[] = [];
    let submitList = isEdit ? packageList : checkList;
    submitList.forEach((item: TDependenceItem) => {
      data.push({
        name: item.package.name,
        spec: item.package.version,
      });
    });
    isEdit ? editPackageMutation.mutate(data) : addPackageMutation.mutate(data);
  };

  const setVersion = (version: string, key: string) => {
    const data: TDependenceItem[] = (isEdit ? packageList : list).map((item: TDependenceItem) => {
      if (item.package.name === key) {
        item.package.version = version;
        if (!isEdit) {
          syncDataToCheckList(key, item);
        }
      }
      return item;
    });
    isEdit ? setPackageList(data) : setList(data);
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
              {isEdit ? (
                <Text fontSize="lg">{packageItem.package.name}</Text>
              ) : (
                <Checkbox
                  colorScheme="primary"
                  size="lg"
                  isDisabled={packageList.some(
                    (item) => item.package.name === packageItem.package.name,
                  )}
                  onChange={() => {
                    setCheck(packageItem);
                  }}
                  isChecked={
                    checkList.some(
                      (item: TDependenceItem) => item.package.name === packageItem.package.name,
                    ) || packageList.some((item) => item.package.name === packageItem.package.name)
                  }
                >
                  <Box ml={5} width="350px">
                    <b>{packageItem.package.name}</b>
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap text-base text-second ">
                      {packageItem.package.description}
                    </p>
                  </Box>
                </Checkbox>
              )}
              <div className="flex items-center space-x-2">
                {clickItem.package === packageItem.package.name && clickItem.loading ? (
                  <Spinner size="xs" color="primary.500" />
                ) : null}
                <Select
                  width="150px"
                  size="sm"
                  variant="filled"
                  placeholder={packageItem.package.version}
                  isDisabled={
                    !isEdit &&
                    packageList.some((item) => item.package.name === packageItem.package.name)
                  }
                  onChange={(e) => {
                    setVersion(e.target.value, packageItem.package.name);
                  }}
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
      {packageList?.length > 0 ? (
        <IconWrap
          tooltip={t("FunctionPanel.DependenceEdit").toString()}
          onClick={() => {
            setIsEdit(true);
            initModal();
          }}
        >
          <EditIcon fontSize={12} />
        </IconWrap>
      ) : null}
      <IconWrap
        tooltip={t("FunctionPanel.DependenceAdd").toString()}
        onClick={() => {
          setIsEdit(false);
          initModal();
        }}
      >
        <AddIcon fontSize={12} />
      </IconWrap>

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEdit ? t("FunctionPanel.DependenceEdit") : t("FunctionPanel.DependenceAdd")}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} minH="260px">
            {isEdit ? (
              renderList(packageList)
            ) : (
              <div>
                <InputGroup mb={3}>
                  <InputLeftElement
                    pointerEvents="none"
                    children={<SearchIcon color="gray.300" />}
                  />
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
            )}
          </ModalBody>

          <ModalFooter>
            {checkList.length > 0 && (
              <span
                className="mr-2 text-lg hover:cursor-pointer "
                onClick={() => {
                  if (!isEdit) {
                    setIsShowChecked((pre) => !pre);
                  }
                }}
              >
                {t("FunctionPanel.Select")}:
                <span className="mx-2 text-blue-500 ">
                  {isEdit ? (
                    packageList.length
                  ) : isShowChecked ? (
                    <SmallCloseIcon fontSize={16} className="align-middle" />
                  ) : (
                    checkList.length
                  )}
                </span>
              </span>
            )}

            <Button
              isLoading={editPackageMutation.isLoading || addPackageMutation.isLoading}
              onClick={() => {
                submitDependence();
              }}
            >
              {t("SaveAndRestart")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

AddDependenceModal.displayName = "AddDependenceModal";

export default AddDependenceModal;
