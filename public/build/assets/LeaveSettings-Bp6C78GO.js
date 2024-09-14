import{q as D,j as t,a as e,Y as j,G as H,F as y,B as T}from"./app-DL9yb4nK.js";import{r as F,u as U,e as $,g as q,a as I,G as p,b as m,F as E,h as N,S as A,M as C,f as w,i as z,j as J,k as K,l as L,m as s,n as O,T as M,R,B as Q,o as _}from"./vendor-C1M8BoQX.js";import{A as V}from"./App-C0C0DJBI.js";import"./Edit-TeKWPbmJ.js";const X=({title:v})=>{const f={type:"",days:"",eligibility:"",carry_forward:"",earned_leave:"",special_conditions:""},[g,k]=F.useState(D().props.leaveTypes),[i,h]=F.useState(f),[P,S]=F.useState(!1),r=U(),b=a=>{const{name:d,value:l}=a.target;h({...i,[d]:l})},W=async()=>{const a=new Promise(async(d,l)=>{var o,c;try{const n=await axios.post("/add-leave-type",i);n.status===201?(k([...g,{...i,id:n.data.id}]),h(f),d(["Leave type added successfully."])):l(["Failed to add leave type. Please try again."])}catch(n){console.log(n),l([((c=(o=n.response)==null?void 0:o.data)==null?void 0:c.message)||"Failed to add leave type. Please try again."])}});T.promise(a,{pending:{render(){return t("div",{style:{display:"flex",alignItems:"center"},children:[e(_,{}),e("span",{style:{marginLeft:"8px"},children:"Adding leave type..."})]})},icon:!1,style:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:r.glassCard.backgroundColor,border:r.glassCard.border,color:r.palette.text.primary}},success:{render({data:d}){return e(y,{children:d.map((l,o)=>e("div",{children:l},o))})},icon:"🟢",style:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:r.glassCard.backgroundColor,border:r.glassCard.border,color:r.palette.text.primary}},error:{render({data:d}){return e(y,{children:d})},icon:"🔴",style:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:r.glassCard.backgroundColor,border:r.glassCard.border,color:r.palette.text.primary}}})},Y=async a=>{const d=g.find(l=>l.id===a);h(d),S(!0)},B=()=>{const a=new Promise(async(d,l)=>{var o,c;try{const n=await axios.put(`/update-leave-type/${i.id}`,i);if(n.status===200){const u=g.map(x=>x.id===i.id?{...i,id:n.data.id}:x);k(u),h(f),S(!1),d(["Leave type updated successfully."])}else l(["Failed to update leave type. Please try again."])}catch(n){console.log(n),l([((c=(o=n.response)==null?void 0:o.data)==null?void 0:c.message)||"Failed to update leave type. Please try again."])}});T.promise(a,{pending:{render(){return t("div",{style:{display:"flex",alignItems:"center"},children:[e(_,{}),e("span",{style:{marginLeft:"8px"},children:"Updating leave type..."})]})},icon:!1,style:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:r.glassCard.backgroundColor,border:r.glassCard.border,color:r.palette.text.primary}},success:{render({data:d}){return e(y,{children:d.map((l,o)=>e("div",{children:l},o))})},icon:"🟢",style:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:r.glassCard.backgroundColor,border:r.glassCard.border,color:r.palette.text.primary}},error:{render({data:d}){return e(y,{children:d})},icon:"🔴",style:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:r.glassCard.backgroundColor,border:r.glassCard.border,color:r.palette.text.primary}}})},G=async a=>{const d=new Promise(async(l,o)=>{var c,n;try{const u=await axios.delete(`/delete-leave-type/${a}`);u.status===200?(k(g.filter(x=>x.id!==a)),l([u.data.message||"Leave type deleted successfully."])):o(["Failed to delete leave type. Please try again."])}catch(u){console.error(u),o([((n=(c=u.response)==null?void 0:c.data)==null?void 0:n.message)||"Failed to delete leave type. Please try again."])}});T.promise(d,{pending:{render(){return t("div",{style:{display:"flex",alignItems:"center"},children:[e(_,{}),e("span",{style:{marginLeft:"8px"},children:"Deleting leave type..."})]})},icon:!1,style:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:r.glassCard.backgroundColor,border:r.glassCard.border,color:r.palette.text.primary}},success:{render({data:l}){return e(y,{children:l.map((o,c)=>e("div",{children:o},c))})},icon:"🟢",style:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:r.glassCard.backgroundColor,border:r.glassCard.border,color:r.palette.text.primary}},error:{render({data:l}){return e(y,{children:l})},icon:"🔴",style:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:r.glassCard.backgroundColor,border:r.glassCard.border,color:r.palette.text.primary}}})};return t(y,{children:[e(j,{title:v}),e(Q,{sx:{display:"flex",justifyContent:"center",p:2},children:e($,{in:!0,children:t(H,{children:[e(q,{title:"Leave Settings",sx:{padding:"24px"}}),e(I,{children:t(p,{container:!0,spacing:1,alignItems:"center",children:[e(p,{item:!0,xs:6,sm:3,md:3,children:e(m,{fullWidth:!0,label:"Leave Type",name:"type",value:i.type,onChange:b})}),e(p,{item:!0,xs:6,sm:3,md:3,children:e(m,{fullWidth:!0,label:"Number of Days",name:"days",type:"number",value:i.days,onChange:b})}),e(p,{item:!0,xs:6,sm:3,md:3,children:t(E,{fullWidth:!0,children:[e(N,{id:"carry-forward-label",children:"Carry Forward"}),t(A,{variant:"outlined",labelId:"carry-forward-label",label:"Carry Forward",name:"carry_forward",value:i.carry_forward,onChange:b,MenuProps:{PaperProps:{sx:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:r.glassCard.backgroundColor,border:r.glassCard.border,borderRadius:2,boxShadow:"rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px"}}},children:[e(C,{value:!0,children:"Yes"}),e(C,{value:!1,children:"No"})]})]})}),e(p,{item:!0,xs:6,sm:3,md:3,children:t(E,{fullWidth:!0,children:[e(N,{id:"earned-leave-label",children:"Earned Leave"}),t(A,{variant:"outlined",labelId:"earned-leave-label",label:"Earned Leave",name:"earned_leave",value:i.earned_leave,onChange:b,MenuProps:{PaperProps:{sx:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:r.glassCard.backgroundColor,border:r.glassCard.border,borderRadius:2,boxShadow:"rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px"}}},children:[e(C,{value:!0,children:"Yes"}),e(C,{value:!1,children:"No"})]})]})}),e(p,{item:!0,xs:12,sm:6,md:6,children:e(m,{fullWidth:!0,label:"Eligibility Criteria",name:"eligibility",value:i.eligibility,onChange:b})}),e(p,{item:!0,xs:12,sm:6,md:6,children:e(m,{fullWidth:!0,label:"Special Conditions",name:"special_conditions",value:i.special_conditions,onChange:b})}),e(p,{item:!0,xs:12,sm:12,md:12,sx:{display:"flex",justifyContent:"center"},children:e(w,{sx:{height:"100%"},variant:"outlined",color:"primary",onClick:P?B:W,children:P?"Update Leave Type":"Add Leave Type"})})]})}),e(I,{children:e(z,{style:{maxHeight:"84vh",overflowY:"auto"},children:t(J,{children:[e(K,{children:t(L,{children:[e(s,{children:"Type"}),e(s,{children:"Days"}),e(s,{children:"Eligibility"}),e(s,{children:"Carry Forward"}),e(s,{children:"Earned Leave"}),e(s,{children:"Special Conditions"}),e(s,{children:"Actions"})]})}),e(O,{children:g.length>0?g.map(a=>t(L,{children:[e(s,{children:a.type}),e(s,{children:a.days}),e(s,{children:a.eligibility}),e(s,{children:t(M,{children:[e(R,{checked:!0,sx:{color:a.carry_forward?"green":"red","&.Mui-checked":{color:a.carry_forward?"green":"red"}},disabled:!0}),a.carry_forward?"Yes":"No"]})}),e(s,{children:t(M,{children:[e(R,{checked:!0,sx:{color:a.earned_leave?"green":"red","&.Mui-checked":{color:a.earned_leave?"green":"red"}},disabled:!0}),a.earned_leave?"Yes":"No"]})}),e(s,{children:a.special_conditions?a.special_conditions:"N/A"}),t(s,{children:[e(w,{variant:"outlined",color:"primary",onClick:()=>Y(a.id),sx:{marginRight:1},children:"Edit"}),e(w,{variant:"outlined",color:"secondary",onClick:()=>G(a.id),children:"Delete"})]})]},a.id)):e(L,{children:e(s,{colSpan:7,align:"center",children:"No leave types available."})})})]})})})]})})})]})};X.layout=v=>e(V,{children:v});export{X as default};