import jwt from "jsonwebtoken";
import sql from "../db/pg.js";

export default function handler(req, res) {
  try {
    const token = req.cookies.admin;
    const admin = jwt.verify(token, process.env.JWT_SECRET);
    if (admin.role !== "admin") throw new Error();

    sql`
      SELECT id, coins FROM users ORDER BY id
    `.then(users => res.json(users));
  } catch {
    res.status(403).end();
  }
}
