const {clearCookie}=require("./_lib/auth");
module.exports=async function handler(req,res){
  res.setHeader("Set-Cookie",clearCookie());
  res.status(200).json({ok:true});
};
