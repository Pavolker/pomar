const ENV_GEMINI_API_KEY=(typeof window!=='undefined'&&window.GEMINI_API_KEY)||((typeof import.meta!=='undefined'&&import.meta&&import.meta.env&&import.meta.env.VITE_GEMINI_API_KEY)||'');
if(ENV_GEMINI_API_KEY&&typeof window!=='undefined'){window.GEMINI_API_KEY=ENV_GEMINI_API_KEY}
const SUBTLE_LEAVES_TEXTURE="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='%2322c55e' fill-opacity='.08'%3E%3Cellipse cx='40' cy='20' rx='28' ry='14'/%3E%3Cellipse cx='140' cy='60' rx='22' ry='11'/%3E%3Cellipse cx='60' cy='120' rx='32' ry='16'/%3E%3Cellipse cx='10' cy='100' rx='18' ry='9'/%3E%3Cellipse cx='120' cy='130' rx='26' ry='13'/%3E%3C/g%3E%3C/svg%3E";
const CSV_PATH=encodeURI('FRUTA CASA.csv')
const months=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
let frutas=[]
let page='home'
let selected=null
let treeInfo=null
let chatSession=null
let messages=[{role:'model',content:'Olá! Sou o Jardineiro Sábio. Como posso ajudar com seu pomar hoje?'}]
let userFrutas=[]
let imageCache={}
let treeInfoCache={}

function normalize(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}

async function loadCSV(){const res=await fetch(CSV_PATH);const text=await res.text();const lines=text.trim().split(/\r?\n/);lines.shift();frutas=lines.map(l=>{const c=l.split(';');return{nome:c[0],cientifico:c[1],frutificacao:c[2],nutriente:c[3],adubacao:c[4]}})}

function monthInRange(range,idx){const r=range.toLowerCase();if(r.includes('todo o ano'))return true;if(r.includes('não se aplica'))return false;const parts=r.split(' a ').map(p=>p.trim());if(parts.length===2){const s=months.indexOf(parts[0]);const e=months.indexOf(parts[1]);if(s===-1||e===-1)return false;return s<=e?idx>=s&&idx<=e:idx>=s||idx<=e}const m=months.findIndex(m=>r.includes(m));return m===idx}

function svgSearch(){return'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>'}
function svgBack(){return'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>'}
function svgChat(){return'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.917-.464-1.255a5.971 5.971 0 0 1-1.427-3.64c0-4.556 4.03-8.25 9-8.25Z"/></svg>'}
function svgSend(){return'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"/></svg>'}

function fruitIcon(name){
  const n=normalize(name)
  const map={
    'abacate':'🥑','abacateiro':'🥑',
    'abacaxi':'🍍',
    'acerola':'🍒',
    'ameixa':'🍑','ameixa amarela':'🍑',
    'amora':'🫐',
    'banana':'🍌',
    'caju':'🥜',
    'carambola':'⭐',
    'cereja':'🍒',
    'figo':'🍇',
    'fruta do conde':'🌿',
    'goiaba':'🌿',
    'jabuticaba':'🌿','jabuticabeira':'🌿',
    'jamelao':'🌿',
    'laranja':'🍊','laranjeira':'🍊',
    'limao':'🍋','limoeiro':'🍋','limao galego':'🍋','limao siciliano':'🍋','limao taiti':'🍋',
    'maca':'🍎','macieira':'🍎',
    'mamao':'🌿',
    'manga':'🥭','mangueira':'🥭',
    'maracuja':'🌿',
    'mexerica':'🍊',
    'mirtilo':'🫐',
    'pessego':'🍑',
    'pitaia':'🌺',
    'pitanga':'🍒',
    'roma':'🍎','romã':'🍎',
    'pera':'🍐',
    'tamarino':'🌿',
    'melao':'🍈','melão':'🍈',
    'morango':'🍓',
    'framboesa':'🍓',
    'toranja':'🍊','torange vermelha':'🍊'
  }
  return map[n]||'🌿'
}

