import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default function handler(req, res) {
  const { password } = req.body;

  if (!bcrypt.compareSync(password, process.env.ADMIN_HASH)) {
    return res.status(403).end();
  }

  const token = jwt.sign(
    { role: "admin", coins: Infinity },
    process.env.JWT_SECRET
  );

  res.setHeader(
    "Set-Cookie",
    `admin=${token}; HttpOnly; Secure; SameSite=Strict`
  );

  res.json({ success: true });
}
