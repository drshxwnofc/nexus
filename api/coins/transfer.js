import jwt from "jsonwebtoken";
import kv from "../db/kv.js";
import sql from "../db/pg.js";
import { rateLimit } from "../security/rate-limit.js";
import { checkFraud } from "../security/fraud.js";

export default async function handler(req, res) {
  try {
    const token = req.cookies.token;
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const { to, amount } = req.body;
    const ip = req.headers["x-forwarded-for"] || "unknown";

    if (!to || amount <= 0) {
      return res.status(400).end();
    }

    // 🚦 Rate limits
    const userAllowed = await rateLimit(`user:${user.id}`, 10, 60);
    const ipAllowed = await rateLimit(`ip:${ip}`, 30, 60);

    if (!userAllowed || !ipAllowed) {
      return res.status(429).json({ error: "Too many requests" });
    }

    // ❄️ Check freeze
    const frozen = await kv.get(`freeze:${user.id}`);
    if (frozen) {
      return res.status(403).json({ error: "Account frozen" });
    }

    // 🧠 Fraud detection
    const fraud = await checkFraud({
      from: user.id,
      to,
      amount,
      ip
    });

    if (fraud) {
      await kv.set(`freeze:${user.id}`, fraud);
      await sql`
        INSERT INTO transactions (sender, receiver, amount)
        VALUES (${user.id}, 'FRAUD:${fraud}', 0)
      `;
      return res.status(403).json({ error: "Fraud detected" });
    }

    // 💰 Balance check
    const fromKey = `coins:${user.id}`;
    const toKey = `coins:${to}`;
    const fromBalance = await kv.get(fromKey) || 0;

    if (fromBalance < amount) {
      return res.status(403).json({ error: "Insufficient coins" });
    }

    // 🔒 Atomic transfer
    await kv.multi()
      .decr(fromKey, amount)
      .incr(toKey, amount)
      .exec();

    // 📜 Ledger
    await sql`
      INSERT INTO transactions (sender, receiver, amount)
      VALUES (${user.id}, ${to}, ${amount})
    `;

    res.json({ success: true });
  } catch {
    res.status(401).end();
  }
  }
