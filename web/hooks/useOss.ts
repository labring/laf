import AWS from "aws-sdk";
import useGlobalStore from "pages/globalStore";
type Credentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
};

const useOss = (credentials: Credentials) => {
  const { currentApp } = useGlobalStore();
  const region = "us-east-1";
  const endpoint = `http://${currentApp?.name}.oss-${region}.com`;

  AWS.config.update({
    accessKeyId: "YOUR_ACCESS_KEY_HERE",
    secretAccessKey: "YOUR_SECRET_ACCESS_KEY_HERE",
  });

  const myBucket = new AWS.S3({
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    sessionToken: credentials.sessionToken,
    endpoint: endpoint,
    s3ForcePathStyle: true,
    signatureVersion: "v4",
    region,
  });

  return myBucket;
};

export default useOss;
