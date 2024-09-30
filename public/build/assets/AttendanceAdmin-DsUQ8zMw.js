import{a as e,j as p,q as ne,Y as oe,G as se,F as b,c as le,B as V}from"./app-Cxczvfbl.js";import{p as ce,q as de,o as U,B as F,P as ie,u as ue,r as a,Q as he,e as pe,g as me,c as ye,f as ge,a as q,G as L,b as N,I as K}from"./vendor-DYJuczRe.js";import{A as be}from"./App-AT_um95D.js";import{d as m}from"./dayjs.min-33VdPO6W.js";import{t as fe,a as xe,b as Ce,c as ke,d as P,e as ve}from"./chunk-YRZGWF2W-BE9Nb62H.js";import{u as Me}from"./chunk-TLBGAR4N-Xm5X4ZG6.js";import{d as _e,p as Ae}from"./Search-Bq5uW2gf.js";import{D as Q,u as $,w as we}from"./xlsx-4agzAUDh.js";const Se=ce(de.jsx("path",{d:"M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 16H5V10h14zM9 14H7v-2h2zm4 0h-2v-2h2zm4 0h-2v-2h2zm-8 4H7v-2h2zm4 0h-2v-2h2zm4 0h-2v-2h2z"}),"CalendarMonth");var Ye={name:"1a5nq0o",styles:"width:100%;border-collapse:collapse;& td{border:1px solid #ddd;}& th{background-color:#f4f4f4;}"};const Ee=({loading:f,attendanceData:r,currentYear:_,currentMonth:x,leaveTypes:A,leaveCounts:w})=>{const S=m(`${_}-${x}-01`).daysInMonth(),Y=[{label:"Sl",key:"sl"},{label:"Name",key:"name"},...Array.from({length:S},(t,n)=>{const d=n+1;return{label:`${d}`,key:`day-${d}`}}),...A.map(t=>({label:t.type,key:t.type}))],I=t=>A.map(n=>{var y;const d=((y=w[t])==null?void 0:y[n.type])||0;return e(P,{align:"center",children:d},`${t+n.type}`)}),C=t=>{const n=r.find(d=>d.user_id===t);return Array.from({length:S},(d,y)=>{const E=y+1,k=m(`${_}-${x}-${E}`).format("YYYY-MM-DD"),D=n?n[k]:"▼";return e(P,{align:"center",children:D},`day-${E}`)})};return e("div",{style:{maxHeight:"84vh",overflowY:"auto"},children:f?p(F,{display:"flex",justifyContent:"center",alignItems:"center",height:"100%",children:[e(U,{})," "]}):p(ve,{isStriped:!0,selectionMode:"multiple",selectionBehavior:"toggle",isCompact:!0,isHeaderSticky:!0,removeWrapper:!0,"aria-label":"Attendance Table",css:Ye,children:[e(fe,{columns:Y,children:t=>e(xe,{align:"center",children:t.label},t.key)}),e(Ce,{children:r.map((t,n)=>p(ke,{children:[e(P,{children:n+1}),e(P,{style:{whiteSpace:"nowrap",textAlign:"start"},children:e(Me,{avatarProps:{radius:"lg",src:t.profile_image},name:t.name})}),C(t.user_id),I(t.user_id)]},t.user_id))})]})})},Pe=ie.memo(({title:f})=>{const r=ue(),[_,x]=a.useState(!1),{auth:A}=ne().props,[w,S]=a.useState([]),[Y,I]=a.useState([]),[C,t]=a.useState([]),[n,d]=a.useState(0),[y,E]=a.useState(0),[k,D]=a.useState(""),J=he(r.breakpoints.down("md")),[T,$e]=a.useState(30),[j,O]=a.useState(1),[i,X]=a.useState({currentMonth:m().format("YYYY-MM")}),z=m(`${i.currentYear}-${i.currentMonth}-01`).daysInMonth(),Z=a.useCallback((o,s)=>{X(u=>({...u,[o]:s}))},[]),ee=async(o,s,u)=>{x(!0);try{const l=await le.get(route("attendancesAdmin.paginate"),{params:{page:o,perPage:s,employee:k,currentYear:u.currentMonth?m(u.currentMonth).year():"",currentMonth:u.currentMonth?m(u.currentMonth).format("MM"):""}});S(l.data.data),d(l.data.total),E(l.data.last_page),t(l.data.leaveTypes),I(l.data.leaveCounts)}catch(l){console.log(l),V.error("Failed to fetch data.",{icon:"🔴",style:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:r.glassCard.backgroundColor,border:r.glassCard.border,color:r.palette.text.primary}})}finally{x(!1)}},te=o=>{const s=o.target.value.toLowerCase();D(s)};a.useEffect(()=>{ee(j,T,i)},[j,T,i,k]);const re=o=>{O(o)},B=async()=>{const o=new Promise((s,u)=>{try{const l=allUsers.map((c,v)=>{const g=w.find(h=>h.user_id===c.id)||{},H={sl:v+1,name:c.name};for(let h=0;h<z;h++){const M=h+1,ae=m(`${i.currentYear}-${i.currentMonth}-${M}`).format("YYYY-MM-DD");H[`day-${M}`]=g[ae]||"▼"}return C.forEach(h=>{var M;H[h.type]=((M=Y[c.id])==null?void 0:M[h.type])||0}),H}),G=[{label:"Sl",key:"sl"},{label:"Name",key:"name"},...Array.from({length:z},(c,v)=>{const g=v+1;return{label:`${g}`,key:`day-${g}`}}),...C.map(c=>({label:c.type,key:c.type}))],R=$.json_to_sheet(l,{header:G.map(c=>c.key)});G.forEach((c,v)=>{const g=$.encode_cell({c:v,r:0});R[g].v=c.label});const W=$.book_new();$.book_append_sheet(W,R,"Attendance"),we(W,"AttendanceData.xlsx"),s("Export successful!")}catch(l){u("Failed to export data. Please try again."),console.error("Error exporting data to Excel:",l)}});V.promise(o,{pending:{render(){return p("div",{style:{display:"flex",alignItems:"center"},children:[e(U,{}),e("span",{style:{marginLeft:"8px"},children:"Exporting data to Excel ..."})]})},icon:!1,style:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:r.glassCard.backgroundColor,border:r.glassCard.border,color:r.palette.text.primary}},success:{render({data:s}){return e(b,{children:s})},icon:"🟢",style:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:r.glassCard.backgroundColor,border:r.glassCard.border,color:r.palette.text.primary}},error:{render({data:s}){return e(b,{children:s})},icon:"🔴",style:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:r.glassCard.backgroundColor,border:r.glassCard.border,color:r.palette.text.primary}}})};return p(b,{children:[e(oe,{title:f}),e(F,{sx:{display:"flex",justifyContent:"center",p:2},children:e(pe,{in:!0,children:p(se,{children:[e(me,{title:"Attendances",sx:{padding:"24px"},action:e(F,{display:"flex",gap:2,children:A.roles.includes("Administrator")&&e(b,{children:J?e(b,{children:e(ye,{title:"Export Daily Works",color:"success",onClick:B,children:e(Q,{})})}):e(b,{children:e(ge,{title:"Export Daily Works",variant:"outlined",color:"success",startIcon:e(Q,{}),onClick:B,children:"Export"})})})})}),e(q,{children:e(F,{children:p(L,{container:!0,spacing:2,children:[e(L,{item:!0,xs:12,sm:6,md:4,children:e(N,{label:"Employee",fullWidth:!0,variant:"outlined",placeholder:"Employee...",value:k,onChange:te,InputProps:{startAdornment:e(K,{position:"start",children:e(_e,{})})}})}),e(L,{item:!0,xs:12,sm:6,md:4,children:e(N,{label:"Current Month",type:"month",fullWidth:!0,variant:"outlined",placeholder:"Month...",value:i.currentMonth,onChange:o=>Z("currentMonth",o.target.value),InputProps:{startAdornment:e(K,{position:"start",children:e(Se,{})})}})})]})})}),p(q,{children:[e(Ee,{attendanceData:w,currentYear:i.currentYear,currentMonth:i.currentMonth,leaveTypes:C,leaveCounts:Y,loading:_}),n>=30&&e("div",{className:"py-2 px-2 flex justify-center items-center",children:e(Ae,{initialPage:1,isCompact:!0,showControls:!0,showShadow:!0,color:"primary",variant:"bordered",page:j,total:y,onChange:re})})]})]})})})]})});Pe.layout=f=>e(be,{children:f});export{Pe as default};