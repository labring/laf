import JsonEditor from "@/components/Editor/JsonEditor";

function BodyParamsTab(props: { onChange(values: string): void }) {
  const { onChange } = props;

  return (
    <JsonEditor
      height="calc(100vh - 500px)"
      onChange={(values) => {
        try {
          const jsonValues = JSON.parse(values || "{}");
          onChange && onChange(jsonValues);
        } catch (e) {}
      }}
      value={JSON.stringify({}, null, 2)}
    />
  );
}

export default BodyParamsTab;
