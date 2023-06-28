import { useTranslation } from "react-i18next";

export default function Video() {
  const { t } = useTranslation();
  return (
    <>
      <video autoPlay controls>
        <source src={String(t("HomePage.VideoLink"))} type="video/mp4" />
      </video>
    </>
  );
}
