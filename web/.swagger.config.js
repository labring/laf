module.exports = [
  {
    swaggerPath: "http://api.192.168.64.11.nip.io/api-json",
    typingFileName: "api-auto.d.ts",

    outDir: "src/apis/v1",
    request: "import request from '@/utils/request';",
    fileNameRule: function (url) {
      return url.split("/")[2];
    },
  },
];
