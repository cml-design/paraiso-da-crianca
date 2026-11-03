/* =========================================================================
   Escola Paraíso da Criança — motor do site
   Os textos, fotos e vídeos ficam em /conteudo/*.json (editados pelo painel).
   Este arquivo só monta as páginas a partir desse conteúdo.
   ========================================================================= */
(function () {
"use strict";

const ARQUIVOS = ["geral", "home", "historia", "bercario", "educacao-infantil", "territorios", "proposta-pedagogica", "contato", "privacidade"];
const C = {};          // conteúdo carregado
let G;                 // atalho para C.geral

/* ------------------------------------------------------------ utilidades */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const url = (p) => String(p || "").replace(/^\/+/, "");       // caminhos do painel ("/img/x.jpg") → relativos
const FOCO = { centro: "50% 50%", topo: "50% 22%", base: "50% 78%", esquerda: "22% 50%", direita: "80% 50%" };
const COR = { azul: "var(--blue)", laranja: "var(--orange)", verde: "var(--green)", roxo: "#6B3FA0", amarelo: "#E5C700", vermelho: "var(--red)", rosa: "var(--pink)" };
const CORES_SEQ = ["var(--red)", "var(--orange)", "var(--green)", "var(--blue)", "var(--pink)", "#6B3FA0"];
const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Texto curto: **x** = destaque (vermelho em títulos, negrito em textos); [x] = pendente */
function inline(s, modo = "texto") {
  let h = esc(s);
  h = h.replace(/\*\*(.+?)\*\*/g, modo === "titulo" ? '<span class="accent">$1</span>' : "<strong>$1</strong>");
  h = h.replace(/\[([^\]]+)\]/g, (_, t) => G && G.mostrar_pendencias ? `<span class="todo">[${t}]</span>` : "");
  return h;
}
/** Texto longo: parágrafos separados por linha em branco; linhas com "- " viram lista */
function paras(s, { lead = false } = {}) {
  const blocos = String(s || "").trim().split(/\n\s*\n/).filter(Boolean);
  return blocos.map((b, i) => {
    const linhas = b.split("\n");
    if (linhas.every(l => /^\s*-\s+/.test(l))) return `<ul>${linhas.map(l => `<li>${inline(l.replace(/^\s*-\s+/, ""))}</li>`).join("")}</ul>`;
    return `<p${lead && i === 0 ? ' class="lead"' : ""}>${linhas.map(l => inline(l)).join("<br>")}</p>`;
  }).join("");
}
const tit = (s) => inline(s, "titulo");
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const waLink = (msg) => `https://wa.me/${G.contato.whatsapp}?text=${encodeURIComponent(msg || G.contato.mensagem_whatsapp)}`;
const agendar = () => G.link_agendamento || "#contato";
const btn = (txt, cls = "btn--red", href = agendar()) => txt ? `<a class="btn ${cls}" href="${esc(href)}"${/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ""}>${esc(txt)}${ARROW}</a>` : "";
const kicker = (t, style = "") => t ? `<span class="kicker"${style ? ` style="${style}"` : ""}>${inline(t)}</span>` : "";
const youtubeEmbed = (u) => { const m = String(u || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{6,})/); return m ? `https://www.youtube.com/embed/${m[1]}` : ""; };

const ICON = {
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  wa: '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6a10.6 10.6 0 0 1-5.4-1.5l-.4-.2-3.9 1 1-3.8-.2-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.7 3.7 0 0 0-1.1 2.7 6.4 6.4 0 0 0 1.3 3.4 14.7 14.7 0 0 0 5.7 5c2.1.9 2.9 1 4 .8a3.4 3.4 0 0 0 2.2-1.6 2.8 2.8 0 0 0 .2-1.6c-.1-.1-.3-.2-.6-.3z"/></svg>',
  img: '<svg viewBox="0 0 48 32" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M3 29a10 10 0 0 1 20 0M21 29a10 10 0 0 1 20 0" stroke-linecap="round"/><circle cx="36" cy="8" r="4"/></svg>'
};
const arcs = (cls = "arcs") => `<svg class="${cls}" viewBox="0 0 150 46" aria-hidden="true" fill="none" stroke-width="9" stroke-linecap="round"><path d="M6 42a20 20 0 0 1 40 0" stroke="#F07D00"/><path d="M54 42a20 20 0 0 1 40 0" stroke="#8DBF22"/><path d="M102 42a20 20 0 0 1 40 0" stroke="#029FE3"/></svg>`;

/* ------------------------------------------------------------ componentes */

