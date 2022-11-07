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
            v: 2,
            key: {
              _id: 1,
            },
            name: "_id_",
          },
          {
            v: 2,
            key: {
              key: 1,
            },
            name: "key_1",
            unique: true,
          },
        ],
        resp,
      );
      break;
  }
}
