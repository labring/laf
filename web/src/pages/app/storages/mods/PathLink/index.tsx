import useStorageStore from "../../store";

function PathLink() {
  const { currentStorage, prefix, setPrefix } = useStorageStore();
  const bucketName = currentStorage?.metadata.name || "";

  const strs = prefix?.split("/").filter((s) => s !== "");

  const paths = strs?.map((s, i) => {
    return {
      name: s,
      path: strs[i - 1] ? `${strs[i - 1]}/${s}/` : `/${s}/`,
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
      {paths?.map((p) => (
        <span key={p.path}>
          <span
            className="text-blue-700 underline cursor-pointer"
            onClick={() => changeDirectory(p.path)}
          >
            {p.name}
          </span>
          <span className="text-gray-500">/</span>
        </span>
      ))}
    </div>
  );
}

export default PathLink;