/** Foto arredondada; sem foto → espaço reservado */
function Foto(o, { cls = "", eager = false, ratio = "" } = {}) {
  o = o || {};
  const st = ratio ? ` style="aspect-ratio:${ratio}"` : "";
  if (o.src) {
    const fit = o.inteira ? ";object-fit:contain;background:#fff;padding:6%" : "";
    return `<figure class="rimg ${cls}"${st}><img src="${esc(url(o.src))}" alt="${esc(o.alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="1600" height="1100" style="object-position:${FOCO[o.foco] || FOCO.centro}${fit}"></figure>`;
  }
  return `<figure class="rimg ${cls}"${st} role="img" aria-label="${esc(o.alt || "Foto a definir")}"><div class="ph">${ICON.img}<span class="ph__id">Foto a definir</span><span class="ph__desc">${esc(o.alt)}</span></div></figure>`;
}
const band = (inner, cls = "") => `<section class="section band ${cls}"><div class="wrap">${inner}</div></section>`;

function PageHero(t, crumb, semi = "var(--green)", imgCls = "rimg--arch") {
  return `<section class="phero"><div class="wrap phero__grid">
    <div class="reveal">
      <nav class="breadcrumb" aria-label="Você está em"><a href="#inicio">Início</a> / <span aria-current="page">${esc(crumb)}</span></nav>
      ${kicker(t.etiqueta)}<h1 class="h1" tabindex="-1">${tit(t.titulo)}</h1>
      <div class="lead measure">${paras(t.texto)}</div>
    </div>
    <div class="phero__media reveal">${Foto(t.imagem, { cls: imgCls, eager: true })}<span class="semi drift" style="background:${semi}"></span></div>
  </div></section>`;
}
function Editorial(s, { reverse = false, sand = false, imgCls = "rimg--blob", ratio = "4/5", extra = "" } = {}) {
  return `<section class="section ${sand ? "band" : ""}"><div class="wrap split ${reverse ? "split--rev" : ""}">
    <div class="split__media reveal">${Foto(s.imagem, { cls: imgCls, ratio })}</div>
    <div class="reveal">${kicker(s.etiqueta)}<h2 class="h2">${tit(s.titulo)}</h2><div class="measure">${paras(s.texto, { lead: true })}</div>${extra}</div>
  </div></section>`;
}
function SplitText(s, { sand = false, kickerStyle = "" } = {}) {
  return `<section class="section ${sand ? "band" : ""}"><div class="wrap split">
    <div class="reveal">${kicker(s.etiqueta, kickerStyle)}<h2 class="h2">${tit(s.titulo)}</h2></div>
    <div class="reveal">${paras(s.texto, { lead: true })}</div>
  </div></section>`;
}
function Statement(s, { sand = false } = {}) {
  return `<section class="section ${sand ? "band" : ""}"><div class="wrap"><div class="statement reveal">${arcs()}${kicker(s.etiqueta, "justify-content:center")}
    <h2>${tit(s.titulo)}</h2><div class="lead" style="margin-inline:auto;max-width:44rem">${paras(s.texto)}</div></div></div></section>`;
}
function Heading(s) {
  return `<div class="reveal">${kicker(s.etiqueta)}<h2 class="h2">${tit(s.titulo)}</h2>${s.texto ? `<div class="lead measure">${paras(s.texto)}</div>` : ""}</div>`;
}
function Chamada(c) {
  return `<section class="section section--tight"><div class="wrap"><div class="cta reveal">
    <span class="cta__arc" aria-hidden="true"></span>
    <div class="cta__body"><span class="script">${inline(c.frase)}</span><h2 class="h2">${tit(c.titulo)}</h2>${paras(c.texto)}
      <div class="btn-row">${btn(c.botao, "btn--light")}<a class="btn btn--glass" href="${waLink()}" target="_blank" rel="noopener">WhatsApp</a></div></div>
    ${Foto(c.imagem)}
  </div></div></section>`;
}
function ProgramCard(c, href, cls) {
  return `<a class="pcard ${cls} reveal" href="${href}">${Foto(c.imagem)}
    <div class="pcard__body"><span class="pcard__label">${inline(c.rotulo)}</span><h3>${tit(c.titulo)}</h3>${paras(c.texto)}<span class="btn btn--light">${esc(c.botao)}${ARROW}</span></div></a>`;
}

/* ------------------------------------------------------------ páginas */
const P = {};

