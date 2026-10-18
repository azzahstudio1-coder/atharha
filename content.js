'use strict';
/* ================= icons & illustrations ================= */
const I = {
  logo:'<svg viewBox="0 0 48 48" fill="none"><path d="M24 4C24 4 9 20 9 30a15 15 0 0 0 30 0C39 20 24 4 24 4Z" fill="currentColor" opacity=".18"/><path d="M24 4C24 4 9 20 9 30a15 15 0 0 0 30 0C39 20 24 4 24 4Z" stroke="currentColor" stroke-width="2.5"/><path d="M17 31c3-2 5 2 8 0s5-2 7 0" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="24" cy="22" r="2.6" fill="currentColor"/></svg>',
  leaf:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4C11 4 5 9 5 16c0 1.4.3 2.6.8 3.6L4 21.4 5.4 23l1.9-1.9c1 .5 2.2.9 3.7.9 7 0 9-7 9-18Zm-9 15c-.9 0-1.7-.2-2.4-.5C11 15 13.6 12 17 9.5c-3.9 1.4-7 4.4-9.6 7.9-.2-.5-.4-1-.4-1.4C7 10.7 11.4 7 17.9 6.1 17.3 14.6 15.2 19 11 19Z"/></svg>',
  pan:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><ellipse cx="10" cy="13" rx="7.5" ry="4"/><path d="M17.5 13h4.5M2.5 13v1c0 2.2 3.4 4 7.5 4s7.5-1.8 7.5-4v-1"/></svg>',
  scratch:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><ellipse cx="12" cy="12" rx="9" ry="5"/><path d="m8 11 3 2m1-3 3 2m-1 2 2-1"/></svg>',
  flame:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3s6 5 6 11a6 6 0 0 1-12 0c0-3 2-5 2-5s0 3 2 4c0-5 2-10 2-10Z"/></svg>',
  water:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11Z"/><path d="M9 15a3 3 0 0 0 3 3" stroke-linecap="round"/></svg>',
  fries:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 10h14l-2 11H7L5 10Z"/><path d="M8 10V4m3 6V3m3 7V4m3 6V6" stroke-linecap="round"/></svg>',
  box:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 9h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9Z"/><path d="M3 6h18v3H3z"/></svg>',
  lips:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M9 3h6v6H9zM8 9h8v12H8z"/></svg>',
  floss:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="9" width="14" height="11" rx="3"/><path d="M12 9V3m0 0 4 2"/></svg>',
  sofa:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3"/><path d="M2 12a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2v-5ZM5 17v2m14-2v2"/></svg>',
  bulb:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 18h6m-5 3h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z"/></svg>',
  cam:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  gauge:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 16a8 8 0 1 1 16 0"/><path d="m12 16 4-5"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 6c-2-1.5-5-2-8-1.5v14c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-14c-3-.5-6 0-8 1.5Zm0 0v14"/></svg>',
  flag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 21V4m0 1h11l-2 4 2 4H5"/></svg>',
  people:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-3.5 3.2-5.5 6.5-5.5s6 2 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14.5c2.5 0 4.2 1.5 4.5 4"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5m5-5-5 5 5 5"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11Z"/></svg>',
  share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.8 7.6-3.6m-7.6 6 7.6 3.6"/></svg>',
  img:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m3 17 5-4 4 3 3-2 6 4"/></svg>',
  recycle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 19H4.5a1.5 1.5 0 0 1-1.3-2.2L5 13.5m3-7.3 1.3-2.3a1.5 1.5 0 0 1 2.6 0L13.5 7M17 19h2.5a1.5 1.5 0 0 0 1.3-2.2L19 13.5M10 19h7m-9.8-9L5 13.5l-3.5-.8M17 10l2 3.5 3.3-1.2M15 21.5 17 19l-2-2.5"/></svg>',
  bottle:n=>`<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M20 5 8 26h24L20 5Z"/><text x="20" y="24" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none" font-family="sans-serif">${n}</text></svg>`,
  jar:'<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="11" y="6" width="18" height="5" rx="1.5"/><path d="M10 11h20v20a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V11Z"/><path d="M15 18v9" stroke-linecap="round" opacity=".5"/></svg>'
};
/* level illustrations: seed, sprout, palm, oasis */
const PLANTS = [
  `<svg viewBox="0 0 120 120"><ellipse cx="60" cy="96" rx="44" ry="12" fill="var(--soil)" opacity=".35"/><ellipse cx="60" cy="86" rx="13" ry="9" fill="var(--soil)"/><path d="M60 78c0-8 4-13 10-15-1 7-4 12-10 15Z" fill="var(--kelp)"/></svg>`,
  `<svg viewBox="0 0 120 120"><ellipse cx="60" cy="98" rx="44" ry="12" fill="var(--soil)" opacity=".35"/><path d="M60 98V54" stroke="var(--kelp)" stroke-width="5" stroke-linecap="round"/><path d="M60 70c-4-14-16-18-26-16 2 12 12 18 26 16Z" fill="var(--kelp)"/><path d="M60 60c4-14 16-18 26-16-2 12-12 18-26 16Z" fill="var(--kelp)" opacity=".8"/><path d="M60 54c-2-8 1-14 6-17 1 7-1 13-6 17Z" fill="var(--kelp)"/></svg>`,
  `<svg viewBox="0 0 120 120"><ellipse cx="60" cy="104" rx="44" ry="10" fill="var(--soil)" opacity=".35"/><path d="M58 104c-2-22 0-44 4-62h4c-2 18-3 40-2 62Z" fill="var(--soil)"/><g fill="var(--kelp)"><path d="M63 40C50 26 32 26 20 34c16-2 30 2 43 6Z"/><path d="M63 40c13-14 31-14 43-6-16-2-30 2-43 6Z"/><path d="M63 40C56 22 42 14 30 14c12 6 24 14 33 26Z" opacity=".85"/><path d="M63 40c7-18 21-26 33-26-12 6-24 14-33 26Z" opacity=".85"/><path d="M63 40C48 40 34 50 30 62c10-10 21-16 33-22Z" opacity=".7"/><path d="M63 40c15 0 29 10 33 22-10-10-21-16-33-22Z" opacity=".7"/></g><circle cx="60" cy="46" r="3" fill="var(--sun)"/><circle cx="66" cy="47" r="3" fill="var(--sun)"/></svg>`,
  `<svg viewBox="0 0 120 120"><ellipse cx="60" cy="100" rx="52" ry="14" fill="var(--sea2)" opacity=".55"/><path d="M30 99c8-3 16 3 24 0s16-3 24 0" stroke="var(--onsea)" stroke-width="2" fill="none" opacity=".7"/><path d="M40 98c-2-20 0-38 4-52h3c-2 15-3 33-2 52Z" fill="var(--soil)"/><g fill="var(--kelp)"><path d="M45 44C34 32 18 32 8 40c14-2 26 1 37 4Z"/><path d="M45 44c11-12 27-12 37-4-14-2-26 1-37 4Z"/><path d="M45 44C39 28 27 22 17 22c10 5 21 12 28 22Z" opacity=".85"/><path d="M45 44c6-16 18-22 28-22-10 5-21 12-28 22Z" opacity=".85"/></g><path d="M82 98c-1-12 0-22 3-30h2c-1 9-2 19-1 30Z" fill="var(--soil)"/><g fill="var(--kelp)" opacity=".9"><path d="M86 68c-7-8-17-8-24-3 9-1 17 1 24 3Z"/><path d="M86 68c7-8 17-8 24-3-9-1-17 1-24 3Z"/><path d="M86 68c-3-10-10-14-16-14 6 3 12 8 16 14Z"/><path d="M86 68c3-10 10-14 16-14-6 3-12 8-16 14Z"/></g><circle cx="98" cy="22" r="8" fill="var(--sun)"/></svg>`
];
const LEVELS = [['بذرة',0],['شتلة',100],['نخلة',250],['واحة',500]];

