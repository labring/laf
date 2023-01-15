/****************************
 * cloud functions list sidebar
 ***************************/
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { t } from "i18next";

import ConfirmButton from "@/components/ConfirmButton";
import FileTypeIcon from "@/components/FileTypeIcon";
import IconWrap from "@/components/IconWrap";
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";

import AddPolicyModal from "../mods/AddPolicyModal";
import { useDeletePolicyMutation, usePolicyListQuery } from "../service";
import useDBMStore from "../store";
export default function PolicyListPanel() {
  const policyQuery = usePolicyListQuery((data) => {
    if (data.data.length > 0) {
      store.setCurrentPolicy(data.data[0]);
    } else {
      store.setCurrentPolicy(undefined);
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
        title="访问策略"
        actions={[
          <AddPolicyModal key="AddPolicyModal">
            <IconWrap tooltip="添加访问策略" size={20}>
              <AddIcon fontSize={10} />
            </IconWrap>
          </AddPolicyModal>,
        ]}
      />
      <SectionList style={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden" }}>
        {policyQuery?.data?.data.map((item: any) => {
          return (
            <SectionList.Item
              isActive={store.currentShow === "Policy" && item?.id === store.currentPolicy.id}
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
                <div className="invisible flex items-center group-hover:visible">
                  <AddPolicyModal key="AddPolicyModal" isEdit defaultData={item}>
                    <IconWrap tooltip="编辑访问策略" size={20}>
                      <EditIcon fontSize={10} />
                    </IconWrap>
                  </AddPolicyModal>
                  <ConfirmButton
                    onSuccessAction={async () => {
                      await deletePolicyMutation.mutateAsync(item.name);
                    }}
                    headerText={String(t("Delete"))}
                    bodyText="确定删除该策略?"
                  >
                    <IconWrap tooltip={String(t("Delete"))}>
                      <DeleteIcon
                        className="ml-2"
                        fontSize={14}
                        color="gray.500"
                        _hover={{ color: "black" }}
                      />
                    </IconWrap>
                  </ConfirmButton>
                </div>
              </div>
            </SectionList.Item>
          );
        })}
      </SectionList>
    </Panel>
  );
}