function fruitSvg(name){
  const n=normalize(name)
  const style='style="vertical-align:middle;margin-right:4px"'
  const leaf='<path d="M16 6c-2 0-3.5 1.2-4.5 2.4C10.5 9.6 9 11 7 11c2-3 5.5-6 9-6Z" fill="#2e7d32"/>'
  const citrus=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" ${style}><circle cx="12" cy="12" r="8" fill="#fb8c00"/>${leaf}</svg>`
  const pomaceous=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" ${style}><circle cx="12" cy="12" r="8" fill="#d32f2f"/>${leaf}</svg>`
  const berry=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" ${style}><circle cx="10" cy="12" r="5" fill="#8e24aa"/><circle cx="15" cy="10" r="4" fill="#ab47bc"/>${leaf}</svg>`
  const tropical=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" ${style}><circle cx="12" cy="12" r="8" fill="#fdd835"/>${leaf}</svg>`
  const generic=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" ${style}><circle cx="12" cy="12" r="8" fill="#66bb6a"/>${leaf}</svg>`
  if(n.includes('laranja')||n.includes('mexerica')||n.includes('toranja')||n.includes('limao')) return citrus
  if(n.includes('maca')||n.includes('pera')||n.includes('romã')||n.includes('roma')) return pomaceous
  if(n.includes('morango')||n.includes('mirtilo')||n.includes('amora')||n.includes('framboesa')) return berry
  if(n.includes('manga')||n.includes('abacaxi')||n.includes('abacate')||n.includes('mamao')||n.includes('melao')||n.includes('caju')||n.includes('pitaia')||n.includes('pitanga')||n.includes('cereja')||n.includes('goiaba')||n.includes('jabuticaba')) return tropical
  return generic
}

function renderSimple(){
  const root=document.getElementById('root')
  if(!root) return
  root.innerHTML=`<div class="min-h-screen flex items-center justify-center bg-emerald-50" style="background-image:url('${SUBTLE_LEAVES_TEXTURE}')"><div class="text-center"><div class="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div><p class="text-emerald-800 text-lg font-medium">Carregando informações do pomar...</p></div></div>`
}

function updateFeaturedIcons(){
  document.querySelectorAll('[data-name]').forEach(el=>{
    const n=el.getAttribute('data-name')
    const h=el.querySelector('h3')
    if(h&&n){h.innerHTML=`${fruitSvg(n)} ${n}`}
  })
}

function ensureIconsWatcher(){
  setInterval(()=>{
    try{
      updateFeaturedIcons()
      const h=document.querySelector('main header h1')
      if(h&&selected){h.innerHTML=`${fruitSvg(selected.nome)} ${selected.nome}`}
    }catch(e){}
  },500)
}

function removeInitialPicsum(){
  try{
    document.querySelectorAll('img').forEach(img=>{
      if(img.src.includes('picsum.photos/id/')){
        img.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAQAIBRAA7'
      }
    })
  }catch(e){}
}
function loadImageCache(){
  try{ imageCache = JSON.parse(localStorage.getItem('image_cache')||'{}') } catch { imageCache = {} }
}
function saveImageCache(){ localStorage.setItem('image_cache', JSON.stringify(imageCache)) }
function loadTreeInfoCache(){
  try{treeInfoCache=JSON.parse(localStorage.getItem('tree_info_cache')||'{}')}catch{treeInfoCache={}}
}
function saveTreeInfoCache(){localStorage.setItem('tree_info_cache',JSON.stringify(treeInfoCache))}
async function wikiThumb(title){
  const enc = encodeURIComponent(title)
  for (const base of ['https://pt.wikipedia.org','https://en.wikipedia.org']){
    try{
      const r = await fetch(`${base}/api/rest_v1/page/summary/${enc}`)
      if(!r.ok) continue
      const j = await r.json()
      if (j && j.thumbnail && j.thumbnail.source) return j.thumbnail.source
    }catch{}
  }
  return null
}
async function getImageFor(name, scientific){
  const key = scientific || name
  if (imageCache[key]) return imageCache[key]
  let url = null
  if (scientific){ url = await wikiThumb(scientific) }
  if (!url){ url = await wikiThumb(name) }
  if (!url){ url = `https://picsum.photos/seed/${encodeURIComponent(name)}/1200/400` }
  imageCache[key] = url
  saveImageCache()
  return url
}