/* ================= content ================= */
const QUESTIONS = [
  {id:'cook',src:'kitchen',icon:'pan',t:'وش أكثر أواني طبخ تستخدمونها؟',h:'أغلب الأواني غير اللاصقة مطلية بمادة PTFE من عائلة PFAS.',o:[['غير لاصقة (تيفال) يوميًا','',15],['غير لاصقة أحيانًا','',8],['جرانيت أو ماربل','كثير منها مطلي بنفس المادة',6],['ستانلس أو حديد زهر أو فخار','',0]]},
  {id:'scratch',src:'kitchen',icon:'scratch',t:'هل الأواني غير اللاصقة عندكم مخدوشة أو قديمة؟',h:'الطلاء المخدوش يتقشر مع الأكل.',o:[['نعم، فيها خدوش','',8],['لا، سليمة','',0],['ما عندنا أواني غير لاصقة','',0]]},
  {id:'heat',src:'kitchen',icon:'flame',t:'كم مرة تسخنين المقلاة وهي فاضية أو على نار عالية؟',h:'الحرارة العالية تطلق أبخرة من الطلاء.',o:[['كثير','',5],['أحيانًا','',2],['نادرًا','',0]]},
  {id:'water',src:'water',icon:'water',t:'من وين مياه الشرب في بيتكم؟',h:'PFAS ممكن توصل لمياه الشرب، والفلاتر تقللها.',o:[['فلتر تناضح عكسي (RO)','',2],['مياه معبأة','',4],['من الصنبور بدون فلتر','',10]]},
  {id:'pack',src:'food',icon:'fries',t:'كم مرة تاكلين من تغليف الوجبات السريعة أو أكياس فشار المايكرويف؟',h:'الورق المقاوم للدهون كثير منه معالج بمواد PFAS.',o:[['أكثر من مرة بالأسبوع','',8],['مرة بالأسبوع تقريبًا','',4],['نادرًا','',0]]},
  {id:'plastic',src:'food',icon:'box',type:'plastic',t:'علب حفظ الأكل عندكم من أي نوع؟',h:'شوفي الرقم داخل المثلث تحت العلبة.',o:[['1','PET',3],['2','HDPE',4],['3','PVC',6],['4','LDPE',2],['5','PP',2],['6','PS',6],['7','أخرى',6],['زجاج','أو ستانلس',0]]},
  {id:'cosm',src:'personal',icon:'lips',t:'تستخدمين مكياج مقاوم للماء أو يدوم طويل؟',h:'مثل الماسكرا المقاومة للماء وكريم الأساس طويل الثبات.',o:[['يوميًا','',7],['أحيانًا','',4],['لا','',0]]},
  {id:'floss',src:'personal',icon:'floss',t:'وش نوع خيط الأسنان اللي تستخدمينه؟',h:'بعض الخيوط الناعمة جدًا مطلية بمادة PTFE.',o:[['ناعم جدًا وينزلق بسهولة','',4],['عادي أو ما أستخدم','',0]]},
  {id:'tex',src:'home',icon:'sofa',t:'عندكم سجاد أو كنب أو ملابس مقاومة للبقع أو الماء؟',h:'معالجة «مقاوم للبقع» غالبًا تعتمد على PFAS.',o:[['كثير','',6],['شوي','',3],['لا','',0]]},
  {id:'aware',src:null,icon:'bulb',t:'قبل اليوم، هل سمعتِ عن مواد PFAS أو «الكيميائيات الأبدية»؟',h:'سؤال للبحث، ما يأثر على نسبتك.',o:[['نعم، وأعرف عنها','',0],['سمعت بس ما أعرف التفاصيل','',0],['لا، أول مرة','',0]]}
];
const SOURCES = {kitchen:['المطبخ',28],water:['مياه الشرب',10],food:['تغليف وحفظ الأكل',14],personal:['العناية الشخصية',11],home:['البيت والأقمشة',6],products:['منتجات فحصتيها',31]};
const DICT = [['PTFE',/\bPTFE\b|polytetrafluoroethylene|teflon|تفلون/i],['Perfluoro-',/perfluoro/i],['Polyfluoro-',/polyfluoro/i],['PFOA',/\bPFOA\b|perfluorooctanoic/i],['PFOS',/\bPFOS\b/i],['PFAS',/\bPFAS\b/i],['PFHxS / PFNA',/\bPF(HxS|HxA|NA|BS|BA|DA)\b/i],['GenX',/\bgen ?x\b|HFPO/i],['Fluorotelomer',/fluorotelomer/i],['Fluoropolymer',/fluoropolymer|\bPVDF\b/i]];
const SAMPLES = [['ماسكرا مقاومة للماء','Isododecane, Cera Alba, Polyethylene, Perfluorononyl Dimethicone, Iron Oxides'],['كريم أساس','Aqua, Cyclopentasiloxane, Titanium Dioxide, PTFE, Glycerin, Polyperfluoromethylisopropyl Ether'],['شامبو','Aqua, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Glycerin, Parfum'],['خيط أسنان ناعم','PTFE fiber, microcrystalline wax, flavor']];

