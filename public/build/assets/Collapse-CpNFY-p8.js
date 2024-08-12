import{e as Z,g as tt,s as T,_ as o,i as et,t as nt,v as it,j as ot,u as rt,w as st,x as at,q as lt,m as pt,y as P}from"./App-BAtq0dKA.js";import{r as y,j as C}from"./app-CYJc101Q.js";function dt(n){return Z("MuiCollapse",n)}tt("MuiCollapse",["root","horizontal","vertical","entered","hidden","wrapper","wrapperInner"]);const ct=["addEndListener","children","className","collapsedSize","component","easing","in","onEnter","onEntered","onEntering","onExit","onExited","onExiting","orientation","style","timeout","TransitionComponent"],ut=n=>{const{orientation:e,classes:r}=n,d={root:["root",`${e}`],entered:["entered"],hidden:["hidden"],wrapper:["wrapper",`${e}`],wrapperInner:["wrapperInner",`${e}`]};return pt(d,dt,r)},ht=T("div",{name:"MuiCollapse",slot:"Root",overridesResolver:(n,e)=>{const{ownerState:r}=n;return[e.root,e[r.orientation],r.state==="entered"&&e.entered,r.state==="exited"&&!r.in&&r.collapsedSize==="0px"&&e.hidden]}})(({theme:n,ownerState:e})=>o({height:0,overflow:"hidden",transition:n.transitions.create("height")},e.orientation==="horizontal"&&{height:"auto",width:0,transition:n.transitions.create("width")},e.state==="entered"&&o({height:"auto",overflow:"visible"},e.orientation==="horizontal"&&{width:"auto"}),e.state==="exited"&&!e.in&&e.collapsedSize==="0px"&&{visibility:"hidden"})),mt=T("div",{name:"MuiCollapse",slot:"Wrapper",overridesResolver:(n,e)=>e.wrapper})(({ownerState:n})=>o({display:"flex",width:"100%"},n.orientation==="horizontal"&&{width:"auto",height:"100%"})),gt=T("div",{name:"MuiCollapse",slot:"WrapperInner",overridesResolver:(n,e)=>e.wrapperInner})(({ownerState:n})=>o({width:"100%"},n.orientation==="horizontal"&&{width:"auto",height:"100%"})),ft=y.forwardRef(function(e,r){const d=et({props:e,name:"MuiCollapse"}),{addEndListener:S,children:U,className:_,collapsedSize:g="0px",component:b,easing:D,in:$,onEnter:j,onEntered:W,onEntering:I,onExit:M,onExited:A,onExiting:F,orientation:H="vertical",style:z,timeout:a=nt.standard,TransitionComponent:q=it}=d,k=ot(d,ct),f=o({},d,{orientation:H,collapsedSize:g}),c=ut(f),L=rt(),B=st(),l=y.useRef(null),v=y.useRef(),x=typeof g=="number"?`${g}px`:g,u=H==="horizontal",h=u?"width":"height",E=y.useRef(null),G=at(r,E),p=t=>i=>{if(t){const s=E.current;i===void 0?t(s):t(s,i)}},R=()=>l.current?l.current[u?"clientWidth":"clientHeight"]:0,J=p((t,i)=>{l.current&&u&&(l.current.style.position="absolute"),t.style[h]=x,j&&j(t,i)}),K=p((t,i)=>{const s=R();l.current&&u&&(l.current.style.position="");const{duration:m,easing:w}=P({style:z,timeout:a,easing:D},{mode:"enter"});if(a==="auto"){const N=L.transitions.getAutoHeightDuration(s);t.style.transitionDuration=`${N}ms`,v.current=N}else t.style.transitionDuration=typeof m=="string"?m:`${m}ms`;t.style[h]=`${s}px`,t.style.transitionTimingFunction=w,I&&I(t,i)}),O=p((t,i)=>{t.style[h]="auto",W&&W(t,i)}),Q=p(t=>{t.style[h]=`${R()}px`,M&&M(t)}),V=p(A),X=p(t=>{const i=R(),{duration:s,easing:m}=P({style:z,timeout:a,easing:D},{mode:"exit"});if(a==="auto"){const w=L.transitions.getAutoHeightDuration(i);t.style.transitionDuration=`${w}ms`,v.current=w}else t.style.transitionDuration=typeof s=="string"?s:`${s}ms`;t.style[h]=x,t.style.transitionTimingFunction=m,F&&F(t)}),Y=t=>{a==="auto"&&B.start(v.current||0,t),S&&S(E.current,t)};return C.jsx(q,o({in:$,onEnter:J,onEntered:O,onEntering:K,onExit:Q,onExited:V,onExiting:X,addEndListener:Y,nodeRef:E,timeout:a==="auto"?null:a},k,{children:(t,i)=>C.jsx(ht,o({as:b,className:lt(c.root,_,{entered:c.entered,exited:!$&&x==="0px"&&c.hidden}[t]),style:o({[u?"minWidth":"minHeight"]:x},z),ref:G},i,{ownerState:o({},f,{state:t}),children:C.jsx(mt,{ownerState:o({},f,{state:t}),className:c.wrapper,ref:l,children:C.jsx(gt,{ownerState:o({},f,{state:t}),className:c.wrapperInner,children:U})})}))}))});ft.muiSupportAuto=!0;export{ft as C};