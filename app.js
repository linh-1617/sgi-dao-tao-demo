(() => {
  const STUDENTS_KEY = "sgi_demo_students_v2";
  const HISTORY_KEY = "sgi_demo_history_v2";
  const AUTH_KEY = "sgi_demo_auth_v1";
  const collator = new Intl.Collator("vi", {numeric:true, sensitivity:"base"});

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const normalize = (s) => String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  const fmtDate = (iso) => {
    if (!iso) return "";
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? `${m[3]}/${m[2]}/${m[1]}` : String(iso);
  };
  const fullName = s => `${s.hoDem || ""} ${s.ten || ""}`.replace(/\s+/g," ").trim();
  const classIndustry = ma => (window.SGI_CLASSES.find(c=>c.maLop===ma)||{}).nganh || "";
  const teacherName = ma => (window.SGI_TEACHERS.find(t=>t.maGV===ma)||{}).hoTen || ma || "";

  let state = {
    students: loadStudents(),
    history: loadHistory(),
    page: location.hash.replace("#","") || "dashboard",
    currentClass: "",
    catalogTab: "classes",
    filters: {q:"", nganh:"", lopNghe:"", lopVanHoa:"", trangThai:"DANG_HOC"}
  };

  function loadStudents(){
    const saved = localStorage.getItem(STUDENTS_KEY);
    return saved ? JSON.parse(saved) : clone(window.SGI_SEED_STUDENTS);
  }
  function loadHistory(){
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  }
  function saveState(){
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(state.students));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history.slice(0,500)));
  }
  function toast(msg){
    const d=document.createElement("div");
    d.className="toast"; d.textContent=msg;
    $("#toast-root").appendChild(d);
    setTimeout(()=>d.remove(),2600);
  }
  function isAuthed(){ return sessionStorage.getItem(AUTH_KEY)==="1"; }
  function setAuth(v){ v ? sessionStorage.setItem(AUTH_KEY,"1") : sessionStorage.removeItem(AUTH_KEY); }
  function showApp(){
    $("#login-gate").classList.add("hidden");
    $("#app-shell").classList.remove("hidden");
    navigate(state.page, false);
  }

  $("#login-form").addEventListener("submit", e=>{
    e.preventDefault();
    const u=$("#login-user").value.trim(), p=$("#login-pass").value;
    if(u==="admin" && p==="sgi2026"){ setAuth(true); showApp(); }
    else $("#login-error").textContent="Sai tài khoản hoặc mật khẩu demo.";
  });
  $("#logout-btn").addEventListener("click", ()=>{ setAuth(false); location.reload(); });
  $("#reset-demo").addEventListener("click", ()=>{
    if(!confirm("Khôi phục toàn bộ dữ liệu học viên về bản mẫu ban đầu? Các chỉnh sửa demo sẽ mất.")) return;
    state.students=clone(window.SGI_SEED_STUDENTS);
    state.history=[];
    saveState();
    toast("Đã khôi phục dữ liệu mẫu.");
    render();
  });

  $("#main-nav").addEventListener("click", e=>{
    const b=e.target.closest("[data-page]");
    if(b) navigate(b.dataset.page);
  });
  window.addEventListener("hashchange", ()=>{
    const p=location.hash.replace("#","")||"dashboard";
    state.page=p; state.currentClass=""; render();
  });

  function navigate(page, updateHash=true){
    state.page=page; state.currentClass="";
    if(updateHash) location.hash=page;
    render();
  }

  function setHeader(title, subtitle){
    $("#page-title").textContent=title;
    $("#page-subtitle").textContent=subtitle;
    $$(".nav-item").forEach(x=>x.classList.toggle("active", x.dataset.page===state.page));
  }

  function activeStudents(){ return state.students.filter(s=>s.trangThai==="DANG_HOC"); }

  function validateStudents(){
    const issues=[];
    const nameDob = new Map();
    state.students.forEach(s=>{
      const list=[];
      if(!s.hoDem || !s.ten) list.push("Thiếu họ/tên");
      if(!s.ngaySinh) list.push("Thiếu ngày sinh");
      if(!s.nganh) list.push("Thiếu ngành");
      if(!s.lopVanHoa) list.push("Thiếu lớp văn hóa");
      if(!s.lopNghe || s.lopNghe==="CHƯA XẾP") list.push("Chưa có lớp nghề");
      if(s.lopNghe && s.lopNghe!=="CHƯA XẾP"){
        const ind=classIndustry(s.lopNghe);
        if(ind && s.nganh && ind!==s.nganh) list.push(`Lớp ${s.lopNghe} không thuộc ngành ${s.nganh}`);
      }
      const key=normalize(fullName(s))+"|"+(s.ngaySinh||"");
      if(s.ngaySinh && fullName(s)){
        if(!nameDob.has(key)) nameDob.set(key,[]);
        nameDob.get(key).push(s.id);
      }
      list.forEach(msg=>issues.push({student:s,msg,type:"DATA"}));
    });
    nameDob.forEach(ids=>{
      if(ids.length>1){
        ids.forEach(id=>{
          const s=state.students.find(x=>x.id===id);
          issues.push({student:s,msg:`Trùng họ tên + ngày sinh với ${ids.length-1} bản ghi khác`,type:"DUP"});
        });
      }
    });
    return issues;
  }

  function updateIssueBadge(){
    $("#nav-issue-count").textContent=validateStudents().length;
  }

  function render(){
    updateIssueBadge();
    if(state.page==="dashboard") renderDashboard();
    else if(state.page==="students") renderStudents();
    else if(state.page==="classes") renderClasses();
    else if(state.page==="catalogs") renderCatalogs();
    else if(state.page==="validation") renderValidation();
    else renderDashboard();
  }

  function renderDashboard(){
    setHeader("Tổng quan","Quản lý dữ liệu đào tạo khu vực Bà Rịa – Vũng Tàu");
    const students=activeStudents();
    const cntt=students.filter(s=>s.nganh==="CNTT").length;
    const cssd=students.filter(s=>s.nganh==="CSSĐ").length;
    const unassigned=students.filter(s=>!s.lopNghe || s.lopNghe==="CHƯA XẾP").length;
    const issues=validateStudents().length;
    const classes=window.SGI_CLASSES.map(c=>({...c,count:students.filter(s=>s.lopNghe===c.maLop).length}));
    const recent=state.history.slice(0,6);
    $("#page-content").innerHTML=`
      <div class="notice">Bản demo đang dùng dữ liệu cục bộ trên trình duyệt. Dữ liệu thật sẽ được nối sang Google Sheets sau khi chốt luồng vận hành.</div>
      <div class="cards">
        ${metric("Tổng học sinh",students.length,"Đang học")}
        ${metric("Tổng lớp",window.SGI_CLASSES.length,"Đang hoạt động")}
        ${metric("CNTT",cntt,"4 lớp")}
        ${metric("CSSĐ",cssd,"2 lớp")}
        ${metric("Chưa phân lớp",unassigned,"Cần xử lý",unassigned?"alert":"")}
        ${metric("Dữ liệu cần kiểm tra",issues,"Theo quy tắc kiểm tra",issues?"error":"")}
      </div>
      <div class="grid-2">
        <div class="section-card">
          <div class="section-head"><div><h2>Sĩ số theo lớp</h2><p>Tự cập nhật khi chuyển lớp hoặc đổi trạng thái học viên</p></div><button class="btn secondary" data-go="classes">Xem lớp</button></div>
          <div class="table-wrap"><table>
            <thead><tr><th>Lớp</th><th>Ngành</th><th class="center">Sĩ số</th><th class="center">Dự kiến</th><th>GV phụ trách</th><th>Trạng thái</th></tr></thead>
            <tbody>${classes.map(c=>`<tr><td><strong>${esc(c.maLop)}</strong><br><span class="muted">${esc(c.tenLop)}</span></td><td>${tagIndustry(c.nganh)}</td><td class="center"><strong>${c.count}</strong></td><td class="center">${c.siSoDuKien}</td><td>${esc(teacherName(c.gvPhuTrach))}</td><td><span class="tag active">${esc(c.trangThai)}</span></td></tr>`).join("")}</tbody>
          </table></div>
        </div>
        <div class="section-card">
          <div class="section-head"><div><h2>Thay đổi gần đây</h2><p>Lịch sử chỉnh sửa trong bản demo</p></div></div>
          <div class="section-body">${recent.length?`<div class="history-list">${recent.map(h=>`<div class="history-item"><strong>${esc(h.studentName)}</strong><span>${esc(h.detail)}</span><span>${esc(h.time)}</span></div>`).join("")}</div>`:`<div class="empty">Chưa có thay đổi nào.</div>`}</div>
        </div>
      </div>`;
    $$("[data-go]").forEach(b=>b.onclick=()=>navigate(b.dataset.go));
  }

  function metric(label,value,note,cls=""){
    return `<div class="card ${cls}"><div class="metric-label">${esc(label)}</div><div class="metric-value">${esc(value)}</div><div class="metric-note">${esc(note)}</div></div>`;
  }

  function renderStudents(){
    setHeader("Học viên","Danh sách gốc – chỉnh sửa một lần, lớp con tự cập nhật");
    const f=state.filters;
    const all=state.students;
    const vh=[...new Set(all.map(s=>s.lopVanHoa).filter(Boolean))].sort(collator.compare);
    const q=normalize(f.q);
    let list=all.filter(s=>{
      if(q && !normalize(`${s.id} ${fullName(s)} ${s.lopVanHoa} ${s.lopNghe}`).includes(q)) return false;
      if(f.nganh && s.nganh!==f.nganh) return false;
      if(f.lopNghe && s.lopNghe!==f.lopNghe) return false;
      if(f.lopVanHoa && s.lopVanHoa!==f.lopVanHoa) return false;
      if(f.trangThai && s.trangThai!==f.trangThai) return false;
      return true;
    });
    list.sort((a,b)=>collator.compare(a.lopNghe,b.lopNghe)||collator.compare(a.lopVanHoa,b.lopVanHoa)||collator.compare(fullName(a),fullName(b)));
    $("#page-content").innerHTML=`
      <div class="section-card">
        <div class="section-head"><div><h2>Danh sách học viên</h2><p>Nguồn duy nhất cho phân lớp trong bản demo</p></div>
          <div><button id="export-students" class="btn secondary">Xuất CSV</button></div>
        </div>
        <div class="section-body">
          <div class="toolbar">
            <div class="grow"><input id="filter-q" placeholder="Tìm MSHV, họ tên, lớp..." value="${esc(f.q)}"></div>
            <select id="filter-industry"><option value="">Tất cả ngành</option><option value="CNTT" ${f.nganh==="CNTT"?"selected":""}>CNTT</option><option value="CSSĐ" ${f.nganh==="CSSĐ"?"selected":""}>CSSĐ</option></select>
            <select id="filter-class"><option value="">Tất cả lớp nghề</option>${window.SGI_CLASSES.map(c=>`<option value="${esc(c.maLop)}" ${f.lopNghe===c.maLop?"selected":""}>${esc(c.maLop)}</option>`).join("")}</select>
            <select id="filter-culture"><option value="">Tất cả lớp văn hóa</option>${vh.map(x=>`<option value="${esc(x)}" ${f.lopVanHoa===x?"selected":""}>${esc(x)}</option>`).join("")}</select>
            <select id="filter-status"><option value="">Tất cả trạng thái</option>${statusOptions(f.trangThai)}</select>
          </div>
          <div class="summary-line">Hiển thị <strong>${list.length}</strong> / ${all.length} học viên.</div>
        </div>
        <div class="table-wrap">
          <table><thead><tr><th>MSHV</th><th>Họ đệm</th><th>Tên</th><th>Ngày sinh</th><th>Ngành</th><th>Lớp VH</th><th>Lớp nghề</th><th>Trạng thái</th><th></th></tr></thead>
          <tbody>${list.map(s=>`<tr>
            <td><strong>${esc(s.id)}</strong></td><td>${esc(s.hoDem)}</td><td><strong>${esc(s.ten)}</strong></td><td>${esc(fmtDate(s.ngaySinh))}</td>
            <td>${tagIndustry(s.nganh)}</td><td>${esc(s.lopVanHoa)}</td><td><strong>${esc(s.lopNghe)}</strong></td><td>${tagStatus(s.trangThai)}</td>
            <td class="right"><button class="btn ghost small edit-student" data-id="${esc(s.id)}">Sửa</button></td>
          </tr>`).join("")}</tbody></table>
        </div>
      </div>`;
    const bind=(id,key)=>{$(id).addEventListener("input",e=>{state.filters[key]=e.target.value;renderStudents();});};
    bind("#filter-q","q"); bind("#filter-industry","nganh"); bind("#filter-class","lopNghe"); bind("#filter-culture","lopVanHoa"); bind("#filter-status","trangThai");
    $$(".edit-student").forEach(b=>b.onclick=()=>openStudentModal(b.dataset.id));
    $("#export-students").onclick=()=>exportStudentsCSV(list,"hoc_vien_k26_brvt.csv");
  }

  function statusOptions(selected){
    const x=[["DANG_HOC","Đang học"],["TAM_NGHI","Tạm nghỉ"],["BAO_LUU","Bảo lưu"],["NGHI_HOC","Nghỉ học"],["HOAN_THANH","Hoàn thành"]];
    return x.map(([v,t])=>`<option value="${v}" ${selected===v?"selected":""}>${t}</option>`).join("");
  }
  function tagStatus(v){
    const labels={DANG_HOC:"Đang học",TAM_NGHI:"Tạm nghỉ",BAO_LUU:"Bảo lưu",NGHI_HOC:"Nghỉ học",HOAN_THANH:"Hoàn thành"};
    const cls=v==="DANG_HOC"?"active":v==="NGHI_HOC"?"inactive":"warn";
    return `<span class="tag ${cls}">${esc(labels[v]||v)}</span>`;
  }
  function tagIndustry(v){
    return `<span class="tag ${v==="CNTT"?"cntt":"cssd"}">${esc(v)}</span>`;
  }

  function openStudentModal(id){
    const s=state.students.find(x=>x.id===id);
    if(!s) return;
    const classes=window.SGI_CLASSES.filter(c=>c.nganh===s.nganh);
    $("#modal-root").innerHTML=`<div class="modal-backdrop">
      <div class="modal">
        <div class="modal-head"><div><h2>${esc(fullName(s))}</h2><div class="muted">${esc(s.id)}</div></div><button class="modal-close">×</button></div>
        <form id="student-form">
          <div class="modal-body">
            <div class="form-grid">
              <label>Họ đệm<input id="m-ho" value="${esc(s.hoDem)}" required></label>
              <label>Tên<input id="m-ten" value="${esc(s.ten)}" required></label>
              <label>Ngày sinh<input id="m-dob" type="date" value="${esc(s.ngaySinh)}"></label>
              <label>Ngành<select id="m-industry"><option value="CNTT" ${s.nganh==="CNTT"?"selected":""}>CNTT</option><option value="CSSĐ" ${s.nganh==="CSSĐ"?"selected":""}>CSSĐ</option></select></label>
              <label>Lớp văn hóa<input id="m-culture" value="${esc(s.lopVanHoa)}"></label>
              <label>Lớp nghề<select id="m-class">${classes.map(c=>`<option value="${esc(c.maLop)}" ${s.lopNghe===c.maLop?"selected":""}>${esc(c.maLop)} – ${esc(c.tenLop)}</option>`).join("")}</select></label>
              <label>Trạng thái<select id="m-status">${statusOptions(s.trangThai)}</select></label>
              <label class="full">Ghi chú<textarea id="m-note" rows="3">${esc(s.ghiChu||"")}</textarea></label>
            </div>
            <div class="notice warning" style="margin-top:16px;margin-bottom:0">MSHV là khóa chính và không được sửa. Khi chuyển lớp, hệ thống giữ học viên và ghi lịch sử thay đổi.</div>
          </div>
          <div class="modal-actions"><button type="button" class="btn ghost modal-cancel">Hủy</button><button type="button" id="auto-class" class="btn secondary">Gợi ý lớp theo quy tắc</button><button type="submit" class="btn primary">Lưu thay đổi</button></div>
        </form>
      </div></div>`;
    const refreshClassOptions=()=>{
      const ind=$("#m-industry").value;
      const current=$("#m-class").value;
      const list=window.SGI_CLASSES.filter(c=>c.nganh===ind);
      $("#m-class").innerHTML=list.map(c=>`<option value="${esc(c.maLop)}" ${current===c.maLop?"selected":""}>${esc(c.maLop)} – ${esc(c.tenLop)}</option>`).join("");
    };
    $("#m-industry").onchange=refreshClassOptions;
    $("#auto-class").onclick=()=>{
      const key=$("#m-industry").value+"|"+$("#m-culture").value.trim().toUpperCase();
      const suggested=window.SGI_CLASS_RULES[key];
      if(suggested){ $("#m-class").value=suggested; toast(`Gợi ý: ${suggested}`); }
      else toast("Chưa có quy tắc phân lớp cho tổ hợp này.");
    };
    const close=()=>$("#modal-root").innerHTML="";
    $(".modal-close").onclick=close; $(".modal-cancel").onclick=close;
    $("#student-form").onsubmit=e=>{
      e.preventDefault();
      const next={
        ...s,
        hoDem:$("#m-ho").value.trim().toUpperCase(),
        ten:$("#m-ten").value.trim().toUpperCase(),
        ngaySinh:$("#m-dob").value,
        nganh:$("#m-industry").value,
        lopVanHoa:$("#m-culture").value.trim().toUpperCase(),
        lopNghe:$("#m-class").value,
        trangThai:$("#m-status").value,
        ghiChu:$("#m-note").value.trim(),
        updatedAt:new Date().toISOString()
      };
      const ind=classIndustry(next.lopNghe);
      if(ind && ind!==next.nganh){ alert(`Lớp ${next.lopNghe} thuộc ngành ${ind}, không thể xếp học viên ${next.nganh}.`); return; }
      const changes=[];
      [["Ngành","nganh"],["Lớp VH","lopVanHoa"],["Lớp nghề","lopNghe"],["Trạng thái","trangThai"]].forEach(([label,k])=>{if(s[k]!==next[k])changes.push(`${label}: ${s[k]||"—"} → ${next[k]||"—"}`)});
      Object.assign(s,next);
      if(changes.length){
        state.history.unshift({studentId:s.id,studentName:fullName(s),detail:changes.join(" · "),time:new Date().toLocaleString("vi-VN")});
      }
      saveState(); close(); toast("Đã cập nhật học viên."); renderStudents();
    };
  }

  function renderClasses(){
    setHeader("Lớp học","Danh sách lớp tự cập nhật theo sheet tổng / nguồn học viên");
    if(state.currentClass) return renderClassDetail(state.currentClass);
    const students=activeStudents();
    $("#page-content").innerHTML=`
      <div class="notice">Các lớp dưới đây được tổng hợp trực tiếp từ dữ liệu học viên. Khi học viên đổi lớp nghề, sĩ số và danh sách lớp thay đổi ngay.</div>
      <div class="class-grid">${window.SGI_CLASSES.map(c=>{
        const ss=students.filter(s=>s.lopNghe===c.maLop);
        const comp=[...new Set(ss.map(s=>s.lopVanHoa).filter(Boolean))].sort(collator.compare).map(v=>`${v}: ${ss.filter(s=>s.lopVanHoa===v).length}`).join(" · ");
        return `<div class="class-card">
          <div class="class-card-top"><div><h3>${esc(c.maLop)}</h3><div class="muted">${esc(c.tenLop)}</div></div>${tagIndustry(c.nganh)}</div>
          <div class="big">${ss.length}</div><div class="muted">học viên đang học</div>
          <div class="composition">${esc(comp || "Chưa có học viên")}</div>
          <div class="footer"><span class="muted">${esc(teacherName(c.gvPhuTrach))}</span><button class="btn secondary open-class" data-class="${esc(c.maLop)}">Xem danh sách</button></div>
        </div>`;
      }).join("")}</div>`;
    $$(".open-class").forEach(b=>b.onclick=()=>{state.currentClass=b.dataset.class;renderClasses();});
  }

  function renderClassDetail(ma){
    const c=window.SGI_CLASSES.find(x=>x.maLop===ma);
    const list=activeStudents().filter(s=>s.lopNghe===ma).sort((a,b)=>collator.compare(a.lopVanHoa,b.lopVanHoa)||collator.compare(fullName(a),fullName(b)));
    $("#page-content").innerHTML=`
      <div class="print-title"><h1>DANH SÁCH LỚP ${esc(ma)}</h1><p>${esc(window.SGI_META.school)} – ${esc(window.SGI_META.area)}</p><p>Khóa K26 · Ngành ${esc(c.nganh)}</p></div>
      <div class="toolbar no-print"><button id="back-classes" class="btn ghost">← Danh sách lớp</button><div class="grow"></div><button id="export-class" class="btn secondary">Xuất CSV</button><button id="print-class" class="btn primary">In / Lưu PDF</button></div>
      <div class="section-card print-area">
        <div class="section-head"><div><h2>${esc(ma)} – ${esc(c.tenLop)}</h2><p>${esc(c.nganh)} · GV phụ trách: ${esc(teacherName(c.gvPhuTrach))}</p></div><strong>${list.length} HS</strong></div>
        <div class="section-body"><div class="kpi-row"><span>Lớp văn hóa: <strong>${[...new Set(list.map(s=>s.lopVanHoa))].filter(Boolean).sort(collator.compare).join(", ")}</strong></span><span>Trạng thái: <strong>Đang hoạt động</strong></span></div></div>
        <div class="table-wrap"><table><thead><tr><th class="center">STT</th><th>MSHV</th><th>Họ đệm</th><th>Tên</th><th>Ngày sinh</th><th>Lớp VH</th></tr></thead>
          <tbody>${list.map((s,i)=>`<tr><td class="center">${i+1}</td><td>${esc(s.id)}</td><td>${esc(s.hoDem)}</td><td><strong>${esc(s.ten)}</strong></td><td>${esc(fmtDate(s.ngaySinh))}</td><td><strong>${esc(s.lopVanHoa)}</strong></td></tr>`).join("")}</tbody>
        </table></div>
      </div>`;
    $("#back-classes").onclick=()=>{state.currentClass="";renderClasses();};
    $("#export-class").onclick=()=>exportStudentsCSV(list,`${ma}_danh_sach.csv`);
    $("#print-class").onclick=()=>window.print();
  }

  function renderCatalogs(){
    setHeader("Danh mục dùng chung","Mã chuẩn dùng xuyên suốt hệ thống");
    const tabs=[["classes","Lớp"],["teachers","Giáo viên"],["subjects","Môn học"],["rooms","Phòng học"]];
    let content="";
    if(state.catalogTab==="classes") content=catalogClasses();
    if(state.catalogTab==="teachers") content=catalogTeachers();
    if(state.catalogTab==="subjects") content=catalogSubjects();
    if(state.catalogTab==="rooms") content=catalogRooms();
    $("#page-content").innerHTML=`
      <div class="notice">Bản demo chỉ cho xem danh mục. Khi chuyển sang Google Sheets, các danh mục này sẽ là bảng chuẩn và có phân quyền chỉnh sửa.</div>
      <div class="catalog-tabs">${tabs.map(([v,t])=>`<button class="tab ${state.catalogTab===v?"active":""}" data-tab="${v}">${t}</button>`).join("")}</div>
      ${content}`;
    $$(".tab").forEach(b=>b.onclick=()=>{state.catalogTab=b.dataset.tab;renderCatalogs();});
  }
  function wrapCatalog(title,head,rows){
    return `<div class="section-card"><div class="section-head"><div><h2>${esc(title)}</h2><p>Mã là khóa liên kết, không nên đổi sau khi phát sinh dữ liệu.</p></div></div><div class="table-wrap"><table><thead><tr>${head.map(x=>`<th>${esc(x)}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div></div>`;
  }
  function catalogClasses(){
    return wrapCatalog("Danh mục lớp",["Mã lớp","Tên lớp","Ngành","Khóa","Năm học","GV phụ trách","Trạng thái"],window.SGI_CLASSES.map(c=>`<tr><td><strong>${esc(c.maLop)}</strong></td><td>${esc(c.tenLop)}</td><td>${tagIndustry(c.nganh)}</td><td>${esc(c.khoa)}</td><td>${esc(c.namHoc)}</td><td>${esc(teacherName(c.gvPhuTrach))}</td><td><span class="tag active">${esc(c.trangThai)}</span></td></tr>`).join(""));
  }
  function catalogTeachers(){
    return wrapCatalog("Danh mục giáo viên",["Mã GV","Họ tên","Chuyên môn","Trạng thái"],window.SGI_TEACHERS.map(t=>`<tr><td><strong>${esc(t.maGV)}</strong></td><td>${esc(t.hoTen)}</td><td>${esc(t.chuyenMon)}</td><td><span class="tag active">${esc(t.trangThai)}</span></td></tr>`).join(""));
  }
  function catalogSubjects(){
    return wrapCatalog("Danh mục môn học",["Mã môn","Tên môn","Ngành","Tổng tiết","LT","TH","Học kỳ","Trạng thái"],window.SGI_SUBJECTS.map(m=>`<tr><td><strong>${esc(m.maMon)}</strong></td><td>${esc(m.tenMon)}</td><td>${esc(m.nganh)}</td><td>${m.soTiet}</td><td>${m.lyThuyet}</td><td>${m.thucHanh}</td><td>${esc(m.hocKy)}</td><td><span class="tag active">${esc(m.trangThai)}</span></td></tr>`).join(""));
  }
  function catalogRooms(){
    return wrapCatalog("Danh mục phòng học",["Mã phòng","Tên phòng","Loại","Sức chứa","Địa điểm","Trạng thái"],window.SGI_ROOMS.map(r=>`<tr><td><strong>${esc(r.maPhong)}</strong></td><td>${esc(r.tenPhong)}</td><td>${esc(r.loai)}</td><td>${r.sucChua}</td><td>${esc(r.diaDiem)}</td><td><span class="tag ${r.trangThai==="Đang sử dụng"?"active":"warn"}">${esc(r.trangThai)}</span></td></tr>`).join(""));
  }

  function renderValidation(){
    setHeader("Kiểm tra dữ liệu","Phát hiện thiếu thông tin, sai ngành/lớp và trùng học viên");
    const issues=validateStudents();
    const grouped=new Map();
    issues.forEach(i=>{if(!grouped.has(i.student.id))grouped.set(i.student.id,{student:i.student,msgs:[]}); grouped.get(i.student.id).msgs.push(i.msg);});
    $("#page-content").innerHTML=`
      <div class="cards" style="grid-template-columns:repeat(3,minmax(180px,1fr))">
        ${metric("Tổng lỗi/cảnh báo",issues.length,"Có thể một học viên có nhiều lỗi",issues.length?"error":"")}
        ${metric("Học viên bị ảnh hưởng",grouped.size,"Cần rà soát")}
        ${metric("Học viên hợp lệ",state.students.length-grouped.size,"Theo bộ quy tắc demo")}
      </div>
      <div class="section-card"><div class="section-head"><div><h2>Danh sách cần kiểm tra</h2><p>Không tự xóa hoặc tự sửa dữ liệu nghi ngờ</p></div></div>
        <div class="table-wrap"><table><thead><tr><th>MSHV</th><th>Họ tên</th><th>Ngày sinh</th><th>Ngành</th><th>Lớp VH</th><th>Lớp nghề</th><th>Vấn đề</th><th></th></tr></thead>
        <tbody>${grouped.size?[...grouped.values()].map(({student:s,msgs})=>`<tr><td>${esc(s.id)}</td><td><strong>${esc(fullName(s))}</strong></td><td>${esc(fmtDate(s.ngaySinh))}</td><td>${esc(s.nganh)}</td><td>${esc(s.lopVanHoa)}</td><td>${esc(s.lopNghe)}</td><td>${msgs.map(m=>`<div class="issue"><span class="issue-dot"></span><div><div class="issue-title">${esc(m)}</div></div></div>`).join("")}</td><td><button class="btn ghost small edit-student" data-id="${esc(s.id)}">Sửa</button></td></tr>`).join(""):`<tr><td colspan="8"><div class="empty">Không phát hiện lỗi theo bộ quy tắc demo.</div></td></tr>`}</tbody></table></div>
      </div>`;
    $$(".edit-student").forEach(b=>b.onclick=()=>openStudentModal(b.dataset.id));
  }

  function exportStudentsCSV(list, filename){
    const rows=[["MSHV","Họ đệm","Tên","Ngày sinh","Ngành","Lớp văn hóa","Lớp nghề","Trạng thái","Ghi chú"]];
    list.forEach(s=>rows.push([s.id,s.hoDem,s.ten,fmtDate(s.ngaySinh),s.nganh,s.lopVanHoa,s.lopNghe,s.trangThai,s.ghiChu||""]));
    const csv="\uFEFF"+rows.map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\r\n");
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
    a.download=filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }

  if(isAuthed()) showApp();
})();
