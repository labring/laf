import { site_url } from "@/constants";

export default function Video() {
  return (
    <>
      <video autoPlay controls>
        <source src={site_url.laf_index_video} type="video/mp4" />
      </video>
    </>
  );
}
