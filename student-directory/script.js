// CampusConnect Student Directory — ES6 practice
const KEY = "campusconnect_students_v2";
const THEME_KEY = "campusconnect_theme_v2";
const examples = [
 {id:"STU001",name:"Sori Likisa",department:"Software Engineering",year:"3rd Year",category:"Junior"},
 {id:"STU002",name:"Hana Bekele",department:"Computer Science",year:"4th Year",category:"Senior"},
 {id:"STU003",name:"Abel Tadesse",department:"Information Technology",year:"2nd Year",category:"Junior"},
 {id:"STU004",name:"Miki Alemu",department:"Civil Engineering",year:"5th Year",category:"Senior"}
];
const loadStudents = () => { try { const saved=localStorage.getItem(KEY); return saved===null?[...examples]:JSON.parse(saved); } catch { return [...examples]; } };
let students=loadStudents(), activeCategory="All", activeDepartment="All", editingId=null;
const $ = selector => document.querySelector(selector);
const form=$("#studentForm"), nameInput=$("#studentName"), deptInput=$("#studentDepartment"), yearInput=$("#studentYear"), categoryInput=$("#studentCategory"), body=$("#studentTableBody"), search=$("#searchInput"), deptFilter=$("#departmentFilter");
const save = () => localStorage.setItem(KEY,JSON.stringify(students));
const nextId = () => { const max=students.reduce((largest,{id})=>Math.max(largest,Number(id.replace("STU",""))||0),0); return `STU${String(max+1).padStart(3,"0")}`; };
const escapeHTML = value => String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const filtered = (...conditions) => conditions.reduce((rows,condition)=>rows.filter(condition),[...students]);
const updateStats = () => {
 const junior=students.filter(({category})=>category==="Junior").length, senior=students.filter(({category})=>category==="Senior").length;
 $("#totalStat").textContent=students.length; $("#juniorStat").textContent=junior; $("#seniorStat").textContent=senior;
 $("#allCount").textContent=students.length; $("#juniorCount").textContent=junior; $("#seniorCount").textContent=senior;
};
const updateDepartments = () => {
 const names=[...new Set(students.map(({department})=>department))].sort();
 deptFilter.innerHTML='<option value="All">All departments</option>';
 names.forEach(name=>{const option=document.createElement("option");option.value=name;option.textContent=name;deptFilter.append(option);});
 deptFilter.value=names.includes(activeDepartment)?activeDepartment:"All"; if(deptFilter.value==="All")activeDepartment="All";
};
const getVisible = () => {
 const term=search.value.trim().toLowerCase();
 return filtered(
  ({category})=>activeCategory==="All"||category===activeCategory,
  ({department})=>activeDepartment==="All"||department===activeDepartment,
  ({name,id,department,year,category})=>[name,id,department,year,category].some(v=>v.toLowerCase().includes(term))
 );
};
const initials = name=>name.split(/\s+/).filter(Boolean).slice(0,2).map(word=>word[0].toUpperCase()).join("");
const render = () => {
 const rows=getVisible();
 $("#listTitle").textContent=activeCategory==="All"?(activeDepartment==="All"?"All students":activeDepartment):`${activeCategory} students`;
 $("#listDescription").textContent=activeCategory==="All"&&activeDepartment==="All"?"Showing every saved student and all their information.":"Showing records matching the selected category and department.";
 body.innerHTML=rows.map(({id,name,department,year,category})=>`
 <tr><td><div class="student"><span class="avatar">${initials(name)}</span><span><span class="student-name">${escapeHTML(name)}</span><br><small class="muted">Student record</small></span></div></td>
 <td class="id">${escapeHTML(id)}</td><td>${escapeHTML(department)}</td><td>${escapeHTML(year)}</td>
 <td><span class="pill ${category==="Junior"?"junior":"senior"}">${escapeHTML(category)}</span></td>
 <td><div class="actions"><button class="action edit" data-action="edit" data-id="${escapeHTML(id)}" type="button">Edit</button><button class="action delete" data-action="delete" data-id="${escapeHTML(id)}" type="button">Delete</button></div></td></tr>`).join("");
 $("#emptyState").classList.toggle("hidden",rows.length!==0);
 $("#resultCount").textContent=`${rows.length} ${rows.length===1?"student":"students"}`;
 updateStats();
 document.querySelectorAll(".category").forEach(button=>button.classList.toggle("active",button.dataset.category===activeCategory));
};
const resetForm = () => {form.reset();editingId=null;$("#formTitle").textContent="Add a student";$("#saveButton").textContent="＋ Add student";$("#cancelEdit").classList.add("hidden");$("#formMessage").textContent="";};
form.addEventListener("submit",event=>{
 event.preventDefault();
 const name=nameInput.value.trim(),department=deptInput.value.trim(),year=yearInput.value.trim(),category=categoryInput.value;
 if(!name||!department||!year||!category){$("#formMessage").textContent="Please complete all required fields.";return;}
 if(editingId){students=students.map(student=>student.id===editingId?{...student,name,department,year,category}:student);$("#formMessage").textContent="Student information updated.";}
 else{students=[...students,{id:nextId(),name,department,year,category}];$("#formMessage").textContent="Student added successfully.";}
 save();activeCategory="All";activeDepartment="All";search.value="";updateDepartments();render();resetForm();
});
body.addEventListener("click",event=>{
 const button=event.target.closest("button[data-action]");if(!button)return;
 const {action,id}=button.dataset,student=students.find(item=>item.id===id);if(!student)return;
 if(action==="edit"){const {name,department,year,category}=student;editingId=id;nameInput.value=name;deptInput.value=department;yearInput.value=year;categoryInput.value=category;$("#formTitle").textContent=`Edit ${name}`;$("#saveButton").textContent="Save changes";$("#cancelEdit").classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"});}
 if(action==="delete"&&confirm(`Delete ${student.name} (${id})?`)){students=students.filter(item=>item.id!==id);save();updateDepartments();render();}
});
$("#cancelEdit").addEventListener("click",resetForm);
document.querySelectorAll(".category").forEach(button=>button.addEventListener("click",()=>{activeCategory=button.dataset.category;activeDepartment="All";deptFilter.value="All";render();}));
deptFilter.addEventListener("change",()=>{activeDepartment=deptFilter.value;render();});
search.addEventListener("input",render);
const setTheme=theme=>{document.body.classList.toggle("dark",theme==="dark");$("#themeToggle").firstChild.textContent=theme==="dark"?"☀ ":"☾ ";$("#themeText").textContent=theme==="dark"?"Light mode":"Dark mode";localStorage.setItem(THEME_KEY,theme);};
$("#themeToggle").addEventListener("click",()=>setTheme(document.body.classList.contains("dark")?"light":"dark"));
setTheme(localStorage.getItem(THEME_KEY)||"light");updateDepartments();render();
