import{i as O,r as b}from"./rich-text.D3cabpR9.js";import"./katex.Do1981ih.js";import{m as L,i as s,h as A,s as T,r as R,e as v,a}from"./shared.BH4wzw6Y.js";const w="[data-multiple-choice-game]",q="[data-multiple-choice-config]",k="[data-multiple-choice-runtime]",M="[data-multiple-choice-status]",$="[data-multiple-choice-coach-validation]",x="[data-multiple-choice-coach-avatar]",S="[data-multiple-choice-option]",N="[data-multiple-choice-reset]",H={queued:!1};function B(e=document){L({scope:e,rootSelector:w,mountedDataKey:"multipleChoiceMounted",readyMountFlag:H,mountRoot:D})}function D(e){const n=G(e),t=e.querySelector(k),l=e.querySelector(M);if(!n||!t)return!1;const c=j(),u=(i=R())=>T(e,x,i);u(),e.dataset.multipleChoiceState="ready",window.addEventListener("id:surfacechange",i=>{const r=i instanceof CustomEvent&&i.detail?.surface==="dark"?"dark":"light";u(r)});const h=()=>{l&&(l.textContent=z(n,c))},d=({focusOptionId:i="",focusFirstOption:r=!1}={})=>{if(t.innerHTML=F(n,c),e.classList.toggle("is-complete",c.complete),h(),i){e.querySelector(`[data-multiple-choice-option="${v(i)}"]`)?.focus();return}r&&E(e)[0]?.focus()},p=()=>{c.complete=!0,e.dataset.multipleChoiceState="complete",e.dataset.multipleChoiceComplete="true",d({focusOptionId:c.selectedOptionId||""}),P(e)},m=i=>{if(!i||c.complete)return;const r=g(n,i);if(r){if(c.selectedOptionId=r.id,e.dataset.multipleChoiceState=r.correct?"complete":"selected",r.correct){p();return}d({focusOptionId:r.id})}},f=()=>{c.selectedOptionId=null,c.complete=!1,e.dataset.multipleChoiceState="ready",delete e.dataset.multipleChoiceComplete,Q(e),d({focusFirstOption:!0})},I=(i,r)=>{if(i.key==="Enter"||i.key===" "){i.preventDefault(),m(r.dataset.multipleChoiceOption||"");return}if(i.key==="Escape"&&c.selectedOptionId&&!c.complete){i.preventDefault(),f();return}const o=E(e),C=o.indexOf(r);if(C<0)return;const y=J(i.key,C,o.length);y!==C&&(i.preventDefault(),o[y]?.focus())};return e.addEventListener("click",i=>{const r=i.target instanceof Element?i.target:null,o=r?.closest(S);if(o instanceof HTMLElement&&e.contains(o)){m(o.dataset.multipleChoiceOption||"");return}r?.closest(N)&&f()}),e.addEventListener("keydown",i=>{const o=(i.target instanceof Element?i.target:null)?.closest(S);o instanceof HTMLElement&&e.contains(o)&&I(i,o)}),d(),!0}function G(e){const n=e.querySelector(q);if(!(n instanceof HTMLScriptElement))return null;try{const t=JSON.parse(n.textContent||"{}");return!t||typeof t!="object"||!s(t.id)||!O(t.question)||!s(t.optionsAriaLabel)||!s(t.resetLabel)||!s(t.statusIdle)||!s(t.statusWrong)||!s(t.statusCorrect)||!s(t.completion?.title)||!O(t.completion?.text)||!Array.isArray(t.options)||t.options.length<2||!A(t.options,l=>l.id)||!t.options.every(U)||t.options.filter(l=>l.correct).length!==1?null:t}catch{return null}}function U(e){return s(e.id)&&s(e.label)&&O(e.text)&&O(e.feedback)&&typeof e.correct=="boolean"}function j(){return{selectedOptionId:null,complete:!1}}function F(e,n){const t=n.selectedOptionId?g(e,n.selectedOptionId):null,l=t&&!t.correct?t.feedback:null,c=_(e,"question"),u=_(e,"feedback");return`
    <div class="multiple-choice-game__panel">
      <h3 class="multiple-choice-game__question" id="${a(c)}">${b(e.question)}</h3>
      <div
        class="multiple-choice-game__options"
        role="radiogroup"
        aria-labelledby="${a(c)}"
        aria-label="${a(e.optionsAriaLabel)}"
      >
        ${e.options.map(h=>V(e,n,h,u)).join("")}
      </div>
      ${l?`
        <div class="multiple-choice-game__feedback" id="${a(u)}" data-multiple-choice-feedback>
          <p>${b(l)}</p>
          <button class="multiple-choice-game__reset" type="button" data-multiple-choice-reset>${a(e.resetLabel)}</button>
        </div>
      `:""}
    </div>
  `}function V(e,n,t,l){const c=n.selectedOptionId===t.id,u=n.selectedOptionId?g(e,n.selectedOptionId):null,d=!!(u&&!u.correct)&&t.correct,p=c&&!t.correct,m=c&&t.correct||d,f=p?l:"";return`
    <article class="${K({selected:c,correct:m,wrong:p,recommended:d})}" role="presentation">
      <button
        class="multiple-choice-game__option-button"
        type="button"
        role="radio"
        data-multiple-choice-option="${a(t.id)}"
        data-multiple-choice-option-state="${W({selected:c,correct:m,wrong:p,recommended:d})}"
        aria-pressed="${c?"true":"false"}"
        aria-checked="${c?"true":"false"}"
        ${f?`aria-describedby="${a(f)}"`:""}
        ${p?'aria-invalid="true"':""}
        ${n.complete?'aria-disabled="true"':""}
      >
        <span class="multiple-choice-game__option-mark" aria-hidden="true">${a(t.label)}</span>
        <span class="multiple-choice-game__option-text">${b(t.text)}</span>
        ${m?`<span class="sr-only">${a(e.statusCorrect)}</span>`:""}
      </button>
    </article>
  `}function K({selected:e,correct:n,wrong:t,recommended:l}){return["multiple-choice-game__option",e?"is-selected":"",n?"is-correct":"",t?"is-wrong":"",l?"is-recommended":""].filter(Boolean).join(" ")}function W({selected:e,correct:n,wrong:t,recommended:l}){return t?"wrong":e&&n?"correct":l?"recommended":"idle"}function z(e,n){if(n.complete)return e.completion.title;const t=n.selectedOptionId?g(e,n.selectedOptionId):null;return t?t.correct?e.statusCorrect:e.statusWrong:e.statusIdle}function g(e,n){return e.options.find(t=>t.id===n)??null}function E(e){return Array.from(e.querySelectorAll(S))}function J(e,n,t){return t<=0?n:e==="ArrowRight"||e==="ArrowDown"?(n+1)%t:e==="ArrowLeft"||e==="ArrowUp"?(n-1+t)%t:e==="Home"?0:e==="End"?t-1:n}function _(e,n){return`${e.id.replace(/[^a-z0-9_-]/gi,"-")}-${n}`}function P(e){const n=e.querySelector($);n&&(n.removeAttribute("hidden"),window.setTimeout(()=>n.classList.add("is-visible"),80))}function Q(e){const n=e.querySelector($);n&&(n.classList.remove("is-visible"),n.setAttribute("hidden",""))}B();
