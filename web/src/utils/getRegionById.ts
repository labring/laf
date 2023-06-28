import { TRegion } from "@/apis/typing";

function getRegionById(regions: TRegion[] | undefined, id: string): TRegion | undefined {
  return (regions || []).find((region) => region._id === id);
}

export default getRegionById;
