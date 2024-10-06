import{r as u,K as nt,ac as lt,ad as it,t as ct,ae as st,L as dt,o as ut,P as vt,w as ft,q as O,j as M,a,b as L,af as Le,ag as mt,G as ht,ah as pt,ai as $t,aj as Se,ak as _t,al as gt,am as bt,an as xt,ao as yt}from"./app-C7dxTOwK.js";import{p as He,q as c,v,r as d,s as w,u as ke,av as D,aw as St,g as Mt,c as jt,$ as Me,a0 as I,ax as V,a2 as A,ay as wt,B as E,t as zt,az as Rt,aA as Ct}from"./vendor-CaUsQwso.js";const Lt=He(c.jsx("path",{d:"m12 8-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"}),"ExpandLess"),Ht=He(c.jsx("path",{d:"M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z"}),"ExpandMore");var F={},kt=v;Object.defineProperty(F,"__esModule",{value:!0});var Pe=F.default=void 0,Pt=kt(u()),Et=c;Pe=F.default=(0,Pt.default)((0,Et.jsx)("path",{d:"M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"}),"Close");const Dt=new Set(["Arab","Syrc","Samr","Mand","Thaa","Mend","Nkoo","Adlm","Rohg","Hebr"]),It=new Set(["ae","ar","arc","bcc","bqi","ckb","dv","fa","glk","he","ku","mzn","nqo","pnb","ps","sd","ug","ur","yi"]);function Ee(e){if(Intl.Locale){let r=new Intl.Locale(e).maximize(),o=typeof r.getTextInfo=="function"?r.getTextInfo():r.textInfo;if(o)return o.direction==="rtl";if(r.script)return Dt.has(r.script)}let t=e.split("-")[0];return It.has(t)}const Vt=Symbol.for("react-aria.i18n.locale");function De(){let e=typeof window<"u"&&window[Vt]||typeof navigator<"u"&&(navigator.language||navigator.userLanguage)||"en-US";try{Intl.DateTimeFormat.supportedLocalesOf([e])}catch{e="en-US"}return{locale:e,direction:Ee(e)?"rtl":"ltr"}}let q=De(),C=new Set;function je(){q=De();for(let e of C)e(q)}function At(){let e=nt(),[t,r]=d.useState(q);return d.useEffect(()=>(C.size===0&&window.addEventListener("languagechange",je),C.add(r),()=>{C.delete(r),C.size===0&&window.removeEventListener("languagechange",je)}),[]),e?{locale:"en-US",direction:"ltr"}:t}const Ot=w.createContext(null);function qt(e){let{locale:t,children:r}=e,o=At(),l=w.useMemo(()=>t?{locale:t,direction:Ee(t)?"rtl":"ltr"}:o,[o,t]);return w.createElement(Ot.Provider,{value:l},r)}function Tt(e){if(Bt())e.focus({preventScroll:!0});else{let t=Kt(e);e.focus(),Nt(t)}}let P=null;function Bt(){if(P==null){P=!1;try{document.createElement("div").focus({get preventScroll(){return P=!0,!0}})}catch{}}return P}function Kt(e){let t=e.parentNode,r=[],o=document.scrollingElement||document.documentElement;for(;t instanceof HTMLElement&&t!==o;)(t.offsetHeight<t.scrollHeight||t.offsetWidth<t.scrollWidth)&&r.push({element:t,scrollTop:t.scrollTop,scrollLeft:t.scrollLeft}),t=t.parentNode;return o instanceof HTMLElement&&r.push({element:o,scrollTop:o.scrollTop,scrollLeft:o.scrollLeft}),r}function Nt(e){for(let{element:t,scrollTop:r,scrollLeft:o}of e)t.scrollTop=r,t.scrollLeft=o}function Q(e){var t;return typeof window>"u"||window.navigator==null?!1:((t=window.navigator.userAgentData)===null||t===void 0?void 0:t.brands.some(r=>e.test(r.brand)))||e.test(window.navigator.userAgent)}function Ie(e){var t;return typeof window<"u"&&window.navigator!=null?e.test(((t=window.navigator.userAgentData)===null||t===void 0?void 0:t.platform)||window.navigator.platform):!1}function T(){return Ie(/^Mac/i)}function Wt(){return Ie(/^iPad/i)||T()&&navigator.maxTouchPoints>1}function Ut(){return Q(/AppleWebKit/i)&&!Gt()}function Gt(){return Q(/Chrome/i)}function Ft(){return Q(/Firefox/i)}const Qt=d.createContext({isNative:!0,open:Yt,useHref:e=>e});function Jt(e){let{children:t,navigate:r,useHref:o}=e,l=d.useMemo(()=>({isNative:!1,open:(f,s,m,h)=>{Ve(f,n=>{Xt(n,s)?r(m,h):H(n,s)})},useHref:o||(f=>f)}),[r,o]);return w.createElement(Qt.Provider,{value:l},t)}function Xt(e,t){let r=e.getAttribute("target");return(!r||r==="_self")&&e.origin===location.origin&&!e.hasAttribute("download")&&!t.metaKey&&!t.ctrlKey&&!t.altKey&&!t.shiftKey}function H(e,t,r=!0){var o,l;let{metaKey:f,ctrlKey:s,altKey:m,shiftKey:h}=t;Ft()&&(!((l=window.event)===null||l===void 0||(o=l.type)===null||o===void 0)&&o.startsWith("key"))&&e.target==="_blank"&&(T()?f=!0:s=!0);let n=Ut()&&T()&&!Wt()?new KeyboardEvent("keydown",{keyIdentifier:"Enter",metaKey:f,ctrlKey:s,altKey:m,shiftKey:h}):new MouseEvent("click",{metaKey:f,ctrlKey:s,altKey:m,shiftKey:h,bubbles:!0,cancelable:!0});H.isOpening=r,Tt(e),e.dispatchEvent(n),H.isOpening=!1}H.isOpening=!1;function Ve(e,t){if(e instanceof HTMLAnchorElement)t(e);else if(e.hasAttribute("data-href")){let r=document.createElement("a");r.href=e.getAttribute("data-href"),e.hasAttribute("data-target")&&(r.target=e.getAttribute("data-target")),e.hasAttribute("data-rel")&&(r.rel=e.getAttribute("data-rel")),e.hasAttribute("data-download")&&(r.download=e.getAttribute("data-download")),e.hasAttribute("data-ping")&&(r.ping=e.getAttribute("data-ping")),e.hasAttribute("data-referrer-policy")&&(r.referrerPolicy=e.getAttribute("data-referrer-policy")),e.appendChild(r),t(r),e.removeChild(r)}}function Yt(e,t){Ve(e,r=>H(r,t))}const B=w.createContext(null);function Zt(e){let{children:t}=e,r=d.useContext(B),[o,l]=d.useState(0),f=d.useMemo(()=>({parent:r,modalCount:o,addModal(){l(s=>s+1),r&&r.addModal()},removeModal(){l(s=>s-1),r&&r.removeModal()}}),[r,o]);return w.createElement(B.Provider,{value:f},t)}function ea(){let e=d.useContext(B);return{modalProviderProps:{"aria-hidden":e&&e.modalCount>0?!0:null}}}function ta(e){let{modalProviderProps:t}=ea();return w.createElement("div",{"data-overlay-container":!0,...e,...t})}function aa(e){return w.createElement(Zt,null,w.createElement(ta,e))}var ra=({children:e,navigate:t,useHref:r,disableAnimation:o=!1,disableRipple:l=!1,skipFramerMotionAnimations:f=o,validationBehavior:s="aria",locale:m="en-US",defaultDates:h,createCalendar:n,...i})=>{let p=e;t&&(p=c.jsx(Jt,{navigate:t,useHref:r,children:p}));const $=d.useMemo(()=>(o&&f&&(it.skipAnimations=!0),{createCalendar:n,defaultDates:h,disableAnimation:o,disableRipple:l,validationBehavior:s}),[n,h==null?void 0:h.maxDate,h==null?void 0:h.minDate,o,l,s]);return c.jsx(lt,{value:$,children:c.jsx(qt,{locale:m,children:c.jsx(aa,{...i,children:p})})})},oa=["data-[top-scroll=true]:[mask-image:linear-gradient(0deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]","data-[bottom-scroll=true]:[mask-image:linear-gradient(180deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]","data-[top-bottom-scroll=true]:[mask-image:linear-gradient(#000,#000,transparent_0,#000_var(--scroll-shadow-size),#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]"],na=["data-[left-scroll=true]:[mask-image:linear-gradient(270deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]","data-[right-scroll=true]:[mask-image:linear-gradient(90deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]","data-[left-right-scroll=true]:[mask-image:linear-gradient(to_right,#000,#000,transparent_0,#000_var(--scroll-shadow-size),#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]"],we=ct({base:[],variants:{orientation:{vertical:["overflow-y-auto",...oa],horizontal:["overflow-x-auto",...na]},hideScrollBar:{true:"scrollbar-hide",false:""}},defaultVariants:{orientation:"vertical",hideScrollBar:!1}});function la(e={}){const{domRef:t,isEnabled:r=!0,overflowCheck:o="vertical",visibility:l="auto",offset:f=0,onVisibilityChange:s,updateDeps:m=[]}=e,h=d.useRef(l);d.useEffect(()=>{const n=t==null?void 0:t.current;if(!n||!r)return;const i=(b,_,y,g,x)=>{if(l==="auto"){const S=`${g}${st(x)}Scroll`;_&&y?(n.dataset[S]="true",n.removeAttribute(`data-${g}-scroll`),n.removeAttribute(`data-${x}-scroll`)):(n.dataset[`${g}Scroll`]=_.toString(),n.dataset[`${x}Scroll`]=y.toString(),n.removeAttribute(`data-${g}-${x}-scroll`))}else{const S=_&&y?"both":_?g:y?x:"none";S!==h.current&&(s==null||s(S),h.current=S)}},p=()=>{const b=[{type:"vertical",prefix:"top",suffix:"bottom"},{type:"horizontal",prefix:"left",suffix:"right"}];for(const{type:_,prefix:y,suffix:g}of b)if(o===_||o==="both"){const x=_==="vertical"?n.scrollTop>f:n.scrollLeft>f,S=_==="vertical"?n.scrollTop+n.clientHeight+f<n.scrollHeight:n.scrollLeft+n.clientWidth+f<n.scrollWidth;i(_,x,S,y,g)}},$=()=>{["top","bottom","top-bottom","left","right","left-right"].forEach(b=>{n.removeAttribute(`data-${b}-scroll`)})};return p(),n.addEventListener("scroll",p),l!=="auto"&&($(),l==="both"?(n.dataset.topBottomScroll=String(o==="vertical"),n.dataset.leftRightScroll=String(o==="horizontal")):(n.dataset.topBottomScroll="false",n.dataset.leftRightScroll="false",["top","bottom","left","right"].forEach(b=>{n.dataset[`${b}Scroll`]=String(l===b)}))),()=>{n.removeEventListener("scroll",p),$()}},[...m,r,l,o,s,t])}function ia(e){var t;const[r,o]=dt(e,we.variantKeys),{ref:l,as:f,children:s,className:m,style:h,size:n=40,offset:i=0,visibility:p="auto",isEnabled:$=!0,onVisibilityChange:b,..._}=r,y=f||"div",g=ut(l);la({domRef:g,offset:i,visibility:p,isEnabled:$,onVisibilityChange:b,updateDeps:[s],overflowCheck:(t=e.orientation)!=null?t:"vertical"});const x=d.useMemo(()=>we({...o,className:m}),[vt(o),m]);return{Component:y,styles:x,domRef:g,children:s,getBaseProps:(z={})=>{var k;return{ref:g,className:x,"data-orientation":(k=e.orientation)!=null?k:"vertical",style:{"--scroll-shadow-size":`${n}px`,...h,...z.style},..._,...z}}}}var Ae=ft((e,t)=>{const{Component:r,children:o,getBaseProps:l}=ia({...e,ref:t});return c.jsx(r,{...l(),children:o})});Ae.displayName="NextUI.ScrollShadow";var ca=Ae,J={},sa=v;Object.defineProperty(J,"__esModule",{value:!0});var Oe=J.default=void 0,da=sa(u()),ua=c;Oe=J.default=(0,da.default)((0,ua.jsx)("path",{d:"M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4z"}),"AddBox");var X={},va=v;Object.defineProperty(X,"__esModule",{value:!0});var qe=X.default=void 0,fa=va(u()),ma=c;qe=X.default=(0,fa.default)((0,ma.jsx)("path",{d:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6m0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20"}),"AccountCircle");const ha=({auth:e,contentRef:t,setBottomNavHeight:r})=>{const o=ke(),{url:l}=O(),[f,s]=d.useState(0),m=d.useRef(null),h=()=>{if(m.current){const i=m.current.clientHeight;r(i)}};d.useEffect(()=>(h(),window.addEventListener("resize",h),()=>window.removeEventListener("resize",h)),[]),d.useEffect(()=>{l.includes("/daily-works")?s(1):l.includes("/dashboard")?s(0):l.includes(`/profile/${e.user.id}`)&&s(2)},[l,e.user.id]);const n=(i,p)=>{s(p)};return M(St,{ref:m,sx:{position:"fixed",bottom:0,left:0,right:0,zIndex:1200,display:{xs:"flex",md:"none"},backdropFilter:"blur(16px) saturate(200%)",backgroundColor:o.glassCard.backgroundColor},elevation:3,showLabels:!0,value:f,onChange:n,children:[a(D,{component:L,href:"/dashboard",label:"Home",icon:a(Le,{})}),a(D,{component:L,href:"/daily-works",label:"Tasks",icon:a(Oe,{})}),a(D,{component:L,href:route("profile",{user:e.user.id}),label:"Profile",icon:a(qe,{})})]})};var Y={},pa=v;Object.defineProperty(Y,"__esModule",{value:!0});var Z=Y.default=void 0,$a=pa(u()),_a=c;Z=Y.default=(0,$a.default)((0,_a.jsx)("path",{d:"M3 13h8V3H3zm0 8h8v-6H3zm10 0h8V11h-8zm0-18v6h8V3z"}),"Dashboard");var ee={},ga=v;Object.defineProperty(ee,"__esModule",{value:!0});var K=ee.default=void 0,ba=ga(u()),xa=c;K=ee.default=(0,ba.default)((0,xa.jsx)("path",{d:"M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3m-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3m0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5m8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5"}),"People");var te={},ya=v;Object.defineProperty(te,"__esModule",{value:!0});var N=te.default=void 0,Sa=ya(u()),Ma=c;N=te.default=(0,Sa.default)((0,Ma.jsx)("path",{d:"M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 18H4V8h16z"}),"CalendarToday");var ae={},ja=v;Object.defineProperty(ae,"__esModule",{value:!0});var W=ae.default=void 0,wa=ja(u()),za=c;W=ae.default=(0,wa.default)((0,za.jsx)("path",{d:"M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2m-6 0h-4V4h4z"}),"Work");var re={},Ra=v;Object.defineProperty(re,"__esModule",{value:!0});var Te=re.default=void 0,Ca=Ra(u()),La=c;Te=re.default=(0,Ca.default)((0,La.jsx)("path",{d:"M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6"}),"Settings");var oe={},Ha=v;Object.defineProperty(oe,"__esModule",{value:!0});var U=oe.default=void 0,ka=Ha(u()),Pa=c;U=oe.default=(0,ka.default)((0,Pa.jsx)("path",{d:"M19 5v14H5V5zm1.1-2H3.9c-.5 0-.9.4-.9.9v16.2c0 .4.4.9.9.9h16.2c.4 0 .9-.5.9-.9V3.9c0-.5-.5-.9-.9-.9M11 7h6v2h-6zm0 4h6v2h-6zm0 4h6v2h-6zM7 7h2v2H7zm0 4h2v2H7zm0 4h2v2H7z"}),"ListAlt");var ne={},Ea=v;Object.defineProperty(ne,"__esModule",{value:!0});var Be=ne.default=void 0,Da=Ea(u()),Ia=c;Be=ne.default=(0,Da.default)((0,Ia.jsx)("path",{d:"M3 13h2v-2H3zm0 4h2v-2H3zm0-8h2V7H3zm4 4h14v-2H7zm0 4h14v-2H7zM7 7v2h14V7z"}),"List");var le={},Va=v;Object.defineProperty(le,"__esModule",{value:!0});var Ke=le.default=void 0,Aa=Va(u()),Oa=c;Ke=le.default=(0,Aa.default)((0,Oa.jsx)("path",{d:"M17 10H7v2h10zm2-7h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 16H5V8h14zm-5-5H7v2h7z"}),"EventNote");var ie={},qa=v;Object.defineProperty(ie,"__esModule",{value:!0});var G=ie.default=void 0,Ta=qa(u()),Ba=c;G=ie.default=(0,Ta.default)((0,Ba.jsx)("path",{d:"m17 7-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4z"}),"Logout");var ce={},Ka=v;Object.defineProperty(ce,"__esModule",{value:!0});var Ne=ce.default=void 0,Na=Ka(u()),Wa=c;Ne=ce.default=(0,Na.default)((0,Wa.jsx)("path",{d:"M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3m-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3m0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5m8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5"}),"Group");const ze=e=>[{name:"Dashboard",icon:a(Z,{}),route:"dashboard"},{name:"Leaves",icon:a(G,{}),route:"leaves-employee"},{name:"Attendances",icon:a(N,{}),route:"attendance-employee"},...e.includes("read employee")?[{name:"Employees",icon:a(K,{}),subMenu:[...e.includes("read employee")?[{name:"All Employees",icon:a(K,{sx:{ml:2}}),route:"employees"}]:[],...e.includes("read holidays")?[{name:"Holidays",icon:a(Ke,{sx:{ml:2}}),route:"holidays"}]:[],...e.includes("read leaves")?[{name:"Leaves (Admin)",icon:a(G,{sx:{ml:2}}),route:"leaves",badge:{content:"1",className:"badge rounded-pill bg-primary float-end"}}]:[],...e.includes("read leaves")?[{name:"Leave Settings",icon:a(Te,{sx:{ml:2}}),route:"leave-settings"}]:[],...e.includes("read attendances")?[{name:"Attendances (Admin)",icon:a(N,{sx:{ml:2}}),route:"attendances"}]:[],...e.includes("read departments")?[{name:"Departments",icon:a(Le,{sx:{ml:2}}),route:"departments"}]:[],...e.includes("read designations")?[{name:"Designations",icon:a(W,{sx:{ml:2}}),route:"designations"}]:[],...e.includes("read timesheet")?[{name:"Timesheet",icon:a(U,{sx:{ml:2}}),route:"timesheet"}]:[]]}]:[],{name:"Projects",icon:a(W,{}),subMenu:[{name:"Daily Works",icon:a(U,{sx:{ml:2}}),route:"dailyWorks"},{name:"Daily Work Summary",icon:a(Be,{sx:{ml:2}}),route:"dailyWorkSummary"}]},...e.includes("read users")?[{name:"Users",icon:a(Ne,{}),route:"users"}]:[],...e.includes("read settings")?[{name:"Settings",icon:a(mt,{}),route:"company-settings"}]:[]];var se={},Ua=v;Object.defineProperty(se,"__esModule",{value:!0});var We=se.default=void 0,Ga=Ua(u()),Fa=c;We=se.default=(0,Ga.default)((0,Fa.jsx)("path",{d:"M12 7V3H2v18h20V7zM6 19H4v-2h2zm0-4H4v-2h2zm0-4H4V9h2zm0-4H4V5h2zm4 12H8v-2h2zm0-4H8v-2h2zm0-4H8V9h2zm0-4H8V5h2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8zm-2-8h-2v2h2zm0 4h-2v2h2z"}),"Business");var de={},Qa=v;Object.defineProperty(de,"__esModule",{value:!0});var Ue=de.default=void 0,Ja=Qa(u()),Re=c;Ue=de.default=(0,Ja.default)([(0,Re.jsx)("path",{d:"M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8"},"0"),(0,Re.jsx)("path",{d:"M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"},"1")],"AccessTime");var ue={},Xa=v;Object.defineProperty(ue,"__esModule",{value:!0});var Ge=ue.default=void 0,Ya=Xa(u()),Za=c;Ge=ue.default=(0,Ya.default)((0,Za.jsx)("path",{d:"M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2M8.5 13.5l2.5 3.01L14.5 12l4.5 6H5z"}),"Photo");var ve={},er=v;Object.defineProperty(ve,"__esModule",{value:!0});var Fe=ve.default=void 0,tr=er(u()),ar=c;Fe=ve.default=(0,tr.default)((0,ar.jsx)("path",{d:"M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2"}),"VpnKey");var fe={},rr=v;Object.defineProperty(fe,"__esModule",{value:!0});var Qe=fe.default=void 0,or=rr(u()),nr=c;Qe=fe.default=(0,or.default)((0,nr.jsx)("path",{d:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5v-2h-5c-4.34 0-8-3.66-8-8s3.66-8 8-8 8 3.66 8 8v1.43c0 .79-.71 1.57-1.5 1.57s-1.5-.78-1.5-1.57V12c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.38 0 2.64-.56 3.54-1.47.65.89 1.77 1.47 2.96 1.47 1.97 0 3.5-1.6 3.5-3.57V12c0-5.52-4.48-10-10-10m0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3"}),"AlternateEmail");var me={},lr=v;Object.defineProperty(me,"__esModule",{value:!0});var Je=me.default=void 0,ir=lr(u()),cr=c;Je=me.default=(0,ir.default)((0,cr.jsx)("path",{d:"M4 9h4v11H4zm12 4h4v7h-4zm-6-9h4v16h-4z"}),"BarChart");var he={},sr=v;Object.defineProperty(he,"__esModule",{value:!0});var Xe=he.default=void 0,dr=sr(u()),ur=c;Xe=he.default=(0,dr.default)((0,ur.jsx)("path",{d:"M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97z"}),"ThumbUpAlt");var pe={},vr=v;Object.defineProperty(pe,"__esModule",{value:!0});var Ye=pe.default=void 0,fr=vr(u()),mr=c;Ye=pe.default=(0,fr.default)((0,mr.jsx)("path",{d:"M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"}),"Edit");var $e={},hr=v;Object.defineProperty($e,"__esModule",{value:!0});var Ze=$e.default=void 0,pr=hr(u()),$r=c;Ze=$e.default=(0,pr.default)((0,$r.jsx)("path",{d:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16"}),"MonetizationOn");var _e={},_r=v;Object.defineProperty(_e,"__esModule",{value:!0});var et=_e.default=void 0,gr=_r(u()),br=c;et=_e.default=(0,gr.default)((0,br.jsx)("path",{d:"M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2m6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1z"}),"Notifications");var ge={},xr=v;Object.defineProperty(ge,"__esModule",{value:!0});var tt=ge.default=void 0,yr=xr(u()),Sr=c;tt=ge.default=(0,yr.default)((0,Sr.jsx)("path",{d:"M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2m-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2m3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1z"}),"Lock");var be={},Mr=v;Object.defineProperty(be,"__esModule",{value:!0});var at=be.default=void 0,jr=Mr(u()),wr=c;at=be.default=(0,jr.default)((0,wr.jsx)("path",{d:"m22.7 19-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4"}),"Build");var xe={},zr=v;Object.defineProperty(xe,"__esModule",{value:!0});var rt=xe.default=void 0,Rr=zr(u()),Cr=c;rt=xe.default=(0,Rr.default)((0,Cr.jsx)("path",{d:"M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2M6 9h12v2H6zm8 5H6v-2h8zm4-6H6V6h12z"}),"Chat");var ye={},Lr=v;Object.defineProperty(ye,"__esModule",{value:!0});var ot=ye.default=void 0,Hr=Lr(u()),kr=c;ot=ye.default=(0,Hr.default)((0,kr.jsx)("path",{d:"M9.19 6.35c-2.04 2.29-3.44 5.58-3.57 5.89L2 10.69l4.05-4.05c.47-.47 1.15-.68 1.81-.55zM11.17 17s3.74-1.55 5.89-3.7c5.4-5.4 4.5-9.62 4.21-10.57-.95-.3-5.17-1.19-10.57 4.21C8.55 9.09 7 12.83 7 12.83zm6.48-2.19c-2.29 2.04-5.58 3.44-5.89 3.57L13.31 22l4.05-4.05c.47-.47.68-1.15.55-1.81zM9 18c0 .83-.34 1.58-.88 2.12C6.94 21.3 2 22 2 22s.7-4.94 1.88-6.12C4.42 15.34 5.17 15 6 15c1.66 0 3 1.34 3 3m4-9c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2"}),"RocketLaunch");const Ce=()=>[{name:"Back to Dashboard",icon:a(Z,{}),route:"dashboard"},{name:"Company Settings",icon:a(We,{}),route:"company-settings",active:!0},{name:"Localization",icon:a(Ue,{}),route:"employees"},{name:"Theme Settings",icon:a(Ge,{}),route:"employees"},{name:"Roles & Permissions",icon:a(Fe,{}),route:"roles-settings"},{name:"Email Settings",icon:a(Qe,{}),route:"employees"},{name:"Performance Settings",icon:a(Je,{}),route:"employees"},{name:"Approval Settings",icon:a(Xe,{}),route:"employees"},{name:"Invoice Settings",icon:a(Ye,{}),route:"employees"},{name:"Salary Settings",icon:a(Ze,{}),route:"employees"},{name:"Notifications",icon:a(et,{}),route:"employees"},{name:"Change Password",icon:a(tt,{}),route:"employees"},{name:"Leave Type",icon:a(at,{}),route:"employees"},{name:"ToxBox Settings",icon:a(rt,{}),route:"employees"},{name:"Cron Settings",icon:a(ot,{}),route:"employees"}],Pr=({toggleSideBar:e,pages:t,url:r})=>{const o=ke(),[l,f]=d.useState(null),[s,m]=d.useState(r),h=i=>{f(p=>p===i?null:i)},n=i=>{m(i),h(i)};return a(E,{sx:{p:2,height:"100%"},children:M(ht,{children:[a(Mt,{}),a(jt,{sx:{position:"absolute",zIndex:1,top:8,right:8,color:o.palette.text.primary},size:"large",onClick:e,children:a(Pe,{})}),a(Me,{children:t.map(i=>i.subMenu?M("div",{children:[M(I,{button:!0,onClick:()=>n(i.name),sx:{backgroundColor:s===i.name?o.palette.action.selected:"transparent"},children:[a(V,{children:i.icon}),a(A,{primary:i.name}),i.subMenu?l===i.name?a(Lt,{}):a(Ht,{}):null]}),i.subMenu&&a(wt,{in:l===i.name,timeout:"auto",unmountOnExit:!0,children:a(Me,{component:"div",disablePadding:!0,children:i.subMenu.map(p=>a(L,{as:"a",href:route(p.route),method:p.method||void 0,style:{alignItems:"center",color:o.palette.text.primary,textDecoration:"none"},children:M(I,{onClick:()=>m(p.name),sx:{pl:3,backgroundColor:s===p.name?o.palette.action.selected:"transparent"},button:!0,children:[a(V,{children:p.icon}),a(A,{primary:p.name})]})},p.name))})})]},i.name):a(L,{as:"a",href:route(i.route),method:i.method||void 0,style:{alignItems:"center",color:o.palette.text.primary,textDecoration:"none"},children:M(I,{button:!0,onClick:()=>m(i.name),sx:{backgroundColor:s===i.name?o.palette.action.selected:"transparent"},children:[a(V,{children:i.icon}),a(A,{primary:i.name})]})},i.name))})]})})},Er=()=>a("div",{className:"spinner-container",children:a(pt.Dots,{animation:"fade",background:"rgba(0, 0, 0, 0.5)",color:"#3498db",size:60})});function Vr({children:e}){const[t,r]=d.useState(),{auth:o}=O().props,l=o.permissions,[f,s]=d.useState(!1),[m,h]=d.useState(()=>localStorage.getItem("darkMode")==="true"),n=d.useRef(null),[i,p]=d.useState(0),{url:$}=O(),[b,_]=d.useState($),[y,g]=d.useState(()=>/setting/i.test($)?Ce():ze(l));d.useEffect(()=>{_($)},[$]),d.useEffect(()=>{g(/setting/i.test(b)?Ce():ze(l))},[b,l]),d.useEffect(()=>{localStorage.setItem("darkMode",m)},[m]);const x=()=>{h(!m)},S=()=>{s(!f)},z=$t(m),k=zt(z.breakpoints.down("md"));return Se.Inertia.on("start",()=>{r(!0)}),Se.Inertia.on("finish",j=>{r(!1)}),d.useEffect(()=>{_t().then(async j=>{try{const R=await axios.post(route("updateFcmToken"),{fcm_token:j});R.status===200&&console.log(R.data.message,": ",R.data.fcm_token)}catch(R){console.error(R)}}),gt().then(j=>{console.log("Message received. ",j),alert(j.notification.title+": "+j.notification.body)}).catch(j=>console.log("failed: ",j))},[]),a(Ct,{theme:z,children:a(ra,{children:M("main",{className:m?"dark":"light",children:[a(bt,{position:"top-center",autoClose:5e3,hideProgressBar:!1,newestOnTop:!1,closeOnClick:!0,rtl:!1,pauseOnFocusLoss:!0,draggable:!0,pauseOnHover:!0,theme:"colored"}),a(Rt,{}),t&&a(Er,{}),M(E,{sx:{display:"flex",flexDirection:"row",height:"100vh"},children:[a(E,{sx:{display:{xs:"none",md:"block"},height:"100vh",width:f?280:0,transition:"width 0.3s ease-in-out",flexDirection:"column",overflow:"hidden"},children:a(Pr,{url:$,pages:y,toggleSideBar:S})}),M(E,{ref:n,sx:{pb:`${i}px`,display:"flex",flex:1,flexDirection:"column",height:"100vh",overflow:"auto"},children:[o.user&&a(xt,{url:$,pages:y,darkMode:m,toggleDarkMode:x,sideBarOpen:f,toggleSideBar:S}),M(ca,{hideScrollBar:!0,children:[o.user&&a(yt,{}),e]}),o.user&&k&&a(ha,{setBottomNavHeight:p,contentRef:n,auth:o})]})]})]})})})}export{Vr as A,Er as L,Ye as d,ca as s};