import kv from "../db/kv.js";
import sql from "../db/pg.js";

export async function checkFraud({ from, to, amount, ip }) {
  // 🚫 Self-transfer
  if (from === to) return "SELF_TRANSFER";

  // 🚫 Large sudden transfer
  if (amount > 5000) return "LARGE_TRANSFER";

  // 🚫 Rapid drain detection
  const recent = await sql`
    SELECT SUM(amount) as total
    FROM transactions
    WHERE sender = ${from}
      AND created_at > NOW() - INTERVAL '5 minutes'
  `;

  if (recent[0]?.total > 8000) {
    return "RAPID_DRAIN";
  }

  // 🚫 Loop detection (A -> B -> A)
  const loop = await sql`
    SELECT 1 FROM transactions
    WHERE sender = ${to}
      AND receiver = ${from}
      AND created_at > NOW() - INTERVAL '10 minutes'
    LIMIT 1
  `;

  if (loop.length > 0) return "TRANSFER_LOOP";

  // 🚫 IP abuse
  const ipKey = `fraud:ip:${ip}`;
  const ipHits = await kv.incr(ipKey);
  if (ipHits === 1) await kv.expire(ipKey, 600);
  if (ipHits > 20) return "IP_ABUSE";

  return null;
}