P.inicio = () => {
  const h = C.home, b = h.banner, v = b.video || {};
  let media;
  if (v.arquivo && !reduce()) {
    media = `<video autoplay muted loop playsinline preload="metadata" poster="${esc(url(b.imagem.src))}" aria-hidden="true">${v.arquivo_celular ? `<source src="${esc(url(v.arquivo_celular))}" type="video/mp4" media="(max-width: 640px)">` : ""}<source src="${esc(url(v.arquivo))}" type="video/mp4"></video>`;
  } else media = Foto(b.imagem, { eager: true });
  const m = h.manifesto, cm = h.caminhos, t = h.territorios, hi = h.historia;
  return `
  <section class="hero" aria-labelledby="h-hero">
    <div class="hero__media">${media}</div>
    <div class="wrap"><div class="hero__body">
      <span class="script">${inline(b.frase)}</span>
      <h1 id="h-hero" class="h-hero" tabindex="-1">${tit(b.titulo)}</h1>
      <div class="lead">${paras(b.texto)}</div>
      <div class="btn-row"><a class="btn btn--red" href="#inicio" data-scroll="manifesto">${esc(b.botao1)}${ARROW}</a>${btn(b.botao2, "btn--glass")}</div>
    </div></div>
    <img class="hero__mascot drift" src="img/centopeia.png" alt="" aria-hidden="true" width="360" height="201">
  </section>

  <section class="section" id="manifesto"><div class="wrap manifesto">
    <div class="reveal">${kicker(m.etiqueta)}<h2 class="h2">${tit(m.titulo)}</h2><div class="lead measure">${paras(m.texto)}</div></div>
    <div class="manifesto__media reveal">${Foto(m.imagem, { cls: "rimg--arch" })}<span class="semi drift" aria-hidden="true"></span>${m.selo ? `<span class="stamp" aria-hidden="true">${esc(m.selo)}</span>` : ""}</div>
  </div></section>

  ${band(`${Heading(cm)}<div class="programs">${ProgramCard(cm.bercario, "#bercario", "pcard--bb")}${ProgramCard(cm.educacao, "#educacao-infantil", "pcard--edu")}</div>`, "band--red")}

  <section class="section"><div class="terr section"><div class="wrap">
    <div class="terr__head">
      <div class="reveal">${kicker(t.etiqueta, "color:var(--green-dark)")}<h2 class="h2">${tit(t.titulo)}</h2></div>
      <div class="lead reveal">${paras(t.texto)}</div>
    </div>
    <div class="mosaic reveal">${(t.imagens || []).slice(0, 5).map(i => `<div>${Foto(i)}</div>`).join("")}</div>
    <div class="terr__foot reveal"><p class="script" style="margin:0;color:var(--green-dark)">${inline(t.frase)}</p>${btn(t.botao, "btn--red", "#territorios")}</div>
  </div></div></section>

  ${Editorial(h.proposta, { imgCls: "rimg--arch", extra: `<div class="btn-row">${btn(h.proposta.botao, "btn--ghost", "#proposta-pedagogica")}</div>` })}

  <section class="section band"><div class="wrap split split--rev">
    <div class="split__media reveal"><div class="hist-media">${Foto(hi.imagem, { cls: "rimg--blob" })}${Foto(hi.imagem_detalhe)}</div>
      ${hi.selo_numero ? `<div class="badge25" aria-hidden="true"><b>${esc(hi.selo_numero)}</b><span>${esc(hi.selo_texto)}</span></div>` : ""}</div>
    <div class="reveal">${kicker(hi.etiqueta)}
      <div class="year" aria-hidden="true"><small style="margin:0 0 .8rem">${esc(hi.ano_rotulo)}</small>${esc(hi.ano)}</div>
      <h2 class="h2">${tit(hi.titulo)}</h2><div class="measure">${paras(hi.texto)}</div>
      <div class="btn-row">${btn(hi.botao, "btn--ghost", "#historia")}</div></div>
  </div></section>

  ${Chamada(h.chamada)}`;
};

