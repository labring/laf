module.exports = [
  {
    swaggerPath: "http://api.dev.laf.run/-json",
    typingFileName: "api-auto.d.ts",

    outDir: "src/apis/v1",
    request: "import request from '@/utils/request';",
    fileNameRule: function (url) {
      return url.split("/")[2];
    },
  },
];
