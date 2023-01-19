/****************************
 * cloud functions list sidebar
 ***************************/
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { t } from "i18next";

import ConfirmButton from "@/components/ConfirmButton";
import FileTypeIcon from "@/components/FileTypeIcon";
import IconWrap from "@/components/IconWrap";
import MoreButton from "@/components/MoreButton";
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";

import AddPolicyModal from "../mods/AddPolicyModal";
import { useDeletePolicyMutation, usePolicyListQuery } from "../service";
import useDBMStore from "../store";
export default function PolicyListPanel() {
  const policyQuery = usePolicyListQuery((data) => {
    if (data.data.length === 0) {
      store.setCurrentPolicy(undefined);
    } else if (store.currentPolicy === undefined) {
      store.setCurrentPolicy(data?.data[0]);
    }
  });

  const deletePolicyMutation = useDeletePolicyMutation();
  const store = useDBMStore((state) => state);
  return (
    <Panel
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
      <SectionList style={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden" }}>
        {policyQuery?.data?.data.map((item: any) => {
          return (
            <SectionList.Item
              isActive={store.currentShow === "Policy" && item?.id === store.currentPolicy?.id}
              key={item?.id}
              onClick={() => {
                store.setCurrentPolicy(item);
              }}
            >
              <div className="w-full flex justify-between group">
                <div className="leading-loose">
                  <FileTypeIcon type="policy" />
                  <span className="ml-2 text-base">{item.name}</span>
                </div>
                <MoreButton
                  isHidden={
                    item.name !== store.currentPolicy?.name || store.currentShow !== "Policy"
                  }
                >
                  <>
                    <AddPolicyModal key="AddPolicyModal" isEdit defaultData={item}>
                      <div className="text-grayIron-600">
                        <div className="text-grayModern-900 w-[20px] h-[20px] text-center">
                          <EditIcon />
                        </div>
                        {t("Edit")}
                      </div>
                    </AddPolicyModal>
                    <ConfirmButton
                      onSuccessAction={async () => {
                        await deletePolicyMutation.mutateAsync(item.name);
                      }}
                      headerText={String(t("Delete"))}
                      bodyText={t("CollectionPanel.ConformDelete")}
                    >
                      <div className="text-grayIron-600">
                        <div className="text-grayModern-900 w-[20px] h-[20px] text-center">
                          <DeleteIcon />
                        </div>
                        {t("Delete")}
                      </div>
                    </ConfirmButton>
                  </>
                </MoreButton>
              </div>
            </SectionList.Item>
          );
        })}
      </SectionList>
    </Panel>
  );
}
