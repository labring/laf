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
            name: "admins",
            type: "collection",
            options: {},
            info: {
              readOnly: false,
              uuid: "DCX/9dPTR4S43GfXN29X4g==",
            },
            idIndex: {
              v: 2,
              key: {
                _id: 1,
              },
              name: "_id_",
            },
          },
          {
            name: "permissions",
            type: "collection",
            options: {},
            info: {
              readOnly: false,
              uuid: "LpTX6LvFTrKcEaOvm3SksA==",
            },
            idIndex: {
              v: 2,
              key: {
                _id: 1,
              },
              name: "_id_",
            },
          },
          {
            name: "password",
            type: "collection",
            options: {},
            info: {
              readOnly: false,
              uuid: "TcgLlzsMSaCdFrV0c/h2GQ==",
            },
            idIndex: {
              v: 2,
              key: {
                _id: 1,
              },
              name: "_id_",
            },
          },
          {
            name: "test_name",
            type: "collection",
            options: {},
            info: {
              readOnly: false,
              uuid: "U+bniViJT9ej8yuIib1Fxg==",
            },
            idIndex: {
              v: 2,
              key: {
                _id: 1,
              },
              name: "_id_",
            },
          },
          {
            name: "sys_sms_history",
            type: "collection",
            options: {},
            info: {
              readOnly: false,
              uuid: "WXVP6ncVSke2L6dTCsSM+g==",
            },
            idIndex: {
              v: 2,
              key: {
                _id: 1,
              },
              name: "_id_",
            },
          },
          {
            name: "customers",
            type: "collection",
            options: {},
            info: {
              readOnly: false,
              uuid: "coQH7ShgQv2vK3cysjGSmQ==",
            },
            idIndex: {
              v: 2,
              key: {
                _id: 1,
              },
              name: "_id_",
            },
          },
          {
            name: "roles",
            type: "collection",
            options: {},
            info: {
              readOnly: false,
              uuid: "2vh6R0G8SnWKSewQn0dkOQ==",
            },
            idIndex: {
              v: 2,
              key: {
                _id: 1,
              },
              name: "_id_",
            },
          },
          {
            name: "sys_config",
            type: "collection",
            options: {},
            info: {
              readOnly: false,
              uuid: "23XcvrymRRC0HOBbX3tb+w==",
            },
            idIndex: {
              v: 2,
              key: {
                _id: 1,
              },
              name: "_id_",
            },
          },
          {
            name: "sys_region",
            type: "collection",
            options: {},
            info: {
              readOnly: false,
              uuid: "3O1SLG75SDy4km+jQL7r/w==",
            },
            idIndex: {
              v: 2,
              key: {
                _id: 1,
              },
              name: "_id_",
            },
          },
        ],

        resp,
      );
      break;
  }
}
