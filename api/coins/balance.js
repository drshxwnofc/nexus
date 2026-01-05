import jwt from "jsonwebtoken";
import kv from "../db/kv.js";

export default async function handler(req, res) {
  try {
    const token = req.cookies.token;
    const user = jwt.verify(token, process.env.JWT_SECRET);

    let balance = await kv.get(`coins:${user.id}`);

    if (balance === null) {
      balance = 0;
      await kv.set(`coins:${user.id}`, 0);
    }

    res.json({ balance });
  } catch {
    res.status(401).end();
  }
}