function getHomeImage(name){
  return `https://picsum.photos/seed/${encodeURIComponent(name)}/400/400`
}
async function ensureFeaturedImagesOnce(){
  try{
    const tasks=[]
    document.querySelectorAll('[data-name]').forEach(el=>{
      tasks.push((async()=>{
        const n=el.getAttribute('data-name')||''
        const img=el.querySelector('img')
        const rec=findCsvRecordByName(n)
        const ci=rec?.cientifico||''
        const url=await getImageFor(n, ci)
        if(img&&url){ img.src = url }
      })())
    })
    await Promise.all(tasks)
  }catch(e){}
}
function loadUserFrutas(){
  try{userFrutas=JSON.parse(localStorage.getItem('user_frutas')||'[]')}catch{userFrutas=[]}
}
function saveUserFrutas(){localStorage.setItem('user_frutas',JSON.stringify(userFrutas))}
function mergeUserFrutas(){
  const set=new Set(frutas.map(f=>normalize(f.nome)))
  userFrutas.forEach(f=>{if(!set.has(normalize(f.nome))){frutas.push(f)}})
}
function ensureAddButtonWatcher(){
  setInterval(()=>{
    const form=document.querySelector('form')
    if(!form) return
    if(!document.getElementById('addBtn')){
      const addBtn=document.createElement('button')
      addBtn.id='addBtn'
      addBtn.className='bg-emerald-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition'
      addBtn.setAttribute('aria-label','Adicionar árvore ou fruta')
      addBtn.innerHTML='<span class="font-semibold">+ Árvores/Frutas</span>'
      const wrap=document.createElement('div')
      wrap.className='flex justify-center mb-8'
      wrap.appendChild(addBtn)
      form.parentNode.insertBefore(wrap, form.nextSibling)
      addBtn.addEventListener('click',openAddModal)
    }
  },500)
}
function openAddModal(){
  const m=document.createElement('div')
  m.id='addModal'
  m.className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
  m.innerHTML=`<div class="bg-white rounded-2xl shadow-xl p-6 w-11/12 max-w-md border border-green-100"><h2 class="text-2xl font-bold text-emerald-800 mb-4">Nova árvore</h2><div class="grid gap-3"><input id="addNome" type="text" placeholder="Nome Popular" class="w-full bg-gray-100 rounded-lg p-3"></div><div class="flex gap-3 mt-5"><button id="addSave" class="flex-1 bg-emerald-600 text-white rounded-lg p-3">Salvar</button><button id="addCancel" class="flex-1 bg-gray-200 text-gray-700 rounded-lg p-3">Cancelar</button></div></div>`
  document.body.appendChild(m)
  document.getElementById('addCancel').addEventListener('click',()=>{m.remove()})
  document.getElementById('addSave').addEventListener('click',async()=>{
    const btn=document.getElementById('addSave')
    const nome=document.getElementById('addNome').value.trim()
    if(!nome){return}
    btn.textContent='Salvando...'
    btn.disabled=true
    let cient=''
    let fru='N/D', adu='N/D', nut='N/D'
    try{
      const info=await getTreeInfo(nome)
      cient=info?.scientificName||''
    }catch{}
    try{
      const enr=await enrichFields(nome)
      if(enr){fru=enr.frutificacao||fru;adu=enr.adubacao||adu;nut=enr.nutriente||nut}
    }catch{}
    const rec={nome:nome,cientifico:cient,frutificacao:fru,adubacao:adu,nutriente:nut}
    frutas.push(rec)
    userFrutas.push(rec)
    saveUserFrutas()
    m.remove()
    render()
  })
}
function findCsvRecordByName(name){
  const q=normalize(name)
  let r=frutas.find(f=>normalize(f.nome)===q)
  if(r) return r
  r=frutas.find(f=>normalize(f.nome).includes(q)||q.includes(normalize(f.nome)))
  if(r) return r
  const syn={
    'laranjeira':'laranja',
    'limoeiro':'limao',
    'macieira':'maca',
    'mangueira':'manga',
    'abacateiro':'abacate',
    'jabuticabeira':'jabuticaba'
  }
  const base=syn[q]
  if(base){
    const list=frutas.filter(f=>normalize(f.nome).startsWith(base))
    if(list.length) return list[0]
  }
  if(q==='limao'){const list=frutas.filter(f=>normalize(f.nome).startsWith('limao'));if(list.length) return list[0]}
  if(q==='laranja'){const list=frutas.filter(f=>normalize(f.nome).startsWith('laranja'));if(list.length) return list[0]}
  return null
}

