/****************************
 * cloud functions list sidebar
 ***************************/
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { t } from "i18next";

import ConfirmButton from "@/components/ConfirmButton";
import EmptyBox from "@/components/EmptyBox";
import FileTypeIcon from "@/components/FileTypeIcon";
import IconText from "@/components/IconText";
import IconWrap from "@/components/IconWrap";
import MoreButton from "@/components/MoreButton";
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";

import AddPolicyModal from "../mods/AddPolicyModal";
import { useDeletePolicyMutation, usePolicyListQuery } from "../service";
import useDBMStore from "../store";
export default function PolicyListPanel() {
  const deletePolicyMutation = useDeletePolicyMutation();
  const store = useDBMStore((state) => state);
  const policyQuery = usePolicyListQuery((data) => {
    if (data.data.length === 0) {
      store.setCurrentPolicy(undefined);
    } else if (store.currentPolicy === undefined) {
      store.setCurrentPolicy(data?.data[0]);
    }
  });
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
        {policyQuery?.data?.data?.length ? (
          <SectionList>
            {policyQuery?.data?.data.map((item: any) => {
              return (
                <SectionList.Item
                  isActive={store.currentShow === "Policy" && item?.id === store.currentPolicy?.id}
                  key={item?.id}
                  onClick={() => {
                    store.setCurrentPolicy(item);
                  }}
                >
                  <div className="group flex w-full justify-between">
                    <div className="font-semibold leading-loose">
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
                          <IconText icon={<DeleteIcon />} text={t("Delete")} />
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
