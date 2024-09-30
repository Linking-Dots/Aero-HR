import{q as Bt,j as q,a as c,F as ge,B as jt,Y as Vt,G as Wt}from"./app-Cxczvfbl.js";import{y as ae,u as Le,af as Et,B as ye,J as Z,c as Te,ag as ie,_ as n,q as P,r as y,I as lt,ah as de,b as He,w as ke,x as Ce,ai as Ye,aj as it,ak as Pe,L as ve,al as ct,am as dt,an as J,ao as Ue,K as Ge,T as ut,ap as pt,aq as e,ar as ft,Q as bt,X as Nt,j as _t,k as $t,l as tt,m as Oe,n as Ht,O as zt,Y as Lt,Z as Ut,o as Gt,as as Kt,e as qt,g as Qt,f as Xt,a as ot,G as _e,F as Jt,h as Zt,S as eo,M as at}from"./vendor-DYJuczRe.js";import{A as to}from"./App-AT_um95D.js";import{X as oo,D as Ke,V as mt,u as Ae,C as ao,P as ro,a as so,c as no,b as qe,s as De,d as ht,e as re,S as yt,g as lo,f as Be,h as fe,M as io,i as co,j as uo,k as po,l as fo,m as rt,n as bo,o as mo,p as ho,q as yo,r as Qe,t as go,v as gt,w as Dt,L as Xe,x as Do,y as st,z as xo,A as xt,B as kt,E as ko,F as Co,G as Po,H as vo,I as wo,J as Mo}from"./minMax-C46FWTVH.js";import{d as pe}from"./dayjs.min-33VdPO6W.js";import{d as Fo,G as To}from"./GlassDialog-D8OA8o6O.js";import{D as ze,u as $e,w as Ro}from"./xlsx-4agzAUDh.js";import{L as Oo}from"./LoadingButton-BV-H27mq.js";import"./isBetween-cDr70IVw.js";const So=ae(oo)(({theme:t})=>({"& .rdt_Table":{backgroundColor:"transparent","& .rdt_TableHead":{"& .rdt_TableHeadRow":{backgroundColor:"transparent",color:t.palette.text.primary},top:0,zIndex:1},"& .rdt_TableBody":{overflowY:"auto",maxHeight:"52vh","& .rdt_TableRow":{backgroundColor:"transparent",color:t.palette.text.primary,"& .rdt_TableCol":{backgroundColor:"transparent",borderBottom:`1px solid ${t.palette.divider}`,width:"auto",whiteSpace:"nowrap"}},"& .rdt_TableRow:hover":{backgroundColor:t.palette.action.hover}}}})),Io=({filteredData:t})=>{Bt().props;const s=Le(),l=[{name:"Date",selector:o=>o.date,sortable:!0,center:!0,width:"100px"},{name:"Total Daily Works",selector:o=>o.totalDailyWorks,sortable:!0,center:!0,width:"160px"},{name:"Resubmissions",selector:o=>o.resubmissions,sortable:!0,center:!0,width:"130px"},{name:"Embankment",selector:o=>o.embankment,sortable:!0,center:!0,width:"130px"},{name:"Structure",selector:o=>o.structure,sortable:!0,center:!0,width:"130px"},{name:"Pavement",selector:o=>o.pavement,sortable:!0,center:!0,width:"130px"},{name:"Completed",selector:o=>o.completed,sortable:!0,center:!0,width:"130px"},{name:"Pending",selector:o=>o.totalDailyWorks-o.completed,sortable:!0,center:!0,width:"130px"},{name:"Completion Percentage",selector:o=>o.totalDailyWorks>0?parseFloat((o.completed/o.totalDailyWorks*100).toFixed(1)):0,sortable:!0,center:!0,width:"180px",cell:o=>{const r=o.totalDailyWorks>0?(o.completed/o.totalDailyWorks*100).toFixed(1):0;return q(ye,{sx:{textAlign:"center",color:r>=100?"green":"red"},children:[r,"%"]})}},{name:"RFI Submissions",selector:o=>o.rfiSubmissions,sortable:!0,center:!0,width:"160px"},{name:"RFI Submission Percentage",selector:o=>o.rfiSubmissions>0?parseFloat((o.rfiSubmissions/o.completed*100).toFixed(1)):0,sortable:!0,center:!0,width:"180px",cell:o=>{const r=o.rfiSubmissions>0?(o.rfiSubmissions/o.completed*100).toFixed(1):0;return q(ye,{sx:{textAlign:"center",color:r>=100?"green":"red"},children:[r,"%"]})}}];return q(ge,{children:[c(Et,{styles:{"& .cgTKyH":{backgroundColor:"transparent !important",color:s.palette.text.primary}}}),c(So,{columns:l,data:t,defaultSortField:"date",defaultSortFieldId:1,defaultSortAsc:!1,pagination:!0,highlightOnHover:!0,responsive:!0})]})},Yo=ae("div")({overflow:"hidden",width:Ke,maxHeight:mt,display:"flex",flexDirection:"column",margin:"0 auto"}),Ao=["clearable","onClear","InputProps","sx","slots","slotProps"],Bo=["ownerState"],jo=t=>{const s=Ae(),{clearable:l,onClear:o,InputProps:r,sx:a,slots:g,slotProps:v}=t,k=Z(t,Ao),w=(g==null?void 0:g.clearButton)??Te,d=ie({elementType:w,externalSlotProps:v==null?void 0:v.clearButton,ownerState:{},className:"clearButton",additionalProps:{title:s.fieldClearLabel}}),u=Z(d,Bo),f=(g==null?void 0:g.clearIcon)??ao,T=ie({elementType:f,externalSlotProps:v==null?void 0:v.clearIcon,ownerState:{}});return n({},k,{InputProps:n({},r,{endAdornment:P.jsxs(y.Fragment,{children:[l&&P.jsx(lt,{position:"end",sx:{marginRight:r!=null&&r.endAdornment?-1:-1.5},children:P.jsx(w,n({},u,{onClick:o,children:P.jsx(f,n({fontSize:"small"},T))}))}),r==null?void 0:r.endAdornment]})}),sx:[{"& .clearButton":{opacity:1},"@media (pointer: fine)":{"& .clearButton":{opacity:0},"&:hover, &:focus-within":{".clearButton":{opacity:1}}}},...Array.isArray(a)?a:[a]]})},Vo=["slots","slotProps","InputProps","inputProps"],Ct=y.forwardRef(function(s,l){const o=de({props:s,name:"MuiDateField"}),{slots:r,slotProps:a,InputProps:g,inputProps:v}=o,k=Z(o,Vo),w=o,d=(r==null?void 0:r.textField)??(s.enableAccessibleFieldDOMStructure?ro:He),u=ie({elementType:d,externalSlotProps:a==null?void 0:a.textField,externalForwardedProps:k,additionalProps:{ref:l},ownerState:w});u.inputProps=n({},v,u.inputProps),u.InputProps=n({},g,u.InputProps);const f=so(u),T=no(f),M=jo(n({},T,{slots:r,slotProps:a}));return P.jsx(d,n({},M))});function Wo(t){return Ce("MuiPickersMonth",t)}const Se=ke("MuiPickersMonth",["root","monthButton","disabled","selected"]),Eo=["autoFocus","className","children","disabled","selected","value","tabIndex","onClick","onKeyDown","onFocus","onBlur","aria-current","aria-label","monthsPerRow","slots","slotProps"],No=t=>{const{disabled:s,selected:l,classes:o}=t;return ve({root:["root"],monthButton:["monthButton",s&&"disabled",l&&"selected"]},Wo,o)},_o=ae("div",{name:"MuiPickersMonth",slot:"Root",overridesResolver:(t,s)=>[s.root]})({display:"flex",alignItems:"center",justifyContent:"center",flexBasis:"33.3%",variants:[{props:{monthsPerRow:4},style:{flexBasis:"25%"}}]}),$o=ae("button",{name:"MuiPickersMonth",slot:"MonthButton",overridesResolver:(t,s)=>[s.monthButton,{[`&.${Se.disabled}`]:s.disabled},{[`&.${Se.selected}`]:s.selected}]})(({theme:t})=>n({color:"unset",backgroundColor:"transparent",border:0,outline:0},t.typography.subtitle1,{margin:"8px 0",height:36,width:72,borderRadius:18,cursor:"pointer","&:focus":{backgroundColor:t.vars?`rgba(${t.vars.palette.action.activeChannel} / ${t.vars.palette.action.hoverOpacity})`:Ye(t.palette.action.active,t.palette.action.hoverOpacity)},"&:hover":{backgroundColor:t.vars?`rgba(${t.vars.palette.action.activeChannel} / ${t.vars.palette.action.hoverOpacity})`:Ye(t.palette.action.active,t.palette.action.hoverOpacity)},"&:disabled":{cursor:"auto",pointerEvents:"none"},[`&.${Se.disabled}`]:{color:(t.vars||t).palette.text.secondary},[`&.${Se.selected}`]:{color:(t.vars||t).palette.primary.contrastText,backgroundColor:(t.vars||t).palette.primary.main,"&:focus, &:hover":{backgroundColor:(t.vars||t).palette.primary.dark}}})),Ho=y.memo(function(s){const l=de({props:s,name:"MuiPickersMonth"}),{autoFocus:o,className:r,children:a,disabled:g,selected:v,value:k,tabIndex:w,onClick:d,onKeyDown:u,onFocus:f,onBlur:T,"aria-current":M,"aria-label":Y,slots:D,slotProps:R}=l,O=Z(l,Eo),i=y.useRef(null),A=No(l);it(()=>{var b;o&&((b=i.current)==null||b.focus())},[o]);const m=(D==null?void 0:D.monthButton)??$o,x=ie({elementType:m,externalSlotProps:R==null?void 0:R.monthButton,additionalProps:{children:a,disabled:g,tabIndex:w,ref:i,type:"button",role:"radio","aria-current":M,"aria-checked":v,"aria-label":Y,onClick:b=>d(b,k),onKeyDown:b=>u(b,k),onFocus:b=>f(b,k),onBlur:b=>T(b,k)},ownerState:l,className:A.monthButton});return P.jsx(_o,n({className:Pe(A.root,r),ownerState:l},O,{children:P.jsx(m,n({},x))}))});function zo(t){return Ce("MuiMonthCalendar",t)}ke("MuiMonthCalendar",["root"]);const Lo=["className","value","defaultValue","referenceDate","disabled","disableFuture","disablePast","maxDate","minDate","onChange","shouldDisableMonth","readOnly","disableHighlightToday","autoFocus","onMonthFocus","hasFocus","onFocusedViewChange","monthsPerRow","timezone","gridLabelId","slots","slotProps"],Uo=t=>{const{classes:s}=t;return ve({root:["root"]},zo,s)};function Go(t,s){const l=re(),o=Be(),r=de({props:t,name:s});return n({disableFuture:!1,disablePast:!1},r,{minDate:fe(l,r.minDate,o.minDate),maxDate:fe(l,r.maxDate,o.maxDate)})}const Ko=ae("div",{name:"MuiMonthCalendar",slot:"Root",overridesResolver:(t,s)=>s.root})({display:"flex",flexWrap:"wrap",alignContent:"stretch",padding:"0 4px",width:Ke,boxSizing:"border-box"}),qo=y.forwardRef(function(s,l){const o=Go(s,"MuiMonthCalendar"),{className:r,value:a,defaultValue:g,referenceDate:v,disabled:k,disableFuture:w,disablePast:d,maxDate:u,minDate:f,onChange:T,shouldDisableMonth:M,readOnly:Y,autoFocus:D=!1,onMonthFocus:R,hasFocus:O,onFocusedViewChange:i,monthsPerRow:A=3,timezone:m,gridLabelId:x,slots:b,slotProps:H}=o,B=Z(o,Lo),{value:S,handleValueChange:_,timezone:U}=qe({name:"MonthCalendar",timezone:m,value:a,defaultValue:g,onChange:T,valueManager:De}),W=ht(U),z=ct(),p=re(),G=y.useMemo(()=>De.getInitialReferenceValue({value:S,utils:p,props:o,timezone:U,referenceDate:v,granularity:yt.month}),[]),K=o,N=Uo(K),Q=y.useMemo(()=>p.getMonth(W),[p,W]),E=y.useMemo(()=>S!=null?p.getMonth(S):null,[S,p]),[X,ce]=y.useState(()=>E||p.getMonth(G)),[be,me]=dt({name:"MonthCalendar",state:"hasFocus",controlled:O,default:D??!1}),ne=J(C=>{me(C),i&&i(C)}),ee=y.useCallback(C=>{const I=p.startOfMonth(d&&p.isAfter(W,f)?W:f),h=p.startOfMonth(w&&p.isBefore(W,u)?W:u),F=p.startOfMonth(C);return p.isBefore(F,I)||p.isAfter(F,h)?!0:M?M(F):!1},[w,d,u,f,W,M,p]),$=J((C,I)=>{if(Y)return;const h=p.setMonth(S??G,I);_(h)}),L=J(C=>{ee(p.setMonth(S??G,C))||(ce(C),ne(!0),R&&R(C))});y.useEffect(()=>{ce(C=>E!==null&&C!==E?E:C)},[E]);const te=J((C,I)=>{switch(C.key){case"ArrowUp":L((12+I-3)%12),C.preventDefault();break;case"ArrowDown":L((12+I+3)%12),C.preventDefault();break;case"ArrowLeft":L((12+I+(z?1:-1))%12),C.preventDefault();break;case"ArrowRight":L((12+I+(z?-1:1))%12),C.preventDefault();break}}),j=J((C,I)=>{L(I)}),he=J((C,I)=>{X===I&&ne(!1)});return P.jsx(Ko,n({ref:l,className:Pe(N.root,r),ownerState:K,role:"radiogroup","aria-labelledby":x},B,{children:lo(p,S??G).map(C=>{const I=p.getMonth(C),h=p.format(C,"monthShort"),F=p.format(C,"month"),oe=I===E,se=k||ee(C);return P.jsx(Ho,{selected:oe,value:I,onClick:$,onKeyDown:te,autoFocus:be&&I===X,disabled:se,tabIndex:I===X&&!se?0:-1,onFocus:j,onBlur:he,"aria-current":Q===I?"date":void 0,"aria-label":F,monthsPerRow:A,slots:b,slotProps:H,children:h},h)})}))});function Qo(t){return Ce("MuiPickersYear",t)}const Ie=ke("MuiPickersYear",["root","yearButton","selected","disabled"]),Xo=["autoFocus","className","children","disabled","selected","value","tabIndex","onClick","onKeyDown","onFocus","onBlur","aria-current","yearsPerRow","slots","slotProps"],Jo=t=>{const{disabled:s,selected:l,classes:o}=t;return ve({root:["root"],yearButton:["yearButton",s&&"disabled",l&&"selected"]},Qo,o)},Zo=ae("div",{name:"MuiPickersYear",slot:"Root",overridesResolver:(t,s)=>[s.root]})({display:"flex",alignItems:"center",justifyContent:"center",flexBasis:"33.3%",variants:[{props:{yearsPerRow:4},style:{flexBasis:"25%"}}]}),ea=ae("button",{name:"MuiPickersYear",slot:"YearButton",overridesResolver:(t,s)=>[s.yearButton,{[`&.${Ie.disabled}`]:s.disabled},{[`&.${Ie.selected}`]:s.selected}]})(({theme:t})=>n({color:"unset",backgroundColor:"transparent",border:0,outline:0},t.typography.subtitle1,{margin:"6px 0",height:36,width:72,borderRadius:18,cursor:"pointer","&:focus":{backgroundColor:t.vars?`rgba(${t.vars.palette.action.activeChannel} / ${t.vars.palette.action.focusOpacity})`:Ye(t.palette.action.active,t.palette.action.focusOpacity)},"&:hover":{backgroundColor:t.vars?`rgba(${t.vars.palette.action.activeChannel} / ${t.vars.palette.action.hoverOpacity})`:Ye(t.palette.action.active,t.palette.action.hoverOpacity)},"&:disabled":{cursor:"auto",pointerEvents:"none"},[`&.${Ie.disabled}`]:{color:(t.vars||t).palette.text.secondary},[`&.${Ie.selected}`]:{color:(t.vars||t).palette.primary.contrastText,backgroundColor:(t.vars||t).palette.primary.main,"&:focus, &:hover":{backgroundColor:(t.vars||t).palette.primary.dark}}})),ta=y.memo(function(s){const l=de({props:s,name:"MuiPickersYear"}),{autoFocus:o,className:r,children:a,disabled:g,selected:v,value:k,tabIndex:w,onClick:d,onKeyDown:u,onFocus:f,onBlur:T,"aria-current":M,slots:Y,slotProps:D}=l,R=Z(l,Xo),O=y.useRef(null),i=Jo(l);it(()=>{var x;o&&((x=O.current)==null||x.focus())},[o]);const A=(Y==null?void 0:Y.yearButton)??ea,m=ie({elementType:A,externalSlotProps:D==null?void 0:D.yearButton,additionalProps:{children:a,disabled:g,tabIndex:w,ref:O,type:"button",role:"radio","aria-current":M,"aria-checked":v,onClick:x=>d(x,k),onKeyDown:x=>u(x,k),onFocus:x=>f(x,k),onBlur:x=>T(x,k)},ownerState:l,className:i.yearButton});return P.jsx(Zo,n({className:Pe(i.root,r),ownerState:l},R,{children:P.jsx(A,n({},m))}))});function oa(t){return Ce("MuiYearCalendar",t)}ke("MuiYearCalendar",["root"]);const aa=["autoFocus","className","value","defaultValue","referenceDate","disabled","disableFuture","disablePast","maxDate","minDate","onChange","readOnly","shouldDisableYear","disableHighlightToday","onYearFocus","hasFocus","onFocusedViewChange","yearsPerRow","timezone","gridLabelId","slots","slotProps"],ra=t=>{const{classes:s}=t;return ve({root:["root"]},oa,s)};function sa(t,s){const l=re(),o=Be(),r=de({props:t,name:s});return n({disablePast:!1,disableFuture:!1},r,{yearsPerRow:r.yearsPerRow??3,minDate:fe(l,r.minDate,o.minDate),maxDate:fe(l,r.maxDate,o.maxDate)})}const na=ae("div",{name:"MuiYearCalendar",slot:"Root",overridesResolver:(t,s)=>s.root})({display:"flex",flexDirection:"row",flexWrap:"wrap",overflowY:"auto",height:"100%",padding:"0 4px",width:Ke,maxHeight:io,boxSizing:"border-box",position:"relative"}),la=y.forwardRef(function(s,l){const o=sa(s,"MuiYearCalendar"),{autoFocus:r,className:a,value:g,defaultValue:v,referenceDate:k,disabled:w,disableFuture:d,disablePast:u,maxDate:f,minDate:T,onChange:M,readOnly:Y,shouldDisableYear:D,onYearFocus:R,hasFocus:O,onFocusedViewChange:i,yearsPerRow:A,timezone:m,gridLabelId:x,slots:b,slotProps:H}=o,B=Z(o,aa),{value:S,handleValueChange:_,timezone:U}=qe({name:"YearCalendar",timezone:m,value:g,defaultValue:v,onChange:M,valueManager:De}),W=ht(U),z=ct(),p=re(),G=y.useMemo(()=>De.getInitialReferenceValue({value:S,utils:p,props:o,timezone:U,referenceDate:k,granularity:yt.year}),[]),K=o,N=ra(K),Q=y.useMemo(()=>p.getYear(W),[p,W]),E=y.useMemo(()=>S!=null?p.getYear(S):null,[S,p]),[X,ce]=y.useState(()=>E||p.getYear(G)),[be,me]=dt({name:"YearCalendar",state:"hasFocus",controlled:O,default:r??!1}),ne=J(h=>{me(h),i&&i(h)}),ee=y.useCallback(h=>{if(u&&p.isBeforeYear(h,W)||d&&p.isAfterYear(h,W)||T&&p.isBeforeYear(h,T)||f&&p.isAfterYear(h,f))return!0;if(!D)return!1;const F=p.startOfYear(h);return D(F)},[d,u,f,T,W,D,p]),$=J((h,F)=>{if(Y)return;const oe=p.setYear(S??G,F);_(oe)}),L=J(h=>{ee(p.setYear(S??G,h))||(ce(h),ne(!0),R==null||R(h))});y.useEffect(()=>{ce(h=>E!==null&&h!==E?E:h)},[E]);const te=J((h,F)=>{switch(h.key){case"ArrowUp":L(F-A),h.preventDefault();break;case"ArrowDown":L(F+A),h.preventDefault();break;case"ArrowLeft":L(F+(z?1:-1)),h.preventDefault();break;case"ArrowRight":L(F+(z?-1:1)),h.preventDefault();break}}),j=J((h,F)=>{L(F)}),he=J((h,F)=>{X===F&&ne(!1)}),C=y.useRef(null),I=Ue(l,C);return y.useEffect(()=>{if(r||C.current===null)return;const h=C.current.querySelector('[tabindex="0"]');if(!h)return;const F=h.offsetHeight,oe=h.offsetTop,se=C.current.clientHeight,we=C.current.scrollTop,Me=oe+F;F>se||oe<we||(C.current.scrollTop=Me-se/2-F/2)},[r]),P.jsx(na,n({ref:I,className:Pe(N.root,a),ownerState:K,role:"radiogroup","aria-labelledby":x},B,{children:p.getYearRange([T,f]).map(h=>{const F=p.getYear(h),oe=F===E,se=w||ee(h);return P.jsx(ta,{selected:oe,value:F,onClick:$,onKeyDown:te,autoFocus:be&&F===X,disabled:se,tabIndex:F===X&&!se?0:-1,onFocus:j,onBlur:he,"aria-current":Q===F?"date":void 0,yearsPerRow:A,slots:b,slotProps:H,children:p.format(h,"year")},p.format(h,"year"))})}))}),ia=t=>Ce("MuiDateCalendar",t);ke("MuiDateCalendar",["root","viewTransitionContainer"]);const ca=["autoFocus","onViewChange","value","defaultValue","referenceDate","disableFuture","disablePast","onChange","onYearChange","onMonthChange","reduceAnimations","shouldDisableDate","shouldDisableMonth","shouldDisableYear","view","views","openTo","className","disabled","readOnly","minDate","maxDate","disableHighlightToday","focusedView","onFocusedViewChange","showDaysOutsideCurrentMonth","fixedWeekNumber","dayOfWeekFormatter","slots","slotProps","loading","renderLoading","displayWeekNumber","yearsPerRow","monthsPerRow","timezone"],da=t=>{const{classes:s}=t;return ve({root:["root"],viewTransitionContainer:["viewTransitionContainer"]},ia,s)};function ua(t,s){const l=re(),o=Be(),r=ho(),a=de({props:t,name:s});return n({},a,{loading:a.loading??!1,disablePast:a.disablePast??!1,disableFuture:a.disableFuture??!1,openTo:a.openTo??"day",views:a.views??["year","day"],reduceAnimations:a.reduceAnimations??r,renderLoading:a.renderLoading??(()=>P.jsx("span",{children:"..."})),minDate:fe(l,a.minDate,o.minDate),maxDate:fe(l,a.maxDate,o.maxDate)})}const pa=ae(Yo,{name:"MuiDateCalendar",slot:"Root",overridesResolver:(t,s)=>s.root})({display:"flex",flexDirection:"column",height:mt}),fa=ae(co,{name:"MuiDateCalendar",slot:"ViewTransitionContainer",overridesResolver:(t,s)=>s.viewTransitionContainer})({}),ba=y.forwardRef(function(s,l){const o=re(),r=Ge(),a=ua(s,"MuiDateCalendar"),{autoFocus:g,onViewChange:v,value:k,defaultValue:w,referenceDate:d,disableFuture:u,disablePast:f,onChange:T,onYearChange:M,onMonthChange:Y,reduceAnimations:D,shouldDisableDate:R,shouldDisableMonth:O,shouldDisableYear:i,view:A,views:m,openTo:x,className:b,disabled:H,readOnly:B,minDate:S,maxDate:_,disableHighlightToday:U,focusedView:W,onFocusedViewChange:z,showDaysOutsideCurrentMonth:p,fixedWeekNumber:G,dayOfWeekFormatter:K,slots:N,slotProps:Q,loading:E,renderLoading:X,displayWeekNumber:ce,yearsPerRow:be,monthsPerRow:me,timezone:ne}=a,ee=Z(a,ca),{value:$,handleValueChange:L,timezone:te}=qe({name:"DateCalendar",timezone:ne,value:k,defaultValue:w,onChange:T,valueManager:De}),{view:j,setView:he,focusedView:C,setFocusedView:I,goToNextView:h,setValueAndGoToNextView:F}=uo({view:A,views:m,openTo:x,onChange:L,onViewChange:v,autoFocus:g,focusedView:W,onFocusedViewChange:z}),{referenceDate:oe,calendarState:se,changeFocusedDay:we,changeMonth:Me,handleChangeMonth:Mt,isDateDisabled:Re,onMonthSwitchingAnimationEnd:Ft}=po({value:$,referenceDate:d,reduceAnimations:D,onMonthChange:Y,minDate:S,maxDate:_,shouldDisableDate:R,disablePast:f,disableFuture:u,timezone:te}),Tt=H&&$||S,Rt=H&&$||_,Je=`${r}-grid-label`,je=C!==null,Ze=(N==null?void 0:N.calendarHeader)??fo,Ot=ie({elementType:Ze,externalSlotProps:Q==null?void 0:Q.calendarHeader,additionalProps:{views:m,view:j,currentMonth:se.currentMonth,onViewChange:he,onMonthChange:(V,le)=>Mt({newMonth:V,direction:le}),minDate:Tt,maxDate:Rt,disabled:H,disablePast:f,disableFuture:u,reduceAnimations:D,timezone:te,labelId:Je},ownerState:a}),St=J(V=>{const le=o.startOfMonth(V),Fe=o.endOfMonth(V),ue=Re(V)?rt({utils:o,date:V,minDate:o.isBefore(S,le)?le:S,maxDate:o.isAfter(_,Fe)?Fe:_,disablePast:f,disableFuture:u,isDateDisabled:Re,timezone:te}):V;ue?(F(ue,"finish"),Y==null||Y(le)):(h(),Me(le)),we(ue,!0)}),It=J(V=>{const le=o.startOfYear(V),Fe=o.endOfYear(V),ue=Re(V)?rt({utils:o,date:V,minDate:o.isBefore(S,le)?le:S,maxDate:o.isAfter(_,Fe)?Fe:_,disablePast:f,disableFuture:u,isDateDisabled:Re,timezone:te}):V;ue?(F(ue,"finish"),M==null||M(ue)):(h(),Me(le)),we(ue,!0)}),Yt=J(V=>L(V&&bo(o,V,$??oe),"finish",j));y.useEffect(()=>{$!=null&&o.isValid($)&&Me($)},[$]);const Ve=a,et=da(Ve),We={disablePast:f,disableFuture:u,maxDate:_,minDate:S},Ee={disableHighlightToday:U,readOnly:B,disabled:H,timezone:te,gridLabelId:Je,slots:N,slotProps:Q},Ne=y.useRef(j);y.useEffect(()=>{Ne.current!==j&&(C===Ne.current&&I(j,!0),Ne.current=j)},[C,I,j]);const At=y.useMemo(()=>[$],[$]);return P.jsxs(pa,n({ref:l,className:Pe(et.root,b),ownerState:Ve},ee,{children:[P.jsx(Ze,n({},Ot,{slots:N,slotProps:Q})),P.jsx(fa,{reduceAnimations:D,className:et.viewTransitionContainer,transKey:j,ownerState:Ve,children:P.jsxs("div",{children:[j==="year"&&P.jsx(la,n({},We,Ee,{value:$,onChange:It,shouldDisableYear:i,hasFocus:je,onFocusedViewChange:V=>I("year",V),yearsPerRow:be,referenceDate:oe})),j==="month"&&P.jsx(qo,n({},We,Ee,{hasFocus:je,className:b,value:$,onChange:St,shouldDisableMonth:O,onFocusedViewChange:V=>I("month",V),monthsPerRow:me,referenceDate:oe})),j==="day"&&P.jsx(mo,n({},se,We,Ee,{onMonthSwitchingAnimationEnd:Ft,onFocusedDayChange:we,reduceAnimations:D,selectedDays:At,onSelectedDaysChange:Yt,shouldDisableDate:R,shouldDisableMonth:O,shouldDisableYear:i,hasFocus:je,onFocusedViewChange:V=>I("day",V),showDaysOutsideCurrentMonth:p,fixedWeekNumber:G,dayOfWeekFormatter:K,displayWeekNumber:ce,loading:E,renderLoading:X}))]})})]}))});function ma(t){return Ce("MuiDatePickerToolbar",t)}ke("MuiDatePickerToolbar",["root","title"]);const ha=["value","isLandscape","onChange","toolbarFormat","toolbarPlaceholder","views","className","onViewChange","view"],ya=t=>{const{classes:s}=t;return ve({root:["root"],title:["title"]},ma,s)},ga=ae(yo,{name:"MuiDatePickerToolbar",slot:"Root",overridesResolver:(t,s)=>s.root})({}),Da=ae(ut,{name:"MuiDatePickerToolbar",slot:"Title",overridesResolver:(t,s)=>s.title})({variants:[{props:{isLandscape:!0},style:{margin:"auto 16px auto auto"}}]}),xa=y.forwardRef(function(s,l){const o=de({props:s,name:"MuiDatePickerToolbar"}),{value:r,isLandscape:a,toolbarFormat:g,toolbarPlaceholder:v="––",views:k,className:w}=o,d=Z(o,ha),u=re(),f=Ae(),T=ya(o),M=y.useMemo(()=>{if(!r)return v;const D=Qe(u,{format:g,views:k},!0);return u.formatByString(r,D)},[r,g,v,u,k]),Y=o;return P.jsx(ga,n({ref:l,toolbarTitle:f.datePickerToolbarTitle,isLandscape:a,className:Pe(T.root,w)},d,{children:P.jsx(Da,{variant:"h4",align:a?"left":"center",ownerState:Y,className:T.title,children:M})}))});function Pt(t,s){const l=re(),o=Be(),r=de({props:t,name:s}),a=y.useMemo(()=>{var g;return((g=r.localeText)==null?void 0:g.toolbarTitle)==null?r.localeText:n({},r.localeText,{datePickerToolbarTitle:r.localeText.toolbarTitle})},[r.localeText]);return n({},r,{localeText:a},go({views:r.views,openTo:r.openTo,defaultViews:["year","day"],defaultOpenTo:"day"}),{disableFuture:r.disableFuture??!1,disablePast:r.disablePast??!1,minDate:fe(l,r.minDate,o.minDate),maxDate:fe(l,r.maxDate,o.maxDate),slots:n({toolbar:xa},r.slots)})}const ka=["props","getOpenDialogAriaText"],Ca=["ownerState"],Pa=["ownerState"],va=t=>{var I;let{props:s,getOpenDialogAriaText:l}=t,o=Z(t,ka);const{slots:r,slotProps:a,className:g,sx:v,format:k,formatDensity:w,enableAccessibleFieldDOMStructure:d,selectedSections:u,onSelectedSectionsChange:f,timezone:T,name:M,label:Y,inputRef:D,readOnly:R,disabled:O,autoFocus:i,localeText:A,reduceAnimations:m}=s,x=re(),b=y.useRef(null),H=y.useRef(null),B=Ge(),S=((I=a==null?void 0:a.toolbar)==null?void 0:I.hidden)??!1,{open:_,actions:U,hasUIView:W,layoutProps:z,renderCurrentView:p,shouldRestoreFocus:G,fieldProps:K}=gt(n({},o,{props:s,fieldRef:H,autoFocusView:!0,additionalViewProps:{},wrapperVariant:"desktop"})),N=r.inputAdornment??lt,Q=ie({elementType:N,externalSlotProps:a==null?void 0:a.inputAdornment,additionalProps:{position:"end"},ownerState:s}),E=Z(Q,Ca),X=r.openPickerButton??Te,ce=ie({elementType:X,externalSlotProps:a==null?void 0:a.openPickerButton,additionalProps:{disabled:O||R,onClick:_?U.onClose:U.onOpen,"aria-label":l(K.value,x),edge:E.position},ownerState:s}),be=Z(ce,Pa),me=r.openPickerIcon,ne=r.field,ee=ie({elementType:ne,externalSlotProps:a==null?void 0:a.field,additionalProps:n({},K,S&&{id:B},{readOnly:R,disabled:O,className:g,sx:v,format:k,formatDensity:w,enableAccessibleFieldDOMStructure:d,selectedSections:u,onSelectedSectionsChange:f,timezone:T,label:Y,name:M,autoFocus:i&&!s.open,focused:_?!0:void 0},D?{inputRef:D}:{}),ownerState:s});W&&(ee.InputProps=n({},ee.InputProps,{ref:b},!s.disableOpenPicker&&{[`${E.position}Adornment`]:P.jsx(N,n({},E,{children:P.jsx(X,n({},be,{children:P.jsx(me,n({},a==null?void 0:a.openPickerIcon))}))}))}));const $=n({textField:r.textField,clearIcon:r.clearIcon,clearButton:r.clearButton},ee.slots),L=r.layout??Dt;let te=B;S&&(Y?te=`${B}-label`:te=void 0);const j=n({},a,{toolbar:n({},a==null?void 0:a.toolbar,{titleId:B}),popper:n({"aria-labelledby":te},a==null?void 0:a.popper)}),he=Ue(H,ee.unstableFieldRef);return{renderPicker:()=>P.jsxs(Xe,{localeText:A,children:[P.jsx(ne,n({},ee,{slots:$,slotProps:j,unstableFieldRef:he})),P.jsx(Do,n({role:"dialog",placement:"bottom-start",anchorEl:b.current},U,{open:_,slots:r,slotProps:j,shouldRestoreFocus:G,reduceAnimations:m,children:P.jsx(L,n({},z,j==null?void 0:j.layout,{slots:r,slotProps:j,children:p()}))}))]})}},xe=({view:t,onViewChange:s,views:l,focusedView:o,onFocusedViewChange:r,value:a,defaultValue:g,referenceDate:v,onChange:k,className:w,classes:d,disableFuture:u,disablePast:f,minDate:T,maxDate:M,shouldDisableDate:Y,shouldDisableMonth:D,shouldDisableYear:R,reduceAnimations:O,onMonthChange:i,monthsPerRow:A,onYearChange:m,yearsPerRow:x,slots:b,slotProps:H,loading:B,renderLoading:S,disableHighlightToday:_,readOnly:U,disabled:W,showDaysOutsideCurrentMonth:z,dayOfWeekFormatter:p,sx:G,autoFocus:K,fixedWeekNumber:N,displayWeekNumber:Q,timezone:E})=>P.jsx(ba,{view:t,onViewChange:s,views:l.filter(st),focusedView:o&&st(o)?o:null,onFocusedViewChange:r,value:a,defaultValue:g,referenceDate:v,onChange:k,className:w,classes:d,disableFuture:u,disablePast:f,minDate:T,maxDate:M,shouldDisableDate:Y,shouldDisableMonth:D,shouldDisableYear:R,reduceAnimations:O,onMonthChange:i,monthsPerRow:A,onYearChange:m,yearsPerRow:x,slots:b,slotProps:H,loading:B,renderLoading:S,disableHighlightToday:_,readOnly:U,disabled:W,showDaysOutsideCurrentMonth:z,dayOfWeekFormatter:p,sx:G,autoFocus:K,fixedWeekNumber:N,displayWeekNumber:Q,timezone:E}),vt=y.forwardRef(function(s,l){var w,d;const o=Ae(),r=re(),a=Pt(s,"MuiDesktopDatePicker"),g=n({day:xe,month:xe,year:xe},a.viewRenderers),v=n({},a,{viewRenderers:g,format:Qe(r,a,!1),yearsPerRow:a.yearsPerRow??4,slots:n({openPickerIcon:xo,field:Ct},a.slots),slotProps:n({},a.slotProps,{field:u=>{var f;return n({},pt((f=a.slotProps)==null?void 0:f.field,u),xt(a),{ref:l})},toolbar:n({hidden:!0},(w=a.slotProps)==null?void 0:w.toolbar)})}),{renderPicker:k}=va({props:v,valueManager:De,valueType:"date",getOpenDialogAriaText:((d=v.localeText)==null?void 0:d.openDatePickerDialogue)??o.openDatePickerDialogue,validator:kt});return k()});vt.propTypes={autoFocus:e.bool,className:e.string,closeOnSelect:e.bool,dayOfWeekFormatter:e.func,defaultValue:e.object,disabled:e.bool,disableFuture:e.bool,disableHighlightToday:e.bool,disableOpenPicker:e.bool,disablePast:e.bool,displayWeekNumber:e.bool,enableAccessibleFieldDOMStructure:e.any,fixedWeekNumber:e.number,format:e.string,formatDensity:e.oneOf(["dense","spacious"]),inputRef:ft,label:e.node,loading:e.bool,localeText:e.object,maxDate:e.object,minDate:e.object,monthsPerRow:e.oneOf([3,4]),name:e.string,onAccept:e.func,onChange:e.func,onClose:e.func,onError:e.func,onMonthChange:e.func,onOpen:e.func,onSelectedSectionsChange:e.func,onViewChange:e.func,onYearChange:e.func,open:e.bool,openTo:e.oneOf(["day","month","year"]),orientation:e.oneOf(["landscape","portrait"]),readOnly:e.bool,reduceAnimations:e.bool,referenceDate:e.object,renderLoading:e.func,selectedSections:e.oneOfType([e.oneOf(["all","day","empty","hours","meridiem","minutes","month","seconds","weekDay","year"]),e.number]),shouldDisableDate:e.func,shouldDisableMonth:e.func,shouldDisableYear:e.func,showDaysOutsideCurrentMonth:e.bool,slotProps:e.object,slots:e.object,sx:e.oneOfType([e.arrayOf(e.oneOfType([e.func,e.object,e.bool])),e.func,e.object]),timezone:e.string,value:e.object,view:e.oneOf(["day","month","year"]),viewRenderers:e.shape({day:e.func,month:e.func,year:e.func}),views:e.arrayOf(e.oneOf(["day","month","year"]).isRequired),yearsPerRow:e.oneOf([3,4])};const wa=["props","getOpenDialogAriaText"],Ma=t=>{var X;let{props:s,getOpenDialogAriaText:l}=t,o=Z(t,wa);const{slots:r,slotProps:a,className:g,sx:v,format:k,formatDensity:w,enableAccessibleFieldDOMStructure:d,selectedSections:u,onSelectedSectionsChange:f,timezone:T,name:M,label:Y,inputRef:D,readOnly:R,disabled:O,localeText:i}=s,A=re(),m=y.useRef(null),x=Ge(),b=((X=a==null?void 0:a.toolbar)==null?void 0:X.hidden)??!1,{open:H,actions:B,layoutProps:S,renderCurrentView:_,fieldProps:U}=gt(n({},o,{props:s,fieldRef:m,autoFocusView:!0,additionalViewProps:{},wrapperVariant:"mobile"})),W=r.field,z=ie({elementType:W,externalSlotProps:a==null?void 0:a.field,additionalProps:n({},U,b&&{id:x},!(O||R)&&{onClick:B.onOpen,onKeyDown:ko(B.onOpen)},{readOnly:R??!0,disabled:O,className:g,sx:v,format:k,formatDensity:w,enableAccessibleFieldDOMStructure:d,selectedSections:u,onSelectedSectionsChange:f,timezone:T,label:Y,name:M},D?{inputRef:D}:{}),ownerState:s});z.inputProps=n({},z.inputProps,{"aria-label":l(U.value,A)});const p=n({textField:r.textField},z.slots),G=r.layout??Dt;let K=x;b&&(Y?K=`${x}-label`:K=void 0);const N=n({},a,{toolbar:n({},a==null?void 0:a.toolbar,{titleId:x}),mobilePaper:n({"aria-labelledby":K},a==null?void 0:a.mobilePaper)}),Q=Ue(m,z.unstableFieldRef);return{renderPicker:()=>P.jsxs(Xe,{localeText:i,children:[P.jsx(W,n({},z,{slots:p,slotProps:N,unstableFieldRef:Q})),P.jsx(Co,n({},B,{open:H,slots:r,slotProps:N,children:P.jsx(G,n({},S,N==null?void 0:N.layout,{slots:r,slotProps:N,children:_()}))}))]})}},wt=y.forwardRef(function(s,l){var w,d;const o=Ae(),r=re(),a=Pt(s,"MuiMobileDatePicker"),g=n({day:xe,month:xe,year:xe},a.viewRenderers),v=n({},a,{viewRenderers:g,format:Qe(r,a,!1),slots:n({field:Ct},a.slots),slotProps:n({},a.slotProps,{field:u=>{var f;return n({},pt((f=a.slotProps)==null?void 0:f.field,u),xt(a),{ref:l})},toolbar:n({hidden:!1},(w=a.slotProps)==null?void 0:w.toolbar)})}),{renderPicker:k}=Ma({props:v,valueManager:De,valueType:"date",getOpenDialogAriaText:((d=v.localeText)==null?void 0:d.openDatePickerDialogue)??o.openDatePickerDialogue,validator:kt});return k()});wt.propTypes={autoFocus:e.bool,className:e.string,closeOnSelect:e.bool,dayOfWeekFormatter:e.func,defaultValue:e.object,disabled:e.bool,disableFuture:e.bool,disableHighlightToday:e.bool,disableOpenPicker:e.bool,disablePast:e.bool,displayWeekNumber:e.bool,enableAccessibleFieldDOMStructure:e.any,fixedWeekNumber:e.number,format:e.string,formatDensity:e.oneOf(["dense","spacious"]),inputRef:ft,label:e.node,loading:e.bool,localeText:e.object,maxDate:e.object,minDate:e.object,monthsPerRow:e.oneOf([3,4]),name:e.string,onAccept:e.func,onChange:e.func,onClose:e.func,onError:e.func,onMonthChange:e.func,onOpen:e.func,onSelectedSectionsChange:e.func,onViewChange:e.func,onYearChange:e.func,open:e.bool,openTo:e.oneOf(["day","month","year"]),orientation:e.oneOf(["landscape","portrait"]),readOnly:e.bool,reduceAnimations:e.bool,referenceDate:e.object,renderLoading:e.func,selectedSections:e.oneOfType([e.oneOf(["all","day","empty","hours","meridiem","minutes","month","seconds","weekDay","year"]),e.number]),shouldDisableDate:e.func,shouldDisableMonth:e.func,shouldDisableYear:e.func,showDaysOutsideCurrentMonth:e.bool,slotProps:e.object,slots:e.object,sx:e.oneOfType([e.arrayOf(e.oneOfType([e.func,e.object,e.bool])),e.func,e.object]),timezone:e.string,value:e.object,view:e.oneOf(["day","month","year"]),viewRenderers:e.shape({day:e.func,month:e.func,year:e.func}),views:e.arrayOf(e.oneOf(["day","month","year"]).isRequired),yearsPerRow:e.oneOf([3,4])};const Fa=["desktopModeMediaQuery"],Ta=y.forwardRef(function(s,l){const o=de({props:s,name:"MuiDatePicker"}),{desktopModeMediaQuery:r=Po}=o,a=Z(o,Fa);return bt(r,{defaultMatches:!0})?P.jsx(vt,n({ref:l},a)):P.jsx(wt,n({ref:l},a))}),Ra=({open:t,closeModal:s,filteredData:l,users:o})=>{y.useState(!1);const r=Le(),a=[{label:"Date",key:"date"},{label:"Total Daily Works",key:"totalDailyWorks"},{label:"Resubmissions",key:"resubmissions"},{label:"Embankment",key:"embankment"},{label:"Structure",key:"structure"},{label:"Pavement",key:"pavement"},{label:"Completed",key:"completed"},{label:"Pending",key:"pending"},{label:"Completion Percentage",key:"completionPercentage"},{label:"RFI Submissions",key:"rfiSubmissions"},{label:"RFI Submission Percentage",key:"rfiSubmissionPercentage"}],[g,v]=y.useState(a.map(d=>({...d,checked:!0}))),k=d=>{const u=[...g];u[d].checked=!u[d].checked,v(u)},w=async d=>{const u=new Promise((f,T)=>{try{if(!d||d.length===0){T("No columns selected for export.");return}const M=l.map(R=>{const O={},i=R.totalDailyWorks||0,A=R.completed||0,m=R.rfiSubmissions||0,x=i>0?`${i-A}`:"0",b=i>0?`${(A/i*100).toFixed(1)}%`:"0%",H=i>0?`${(m/i*100).toFixed(1)}%`:"0%";return d.forEach(B=>{B.checked&&(B.key==="pending"?O[B.label]=x:B.key==="completionPercentage"?O[B.label]=b:B.key==="rfiSubmissionPercentage"?O[B.label]=H:O[B.label]=R[B.key]||"")}),O});if(M.length===0){T("No data available for export.");return}const Y=$e.json_to_sheet(M),D=$e.book_new();$e.book_append_sheet(D,Y,"Daily Work Summary"),Ro(D,"DailyWorkSummary.xlsx"),f("Export successful!"),s()}catch(M){T("Failed to export data. Please try again."),console.error("Error exporting data to Excel:",M)}});jt.promise(u,{pending:{render(){return q("div",{style:{display:"flex",alignItems:"center"},children:[c(Gt,{}),c("span",{style:{marginLeft:"8px"},children:"Exporting data to Excel ..."})]})},icon:!1,style:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:r.glassCard.backgroundColor,border:r.glassCard.border,color:r.palette.text.primary}},success:{render({data:f}){return c(ge,{children:f})},icon:"🟢",style:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:r.glassCard.backgroundColor,border:r.glassCard.border,color:r.palette.text.primary}},error:{render({data:f}){return c(ge,{children:f})},icon:"🔴",style:{backdropFilter:"blur(16px) saturate(200%)",backgroundColor:r.glassCard.backgroundColor,border:r.glassCard.border,color:r.palette.text.primary}}})};return q(To,{open:t,onClose:s,children:[q(Nt,{style:{cursor:"move"},id:"draggable-dialog-title",children:[c(ut,{children:"Export Daily Works"}),c(Te,{variant:"outlined",color:"primary",onClick:s,sx:{position:"absolute",top:8,right:16},children:c(Fo,{})})]}),c(Lt,{children:q(_t,{size:"small",sx:{"& .MuiTableCell-root":{padding:"4px 8px"},"& .MuiCheckbox-root":{padding:"0px"}},children:[c($t,{children:q(tt,{children:[c(Oe,{children:"Column Label"}),c(Oe,{align:"center",children:"Include in Export"})]})}),c(Ht,{children:g.map((d,u)=>q(tt,{children:[c(Oe,{children:d.label}),c(Oe,{align:"center",children:c(zt,{checked:d.checked,onChange:()=>k(u)})})]},d.key))})]})}),c(Ut,{sx:{display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"},children:c(Oo,{sx:{borderRadius:"50px",padding:"6px 16px"},variant:"outlined",color:"primary",type:"submit",onClick:()=>w(g),startIcon:c(ze,{}),children:"Download"})})]})};pe.extend(vo);const nt=Kt(Ta)(({theme:t})=>({"& .MuiPaper-root":{backgroundColor:t.glassCard.backgroundColor},"& .MuiInputBase-root":{color:t.palette.text.primary,borderColor:t.palette.divider},"& .MuiOutlinedInput-root":{"& fieldset":{borderColor:t.palette.divider},"&:hover fieldset":{borderColor:t.palette.primary.main},"&.Mui-focused fieldset":{borderColor:t.palette.primary.main}},"& .MuiSvgIcon-root":{color:t.palette.text.secondary},"& .MuiPickersDay-root":{color:t.palette.text.primary,"&.Mui-selected":{backgroundColor:t.palette.primary.main,color:t.palette.primary.contrastText},"&.MuiPickersDay-today":{borderColor:t.palette.primary.main}}})),Oa=({auth:t,title:s,summary:l,jurisdictions:o,inCharges:r})=>{const a=Le(),[g,v]=y.useState(l),[k,w]=y.useState(l),d=g.map(i=>pe(i.date)),[u,f]=y.useState(null),T=bt(a.breakpoints.down("md")),M=i=>{f(i)},Y=()=>{f(null)},[D,R]=y.useState({startDate:pe.min(...d),endDate:pe.max(...d),status:"all",incharge:"all"}),O=(i,A)=>{R(m=>({...m,[i]:A}))};return y.useEffect(()=>{(!D.startDate||!D.endDate)&&R(i=>({...i,startDate:pe.min(...d),endDate:pe.max(...d)}))},[d]),y.useEffect(()=>{const A=g.filter(m=>pe(m.date).isBetween(D.startDate,D.endDate,null,"[]")&&(D.incharge==="all"||!D.incharge||m.incharge===D.incharge)).reduce((m,x)=>{const b=pe(x.date).format("YYYY-MM-DD");return m[b]?(m[b].totalDailyWorks+=x.totalDailyWorks,m[b].resubmissions+=x.resubmissions,m[b].embankment+=x.embankment,m[b].structure+=x.structure,m[b].pavement+=x.pavement,m[b].pending+=x.pending,m[b].completed+=x.completed,m[b].rfiSubmissions+=x.rfiSubmissions,m[b].completionPercentage=m[b].totalDailyWorks>0?m[b].completed/m[b].totalDailyWorks*100:0,m[b].rfiSubmissionPercentage=m[b].totalDailyWorks>0?m[b].rfiSubmissions/m[b].totalDailyWorks*100:0):m[b]={...x},m},{});w(Object.values(A))},[D,g]),console.log(k),q(ge,{children:[c(Vt,{title:s}),u==="exportDailyWorkSummary"&&c(Ra,{open:u==="exportDailyWorkSummary",closeModal:Y,filteredData:k}),c(ye,{sx:{display:"flex",justifyContent:"center",p:2},children:c(qt,{in:!0,children:q(Wt,{children:[c(Qt,{title:s,sx:{padding:"24px"},action:q(ye,{display:"flex",gap:2,children:[t.permissions.includes("addTask")&&c(Te,{title:"Add Task",color:"primary",id:"showAddModalBtn",children:c(wo,{})}),t.roles.includes("Administrator")&&c(ge,{children:T?c(ge,{children:c(Te,{title:"Export Daily Works",color:"success",onClick:()=>M("exportDailyWorkSummary"),children:c(ze,{})})}):c(ge,{children:c(Xt,{title:"Export Daily Works",variant:"outlined",color:"success",startIcon:c(ze,{}),onClick:()=>M("exportDailyWorkSummary"),children:"Export"})})})]})}),c(ot,{children:c(ye,{children:q(_e,{container:!0,spacing:3,children:[c(_e,{item:!0,xs:12,sm:6,md:3,sx:{paddingTop:"8px !important"},children:c(Xe,{dateAdapter:Mo,children:q(ye,{display:"flex",alignItems:"center",children:[c(nt,{label:"Start date",value:D.startDate,onChange:i=>O("startDate",i),textField:i=>c(He,{...i,fullWidth:!0,size:"small"})}),c(ye,{sx:{mx:1},children:" to "}),c(nt,{label:"End date",value:D.endDate,onChange:i=>O("endDate",i),textField:i=>c(He,{...i,fullWidth:!0,size:"small"})})]})})}),t.roles.includes("Administrator")&&c(_e,{item:!0,xs:6,sm:4,md:3,sx:{paddingTop:"8px !important"},children:q(Jt,{fullWidth:!0,children:[c(Zt,{id:"incharge-label",children:"Incharge"}),q(eo,{variant:"outlined",labelId:"incharge-label",label:"Incharge",name:"incharge",value:D.incharge,onChange:i=>O("incharge",i.target.value),children:[c(at,{value:"all",children:"All"}),r.map(i=>c(at,{value:i.id,children:i.name},i.id))]})]})})]})})}),c(ot,{children:c(Io,{filteredData:k,openModal:M})})]})})})]})};Oa.layout=t=>c(to,{children:t});export{Oa as default};