function render(){const root=document.getElementById('root');if(page==='home'){const total=frutas.length;root.innerHTML=`<div class="min-h-screen bg-green-50 text-gray-800 p-4 sm:p-6 lg:p-8" style="background-image:url('${SUBTLE_LEAVES_TEXTURE}')"><div class="max-w-4xl mx-auto"><header class="text-center my-8 sm:my-12"><h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-emerald-800">Pomar Casa Y7</h1><p class="mt-4 text-lg text-emerald-700">Seu guia para um pomar saudável e produtivo.</p></header><form class="relative mb-4"><input id="searchInput" type="text" placeholder="Procure por uma fruta ou árvore..." class="w-full pl-12 pr-4 py-4 text-lg bg-white border-2 border-green-200 rounded-full shadow-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition duration-300"/><div class="absolute left-4 top-1/2 -translate-y-1/2">${svgSearch()}</div></form><div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12"><div class="flex items-center gap-4 bg-white/70 backdrop-blur-sm border border-green-100 rounded-2xl px-5 py-3 shadow"><div><p class="text-xs uppercase tracking-wider text-emerald-700">Árvores catalogadas</p><p class="text-3xl font-bold text-emerald-900" id="fruitCount">${total}</p></div></div><button id="addBtn" class="w-full sm:w-auto bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition font-semibold flex items-center justify-center gap-2" aria-label="Adicionar árvore ou fruta"><span class="text-lg">+</span><span>Árvores/Frutas</span></button></div><section><h2 class="text-2xl font-bold text-emerald-800 mb-6 text-center">Ou explore algumas populares:</h2><div class="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">${[{name:'Laranjeira',image:'1084'},{name:'Limoeiro',image:'102'},{name:'Macieira',image:'1079'},{name:'Mangueira',image:'219'},{name:'Abacateiro',image:'429'},{name:'Jabuticabeira',image:'431'}].map(t=>`<div data-name="${t.name}" class="group relative rounded-xl overflow-hidden shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-300"><img src="https://picsum.photos/id/${t.image}/400/400" alt="${t.name}" class="w-full h-full object-cover"/><div class="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-colors duration-300"></div><h3 class="absolute bottom-4 left-4 text-white text-xl font-bold">${t.name}</h3></div>`).join('')}</div></section></div><button id="chatBtn" class="fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transform hover:scale-110 transition-all duration-300 z-50 flex items-center gap-2" aria-label="Converse com o Jardineiro Sábio">${svgChat()}<span class="hidden sm:inline">Jardineiro Sábio</span></button></div>`;const input=document.getElementById('searchInput');input.addEventListener('input',()=>{const q=normalize(input.value);if(!q){return}const found=frutas.find(f=>normalize(f.nome).includes(q)||normalize(f.cientifico).includes(q));if(found){selected=found;page='detail';renderDetail()}});document.querySelectorAll('[data-name]').forEach(el=>el.addEventListener('click',()=>{selected=frutas.find(f=>normalize(f.nome).includes(normalize(el.getAttribute('data-name'))))||{nome:el.getAttribute('data-name'),cientifico:'',frutificacao:'',nutriente:'',adubacao:''};page='detail';renderDetail()}));const chatBtn=document.getElementById('chatBtn');if(chatBtn){chatBtn.addEventListener('click',()=>{page='chat';renderChat()})}const add=document.getElementById('addBtn');if(add){add.addEventListener('click',openAddModal)}}}

async function getTreeInfo(name){
  const cacheKey=normalize(name)
  if(treeInfoCache[cacheKey]){
    return treeInfoCache[cacheKey]
  }
  const key=localStorage.getItem('GEMINI_API_KEY')||window.GEMINI_API_KEY||''
  if(!key){return null}
  const mod=await import('@google/genai')
  const ai=new mod.GoogleGenAI({apiKey:key})
  const schema={type:mod.Type.OBJECT,properties:{name:{type:mod.Type.STRING},scientificName:{type:mod.Type.STRING},description:{type:mod.Type.STRING},care:{type:mod.Type.OBJECT,properties:{sunlight:{type:mod.Type.STRING},watering:{type:mod.Type.STRING},soil:{type:mod.Type.STRING}},required:['sunlight','watering','soil']},pruningHarvest:{type:mod.Type.STRING},pests:{type:mod.Type.ARRAY,items:{type:mod.Type.OBJECT,properties:{name:{type:mod.Type.STRING},description:{type:mod.Type.STRING}},required:['name','description']}}},required:['name','scientificName','description','care','pruningHarvest','pests']}
  const resp=await ai.models.generateContent({model:'gemini-2.5-flash',contents:`Forneça informações detalhadas sobre a árvore frutífera: ${name}. Responda em Português do Brasil.`,config:{responseMimeType:'application/json',responseSchema:schema}})
  const jsonText=resp.text.trim()
  const data=JSON.parse(jsonText)
  treeInfoCache[cacheKey]=data
  saveTreeInfoCache()
  return data
}

