import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

import AllTemplateList from "./AllTemplateList";
import FuncTemplateItem from "./FuncTemplateItem";
import MyTemplateList from "./MyTemplateList";

import useTemplateStore from "./store";

export default function FunctionTemplate(props: { isModal: boolean }) {
  const { t } = useTranslation();
  const { isModal } = props;
  const sideBar_data = [
    { text: t("Template.CommunityTemplate"), value: "all" },
    { text: t("Template.My"), value: "my" },
  ];
  const { showTemplateItem, setShowTemplateItem, currentTab, setCurrentTab } = useTemplateStore();

  const handleUrlChange = () => {
    const param = window.location.href.split("/").pop();
    if (param!.length > 20 && !isModal) {
      setShowTemplateItem(true);
    } else if (param!.length < 20 && !isModal) {
      setShowTemplateItem(false);
    }
  };

  useEffect(() => {
    handleUrlChange();
    window.addEventListener("popstate", handleUrlChange);
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={clsx("mt-6 flex", isModal ? "" : "px-14")}>
      {!showTemplateItem ? (
        <>
          <div className="flex flex-col">
            <div className="mb-5 text-[24px] font-medium">{t("HomePage.NavBar.funcTemplate")}</div>
            {sideBar_data.map((item) => {
              return (
                <div
                  key={item.value}
                  className={clsx(
                    "mb-2 flex h-8 w-44 cursor-pointer items-center rounded px-3",
                    currentTab === item.value && "bg-primary-100 text-primary-600",
                  )}
                  onClick={() => {
                    setCurrentTab(item.value);
                  }}
                >
                  {item.text}
                </div>
              );
            })}
          </div>
          <div className="ml-9 w-full">
            {currentTab === "all" ? <AllTemplateList /> : <MyTemplateList />}
          </div>
        </>
      ) : (
        <FuncTemplateItem isModal={isModal} />
      )}
    </div>
  );
}
