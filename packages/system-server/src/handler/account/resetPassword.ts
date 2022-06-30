/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-12-07 13:54:45
 * @Description:
 */

import { Request, Response } from "express";
import { DatabaseAgent } from "../../db";
import { CN_ACCOUNTS } from "../../constants";
import { ObjectId } from "mongodb";
import { hashPassword } from "../../support/util-passwd";

/**
 * The handler of editing account
 */
export async function handleResetPassword(req: Request, res: Response) {
  const uid = req["auth"]?.uid;
  const db = DatabaseAgent.db;

  // check if params valid
  const { accountId, password, oldPassword } = req.body;
  if (!uid) return res.status(401).send();

  // check if uid valid
  const account = await db
    .collection(CN_ACCOUNTS)
    .findOne({ _id: new ObjectId(accountId) });

  if (!account) {
    return res.status(422).send("account not found");
  }

  if (oldPassword) {
    return res.send({ error: "oldPassword cannot be empty" });
  }

  if (!password) {
    return res.send({ error: "password cannot be empty" });
  }

  if (account.password !== hashPassword(oldPassword)) {
    return res.send({ error: "oldPassword is wrong" });
  }

  // update account
  const data = {
    updated_at: new Date(),
  };

  data["password"] = hashPassword(password);

  // update name if provided

  const r = await db.collection(CN_ACCOUNTS).updateOne(
    {
      _id: new ObjectId(accountId),
    },
    {
      $set: data,
    }
  );

  return res.send({
    code: 0,
    data: {
      ...r,
      accountId,
    },
  });
}