const pt=(id,a)=>{const q=QUESTIONS.find(x=>x.id===id);return a[id]===undefined?0:q.o[+a[id]][2]};
const prodPts=()=>Math.min(31,S.products.reduce((s,p)=>s+p.hits.length*8,0));
const SWAPS = [
  {id:'pan',red:a=>pt('cook',a),when:a=>['0','1','2'].includes(a.cook),from:'مقلاة غير لاصقة',to:'حديد زهر أو ستانلس',why:'بدون طلاء يتقشر، وتعمّر سنين، فتقللين النفايات بعد.',leaves:30},
  {id:'scratch',red:a=>pt('scratch',a),when:a=>a.scratch==='0',from:'أواني مخدوشة',to:'تخلّصي منها اليوم',why:'الخدوش تعني إن جزء من الطلاء صار في أكلكم. ودّيها لتدوير المعادن.',leaves:15},
  {id:'water',red:a=>pt('water',a)-2,when:a=>a.water==='2'||a.water==='1',from:a=>a.water==='2'?'صنبور بدون فلتر':'قوارير بلاستيك',to:'فلتر كربون منشط أو RO',why:'يقلل PFAS في الماء، ويوفر مئات القوارير البلاستيك بالسنة.',leaves:25},
  {id:'pack',red:a=>pt('pack',a),when:a=>a.pack&&a.pack!=='2',from:'فشار المايكرويف وتغليف الوجبات',to:'فشار القدر وصحن من البيت',why:'الورق المقاوم للدهون أحد أكثر مصادر PFAS في الأكل.',leaves:15},
  {id:'plastic',red:a=>pt('plastic',a),when:a=>['0','1','2','5','6'].includes(a.plastic),from:a=>'علب بلاستيك رقم '+(+a.plastic+1),to:'علب زجاج أو ستانلس',why:'آمنة للتسخين وما تتحلل. وإذا احتجتي بلاستيك، رقم 5 (PP) أفضل خيار للحفظ البارد. تجنبي 3 و6 و7.',leaves:20},
  {id:'cosm',red:a=>pt('cosm',a),when:a=>a.cosm&&a.cosm!=='2',from:'مكياج مقاوم للماء',to:'منتجات بدون PTFE أو perfluoro',why:'افحصي المكونات في التطبيق قبل الشراء.',leaves:15},
  {id:'floss',red:a=>pt('floss',a),when:a=>a.floss==='0',from:'خيط أسنان مطلي',to:'خيط حرير أو نايلون عادي',why:'نفس النتيجة بدون PTFE في فمك يوميًا.',leaves:10},
  {id:'tex',red:a=>pt('tex',a),when:a=>a.tex&&a.tex!=='2',from:'أقمشة مقاومة للبقع',to:'قطن وكتان بدون معالجة',why:'عند الاستبدال القادم اختاري أقمشة طبيعية.',leaves:10},
  {id:'prod',red:()=>prodPts(),when:()=>S.products.some(x=>x.hits.length),from:'منتج فيه PFAS',to:'بديل مكتوب عليه PFAS-free',why:'المنتجات اللي ظهرت فيها مؤشرات في الفحص تقدرين تبدلينها بسهولة.',leaves:20}
];

