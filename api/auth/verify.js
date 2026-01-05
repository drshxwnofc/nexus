import jwt from "jsonwebtoken";

export default function handler(req, res) {
  try {
    const token = req.cookies.token;
    const data = jwt.verify(token, process.env.JWT_SECRET);
    res.json(data);
  } catch {
    res.status(401).end();
  }
}
