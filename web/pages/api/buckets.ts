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
            name: "data",
            mode: "public-read",
            quota: 1073741824,
          },
          {
            name: "public",
            mode: "public-read-write",
            quota: 1073741824,
          },
          {
            name: "testbk",
            mode: "private",
            quota: 1073741824,
          },
        ],
        resp,
      );
    case "POST":
      JsonResp(
        [
          {
            name: "data",
            mode: "public-read",
            quota: 1073741824,
          },
          {
            name: "public",
            mode: "public-read-write",
            quota: 1073741824,
          },
          {
            name: "testbk",
            mode: "private",
            quota: 1073741824,
          },
        ]
      )
    case "delete":
      
      break;
  }
}