const FACTS = [
  ['أبدية','لقبها «الكيميائيات الأبدية»','رابطة الكربون والفلور من أقوى الروابط في الكيمياء العضوية، عشان كذا ما تتحلل في الطبيعة تقريبًا.','OECD'],
  ['2 - 4 سنوات','يبقى PFOA في جسمك','يحتاج الجسم من 2 إلى 4 سنوات تقريبًا عشان يتخلص من نص كمية PFOA فيه.','ATSDR'],
  ['المجموعة 1','تصنيف PFOA','صنفت الوكالة الدولية لأبحاث السرطان PFOA مسرطنًا للإنسان عام 2023.','IARC, Vol. 135'],
  ['آلاف','مركب من عائلة PFAS','PFAS مو مادة وحدة، هي عائلة فيها آلاف المركبات المصنّعة.','OECD 2021'],
  ['2019','حظر عالمي','أُدرج PFOA في اتفاقية ستوكهولم للملوثات العضوية الثابتة للتخلص منه عالميًا.','Stockholm Convention'],
  ['فلتر RO','أقوى حماية في البيت','فلاتر التناضح العكسي من أكثر الطرق فعالية لتقليل PFAS في مياه الشرب.','US EPA']
];
const TRIVIA = [
  ['غلي الماء يتخلص من مواد PFAS.',false,'خطأ. الغلي ما يكسرها، وبالعكس ممكن يزيد تركيزها لما يتبخر جزء من الماء. الفلتر هو الحل.'],
  ['مكتوب على المقلاة PFOA-free، يعني ما فيها أي PFAS.',false,'خطأ. كثير منها خالي من PFOA بس مطلي بـ PTFE، وهو نفسه من عائلة PFAS.'],
  ['العلب الزجاجية من أأمن الخيارات لحفظ وتسخين الأكل.',true,'صح. الزجاج ما يتفاعل مع الأكل ولا يطلق مواد مع الحرارة.'],
  ['مواد PFAS ممكن توصل لمياه الشرب من المصانع والنفايات.',true,'صح. لأنها ما تتحلل، تنتقل من التربة للمياه الجوفية والسطحية.'],
  ['البلاستيك رقم 3 (PVC) آمن لتسخين الأكل.',false,'خطأ. رقم 3 من الأنواع اللي ننصح بتجنبها مع الأكل، خصوصًا مع الحرارة.'],
  ['المقلاة غير اللاصقة المخدوشة لازم تنرمي في النفايات العادية.',false,'خطأ. جسمها معدن، فالأفضل تروح لتدوير المعادن.']
];
const PLASTIC = [
  ['1','PET','قوارير الماء والعصير','g','آمن لاستخدام مرة وحدة','y','لا تعيدين تعبئته ولا تتركينه في الشمس أو السيارة','g','يُدوَّر بكثرة'],
  ['2','HDPE','علب الحليب والمنظفات','g','آمن نسبيًا','y','بعض العلب المعالجة بالفلور ممكن تطلق PFAS','g','يُدوَّر بكثرة'],
  ['3','PVC','أغلفة التغليف وبعض الأنابيب','r','تجنبيه مع الأكل','r','فيه مواد مضافة تتسرب مع الحرارة','r','صعب تدويره'],
  ['4','LDPE','الأكياس وأغلفة النايلون','g','آمن نسبيًا','y','لا تسخنين فيه','y','تدويره محدود'],
  ['5','PP','علب الحفظ وأغطية القوارير','g','أفضل بلاستيك للأكل','y','حتى لو مكتوب «للمايكرويف» الأفضل تسخنين في زجاج','y','ينعاد تدويره في أماكن كثيرة'],
  ['6','PS','أكواب وصحون الفلين','r','تجنبيه مع الأكل الحار','r','يطلق الستايرين مع الحرارة','r','صعب تدويره'],
  ['7','أخرى','بعض القوارير والأدوات','r','تجنبيه مع الحرارة','r','ممكن يحتوي BPA','r','صعب تدويره']
];
const CHALLENGES = [
  ['أسبوع بدون تغليف وجبات سريعة','كل يوم ما أكلتي من تغليف ورقي أو فشار مايكرويف، علّمي عليه.'],
  ['أسبوع على مقلاة بدون طلاء','اطبخي على حديد زهر أو ستانلس طول الأسبوع.'],
  ['قارورتك معك','اطلعي كل يوم بقارورة ستانلس بدل الماء المعبأ.']
];
const BANNED=/(كلب|حمار|غبي|تافه|زفت|لعن)/;
const TEAM_COLORS=['#1B6B78','#2E8B6E','#E5705A','#D99A2B','#7A5BA6'];

