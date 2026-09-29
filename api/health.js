const {envReady}=require("./_lib/google");
module.exports=async function handler(req,res){
  res.setHeader("cache-control","no-store");
  res.status(200).json({
    ok:true,
    app:"sgi-dao-tao-demo",
    sheetsConfigured:envReady(),
    authConfigured:Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && process.env.SESSION_SECRET),
    mode:envReady()?"google-sheets":"demo-local"
  });
};
