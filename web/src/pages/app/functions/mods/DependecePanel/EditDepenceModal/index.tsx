import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useDisclosure,
} from "@chakra-ui/react";

import DepenceList from "@/components/DepenceList";
import IconWrap from "@/components/IconWrap";

import { TPackage, useAddPackageMutation, usePackageVersionsQuery } from "../service";
type TPackagOption = {
  name: string;
  spec: string;
  versions: (string | undefined)[];
};

const EditDepenceModal = (props: { packageList: TPackage[] }) => {
  const { t } = useTranslation();
  const [clickItem, setClickItem] = useState("");
  const [list, setList] = useState<TPackagOption[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  usePackageVersionsQuery(clickItem, (versions: string[]) => {
    const newList: TPackagOption[] = list.map((item: TPackagOption) => {
      if (item.name === clickItem) {
        item.versions = versions;
      }
      return item;
    });
    setList(newList);
  });

  useEffect(() => {
    const newList = (props.packageList || []).map((item) => {
      return {
        name: item.name,
        spec: item.spec,
        versions: [],
      };
    });
    setList(newList);
  }, [props.packageList, isOpen]);

  const submitDependece = () => {
    const data: TPackage[] = list.map((item: TPackagOption) => {
      return {
        name: item.name,
        spec: item.spec,
      };
    });
    addPackageMutation.mutate(data);
  };

  const setVersion = (version: string, key: string) => {
    const data: TPackagOption[] = list.map((item: TPackagOption) => {
      if (item.name === key) {
        item.spec = version;
      }
      return item;
    });
    setList(data);
  };

  const addPackageMutation = useAddPackageMutation(() => {
    onClose();
  });

  return (
    <>
      <IconWrap
        tooltip={t("DependenceEdit").toString()}
        onClick={() => {
          onOpen();
        }}
      >
        <EditIcon fontSize={10} />
      </IconWrap>

      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("DependenceEdit")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <DepenceList>
              {(list || []).map((packageItem: TPackagOption) => {
                return (
                  <DepenceList.Item
                    isActive={false}
                    key={packageItem.name}
                    className="group"
                    onClick={() => {
                      if (packageItem.versions.length === 0) setClickItem(packageItem.name);
                    }}
                  >
                    <Box ml={5} width="400px">
                      <b>{packageItem.name}</b>
                    </Box>
                    <Select
                      width="150px"
                      size="sm"
                      placeholder={packageItem.spec}
                      onChange={(e) => {
                        setVersion(e.target.value, packageItem.name);
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
                  </DepenceList.Item>
                );
              })}
            </DepenceList>
          </ModalBody>
          <ModalFooter>
            <Button
              mr={3}
              onClick={() => {
                onClose();
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
};

EditDepenceModal.displayName = "EditDepenceModal";

export default EditDepenceModal;
