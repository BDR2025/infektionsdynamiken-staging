const W="[data-matching-game]",j="[data-matching-config]",G="[data-matching-runtime]",V="[data-matching-status]",R="[data-matching-coach-validation]",F="[data-matching-coach-avatar]",w="[data-matching-item]",U="[data-matching-target]",J="[data-matching-target-dropzone]",K={S:"var(--compartment-s)",E:"var(--compartment-e)",I:"var(--compartment-i)",R:"var(--compartment-r)",D:"var(--compartment-d)",V:"var(--compartment-v)",assumption:"var(--coach-accent)",flow:"var(--coach-accent-strong)"};function Z(t=document){const e=()=>{t.querySelectorAll(W).forEach(r=>{r.dataset.matchingMounted!=="true"&&(r.dataset.matchingMounted="true",Q(r))})};if(document.readyState==="loading"){window.addEventListener("DOMContentLoaded",e,{once:!0});return}e()}function Q(t){const e=tt(t),r=t.querySelector(G),s=t.querySelector(V);if(!e||!r)return;const a=et();let d=null,o=null,l=null,y="";const $=(n=pt())=>ht(t,n);$(),t.dataset.matchingState="ready",window.addEventListener("id:surfacechange",n=>{const c=n instanceof CustomEvent&&n.detail?.surface==="dark"?"dark":"light";$(c)});const O=()=>{s&&(s.textContent=ut(e,a))},I=({focusSelector:n=""}={})=>{r.innerHTML=nt(e,a),t.classList.toggle("is-complete",a.complete),O(),n&&t.querySelector(n)?.focus()},M=()=>{a.complete||(a.complete=!0,a.activeItemId=null,a.activeTargetId=null,t.dataset.matchingState="complete",t.dataset.matchingComplete="true",I(),It(t))},T=(n,c,{focusSelector:i=""}={})=>{if(!n||!c||a.complete||p(a,n)||S(e,a,c))return;const u=_(e,a,c);if(u&&u!==n&&!p(a,u)&&delete a.assignmentsByItemId[u],a.assignmentsByItemId[n]=c,a.activeItemId=null,a.activeTargetId=null,a.resultsByItemId=mt(e,a)?lt(e,a):null,t.dataset.matchingState=a.resultsByItemId?"checked":"paired",a.resultsByItemId&&gt(e,a)){M();return}I({focusSelector:i})},B=n=>{if(!(!n||a.complete||p(a,n))){if(a.activeTargetId){T(n,a.activeTargetId,{focusSelector:`[data-matching-item="${g(n)}"]`});return}a.activeItemId=a.activeItemId===n?null:n,a.activeTargetId=null,t.dataset.matchingState=a.activeItemId?"selected":"ready",I({focusSelector:`[data-matching-item="${g(n)}"]`})}},D=n=>{if(!(!n||a.complete||S(e,a,n))){if(a.activeItemId){T(a.activeItemId,n,{focusSelector:`[data-matching-target="${g(n)}"]`});return}a.activeTargetId=a.activeTargetId===n?null:n,a.activeItemId=null,t.dataset.matchingState=a.activeTargetId?"selected":"ready",I({focusSelector:`[data-matching-target="${g(n)}"]`})}},H=()=>{if(!a.resultsByItemId||a.complete)return;a.assignmentsByItemId=Object.fromEntries(e.items.filter(c=>a.resultsByItemId?.[c.id]?.correct===!0).map(c=>[c.id,a.assignmentsByItemId[c.id]])),a.activeItemId=null,a.activeTargetId=null,a.resultsByItemId=null,t.dataset.matchingState="ready";const n=e.items.find(c=>!a.assignmentsByItemId[c.id]);I({focusSelector:n?`[data-matching-item="${g(n.id)}"]`:"[data-matching-reset]"})},P=()=>{a.activeItemId=null,a.activeTargetId=null,a.assignmentsByItemId={},a.resultsByItemId=null,a.complete=!1,t.dataset.matchingState="ready",delete t.dataset.matchingComplete,ft(t),I({focusSelector:"[data-matching-reset]"})},b=()=>{t.querySelectorAll(".matching-game__target-card, .matching-game__row").forEach(n=>{n.classList.remove("is-drop-target")})},L=()=>{y="",t.querySelectorAll(".matching-game__statement-card").forEach(n=>{n.classList.remove("is-drag-source")}),b(),d?.remove(),d=null},E=()=>{o=null,l=null},q=(n,c)=>{const i=n.cloneNode(!0);return i instanceof HTMLElement?(i.classList.add("matching-game__drag-image"),i.style.width=`${c.width}px`,i.style.transform=`translate(${c.left}px, ${c.top}px)`,document.body.append(i),d=i,i):null},x=(n,c)=>document.elementFromPoint(n,c)?.closest(J)??null,X=(n="")=>{if(y=n,b(),!n||S(e,a,n))return;const c=t.querySelector(`[data-matching-target-dropzone="${g(n)}"]`);c?.closest(".matching-game__target-card")?.classList.add("is-drop-target"),c?.closest(".matching-game__row")?.classList.add("is-drop-target")},C=(n,c)=>{if(!l||!d)return;let i=n-l.offsetX,u=c-l.offsetY;if(y){const v=t.querySelector(`[data-matching-target-dropzone="${g(y)}"]`)?.closest(".matching-game__row")?.querySelector(".matching-game__statement-card");if(v instanceof HTMLElement){const A=v.getBoundingClientRect();i+=(A.left-i)*.84,u+=(A.top-u)*.84}}d.style.transform=`translate(${i}px, ${u}px)`},Y=n=>{if(!o||a.complete)return;const{itemId:c,pointerId:i,offsetX:u,offsetY:h,sourceCard:f,sourceRect:v}=o;p(a,c)||(l={itemId:c,pointerId:i,offsetX:u,offsetY:h},f.classList.add("is-drag-source"),q(f,v),C(n.clientX,n.clientY))},z=n=>{if(!o||n.pointerId!==o.pointerId)return;const c=Math.hypot(n.clientX-o.startX,n.clientY-o.startY);if(!l&&c>8&&Y(n),!l)return;n.preventDefault();const i=x(n.clientX,n.clientY);X(i instanceof HTMLElement&&i.dataset.matchingTargetDropzone||""),C(n.clientX,n.clientY)},N=n=>{if(!(o&&n.pointerId!==o.pointerId)&&!(l&&n.pointerId!==l.pointerId)){if(l){const c=l.itemId,i=y;L(),E(),i&&T(c,i,{focusSelector:`[data-matching-target="${g(i)}"]`});return}if(o){const c=o.itemId;E(),B(c)}}};document.addEventListener("pointermove",z),document.addEventListener("pointerup",N),document.addEventListener("pointercancel",n=>{o&&n.pointerId!==o.pointerId||(L(),E())}),t.addEventListener("pointerdown",n=>{const i=(n.target instanceof Element?n.target:null)?.closest(w);if(!(i instanceof HTMLElement)||!t.contains(i)||n.button!==0)return;const u=i.dataset.matchingItem||"";if(!u||a.complete||p(a,u))return;const h=i.closest(".matching-game__statement-card");if(!(h instanceof HTMLElement))return;const f=h.getBoundingClientRect();o={itemId:u,pointerId:n.pointerId,startX:n.clientX,startY:n.clientY,offsetX:n.clientX-f.left,offsetY:n.clientY-f.top,sourceCard:h,sourceRect:f},i.setPointerCapture?.(n.pointerId)}),t.addEventListener("keydown",n=>{const i=(n.target instanceof Element?n.target:null)?.closest(w);!(i instanceof HTMLElement)||!t.contains(i)||(n.key==="Enter"||n.key===" ")&&(n.preventDefault(),B(i.dataset.matchingItem||""))}),t.addEventListener("click",n=>{const c=n.target instanceof Element?n.target:null,i=c?.closest(U);if(i instanceof HTMLElement&&t.contains(i)){D(i.dataset.matchingTarget||"");return}if(c?.closest("[data-matching-retry-wrong]")){H();return}c?.closest("[data-matching-reset]")&&P()}),I()}function tt(t){const e=t.querySelector(j);if(!(e instanceof HTMLScriptElement))return null;try{const r=JSON.parse(e.textContent||"{}");return!Array.isArray(r.items)||!Array.isArray(r.targets)||!r.items.length||!r.targets.length?null:r}catch{return null}}function et(){return{activeItemId:null,activeTargetId:null,assignmentsByItemId:{},resultsByItemId:null,complete:!1}}function nt(t,e){const r=!!e.resultsByItemId&&t.items.some(s=>e.resultsByItemId?.[s.id]?.correct===!1);return`
    ${e.complete?"":`
      <div class="matching-game__toolbar">
        <div class="matching-game__actions">
          <button class="matching-game__action" type="button" data-matching-reset>${m(t.resetLabel)}</button>
          ${r?`<button class="matching-game__action is-primary" type="button" data-matching-retry-wrong>${m(t.retryWrongOnlyLabel)}</button>`:""}
        </div>
      </div>
    `}

    <div class="matching-game__board">
      <div class="matching-game__head" aria-hidden="true">
        <span>${m(t.leftLabel)}</span>
        <span>${m(t.rightLabel)}</span>
      </div>
      <div class="matching-game__rows" data-matching-rows>
        ${at(t,e)}
      </div>
    </div>
  `}function at(t,e){return ct(t,e).map(r=>`
    <article class="${it(r)}" style="${yt(r.target.accent)}">
      ${rt(r,e)}
      <div class="matching-game__connector" aria-hidden="true">
        <span class="matching-game__connector-line"></span>
        <span class="matching-game__connector-head"></span>
      </div>
      ${st(r,t,e)}
    </article>
  `).join("")}function rt(t,e){const r=t.item;if(!r)return`
      <article class="matching-game__statement-card is-empty" aria-hidden="true">
        <span class="matching-game__statement-placeholder"></span>
      </article>
    `;const s=p(e,r.id);return`
    <article class="${ot(e,r)}">
      <button
        class="matching-game__statement-button"
        type="button"
        data-matching-item="${m(r.id)}"
        aria-pressed="${e.activeItemId===r.id?"true":"false"}"
        ${s?'disabled aria-disabled="true"':""}
      >
        <span>${m(r.text)}</span>
      </button>
    </article>
  `}function st(t,e,r){const s=t.target,a=S(e,r,s.id),d=_(e,r,s.id),o=s.hint?`matching-target-hint-${m(e.id)}-${m(s.id)}`:"";return`
    <article class="${dt(e,r,s)}" data-matching-target-dropzone="${m(s.id)}">
      <button
        class="matching-game__target-button"
        type="button"
        data-matching-target="${m(s.id)}"
        aria-pressed="${r.activeTargetId===s.id?"true":"false"}"
        ${o?`aria-describedby="${o}"`:""}
        ${t.isWrong?'aria-invalid="true"':""}
        ${a?'disabled aria-disabled="true"':""}
      >
        <span class="matching-game__target-mark" aria-hidden="true">${m(St(s))}</span>
        <span class="matching-game__target-copy">
          <strong>${m(s.label)}</strong>
          ${s.hint?`<span id="${o}">${m(s.hint)}</span>`:""}
          ${d?`<span class="sr-only">${m(e.statusPaired)}</span>`:""}
        </span>
      </button>
    </article>
  `}function ct(t,e){const r=t.items.filter(a=>!e.assignmentsByItemId[a.id]);let s=0;return t.targets.map(a=>{const d=_(t,e,a.id),o=d?k(t,d):r[s++]??null,l=o?e.resultsByItemId?.[o.id]:null;return{target:a,item:o,isPaired:!!d,isSelected:!!(o&&e.activeItemId===o.id||e.activeTargetId===a.id),isCorrect:l?.correct===!0,isWrong:l?.correct===!1}})}function it(t){return["matching-game__row",t.isPaired?"is-paired":"",t.isSelected?"is-selected":"",t.isCorrect?"is-correct":"",t.isWrong?"is-wrong":""].filter(Boolean).join(" ")}function ot(t,e){const r=t.resultsByItemId?.[e.id];return["matching-game__statement-card",t.assignmentsByItemId[e.id]?"is-assigned":"",t.activeItemId===e.id?"is-selected":"",r?.correct===!0?"is-correct":"",r?.correct===!1?"is-wrong":"",p(t,e.id)?"is-locked":""].filter(Boolean).join(" ")}function dt(t,e,r){const s=_(t,e,r.id),a=s?k(t,s):null,d=a?e.resultsByItemId?.[a.id]:null;return["matching-game__target-card",s?"is-linked":"",e.activeTargetId===r.id?"is-selected":"",d?.correct===!0?"is-correct":"",d?.correct===!1?"is-wrong":"",S(t,e,r.id)?"is-locked":""].filter(Boolean).join(" ")}function lt(t,e){const r={};for(const s of t.items){const d=e.assignmentsByItemId[s.id]===s.target;r[s.id]={correct:d,feedback:d?s.feedbackCorrect:s.feedbackWrong}}return r}function ut(t,e){if(e.complete)return t.completion.title;if(e.resultsByItemId){const r=t.items.filter(s=>e.resultsByItemId?.[s.id]?.correct===!0).length;return r===t.items.length?t.completion.title:`${t.statusWrong} ${r} / ${t.items.length}`}return e.activeItemId?t.statusSelectedItem:e.activeTargetId?t.statusSelectedTarget:Object.keys(e.assignmentsByItemId).length>0?t.statusPaired:t.statusIdle}function mt(t,e){return t.items.length>0&&t.items.every(r=>!!e.assignmentsByItemId[r.id])}function gt(t,e){return!!e.resultsByItemId&&t.items.every(r=>e.resultsByItemId?.[r.id]?.correct===!0)}function k(t,e){return t.items.find(r=>r.id===e)??null}function _(t,e,r){return t.items.find(s=>e.assignmentsByItemId[s.id]===r)?.id??null}function p(t,e){return t.complete||t.resultsByItemId?.[e]?.correct===!0}function S(t,e,r){const s=_(t,e,r);return e.complete||!!(s&&e.resultsByItemId?.[s]?.correct===!0)}function It(t){const e=t.querySelector(R);e&&(e.removeAttribute("hidden"),window.setTimeout(()=>e.classList.add("is-visible"),80))}function ft(t){const e=t.querySelector(R);e&&(e.classList.remove("is-visible"),e.setAttribute("hidden",""))}function pt(){return document.body instanceof HTMLElement&&document.body.dataset.surface==="dark"?"dark":"light"}function ht(t,e){t.querySelectorAll(F).forEach(r=>{const s=e==="dark"?r.dataset.avatarDark:r.dataset.avatarLight;s&&r.getAttribute("src")!==s&&r.setAttribute("src",s)})}function yt(t){return`--matching-target-color: ${K[t]??"var(--coach-accent)"}`}function St(t){return t.accent==="S"||t.accent==="E"||t.accent==="I"||t.accent==="R"||t.accent==="D"||t.accent==="V"?t.accent:t.label.trim().charAt(0)||"?"}function g(t){return typeof CSS<"u"&&typeof CSS.escape=="function"?CSS.escape(t):t.replace(/["\\]/g,"\\$&")}function m(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}Z();
