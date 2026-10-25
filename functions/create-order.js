// Creates a Razorpay order on the server so the amount can't be changed in the browser.
// Needs environment variables RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (set them in Netlify, never in index.html).
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) return { statusCode: 500, body: JSON.stringify({ error: "Razorpay keys are not set" }) };
  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return { statusCode: 400, body: "Bad JSON" }; }
  const amount = Math.round(Number(body.amount));
  if (!Number.isFinite(amount) || amount < 100) return { statusCode: 400, body: JSON.stringify({ error: "Invalid amount" }) };
  const notes = {};
  for (const [k, v] of Object.entries(body.notes || {}).slice(0, 15)) notes[k] = String(v).slice(0, 250);
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64"),
    },
    body: JSON.stringify({ amount, currency: "INR", receipt: "rcv_" + Date.now(), notes }),
  });
  const data = await res.json();
  if (!res.ok) return { statusCode: 502, body: JSON.stringify({ error: data.error?.description || "Razorpay error" }) };
  return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: data.id, amount: data.amount }) };
};
