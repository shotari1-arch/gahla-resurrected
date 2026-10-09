function rootElement(app){
  const el=app?.element;
  if(!el)return null;
  if(typeof HTMLElement!=="undefined" && el instanceof HTMLElement)return el;
  return el?.[0]||el;
}

function windowContent(root){
  if(!root)return null;
  return root.closest?.(".window-content") || root.parentElement?.closest?.(".window-content") || root.parentElement || null;
}

export function captureApplicationScroll(app){
  const root=rootElement(app);
  if(!root?.querySelectorAll)return;
  const nested={};
  root.querySelectorAll("[data-gahla-scroll]").forEach((el,index)=>{
    const key=el.dataset.gahlaScroll||String(index);
    nested[key]={top:Number(el.scrollTop||0),left:Number(el.scrollLeft||0)};
  });
  const wc=windowContent(root);
  app._gahlaScrollState={
    rootTop:Number(root.scrollTop||0),rootLeft:Number(root.scrollLeft||0),
    windowTop:Number(wc?.scrollTop||0),windowLeft:Number(wc?.scrollLeft||0),nested
  };
}

export function restoreApplicationScroll(app){
  const state=app?._gahlaScrollState;
  const apply=()=>{
    const root=rootElement(app);if(!root)return;
    if(state){
      root.scrollTop=state.rootTop||0;root.scrollLeft=state.rootLeft||0;
      const wc=windowContent(root);if(wc){wc.scrollTop=state.windowTop||0;wc.scrollLeft=state.windowLeft||0;}
      root.querySelectorAll?.("[data-gahla-scroll]").forEach((el,index)=>{
        const key=el.dataset.gahlaScroll||String(index),saved=state.nested?.[key];
        if(saved){el.scrollTop=saved.top||0;el.scrollLeft=saved.left||0;}
      });
    }
    // V2 potrafi rozpocząć _prepareContext już po zmianach DOM. Dlatego po każdym
    // renderze śledzimy scroll na żywo i stan jest aktualny jeszcze przed następnym rerenderem.
    const wc=windowContent(root);
    const tracked=[root,wc,...(root.querySelectorAll?.("[data-gahla-scroll]")||[])].filter(Boolean);
    for(const el of tracked){
      if(el.dataset?.gahlaScrollBound==="1")continue;
      if(el.dataset)el.dataset.gahlaScrollBound="1";
      el.addEventListener?.("scroll",()=>captureApplicationScroll(app),{passive:true});
    }
    captureApplicationScroll(app);
  };
  const raf=globalThis.requestAnimationFrame;
  if(typeof raf==="function")raf(()=>raf(apply)); else setTimeout(apply,0);
}
