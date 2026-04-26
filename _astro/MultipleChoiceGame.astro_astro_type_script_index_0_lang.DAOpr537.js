const _="[data-multiple-choice-game]",$="[data-multiple-choice-config]",L="[data-multiple-choice-runtime]",A="[data-multiple-choice-status]",b="[data-multiple-choice-coach-validation]",I="[data-multiple-choice-coach-avatar]",S="[data-multiple-choice-option]",T="[data-multiple-choice-reset]";function w(e=document){const t=()=>{e.querySelectorAll(_).forEach(n=>{n.dataset.multipleChoiceMounted!=="true"&&(n.dataset.multipleChoiceMounted="true",v(n))})};if(document.readyState==="loading"){window.addEventListener("DOMContentLoaded",t,{once:!0});return}t()}function v(e){const t=k(e),n=e.querySelector(L),r=e.querySelector(A);if(!t||!n)return;const i=q(),s=(c=U())=>j(e,c);s(),e.dataset.multipleChoiceState="ready",window.addEventListener("id:surfacechange",c=>{const o=c instanceof CustomEvent&&c.detail?.surface==="dark"?"dark":"light";s(o)});const f=()=>{r&&(r.textContent=x(t,i))},u=({focusOptionId:c="",focusFirstOption:o=!1}={})=>{if(n.innerHTML=R(t,i),e.classList.toggle("is-complete",i.complete),f(),c){e.querySelector(`[data-multiple-choice-option="${F(c)}"]`)?.focus();return}o&&C(e)[0]?.focus()},d=()=>{i.complete=!0,e.dataset.multipleChoiceState="complete",e.dataset.multipleChoiceComplete="true",u({focusOptionId:i.selectedOptionId||""}),D(e)},p=c=>{if(!c||i.complete)return;const o=h(t,c);if(o){if(i.selectedOptionId=o.id,e.dataset.multipleChoiceState=o.correct?"complete":"selected",o.correct){d();return}u({focusOptionId:o.id})}},m=()=>{i.selectedOptionId=null,i.complete=!1,e.dataset.multipleChoiceState="ready",delete e.dataset.multipleChoiceComplete,G(e),u({focusFirstOption:!0})},y=(c,o)=>{if(c.key==="Enter"||c.key===" "){c.preventDefault(),p(o.dataset.multipleChoiceOption||"");return}if(c.key==="Escape"&&i.selectedOptionId&&!i.complete){c.preventDefault(),m();return}const l=C(e),O=l.indexOf(o);if(O<0)return;const g=B(c.key,O,l.length);g!==O&&(c.preventDefault(),l[g]?.focus())};e.addEventListener("click",c=>{const o=c.target instanceof Element?c.target:null,l=o?.closest(S);if(l instanceof HTMLElement&&e.contains(l)){p(l.dataset.multipleChoiceOption||"");return}o?.closest(T)&&m()}),e.addEventListener("keydown",c=>{const l=(c.target instanceof Element?c.target:null)?.closest(S);l instanceof HTMLElement&&e.contains(l)&&y(c,l)}),u()}function k(e){const t=e.querySelector($);if(!(t instanceof HTMLScriptElement))return null;try{const n=JSON.parse(t.textContent||"{}");return!Array.isArray(n.options)||n.options.length<2||n.options.filter(r=>r.correct).length!==1?null:n}catch{return null}}function q(){return{selectedOptionId:null,complete:!1}}function R(e,t){const n=t.selectedOptionId?h(e,t.selectedOptionId):null,r=n&&!n.correct?n.feedback:"",i=E(e,"question"),s=E(e,"feedback");return`
    <div class="multiple-choice-game__panel">
      <h3 class="multiple-choice-game__question" id="${a(i)}">${a(e.question)}</h3>
      <div
        class="multiple-choice-game__options"
        role="radiogroup"
        aria-labelledby="${a(i)}"
        aria-label="${a(e.optionsAriaLabel)}"
      >
        ${e.options.map(f=>M(e,t,f,s)).join("")}
      </div>
      ${r?`
        <div class="multiple-choice-game__feedback" id="${a(s)}" data-multiple-choice-feedback>
          <p>${a(r)}</p>
          <button class="multiple-choice-game__reset" type="button" data-multiple-choice-reset>${a(e.resetLabel)}</button>
        </div>
      `:""}
    </div>
  `}function M(e,t,n,r){const i=t.selectedOptionId===n.id,s=t.selectedOptionId?h(e,t.selectedOptionId):null,u=!!(s&&!s.correct)&&n.correct,d=i&&!n.correct,p=i&&n.correct||u,m=d?r:"";return`
    <article class="${H({selected:i,correct:p,wrong:d,recommended:u})}" role="presentation">
      <button
        class="multiple-choice-game__option-button"
        type="button"
        role="radio"
        data-multiple-choice-option="${a(n.id)}"
        data-multiple-choice-option-state="${N({selected:i,correct:p,wrong:d,recommended:u})}"
        aria-pressed="${i?"true":"false"}"
        aria-checked="${i?"true":"false"}"
        ${m?`aria-describedby="${a(m)}"`:""}
        ${d?'aria-invalid="true"':""}
        ${t.complete?'aria-disabled="true"':""}
      >
        <span class="multiple-choice-game__option-mark" aria-hidden="true">${a(n.label)}</span>
        <span class="multiple-choice-game__option-text">${a(n.text)}</span>
        ${p?`<span class="sr-only">${a(e.statusCorrect)}</span>`:""}
      </button>
    </article>
  `}function H({selected:e,correct:t,wrong:n,recommended:r}){return["multiple-choice-game__option",e?"is-selected":"",t?"is-correct":"",n?"is-wrong":"",r?"is-recommended":""].filter(Boolean).join(" ")}function N({selected:e,correct:t,wrong:n,recommended:r}){return n?"wrong":e&&t?"correct":r?"recommended":"idle"}function x(e,t){if(t.complete)return e.completion.title;const n=t.selectedOptionId?h(e,t.selectedOptionId):null;return n?n.correct?e.statusCorrect:e.statusWrong:e.statusIdle}function h(e,t){return e.options.find(n=>n.id===t)??null}function C(e){return Array.from(e.querySelectorAll(S))}function B(e,t,n){return n<=0?t:e==="ArrowRight"||e==="ArrowDown"?(t+1)%n:e==="ArrowLeft"||e==="ArrowUp"?(t-1+n)%n:e==="Home"?0:e==="End"?n-1:t}function E(e,t){return`${e.id.replace(/[^a-z0-9_-]/gi,"-")}-${t}`}function D(e){const t=e.querySelector(b);t&&(t.removeAttribute("hidden"),window.setTimeout(()=>t.classList.add("is-visible"),80))}function G(e){const t=e.querySelector(b);t&&(t.classList.remove("is-visible"),t.setAttribute("hidden",""))}function U(){return document.body instanceof HTMLElement&&document.body.dataset.surface==="dark"?"dark":"light"}function j(e,t){e.querySelectorAll(I).forEach(n=>{const r=t==="dark"?n.dataset.avatarDark:n.dataset.avatarLight;r&&n.getAttribute("src")!==r&&n.setAttribute("src",r)})}function F(e){return typeof CSS<"u"&&typeof CSS.escape=="function"?CSS.escape(e):e.replace(/["\\]/g,"\\$&")}function a(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}w();