async function enrichFields(name){
  const cache=JSON.parse(localStorage.getItem('enrich')||'{}')
  if(cache[name]&&cache[name].frutificacao&&cache[name].adubacao&&cache[name].nutriente){
    return cache[name]
  }
  const key=localStorage.getItem('GEMINI_API_KEY')||window.GEMINI_API_KEY||''
  if(!key){return cache[name]||null}
  const mod=await import('@google/genai')
  const ai=new mod.GoogleGenAI({apiKey:key})
  const prompt=`Para a espécie "${name}", informe somente para o Brasil: (1) Meses de Frutificação (formato: "Mês a Mês" ou "Todo o ano"); (2) Época ideal para Adubação (ex.: "Março a maio"); (3) Nutriente-chave (um entre Nitrogênio, Fósforo, Potássio, Cálcio, Magnésio). Responda em JSON com campos {"frutificacao","adubacao","nutriente"}.`
  try{
    const resp=await ai.models.generateContent({model:'gemini-2.5-flash',contents:prompt,config:{responseMimeType:'application/json'}})
    const data=JSON.parse(resp.text.trim())
    if(data&&data.frutificacao&&data.adubacao&&data.nutriente){
      cache[name]=data
      localStorage.setItem('enrich',JSON.stringify(cache))
      return data
    }
  }catch(e){/* noop */}
  return cache[name]||null
}

function csvDescription(f){
  const families={
    'maca':'Rosaceae','macieira':'Rosaceae','pera':'Rosaceae','pessego':'Rosaceae','ameixa':'Rosaceae','cereja':'Rosaceae','amora':'Rosaceae','framboesa':'Rosaceae',
    'laranja':'Rutaceae','laranjeira':'Rutaceae','mexerica':'Rutaceae','limao':'Rutaceae','limoeiro':'Rutaceae','toranja':'Rutaceae','torange vermelha':'Rutaceae',
    'manga':'Anacardiaceae','mangueira':'Anacardiaceae','caju':'Anacardiaceae','siriguela':'Anacardiaceae',
    'abacate':'Lauraceae','abacateiro':'Lauraceae',
    'banana':'Musaceae',
    'mamao':'Caricaceae',
    'maracuja':'Passifloraceae',
    'pitaia':'Cactaceae',
    'jabuticaba':'Myrtaceae','jabuticabeira':'Myrtaceae','pitanga':'Myrtaceae','goiaba':'Myrtaceae','araca':'Myrtaceae','araça':'Myrtaceae','jamelao':'Myrtaceae','jamelão':'Myrtaceae','cabeludinha':'Myrtaceae',
    'figo':'Moraceae',
    'roma':'Lythraceae','romã':'Lythraceae',
    'melao':'Cucurbitaceae','melão':'Cucurbitaceae',
    'mirtilo':'Ericaceae',
    'graviola':'Annonaceae','fruta do conde':'Annonaceae','araticum':'Annonaceae',
    'lichia':'Sapindaceae',
    'baru':'Fabaceae','tamarino':'Fabaceae',
    'cana':'Poaceae',
    'cacau':'Malvaceae',
    'caqui':'Ebenaceae',
    'carambola':'Oxalidaceae',
    'abil':'Sapotaceae',
    'abacaxi':'Bromeliaceae'
  }
  const temperate={'maca':1,'macieira':1,'pera':1,'pessego':1,'ameixa':1,'cereja':1,'mirtilo':1}
  const nRaw=(f.nome||'').toLowerCase()
  const nNorm=nRaw.normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  const nome=f.nome||''
  const cient=f.cientifico||''
  const fam=families[nNorm]
  const clima=temperate[nNorm]? 'climas temperados' : 'climas tropicais e subtropicais'
  const folhagem=temperate[nNorm]? 'caduca' : 'perene'
  const poli=temperate[nNorm]? 'necessita polinização cruzada' : ''
  const frio=temperate[nNorm]? 'requer uma quantidade de horas de frio para florescer e frutificar' : ''
  const fru=f.frutificacao&&f.frutificacao.toLowerCase()!=='não se aplica'? f.frutificacao : 'períodos sazonais conforme a espécie'
  const adu=f.adubacao&&f.adubacao.toLowerCase()!=='não se aplica'? f.adubacao : 'épocas adequadas à espécie'
  const nut=f.nutriente||'nutrientes essenciais'
  const famTxt=fam? ` da família ${fam}` : ''
  const traits=`A árvore é ${folhagem}${poli?`, ${poli}`:''}${frio?` e ${frio}`:''}.`
  return `A ${nome}${cient?` (${cient})`:''} é uma árvore frutífera${famTxt}, cultivada em ${clima}, conhecida por produzir frutos carnudos e ricos em água, açúcares, vitaminas e pectina. ${traits} Frutifica em ${fru}. Recomenda-se adubação em ${adu} com foco em ${nut}.`
}

