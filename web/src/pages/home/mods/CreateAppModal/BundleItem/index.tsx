// import { useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

// import { COLOR_MODE } from "@/constants";
import { TBundle } from "@/apis/typing";

export default function BundleItem(props: {
  onChange: (...event: any[]) => void;
  bundle: TBundle | any;
  isActive: boolean;
}) {
  const { bundle, isActive, onChange } = props;
  // const { colorMode } = useColorMode();
  // const darkMode = colorMode === COLOR_MODE.dark;

  return (
    <div
      onClick={() => onChange(bundle._id)}
      key={bundle._id}
      className={clsx("cursor-pointer rounded-md pl-4", {
        "text-[#219BF4]": isActive,
      })}
    >
      <div>
        <p className="text-lg">{bundle.displayName}</p>
      </div>
    </div>
  );
}
