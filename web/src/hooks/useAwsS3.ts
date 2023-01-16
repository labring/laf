import useGlobalStore from "@/pages/globalStore";

function useAwsS3() {
  const currentApp = useGlobalStore((state) => state.currentApp);
  const credentials = currentApp?.storage.credentials!;
  const region = currentApp?.regionName;

  const s3 = new (window as any).AWS.S3({
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    sessionToken: credentials.sessionToken,
    endpoint: credentials.endpoint,
    region: region,
    s3ForcePathStyle: true,
    signatureVersion: "v4",
  });

  const getList = async (bucketName: string | undefined, { marker, prefix }: any) => {
    if (!bucketName || bucketName === "") return [];

    const res = await s3
      .listObjects({
        Bucket: bucketName,
        MaxKeys: 100,
        Marker: marker,
        Prefix: prefix,
        Delimiter: "/",
      })
      .promise();

    const files = res.Contents || [];
    const dirs = res.CommonPrefixes || [];
    // console.log(files, dirs)
    return [...files, ...dirs];
  };

  const getFileUrl = (bucket: string, key: string) => {
    const res = s3.getSignedUrl("getObject", { Bucket: bucket, Key: key });
    return res;
  };

  const uploadFile = async (bucketName: string, key: string, body: any, { contentType }: any) => {
    const res = await s3
      .putObject({ Bucket: bucketName, Key: key, ContentType: contentType, Body: body })
      .promise();
    return res;
  };

  const deleteFile = async (bucket: string, key: string) => {
    const res = await s3.deleteObject({ Bucket: bucket, Key: key }).promise();
    return res;
  };

  return { s3, getList, uploadFile, getFileUrl, deleteFile };
}

export default useAwsS3;