function pestsFor(name){
  const n=normalize(name)
  if(n.includes('laranja')||n.includes('limao')||n.includes('mexerica')||n.includes('toranja')){
    return [
      {name:'Mosca-das-frutas',description:'Inseto que oviposita nos frutos causando podridão e queda prematura.'},
      {name:'Cochonilha',description:'Inseto sugador que enfraquece ramos e folhas e favorece fumagina.'},
      {name:'Minador-das-folhas',description:'Larvas que escavam galerias nas folhas jovens, reduzindo a fotossíntese.'}
    ]
  }
  if(n.includes('maca')||n.includes('macieira')||n.includes('pera')){
    return [
      {name:'Traça-das-pomáceas',description:'Larvas que perfuram frutos, depreciando colheita e provocando queda.'},
      {name:'Pulgões',description:'Sugador de seiva que deforma brotações e transmite viroses.'},
      {name:'Oídio',description:'Fungo que causa pó branco em folhas e frutos, reduzindo vigor.'}
    ]
  }
  if(n.includes('manga')||n.includes('abacaxi')||n.includes('abacate')||n.includes('caju')){
    return [
      {name:'Mosca-das-frutas',description:'Ataque direto aos frutos com larvas e apodrecimento.'},
      {name:'Antracnose',description:'Fungo que mancha e necrosa folhas e frutos em clima úmido.'},
      {name:'Cochonilha',description:'Infestação em ramos com excreção açucarada e fumagina.'}
    ]
  }
  if(n.includes('banana')){
    return [
      {name:'Broca-do-rizoma',description:'Inseto que perfura rizomas causando tombamento e baixa produção.'},
      {name:'Sigatoka',description:'Doença foliar que provoca manchas e perda de área verde.'},
      {name:'Ácaros',description:'Sugador que amarelece folhas e reduz crescimento.'}
    ]
  }
  if(n.includes('mamao')||n.includes('maracuja')){
    return [
      {name:'Ácaros',description:'Provocam bronzeamento foliar e queda de produtividade.'},
      {name:'Mosca-das-frutas',description:'Larvas no fruto que aceleram a deterioração.'},
      {name:'Antracnose',description:'Lesões escuras em frutos e folhas em alta umidade.'}
    ]
  }
  if(n.includes('pitaia')||n.includes('pitanga')||n.includes('jabuticaba')||n.includes('goiaba')||n.includes('araca')||n.includes('araça')){
    return [
      {name:'Mosca-das-frutas',description:'Danos internos e queda de frutos maduros.'},
      {name:'Cochonilha',description:'Coloniza ramos e frutos, favorece fumagina.'},
      {name:'Broca-dos-frutos',description:'Perfurações que comprometem qualidade e favorecem patógenos.'}
    ]
  }
  if(n.includes('morango')||n.includes('framboesa')||n.includes('amora')||n.includes('mirtilo')){
    return [
      {name:'Mofo-cinzento',description:'Fungo em flores e frutos, comum em clima úmido.'},
      {name:'Pulgões',description:'Sugador que deforma brotações e transmite viroses.'},
      {name:'Ácaros',description:'Provocam amarelecimento e redução do vigor.'}
    ]
  }
  if(n.includes('roma')||n.includes('romã')){
    return [
      {name:'Mosca-das-frutas',description:'Danos internos e podridão dos frutos.'},
      {name:'Cochonilha',description:'Colonização em ramos e frutos com secreção açucarada.'},
      {name:'Alternaria',description:'Manchas foliares e em frutos sob alta umidade.'}
    ]
  }
  if(n.includes('melao')){
    return [
      {name:'Mosca-branca',description:'Sugador que transmite viroses e causa amarelamento.'},
      {name:'Oídio',description:'Pó branco em folhas que reduz fotossíntese.'},
      {name:'Pulgões',description:'Deformam brotações e reduzem vigor.'}
    ]
  }
  if(n.includes('figo')){
    return [
      {name:'Mosca-das-frutas',description:'Ataque aos frutos causando deterioração.'},
      {name:'Cochonilha',description:'Infesta ramos e frutos favorecendo fumagina.'},
      {name:'Ácaros',description:'Causam clorose e queda de folhas.'}
    ]
  }
  return [
    {name:'Pulgões',description:'Insetos sugadores que enfraquecem brotações e podem transmitir viroses.'},
    {name:'Cochonilhas',description:'Sugador que secreta melada e favorece fumagina em folhas e frutos.'},
    {name:'Mosca-das-frutas',description:'Oviposição em frutos levando à podridão e queda prematura.'}
  ]
}

