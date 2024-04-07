/****************************
 * cloud functions list sidebar
 ***************************/
import { useTranslation } from "react-i18next";
import { AddIcon } from "@chakra-ui/icons";
import { useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import { RecycleDeleteIcon } from "@/components/CommonIcon";
import ConfirmButton from "@/components/ConfirmButton";
import EmptyBox from "@/components/EmptyBox";
import FileTypeIcon from "@/components/FileTypeIcon";
import IconText from "@/components/IconText";
import IconWrap from "@/components/IconWrap";
import MoreButton from "@/components/MoreButton";
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";

import AddPolicyModal from "../mods/AddPolicyModal";
import { useDeletePolicyMutation } from "../service";
import useDBMStore from "../store";
export default function PolicyListPanel(props: { policyList: any }) {
  const { policyList } = props;
  const { t } = useTranslation();
  const deletePolicyMutation = useDeletePolicyMutation();
  const store = useDBMStore((state) => state);
  const darkMode = useColorMode().colorMode === "dark";

  return (
    <Panel
      className="min-w-[200px]"
      onClick={() => {
        store.setCurrentShow("Policy");
      }}
    >
      <Panel.Header
        title={t("CollectionPanel.Policy").toString()}
        actions={[
          <AddPolicyModal key="AddPolicyModal">
            <IconWrap tooltip={t("CollectionPanel.AddPolicy").toString()} size={20}>
              <AddIcon fontSize={10} />
            </IconWrap>
          </AddPolicyModal>,
        ]}
      />
      <div style={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden" }}>
        {policyList?.data?.length ? (
          <SectionList>
            {policyList?.data.map((item: any) => {
              return (
                <SectionList.Item
                  isActive={
                    store.currentShow === "Policy" && item?._id === store.currentPolicy?._id
                  }
                  className={clsx(
                    "group h-7 hover:!text-primary-700",
                    darkMode ? "text-grayIron-200" : " text-grayIron-700",
                    store.currentShow === "Policy" &&
                      item?._id === store.currentPolicy?._id &&
                      "!text-primary-700",
                  )}
                  key={item?._id}
                  onClick={() => {
                    store.setCurrentPolicy(item);
                  }}
                >
                  <div className="group flex w-full items-center justify-between">
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap font-medium leading-loose">
                      <FileTypeIcon type="policy" />
                      <span className="ml-2 text-base">{item.name}</span>
                    </div>
                    <MoreButton
                      label={t("Operation")}
                      maxWidth="50px"
                      isHidden={
                        item.name !== store.currentPolicy?.name || store.currentShow !== "Policy"
                      }
                    >
                      <>
                        <ConfirmButton
                          onSuccessAction={async () => {
                            await deletePolicyMutation.mutateAsync(item.name);
                          }}
                          headerText={String(t("Delete"))}
                          bodyText={t("CollectionPanel.ConformDelete")}
                        >
                          <IconText
                            icon={<RecycleDeleteIcon fontSize={16} />}
                            text={t("Delete")}
                            className="hover:!text-error-600"
                          />
                        </ConfirmButton>
                      </>
                    </MoreButton>
                  </div>
                </SectionList.Item>
              );
            })}
          </SectionList>
        ) : (
          <EmptyBox hideIcon>
            <p>{t("CollectionPanel.EmptyPolicyTip")}</p>
          </EmptyBox>
        )}
      </div>
    </Panel>
  );
}
