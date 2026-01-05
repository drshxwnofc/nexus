import jwt from "jsonwebtoken";
import kv from "../db/kv.js";

export default async function handler(req, res) {
  try {
    const admin = jwt.verify(req.cookies.admin, process.env.JWT_SECRET);
    if (admin.role !== "admin") throw new Error();

    const { id } = req.body;
    await kv.del(`freeze:${id}`);

    res.json({ success: true });
  } catch {
    res.status(403).end();
  }
}
