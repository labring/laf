import { site_url } from "@/constants";

import useSiteSettingStore from "../siteSetting";

export default function Video() {
  const { siteSettings } = useSiteSettingStore();
  return (
    <>
      <video autoPlay controls>
        <source
          src={siteSettings.site_url?.metadata.laf_index_video || site_url.laf_index_video}
          type="video/mp4"
        />
      </video>
    </>
  );
}
