import{V as _,a as e,j as n,F as x,M as q}from"./app-Bi027Ot0.js";import{r as i,j as A,T as P,W as G,c as $,G as D,b as F,Y as W,Z as E,t as H,$ as O,f as w,e as U,g as V,B,a as Y}from"./vendor-BVrsz1zL.js";import{d as R,B as M,A as Z,G as z}from"./App-DRWxthgw.js";import{d as J}from"./Delete-CpOB5ANp.js";import{a as Q,b as X,c as K,d as ee,e as te,t as re}from"./chunk-YRZGWF2W-Df_VSz1G.js";import{t as I}from"./chunk-KQ7OR4H5-rMzQjwj0.js";import{d as ae,G as N}from"./GlassDialog-vUR-q99y.js";import{L as oe}from"./LoadingButton-7yCvM1oc.js";import{A as le}from"./Add-C1LteHBS.js";import"./DOMLayoutDelegate-_rMu7_ZC.js";import"./chunk-KBN3H6OQ-BSVTPrRd.js";import"./chunk-CAFRINWI-CcU5yOMx.js";import"./useFormValidationState-aQWFcJuP.js";const se=({holidaysData:c,handleClickOpen:a,setCurrentHoliday:u,openModal:p,setHolidaysData:t})=>{_().props,i.useState(null),A();const l=(r,d)=>{const o=r[d];switch(d){case"title":return o;case"from_date":return new Date(o).toLocaleDateString("en-US",{day:"numeric",month:"short",year:"numeric"});case"to_date":return new Date(o).toLocaleDateString("en-US",{day:"numeric",month:"short",year:"numeric"});case"actions":return n("div",{className:"relative flex items-center gap-2",children:[e(I,{content:"Edit Holiday",children:e("span",{className:"text-lg text-default-400 cursor-pointer active:opacity-50",onClick:()=>{u(r),p("edit_holiday")},children:e(R,{})})}),e(I,{content:"Delete Holiday",color:"danger",children:e("span",{className:"text-lg text-danger cursor-pointer active:opacity-50",onClick:()=>a(r.id,"delete_holiday"),children:e(J,{})})})]});default:return o}},h=[{name:"Title",uid:"title"},{name:"From Date",uid:"from_date"},{name:"To Date",uid:"to_date"},{name:"Actions",uid:"actions"}];return e("div",{style:{maxHeight:"84vh",overflowY:"auto"},children:c.length===0?e(P,{variant:"h6",align:"center",sx:{mt:2},children:"No holidays"}):n(re,{isStriped:!0,selectionMode:"multiple",selectionBehavior:"toggle",isHeaderSticky:!0,removeWrapper:!0,"aria-label":"Holiday Table",children:[e(Q,{columns:h,children:r=>e(X,{align:r.uid==="actions"?"center":"start",children:r.name},r.uid)}),e(K,{items:c,children:r=>e(ee,{children:d=>e(te,{style:{whiteSpace:"nowrap"},children:l(r,d)})},r.id)})]})})},L=({open:c,closeModal:a,holidaysData:u,setHolidaysData:p,currentHoliday:t})=>{_().props;const l=A(),[h,r]=i.useState((t==null?void 0:t.title)||""),[d,o]=i.useState((t==null?void 0:t.from_date)||""),[C,v]=i.useState((t==null?void 0:t.to_date)||""),[m,b]=i.useState({}),[k,T]=i.useState(!1);return n(N,{open:c,onClose:a,fullWidth:!0,maxWidth:"sm",children:[n(G,{sx:{display:"flex",alignItems:"center"},children:[e(P,{variant:"h6",children:"Add Holiday"}),e($,{onClick:a,sx:{position:"absolute",top:8,right:16},children:e(ae,{})})]}),n("form",{onSubmit:async g=>{g.preventDefault(),T(!0);const j=new Promise(async(f,y)=>{try{const s={title:h,fromDate:d,toDate:C};t&&(s.id=t.id);const S=await axios.post(route("holiday-add"),s);S.status===200&&(p(S.data.holidays),f([S.data.message||"Holiday added successfully"]),a())}catch(s){T(!1),s.response?(s.response.status===422?(b(s.response.data.errors||{}),y(s.response.statusText||"Failed to add holiday")):y("An unexpected error occurred. Please try again later."),console.error(s.response)):s.request?(y("No response received from the server. Please check your internet connection."),console.error(s.request)):(y("An error occurred while setting up the request."),console.error("Error",s.message))}finally{T(!1)}});M.promise(j,{pending:{render(){return n("div",{style:{display:"flex",alignItems:"center"},children:[e(H,{}),e("span",{style:{marginLeft:"8px"},children:"Adding holiday..."})]})},icon:!1,style:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:l.glassCard.backgroundColor,border:l.glassCard.border,color:l.palette.text.primary}},success:{render({data:f}){return e(x,{children:f.map((y,s)=>e("div",{children:y},s))})},icon:"🟢",style:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:l.glassCard.backgroundColor,border:l.glassCard.border,color:l.palette.text.primary}},error:{render({data:f}){return e(x,{children:f})},icon:"🔴",style:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:l.glassCard.backgroundColor,border:l.glassCard.border,color:l.palette.text.primary}}})},children:[e(W,{children:n(D,{container:!0,spacing:2,children:[e(D,{item:!0,xs:12,md:6,children:e(F,{label:"Title",type:"text",fullWidth:!0,value:h,onChange:g=>r(g.target.value),InputLabelProps:{shrink:!0},error:!!m.title,helperText:m.title})}),e(D,{item:!0,xs:12,md:6,children:e(F,{label:"From",type:"date",fullWidth:!0,value:d,onChange:g=>o(g.target.value),InputLabelProps:{shrink:!0},error:!!m.fromDate,helperText:m.fromDate})}),e(D,{item:!0,xs:12,md:6,children:e(F,{label:"To",type:"date",fullWidth:!0,value:C,onChange:g=>v(g.target.value),InputLabelProps:{shrink:!0},error:!!m.toDate,helperText:m.toDate})})]})}),e(E,{sx:{padding:"16px",justifyContent:"center"},children:e(oe,{type:"submit",variant:"outlined",color:"primary",loading:k,disabled:k,sx:{borderRadius:"50px"},children:"Submit"})})]})]})},ie=({open:c,handleClose:a,holidayIdToDelete:u,setHolidaysData:p})=>{const t=A();return n(N,{open:c,onClose:a,"aria-labelledby":"alert-dialog-title","aria-describedby":"alert-dialog-description",children:[e(G,{id:"alert-dialog-title",children:"Confirm Deletion"}),e(W,{children:e(O,{id:"alert-dialog-description",children:"Are you sure you want to delete this holiday? This action cannot be undone."})}),n(E,{children:[e(w,{onClick:a,color:"primary",children:"Cancel"}),e(w,{onClick:()=>{const h=new Promise(async(r,d)=>{try{const o=await axios.delete(route("holiday-delete",{id:u,route:route().current()}));o.status===200&&(p(o.data.holidays),r("Holiday deleted successfully"))}catch(o){console.error("Error deleting task:",o),d(o.response.data.error||"Failed to delete holiday")}finally{a()}});M.promise(h,{pending:{render(){return n("div",{style:{display:"flex",alignItems:"center"},children:[e(H,{}),e("span",{style:{marginLeft:"8px"},children:"Deleting holiday..."})]})},icon:!1,style:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:t.glassCard.backgroundColor,border:t.glassCard.border,color:t.palette.text.primary}},success:{render({data:r}){return e(x,{children:r})},icon:"🟢",style:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:t.glassCard.backgroundColor,border:t.glassCard.border,color:t.palette.text.primary}},error:{render({data:r}){return e(x,{children:r})},icon:"🔴",style:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:t.glassCard.backgroundColor,border:t.glassCard.border,color:t.palette.text.primary}}})},color:"error",autoFocus:!0,children:"Delete"})]})]})},ne=({title:c})=>{_().props;const[a,u]=i.useState(null),[p,t]=i.useState(_().props.holidays),[l,h]=i.useState(null),[r,d]=i.useState(),o=b=>{u(b)},C=i.useCallback((b,k)=>{h(b),u(k)},[]),v=i.useCallback(()=>{u(null),h(null)},[]),m=()=>{u(null)};return n(x,{children:[e(q,{title:c}),a==="add_holiday"&&e(L,{open:a==="add_holiday",setHolidaysData:t,closeModal:m,holidaysData:p}),a==="edit_holiday"&&e(L,{open:a==="edit_holiday",setHolidaysData:t,closeModal:m,holidaysData:p,currentHoliday:r}),a==="delete_holiday"&&e(ie,{open:a==="delete_holiday",handleClose:v,holidayIdToDelete:l,setHolidaysData:t}),e(B,{sx:{display:"flex",justifyContent:"center",p:2},children:e(U,{in:!0,children:n(z,{children:[e(V,{title:"Holidays",sx:{padding:"24px"},action:e(B,{display:"flex",gap:2,children:e(w,{title:"Add Holiday",variant:"outlined",color:"success",startIcon:e(le,{}),onClick:()=>o("add_holiday"),children:"Add Holiday"})})}),e(Y,{children:e(se,{setHolidaysData:t,handleClickOpen:C,setCurrentHoliday:d,openModal:o,holidaysData:p})})]})})})]})};ne.layout=c=>e(Z,{children:c});export{ne as default};