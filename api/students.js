const {requireAuth}=require("./_lib/auth");
const {envReady,readTable,updateValues,appendValues}=require("./_lib/google");

const COLS=["MSHV","HO_DEM","TEN","NGAY_SINH","NGANH","LOP_VAN_HOA","LOP_NGHE","TRANG_THAI","GHI_CHU","UPDATED_AT"];

module.exports=async function handler(req,res){
  const session=requireAuth(req,res);
  if(!session) return;
  if(!envReady()) return res.status(503).json({ok:false,error:"SHEETS_NOT_CONFIGURED"});
  try{
    if(req.method==="GET"){
      const students=await readTable("HOC_VIEN");
      return res.status(200).json({ok:true,students});
    }
    if(req.method==="PUT"){
      const body=req.body||{};
      const id=String(body.MSHV||"").trim();
      if(!id) return res.status(400).json({ok:false,error:"MSHV_REQUIRED"});
      const students=await readTable("HOC_VIEN");
      const found=students.find(x=>String(x.MSHV).trim()===id);
      if(!found) return res.status(404).json({ok:false,error:"STUDENT_NOT_FOUND"});
      const next={...found,...body,MSHV:id,UPDATED_AT:new Date().toISOString()};
      const values=COLS.map(k=>next[k]??"");
      await updateValues(`HOC_VIEN!A${found._row}:J${found._row}`,[values]);
      await appendValues("LOG_CHINH_SUA!A:I",[[
        "LOG-"+Date.now(),new Date().toISOString(),session.sub,"HOC_VIEN",id,"BAN_GHI","",JSON.stringify(body),"Cap nhat qua web"
      ]]);
      return res.status(200).json({ok:true,student:next});
    }
    return res.status(405).json({ok:false,error:"METHOD_NOT_ALLOWED"});
  }catch(e){
    return res.status(500).json({ok:false,error:e.message});
  }
};
