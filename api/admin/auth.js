import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default function handler(req, res) {
  const { password } = req.body;

  if (!bcrypt.compareSync(password, process.env.ADMIN_HASH)) {
    return res.status(403).end();
  }

  const token = jwt.sign(
    { role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.setHeader(
    "Set-Cookie",
    `admin=${token}; HttpOnly; Secure; SameSite=Strict; Path=/`
  );

  res.json({ success: true });
}
