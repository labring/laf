import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Button, VStack } from "@chakra-ui/react";

import "react-image-crop/dist/ReactCrop.css";

function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<string> {
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
      window.URL.revokeObjectURL(URL.createObjectURL(blob));
      const fileUrl = window.URL.createObjectURL(blob);
      resolve(fileUrl);
    }, "image/jpeg");
  });
}

export default function AvatarEditor(props: {
  img: string | null;
  setCroppedImageUrl: any;
  setShowItem: any;
}) {
  const { img, setCroppedImageUrl, setShowItem } = props;
  const { t } = useTranslation();
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const handleSave = useCallback(async () => {
    if (imgRef.current && completedCrop) {
      const croppedImageUrl = await getCroppedImg(imgRef.current, completedCrop);
      setCroppedImageUrl(croppedImageUrl);
    }
    setShowItem("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedCrop]);

  return (
    <>
      <span
        onClick={() => setShowItem("")}
        className="absolute left-[280px] flex cursor-pointer items-center"
      >
        <ChevronLeftIcon boxSize={6} /> {t("Back")}
      </span>
      <VStack>
        {!!img && (
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
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
