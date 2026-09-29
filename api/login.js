const {createSession,sessionCookie}=require("./_lib/auth");
module.exports=async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({ok:false,error:"METHOD_NOT_ALLOWED"});
  if(!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET)
    return res.status(503).json({ok:false,error:"AUTH_NOT_CONFIGURED"});
  const {username,password}=req.body||{};
  if(username!==process.env.ADMIN_USERNAME || password!==process.env.ADMIN_PASSWORD)
    return res.status(401).json({ok:false,error:"INVALID_CREDENTIALS"});
  res.setHeader("Set-Cookie",sessionCookie(createSession(username)));
  res.status(200).json({ok:true,user:{username}});
};
