import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

import styles from "./index.module.scss";

// drag drop file component
function FileUpload(props: { onUpload: (files: any) => void; uploadType: "file" | "folder" }) {
  const { onUpload = () => {}, uploadType } = props;
  // drag state
  const [dragActive, setDragActive] = React.useState(false);
  // ref
  const inputRef = React.useRef<any>(null);
  const { t } = useTranslation();
  useEffect(() => {
    if (uploadType === "folder") {
      inputRef.current.setAttribute("webkitdirectory", "");
      inputRef.current.setAttribute("directory", "");
    } else {
      inputRef.current.removeAttribute("webkitdirectory");
      inputRef.current.removeAttribute("directory");
    }
  }, [uploadType]);

  // handle drag events
  const handleDrag = function (e: any) {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // triggers when file is dropped
  const handleDrop = function (e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files);
    }
  };

  // triggers when file is selected with click
  const handleChange = function (e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files);
    }
  };

  // triggers the input when the button is clicked
  const onButtonClick = () => {
    inputRef?.current?.click();
  };

  return (
    <form
      className={styles.formFileUpload}
      onDragEnter={handleDrag}
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        ref={inputRef}
        type="file"
        className={styles.inputFileUpload}
        multiple={true}
        onChange={handleChange}
      />
      <label
        className={clsx({
          [styles.labelFileUpload]: true,
          [styles.dragActive]: dragActive,
        })}
        htmlFor="input-file-upload"
      >
        <div>
          <p>
            {uploadType === "file" ? t("StoragePanel.File") : t("StoragePanel.Folder")}
            {t("StoragePanel.Drag")}
          </p>
          <button className={styles.uploadButton} onClick={onButtonClick}>
            {t("StoragePanel.Upload") +
              (uploadType === "file" ? t("StoragePanel.File") : t("StoragePanel.Folder"))}
          </button>
        </div>
      </label>
      {dragActive && (
        <div
          className={styles.dragFileElement}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        ></div>
      )}
    </form>
  );
}

export default FileUpload;
