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
            name: "inches",
            path: "h5/static/inches.json",
            size: 1073741824,
            updateTime: "2021-08-01 12:00:00",
            prefix: "h5/static",
          },
          {
            name: "feet",
            path: "feet.json",
            size: 1073741824,
            updateTime: "2021-08-01 12:00:00",
            prefix: "",
          },
          {
            name: "yards",
            path: "h5/yards.json",
            size: 1073741824,
            updateTime: "2021-08-01 12:00:00",
            prefix: "h5",
          },
        ],
        resp,
      );
      break;
  }
}