P.historia = () => {
  const h = C.historia, tr = h.trajetoria, v = h.valores, ms = h.mascote, an = h.aniversario;
  const vid = an.video || {};
  let player;
  const yt = youtubeEmbed(vid.youtube);
  if (yt) player = `<iframe src="${yt}" title="${esc(an.video_legenda)}" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  else if (vid.arquivo) player = `<video controls playsinline preload="none" poster="${esc(url(vid.capa))}"><source src="${esc(url(vid.arquivo))}" type="video/mp4">Seu navegador não reproduz vídeos.</video>`;
  else player = `<div class="ph">${ICON.img}<span class="ph__id">Vídeo a definir</span></div>`;
  return `
  ${PageHero(h.topo, "Nossa História", "var(--orange)")}
  <section class="section band"><div class="wrap split">
    <div class="reveal"><div class="year">${esc(tr.numero)}<small>${esc(tr.numero_texto)}</small></div></div>
    <div class="reveal">${kicker(tr.etiqueta)}<h2 class="h2">${tit(tr.titulo)}</h2>${paras(tr.texto, { lead: true })}</div>
  </div></section>

  <section class="section"><div class="wrap">
    <div class="statement reveal">${arcs()}${kicker(v.etiqueta, "justify-content:center")}<h2>${tit(v.titulo)}</h2></div>
    <ul class="chips reveal" style="justify-content:center;margin-top:var(--s-4)">
      ${(v.lista || []).map((x, i) => `<li class="chip" style="font-size:1.15rem;padding:.8rem 1.4rem"><i style="background:${CORES_SEQ[i % CORES_SEQ.length]}"></i>${inline(x)}</li>`).join("")}
    </ul>
  </div></section>

  <section class="section band"><div class="wrap split">
    <div class="split__media reveal"><div class="mascot-stage">${ms.imagem && ms.imagem.src ? `<img src="${esc(url(ms.imagem.src))}" alt="${esc(ms.imagem.alt)}" loading="lazy" class="drift">` : ""}</div></div>
    <div class="reveal">${kicker(ms.etiqueta)}<h2 class="h2">${tit(ms.titulo)}</h2>${paras(ms.texto, { lead: true })}
      ${ms.subtitulo ? `<h3 class="h3" style="margin-top:2rem">${tit(ms.subtitulo)}</h3>` : ""}${paras(ms.texto2)}</div>
  </div></section>

  ${Editorial(h.inspira, { reverse: true, imgCls: "rimg--arch", extra: h.inspira.frase ? `<p class="script" style="margin-top:1.5rem">${inline(h.inspira.frase)}</p>` : "" })}

  <section class="section band"><div class="wrap">
    <div class="split" style="align-items:end">
      <div class="reveal">${kicker(an.etiqueta)}<h2 class="h2">${tit(an.titulo)}</h2></div>
      <div class="lead reveal">${paras(an.texto)}</div>
    </div>
    <div class="tgrid">
      <figure class="tvideo reveal"><div class="tvideo__frame">${player}</div>
        <figcaption><span class="script">${inline(an.video_legenda)}</span><br><span style="font-size:.9rem;color:var(--gray-2)">${inline(an.video_sublegenda)}</span></figcaption></figure>
      <ol class="timeline reveal" aria-label="Linha do tempo">
        ${(an.marcos || []).map(m => `<li class="tl">${Foto(m.imagem)}<div class="tl__body"><span class="tl__year">${inline(m.ano)}</span><h3 class="tl__title">${tit(m.titulo)}</h3>${paras(m.texto)}</div></li>`).join("")}
      </ol>
    </div>
  </div></section>

  ${Chamada(h.chamada)}`;
};

P.bercario = () => {
  const b = C.bercario, inf = b.informacoes;
  return `
  ${PageHero(b.topo, "Berçário", "var(--blue)")}
  ${Statement(b.cuidar, { sand: true })}
  ${Editorial(b.sentidos, { imgCls: "rimg--arch" })}
  ${Editorial(b.natureza, { reverse: true })}
  <section class="section band"><div class="wrap">
    ${Heading(inf)}
    <div class="info">
      <div class="info__item info__item--wide reveal"><h3>Períodos</h3>
        <div class="periods">${(inf.periodos || []).map(p => `<div class="period"><b>${inline(p.nome)}</b><span>${inline(p.detalhe)}</span></div>`).join("")}</div>
        ${inf.observacao ? `<p style="margin-top:1rem;font-size:.92rem;color:var(--gray-2)">${inline(inf.observacao)}</p>` : ""}
      </div>
      ${(inf.cartoes || []).map(c => `<div class="info__item reveal"><h3>${tit(c.titulo)}</h3>${paras(c.texto)}</div>`).join("")}
    </div>
  </div></section>
  ${SplitText(b.familia)}
  ${Chamada(b.chamada)}`;
};

P["educacao-infantil"] = () => {
  const e = C["educacao-infantil"], a = e.aulas;
  return `
  ${PageHero(e.topo, "Educação Infantil", "var(--yellow)", "rimg--blob")}
  ${Editorial(e.protagonista, { sand: true, imgCls: "rimg--arch" })}
  ${Statement(e.brincar)}
  ${band(`${Heading(e.cotidiano)}<div class="cards3">${(e.cotidiano.cartoes || []).map(c => `<article class="ecard reveal">${Foto(c.imagem)}<div class="ecard__body"><span class="ecard__dot" style="display:block;background:${COR[c.cor] || COR.verde}"></span><h3 class="h3">${tit(c.titulo)}</h3>${paras(c.texto)}</div></article>`).join("")}</div>`)}
  <section class="section"><div class="wrap">
    ${Heading(a)}
    <div class="acts">${(a.turnos || []).map(t => `<div class="acts__col reveal" style="background:var(--sand)"><h3>${inline(t.nome)}</h3><ul>${(t.atividades || []).map(x => `<li><strong>${inline(x.nome)}</strong><small>${inline(x.turmas)}</small></li>`).join("")}</ul></div>`).join("")}</div>
    <div class="info">${(a.destaques || []).map(d => `<div class="info__item reveal" style="background:color-mix(in srgb, ${COR[d.cor] || COR.azul} 12%, white)"><h3>${tit(d.titulo)}</h3>${paras(d.texto)}</div>`).join("")}</div>
  </div></section>
  ${Chamada(e.chamada)}`;
};

P.territorios = () => {
  const t = C.territorios, es = t.espacos;
  return `
  ${PageHero(t.topo, "Territórios", "var(--green)")}
  ${SplitText(t.educam, { sand: true })}
  <section class="section"><div class="wrap">
    ${Heading(es)}
    <ul class="spaces">${(es.lista || []).map(s => `<li class="space reveal"><span class="space__arc" style="border-color:${COR[s.cor] || COR.verde}" aria-hidden="true"></span><h3 class="h3">${inline(s.nome)}</h3><span class="space__age">${inline(s.faixa)}</span>${paras(s.texto)}</li>`).join("")}</ul>
  </div></section>
  <section class="section section--tight" style="padding-top:0"><div class="wrap">
    ${Heading(t.galeria)}
    <div class="tgallery">${(t.galeria.itens || []).map(i => `<figure class="titem reveal">${Foto(i.imagem)}<figcaption><b>${inline(i.titulo)}</b><span>${inline(i.texto)}</span></figcaption></figure>`).join("")}</div>
  </div></section>
  <section class="section"><div class="terr section"><div class="wrap split">
    <div class="reveal">${kicker(t.natureza.etiqueta, "color:var(--green-dark)")}<h2 class="h2">${tit(t.natureza.titulo)}</h2></div>
    <div class="reveal">${paras(t.natureza.texto, { lead: true })}</div>
  </div></div></section>
  ${Chamada(t.chamada)}`;
};

P["proposta-pedagogica"] = () => {
  const p = C["proposta-pedagogica"], cu = p.curriculo;
  return `
  ${PageHero(p.topo, "Proposta Pedagógica", "var(--red)", "rimg--blob")}
  ${SplitText(p.compreender, { sand: true })}
  <section class="section"><div class="wrap">
    ${Heading(p.pilares)}
    <div class="pillars">${(p.pilares.lista || []).map((x, i) => `<article class="pillar reveal" style="background:var(--sand)"><span class="pillar__n">${String(i + 1).padStart(2, "0")}</span><h3 class="h3">${tit(x.titulo)}</h3>${paras(x.texto)}<span class="semi" style="background:${COR[x.cor] || COR.vermelho}" aria-hidden="true"></span></article>`).join("")}</div>
  </div></section>
  <section class="section band"><div class="wrap split" style="align-items:start">
    <div class="reveal">${kicker(p.direitos.etiqueta)}<h2 class="h2">${tit(p.direitos.titulo)}</h2></div>
    <div class="reveal">${paras(p.direitos.texto, { lead: true })}<ul class="rights" style="grid-template-columns:repeat(3,1fr)">${(p.direitos.lista || []).map(r => `<li>${inline(r)}</li>`).join("")}</ul></div>
  </div></section>
  ${SplitText(p.intencionalidade)}
  <section class="section band"><div class="wrap split">
    <div class="reveal">${kicker(cu.etiqueta)}<h2 class="h2">${tit(cu.titulo)}</h2>${paras(cu.texto, { lead: true })}
      <div class="info" style="grid-template-columns:1fr 1fr;margin-top:var(--s-4)">${(cu.cartoes || []).map(c => `<div class="info__item"><h3>${tit(c.titulo)}</h3>${paras(c.texto)}</div>`).join("")}</div></div>
    <div class="split__media reveal"><div class="hist-media" style="grid-template-columns:1fr 1fr">
      <div style="grid-row:span 2">${Foto(cu.imagem1, { cls: "rimg--arch", ratio: "3/5" })}</div>
      ${Foto(cu.imagem2, { cls: "rimg--circle", ratio: "1" })}${Foto(cu.imagem3, { cls: "rimg--blob", ratio: "1" })}
    </div></div>
  </div></section>
  ${Chamada(p.chamada)}`;
};

P.contato = () => {
  const c = C.contato, f = c.formulario, k = G.contato;
  const item = (ico, label, val) => val ? `<div class="cinfo__item"><span class="cinfo__ico">${ico}</span><div><b>${label}</b>${val}</div></div>` : "";
  return `
  <section class="phero" style="padding-bottom:calc(var(--section)*.5)"><div class="wrap">
    <nav class="breadcrumb reveal" aria-label="Você está em"><a href="#inicio">Início</a> / <span aria-current="page">Contato</span></nav>
    <div class="reveal" style="max-width:52rem">${kicker(c.topo.etiqueta)}<h1 class="h1" tabindex="-1">${tit(c.topo.titulo)}</h1><div class="lead measure">${paras(c.topo.texto)}</div></div>
  </div></section>
  <section class="section" style="padding-top:0"><div class="wrap contact">
    <div class="reveal">
    <form class="form" id="form" novalidate aria-describedby="form-intro">
      <h2 class="h3" id="form-intro">${esc(f.titulo)}</h2><div style="margin-bottom:1.5rem">${paras(f.texto)}</div>
      <div class="form__grid">
        <div class="field field--full"><label for="f-nome">Nome do responsável</label><input id="f-nome" name="nome" autocomplete="name" required aria-describedby="e-nome"><span class="field__err" id="e-nome" aria-live="polite"></span></div>
        <div class="field"><label for="f-crianca">Nome da criança <small>(opcional)</small></label><input id="f-crianca" name="crianca" autocomplete="off"></div>
        <div class="field"><label for="f-idade">Idade ou faixa etária da criança</label>
          <select id="f-idade" name="idade" required aria-describedby="e-idade"><option value="">Selecione</option>${(f.faixas || []).map(x => `<option>${esc(x)}</option>`).join("")}</select>
          <span class="field__err" id="e-idade" aria-live="polite"></span></div>
        <div class="field"><label for="f-email">E-mail</label><input id="f-email" name="email" type="email" autocomplete="email" required aria-describedby="e-email"><span class="field__err" id="e-email" aria-live="polite"></span></div>
        <div class="field"><label for="f-whats">WhatsApp</label><input id="f-whats" name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" placeholder="(41) 99999-9999" required aria-describedby="e-whats"><span class="field__err" id="e-whats" aria-live="polite"></span></div>
        <fieldset class="field field--full" aria-describedby="e-interesse"><legend>Interesse</legend>
          <div class="seg"><label><input type="radio" name="interesse" value="Berçário" required><span>Berçário</span></label><label><input type="radio" name="interesse" value="Educação Infantil"><span>Educação Infantil</span></label></div>
          <span class="field__err" id="e-interesse" aria-live="polite"></span></fieldset>
        <div class="field field--full"><label for="f-msg">Mensagem <small>(opcional)</small></label><textarea id="f-msg" name="mensagem" placeholder="Conte um pouco sobre o que você gostaria de conhecer."></textarea></div>
        <div class="field field--full"><label class="check"><input type="checkbox" name="consentimento" id="f-lgpd" required aria-describedby="e-lgpd"><span>Autorizo o uso dos meus dados para contato sobre a visita, conforme a <a href="#privacidade">Política de Privacidade</a>.</span></label><span class="field__err" id="e-lgpd" aria-live="polite"></span></div>
      </div>
      <button class="btn btn--red" type="submit">${esc(f.botao)}${ARROW}</button>
      <div class="form__status" id="form-status" role="status" aria-live="polite"></div>
    </form></div>
    <aside class="reveal" aria-label="Informações de contato">
      <h2 class="h3" style="margin-bottom:var(--s-3)">${esc(c.titulo_lateral)}</h2>
      <div class="cinfo">
        ${item(ICON.pin, "Endereço", `<a href="${esc(k.link_mapa)}" target="_blank" rel="noopener">${inline(k.endereco)}</a>`)}
        ${item(ICON.phone, "Telefone e WhatsApp", `<a href="tel:+${esc(k.whatsapp)}">${esc(k.telefone)}</a> · <a href="${waLink()}" target="_blank" rel="noopener">Abrir WhatsApp</a>`)}
        ${item(ICON.mail, "E-mail", k.email ? `<a href="mailto:${esc(k.email)}">${esc(k.email)}</a>` : "")}
        ${item(ICON.clock, "Horário de atendimento", inline(k.horario))}
        ${item(ICON.ig, "Instagram", k.instagram ? `<a href="https://www.instagram.com/${esc(k.instagram)}/" target="_blank" rel="noopener">@${esc(k.instagram)}</a>` : "")}
      </div>
      <div style="margin-top:1rem">${Foto(c.imagem, { cls: "rimg--blob", ratio: "4/3" })}
        <div style="display:flex;flex-wrap:wrap;gap:.75rem;align-items:center;justify-content:space-between;margin-top:1rem"><span><b style="color:var(--ink)">${esc(c.como_chegar)}</b><br><span style="font-size:.92rem">${inline(c.como_chegar_texto)}</span></span><a class="btn btn--ghost" href="${esc(k.link_mapa)}" target="_blank" rel="noopener">Abrir no mapa${ARROW}</a></div>
      </div>
    </aside>
  </div></section>`;
};

P.privacidade = () => {
  const p = C.privacidade, pv = G.privacidade, k = G.contato;
  const vars = { razao_social: pv.razao_social, cnpj: pv.cnpj, endereco: k.endereco, email: k.email, prazo_guarda: pv.prazo_guarda, atualizada_em: pv.atualizada_em,
                 encarregado: pv.encarregado ? `, aos cuidados de ${pv.encarregado}, encarregado(a) pelo tratamento de dados pessoais` : "" };
  const sub = (s) => String(s || "").replace(/\{(\w+)\}/g, (m, n) => n in vars ? vars[n] : m);
  return `<section class="phero"><div class="wrap legal" style="max-width:820px">
    <nav class="breadcrumb" aria-label="Você está em"><a href="#inicio">Início</a> / <span aria-current="page">${esc(p.titulo)}</span></nav>
    <span class="kicker">Privacidade</span><h1 class="h1" tabindex="-1">${tit(p.titulo)}</h1>
    <div class="lead">${paras(sub(p.introducao))}</div>
    ${(p.secoes || []).map(s => `<h2 class="h3" style="margin-top:2.5rem">${inline(sub(s.titulo))}</h2>${paras(sub(s.texto))}`).join("")}
  </div></section>`;
};

/* ------------------------------------------------------------ estrutura fixa */
const NAV = [["historia", "Nossa História"], ["bercario", "Berçário"], ["educacao-infantil", "Educação Infantil"], ["territorios", "Territórios"], ["proposta-pedagogica", "Proposta Pedagógica"], ["contato", "Contato"]];
const SEO = { inicio: "home" };

function Footer() {
  const k = G.contato;
  return `<div class="wrap">${arcs("footer__arcs")}
    <div class="footer__grid">
      <div class="footer__brand"><a href="#inicio" aria-label="Página inicial"><img src="img/logo.png" alt="Paraíso da Criança — Educação Infantil" width="300" height="324" loading="lazy"></a><p class="script">${inline(G.escola.slogan)}</p></div>
      <div><h2>Navegue</h2><ul>${NAV.map(([k, l]) => `<li><a href="#${k}">${l}</a></li>`).join("")}</ul></div>
      <div><h2>Contato</h2><ul>
        <li><a href="${esc(k.link_mapa)}" target="_blank" rel="noopener">${inline(k.endereco)}</a></li>
        <li><a href="tel:+${esc(k.whatsapp)}">${esc(k.telefone)}</a></li>
        ${k.email ? `<li><a href="mailto:${esc(k.email)}">${esc(k.email)}</a></li>` : ""}
      </ul></div>
      <div><h2>Acompanhe</h2><ul>
        ${k.instagram ? `<li><a href="https://www.instagram.com/${esc(k.instagram)}/" target="_blank" rel="noopener">Instagram @${esc(k.instagram)}</a></li>` : ""}
        <li><a href="${waLink()}" target="_blank" rel="noopener">WhatsApp</a></li>
        <li><a href="${esc(agendar())}">Agende uma visita</a></li>
      </ul></div>
    </div>
    <div class="footer__bottom"><span>© ${new Date().getFullYear()} ${esc(G.escola.nome)} · Educação Infantil · Curitiba – PR. Todos os direitos reservados.</span><span><a href="#privacidade">Política de Privacidade</a></span></div>
  </div>`;
}

/* ------------------------------------------------------------ roteador */
const main = document.getElementById("conteudo");
const header = document.querySelector(".header");
const nav = document.getElementById("nav");
const menuBtn = document.getElementById("menu-btn");
let routed = false, io;

function route() {
  const key = (location.hash || "#inicio").slice(1);
  if (key === "conteudo") { main.focus(); return; }
  const k = P[key] ? key : "inicio";
  main.innerHTML = `<div class="page-enter">${P[k]()}</div>`;
  const seo = (C[SEO[k] || k] || {}).seo;
  if (seo) { document.title = seo.titulo; document.querySelector('meta[name="description"]').setAttribute("content", seo.descricao); }
  document.querySelectorAll("[data-route]").forEach(a => a.dataset.route === k ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
  closeMenu();
  window.scrollTo({ top: 0, behavior: "instant" });
  const h1 = main.querySelector("h1"); if (h1 && routed) h1.focus({ preventScroll: true });
  routed = true;
  initReveal();
  if (k === "contato") initForm();
}
function closeMenu() { nav.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.setAttribute("aria-label", "Abrir menu"); }
function initReveal() {
  const els = main.querySelectorAll(".reveal");
  if (reduce() || !("IntersectionObserver" in window)) { els.forEach(el => el.classList.add("in")); return; }
  io && io.disconnect();
  io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: .08 });
  els.forEach(el => io.observe(el));
}

/* ------------------------------------------------------------ formulário */
function initForm() {
  const form = document.getElementById("form"), status = document.getElementById("form-status");
  const rules = {
    nome: v => v.trim().length >= 3 || "Informe o nome do responsável.",
    idade: v => !!v || "Selecione a idade ou faixa etária da criança.",
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Informe um e-mail válido, como nome@exemplo.com.",
    whatsapp: v => v.replace(/\D/g, "").length >= 10 || "Informe um WhatsApp com DDD.",
    interesse: v => !!v || "Escolha Berçário ou Educação Infantil.",
    consentimento: v => v || "É preciso autorizar o uso dos dados para o contato."
  };
  const errId = { nome: "e-nome", idade: "e-idade", email: "e-email", whatsapp: "e-whats", interesse: "e-interesse", consentimento: "e-lgpd" };
  const val = n => n === "consentimento" ? form.consentimento.checked : n === "interesse" ? (form.querySelector("[name=interesse]:checked")?.value || "") : form[n].value;
  const check = n => {
    const r = rules[n](val(n)), box = document.getElementById(errId[n]), field = box.closest(".field");
    const inputs = form.querySelectorAll(`[name=${n}]`);
    if (r === true) { box.textContent = ""; field.removeAttribute("data-invalid"); inputs.forEach(i => i.removeAttribute("aria-invalid")); return true; }
    box.textContent = r; field.setAttribute("data-invalid", ""); inputs.forEach(i => i.setAttribute("aria-invalid", "true")); return false;
  };
  Object.keys(rules).forEach(n => form.querySelectorAll(`[name=${n}]`).forEach(i => i.addEventListener(i.type === "radio" || i.type === "checkbox" ? "change" : "blur", () => check(n))));
  form.whatsapp.addEventListener("input", e => {
    const d = e.target.value.replace(/\D/g, "").slice(0, 11);
    e.target.value = d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d;
  });
  form.addEventListener("submit", async e => {
    e.preventDefault();
    status.className = "form__status"; status.textContent = "";
    const bad = Object.keys(rules).filter(n => !check(n));
    if (bad.length) { form.querySelector(`[name=${bad[0]}]`).focus(); status.className = "form__status err"; status.textContent = `Revise ${bad.length === 1 ? "o campo destacado" : "os " + bad.length + " campos destacados"} para continuar.`; return; }
    const d = Object.fromEntries(new FormData(form));
    const resumo = `Olá! Gostaria de agendar uma visita ao Paraíso da Criança.\nResponsável: ${d.nome}\n${d.crianca ? `Criança: ${d.crianca}\n` : ""}Idade: ${d.idade}\nInteresse: ${d.interesse}\nE-mail: ${d.email}\nWhatsApp: ${d.whatsapp}${d.mensagem ? `\nMensagem: ${d.mensagem}` : ""}`;
    if (!G.formulario_envio) {
      status.className = "form__status warn";
      status.innerHTML = `Seus dados estão corretos, mas o envio automático deste formulário ainda não foi configurado. Para agendar agora, <a href="${waLink(resumo)}" target="_blank" rel="noopener">envie sua solicitação pelo WhatsApp</a> (a mensagem já vai preenchida) ou ligue para ${esc(G.contato.telefone)}.`;
      return;
    }
    const b = form.querySelector("button[type=submit]"); b.disabled = true; b.setAttribute("aria-busy", "true");
    try {
      const res = await fetch(G.formulario_envio, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(d) });
      if (!res.ok) throw new Error(res.status);
      form.reset(); status.className = "form__status ok"; status.textContent = C.contato.formulario.sucesso;
    } catch (err) {
      status.className = "form__status err";
      status.innerHTML = `Não foi possível enviar agora. Tente novamente ou <a href="${waLink(resumo)}" target="_blank" rel="noopener">fale conosco pelo WhatsApp</a>.`;
    } finally { b.disabled = false; b.removeAttribute("aria-busy"); }
  });
}

/* ------------------------------------------------------------ eventos globais */
document.addEventListener("click", e => {
  const s = e.target.closest("[data-scroll]");
  if (s) { e.preventDefault(); document.getElementById(s.dataset.scroll)?.scrollIntoView({ behavior: reduce() ? "auto" : "smooth" }); }
  if (e.target.closest("[data-skip]")) { e.preventDefault(); main.focus(); }
});
menuBtn.addEventListener("click", () => {
  const open = !nav.classList.contains("is-open");
  nav.classList.toggle("is-open", open); menuBtn.setAttribute("aria-expanded", open); menuBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  if (open) nav.querySelector("a")?.focus();
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && nav.classList.contains("is-open")) { closeMenu(); menuBtn.focus(); } });
let lastY = 0;
addEventListener("scroll", () => {
  const y = scrollY; header.classList.toggle("is-scrolled", y > 10);
  header.classList.toggle("is-hidden", y > 400 && y > lastY && !nav.classList.contains("is-open")); lastY = y;
}, { passive: true });

/* ------------------------------------------------------------ início */
async function iniciar() {
  try {
    await Promise.all(ARQUIVOS.map(async f => {
      const r = await fetch(`conteudo/${f}.json`, { cache: "no-cache" });
      if (!r.ok) throw new Error(`conteudo/${f}.json (${r.status})`);
      C[f] = await r.json();
    }));
  } catch (err) {
    main.innerHTML = `<section class="phero"><div class="wrap"><h1 class="h2">Não foi possível carregar o conteúdo do site.</h1><p>Arquivo com problema: <code>${esc(err.message)}</code>. Se você abriu o arquivo direto do computador, use o site publicado — o conteúdo só carrega a partir de um servidor.</p></div></section>`;
    return;
  }
  G = C.geral;
  if (!G.mostrar_pendencias) document.body.classList.add("hide-todo");
  document.getElementById("nav-list").innerHTML = NAV.map(([k, l]) => `<li><a href="#${k}" data-route="${k}">${l}</a></li>`).join("");
  document.querySelectorAll("[data-cta]").forEach(a => { a.href = agendar(); if (/^https?:/.test(agendar())) { a.target = "_blank"; a.rel = "noopener"; } });
  document.getElementById("footer").innerHTML = Footer();
  const wa = document.getElementById("wa"); wa.href = waLink(); wa.innerHTML = ICON.wa;
  addEventListener("hashchange", route);
  route();
}
iniciar();
})();
