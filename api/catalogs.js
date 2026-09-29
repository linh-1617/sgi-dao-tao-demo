const {requireAuth}=require("./_lib/auth");
const {envReady,readTable}=require("./_lib/google");
module.exports=async function handler(req,res){
  if(req.method!=="GET") return res.status(405).json({ok:false,error:"METHOD_NOT_ALLOWED"});
  if(!requireAuth(req,res)) return;
  if(!envReady()) return res.status(503).json({ok:false,error:"SHEETS_NOT_CONFIGURED"});
  try{
    const [classes,teachers,subjects,rooms]=await Promise.all([
      readTable("DM_LOP"),readTable("DM_GIAO_VIEN"),readTable("DM_MON_HOC"),readTable("DM_PHONG")
    ]);
    res.status(200).json({ok:true,classes,teachers,subjects,rooms});
  }catch(e){res.status(500).json({ok:false,error:e.message});}
};
