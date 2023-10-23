import { useTranslation } from "react-i18next";
import { Button } from "@chakra-ui/react";

export default function Banner(props: { className?: string }) {
  const { className = "flex" } = props;
  const { t } = useTranslation();
  return (
    <div>
      <div className={className}>
        <div
          className="flex h-12 w-screen items-center justify-center text-[#13091C]  lg:px-32"
          style={{ background: "linear-gradient(90deg, #E6F2F4 0%, #CAE8EE 101.17%)" }}
        >
          <span
            className="z-40 whitespace-nowrap text-[6px] font-semibold lg:text-[15px]"
            rel="noreferrer"
          >
            🎉 {t("banner")}
          </span>
          <Button
            className="ml-6 !rounded-lg !bg-[#F2F5FF] !pl-3.5 !pr-0 !text-[#13091C]"
            onClick={() => {
              window.open("https://fael3z0zfze.feishu.cn/docx/N6C0dl2szoxeX8xtIcAcKSXRn8e");
            }}
          >
            {t("Details")}
            <img
              className="relative ml-1 mt-2 w-6 rotate-[5deg]"
              src="/banner/i_bright.svg"
              alt="arrow"
            />
          </Button>
        </div>
        <div>
          <img
            className="absolute -top-[2px] z-30 hover:cursor-pointer lg:left-[188px] "
            src="/banner/Star 1.png"
            alt="star1"
          />
          <img
            className="absolute top-[24px] z-30 hover:cursor-pointer lg:left-[232px] "
            src="/banner/Group 20649.png"
            alt="star2"
          />
          <img
            className="absolute top-[5px] z-30 hover:cursor-pointer lg:left-[338px] "
            src="/banner/Ellipse 160.png"
            alt="star3"
          />
          <img
            className="absolute top-[14px] z-30 hover:cursor-pointer lg:right-[301px] "
            src="/banner/Star 4.png"
            alt="star4"
          />
          <img
            className="absolute top-[33px] z-30 hover:cursor-pointer lg:right-[236px] "
            src="/banner/Ellipse 161.png"
            alt="star5"
          />
          <img
            className="absolute -top-[1px] z-30 hover:cursor-pointer lg:right-[136px] "
            src="/banner/Ellipse 158.png"
            alt="star6"
          />
        </div>
      </div>
    </div>
  );
}
