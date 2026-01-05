import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  const token = jwt.sign(
    { user: "github", role: "user" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.setHeader(
    "Set-Cookie",
    `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/`
  );

  res.redirect("/dashboard.html");
}