async function renderDetail(){renderSimple();const root=document.getElementById('root');const info=await getTreeInfo(selected.nome);treeInfo=info;const csvRec=findCsvRecordByName(selected.nome)||selected;const desc=(info&&info.description)||csvDescription(csvRec);const ci=csvRec.cientifico||info?.scientificName||'';const hero=(await getImageFor(selected.nome, ci))||`https://picsum.photos/seed/${(selected.nome||'fruta').replace(/\\s/g,'')}/1200/400`;const pestsList=(info&&info.pests&&info.pests.length)?info.pests:pestsFor(selected.nome);const enriched=await enrichFields(selected.nome)||{};const fru=enriched.frutificacao||csvRec.frutificacao||'N/D';const adu=enriched.adubacao||csvRec.adubacao||'N/D';const nut=enriched.nutriente||csvRec.nutriente||'N/D';root.innerHTML=`<div class="min-h-screen bg-lime-50" style="background-image:url('${SUBTLE_LEAVES_TEXTURE}')"><div class="relative"><img src="${hero}" alt="Imagem de ${selected.nome}" class="w-full h-64 object-cover"/><div class="absolute inset-0 bg-gradient-to-t from-lime-50 to-transparent"></div><button id="backBtn" class="absolute top-4 left-4 bg-white/80 backdrop-blur-sm p-3 rounded-full text-gray-700 hover:bg-white transition-all duration-200 shadow-md" aria-label="Voltar">${svgBack()}</button></div><main class="p-4 sm:p-8 -mt-24 relative z-10 max-w-5xl mx-auto"><header class="text-center mb-8"><h1 class="text-4xl sm:text-5xl font-bold text-emerald-900">${selected.nome}</h1><p class="text-lg text-gray-600 italic mt-2">${ci}</p></header><div class="bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg mb-8 border border-green-200"><p class="text-center text-gray-700 text-lg leading-relaxed">${desc}</p></div><div class="grid md:grid-cols-2 gap-6"><div class="space-y-6"><h2 class="text-3xl font-bold text-emerald-800 border-b-2 border-emerald-200 pb-2">Cuidados Essenciais</h2><div class="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-green-100"><h3 class="text-xl font-semibold text-emerald-800 mb-2">Luz Solar</h3><p class="text-gray-700">${info?.care?.sunlight||'Sol pleno'}</p></div><div class="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-green-100"><h3 class="text-xl font-semibold text-emerald-800 mb-2">Rega</h3><p class="text-gray-700">${info?.care?.watering||'Rega regular'}</p></div><div class="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-green-100"><h3 class="text-xl font-semibold text-emerald-800 mb-2">Solo</h3><p class="text-gray-700">${info?.care?.soil||'Bem drenado'}</p></div></div><div class="space-y-6"><h2 class="text-3xl font-bold text-emerald-800 border-b-2 border-emerald-200 pb-2">Manejo</h2><div class="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-green-100"><h3 class="text-xl font-semibold text-emerald-800 mb-2">Poda e Colheita</h3><p class="text-gray-700">${info?.pruningHarvest||'Ajuste sazonal conforme espécie.'}</p><p class="text-gray-700 mt-3"><span class="font-semibold">Frutificação:</span> ${fru}</p><p class="text-gray-700"><span class="font-semibold">Adubação:</span> ${adu} · <span class="font-semibold">Nutriente-chave:</span> ${nut}</p></div><div class="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-green-100"><h3 class="text-xl font-semibold text-emerald-800 mb-2">Pragas Comuns</h3><ul class="space-y-3">${pestsList.map(p=>`<li><strong class="font-semibold text-emerald-700">${p.name}:</strong> ${p.description}</li>`).join('')}</ul></div></div></div><div class="text-center mt-12"><button id="askBtn" class="bg-emerald-600 text-white px-8 py-4 rounded-full shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transform hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto text-lg">${svgChat()}Pergunte ao Jardineiro Sábio</button></div></main></div>`;document.getElementById('backBtn').addEventListener('click',()=>{selected=null;page='home';render()});document.getElementById('askBtn').addEventListener('click',()=>{page='chat';renderChat(selected?.nome)})}

