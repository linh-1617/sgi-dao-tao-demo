const crypto = require("crypto");

let tokenCache = { token:null, expires:0 };

function envReady(){
  return Boolean(process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
}
function b64url(data){
  return Buffer.from(typeof data==="string"?data:JSON.stringify(data)).toString("base64url");
}
async function getAccessToken(){
  if(tokenCache.token && Date.now()<tokenCache.expires-60000) return tokenCache.token;
  if(!envReady()) throw new Error("Google Sheets environment variables are not configured");
  const now=Math.floor(Date.now()/1000);
  const header={alg:"RS256",typ:"JWT"};
  const claim={
    iss:process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope:"https://www.googleapis.com/auth/spreadsheets",
    aud:"https://oauth2.googleapis.com/token",
    iat:now,exp:now+3600
  };
  const unsigned=b64url(header)+"."+b64url(claim);
  const key=process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g,"\n");
  const signature=crypto.sign("RSA-SHA256",Buffer.from(unsigned),key).toString("base64url");
  const assertion=unsigned+"."+signature;
  const body=new URLSearchParams({
    grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion
  });
  const r=await fetch("https://oauth2.googleapis.com/token",{
    method:"POST",
    headers:{"content-type":"application/x-www-form-urlencoded"},
    body
  });
  if(!r.ok) throw new Error("Google OAuth failed: "+await r.text());
  const j=await r.json();
  tokenCache={token:j.access_token,expires:Date.now()+j.expires_in*1000};
  return j.access_token;
}
async function gfetch(url,options={}){
  const token=await getAccessToken();
  const r=await fetch(url,{...options,headers:{Authorization:`Bearer ${token}`,"content-type":"application/json",...(options.headers||{})}});
  if(!r.ok) throw new Error(`Google Sheets API ${r.status}: ${await r.text()}`);
  return r.status===204?null:r.json();
}
function sheetUrl(range,suffix=""){
  return `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEET_ID}/values/${encodeURIComponent(range)}${suffix}`;
}
async function getValues(range){
  const j=await gfetch(sheetUrl(range));
  return j.values||[];
}
async function updateValues(range,values){
  return gfetch(sheetUrl(range,"?valueInputOption=USER_ENTERED"),{method:"PUT",body:JSON.stringify({values})});
}
async function appendValues(range,values){
  return gfetch(sheetUrl(range,":append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS"),{method:"POST",body:JSON.stringify({values})});
}
function rowsToObjects(values){
  if(!values.length) return [];
  const headers=values[0].map(x=>String(x).trim());
  return values.slice(1).filter(r=>r.some(v=>String(v??"").trim()!=="")).map((row,i)=>{
    const obj={_row:i+2};
    headers.forEach((h,j)=>obj[h]=row[j]??"");
    return obj;
  });
}
async function readTable(sheetName){
  return rowsToObjects(await getValues(`${sheetName}!A:Z`));
}
module.exports={envReady,getValues,updateValues,appendValues,readTable};
