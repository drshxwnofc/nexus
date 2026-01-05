export default function handler(req, res) {
  const { to, amount } = req.body;

  if (amount <= 0) {
    return res.status(400).end();
  }

  res.json({ success: true });
}
