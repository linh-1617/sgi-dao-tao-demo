const crypto = require("crypto");

function parseCookies(req) {
  const raw = req.headers.cookie || "";
  return Object.fromEntries(raw.split(";").map(x => x.trim()).filter(Boolean).map(x => {
    const i = x.indexOf("=");
    return [decodeURIComponent(x.slice(0,i)), decodeURIComponent(x.slice(i+1))];
  }));
}
function b64url(input) {
  return Buffer.from(input).toString("base64url");
}
function sign(payload) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}
function createSession(username) {
  const payload = b64url(JSON.stringify({sub:username, exp:Date.now()+8*60*60*1000}));
  return payload+"."+sign(payload);
}
function verifySession(req) {
  try {
    const token = parseCookies(req).sgi_session;
    if (!token) return null;
    const [payload,sig] = token.split(".");
    if (!payload || !sig) return null;
    const expected = sign(payload);
    if (!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected))) return null;
    const data = JSON.parse(Buffer.from(payload,"base64url").toString("utf8"));
    if (!data.exp || Date.now()>data.exp) return null;
    return data;
  } catch { return null; }
}
function sessionCookie(token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `sgi_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800${secure}`;
}
function clearCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `sgi_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
function requireAuth(req,res) {
  const session = verifySession(req);
  if (!session) { res.status(401).json({ok:false,error:"UNAUTHORIZED"}); return null; }
  return session;
}
module.exports={createSession,verifySession,sessionCookie,clearCookie,requireAuth};
