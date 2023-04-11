import React from "react";
import { useTranslation } from "react-i18next";

type Props = {};

const Ability = (props: Props) => {
  const { t } = useTranslation();
  return (
    <div className="h-auto">
      <h2 className="py-[80px] pb-[48px] text-4xl text-[#152132] lg:py-[60px] lg:pb-[60px]">
        {t(`HomePage.Ability.title`)}
      </h2>
      <div className="w-full px-[16px] lg:hidden">
        <div className="bg-card h-max-[520px] my-6 w-full rounded-2xl lg:hidden">
          <div className="justify-between">
            <div className="p-6">
              <img className="mb-8" src="/homepage/functions.svg" alt="icon" />
              <h3>
                <span className="bg-gradient-to-r from-[#00C24E] to-[#00A1FC] bg-clip-text text-transparent">
                  {t(`HomePage.Ability.function`)}
                </span>
                {t(`HomePage.Ability.functionSub`)}
              </h3>
            </div>
            <img
              className="w-max-5/6 mx-auto pl-8 lg:hidden "
              src="/homepage/function.png"
              alt="function"
            />
          </div>
        </div>
        <div className="bg-card my-6 w-full rounded-2xl lg:hidden">
          <div className="justify-between">
            <div className="p-6">
              <img className="mb-8" src="/homepage/database.svg" alt="icon" />
              <h3 className="leading-normal">
                <span className="bg-gradient-to-r from-[#00CCE8] to-[#00E8A2] bg-clip-text text-transparent">
                  {t(`HomePage.Ability.database`)}
                </span>
                {t(`HomePage.Ability.databaseSub`)}
              </h3>
            </div>
            <img className="mx-auto pl-8 lg:hidden " src="/homepage/database.png" alt="database" />
          </div>
        </div>

        <div className="bg-card my-6 w-full rounded-2xl lg:hidden">
          <div className="justify-between">
            <div className="p-6">
              <img className="mb-6" src="/homepage/storage.svg" alt="icon" />
              <h3>
                <span className="bg-gradient-to-r from-[#57E37A] to-[#00BEB1] bg-clip-text text-transparent">
                  {t(`HomePage.Ability.storage`)}
                </span>
                {t(`HomePage.Ability.storageSub`)}
              </h3>
            </div>
            <img className="mx-auto pl-8 lg:hidden " src="/homepage/storage.png" alt="storage" />
          </div>
        </div>
      </div>
      <div className="bg-card my-6 hidden w-full rounded-2xl lg:block">
        <div className="justify-between lg:flex lg:flex-row">
          <div className="p-6 lg:p-12">
            <img className="mb-6" src="/homepage/functions.svg" alt="icon" />
            <h3 className="w-[300px]">
              <span className="bg-gradient-to-r from-[#00C24E] to-[#00A1FC] bg-clip-text text-transparent">
                {t(`HomePage.Ability.function`)}
              </span>
              {t(`HomePage.Ability.functionSub`)}
            </h3>
          </div>
          <div className="overflow-hidden rounded-br-2xl">
            <img className="w-full lg:mt-8" src="/homepage/function.png" alt="function" />
          </div>
          <div></div>
        </div>
      </div>
      <div className="hidden w-full gap-6 lg:flex ">
        <div className="bg-card relative h-auto w-1/2 rounded-2xl px-12 pt-12">
          <img className="mb-6" src="/homepage/database.svg" alt="icon" />
          <h3 className="w-[400px]">
            <span className="bg-gradient-to-r from-[#00CCE8] to-[#00E8A2] bg-clip-text text-transparent">
              {t(`HomePage.Ability.database`)}
            </span>
            {t(`HomePage.Ability.databaseSub`)}
          </h3>
          <div className="absolute bottom-0 flex h-1/2 items-end">
            <img className="mx-auto" src="/homepage/database.png" alt="database" />
          </div>
        </div>
        <div className="bg-card relative h-[600px] w-1/2 rounded-2xl px-12 pt-12">
          <img className="mb-6" src="/homepage/storage.svg" alt="icon" />
          <h3 className="w-[400px]">
            <span className="bg-gradient-to-r from-[#57E37A] to-[#00BEB1] bg-clip-text text-transparent">
              {t(`HomePage.Ability.storage`)}
            </span>
            {t(`HomePage.Ability.storageSub`)}
          </h3>
          <div className="absolute bottom-0 flex h-1/2 items-end">
            <img className="mx-auto" src="/homepage/storage.png" alt="storage" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ability;