async function ensureChat(tree){if(chatSession)return;const key=localStorage.getItem('GEMINI_API_KEY')||window.GEMINI_API_KEY||'';if(!key){return}const mod=await import('@google/genai');const ai=new mod.GoogleGenAI({apiKey:key});const history=tree?[{role:'user',parts:[{text:`Quero conversar sobre minha ${tree}.`}]},{role:'model',parts:[{text:`Olá! Que ótimo. Sou um jardineiro experiente e estou aqui para ajudar com sua ${tree}. O que você gostaria de saber?`}]}]:[];chatSession=ai.chats.create({model:'gemini-2.5-flash',config:{systemInstruction:'Você é um sábio e experiente jardineiro. Você dá conselhos amigáveis, práticos e fáceis de entender sobre o cultivo de árvores frutíferas. Seu tom é encorajador e experiente. Responda sempre em Português do Brasil.'},history})}

async function sendMessage(msg){const key=localStorage.getItem('GEMINI_API_KEY')||window.GEMINI_API_KEY||'';if(!key){return'Defina GEMINI_API_KEY no localStorage.'}await ensureChat();const resp=await chatSession.sendMessage({message:msg});return resp.text}

function renderChat(tree){const root=document.getElementById('root');root.innerHTML=`<div class="flex flex-col h-screen bg-green-50/80" style="background-image:url('${SUBTLE_LEAVES_TEXTURE}')"><header class="flex items-center p-4 bg-white shadow-md z-10 border-b border-green-200"><button id="backBtn" class="p-2 rounded-full text-gray-600 hover:bg-gray-100" aria-label="Voltar">${svgBack()}</button><div class="ml-4"><h1 class="text-xl font-semibold text-emerald-800">Jardineiro Sábio</h1><p class="text-sm text-green-600 flex items-center"><span class="relative flex h-2 w-2 mr-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>Online</p></div></header><main id="chatMain" class="flex-1 overflow-y-auto p-4 sm:p-6"><div id="chatList" class="max-w-3xl mx-auto space-y-4"></div></main><footer class="bg-white p-4 border-t border-gray-200"><div class="max-w-3xl mx-auto flex items-center"><input id="chatInput" type="text" placeholder="Digite sua pergunta..." class="flex-1 bg-gray-100 border-2 border-transparent rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"/><button id="sendBtn" class="ml-3 p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors" aria-label="Enviar mensagem">${svgSend()}</button></div></footer></div>`;document.getElementById('backBtn').addEventListener('click',()=>{page='home';render()});const list=document.getElementById('chatList');function paint(){list.innerHTML=messages.map(m=>`<div class="flex ${m.role==='user'?'justify-end':'justify-start'}"><div class="max-w-lg px-4 py-3 rounded-2xl shadow ${m.role==='user'?'bg-emerald-600 text-white rounded-br-none':'bg-white text-gray-800 rounded-bl-none border border-gray-200'}">${m.content}</div></div>`).join('')}paint();ensureChat(tree);document.getElementById('sendBtn').addEventListener('click',async()=>{const input=document.getElementById('chatInput');const txt=input.value.trim();if(!txt)return;messages.push({role:'user',content:txt});paint();input.value='';const reply=await sendMessage(txt);messages.push({role:'model',content:reply});paint();const main=document.getElementById('chatMain');main.scrollTop=main.scrollHeight})}

function fixSearchBehaviorOnce(){
  const input=document.getElementById('searchInput');
  if(!input)return;
  if(input.dataset&&input.dataset.fixed==='1')return;
  const cloned=input.cloneNode(true);
  cloned.dataset.fixed='1';
  input.parentNode.replaceChild(cloned,input);
  const form=document.querySelector('form');
  if(form){
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const q=normalize(cloned.value);
      let feedback=document.getElementById('searchFeedback');
      if(!feedback){
        feedback=document.createElement('div');
        feedback.id='searchFeedback';
        feedback.className='mt-2 text-sm text-red-600';
        form.parentNode.insertBefore(feedback, form.nextSibling);
      }
      feedback.textContent='';
      if(!q||q.length<2){
        feedback.textContent='Digite ao menos 2 caracteres';
        return;
      }
      const found=frutas.find(f=>normalize(f.nome).includes(q)||normalize(f.cientifico).includes(q));
      if(found){
        feedback.textContent='';
        selected=found;page='detail';renderDetail();
      } else {
        feedback.textContent='Não temos esse registro.';
      }
    })
  }
}
function ensureSearchWatcher(){setInterval(()=>{try{fixSearchBehaviorOnce()}catch(e){}},300)}
async function init(){await loadCSV();loadUserFrutas();mergeUserFrutas();loadImageCache();loadTreeInfoCache();render();removeInitialPicsum();updateFeaturedIcons();ensureSearchWatcher();ensureIconsWatcher();ensureAddButtonWatcher();ensureFeaturedImagesOnce()}

init()
