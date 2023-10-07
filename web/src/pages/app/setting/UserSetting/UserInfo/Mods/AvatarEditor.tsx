import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactCrop, { Crop } from "react-image-crop";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Button, VStack } from "@chakra-ui/react";

import { useUpdateUserAvatar } from "../service";

import "react-image-crop/dist/ReactCrop.css";

import useGlobalStore from "@/pages/globalStore";

function getCroppedImg(image: HTMLImageElement, crop: Crop): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width as number;
  canvas.height = crop.height as number;
  const ctx = canvas.getContext("2d");

  ctx?.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width as number,
    crop.height as number,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      resolve(blob);
    }, "image/jpeg");
  });
}

export default function AvatarEditor(props: { img: string | null; handleBack: any }) {
  const { img, handleBack } = props;
  const { t } = useTranslation();
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "px",
    x: 0,
    y: 0,
    width: 200,
    height: 200,
  });
  const { showSuccess, updateUserInfo } = useGlobalStore();

  const updateAvatar = useUpdateUserAvatar();

  const handleSave = useCallback(async () => {
    if (imgRef.current && crop) {
      const imgData = await getCroppedImg(imgRef.current, crop);
      const formData = new FormData();
      formData.append("avatar", imgData);
      const res = await updateAvatar.mutateAsync(formData);
      if (!res.error) {
        updateUserInfo();
        showSuccess(t("UserInfo.EditAvatarSuccess"));
        handleBack();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crop]);

  return (
    <>
      <span
        onClick={() => handleBack()}
        className="absolute left-[280px] flex cursor-pointer items-center"
      >
        <ChevronLeftIcon boxSize={6} /> {t("Back")}
      </span>
      <VStack className="mt-6">
        {!!img && (
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            aspect={1 / 1}
            circularCrop={true}
            keepSelection={true}
          >
            <img
              ref={imgRef}
              alt="Crop"
              src={img}
              width={"200px"}
              height={"200px"}
              style={{ objectFit: "contain" }}
            />
          </ReactCrop>
        )}
        <Button onClick={handleSave}>{t("Save")}</Button>
      </VStack>
    </>
  );
}
