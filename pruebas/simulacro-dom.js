/* Simulacro mínimo del navegador para ejecutar app.js fuera del navegador */
function nodo(tag){
  const n = {
    tagName:(tag||'div').toUpperCase(), children:[], dataset:{}, style:{setProperty(){}},
    classList:{ _s:new Set(), add(...c){c.forEach(x=>this._s.add(x))}, remove(...c){c.forEach(x=>this._s.delete(x))},
                toggle(c,v){ v===undefined ? (this._s.has(c)?this._s.delete(c):this._s.add(c)) : (v?this._s.add(c):this._s.delete(c)); },
                contains(c){return this._s.has(c)} },
    _text:'', _html:'', value:'', checked:false,
    get textContent(){ return this._text || String(this._html||'').replace(/<[^>]+>/g,''); }, set textContent(v){this._text=String(v)},
    get innerHTML(){return this._html}, set innerHTML(v){this._html=String(v); if(v==='') this.children=[];},
    appendChild(c){c._padre=this; this.children.push(c); return c}, remove(){ if(this._padre){const i=this._padre.children.indexOf(this); if(i>=0)this._padre.children.splice(i,1);} }, 
    setAttribute(){}, getAttribute(){return null}, addEventListener(){},
    querySelector(sel){ const h=String(this._html||''); const m=h.match(/<p class="dicho">([\s\S]*?)<\/p>/); const n2=nodo('p'); if(m){n2._html=m[1]; n2._text=m[1].replace(/<[^>]+>/g,'');} n2.querySelectorAll=()=>[]; return n2; }, querySelectorAll(){return []},
    scrollIntoView(){}, focus(){}, click(){}, getBoundingClientRect(){return {top:0,bottom:62,left:0,right:360,width:360,height:62}}, onclick:null, oninput:null, onchange:null,
    scrollTop:0, scrollHeight:0, clientWidth:300, offsetLeft:0, offsetWidth:100,
    get lastElementChild(){return this.children[this.children.length-1]||null}
  };
  return n;
}
const REG = new Map();
global.document = {
  createElement:tag=>nodo(tag),
  querySelector(sel){ if(!REG.has(sel)) REG.set(sel, nodo()); return REG.get(sel); },
  querySelectorAll(){ return []; },
  body:nodo(), head:nodo(), addEventListener(){}
};
global.window = { addEventListener(){}, location:{reload(){}}, scrollTo(){},
                  matchMedia:()=>({matches:false}), speechSynthesis:undefined };
global.localStorage = { _d:{}, getItem(k){return this._d[k]??null}, setItem(k,v){this._d[k]=v}, removeItem(k){delete this._d[k]} };
global.navigator = { serviceWorker:undefined };
global.requestAnimationFrame = f=>setTimeout(f,0);
global.alert = ()=>{}; global.confirm = ()=>true;
global.fetch = async ()=>{ throw new Error('sin red en la prueba'); };
global.URL.createObjectURL = () => 'blob:prueba'; global.URL.revokeObjectURL = () => {};
global.window.open = () => null;
global.Blob = class { constructor(p,o){ this.size = 1; this.type = (o||{}).type; } };
global.__nodo = nodo; global.__REG = REG;
