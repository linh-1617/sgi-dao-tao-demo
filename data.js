// Dữ liệu giả lập phục vụ demo công khai. Không chứa dữ liệu học sinh thật.
const demoClasses = [
  {maLop:"26UD11",tenLop:"CNTT 1",nganh:"CNTT",khoa:"K26",namHoc:"2026-2027",khuVuc:"BRVT",siSoDuKien:10,gvPhuTrach:"GV001",trangThai:"Đang hoạt động"},
  {maLop:"26UD12",tenLop:"CNTT 2",nganh:"CNTT",khoa:"K26",namHoc:"2026-2027",khuVuc:"BRVT",siSoDuKien:10,gvPhuTrach:"GV001",trangThai:"Đang hoạt động"},
  {maLop:"26UD13",tenLop:"CNTT 3",nganh:"CNTT",khoa:"K26",namHoc:"2026-2027",khuVuc:"BRVT",siSoDuKien:10,gvPhuTrach:"GV003",trangThai:"Đang hoạt động"},
  {maLop:"26UD14",tenLop:"CNTT 4",nganh:"CNTT",khoa:"K26",namHoc:"2026-2027",khuVuc:"BRVT",siSoDuKien:10,gvPhuTrach:"GV003",trangThai:"Đang hoạt động"},
  {maLop:"26SĐ01",tenLop:"CSSĐ 1",nganh:"CSSĐ",khoa:"K26",namHoc:"2026-2027",khuVuc:"BRVT",siSoDuKien:10,gvPhuTrach:"GV004",trangThai:"Đang hoạt động"},
  {maLop:"26SĐ02",tenLop:"CSSĐ 2",nganh:"CSSĐ",khoa:"K26",namHoc:"2026-2027",khuVuc:"BRVT",siSoDuKien:10,gvPhuTrach:"GV004",trangThai:"Đang hoạt động"}
];

const cultureByClass = {
  "26UD11":["10A1","10A7"], "26UD12":["10A2","10A3"], "26UD13":["10A4","10A5"], "26UD14":["10A6","10A8"],
  "26SĐ01":["10A1","10A2","10A3","10A7"], "26SĐ02":["10A4","10A5","10A6","10A8"]
};

let demoId = 1;
window.SGI_SEED_STUDENTS = demoClasses.flatMap(c => Array.from({length:10}, (_,j) => ({
  id:`DEMO-${String(demoId++).padStart(4,"0")}`,
  hoDem:"HỌC VIÊN DEMO",
  ten:String(demoId-1).padStart(3,"0"),
  ngaySinh:`2011-${String((j%12)+1).padStart(2,"0")}-${String((j*2%27)+1).padStart(2,"0")}`,
  nganh:c.nganh,
  lopVanHoa:cultureByClass[c.maLop][j % cultureByClass[c.maLop].length],
  lopNghe:c.maLop,
  trangThai:"DANG_HOC",
  ghiChu:"Dữ liệu giả lập phục vụ demo",
  updatedAt:""
})));

window.SGI_CLASSES = demoClasses;
window.SGI_TEACHERS = [
  {maGV:"GV001",hoTen:"Giáo viên Demo 01",chuyenMon:"CNTT",trangThai:"Đang giảng dạy"},
  {maGV:"GV002",hoTen:"Giáo viên Demo 02",chuyenMon:"Chính trị, Pháp luật",trangThai:"Đang giảng dạy"},
  {maGV:"GV003",hoTen:"Giáo viên Demo 03",chuyenMon:"CNTT",trangThai:"Đang giảng dạy"},
  {maGV:"GV004",hoTen:"Giáo viên Demo 04",chuyenMon:"Chăm sóc sắc đẹp",trangThai:"Đang giảng dạy"}
];
window.SGI_SUBJECTS = [
  {maMon:"MH001",tenMon:"Tin học cơ bản",nganh:"CNTT",soTiet:45,lyThuyet:15,thucHanh:30,hocKy:"HK1",tienQuyet:"",trangThai:"Đang sử dụng"},
  {maMon:"MH002",tenMon:"Lập trình căn bản",nganh:"CNTT",soTiet:45,lyThuyet:15,thucHanh:30,hocKy:"HK1",tienQuyet:"",trangThai:"Đang sử dụng"},
  {maMon:"MH003",tenMon:"Sinh lý da",nganh:"CSSĐ",soTiet:30,lyThuyet:18,thucHanh:12,hocKy:"HK1",tienQuyet:"",trangThai:"Đang sử dụng"},
  {maMon:"MH004",tenMon:"Pháp luật",nganh:"CHUNG",soTiet:30,lyThuyet:30,thucHanh:0,hocKy:"HK1",tienQuyet:"",trangThai:"Đang sử dụng"}
];
window.SGI_ROOMS = [
  {maPhong:"BR-P10",tenPhong:"Phòng 10",loai:"Phòng học",sucChua:50,diaDiem:"Bà Rịa",trangThai:"Đang sử dụng"},
  {maPhong:"BR-P11",tenPhong:"Phòng 11",loai:"Phòng học",sucChua:50,diaDiem:"Bà Rịa",trangThai:"Đang sử dụng"},
  {maPhong:"BR-PM01",tenPhong:"Phòng máy 01",loai:"Phòng máy",sucChua:45,diaDiem:"Bà Rịa",trangThai:"Đang chuẩn bị"},
  {maPhong:"BR-CSSD01",tenPhong:"Phòng CSSĐ 01",loai:"Thực hành CSSĐ",sucChua:40,diaDiem:"Bà Rịa",trangThai:"Đang sử dụng"}
];
window.SGI_CLASS_RULES = {
  "CNTT|10A1":"26UD11","CNTT|10A7":"26UD11","CNTT|10A2":"26UD12","CNTT|10A3":"26UD12","CNTT|11A4":"26UD12","CNTT|11A6":"26UD12",
  "CNTT|10A4":"26UD13","CNTT|10A5":"26UD13","CNTT|10A6":"26UD14","CNTT|10A8":"26UD14","CNTT|11A1":"26UD14","CNTT|11A3":"26UD14","CNTT|11A5":"26UD14",
  "CSSĐ|10A1":"26SĐ01","CSSĐ|10A2":"26SĐ01","CSSĐ|10A3":"26SĐ01","CSSĐ|10A7":"26SĐ01","CSSĐ|11A1":"26SĐ01","CSSĐ|11A7":"26SĐ01",
  "CSSĐ|10A4":"26SĐ02","CSSĐ|10A5":"26SĐ02","CSSĐ|10A6":"26SĐ02","CSSĐ|10A8":"26SĐ02"
};
window.SGI_META = {school:"Trường Trung cấp Quốc tế Sài Gòn",area:"Bà Rịa – Vũng Tàu",cohort:"K26",schoolYear:"2026-2027",source:"synthetic-demo-data",generated:"29/09/2026"};
