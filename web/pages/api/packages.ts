import { NextApiRequest, NextApiResponse } from "next";

import { JsonResp } from "./response";

export default async function handler(req: NextApiRequest, resp: NextApiResponse) {
  const {
    query: { id, name },
    method,
  } = req;

  switch (method) {
    case "GET":
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
      break;

    case "POST":
      JsonResp("ok", resp);
      break;
  }
}
