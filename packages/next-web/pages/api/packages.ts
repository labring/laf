import { NextApiRequest, NextApiResponse } from "next";

import { JsonResp } from "./response";

export default async function handler(req: NextApiRequest, resp: NextApiResponse) {
  JsonResp(
    [
      {
        name: "lodash",
        version: "latest",
      },
      {
        name: "cheerio",
        version: "latest",
      },
      {
        name: "request",
        version: "latest",
      },
      {
        name: "aws-sdk",
        version: "2.1199.0",
      },
    ],

    resp,
  );
}
