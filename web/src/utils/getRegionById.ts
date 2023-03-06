import { TRegion } from "@/apis/typing";

function getRegionById(regions: TRegion[] | undefined, id: string): TRegion | undefined {
  return (regions || []).find((region) => region.id === id);
}

export default getRegionById;
