const {verifySession}=require("./_lib/auth");
module.exports=async function handler(req,res){
  const s=verifySession(req);
  if(!s) return res.status(401).json({ok:false});
  res.status(200).json({ok:true,user:{username:s.sub}});
};
