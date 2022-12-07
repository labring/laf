module.exports = [
  {
    swaggerPath: "http://localhost:3000/api-json",
    typingFileName: "api-auto.d.ts",

    outDir: "apis/v1",
    request: "import request from '@/utils/request';",
    fileNameRule: function (url) {
      return url.split("/")[2];
    },
  },
];
