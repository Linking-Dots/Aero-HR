import{r as i,W as h,j as t,a as r,Y as w}from"./app-CkW2VGJ3.js";import{I as x,d as y,a as C}from"./VisibilityOff-yStY27gd.js";import{B as a,G as o,T as d,C as b,a as g,I as v,b as P,A as j}from"./App-B5ClDIJV.js";import{T}from"./TextField-BWuVAdK-.js";import{L as A}from"./LoadingButton-Cf1gk9VB.js";import"./Select-BJM7bxqT.js";import"./CircularProgress-xAMr4Z2z.js";function _(){const[s,l]=i.useState(!1),{data:p,setData:c,post:m,processing:u,errors:n,reset:f}=h({password:""});return i.useEffect(()=>()=>{f("password")},[]),t(j,{children:[r(w,{title:"Confirm Password"}),r(P,{maxWidth:"sm",children:r(a,{sx:{display:"flex",justifyContent:"center",p:2},children:t(o,{container:!0,spacing:2,justifyContent:"center",children:[t(o,{item:!0,xs:12,textAlign:"center",children:[r(d,{variant:"h5",color:"primary",children:"Confirm Password"}),r(d,{variant:"body2",color:"text.secondary",className:"mb-4",children:"This is a secure area of the application. Please confirm your password before continuing."})]}),r(o,{item:!0,xs:12,children:r(b,{children:r(g,{children:t("form",{onSubmit:e=>{e.preventDefault(),m(route("password.confirm"))},children:[r(a,{mb:3,children:r(T,{label:"Password",variant:"outlined",type:s?"text":"password",id:"password",name:"password",value:p.password,onChange:e=>c("password",e.target.value),required:!0,fullWidth:!0,error:!!n.password,helperText:n.password,InputProps:{endAdornment:r(x,{position:"end",children:r(v,{"aria-label":"toggle password visibility",onClick:()=>l(!s),onMouseDown:e=>e.preventDefault(),edge:"end",children:s?r(y,{}):r(C,{})})})}})}),r(a,{mt:4,display:"flex",justifyContent:"flex-end",children:r(A,{variant:"contained",color:"primary",type:"submit",loading:u,children:"Confirm"})})]})})})})]})})})]})}export{_ as default};