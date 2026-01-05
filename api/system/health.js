export default function handler(req, res) {
  res.json({
    status: "ok",
    uptime: process.uptime()
  });
}
