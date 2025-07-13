import{N as j,M as w,s as U,_ as z,v as o,t as g,w as E,a3 as c,x as I,a7 as D,a8 as M}from"./App-xKIEJnfh.js";import{r as F,i as v}from"./app-ICdw8XZW.js";function K(r){return j("MuiCircularProgress",r)}w("MuiCircularProgress",["root","determinate","indeterminate","colorPrimary","colorSecondary","svg","circle","circleDeterminate","circleIndeterminate","circleDisableShrink"]);const W=["className","color","disableShrink","size","style","thickness","value","variant"];let l=r=>r,P,S,b,$;const t=44,B=M(P||(P=l`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`)),G=M(S||(S=l`
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }

  100% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -125px;
  }
`)),L=r=>{const{classes:e,variant:s,color:a,disableShrink:d}=r,u={root:["root",s,`color${c(a)}`],svg:["svg"],circle:["circle",`circle${c(s)}`,d&&"circleDisableShrink"]};return I(u,K,e)},V=g("span",{name:"MuiCircularProgress",slot:"Root",overridesResolver:(r,e)=>{const{ownerState:s}=r;return[e.root,e[s.variant],e[`color${c(s.color)}`]]}})(({ownerState:r,theme:e})=>o({display:"inline-block"},r.variant==="determinate"&&{transition:e.transitions.create("transform")},r.color!=="inherit"&&{color:(e.vars||e).palette[r.color].main}),({ownerState:r})=>r.variant==="indeterminate"&&D(b||(b=l`
      animation: ${0} 1.4s linear infinite;
    `),B)),Z=g("svg",{name:"MuiCircularProgress",slot:"Svg",overridesResolver:(r,e)=>e.svg})({display:"block"}),q=g("circle",{name:"MuiCircularProgress",slot:"Circle",overridesResolver:(r,e)=>{const{ownerState:s}=r;return[e.circle,e[`circle${c(s.variant)}`],s.disableShrink&&e.circleDisableShrink]}})(({ownerState:r,theme:e})=>o({stroke:"currentColor"},r.variant==="determinate"&&{transition:e.transitions.create("stroke-dashoffset")},r.variant==="indeterminate"&&{strokeDasharray:"80px, 200px",strokeDashoffset:0}),({ownerState:r})=>r.variant==="indeterminate"&&!r.disableShrink&&D($||($=l`
      animation: ${0} 1.4s ease-in-out infinite;
    `),G)),J=F.forwardRef(function(e,s){const a=U({props:e,name:"MuiCircularProgress"}),{className:d,color:u="primary",disableShrink:_=!1,size:m=40,style:R,thickness:i=3.6,value:p=0,variant:k="indeterminate"}=a,N=z(a,W),n=o({},a,{color:u,disableShrink:_,size:m,thickness:i,value:p,variant:k}),f=L(n),h={},x={},y={};if(k==="determinate"){const C=2*Math.PI*((t-i)/2);h.strokeDasharray=C.toFixed(3),y["aria-valuenow"]=Math.round(p),h.strokeDashoffset=`${((100-p)/100*C).toFixed(3)}px`,x.transform="rotate(-90deg)"}return v.jsx(V,o({className:E(f.root,d),style:o({width:m,height:m},x,R),ownerState:n,ref:s,role:"progressbar"},y,N,{children:v.jsx(Z,{className:f.svg,ownerState:n,viewBox:`${t/2} ${t/2} ${t} ${t}`,children:v.jsx(q,{className:f.circle,style:h,ownerState:n,cx:t,cy:t,r:(t-i)/2,fill:"none",strokeWidth:i})})}))});export{J as C};
