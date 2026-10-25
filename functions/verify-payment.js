// Confirms that a payment really came from Razorpay by checking its signature.
const crypto = require("crypto");
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  const secret = process.env.RAZORPAY_KEY_SECRET;
  let b;
  try { b = JSON.parse(event.body || "{}"); } catch { return { statusCode: 400, body: "Bad JSON" }; }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = b;
  if (!secret || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ verified: false }) };
  const expected = crypto.createHmac("sha256", secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  const ok = expected.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));
  return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ verified: ok }) };
};
