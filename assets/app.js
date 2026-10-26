'use strict';
const main = document.querySelector('#main');
const routes = {
  'aviso-legal': {title:'Aviso legal', group:'Información legal', legal:true, intro:'Información del titular y condiciones de uso del sitio web.'},
  'politica-de-privacidad': {title:'Política de privacidad', group:'Información legal', legal:true, intro:'Información sobre el tratamiento de datos personales y los derechos de los usuarios.'},
  'politica-de-cookies': {title:'Política de cookies', group:'Información legal', legal:true, intro:'Información sobre cookies, almacenamiento local y su gestión.'},
  colegio: {title:'Sobre el Colegio', group:'El Colegio', intro:'Una corporación al servicio de la profesión y de la sociedad canaria.'},
  ingenieria: {title:'La Ingeniería Informática', group:'La profesión', intro:'Fundamentos, historia y aplicaciones de una profesión que transforma nuestra sociedad.'},
  preguntas: {title:'Preguntas frecuentes', group:'El Colegio', intro:'Respuestas sobre el Colegio, la colegiación y la participación profesional.'},
  gobierno: {title:'Junta de Gobierno y Comisiones de Trabajo', group:'El Colegio', intro:'Las personas, los órganos y los equipos que dan forma al COITIC.'},
  ley: {title:'Ley de Creación', group:'Normativa', intro:'Ley 7/2006, de 10 de noviembre, de creación del Colegio Profesional de Ingenieros Técnicos en Informática de Canarias.'},
  estatutos: {title:'Estatutos', group:'Normativa', intro:'El marco de organización y funcionamiento del Colegio.'},
  deontologia: {title:'Código Deontológico', group:'Normativa', intro:'Los principios y las obligaciones que orientan nuestro ejercicio profesional.'},
  colegiados: {title:'Relación de colegiados', group:'Directorio profesional', intro:'Consulta la información pública de las personas colegiadas en el COITIC.'}
};
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formatDate = value => new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'long',year:'numeric',timeZone:'Atlantic/Canary'}).format(new Date(value+'T12:00:00Z'));
const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');
const safeURL = value => /^(https?:\/\/|mailto:|tel:|#|\.\/|assets\/|content\/)/i.test(value) ? value : null;
const allowedTags = new Set('P DIV SPAN H1 H2 H3 H4 H5 H6 UL OL LI STRONG EM B I A IMG FIGURE FIGCAPTION BR BLOCKQUOTE HR DETAILS SUMMARY PRE CODE TABLE THEAD TBODY TR TD TH DEL S'.split(' '));
// Markdown is content, not executable code. Strip active markup and unsafe URLs.
function sanitizedHTML(html){
  const doc = new DOMParser().parseFromString(html,'text/html');
  for (const el of [...doc.body.querySelectorAll('*')]) {
    if (!allowedTags.has(el.tagName)) {
      if (['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','FORM','INPUT','BUTTON','SVG','MATH','LINK','META','BASE','TEMPLATE'].includes(el.tagName)) el.remove();
      else el.replaceWith(...el.childNodes);
      continue;
    }
    for (const attr of [...el.attributes]) {
      if (!['href','src','alt','colspan','rowspan','class','loading','rel'].includes(attr.name)) el.removeAttribute(attr.name);
    }
    for (const attr of ['href','src']) if (el.hasAttribute(attr) && !safeURL(el.getAttribute(attr))) el.removeAttribute(attr);
    if (el.tagName==='A') el.setAttribute('rel','noopener noreferrer');
    if (el.tagName==='IMG') {el.setAttribute('loading','lazy');if(!el.hasAttribute('alt'))el.setAttribute('alt','');}
  }
  return doc.body.innerHTML;
}
const renderMarkdown = text => sanitizedHTML(marked.parse(text,{gfm:true,breaks:false}));
async function getText(path,signal){const r=await fetch(path,{cache:'no-cache',signal});if(!r.ok)throw new Error('No se pudo cargar '+path);return r.text();}
async function getJSON(path,signal){return JSON.parse(await getText(path,signal));}
function banner(page){return `<section class="page-banner"><div class="wrap"><div class="breadcrumb"><a href="#/">Inicio</a><span aria-hidden="true">/</span><span>${escapeHTML(page.group)}</span></div><div class="eyebrow">${escapeHTML(page.group)}</div><h1>${escapeHTML(page.title)}</h1><p class="intro">${escapeHTML(page.intro)}</p></div></section>`;}
function sidebar(slug,source,migratedAt){return `<aside class="sidebar"><div class="aside-label">Explora el COITIC</div>${Object.entries(routes).filter(([key,p])=>Boolean(p.legal)===Boolean(routes[slug].legal)).map(([key,p])=>`<a href="#/${key}" ${key===slug?'class="current" aria-current="page"':''}>${escapeHTML(p.title)}</a>`).join('')}<div class="source-note">Contenido del sitio original del COITIC.<br>Trasladado el ${escapeHTML(migratedAt || '23 de octubre de 2026')}.<a href="${escapeHTML(source)}">Consultar página de origen ↗</a></div></aside>`;}
const art = `<div class="story-art" aria-hidden="true"><svg viewBox="0 0 520 350" fill="none" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor"><ellipse cx="260" cy="173" rx="142" ry="142" opacity=".22"/><ellipse cx="260" cy="173" rx="104" ry="142" transform="rotate(38 260 173)" opacity=".5"/><ellipse cx="260" cy="173" rx="51" ry="142" transform="rotate(38 260 173)" opacity=".7"/><ellipse cx="260" cy="173" rx="104" ry="142" transform="rotate(-38 260 173)" opacity=".5"/><ellipse cx="260" cy="173" rx="51" ry="142" transform="rotate(-38 260 173)" opacity=".7"/><ellipse cx="260" cy="173" rx="142" ry="50" opacity=".75"/><ellipse cx="260" cy="173" rx="142" ry="102" opacity=".35"/><path d="M40 173H480M260 10V335" opacity=".3"/><circle cx="260" cy="173" r="8" fill="currentColor"/><circle cx="118" cy="173" r="5" fill="currentColor"/><circle cx="362" cy="74" r="5" fill="currentColor"/><circle cx="316" cy="303" r="5" fill="currentColor"/></g><path d="M30 45h25M42.5 32.5v25M465 287h25M477.5 274.5v25" stroke="#fff" opacity=".45"/><text x="42" y="311" fill="#d0e6eb" font-size="10" font-family="monospace">28° N / 16° W</text></svg><div class="art-label"><span>COITIC · Canarias</span><span>Conectamos profesión y sociedad</span></div></div>`;
function storyImage(story){const image=safeURL(story.imagen||'');return image?`<div class="story-art"><img class="cover" src="${escapeHTML(image)}" alt="${escapeHTML(story.imagen_alt||'')}" loading="lazy"></div>`:art;}
function meta(story){return `<div class="story-meta"><span class="tag">${escapeHTML(story.categoria)}</span><time datetime="${story.fecha}">${escapeHTML(formatDate(story.fecha))}</time></div>`;}
function closeMenus(){document.querySelectorAll('.nav-group').forEach(el=>{el.classList.remove('open');el.querySelector('button').setAttribute('aria-expanded','false');});document.querySelector('#main-nav').classList.remove('mobile-open');document.querySelector('.menu-toggle').setAttribute('aria-expanded','false');}
let newsState={category:'Todas',query:''};
async function home(signal){
 const news=await getJSON('content/noticias/index.json',signal);
 main.innerHTML=`<section class="wrap hero"><div><div class="eyebrow">Actualidad COITIC</div><h1>La actualidad de<br><span>nuestra profesión.</span></h1></div><div class="hero-side"><p>Las novedades de tu Colegio y de la ingeniería informática en Canarias. Un espacio para informarnos, compartir y avanzar.</p><div class="edition">Profesión y sociedad, conectadas</div></div></section><section class="wrap" aria-labelledby="news-heading"><div class="section-top"><h2 id="news-heading">Noticias del Colegio <span class="count">${news.length}</span></h2><span class="small muted">La información que nos conecta</span></div><div class="news-tools"><div class="filters" role="group" aria-label="Filtrar noticias por categoría">${['Todas',...new Set(news.map(n=>n.categoria))].map(c=>`<button class="filter ${c===newsState.category?'active':''}" aria-pressed="${c===newsState.category}" type="button" data-category="${escapeHTML(c)}">${escapeHTML(c)}</button>`).join('')}</div><div class="search-wrap"><label class="sr-only" for="news-search">Buscar noticias</label><input id="news-search" type="search" placeholder="Buscar en las noticias…" value="${escapeHTML(newsState.query)}"></div></div><div id="news-results" aria-live="polite"></div></section><div class="wrap links-strip"><p>Tu Colegio,<br>a un paso.</p><a href="#/colegio">Conoce el COITIC <span aria-hidden="true">↗</span></a><a href="#/colegiados">Consulta el directorio de colegiados <span aria-hidden="true">↗</span></a></div>`;
 function draw(){
  const filtered=news.filter(n=>(newsState.category==='Todas'||n.categoria===newsState.category)&&normalize(n.titulo+' '+n.resumen+' '+n.categoria).includes(normalize(newsState.query)));
  const [first,...rest]=filtered;
  document.querySelector('#news-results').innerHTML=first?`<a class="featured" href="#/noticia/${encodeURIComponent(first.slug)}">${storyImage(first)}<div class="featured-body">${meta(first)}<h2>${escapeHTML(first.titulo)}</h2><p>${escapeHTML(first.resumen)}</p><div class="read">Leer noticia <span aria-hidden="true">↗</span></div></div></a>${rest.length?`<div class="news-grid" style="margin-top:24px">${rest.map(n=>`<a class="news-card" href="#/noticia/${encodeURIComponent(n.slug)}">${meta(n)}<h3>${escapeHTML(n.titulo)}</h3><p>${escapeHTML(n.resumen)}</p><div class="read">Leer noticia <span aria-hidden="true">↗</span></div></a>`).join('')}</div>`:''}`:`<div class="news-empty">${news.length?'No hay noticias que coincidan con tu búsqueda.':'Todavía no se han publicado noticias. Vuelve pronto para conocer las novedades del Colegio.'}</div>`;
 }
 document.querySelector('#news-search').addEventListener('input',e=>{newsState.query=e.target.value;draw();});
 document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>{newsState.category=button.dataset.category;document.querySelectorAll('[data-category]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});draw();}));
 draw();
}
async function institutional(slug,signal){
 const [content,sources]=await Promise.all([getText('content/pages/'+slug+'.html',signal),getJSON('content/pages.json',signal)]);
 main.innerHTML=banner(routes[slug])+`<div class="wrap page-layout">${sidebar(slug,sources[slug].source,sources[slug].migrated_at)}<article class="prose">${slug==='preguntas'?'<div class="faq-tools"><label class="sr-only" for="faq-search">Buscar en las preguntas</label><input type="search" id="faq-search" placeholder="¿Qué necesitas saber?"></div>':''}${slug==='politica-de-cookies'?`<section class="cookie-site-note" aria-labelledby="cookie-site-note-title"><h2 id="cookie-site-note-title">Cookies en esta versión de la web</h2><p>Esta web estática no incorpora cookies de analítica ni de publicidad. Al confirmar el aviso, guardamos únicamente el recordatorio <code>coitic:cookie-notice:v1</code> en el almacenamiento local de tu navegador, durante 180 días. Este registro permanece en tu dispositivo y no se envía al Colegio.</p><p>Puedes borrarlo desde la configuración de cookies o al eliminar los datos de este sitio en tu navegador. Los sitios externos a los que accedas mediante enlaces aplican sus propias políticas.</p><button type="button" class="cookie-button" data-cookie-open>Configurar cookies</button></section><h2>Texto de la política de cookies de coitic.es</h2>`:''}${sanitizedHTML(content)}</article></div>`;
 if(slug==='preguntas')document.querySelector('#faq-search').addEventListener('input',e=>{const q=normalize(e.target.value);document.querySelectorAll('.prose details').forEach(d=>{d.hidden=!normalize(d.textContent).includes(q);d.open=Boolean(q)&&!d.hidden;});});
 if(slug==='gobierno'){
   const list=document.querySelector('.prose ul');if(list)list.classList.add('gov-members');
   const img=document.querySelector('.prose img');if(img){const note=document.createElement('span');note.className='source-figure-note';note.textContent='Organigrama conservado de la página original. La composición publicada de la Junta figura en el listado anterior.';img.parentElement.after(note);}
 }
}
function stripFrontMatter(text){return text.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/,'');}
async function newsArticle(slug,signal){
 const news=await getJSON('content/noticias/index.json',signal),story=news.find(n=>n.slug===slug);
 if(!story){notFound();return;}
 const content=await getText(story.archivo,signal);
 document.title=story.titulo+' · COITIC';
 main.innerHTML=`<article class="wrap article-page"><a class="back-link" href="#/">← Volver a la actualidad</a>${meta(story)}<h1>${escapeHTML(story.titulo)}</h1><p class="deck">${escapeHTML(story.resumen)}</p>${storyImage(story)}<div class="prose">${renderMarkdown(stripFrontMatter(content))}</div><a class="back-link" href="#/">← Todas las noticias</a></article>`;
}
function plainText(value){const d=new DOMParser().parseFromString(renderMarkdown(value),'text/html');return d.body.textContent.trim();}
async function directory(signal){
 const text=await getText('content/colegiados.md',signal),tokens=marked.lexer(text),table=tokens.find(t=>t.type==='table');
 if(!table)throw new Error('El archivo de colegiados no contiene una tabla.');
 const headers=table.header.map(c=>plainText(c.text)),rows=table.rows.map(row=>row.map(c=>plainText(c.text)));
 main.innerHTML=banner(routes.colegiados)+`<section class="wrap directory-page"><p class="small muted">Puedes buscar por nombre, apellidos, número de colegiado, titulación, servicios o cualquier otro campo. Pulsa un encabezado para ordenar la tabla.</p><div class="directory-tools"><label>Buscar en el directorio<input type="search" id="member-search" placeholder="Nombre, número, servicio, provincia…"></label><label>Resultados por página<select id="page-size"><option>10</option><option selected>25</option><option>50</option><option>100</option></select></label></div><div class="table-scroll" role="region" tabindex="0" aria-label="Tabla de colegiados con desplazamiento horizontal"><table><caption class="sr-only">Relación pública de colegiados del COITIC</caption><thead><tr>${headers.map((h,i)=>`<th scope="col" aria-sort="${i===3?'ascending':'none'}"><button type="button" data-sort="${i}">${escapeHTML(h)} <span aria-hidden="true">${i===3?'↑':'↕'}</span></button></th>`).join('')}</tr></thead><tbody id="member-rows"></tbody></table></div><div class="pagination"><span class="result-count" role="status" aria-live="polite" id="member-count"></span><button type="button" id="previous">← Anterior</button><span id="page-count"></span><button type="button" id="next">Siguiente →</button></div><div class="directory-footer">Cualquier información adicional sobre nuestros colegiados se puede solicitar a través del <a href="https://coitic.es/contactar/">formulario de contacto del COITIC ↗</a>.</div></section>`;
 let page=1,size=25,sort=3,ascending=true,query='';
 const collator=new Intl.Collator('es',{numeric:true,sensitivity:'base'});
 function cellHTML(value,i){
   const safe=escapeHTML(value);
   if(i===8){const match=value.match(/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/);if(match)return `<a href="mailto:${safe}">${safe}</a>`;}
   if(i===7&&/^\+?[\d\s]{9,16}$/.test(value))return `<a href="tel:${value.replace(/\s/g,'')}">${safe}</a>`;
   return safe||'<span class="muted" aria-label="Sin información">—</span>';
 }
 function draw(){
   const filtered=rows.filter(row=>normalize(row.join(' ')).includes(normalize(query))).sort((a,b)=>collator.compare(a[sort],b[sort])*(ascending?1:-1));
   const pages=Math.max(1,Math.ceil(filtered.length/size));page=Math.min(page,pages);
   document.querySelector('#member-rows').innerHTML=filtered.length?filtered.slice((page-1)*size,page*size).map(row=>`<tr>${row.map((value,i)=>`<td>${cellHTML(value,i)}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${headers.length}">No se encontraron colegiados para esta búsqueda.</td></tr>`;
   document.querySelector('#member-count').textContent=filtered.length?`${(page-1)*size+1}–${Math.min(page*size,filtered.length)} de ${filtered.length} colegiados`:'0 colegiados';
   document.querySelector('#page-count').textContent=`${page} / ${pages}`;
   document.querySelector('#previous').disabled=page===1;document.querySelector('#next').disabled=page===pages;
   document.querySelectorAll('[data-sort]').forEach(button=>{const active=Number(button.dataset.sort)===sort;button.closest('th').setAttribute('aria-sort',active?(ascending?'ascending':'descending'):'none');button.querySelector('span').textContent=active?(ascending?'↑':'↓'):'↕';});
 }
 document.querySelector('#member-search').addEventListener('input',e=>{query=e.target.value;page=1;draw();});
 document.querySelector('#page-size').addEventListener('change',e=>{size=Number(e.target.value);page=1;draw();});
 document.querySelector('#previous').addEventListener('click',()=>{page--;draw();});document.querySelector('#next').addEventListener('click',()=>{page++;draw();});
 document.querySelectorAll('[data-sort]').forEach(button=>button.addEventListener('click',()=>{const next=Number(button.dataset.sort);ascending=sort===next?!ascending:true;sort=next;page=1;draw();}));draw();
}
function notFound(){document.title='Página no encontrada · COITIC';main.innerHTML='<section class="wrap error"><div class="eyebrow">404</div><h1>Esta página no está aquí.</h1><p>Consulta la actualidad del Colegio o utiliza el menú para encontrar la información que necesitas.</p><a href="#/">Volver al inicio →</a></section>';}
let controller,firstNavigation=true;
async function navigate(){
 if(controller)controller.abort();controller=new AbortController();const {signal}=controller;
 closeMenus();const parts=location.hash.replace(/^#\/?/,'').split('/');let slug;
 try{slug=decodeURIComponent(parts[0]||'');}catch{notFound();return;}
 document.title=(routes[slug]?.title||'Actualidad')+' · COITIC';
 document.querySelectorAll('nav a').forEach(a=>{if(a.getAttribute('href')===(slug?'#/'+slug:'#/'))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 main.innerHTML='<div class="wrap loading" role="status">Cargando contenido…</div>';
 try{
  if(!slug)await home(signal);
  else if(slug==='colegiados')await directory(signal);
  else if(routes[slug])await institutional(slug,signal);
  else if(slug==='noticia'&&parts.length===2)await newsArticle(decodeURIComponent(parts[1]),signal);
  else notFound();
  if(!signal.aborted){window.scrollTo(0,0);if(!firstNavigation)main.focus({preventScroll:true});firstNavigation=false;}
 }catch(error){if(error.name==='AbortError')return;console.error(error);main.innerHTML='<section class="wrap error"><h1>No se pudo cargar el contenido.</h1><p>Comprueba tu conexión y vuelve a intentarlo.</p><button type="button" id="retry">Reintentar</button></section>';document.querySelector('#retry').addEventListener('click',navigate);}
}
document.querySelector('.menu-toggle').addEventListener('click',e=>{const button=e.currentTarget,open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));document.querySelector('#main-nav').classList.toggle('mobile-open',open);});
document.querySelectorAll('.nav-group>button').forEach(button=>button.addEventListener('click',()=>{const parent=button.parentElement,open=!parent.classList.contains('open');document.querySelectorAll('.nav-group').forEach(group=>{group.classList.remove('open');group.querySelector('button').setAttribute('aria-expanded','false');});parent.classList.toggle('open',open);button.setAttribute('aria-expanded',String(open));}));
document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenus();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const open=document.querySelector('.nav-group.open>button');if(open)open.focus();closeMenus();}});
document.querySelector('#year').textContent=new Date().getFullYear();window.addEventListener('hashchange',navigate);navigate();
document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();main.focus();main.scrollIntoView();});
