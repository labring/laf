import useStorageStore from "../../store";

function PathLink() {
  const { currentStorage, prefix, setPrefix } = useStorageStore();
  const bucketName = currentStorage?.metadata.name || "";

  const str = prefix?.split("/").filter((s) => s !== "");

  const paths = str?.map((s, i) => {
    return {
      name: s,
      path: str[i - 1] ? `${str[i - 1]}/${s}/` : `/${s}/`,
    };
  });

  paths?.unshift({
    name: bucketName,
    path: "/",
  });

  const changeDirectory = (path: string) => {
    setPrefix(path);
  };

  return (
    <div>
      {paths?.map((p, index) => (
        <span
          key={p.path}
          className={index === paths?.length - 1 ? "text-black-500" : "text-gray-500"}
        >
          <span className="cursor-pointer" onClick={() => changeDirectory(p.path)}>
            {p.name}
          </span>
          <span className="mx-1">/</span>
        </span>
      ))}
    </div>
  );
}

export default PathLink;
