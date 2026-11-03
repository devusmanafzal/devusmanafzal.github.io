(() => {
  "use strict";

  const sceneTypes = ["why-hero", "why-map", "horizon", "price", "adoption", "spending", "nordic", "value-gap", "leaders", "allocation", "evidence", "growth", "delegation", "capacity", "frontier", "phases", "constellation", "before-after", "jobs", "foundations", "arc", "why-close", "why-references"];
  const e = (value) => String(value).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
  const n = (value) => Number(value.toFixed(3));
  const delay = (index) => `style="--delay:${n(index * .16)}s"`;
  const text = (x, y, value, cls = "", anchor = "start") => `<text x="${n(x)}" y="${n(y)}" class="${cls}" text-anchor="${anchor}">${e(value)}</text>`;
  const line = (x1, y1, x2, y2, cls = "why-grid") => `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" class="${cls}"/>`;
  const path = (d, cls = "why-draw", index = 0) => `<path d="${d}" class="${cls}" pathLength="1" ${delay(index)}/>`;
  const tip = (name, detail) => `tabindex="0" role="img" aria-label="${e(`${name}: ${detail}`)}" data-tooltip="${e(name.replace(/\|/g, "/"))}|${e(detail.replace(/\|/g, "/"))}"`;
  const bar = (x, y, width, height, index, cls = "") => `<rect x="${n(x)}" y="${n(y)}" width="${n(width)}" height="${n(height)}" rx="4" class="why-bar ${cls}" ${delay(index)}/>`;
  const svg = (scene, markup, width = 1000, height = 340) => `<svg class="why-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${e(scene.id)}-graphic"><title id="${e(scene.id)}-graphic">${e(scene.visual.unit || scene.description)}</title>${markup}</svg>`;
  const heading = (scene) => {
    const parts = scene.title.split("|");
    return `<p class="eyebrow">${e(scene.eyebrow)}</p><h1>${e(parts[0])}${parts[1] ? `<br><em>${e(parts[1])}</em>` : ""}</h1><p class="deck">${e(scene.description)}</p>`;
  };
  const source = (scene, data) => `<div class="scene-source"><p>${e(scene.source || data.meta.dataNote)}<br>Source slide ${scene.sourceSlide}</p><p class="caveat">${e(scene.caveat || "Adapted from the supplied deck. Open Commentary for context.")}</p></div>`;
  const insight = (scene) => `<aside class="insight"><strong class="metric">${e(scene.metric)}</strong><p class="metric-label">${e(scene.metricLabel)}</p><h2>${e(scene.insightTitle)}</h2><p>${e(scene.insight)}</p></aside>`;

  function validateScene(scene, data) {
    const fail = (message) => { throw new Error(`Scene ${scene.id}: ${message}.`); };
    const v = scene.visual;
    if (!Number.isInteger(scene.sourceSlide) || scene.sourceSlide < 1 || scene.sourceSlide > 22 ||
        !v || typeof v !== "object" || !scene.description || !scene.takeaway ||
        !scene.notes.length || !scene.notes.every((note) => typeof note === "string" && note.length)) {
      fail("missing visual, source mapping or commentary");
    }
    const rows = (items) => {
      if (!Array.isArray(items) || !items.length || items.some((item) => !item.label)) fail("missing labeled visual items");
    };
    const value = (item, key, max = Infinity) => {
      if (!Number.isFinite(item[key]) || item[key] < 0 || item[key] > max) fail(`invalid ${key}`);
    };
    if (v.items) rows(v.items);
    if (["horizon", "price", "adoption", "spending", "nordic", "value-gap", "leaders", "allocation", "evidence", "growth", "delegation", "capacity"].includes(scene.type)) {
      rows(v.items);
      v.items.forEach((item) => value(item, "value", ["growth", "delegation", "capacity", "allocation"].includes(scene.type) ? 100 : (v.max || Infinity)));
    }
    if (["horizon", "adoption", "spending", "nordic", "value-gap", "leaders", "evidence"].includes(scene.type) && !(v.max > 0)) fail("invalid maximum");
    if (["nordic", "leaders"].includes(scene.type)) value(v, "benchmark", v.max);
    if (scene.type === "price" && (v.items.length !== 2 || !v.items[0].value)) fail("price comparison requires two values and a positive baseline");
    if (scene.type === "allocation" && v.items.reduce((sum, item) => sum + item.value, 0) !== 100) fail("allocation must sum to 100");
    if (scene.type === "delegation") {
      rows(v.steps);
      v.items.forEach((item, index) => {
        value(item, "year");
        if (index && item.year <= v.items[index - 1].year) fail("years must increase");
      });
    }
    if (["frontier", "before-after"].includes(scene.type)) {
      rows(v.items);
      v.items.forEach((item) => {
        value(item, "before", v.max || Infinity);
        value(item, "after", v.max || Infinity);
        if (scene.type === "before-after" && (!item.before || item.after > item.before)) fail("invalid before/after baseline");
      });
    }
    if (scene.type === "capacity") value(v.confidence, "value", 100);
    if (scene.type === "jobs") {
      ["created", "displaced", "net"].forEach((key) => value(v, key));
      if (v.created - v.displaced !== v.net || !v.created) fail("jobs waterfall does not reconcile");
    }
    if (scene.type === "arc") {
      rows(v.items); rows(v.asks);
      v.items.forEach((item, index) => {
        if (item.start !== (index ? v.items[index - 1].end : 0) || item.end <= item.start ||
            !data.scenes.some((entry) => entry.id === item.sceneId)) fail("invalid timeline segment or scene link");
      });
      if (v.items.at(-1).end !== v.total) fail("timeline does not match total duration");
    }
    if (scene.type === "why-references" && (!Number.isInteger(v.from) || !Number.isInteger(v.count) ||
        v.from < 0 || v.count < 1 || v.from + v.count > data.references.length)) fail("invalid reference slice");
    if (scene.type === "why-hero" && (!Array.isArray(v.orbitLabels) || v.orbitLabels.length !== 6)) fail("hero requires six orbit labels");
    if (scene.type === "phases" && (!v.items || v.items.some((item) => !item.nodes?.length || !item.human || !item.agent))) fail("invalid operating model");
    if (scene.type === "foundations" && (!v.layers?.length || !v.readiness?.length || !v.risks?.length)) fail("missing foundation indicators");
    if (scene.type === "constellation" && (!v.center?.display || v.items?.length !== 5)) fail("constellation requires a center and five signals");
  }

  function hero(scene, data) {
    const points = [[300,38],[505,139],[505,350],[300,452],[95,350],[95,139]];
    const graphic = svg(scene, `<circle cx="300" cy="245" r="155" class="why-orbit"/><circle cx="300" cy="245" r="110" class="why-orbit inner"/>${points.map(([x,y],i) =>
      `${path(`M${x},${y}Q300,${y} 300,245`, "why-draw why-spoke", i)}<circle cx="${x}" cy="${y}" r="6" class="why-dot why-reveal" ${delay(i)}/>${text(x,y + (i === 0 ? -18 : 28),scene.visual.orbitLabels[i],"why-small","middle")}`).join("")}<circle cx="300" cy="245" r="68" class="why-hub"/>${text(300,251,scene.visual.center,"why-hub-label","middle")}`,600,490);
    return `<section class="scene ai-curve-scene why-scene why-hero"><div class="why-hero-copy">${heading(scene)}<p class="byline">${e(data.meta.presenter)} / ${e(data.meta.role)}</p><button class="begin" data-next>${e(scene.visual.action)} <span aria-hidden="true">&#8594;</span></button><p class="why-edition">${e(data.meta.edition)}</p></div><div class="why-hero-art">${graphic}<p class="why-orbit-caption">${e(scene.visual.edition)}</p></div></section>`;
  }

  function horizon(scene) {
    const v = scene.visual;
    let markup = text(35,25,v.unit,"why-small");
    [0,60,120,180,240,300,360].forEach((tick) => {
      const y = 282 - tick / v.max * 205;
      markup += line(45,y,735,y) + text(25,y+5,tick,"why-tick","end");
    });
    markup += v.items.map((item,i) => {
      const x = 95 + i * 145, y = 282 - item.value / v.max * 205;
      return `<g ${tip(item.label,`${item.date}; ${item.display} at 50% success`)}>${bar(x-22,y,44,282-y,i,"why-bar-y")}<circle cx="${x}" cy="${y}" r="5" class="why-dot"/>${text(x,y-15,item.display,"why-value","middle")}${text(x,310,item.label,"why-small","middle")}${text(x,333,item.date,"why-tick","middle")}</g>`;
    }).join("");
    return svg(scene,markup,780,350);
  }

  function price(scene) {
    const [before,after] = scene.visual.items;
    return svg(scene,`${text(30,26,scene.visual.unit,"why-small")}
      <g ${tip(before.label,`${before.display} per million tokens`)}>${text(30,66,before.label,"why-small")}${text(30,140,before.display,"why-big")}${bar(30,165,650,40,0)}</g>
      ${path("M670,210C670,260 230,220 230,275","why-draw why-cost-curve",2)}
      <g ${tip(after.label,`${after.display} per million tokens`)}>${text(30,235,after.label,"why-small")}${text(30,315,after.display,"why-big why-accent")}${bar(230,280,650*after.value/before.value,40,2,"why-accent-bar")}</g>`,750,350);
  }

  function horizontal(scene) {
    const v = scene.visual;
    const adoption = scene.type === "adoption";
    const valueGap = scene.type === "value-gap";
    const x0 = valueGap ? 320 : (adoption ? 190 : 165), plot = valueGap ? 410 : (adoption ? 435 : 460);
    const rowHeight = valueGap ? 52 : 78, y0 = valueGap ? 55 : 75;
    let markup = text(12,22,v.unit,"why-small");
    if (v.benchmark !== undefined) {
      const bx = x0 + v.benchmark/v.max*plot;
      markup += line(bx,60,bx,y0+rowHeight*(v.items.length-1)+25,"why-benchmark") + text(bx,49,`EU ${v.benchmark}%`,"why-tick","middle");
    }
    markup += v.items.map((item,i) => {
      const y = y0+i*rowHeight, width = item.value/v.max*plot;
      const accented = i === 0 || (valueGap && i === v.items.length-1);
      return `<g ${tip(item.label,`${item.display}${item.period ? `; ${item.period}` : ""}`)}>${text(12,y+5,item.label,"why-row-label")}${bar(x0,y-13,plot,25,i,"why-track")}${bar(x0,y-13,width,25,i,accented ? "why-accent-bar" : "why-neutral-bar")}${text(x0+width+12,y+6,item.display,"why-value")}${adoption ? text(x0,y+35,item.period,"why-tick") : ""}</g>`;
    }).join("");
    if (adoption) markup += text(x0+plot,330,"100% of US adults","why-tick","end");
    return svg(scene,markup,valueGap ? 820 : 780,350);
  }

  function spending(scene) {
    const v = scene.visual, y0 = 285;
    let markup = text(20,25,v.unit,"why-small");
    [0,1,2,3,4].forEach((tick) => {
      const y = y0-tick/v.max*215;
      markup += line(50,y,740,y) + text(35,y+5,`$${tick}T`,"why-tick","end");
    });
    markup += v.items.map((item,i) => {
      const x = 135+i*225, height = item.value/v.max*215;
      return `<g ${tip(item.label,`${item.display}${item.forecast ? "; forecast" : ""}`)}>${bar(x,y0-height,100,height,i,`why-bar-y ${item.forecast ? "why-forecast-bar" : "why-accent-bar"}`)}${text(x+50,y0-height-17,item.display,"why-value","middle")}${text(x+50,316,item.label,"why-small","middle")}</g>`;
    }).join("");
    return svg(scene,markup,780,345);
  }

  function leaders(scene) {
    const v = scene.visual, x0=240, width=450, bx=x0+v.benchmark/v.max*width;
    let markup = text(12,25,v.unit,"why-small") + line(bx,62,bx,300,"why-benchmark") + text(bx,52,"1.0× baseline","why-tick","middle");
    markup += v.items.map((item,i) => {
      const y=105+i*78, x=x0+item.value/v.max*width;
      return `<g ${tip(item.label,`${item.display} versus laggards indexed to 1.0`)}>${text(12,y+5,item.label,"why-row-label")}${line(x0,y,725,y)}${path(`M${bx},${y}C${bx+40},${y-32} ${x-40},${y-32} ${x},${y}`)}<circle cx="${bx}" cy="${y}" r="5" class="why-open-dot"/><circle cx="${x}" cy="${y}" r="8" class="why-dot why-reveal" ${delay(i+2)}/>${text(x+17,y+6,item.display,"why-value")}</g>`;
    }).join("");
    return svg(scene,markup,800,345);
  }

  function allocation(scene) {
    let offset=0;
    const ribbon = scene.visual.items.map((item,i) => {
      const x=offset; offset+=item.value;
      return `<div class="why-allocation-segment why-tone-${i}" style="width:${item.value}%;--delay:${i*.2}s" ${tip(item.label,`${item.value}% / ${item.detail}`)}><strong>${item.value}%</strong></div>`;
    }).join("");
    return `<div class="why-allocation"><p class="why-unit">${e(scene.visual.unit)}</p><div class="why-ribbon">${ribbon}</div><div class="why-allocation-labels">${scene.visual.items.map((item,i) => `<article class="why-reveal" ${delay(i+2)}><span class="why-allocation-key why-tone-${i}">${item.value}%</span><h2>${e(item.label)}</h2><p>${e(item.detail)}</p></article>`).join("")}</div></div>`;
  }

  function evidence(scene) {
    const v=scene.visual;
    let markup=text(20,24,v.unit,"why-small");
    markup += v.items.map((item,i) => {
      const x=60+i*205, h=item.value/v.max*165;
      return `<g ${tip(`${item.label} / ${item.measure}`,`${item.display}. ${item.study}`)}>${text(x+65,62,item.display,"why-study-value","middle")}${bar(x+32,265-h,66,h,i,`why-bar-y ${i===0 ? "why-accent-bar" : "why-neutral-bar"}`)}${text(x+65,292,item.label,"why-row-label","middle")}${text(x+65,318,item.measure,"why-tick","middle")}${text(x+65,341,i===0 ? "COPILOT EXPERIMENT" : (i===1 || i===4 ? "SUPPORT STUDY" : "CONSULTANT STUDY"),"why-tick","middle")}</g>`;
    }).join("");
    return svg(scene,markup,1100,360);
  }

  function growth(scene) {
    const v=scene.visual;
    const cards=v.items.map((item,i) => {
      const circumference=2*Math.PI*62;
      return `<article class="why-ring-card why-reveal ${item.forecast ? "why-expected" : ""}" ${delay(i)}><p class="why-status">${e(item.status)}</p><svg viewBox="0 0 170 170" class="why-ring" role="img" aria-label="${e(`${item.label}: ${item.display}`)}"><circle cx="85" cy="85" r="62" class="why-ring-track"/><circle cx="85" cy="85" r="62" class="why-ring-progress" stroke-dasharray="${circumference}" style="--circumference:${circumference};--offset:${circumference*(1-item.value/100)};--delay:${i*.2}s"/><text x="85" y="94" text-anchor="middle">${e(item.display)}</text></svg><h2>${e(item.label)}</h2></article>`;
    }).join("");
    return `<div class="why-growth"><p class="why-unit">${e(v.unit)}</p><div class="why-ring-grid">${cards}</div><p class="why-growth-note">${e(v.redesign)}</p></div>`;
  }

  function delegation(scene) {
    const v=scene.visual, x=(year)=>70+(year-2025)/5*930;
    const y = (value) => 180-value*3;
    const [first,second,last] = v.items;
    let markup=text(30,25,v.unit,"why-small");
    markup+=path(`M${x(first.year)},${y(first.value)}L${x(second.year)},${y(second.value)}`);
    markup+=path(`M${x(second.year)},${y(second.value)}L${x(last.year)},${y(last.value)}`,"why-forecast-line",1);
    markup+=v.items.map((item,i) => `<g ${tip(item.label,`${item.display} of AI value${item.forecast ? "; forecast" : ""}`)}><circle cx="${x(item.year)}" cy="${180-item.value*3}" r="7" class="${item.forecast ? "why-open-dot" : "why-dot"} why-reveal" ${delay(i)}/>${text(x(item.year),165-item.value*3,item.display,"why-value","middle")}${text(x(item.year),186,item.label,"why-small","middle")}</g>`).join("");
    return `<div class="why-agent-layout">${svg(scene,markup,1070,205)}<div class="why-process">${v.steps.map((item,i)=>`<article class="why-reveal" ${delay(i+3)}><span class="why-status">${e(item.owner)}</span><h2>${e(item.label)}</h2><span class="why-process-arrow" aria-hidden="true">${i<2 ? "→" : "↻"}</span></article>`).join("")}</div></div>`;
  }

  function capacity(scene) {
    return `<div class="why-capacity"><div class="why-crowd-grid">${scene.visual.items.map((item,i)=>`<article class="why-crowd why-reveal" ${delay(i)}><div class="why-crowd-copy"><span class="why-status">${e(item.group)}</span><strong>${e(item.display)}</strong><h2>${e(item.label)}</h2></div><div class="why-dot-field" role="img" aria-label="${e(`${item.value} of 100 representing ${item.group.toLowerCase()}`)}">${Array.from({length:100},(_,j)=>`<i class="${j<item.value ? "filled" : ""}" style="--delay:${n(i*.25+j*.006)}s"></i>`).join("")}</div></article>`).join("")}</div><p class="why-capacity-note"><strong>${e(scene.visual.confidence.display)}</strong> ${e(scene.visual.confidence.label)}</p></div>`;
  }

  function frontier(scene) {
    const v=scene.visual,x0=355,width=650;
    let markup=text(12,20,v.unit,"why-small")+`<circle cx="680" cy="15" r="6" class="why-open-dot"/>${text(695,20,v.groups[0],"why-tick")}<circle cx="865" cy="15" r="6" class="why-dot"/>${text(880,20,v.groups[1],"why-tick")}`;
    [0,25,50,75,100].forEach((tick)=>{const x=x0+tick/100*width;markup+=line(x,40,x,304)+text(x,333,`${tick}%`,"why-tick","middle");});
    markup+=v.items.map((item,i)=>{
      const y=70+i*49, b=x0+item.before/100*width,a=x0+item.after/100*width;
      return `<g ${tip(item.label,`${v.groups[0]} ${item.before}%; ${v.groups[1]} ${item.after}%${item.lowerBetter ? "; lower is better" : ""}`)}>${text(12,y+5,item.label,"why-row-label")}${item.lowerBetter ? text(12,y+22,"LOWER IS BETTER","why-tick why-accent") : ""}${path(`M${b},${y}L${a},${y}`,"why-draw why-pair-line",i)}<circle cx="${b}" cy="${y}" r="6" class="why-open-dot"/><circle cx="${a}" cy="${y}" r="7" class="why-dot why-reveal" ${delay(i)}/>${text(b+(b>a?14:-14),y+5,`${item.before}%`,"why-tick",b>a?"start":"end")}${text(a+(a>b?14:-14),y+5,`${item.after}%`,"why-value",a>b?"start":"end")}</g>`;
    }).join("");
    return svg(scene,markup,1100,350);
  }

  function phases(scene) {
    return `<div class="why-phases">${scene.visual.items.map((item,i)=>{
      const nodes=item.nodes.map((label,j)=>{
        const x=90+j*(220/(item.nodes.length-1)),y=j===0?62:136+(j%2?0:34);
        return `${j?path(`M90,62Q${x},62 ${x},${y-20}`,"why-draw",j):""}<circle cx="${x}" cy="${y}" r="${j?21:28}" class="${j?"why-agent-node":"why-human-node"}"/>${text(x,y+6,label,"why-node-label","middle")}`;
      }).join("");
      return `<article class="why-phase why-reveal" ${delay(i)}><span class="why-step">0${i+1} / ${e(item.detail)}</span><h2>${e(item.label)}</h2><svg class="why-svg why-phase-svg" viewBox="0 0 400 205" aria-hidden="true">${nodes}</svg><p><strong>${e(item.human)}</strong><br>${e(item.agent)}</p></article>`;
    }).join("")}</div>`;
  }

  function constellation(scene) {
    const v=scene.visual,points=[[165,68],[540,45],[925,68],[825,285],[255,285]];
    let markup="";
    points.forEach(([x,y],i)=>{markup+=path(`M540,180Q${x},180 ${x},${y}`,"why-draw why-spoke",i);});
    markup+=`<g ${tip(v.center.label,v.center.detail)}><circle cx="540" cy="180" r="76" class="why-hub"/>${text(540,180,v.center.display,"why-constellation-big","middle")}${text(540,207,v.center.label,"why-small","middle")}</g>`;
    markup+=v.items.map((item,i)=>{
      const [x,y]=points[i];
      return `<g class="why-reveal" ${delay(i+1)} ${tip(item.label,`${item.display}. ${item.detail}`)}><rect x="${x-125}" y="${y-36}" width="250" height="85" rx="12" class="why-signal-bg"/>${text(x,y+1,item.display,"why-signal-value","middle")}${text(x,y+29,item.label,"why-small","middle")}</g>`;
    }).join("");
    return svg(scene,markup,1090,350);
  }

  function beforeAfter(scene) {
    const v=scene.visual,x0=420,width=510;
    let markup=text(12,23,v.unit,"why-small")+text(x0,50,"BEFORE","why-tick")+text(1050,50,"AFTER","why-tick","end");
    markup+=v.items.map((item,i)=>{
      const y=82+i*65, ratio=item.after/item.before;
      return `<g ${tip(item.label,item.detail)}>${text(12,y+12,item.label,"why-row-label")}${bar(x0,y,width,10,i,"why-track")}${bar(x0,y+17,width*ratio,15,i,item.bounded?"why-bound-bar":"why-accent-bar")}${text(x0-18,y+13,item.beforeDisplay,"why-tick","end")}${text(1050,y+28,item.afterDisplay,"why-value","end")}</g>`;
    }).join("");
    return svg(scene,markup,1100,350);
  }

  function jobs(scene) {
    const v=scene.visual,y=(value)=>285-value/190*220;
    const columns=[{x:105,bottom:0,top:v.created},{x:330,bottom:v.net,top:v.created},{x:555,bottom:0,top:v.net}];
    let markup=text(15,24,v.unit,"why-small")+line(45,285,745,285,"why-axis");
    [50,100,150].forEach((tick)=>{markup+=line(45,y(tick),745,y(tick))+text(35,y(tick)+5,tick,"why-tick","end");});
    markup+=line(205,y(v.created),330,y(v.created),"why-benchmark")+line(430,y(v.net),555,y(v.net),"why-benchmark");
    markup+=columns.map((col,i)=>{
      const item=v.items[i];
      return `<g ${tip(item.label,`${item.display}; WEF all-macrotrend projection for 2030`)}>${bar(col.x,y(col.top),100,y(col.bottom)-y(col.top),i,`why-bar-y ${i===1?"why-neutral-bar":"why-accent-bar"}`)}${text(col.x+50,y(col.top)-16,item.display,"why-value","middle")}${text(col.x+50,320,item.label,"why-small","middle")}</g>`;
    }).join("");
    return svg(scene,markup,780,345);
  }

  function foundations(scene) {
    const v=scene.visual;
    return `<div class="why-foundations"><div class="why-layer-stack">${v.layers.map((label,i)=>`<div class="why-layer why-reveal" style="--delay:${i*.18}s;--indent:${(3-i)*18}px"><span>0${i+1}</span><strong>${e(label)}</strong></div>`).join("")}</div><div class="why-readiness"><p class="why-status">REPORTED READINESS / SEPARATE STUDIES</p><div class="why-readiness-grid">${v.readiness.map((item,i)=>`<article class="why-reveal" ${delay(i)} ${tip(item.label,item.detail)}><strong>${e(item.display)}</strong><p>${e(item.label)}</p></article>`).join("")}</div><p class="why-status">FORECAST RISKS / DIFFERENT SCOPES</p><div class="why-risk-grid">${v.risks.map((item,i)=>`<article class="why-reveal" ${delay(i+3)} ${tip(item.label,item.detail)}><strong>${e(item.display)}</strong><p>${e(item.label)}</p></article>`).join("")}</div></div></div>`;
  }

  function arc(scene) {
    const v=scene.visual;
    const columns=v.items.map((item)=>`${item.end-item.start}fr`).join(" ");
    return `<div class="why-arc"><div class="why-time-ribbon" style="grid-template-columns:${columns}" aria-label="Proportional ${v.total}-minute agenda">${v.items.map((item,i)=>`<div ${delay(i)}><span>${item.start}–${item.end}</span><small>MIN</small></div>`).join("")}</div><div class="why-arc-links" style="grid-template-columns:${columns}">${v.items.map((item,i)=>`<button data-scene="${e(item.sceneId)}" class="why-reveal" ${delay(i)}><span class="why-step">0${i+1}</span><strong>${e(item.label)}</strong><small>Ideas ${e(item.ideas)}</small></button>`).join("")}</div><div class="why-asks">${v.asks.map((item,i)=>`<article class="why-reveal" ${delay(i+3)}><span class="why-step">0${i+1}</span><h2>${e(item.label)}</h2><p>${e(item.detail)}</p></article>`).join("")}</div></div>`;
  }

  function renderScene(scene, data) {
    if (scene.type==="why-hero") return hero(scene,data);
    let visual;
    switch(scene.type) {
      case "why-map":
        visual=`<div class="why-act-grid">${data.chapters.map((chapter,i)=>`<button data-scene="${e(chapter.sceneIds[0])}" class="why-act why-reveal" ${delay(i)}><span class="why-step">ACT ${e(chapter.number)}</span><h2>${e(chapter.title)}</h2><p>${e(chapter.subtitle)}</p><svg viewBox="0 0 160 60" aria-hidden="true">${path(["M5,50Q80,50 150,5","M5,50C40,5 80,50 150,5","M5,5Q85,58 150,5","M5,50Q85,5 150,5","M5,50C50,50 50,5 150,5","M5,50L50,50L50,28L100,28L100,5L150,5"][i])}</svg><span class="why-act-arrow" aria-hidden="true">↗</span></button>`).join("")}</div>`;
        break;
      case "horizon": visual=horizon(scene); break;
      case "price": visual=price(scene); break;
      case "adoption": case "nordic": case "value-gap": visual=horizontal(scene); break;
      case "spending": visual=spending(scene); break;
      case "leaders": visual=leaders(scene); break;
      case "allocation": visual=allocation(scene); break;
      case "evidence": visual=evidence(scene); break;
      case "growth": visual=growth(scene); break;
      case "delegation": visual=delegation(scene); break;
      case "capacity": visual=capacity(scene); break;
      case "frontier": visual=frontier(scene); break;
      case "phases": visual=phases(scene); break;
      case "constellation": visual=constellation(scene); break;
      case "before-after": visual=beforeAfter(scene); break;
      case "jobs": visual=jobs(scene); break;
      case "foundations": visual=foundations(scene); break;
      case "arc": visual=arc(scene); break;
      case "why-close":
        visual=`<div class="why-close-pillars">${scene.visual.items.map((item,i)=>`<article class="why-reveal" ${delay(i)}><strong>${e(item.value)}</strong><h2>${e(item.label)}</h2><p>${e(item.detail)}</p><svg viewBox="0 0 250 65" aria-hidden="true">${path(`M5,60C80,60 ${80+i*30},5 245,5`)}</svg></article>`).join("")}</div><p class="why-closing-line">${e(scene.visual.closing)}</p>`;
        break;
      case "why-references":
        visual=`<div class="why-reference-list">${data.references.slice(scene.visual.from,scene.visual.from+scene.visual.count).map((reference,i)=>`<a href="${e(reference.url)}" target="_blank" rel="noopener noreferrer"><span class="why-reference-number">${String(scene.visual.from+i+1).padStart(2,"0")}</span><span><strong>${e(reference.label)} ↗</strong><small>${e(reference.detail)}</small></span></a>`).join("")}</div>`;
        break;
      default: throw new Error(`No renderer for scene type ${scene.type}.`);
    }
    return `<section class="scene ai-curve-scene why-scene why-scene-${scene.type}" aria-label="${e(scene.title.replace("|"," "))}">${heading(scene)}<div class="why-body ${scene.metric ? "why-with-insight" : ""}"><div class="why-visual">${visual}</div>${scene.metric ? insight(scene) : ""}</div>${source(scene,data)}</section>`;
  }

  window.KEYNOTE_DECK = { dataUrl:"data/why-ai-why-now.json", sceneTypes, validateScene, renderScene };
})();
