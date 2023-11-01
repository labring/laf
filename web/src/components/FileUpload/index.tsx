import React from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

import styles from "./index.module.scss";

type UploadType = "file" | "folder";

type TFileItem = {
  file: File;
  webkitRelativePath: string;
};

// drag drop file component
function FileUpload(props: { onUpload: (files: any) => void; darkMode: boolean }) {
  const { onUpload = () => {}, darkMode } = props;
  const [dragActive, setDragActive] = React.useState(false);
  const inputRef = React.useRef<any>(null);
  const { t } = useTranslation();

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

  const handleDrop = function (e: any) {
    e.preventDefault();
    setDragActive(false);
    const dataTransferItemList = e.dataTransfer.items;
    const fileArray: TFileItem[] = [];
    const promises = [];
    for (const dataTransferItem of dataTransferItemList) {
      const file = dataTransferItem.webkitGetAsEntry();
      promises.push(handleFile(file, fileArray));
    }
    Promise.all(promises)
      .then(() => {
        onUpload(fileArray);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleFile = function (file: any, fileArray: TFileItem[], webkitRelativePath = "") {
    return new Promise((resolve, reject) => {
      if (file.isFile) {
        file.file(function (f: File) {
          const newFile = new Blob([f], { type: f.type });
          const customFile = {
            file: new File([newFile], f.name, { type: f.type, lastModified: f.lastModified }),
            webkitRelativePath: webkitRelativePath || f.webkitRelativePath,
          };
          fileArray.push(customFile);
          resolve(null);
        });
      } else {
        const dirReader = file.createReader();
        readAllEntries(dirReader, []).then((entries: any) => {
          const promises = [];
          for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const newPath = webkitRelativePath ? `${webkitRelativePath}/${entry.name}` : entry.name;
            promises.push(handleFile(entry, fileArray, newPath));
          }
          Promise.all(promises).then(resolve).catch(reject);
        });
      }
    });
  };

  function readAllEntries(dirReader: any, entries: any) {
    return new Promise((resolve, reject) => {
      dirReader.readEntries(function (newEntries: any) {
        if (newEntries.length === 0) {
          resolve(entries);
        } else {
          entries = entries.concat(newEntries);
          readAllEntries(dirReader, entries).then(resolve).catch(reject);
        }
      });
    });
  }

  // triggers when file is selected with click
  const handleChange = function (e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files);
    }
  };

  // triggers the input when the button is clicked
  const onButtonClick = (uploadType: UploadType) => {
    if (uploadType === "folder") {
      inputRef.current.setAttribute("webkitdirectory", "");
      inputRef.current.setAttribute("directory", "");
    } else {
      inputRef.current.removeAttribute("webkitdirectory");
      inputRef.current.removeAttribute("directory");
    }
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
          "bg-grayModern-100": dragActive && !darkMode,
          "bg-lafDark-300": dragActive && darkMode,
        })}
        htmlFor="input-file-upload"
      >
        <div>
          <button className={styles.uploadButton} onClick={() => onButtonClick("file")}>
            {t("StoragePanel.UploadFile")}
          </button>
          <span className="mx-2 text-xl">{t("Or")}</span>
          <button className={styles.uploadButton} onClick={() => onButtonClick("folder")}>
            {t("StoragePanel.UploadFolder")}
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
