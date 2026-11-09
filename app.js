
/* =================== helpers =================== */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LS = {
  get(k, d){ try{ const v = localStorage.getItem('tunemate_'+k); return v ? JSON.parse(v) : d; }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem('tunemate_'+k, JSON.stringify(v)); }catch(e){} },
  del(k){ try{ localStorage.removeItem('tunemate_'+k); }catch(e){} }
};
function rng(seed){ let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const shuffle = (a, r=Math.random) => { a=[...a]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const fmtT = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); };
const ago = ts => { const d = (Date.now()-ts)/1000; if(d<60) return 'now'; if(d<3600) return Math.floor(d/60)+'m'; if(d<86400) return Math.floor(d/3600)+'h'; return Math.floor(d/86400)+'d'; };
const pairKey = (a,b) => [a,b].sort().join('~').replace(/[^A-Za-z0-9_\-.~:@+]/g,'');
const sleep = ms => new Promise(r=>setTimeout(r,ms));

const IC = {
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
  discover:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  library:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4v16M9 4v16M14 4l5 16"/></svg>',
  friends:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  games:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="6"/><path d="M6 12h4M8 10v4"/><circle cx="15.5" cy="11" r=".6" fill="currentColor"/><circle cx="17.5" cy="13" r=".6" fill="currentColor"/></svg>',
  profile:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"/></svg>',
  pause:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',
  next:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 5.5v13a1 1 0 0 0 1.5.86L16 13.7V18a1 1 0 0 0 2 0V6a1 1 0 0 0-2 0v4.3L6.5 4.64A1 1 0 0 0 5 5.5z"/></svg>',
  prev:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 5.5v13a1 1 0 0 1-1.5.86L8 13.7V18a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v4.3l9.5-5.66A1 1 0 0 1 19 5.5z"/></svg>',
  vol:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="19" height="19"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>',
  ig:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  sp:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M7 9.5c3.5-1 7.5-.6 10 1M7.5 12.8c3-.8 6-.4 8.3.9M8 15.8c2.4-.6 4.6-.3 6.5.7"/></svg>',
  yt:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z"/></svg>',
  send:'<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" width="18" height="18"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
};

/* =================== static data =================== */
const GENRES = ['Pop','Hip-Hop','Rap','R&B','Bollywood','Punjabi','Indie','Rock','Metal','EDM','Techno','House','Lo-fi','Jazz','Classical','K-Pop','Sufi','Acoustic','Afrobeats','Latin','Country','Ambient'];
const GENRE_EMO = {'Pop':'🎀','Hip-Hop':'🧢','Rap':'🎤','R&B':'💜','Bollywood':'🎬','Punjabi':'🥁','Indie':'🌿','Rock':'🎸','Metal':'🤘','EDM':'🪩','Techno':'🔊','House':'🏠','Lo-fi':'☕','Jazz':'🎷','Classical':'🎻','K-Pop':'💫','Sufi':'🕊️','Acoustic':'🪕','Afrobeats':'🌍','Latin':'💃','Country':'🤠','Ambient':'🌌'};
const MOODS = ['Chill','Hype','Romantic','Sad hours','Focus','Party','Gym','Late night','Road trip','Feel-good'];
const EMOJIS = ['🎧','🎸','🎹','🥁','🎤','🎷','🎻','🪩','🌙','🔥','🌊','👾','🦋','🐼','⚡','🌸'];
const COLORS = [['#1ed78a','#0b5a4a'],['#7b5cff','#2a176a'],['#ff5c8a','#6b1b3a'],['#ffb547','#7a3d0c'],['#3fb5ff','#11396b'],['#e84cff','#4a1260']];
const grad = c => { const p = COLORS[c] || COLORS[0]; return `linear-gradient(135deg,${p[0]},${p[1]})`; };

/* ---- song library (real songs; open on Spotify / YouTube) ---- */
const LIB = [
  {k:'drake',name:'Drake',emoji:'🦉',c:['#d4a94a','#3a2608'],tags:['Hip-Hop','Rap','R&B'],songs:"God's Plan|Hotline Bling|One Dance|In My Feelings|Passionfruit|Nice For What|Started From the Bottom|Hold On, We're Going Home|Laugh Now Cry Later|Rich Flex|Jimmy Cooks|Headlines|Marvins Room|Toosie Slide"},
  {k:'arijit',name:'Arijit Singh',emoji:'🎙️',c:['#ff7a59','#5a1a10'],tags:['Bollywood','Sufi'],songs:"Tum Hi Ho|Channa Mereya|Kesariya|Agar Tum Saath Ho|Ae Dil Hai Mushkil|Raabta|Phir Bhi Tumko Chaahunga|Tujhe Kitne Chahne Lage|Apna Bana Le|Hawayein|Shayad|Satranga|Gerua|Pal"},
  {k:'anuv',name:'Anuv Jain',emoji:'🌧️',c:['#7fb7d9','#14304a'],tags:['Indie','Acoustic'],songs:"Baarishein|Gul|Riha|Alag Aasmaan|Mishri|Antariksh|Jo Tum Mere Ho|Husn|Meri Baaton Mein Tu|Arz Kiya Hai"},
  {k:'seedhe',name:'Seedhe Maut',emoji:'⚡',c:['#e8e8e8','#2a2a2a'],tags:['Hip-Hop','Rap'],songs:"Nanchaku (feat. MC Stan)|Namastute|11K|Khatta Flow|Luka Chuppi|Shaktimaan|101|Kodak|Nalla Freestyle|Natkhat|Kshama|TT|Maina|Chalo Chalein"},
  {k:'honey',name:'Yo Yo Honey Singh',emoji:'👑',c:['#ffcf3f','#6b3a00'],tags:['Punjabi','Bollywood','Hip-Hop'],songs:"Brown Rang|Blue Eyes|Desi Kalakaar|Love Dose|Dope Shope|Angreji Beat|Lungi Dance|Chaar Bottle Vodka|Party All Night|Sunny Sunny|Millionaire|Maniac|Payal"},
  {k:'bieber',name:'Justin Bieber',emoji:'💜',c:['#b38cff','#2e1a5c'],tags:['Pop','R&B'],songs:"Baby|Sorry|Love Yourself|What Do You Mean?|Peaches|Stay|Ghost|Intentions|Yummy|Boyfriend|Never Say Never|Holy|Anyone|Daisies"},
  {k:'diljit',name:'Diljit Dosanjh',emoji:'🌟',c:['#ff9f43','#5a2a00'],tags:['Punjabi','Pop'],songs:"Lover|Born to Shine|G.O.A.T.|Proper Patola|Do You Know|Case|Naina|Ikk Kudi"},
  {k:'aujla',name:'Karan Aujla',emoji:'🔥',c:['#ff5c5c','#4a0a0a'],tags:['Punjabi','Hip-Hop'],songs:"Softly|Tauba Tauba|Admirin' You|Winning Speech|52 Bars|Wavy|Players|Chitta Kurta"},
  {k:'weeknd',name:'The Weeknd',emoji:'🌃',c:['#ff3b5c','#2a0610'],tags:['R&B','Pop'],songs:"Blinding Lights|Starboy|Save Your Tears|The Hills|Die For You|Can't Feel My Face|Call Out My Name|Out of Time"},
  {k:'apdhillon',name:'AP Dhillon',emoji:'🌅',c:['#ffa36c','#3f1d4a'],tags:['Punjabi','R&B'],songs:"Brown Munde|Excuses|With You|Summer High|Insane|Dil Nu|Majhail"},
  {k:'prateek',name:'Prateek Kuhad',emoji:'🎸',c:['#9fd99a','#1e3d1c'],tags:['Indie','Acoustic'],songs:"cold/mess|Kasoor|Tum Jab Paas|Co2|Raat Raazi|Shehron Ke Raaz"},
  {k:'taylor',name:'Taylor Swift',emoji:'✨',c:['#ff8fc7','#4a1236'],tags:['Pop','Country'],songs:"Anti-Hero|Shake It Off|Blank Space|Love Story|Cruel Summer|Cardigan|Style|Fortnight"},
];
LIB.forEach(a=>{ a.list=a.songs.split('|').map((t,i)=>({id:a.k+'-'+i,t,a:a.name,k:a.k})); });
const SONGS = LIB.flatMap(a=>a.list);
const songById = id => SONGS.find(s=>s.id===id);
const libByK = k => LIB.find(a=>a.k===k);
const MIXES = [
  {k:'mix-desi',name:'Desi Hip-Hop Heat',emoji:'🔥',c:['#ff7043','#2a0d05'],from:['seedhe','aujla','honey'],desc:'Seedhe Maut, Karan Aujla, Honey Singh'},
  {k:'mix-heart',name:'Heartbreak Hours',emoji:'💔',c:['#7b8cff','#141a4a'],from:['arijit','anuv','prateek'],desc:'Arijit, Anuv Jain, Prateek Kuhad'},
  {k:'mix-global',name:'Global Pop Hits',emoji:'🌍',c:['#e84cff','#2a0d4f'],from:['bieber','weeknd','taylor','drake'],desc:'Bieber, The Weeknd, Taylor, Drake'},
  {k:'mix-punjabi',name:'Punjabi Party',emoji:'🥁',c:['#ffcf3f','#5a2a00'],from:['diljit','apdhillon','honey','aujla'],desc:'Diljit, AP Dhillon, Honey Singh, Aujla'},
];
MIXES.forEach(m=>{ const lists=m.from.map(k=>libByK(k).list); const out=[]; for(let i=0;i<14;i++) lists.forEach(l=>{ if(l[i]) out.push(l[i]); }); m.list=out.slice(0,20); });
const plainTitle = t => t.replace(/\s*\(.*?\)\s*/g,' ').trim();
const spUrl = s => 'https://open.spotify.com/search/'+encodeURIComponent(plainTitle(s.t)+' '+s.a);
const ytUrl = s => 'https://www.youtube.com/results?search_query='+encodeURIComponent(plainTitle(s.t)+' '+s.a);
const spArtist = name => 'https://open.spotify.com/search/'+encodeURIComponent(name);
const ARTIST_CHIPS = [...LIB.map(a=>a.name),'Badshah','Divine','KR$NA','MC Stan','King','Talwiinder','Sidhu Moose Wala','Shreya Ghoshal','Atif Aslam','Pritam','A. R. Rahman','Travis Scott','Kendrick Lamar','Ed Sheeran','Billie Eilish','BTS','Dua Lipa','Bad Bunny'];

/* ---- radio stations (procedurally generated music) ---- */
const MINP=[0,3,5,7,10], MAJP=[0,2,4,7,9], NMIN=[0,2,3,5,7,8,10], DOR=[0,2,3,5,7,9,10], MAJ=[0,2,4,5,7,9,11], BHAIRAV=[0,1,4,5,7,8,11];
const STATIONS = [
  {id:'lofi',name:'Lo-fi Study Café',emoji:'☕',c:['#8b6cff','#2a1d5c'],desc:'Dusty beats, warm chords, rain on the window.',tags:['Lo-fi','Hip-Hop','Jazz','Ambient','Acoustic','Indie'],
    bpm:78,swing:.16,scale:MINP,root:57,progs:[[[0,3,7,10],[5,8,12,15],[-2,2,5,9],[3,7,10,14]],[[0,3,7,10],[-4,0,3,7],[-7,-3,0,3],[-2,2,5,9]]],
    kick:'x.....x...x.....',snare:'....x.......x...',sl:.3,hat:'x.x.x.x.x.x.x.x.',hl:.06,bass:'x.......x.......',bassLen:6,bassWave:'sine',bassLvl:.4,lead:'triangle',leadLvl:.1,dens:.35,padWave:'triangle',padLvl:.07,lp:1800},
  {id:'desi',name:'Desi Monsoon',emoji:'🪔',c:['#ffb547','#7a2d0c'],desc:'Tabla grooves, drone and raga-flavoured melodies.',tags:['Bollywood','Sufi','Punjabi','Classical'],
    bpm:96,swing:.05,scale:BHAIRAV,root:62,progs:[[[0,7,12],[0,7,12],[-4,0,7],[0,7,12]],[[0,7,12],[5,8,12],[0,7,12],[-1,4,7]]],
    tabla:'x..o..x.o.x.o..o',lead:'sawtooth',leadLvl:.07,leadCut:1700,leadLen:2.5,dens:.45,padWave:'sawtooth',padLvl:.03,bass:'x.......x.......',bassLen:7,bassWave:'sine',bassLvl:.35},
  {id:'edm',name:'Festival Pulse',emoji:'🪩',c:['#e84cff','#2a0d4f'],desc:'Four-on-the-floor energy and soaring arps.',tags:['EDM','House','Techno','Pop'],
    bpm:126,swing:0,scale:NMIN,root:57,progs:[[[0,3,7],[-4,0,3],[3,7,10],[-2,2,5]],[[0,3,7],[-2,2,5],[-4,0,3],[-5,-1,2]]],
    kick:'x...x...x...x...',kl:1.1,snare:'....x.......x...',sl:.4,hat:'..x...x...x...x.',hl:.12,arp:'sawtooth',arpLvl:.045,lead:'square',leadLvl:.05,dens:.25,bass:'..x...x...x...x.',bassWave:'sawtooth',bassLen:1.5,bassCut:900,bassLvl:.25,padWave:'sawtooth',padLvl:.03},
  {id:'hiphop',name:'Midnight Cypher',emoji:'🎤',c:['#3fb5ff','#0d2347'],desc:'Boom-bap drums and deep 808 for your bars.',tags:['Hip-Hop','Rap','R&B','Punjabi'],
    bpm:90,swing:.08,scale:MINP,root:55,progs:[[[0,3,7],[0,3,7],[-4,0,3],[-2,2,5]]],
    kick:'x......xx.x.....',kl:1.15,snare:'....x.......x...',sl:.5,hat:'x.x.x.x.x.xxx.x.',hl:.09,bass:'x......x..x.....',bassWave:'sine',bassLen:4,bassLvl:.55,lead:'triangle',leadLvl:.1,dens:.2,padWave:'triangle',padLvl:.04},
  {id:'synth',name:'Neon Drive',emoji:'🌆',c:['#ff5c8a','#3a0f40'],desc:'Retro synthwave for night roads.',tags:['Pop','EDM','Indie','K-Pop','R&B'],
    bpm:104,swing:0,scale:NMIN,root:57,progs:[[[0,3,7],[-4,0,3],[-7,-3,0],[-2,2,5]]],
    kick:'x...x...x...x...',snare:'....x.......x...',sl:.45,hat:'.x.x.x.x.x.x.x.x',hl:.07,arp:'sawtooth',arpLvl:.04,bass:'x.x.x.x.x.x.x.x.',bassLen:1,bassWave:'sawtooth',bassCut:700,bassLvl:.22,lead:'sawtooth',leadLvl:.06,leadCut:2400,dens:.3,padWave:'sawtooth',padLvl:.03},
  {id:'pop',name:'Sunshine Pop',emoji:'☀️',c:['#ffd84a','#c44b16'],desc:'Bright, bouncy, made for singing along.',tags:['Pop','K-Pop','Bollywood','Latin','Afrobeats','Country'],
    bpm:116,swing:0,scale:MAJP,root:60,progs:[[[0,4,7],[7,11,14],[9,12,16],[5,9,12]],[[9,12,16],[5,9,12],[0,4,7],[7,11,14]]],
    kick:'x.......x.x.....',snare:'....x.......x...',sl:.45,hat:'x.x.x.x.x.x.x.x.',hl:.08,bass:'x..x..x.x..x..x.',bassLen:1.5,bassWave:'triangle',bassLvl:.35,lead:'square',leadLvl:.06,leadCut:2600,dens:.45,padWave:'triangle',padLvl:.05},
  {id:'jazz',name:'Blue Note Lounge',emoji:'🎷',c:['#3f7bff','#0a1a3d'],desc:'Walking bass, brushed ride, smoky sevenths.',tags:['Jazz','R&B','Classical','Acoustic'],
    bpm:116,swing:.3,scale:DOR,root:60,progs:[[[2,5,9,12],[7,11,14,17],[0,4,7,11],[0,4,7,11]],[[9,12,16,19],[2,5,9,12],[7,11,14,17],[0,4,7,11]]],
    hat:'x..x.x.xx..x.x.x',hl:.05,snare:'..........x.....',sl:.12,walk:true,lead:'sine',leadLvl:.14,dens:.4,padWave:'sine',padLvl:.06},
  {id:'rock',name:'Garage Riffs',emoji:'🎸',c:['#ff4a4a','#3a0a0a'],desc:'Driving drums and gritty power chords.',tags:['Rock','Metal','Indie'],
    bpm:132,swing:0,scale:MINP,root:52,progs:[[[0,7,12],[3,10,15],[5,12,17],[-2,5,10]],[[0,7,12],[0,7,12],[8,15,20],[10,17,22]]],
    kick:'x.....x.x.......',kl:1.1,snare:'....x.......x...',sl:.6,hat:'x.x.x.x.x.x.x.x.',hl:.1,bass:'x.x.x.x.x.x.x.x.',bassWave:'square',bassLen:1,bassCut:600,bassLvl:.2,lead:'square',leadLvl:.06,leadCut:1600,dens:.4,padWave:'square',padLvl:.035,lp:1400},
  {id:'ambient',name:'Deep Focus',emoji:'🌌',c:['#1ed78a','#06302a'],desc:'Slow-drifting pads for deep work.',tags:['Ambient','Classical','Acoustic','Lo-fi'],
    bpm:64,swing:0,scale:MAJ,root:60,progs:[[[0,4,7,11,14],[5,9,12,16],[-3,0,4,7,11],[2,5,9,12]]],
    lead:'sine',leadLvl:.1,leadLen:6,dens:.12,padWave:'sine',padLvl:.09},
];
const stById = id => STATIONS.find(s=>s.id===id);

/* ---- demo listeners (shown until real people join) ---- */
const DEMO = [
  {id:'demo_aanya',name:'Aanya',emoji:'🌙',color:1,bio:'Arijit on repeat at 2am. Will fight you over the best Pritam album.',genres:['Bollywood','Pop','Lo-fi','Acoustic'],artists:['Arijit Singh','Taylor Swift','Pritam','Anuv Jain'],moods:['Romantic','Late night','Chill'],energy:35,under:30,anthem:'Kesariya',liked:['arijit-0','arijit-1','arijit-2','anuv-0','taylor-0'],scores:{rhythm:4200,quiz:6100,memory:7,bpm:3200,ear:900}},
  {id:'demo_kabir',name:'Kabir',emoji:'🔥',color:3,bio:'Gym playlist curator. Punjabi + hip-hop only, no skips.',genres:['Punjabi','Hip-Hop','Rap'],artists:['Karan Aujla','Drake','Yo Yo Honey Singh','Seedhe Maut'],moods:['Gym','Hype','Party'],energy:90,under:35,anthem:'Softly',liked:['aujla-0','drake-0','honey-0','seedhe-0','diljit-1'],scores:{rhythm:7600,quiz:5200,memory:5,bpm:4100,ear:600},
    beat:{bpm:92,rows:['x......xx.x.....','....x.......x...','............x...','x.x.x.x.x.xxx.x.','x......x..x.....','................']}},
  {id:'demo_meera',name:'Meera',emoji:'🎸',color:0,bio:'Indie gigs every weekend. Send me your most underrated song.',genres:['Indie','Acoustic','Lo-fi','Rock'],artists:['Anuv Jain','Prateek Kuhad','The Local Train','Arctic Monkeys'],moods:['Chill','Sad hours','Road trip'],energy:45,under:80,anthem:'Baarishein',liked:['anuv-0','anuv-1','anuv-2','prateek-0','prateek-1'],scores:{rhythm:5100,quiz:7400,memory:9,bpm:4400,ear:1300}},
  {id:'demo_rohan',name:'Rohan',emoji:'🪩',color:5,bio:'Festival chaser. If the drop is not loud I am not interested.',genres:['EDM','Techno','House','Pop'],artists:['The Weeknd','Justin Bieber','Martin Garrix','Fred again..'],moods:['Party','Hype','Late night'],energy:95,under:55,anthem:'Blinding Lights',liked:['weeknd-0','bieber-4','bieber-5','drake-2'],scores:{rhythm:9300,quiz:4300,memory:6,bpm:4700,ear:700},
    beat:{bpm:126,rows:['x...x...x...x...','................','....x.......x...','..x...x...x...x.','x.x.x.x.x.x.x.x.','x.....x.....x...']}},
  {id:'demo_zoya',name:'Zoya',emoji:'🎷',color:4,bio:'Jazz cafés, qawwali nights and old vinyl.',genres:['Jazz','Sufi','Classical','R&B'],artists:['Arijit Singh','Norah Jones','Nusrat Fateh Ali Khan','The Weeknd'],moods:['Focus','Chill','Romantic'],energy:25,under:75,anthem:'Channa Mereya',liked:['arijit-1','arijit-12','weeknd-4'],scores:{rhythm:3800,quiz:5600,memory:11,bpm:3900,ear:1500}},
  {id:'demo_ishaan',name:'Ishaan',emoji:'🥁',color:2,bio:'Drummer. Rock, rap and the occasional Bieber guilty pleasure.',genres:['Rock','Hip-Hop','Indie','Pop'],artists:['Seedhe Maut','Justin Bieber','Linkin Park','Drake'],moods:['Hype','Gym','Road trip'],energy:85,under:50,anthem:'Namastute',liked:['seedhe-1','seedhe-2','bieber-0','drake-1'],scores:{rhythm:8800,quiz:4900,memory:8,bpm:4800,ear:1000},
    beat:{bpm:100,rows:['x.....x.x.......','....x.......x...','................','x.x.x.x.x.x.x.x.','x.....x.x.......','................']}},
].map(p=>({...p,demo:true,likes:['*']}));
const DEMO_REPLIES = [
  g=>`Okay you have taste 👀 ${g?`a fellow ${g} person!`:''}`,
  ()=>'What are you listening to right now?',
  ()=>'Send me your top 3 songs this week 🎶',
  ()=>'Have you tried the Beat Maker? Made something fire yesterday',
  ()=>'Rematch in Guess the Artist? I bet I beat your score 😄',
  ()=>'That song is a whole mood honestly',
  ()=>"Adding that to my playlist rn",
  ()=>'Seedhe Maut or Honey Singh, pick one 👀',
];

/* =================== music engine =================== */
const Music = (() => {
  let ctx=null, master, comp, an, lp, timer=null, playing=false, st=null, track=null, step=0, nextT=0, startT=0, pausedAt=0, vol=LS.get('vol',.7);
  const hist=[]; let onChange=()=>{};
  const ADJ=['Neon','Midnight','Velvet','Golden','Paper','Electric','Silent','Monsoon','Saffron','Lunar','Faded','Crystal','Cosmic','Rooftop','Slow','Wild','Hazy','Ocean'];
  const NOUN=['Dreams','Skyline','Letters','Rain','Signals','Hearts','Streets','Echoes','Bloom','Waves','Static','Lanterns','Memories','Orbit','Chai','Polaroids','Fireflies','Highways'];
  function ac(){
    if(!ctx){
      ctx = new (window.AudioContext||window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = vol;
      lp = ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=20000;
      comp = ctx.createDynamicsCompressor(); comp.threshold.value=-16; comp.ratio.value=4;
      an = ctx.createAnalyser(); an.fftSize=64;
      master.connect(lp); lp.connect(comp); comp.connect(an); an.connect(ctx.destination);
    }
    if(ctx.state==='suspended') ctx.resume();
    return ctx;
  }
  let nb; const noise=()=>{ if(!nb){ nb=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate); const d=nb.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; } return nb; };
  const mtof = m => 440*Math.pow(2,(m-69)/12);
  function kick(t,l=1){ const o=ctx.createOscillator(),g=ctx.createGain(); o.frequency.setValueAtTime(150,t); o.frequency.exponentialRampToValueAtTime(42,t+.13); g.gain.setValueAtTime(.9*l,t); g.gain.exponentialRampToValueAtTime(.001,t+.35); o.connect(g); g.connect(master); o.start(t); o.stop(t+.4); }
  function nz(t,l,dur,type,f){ const n=ctx.createBufferSource(); n.buffer=noise(); const fl=ctx.createBiquadFilter(); fl.type=type; fl.frequency.value=f; const g=ctx.createGain(); g.gain.setValueAtTime(l,t); g.gain.exponentialRampToValueAtTime(.001,t+dur); n.connect(fl); fl.connect(g); g.connect(master); n.start(t,Math.random()*.5); n.stop(t+dur+.02); }
  function snare(t,l=.45){ nz(t,l,.18,'highpass',1200); tone(62,t,.08,'triangle',l*.4,3000); }
  function clap(t,l=.5){ [0,.012,.024].forEach(d=>nz(t+d,l*.7,.03,'bandpass',1500)); nz(t+.036,l,.15,'bandpass',1400); }
  function hat(t,l=.1,len=.05){ nz(t,l,len,'highpass',7000); }
  function tabla(t,hi){ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(hi?340:120,t); o.frequency.exponentialRampToValueAtTime(hi?300:70,t+(hi?.12:.25)); g.gain.setValueAtTime(hi?.35:.6,t); g.gain.exponentialRampToValueAtTime(.001,t+(hi?.18:.35)); o.connect(g); g.connect(master); o.start(t); o.stop(t+.4); nz(t,hi?.12:.05,.04,'bandpass',hi?3000:800); }
  function tone(m,t,dur,wave,l,cut=3000){ const o=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain(); o.type=wave; o.frequency.value=mtof(m); f.type='lowpass'; f.frequency.value=cut; g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(l,t+.012); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t+dur+.05); }
  function pad(notes,t,dur,wave,l){ notes.forEach(m=>{ [-6,6].forEach(dt=>{ const o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter(); o.type=wave; o.frequency.value=mtof(m); o.detune.value=dt; f.type='lowpass'; f.frequency.value=1600; const a=Math.min(.5,dur*.25); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(l,t+a); g.gain.setValueAtTime(l,t+dur-.15); g.gain.linearRampToValueAtTime(0,t+dur); o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t+dur+.05); }); }); }
  function makeTrack(s,seed){
    const r=rng(seed), prog=s.progs[Math.floor(r()*s.progs.length)], mel=[], n=s.scale.length;
    let deg=Math.floor(r()*n);
    for(let i=0;i<64;i++){
      if(r()<s.dens && (i%2===0 || r()<.25)){ deg=Math.max(0,Math.min(n*2-1,deg+Math.floor(r()*5)-2)); mel.push(s.root+12+s.scale[deg%n]+12*Math.floor(deg/n)); }
      else mel.push(null);
    }
    return {seed,prog,mel,name:ADJ[Math.floor(r()*ADJ.length)]+' '+NOUN[Math.floor(r()*NOUN.length)],len:70+Math.floor(r()*30)};
  }
  function sched(s,t,sd){
    const i=s%16, bar=Math.floor(s/16), ch=track.prog[bar%track.prog.length], R=st.root;
    if(st.kick && st.kick[i]==='x') kick(t,st.kl||1);
    if(st.snare && st.snare[i]==='x') snare(t,st.sl||.45);
    if(st.hat && st.hat[i]==='x') hat(t,st.hl||.1);
    if(st.tabla){ const c=st.tabla[i]; if(c==='x') tabla(t,false); else if(c==='o') tabla(t,true); }
    if(i===0) pad(ch.map(n=>R+n),t,sd*16,st.padWave||'triangle',st.padLvl||.05);
    if(st.bass && st.bass[i]==='x') tone(R-12+ch[0],t,sd*(st.bassLen||3),st.bassWave||'triangle',st.bassLvl||.35,st.bassCut||600);
    if(st.walk && i%4===0) tone(R-12+ch[(i/4)%ch.length],t,sd*3.6,'triangle',.34,700);
    if(st.arp) tone(ch[i%ch.length]+R+12,t,sd*.9,st.arp,st.arpLvl||.05,2200);
    const m=track.mel[s%64]; if(m!=null && st.lead) tone(m,t,sd*(st.leadLen||2),st.lead,st.leadLvl||.1,st.leadCut||3000);
  }
  function tick(){
    if(!playing) return;
    const sd=60/st.bpm/4;
    while(nextT < ctx.currentTime+.15){ let t=nextT; if(step%2===1) t+=st.swing*sd; sched(step,t,sd); nextT+=sd; step++; }
    if(ctx.currentTime-startT >= track.len) next();
  }
  function begin(s,seed,fromHist){
    ac(); if(!fromHist && track && st) hist.push({st:st.id,seed:track.seed}); st=s;
    track=makeTrack(s,seed); step=0; nextT=ctx.currentTime+.08; startT=nextT; playing=true;
    master.gain.setTargetAtTime(vol,ctx.currentTime,.03);
    lp.frequency.setTargetAtTime(s.lp||20000,ctx.currentTime,.1);
    clearInterval(timer); timer=setInterval(tick,25); onChange();
  }
  function play(id,seed){ const s=stById(id)||STATIONS[0]; begin(s, seed ?? Math.floor(Math.random()*1e9)); }
  function toggle(){
    if(!st){ play(STATIONS[0].id); return; }
    ac();
    if(playing){ playing=false; pausedAt=ctx.currentTime-startT; clearInterval(timer); master.gain.setTargetAtTime(0,ctx.currentTime,.03); }
    else { master.gain.setTargetAtTime(vol,ctx.currentTime,.03); playing=true; nextT=ctx.currentTime+.05; startT=nextT-pausedAt; timer=setInterval(tick,25); }
    onChange();
  }
  function next(){ if(!st) return play(STATIONS[0].id); begin(st,Math.floor(Math.random()*1e9)); }
  function prev(){ if(!st) return; if(ctx.currentTime-startT>4 || !hist.length) begin(st,track.seed,true); else { const h=hist.pop(); begin(stById(h.st),h.seed,true); } }
  function pause(){ if(playing) toggle(); }
  /* game sounds bypass the radio's pause-mute */
  function sfx(){ ac(); if(!playing) master.gain.setTargetAtTime(vol,ctx.currentTime,.01); return ctx; }
  function setVol(v){ vol=v; LS.set('vol',v); if(master) master.gain.setTargetAtTime(v,ctx.currentTime,.03); }
  return { ac, sfx, play, toggle, next, prev, pause, setVol,
    kick:(t,l)=>kick(t,l), snare:(t,l)=>snare(t,l), clap:(t,l)=>clap(t,l), hat:(t,l,len)=>hat(t,l,len), tone:(...a)=>tone(...a), pad:(...a)=>pad(...a),
    get now(){ return ctx?ctx.currentTime:0; },
    get vol(){return vol}, get playing(){return playing}, get station(){return st}, get track(){return track},
    get elapsed(){ return !st?0: playing ? ctx.currentTime-startT : pausedAt; }, get analyser(){return an},
    set onChange(f){onChange=f} };
})();

/* =================== state =================== */
const S = {
  mode:'loading', myId:null, me:null, profiles:{}, view:LS.get('view','home'), chatWith:null, online:{},
  readOnly:false, filter:'All', lastRead:LS.get('lastRead',{}), demoChat:LS.get('demoChat',{}), editing:false, cloudNote:null, profilesLoaded:false,
  game:null, lib:{open:null,q:''}, ob:{step:0,d:LS.get('draft',null)}, lbGame:'quiz', confirmDel:false,
  conns:[], msgs:[], blocks:new Set(), session:null, cfg:{}, authMode:'signin', authBusy:false,
};
let sb=null, room=null, gameRoom=null;
const isCloud = () => S.mode==='cloud';

function allProfiles(){
  const real = Object.values(S.profiles).filter(p=>p && p.id && p.id!==S.myId && p.name && !S.blocks.has(p.id));
  return isCloud() ? real : [...real, ...DEMO];
}
function getP(id){ if(id===S.myId) return S.me; return S.profiles[id] || (!isCloud() && DEMO.find(d=>d.id===id)) || null; }
/* does profile a want to connect with bId? */
function likes(a,bId){
  if(!a) return false;
  if(a.demo) return true;
  if(!isCloud()) return (a.likes||[]).includes(bId);
  return S.conns.some(c=>c.from_id===a.id && c.to_id===bId);
}
function isFriend(id){ const p=getP(id); return !!p && likes(S.me,id) && likes(p,S.myId); }
function sc(p,g){ return (p && p.scores && p.scores[g]) || 0; }
const likedIds = p => (p && p.liked || []).map(x=>typeof x==='string'?x:x && x.id).filter(Boolean);

/* =================== matching =================== */
function jacc(a,b){ a=new Set(a||[]); b=new Set(b||[]); if(!a.size||!b.size) return 0; let i=0; a.forEach(x=>b.has(x)&&i++); return i/(a.size+b.size-i); }
const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]/g,'');
function match(a,b){
  if(!a||!b) return {score:0,sharedG:[],sharedA:[],sharedM:[],sharedS:[]};
  const aa=new Set((a.artists||[]).map(norm));
  const sharedA=(b.artists||[]).filter(x=>aa.has(norm(x)));
  const sharedG=(a.genres||[]).filter(x=>(b.genres||[]).includes(x));
  const sharedM=(a.moods||[]).filter(x=>(b.moods||[]).includes(x));
  const bl=new Set(likedIds(b)); const sharedS=likedIds(a).filter(x=>bl.has(x));
  const g=jacc(a.genres,b.genres), m=jacc(a.moods,b.moods);
  const e=1-Math.abs((a.energy??50)-(b.energy??50))/100, u=1-Math.abs((a.under??50)-(b.under??50))/100;
  const raw = Math.min(1,g*1.6)*40 + Math.min(sharedA.length,2)*10 + Math.min(sharedS.length,2)*5 + Math.min(1,m*1.6)*10 + e*10 + u*10;
  return {score:Math.max(1,Math.min(99,Math.round(raw))),sharedG,sharedA,sharedM,sharedS};
}
function songTitle(id,p){ const o=(p&&p.liked||[]).find(x=>x&&x.id===id); if(o) return o.t; const s=songById(id); return s?s.t:''; }
function dna(p){
  return [
    ['Energy', p.energy??50, (p.energy??50)>60?'High-octane':(p.energy??50)<40?'Laid-back':'Balanced'],
    ['Underground', p.under??50, (p.under??50)>60?'Crate digger':(p.under??50)<40?'Chart lover':'Bit of both'],
    ['Range', Math.min(100,(p.genres||[]).length*14), (p.genres||[]).length>5?'Genre-fluid':'Focused'],
    ['Vibes', Math.min(100,(p.moods||[]).length*20), (p.moods||[]).slice(0,2).join(' · ')||'—'],
  ];
}
function recStations(p){ const g=new Set(p?.genres||[]); return [...STATIONS].sort((a,b)=>b.tags.filter(t=>g.has(t)).length - a.tags.filter(t=>g.has(t)).length); }
function recArtists(p){ const g=new Set(p?.genres||[]), mine=new Set((p?.artists||[]).map(norm)); return [...LIB].sort((a,b)=>((mine.has(norm(b.name))?5:0)+b.tags.filter(t=>g.has(t)).length)-((mine.has(norm(a.name))?5:0)+a.tags.filter(t=>g.has(t)).length)); }

/* =================== backend (Supabase) =================== */
const COLS='id,name,emoji,color,bio,anthem,insta,spotify,genres,artists,moods,energy,discovery,liked,scores,beat,updated_at';
function fromRow(r){ return {id:r.id,name:r.name,emoji:r.emoji,color:r.color,bio:r.bio||'',anthem:r.anthem||'',insta:r.insta||'',spotify:r.spotify||'',genres:r.genres||[],artists:r.artists||[],moods:r.moods||[],energy:r.energy??50,under:r.discovery??50,liked:Array.isArray(r.liked)?r.liked:[],scores:r.scores||{},beat:r.beat||null,updatedAt:r.updated_at}; }
function toRow(p){ return {id:S.myId,name:p.name,emoji:p.emoji,color:p.color|0,bio:p.bio||'',anthem:p.anthem||'',insta:p.insta||'',spotify:p.spotify||'',genres:p.genres||[],artists:p.artists||[],moods:p.moods||[],energy:p.energy|0,discovery:p.under|0,liked:(p.liked||[]).slice(-300),scores:p.scores||{},beat:p.beat||null}; }
function dbErr(e,what){ console.error(what,e); toast(`Could not ${what}. ${esc((e&&e.message)||'Check your connection.')}`); }

function saveLocal(){ if(isCloud()) return; LS.set('local',{me:S.me}); }
let saveT=null, saving=Promise.resolve();
function saveMe(now){
  if(!S.me) return Promise.resolve();
  if(!isCloud()){ saveLocal(); return Promise.resolve(); }
  S.profiles[S.myId]=S.me;
  clearTimeout(saveT);
  const doIt=()=>{ const row=toRow(S.me); saving=saving.then(()=>sb.from('profiles').upsert(row)).then(({error}={})=>{ if(error) dbErr(error,'save your profile'); }); return saving; };
  if(now) return doIt(); saveT=setTimeout(doIt,700); return Promise.resolve();
}
async function connectTo(id){
  if(!isCloud()){ S.me.likes=[...new Set([...(S.me.likes||[]),id])]; saveLocal(); return true; }
  const row={from_id:S.myId,to_id:id};
  if(!S.conns.some(c=>c.from_id===S.myId&&c.to_id===id)) S.conns.push(row);
  const {error}=await sb.from('connections').insert(row);
  if(error && !/duplicate/i.test(error.message||'')){ S.conns=S.conns.filter(c=>!(c.from_id===S.myId&&c.to_id===id)); dbErr(error,'send the request'); return false; }
  return true;
}
async function disconnect(id){
  if(!isCloud()){ S.me.likes=(S.me.likes||[]).filter(x=>x!==id); saveLocal(); return; }
  S.conns=S.conns.filter(c=>!(c.from_id===S.myId&&c.to_id===id));
  const {error}=await sb.from('connections').delete().match({from_id:S.myId,to_id:id});
  if(error) dbErr(error,'cancel the request');
}
async function blockUser(id){
  const p=getP(id); S.blocks.add(id);
  if(isCloud()){
    await disconnect(id);
    const {error}=await sb.from('blocks').insert({blocker:S.myId,blocked:id});
    if(error && !/duplicate/i.test(error.message||'')) dbErr(error,'block this person');
  }
  if(S.chatWith===id) S.chatWith=null;
  toast(`🚫 Blocked ${esc(p?p.name:'user')}. They can't message you and won't appear in your matches.`);
  render();
}
async function unblockUser(id){
  S.blocks.delete(id);
  if(isCloud()){ const {error}=await sb.from('blocks').delete().match({blocker:S.myId,blocked:id}); if(error) dbErr(error,'unblock'); }
  render();
}
async function sendMsg(to,text){
  text=text.trim().slice(0,600); if(!text) return;
  if(to.startsWith('demo_')){
    const arr=S.demoChat[to]||(S.demoChat[to]=[]); arr.push({from:S.myId,text,ts:Date.now()}); LS.set('demoChat',S.demoChat);
    const d=getP(to), sg=match(S.me,d).sharedG[0];
    setTimeout(()=>{ arr.push({from:to,text:DEMO_REPLIES[Math.floor(Math.random()*DEMO_REPLIES.length)](sg),ts:Date.now()}); LS.set('demoChat',S.demoChat); if(S.view==='friends') renderChatMsgs(); renderSide(); },900+Math.random()*1200);
    renderChatMsgs(); return;
  }
  if(!isCloud()) return;
  const temp={id:'tmp'+Date.now(),from_id:S.myId,to_id:to,body:text,created_at:new Date().toISOString(),pending:true};
  S.msgs.push(temp); renderChatMsgs();
  const {data,error}=await sb.from('messages').insert({from_id:S.myId,to_id:to,body:text}).select().single();
  S.msgs=S.msgs.filter(m=>m!==temp);
  if(error){ dbErr(error,'send the message'); renderChatMsgs(); return; }
  addMsg(data); renderChatMsgs();
}
function addMsg(m){ if(!m || S.msgs.some(x=>x.id===m.id)) return false; S.msgs.push(m); return true; }
function convo(id){
  if(id.startsWith('demo_')) return (S.demoChat[id]||[]);
  return S.msgs.filter(m=>(m.from_id===S.myId&&m.to_id===id)||(m.from_id===id&&m.to_id===S.myId))
    .map(m=>({from:m.from_id,text:m.body,ts:Date.parse(m.created_at)||Date.now(),pending:m.pending}))
    .sort((a,b)=>a.ts-b.ts);
}
function unread(id){ const lr=S.lastRead[id]||0; return convo(id).filter(m=>m.from===id && m.ts>lr).length; }
function totalUnread(){ return allProfiles().filter(p=>isFriend(p.id)).reduce((n,p)=>n+unread(p.id),0); }
function pendingIn(){ return allProfiles().filter(p=>!p.demo && likes(p,S.myId) && !likes(S.me,p.id)); }
function setScore(g,v){ if(!S.me) return false; S.me.scores=S.me.scores||{}; if(v>(S.me.scores[g]||0)){ S.me.scores[g]=v; saveMe(true); return true; } return false; }

/* =================== boot & auth =================== */
async function loadConfig(){
  if(window.__TM_CONFIG__) return window.__TM_CONFIG__;
  try{ const r=await fetch('/api/config',{cache:'no-store'}); if(r.ok) return await r.json(); }catch(e){}
  return {};
}
async function init(){
  renderPlayer();
  S.cfg = await loadConfig();
  const create = window.__TM_CREATE__ || (window.supabase && window.supabase.createClient);
  if(!S.cfg.supabaseUrl || !S.cfg.supabaseAnonKey || !create){
    return startLocal(location.protocol==='file:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'
      ? 'Demo mode: the backend is not connected, so everything is saved in this browser only.'
      : 'Demo mode: this site has no database connected yet (SUPABASE_URL / SUPABASE_ANON_KEY are missing), so everything is saved in this browser only.');
  }
  sb = create(S.cfg.supabaseUrl, S.cfg.supabaseAnonKey, {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  S.mode='cloud';
  const {data:{session}} = await sb.auth.getSession();
  sb.auth.onAuthStateChange((ev,sess)=>{
    const was=S.session&&S.session.user&&S.session.user.id, now=sess&&sess.user&&sess.user.id;
    S.session=sess;
    if(was!==now){ if(now) afterSignIn(); else { resetUserState(); render(); } }
  });
  S.session=session;
  if(session) await afterSignIn(); else { S.profilesLoaded=true; render(); }
}
function resetUserState(){
  S.myId=null; S.me=null; S.profiles={}; S.conns=[]; S.msgs=[]; S.blocks=new Set(); S.online={}; S.ob={step:0,d:LS.get('draft',null)};
  if(room){ try{room.close()}catch(e){} room=null; }
  if(window.__tmSubs){ window.__tmSubs.forEach(ch=>{ try{sb.removeChannel(ch)}catch(e){} }); } window.__tmSubs=[];
}
let signingIn=false;
async function afterSignIn(){
  if(signingIn) return; signingIn=true;
  try{
    S.myId=S.session.user.id; S.profilesLoaded=false; render();
    const [p,c,m,b]=await Promise.all([
      sb.from('profiles').select(COLS).order('updated_at',{ascending:false}).limit(1000),
      sb.from('connections').select('from_id,to_id'),
      sb.from('messages').select('*').order('created_at',{ascending:false}).limit(500),
      sb.from('blocks').select('blocked'),
    ]);
    if(p.error) throw p.error;
    const map={}; (p.data||[]).forEach(r=>map[r.id]=fromRow(r)); S.profiles=map;
    S.me = map[S.myId] ? JSON.parse(JSON.stringify(map[S.myId])) : null;
    S.conns=c.data||[]; S.msgs=(m.data||[]).reverse(); S.blocks=new Set((b.data||[]).map(x=>x.blocked));
    S.cloudNote=null;
    if(!S.me){ S.ob.step=1; const d=draft(); if(!d.name){ const md=S.session.user.user_metadata||{}; d.name=String(md.full_name||md.name||'').split(' ')[0].slice(0,30); } }
    subscribeLive(); initRoom();
  }catch(e){ console.error(e); S.cloudNote='Could not load data from the database: '+((e&&e.message)||e)+'. Check that supabase/schema.sql was run.'; }
  finally{ signingIn=false; S.profilesLoaded=true; render(); }
}
function subscribeLive(){
  if(window.__tmSubs) window.__tmSubs.forEach(ch=>{ try{sb.removeChannel(ch)}catch(e){} });
  const ch=sb.channel('db-changes')
    .on('postgres_changes',{event:'*',schema:'public',table:'profiles'},pl=>{
      if(pl.eventType==='DELETE'){ const id=pl.old&&pl.old.id; if(id) delete S.profiles[id]; }
      else if(pl.new&&pl.new.id){ S.profiles[pl.new.id]=fromRow(pl.new); if(pl.new.id===S.myId && !S.editing) S.me=JSON.parse(JSON.stringify(S.profiles[S.myId])); }
      softRender();
    })
    .on('postgres_changes',{event:'*',schema:'public',table:'connections'},pl=>{
      if(pl.eventType==='INSERT'&&pl.new){ const r=pl.new; if(!S.conns.some(c=>c.from_id===r.from_id&&c.to_id===r.to_id)){ S.conns.push({from_id:r.from_id,to_id:r.to_id}); if(r.to_id===S.myId){ const p=getP(r.from_id); if(p) toast(isFriend(p.id)?`🎉 <b>${esc(p.name)}</b> connected back. You're friends now!`:`👋 <b>${esc(p.name)}</b> wants to connect with you.`,[{label:isFriend(p.id)?'Say hi':'View',primary:true,fn:()=>{ if(isFriend(p.id)){S.chatWith=p.id;go('friends');} else go('friends'); }}]); } } }
      if(pl.eventType==='DELETE'&&pl.old){ const r=pl.old; S.conns=S.conns.filter(c=>!(c.from_id===r.from_id&&c.to_id===r.to_id)); }
      softRender();
    })
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},pl=>{
      const m=pl.new; if(!m || (m.to_id!==S.myId && m.from_id!==S.myId)) return;
      if(S.blocks.has(m.from_id)) return;
      if(addMsg(m) && m.from_id!==S.myId && !(S.view==='friends'&&S.chatWith===m.from_id)){ const p=getP(m.from_id); if(p) toast(`💬 <b>${esc(p.name)}</b>: ${esc(String(m.body).slice(0,80))}`,[{label:'Reply',primary:true,fn:()=>{S.chatWith=m.from_id;go('friends');}}]); }
      if(S.view==='friends') renderChatMsgs(); renderSide();
    })
    .subscribe();
  window.__tmSubs=[ch];
}
function startLocal(note){
  S.mode='local'; S.myId='me_local'; S.profilesLoaded=true; S.cloudNote=note||null;
  const saved=LS.get('local',null); if(saved && saved.me){ S.me=saved.me; }
  render();
}
async function signOut(){
  Music.pause(); Preview.stop();
  if(isCloud()){ await sb.auth.signOut(); resetUserState(); S.profilesLoaded=true; render(); }
  else { toast('Demo mode has no account to sign out of.'); }
}

/* =================== live room: presence, invites, games (Supabase Realtime) =================== */
const unwrap = raw => raw && (raw.payload!==undefined?raw.payload:raw);
function makeRoom(name, withPresence){
  const handlers={}; let peersFn=null; let pending=null; let ready=false;
  const ch=sb.channel(name,{config:{broadcast:{self:false,ack:false},presence:withPresence?{key:S.myId}:undefined}});
  const api={
    on(topic,fn){ (handlers[topic]=handlers[topic]||[]).push(fn); ch.on('broadcast',{event:topic},msg=>fn(msg.payload)); return api; },
    emit(topic,payload){ try{ ch.send({type:'broadcast',event:topic,payload}); }catch(e){} },
    presence(state){ pending=state; if(ready) ch.track(state).catch(()=>{}); },
    onPeers(fn){ peersFn=fn; },
    join(sub){ return makeRoom(name+':'+sub,false); },
    leave(){ try{ sb.removeChannel(ch); }catch(e){} },
    close(){ api.leave(); },
  };
  if(withPresence) ch.on('presence',{event:'sync'},()=>{ const st=ch.presenceState(); const list=[]; Object.values(st).forEach(arr=>arr.forEach(x=>list.push(x))); peersFn&&peersFn(list); });
  setTimeout(()=>ch.subscribe(status=>{ if(status==='SUBSCRIBED'){ ready=true; if(pending) ch.track(pending).catch(()=>{}); } }),0);
  return api;
}
function initRoom(){
  if(!isCloud() || !S.myId) return;
  if(room) room.close();
  room=makeRoom('tunemate-lobby',true);
  room.onPeers(list=>{
    const m={}; (list||[]).forEach(d=>{ if(d && typeof d.id==='string' && d.id!==S.myId) m[d.id]=d; });
    S.online=m; softRender();
  });
  room.on('invite', raw=>{
    const d=unwrap(raw);
    if(!d || d.to!==S.myId || !S.me) return;
    const p=getP(d.from); if(!p || !isFriend(p.id)) return;
    if(d.kind==='ask'){
      toast(`🎮 <b>${esc(p.name)}</b> challenged you to Tic-Tac-Toe!`,[
        {label:'Play',primary:true,fn:()=>{ room.emit('invite',{kind:'ok',from:S.myId,to:d.from,key:d.key}); go('games'); startOnline(d.key,d.from,false); }},
        {label:'Not now',fn:()=>room.emit('invite',{kind:'no',from:S.myId,to:d.from,key:d.key})}
      ],15000);
    } else if(d.kind==='ok' && S.game && S.game.pending===d.key){ startOnline(d.key,d.from,true); }
    else if(d.kind==='no' && S.game && S.game.pending===d.key){ S.game=null; toast(`${esc(p.name)} can't play right now.`); renderStage(); }
  });
  setPresence();
}
let lastPres='';
function setPresence(){
  if(!room || !S.me || !S.me.name) return;
  const st=Music.station, tr=Music.track;
  const pres={id:S.myId, st:st&&Music.playing?st.id:null, seed:tr?tr.seed:0, tn:tr&&Music.playing?tr.name:(Preview.song&&Preview.playing?Preview.song.t+' · '+Preview.song.a:null)};
  const k=JSON.stringify(pres); if(k===lastPres) return; lastPres=k;
  room.presence(pres);
}

/* =================== real music: song search + 30-sec previews + full songs =================== */
const songCache = LS.get('songCache',{});
async function fetchSongs(params){
  const key=JSON.stringify(params); const hit=songCache[key];
  if(hit && Date.now()-hit.t<6*3600e3) return hit.songs;
  if(S.mode==='local' && location.protocol==='file:') throw new Error('offline');
  const qs=new URLSearchParams(params).toString();
  const r=await fetch('/api/music?'+qs); if(!r.ok) throw new Error((await r.json().catch(()=>({}))).error||'Music search failed');
  const {songs}=await r.json();
  songCache[key]={t:Date.now(),songs}; const keys=Object.keys(songCache); if(keys.length>40) delete songCache[keys[0]]; LS.set('songCache',songCache);
  return songs;
}
const artistSongs = {}; // k -> {state:'loading'|'ok'|'err', songs}
function loadArtist(k){
  const a=libByK(k); if(!a) return Promise.resolve([]);
  if(artistSongs[k] && artistSongs[k].state!=='err') return artistSongs[k].p;
  const p=fetchSongs({artist:a.name,limit:25}).then(s=>{ artistSongs[k]={state:'ok',songs:s.length?s:a.list,p}; return artistSongs[k].songs; })
    .catch(()=>{ artistSongs[k]={state:'err',songs:a.list,p}; return a.list; });
  artistSongs[k]={state:'loading',songs:a.list,p};
  return p;
}
const Preview = (() => {
  const audio=new Audio(); audio.preload='none';
  let queue=[], i=0, song=null, playing=false, onChange=()=>{};
  audio.addEventListener('ended',()=>next());
  audio.addEventListener('pause',()=>{ playing=false; onChange(); });
  audio.addEventListener('playing',()=>{ playing=true; onChange(); });
  audio.addEventListener('error',()=>{ if(song){ toast('That preview could not play. Skipping…',null,2000); setTimeout(next,600); } });
  function start(){ song=queue[i]; if(!song) return; Music.pause(); audio.src=song.p; audio.volume=Music.vol; audio.play().catch(()=>{}); onChange(); }
  function play(list,idx){ const l=list.filter(s=>s&&s.p); if(!l.length){ toast('No preview available for this song. Try Spotify or YouTube.'); return; } const target=list[idx]; queue=l; i=Math.max(0,l.indexOf(target)); start(); }
  function toggle(){ if(!song) return; if(playing) audio.pause(); else { Music.pause(); audio.play().catch(()=>{}); } }
  function next(){ if(!queue.length) return; i=(i+1)%queue.length; start(); }
  function prev(){ if(!queue.length) return; if(audio.currentTime>3){ audio.currentTime=0; return; } i=(i-1+queue.length)%queue.length; start(); }
  function stop(){ audio.pause(); }
  return { play, toggle, next, prev, stop, setVol(v){ audio.volume=v; },
    get song(){return song}, get playing(){return playing}, get elapsed(){return audio.currentTime||0}, get duration(){return audio.duration||30},
    set onChange(f){onChange=f} };
})();
let activeSrc='radio';
async function playFull(s){
  Preview.stop(); Music.pause();
  if(!S.cfg.youtube){ window.open(ytUrl(s),'_blank','noopener'); return; }
  showModal(`<div class="spin" style="margin:30px auto"></div>`);
  try{
    const r=await fetch('/api/youtube?q='+encodeURIComponent(plainTitle(s.t)+' '+s.a)); const d=await r.json();
    if(!r.ok||!d.id) throw new Error(d.error||'not found');
    showModal(`<div style="font-weight:700;margin-bottom:10px">${esc(s.t)} <span class="muted">· ${esc(s.a)}</span></div>
      <div class="yt"><iframe src="https://www.youtube-nocookie.com/embed/${d.id}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="YouTube player"></iframe></div>
      <div class="row" style="margin-top:12px;flex-wrap:wrap;gap:8px"><a class="lnk sp" href="${spUrl(s)}" target="_blank" rel="noopener">${IC.sp}<span>Open in Spotify</span></a><span class="small muted">Playing from YouTube</span></div>`);
  }catch(e){ closeModal(); window.open(ytUrl(s),'_blank','noopener'); }
}
function showModal(html){
  let m=$('#modal'); if(!m){ m=document.createElement('div'); m.id='modal'; m.className='modal'; document.body.appendChild(m); m.addEventListener('click',e=>{ if(e.target===m||e.target.closest('[data-close]')) closeModal(); }); }
  m.innerHTML=`<div class="modal-box"><button class="icon-btn modal-x" data-close title="Close">✕</button>${html}</div>`; m.style.display='grid';
}
function closeModal(){ const m=$('#modal'); if(m){ m.innerHTML=''; m.style.display='none'; } }
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModal(); });

/* =================== toasts & nav =================== */
function toast(html,actions,ms=4500){
  const el=document.createElement('div'); el.className='toast'; el.innerHTML=html;
  if(actions){ const a=document.createElement('div'); a.className='acts'; actions.forEach(x=>{ const b=document.createElement('button'); b.className=x.primary?'btnp':'btns'; b.textContent=x.label; b.onclick=()=>{ x.fn(); el.remove(); }; a.appendChild(b); }); el.appendChild(a); }
  $('#toasts').appendChild(el); setTimeout(()=>el.remove(),ms);
}
const VIEWS=[['home','Home'],['discover','Discover'],['library','Library'],['friends','Friends'],['games','Games'],['profile','Profile']];
function go(v){ stopGame(); S.view=v; LS.set('view',v); if(v!=='profile'){ S.editing=false; S.confirmDel=false; } if(v==='library') S.lib.open=S.lib.open; render(); $('#main').scrollTop=0; }
function renderSide(){
  if(!S.me){ $('#side').innerHTML=''; $('#mnav').innerHTML=''; return; }
  const fr=totalUnread()+pendingIn().length;
  $('#side').innerHTML = `<div class="brand"><div class="logo">🎧</div>Tunemate</div>`+
    VIEWS.map(([k,l])=>`<button class="nav ${S.view===k?'on':''}" data-go="${k}">${IC[k]}${l}${k==='friends'&&fr?`<span class="badge">${fr}</span>`:''}</button>`).join('')+
    `<div class="me-chip" data-go="profile">${avatar(S.me,'sm')}<div style="min-width:0"><div style="font-weight:600;font-size:14px">${esc(S.me.name)}</div><div class="small muted"><span class="dot ${S.mode==='cloud'?'live':''}"></span>${S.mode==='cloud'?`${Object.keys(S.online).length} online now`:'Demo mode'}</div></div></div>
    <div class="foot">Song previews by Apple Music. Radio is generated live in your browser.</div>`;
  $('#mnav').innerHTML = VIEWS.map(([k,l])=>`<button class="${S.view===k?'on':''}" data-go="${k}">${IC[k]}${l}${k==='friends'&&fr?`<span class="badge">${fr}</span>`:''}</button>`).join('');
}
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-go]'); if(g){ e.preventDefault(); if(!S.me) return; go(g.dataset.go); return; }
  const pl=e.target.closest('[data-play]'); if(pl){ const id=pl.dataset.play; if(Music.station && Music.station.id===id && !pl.dataset.seed) Music.toggle(); else Music.play(id, pl.dataset.seed?+pl.dataset.seed:undefined); return; }
  const op=e.target.closest('[data-pl]'); if(op){ S.lib.open=op.dataset.pl; if(S.view!=='library') go('library'); else { render(); $('#main').scrollTop=0; } return; }
  const h=e.target.closest('[data-heart]'); if(h){ const on=toggleLike(h.dataset.heart); h.classList.toggle('on',on); h.textContent=on?'♥':'♡'; return; }
  const pv=e.target.closest('[data-prev]'); if(pv){ const [lk,idx]=pv.dataset.prev.split('|'); const list=LISTS[lk]||[]; const s=list[+idx]; if(Preview.song&&s&&Preview.song.id===s.id&&activeSrc==='preview'){ Preview.toggle(); } else { activeSrc='preview'; Preview.play(list,+idx); } return; }
  const fu=e.target.closest('[data-full]'); if(fu){ const s=SONG_REG[fu.dataset.full]; if(s) playFull(s); return; }
});
/* every song shown on screen is registered so likes/previews can find it */
const SONG_REG={}; const LISTS={};
function regList(key,list){ LISTS[key]=list; list.forEach(s=>{ if(s&&s.id) SONG_REG[s.id]=s; }); return list; }
SONGS.forEach(s=>SONG_REG[s.id]=s);
const isLiked = id => likedIds(S.me).includes(id);
function toggleLike(id){
  const s=SONG_REG[id]; if(!s) return false;
  const cur=(S.me.liked||[]).filter(x=>x&&(typeof x==='string'?x:x.id));
  if(isLiked(id)){ S.me.liked=cur.filter(x=>(typeof x==='string'?x:x.id)!==id); saveMe(); return false; }
  const obj={id:s.id,t:String(s.t).slice(0,120),a:String(s.a).slice(0,120)}; if(s.img) obj.img=s.img; if(s.p) obj.p=s.p; if(s.url) obj.url=s.url;
  S.me.liked=[...cur,obj].slice(-250); saveMe(); toast(`♥ Added <b>${esc(s.t)}</b> to Liked Songs`,null,2000); return true;
}

/* =================== render core =================== */
function softRender(){
  renderSide();
  if(!S.me){ if(!$('.ob-root')) render(); return; }
  if(S.view==='profile' && S.editing) return;
  if(S.view==='friends'){ renderFriendList(); renderChatMsgs(); return; }
  if(S.view==='games'){ if(!S.game) renderGamesBody(); return; }
  if(S.view==='library') return;
  render();
}
function render(){
  if(!S.profilesLoaded){ $('#main').innerHTML='<div class="inner"><div class="loading"><div class="spin"></div>Tuning in…</div></div>'; return; }
  if(!S.me){ document.body.classList.add('ob'); renderSide(); renderOnboarding(); return; }
  document.body.classList.remove('ob');
  renderSide();
  const main=$('#main');
  const st=Music.station; main.style.setProperty('--hero', st? st.c[1] : '#1a1530');
  let h='';
  if(S.cloudNote) h+=`<div class="banner info">${esc(S.cloudNote)}</div>`;
  h += ({home:vHome,discover:vDiscover,library:vLibrary,friends:vFriends,games:vGames,profile:vProfile}[S.view]||vHome)();
  main.innerHTML=`<div class="inner">${h}</div>`;
  ({friends:afterFriends,profile:afterProfile,games:afterGames,library:afterLibrary}[S.view]||(()=>{}))();
}
function avatar(p,cls='',online=false){ return `<div class="av ${cls}" style="background:${grad(p.color)}">${esc(p.emoji||'🎧')}${online?'<span class="on"></span>':''}</div>`; }
function socials(p){
  let h='';
  if(p.insta) h+=`<a class="social" href="https://instagram.com/${encodeURIComponent(p.insta)}" target="_blank" rel="noopener">${IC.ig}@${esc(p.insta)}</a>`;
  if(p.spotify) h+=`<a class="social" href="https://open.spotify.com/user/${encodeURIComponent(p.spotify)}" target="_blank" rel="noopener">${IC.sp}Spotify</a>`;
  return h;
}
function stationCard(s){
  const on=Music.station&&Music.station.id===s.id&&Music.playing;
  return `<div class="station ${on?'playing':''}" data-play="${s.id}"><div class="cover" style="background:linear-gradient(135deg,${s.c[0]},${s.c[1]})">${s.emoji}</div>
    <div class="t">${on?'<span class="eq"><i></i><i></i><i></i></span>':''}${esc(s.name)}</div><div class="d">${esc(s.desc)}</div>
    <div class="playfab">${on?IC.pause:IC.play}</div></div>`;
}
function plCard(a,sub){
  return `<div class="station" data-pl="${a.k}"><div class="cover" style="background:linear-gradient(135deg,${a.c[0]},${a.c[1]})">${a.emoji}<span class="ini">${esc(a.name.split(' ').map(w=>w[0]).join('').slice(0,3))}</span></div>
    <div class="t">${esc(a.name)}</div><div class="d">${esc(sub||a.desc||'')}</div></div>`;
}
function greeting(){ const h=new Date().getHours(); return h<5?'Late night vibes':h<12?'Good morning':h<17?'Good afternoon':'Good evening'; }

/* =================== onboarding (welcome + sign-up) =================== */
const OB_STEPS=5;
function draft(){ if(!S.ob.d) S.ob.d={name:'',emoji:'🎧',color:0,genres:[],artists:[],moods:[],energy:50,under:50,anthem:'',insta:'',spotify:'',bio:''}; return S.ob.d; }
function saveDraft(){ LS.set('draft',S.ob.d); }
function renderOnboarding(){
  const main=$('#main'); main.style.setProperty('--hero','#09090d');
  if(S.ob.step===0){
    main.innerHTML=`<div class="landing ob-root">
      <div class="blob" style="width:420px;height:420px;background:#7b5cff;left:-120px;top:-80px"></div>
      <div class="blob" style="width:380px;height:380px;background:#1ed78a;right:-100px;bottom:-60px;animation-delay:-5s"></div>
      <div class="blob" style="width:300px;height:300px;background:#ff5c8a;right:20%;top:-120px;opacity:.3;animation-delay:-9s"></div>
      <div class="land-in">
        <div class="logo">🎧</div>
        <h1>Find your people<br>through <span>the music you love</span></h1>
        <p class="sub">Tunemate matches you with listeners who share your taste. Make friends, swap songs, chat, and play music games together.</p>
        <div class="bigeq">${Array.from({length:22},(_,i)=>`<i style="animation-delay:-${((i*0.37)%1.2).toFixed(2)}s;animation-duration:${0.9+(i%5)*0.15}s"></i>`).join('')}</div>
        ${S.cloudNote?`<div class="banner info" style="max-width:560px;margin:0 auto 18px;text-align:left">${esc(S.cloudNote)}</div>`:''}
        ${authPanel()}
        <div class="feats">
          <div class="feat"><div class="e">💞</div><b>Taste matching</b><p>A match score from your genres, artists, moods and liked songs.</p></div>
          <div class="feat"><div class="e">📚</div><b>Real songs</b><p>Play previews from Drake, Arijit Singh, Anuv Jain, Seedhe Maut, Honey Singh, Bieber and more.</p></div>
          <div class="feat"><div class="e">🎮</div><b>Music games</b><p>Guess the song, beat maker, rhythm tap, tempo and ear challenges, live tic-tac-toe.</p></div>
          <div class="feat"><div class="e">💬</div><b>Friends & chat</b><p>Connect, message, and listen along to what your friends are playing.</p></div>
        </div>
        <div class="floaty">${LIB.map(a=>`<span>${a.emoji} ${esc(a.name)}</span>`).join('')}</div>
      </div></div>`;
    bindAuth();
    return;
  }
  const d=draft(), n=S.ob.step;
  const chip=(list,sel,attr,emo)=>list.map(x=>`<button type="button" class="chip btn ${sel.includes(x)?'on':''}" data-${attr}="${esc(x)}">${emo&&emo[x]?emo[x]+' ':''}${esc(x)}</button>`).join('');
  let body='';
  if(n===1) body=`<h1>Hey! What should we call you?</h1><p class="sub">This is how other listeners will see you.</p>
    <div class="field" style="margin-top:22px"><input class="inp lg" id="f_name" maxlength="30" placeholder="Your name or nickname" value="${esc(d.name)}" autocomplete="off"></div>
    <div class="field"><label>Pick an avatar</label><div class="pick">${EMOJIS.map(e=>`<button type="button" class="${d.emoji===e?'on':''}" data-emo="${e}">${e}</button>`).join('')}</div></div>
    <div class="field"><label>And a colour</label><div class="pick">${COLORS.map((c,i)=>`<button type="button" class="col ${d.color===i?'on':''}" data-col="${i}" style="background:${grad(i)}"></button>`).join('')}</div></div>`;
  if(n===2) body=`<h1>What do you listen to?</h1><p class="sub">Pick at least 2 genres. These power your matches and station picks.</p>
    <div class="chips big" style="margin-top:22px">${chip(GENRES,d.genres,'g',GENRE_EMO)}</div>`;
  if(n===3) body=`<h1>Who are your favourite artists?</h1><p class="sub">Pick at least one. People who love the same artists get a big match boost.</p>
    <div class="chips big" style="margin-top:22px">${chip([...new Set([...ARTIST_CHIPS,...d.artists])],d.artists,'a')}</div>
    <div class="row" style="margin-top:16px"><input class="inp" id="f_art" maxlength="40" placeholder="Someone else? Type a name and press Enter"><button type="button" class="btns" id="addArt">Add</button></div>`;
  if(n===4) body=`<h1>What's your vibe?</h1><p class="sub">When do you listen, and what kind of listener are you?</p>
    <div class="field" style="margin-top:22px"><label>I listen when I'm…</label><div class="chips big">${chip(MOODS,d.moods,'m')}</div></div>
    <div class="two"><div class="field"><label>Energy</label><input type="range" id="f_energy" min="0" max="100" value="${d.energy}"><div class="range-lbl"><span>Chill & mellow</span><span>Loud & hype</span></div></div>
    <div class="field"><label>Discovery</label><input type="range" id="f_under" min="0" max="100" value="${d.under}"><div class="range-lbl"><span>Chart hits</span><span>Underground gems</span></div></div></div>
    <div class="field"><label>Song on repeat right now</label><input class="inp" id="f_anthem" maxlength="60" value="${esc(d.anthem)}" placeholder="e.g. Baarishein"></div>`;
  if(n===5) body=`<h1>Link your socials</h1><p class="sub">Optional. Your matches will see buttons to your Instagram and Spotify profile so you can follow each other.</p>
    <div class="field" style="margin-top:22px"><label>Instagram handle</label><div class="inp-wrap">${IC.ig}<input class="inp" id="f_insta" maxlength="60" value="${esc(d.insta)}" placeholder="yourhandle"></div></div>
    <div class="field"><label>Spotify profile</label><div class="hint">In Spotify: your profile → ⋯ → Share → Copy link, then paste it here.</div><div class="inp-wrap">${IC.sp}<input class="inp" id="f_sp" maxlength="140" value="${esc(d.spotify)}" placeholder="https://open.spotify.com/user/…"></div></div>
    <div class="field"><label>Short bio</label><textarea class="inp" id="f_bio" rows="2" maxlength="160" placeholder="A line about you and your music">${esc(d.bio)}</textarea></div>`;
  $('#main').innerHTML=`<div class="ob-wrap ob-root"><div class="ob-card">
      <div class="steps">${Array.from({length:OB_STEPS},(_,i)=>`<i class="${i<n?'on':''}"></i>`).join('')}</div>
      <div class="small muted" style="margin-bottom:6px">Step ${n} of ${OB_STEPS}</div>${body}
      <div class="err" id="obErr" style="margin-top:14px"></div>
      <div class="ob-nav"><button class="btns" id="obBack">← Back</button><span class="grow"></span>${n===5?'<button class="btns" id="obSkip">Skip</button>':''}<button class="btnp" id="obNext">${n===OB_STEPS?'Finish & find my matches 🎉':'Continue →'}</button></div>
    </div><div class="preview" id="obPrev"></div></div>`;
  bindOb(); renderObPreview();
}
function authPanel(){
  if(!isCloud()) return `<button class="btnp lg" id="obStart">Try the demo →</button>
    <div class="small muted" style="margin-top:12px">Demo mode: your profile is saved in this browser only.</div>`;
  if(S.session) return `<button class="btnp lg" id="obStart">Continue setting up your profile →</button>
    <div class="small muted" style="margin-top:12px">Signed in as ${esc(S.session.user.email||'you')} · <a href="#" id="obOut">Sign out</a></div>`;
  const up=S.authMode==='signup';
  return `<div class="auth card">
    <button class="btn-google" id="gBtn"><svg viewBox="0 0 48 48" width="20" height="20"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>Continue with Google</button>
    <div class="or"><span>or use email</span></div>
    <form id="authF" class="authf">
      <input class="inp" id="aEmail" type="email" placeholder="Email address" autocomplete="email" required>
      <input class="inp" id="aPass" type="password" placeholder="${up?'Create a password (8+ characters)':'Password'}" autocomplete="${up?'new-password':'current-password'}" minlength="8" required>
      <button class="btnp" id="aGo" ${S.authBusy?'disabled':''}>${S.authBusy?'Please wait…':up?'Create account':'Sign in'}</button>
    </form>
    <div class="err" id="aErr"></div>
    <div class="small muted">${up?'Already have an account?':'New to Tunemate?'} <a href="#" id="aSwap">${up?'Sign in':'Create an account'}</a></div>
  </div>
  <div class="small muted" style="margin-top:12px">🔒 We only use your email to sign you in. Your password is handled securely by Supabase.</div>`;
}
function bindAuth(){
  const st=$('#obStart'); if(st) st.onclick=()=>{ S.ob.step=1; draft(); renderOnboarding(); };
  const out=$('#obOut'); if(out) out.onclick=e=>{ e.preventDefault(); signOut(); };
  const sw=$('#aSwap'); if(sw) sw.onclick=e=>{ e.preventDefault(); S.authMode=S.authMode==='signup'?'signin':'signup'; renderOnboarding(); };
  const g=$('#gBtn'); if(g) g.onclick=async()=>{
    const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}});
    if(error) $('#aErr').textContent=error.message;
  };
  const f=$('#authF'); if(f) f.onsubmit=async e=>{
    e.preventDefault(); const email=$('#aEmail').value.trim(), pass=$('#aPass').value, err=$('#aErr');
    if(pass.length<8){ err.textContent='Use at least 8 characters for your password.'; return; }
    S.authBusy=true; $('#aGo').disabled=true; $('#aGo').textContent='Please wait…'; err.textContent='';
    try{
      if(S.authMode==='signup'){
        const {data,error}=await sb.auth.signUp({email,password:pass,options:{emailRedirectTo:location.origin+location.pathname}});
        if(error) throw error;
        if(!data.session){ err.style.color='var(--acc)'; err.textContent='Account created! Check your email for a confirmation link, then come back and sign in.'; S.authMode='signin'; }
      } else {
        const {error}=await sb.auth.signInWithPassword({email,password:pass});
        if(error) throw error;
      }
    }catch(x){ err.style.color=''; err.textContent=/invalid login/i.test(x.message||'')?'Wrong email or password.':(x.message||'Something went wrong.'); }
    finally{ S.authBusy=false; const b=$('#aGo'); if(b){ b.disabled=false; b.textContent=S.authMode==='signup'?'Create account':'Sign in'; } }
  };
}
function renderObPreview(){
  const d=draft(), el=$('#obPrev'); if(!el) return;
  el.innerHTML=`<div class="small muted" style="margin-bottom:10px;text-align:center">Your profile preview</div><div class="card">${avatar(d,'xl')}
    <div style="font-weight:800;font-size:24px">${esc(d.name||'Your name')}</div>
    ${d.anthem?`<div class="small muted" style="margin-top:4px">🎵 ${esc(d.anthem)}</div>`:''}
    <div class="chips" style="justify-content:center;margin-top:14px">${d.genres.slice(0,6).map(g=>`<span class="chip hl">${esc(g)}</span>`).join('')||'<span class="small muted">Genres appear here</span>'}</div>
    ${d.artists.length?`<div class="small" style="margin-top:12px">🎤 ${d.artists.slice(0,4).map(esc).join(', ')}</div>`:''}
    ${d.moods.length?`<div class="small muted" style="margin-top:8px">${d.moods.map(esc).join(' · ')}</div>`:''}</div>`;
}
function readObInputs(){
  const d=draft(), v=id=>{ const e=$('#'+id); return e?e.value:null; };
  if(v('f_name')!==null) d.name=v('f_name').trim().slice(0,30);
  if(v('f_energy')!==null){ d.energy=+v('f_energy'); d.under=+v('f_under'); d.anthem=v('f_anthem').trim().slice(0,60); }
  if(v('f_insta')!==null){ d.insta=v('f_insta').trim(); d.spotify=v('f_sp').trim(); d.bio=v('f_bio').trim().slice(0,160); }
  saveDraft();
}
function bindOb(){
  const d=draft(), r=$('.ob-card');
  r.querySelectorAll('[data-emo]').forEach(b=>b.onclick=()=>{ d.emoji=b.dataset.emo; r.querySelectorAll('[data-emo]').forEach(x=>x.classList.toggle('on',x===b)); renderObPreview(); saveDraft(); });
  r.querySelectorAll('[data-col]').forEach(b=>b.onclick=()=>{ d.color=+b.dataset.col; r.querySelectorAll('[data-col]').forEach(x=>x.classList.toggle('on',x===b)); renderObPreview(); saveDraft(); });
  const tog=(attr,key,max)=>r.querySelectorAll(`[data-${attr}]`).forEach(b=>b.onclick=()=>{ const val=b.dataset[attr], s=new Set(d[key]); if(s.has(val)) s.delete(val); else { if(max && s.size>=max) return $('#obErr').textContent=`You can pick up to ${max}.`; s.add(val); } d[key]=[...s]; b.classList.toggle('on',s.has(val)); $('#obErr').textContent=''; renderObPreview(); saveDraft(); });
  tog('g','genres',10); tog('a','artists',10); tog('m','moods');
  const nm=$('#f_name'); if(nm){ nm.focus(); nm.oninput=()=>{ d.name=nm.value.slice(0,30); renderObPreview(); }; nm.onkeydown=e=>{ if(e.key==='Enter') $('#obNext').click(); }; }
  const an=$('#f_anthem'); if(an) an.oninput=()=>{ d.anthem=an.value; renderObPreview(); };
  const fa=$('#f_art'); if(fa){ const add=()=>{ const v=fa.value.trim().slice(0,40); if(!v) return; if(d.artists.length>=10) return $('#obErr').textContent='You can pick up to 10.'; if(!d.artists.some(x=>norm(x)===norm(v))) d.artists.push(v); saveDraft(); renderOnboarding(); }; fa.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); add(); } }; $('#addArt').onclick=add; }
  $('#obBack').onclick=()=>{ readObInputs(); S.ob.step--; renderOnboarding(); $('#main').scrollTop=0; };
  const sk=$('#obSkip'); if(sk) sk.onclick=()=>{ d.insta=''; d.spotify=''; finishOb(); };
  $('#obNext').onclick=()=>{
    readObInputs(); const err=m=>{ $('#obErr').textContent=m; };
    const n=S.ob.step;
    if(n===1 && !d.name) return err('Please enter a name.');
    if(n===2 && d.genres.length<2) return err('Pick at least 2 genres.');
    if(n===3 && d.artists.length<1) return err('Pick at least one artist.');
    if(n===5) return finishOb();
    S.ob.step++; renderOnboarding(); $('#main').scrollTop=0;
  };
}
function cleanSocial(d){
  let insta=(d.insta||'').trim().replace(/^@/,'').replace(/^https?:\/\/(www\.)?instagram\.com\//i,'').replace(/[/?#].*$/,'');
  if(insta && !/^[A-Za-z0-9._]{1,30}$/.test(insta)) return {err:'That Instagram handle looks off. Use letters, numbers, dots and underscores.'};
  let sp=(d.spotify||'').trim(); const mm=sp.match(/spotify\.com\/(?:intl-[a-z]+\/)?user\/([^/?#]+)/i); if(mm) sp=mm[1]; sp=sp.replace(/^spotify:user:/,'');
  if(sp && !/^[A-Za-z0-9._-]{1,64}$/.test(sp)) return {err:'Paste your Spotify profile link (open.spotify.com/user/…) or your username.'};
  return {insta,spotify:sp};
}
async function finishOb(){
  const d=draft(), s=cleanSocial(d); if(s.err) return $('#obErr').textContent=s.err;
  const me={id:S.myId,name:d.name,emoji:d.emoji,color:d.color,bio:d.bio,anthem:d.anthem,insta:s.insta,spotify:s.spotify,genres:d.genres,artists:d.artists,moods:d.moods,energy:d.energy,under:d.under,likes:[],liked:[],scores:{},beat:null};
  const btn=$('#obNext'); if(btn){ btn.disabled=true; btn.textContent='Saving…'; }
  if(isCloud()){
    const {error}=await sb.from('profiles').upsert(toRow(me));
    if(error){ if(btn){ btn.disabled=false; btn.textContent='Finish & find my matches 🎉'; } $('#obErr').textContent='Could not save your profile: '+error.message; return; }
    S.profiles[S.myId]=me;
  }
  S.me=me; if(!isCloud()) saveLocal();
  LS.del('draft'); S.ob={step:0,d:null};
  S.view='home'; LS.set('view','home'); render(); setPresence();
  toast(`🎉 Welcome to Tunemate, <b>${esc(S.me.name)}</b>! Check out your top matches.`,[{label:'See matches',primary:true,fn:()=>go('discover')}],7000);
}

/* =================== home =================== */
function vHome(){
  const me=S.me, recs=recStations(me), ps=allProfiles().map(p=>({p,m:match(me,p)})).sort((a,b)=>b.m.score-a.m.score);
  const live=Object.values(S.online).map(o=>({o,p:getP(o.id)})).filter(x=>x.p && x.o.st && stById(x.o.st));
  const friends=allProfiles().filter(p=>isFriend(p.id)).length, played=Object.values(me.scores||{}).some(v=>v>0);
  const tasks=[['Create your profile',true,null],['Link Instagram or Spotify',!!(me.insta||me.spotify),'profile'],['Like 5 songs in the Library',likedIds(me).length>=5,'library'],['Connect with a match',friends>0,'discover'],['Play a music game',played,'games']];
  const done=tasks.filter(t=>t[1]).length;
  let h=`<div class="row" style="gap:16px">${avatar(me,'lg')}<div><h1>${greeting()}, ${esc(me.name)}</h1><div class="sub">Tuned to ${esc((me.genres||[]).slice(0,3).join(', ')||'everything')}.</div></div></div>`;
  if(done<tasks.length) h+=`<div class="card" style="margin-top:22px"><div class="row" style="margin-bottom:12px"><b style="font-size:17px">Getting started</b><span class="small muted" style="margin-left:auto">${done}/${tasks.length} done</span></div><div class="bar" style="margin-bottom:14px"><i style="width:${done/tasks.length*100}%"></i></div>
    <div class="check">${tasks.map(([l,ok,v])=>`<div class="it ${ok?'done':''}"><span class="bx">${ok?'✓':''}</span>${l}${!ok&&v?`<button class="btns sm" data-go="${v}">Go</button>`:''}</div>`).join('')}</div></div>`;
  if(isCloud() && allProfiles().length<3) h+=inviteCard();
  if(live.length) h+=`<h2><span class="dot live"></span>Friends listening now</h2><div class="mini-row">${live.map(({o,p})=>{ const s=stById(o.st); return `<div class="mini" data-play="${s.id}" data-seed="${+o.seed||0}">${avatar(p,'',true)}<b>${esc(p.name)}</b><div class="small muted">${s.emoji} ${esc(o.tn||s.name)}</div><div class="small" style="color:var(--acc);margin-top:6px">▶ Listen along</div></div>`; }).join('')}</div>`;
  h+=`<h2>Your artists <button class="more" data-go="library">Open library</button></h2><div class="grid lib-grid">${recArtists(me).slice(0,6).map(a=>plCard(a,a.tags.join(' · '))).join('')}</div>`;
  if(ps.length) h+=`<h2>Your top matches <button class="more" data-go="discover">See all</button></h2><div class="mini-row">${ps.slice(0,6).map(({p,m})=>`<div class="mini" data-go="discover">${avatar(p,'',!!S.online[p.id])}<b>${esc(p.name)}</b> ${p.demo?'<span class="tag">demo</span>':''}<div style="color:var(--acc);font-weight:700;font-size:20px;margin-top:4px">${m.score}%</div><div class="small muted">${esc(m.sharedG.slice(0,2).join(' · ')||'New sounds')}</div></div>`).join('')}</div>`;
  h+=`<h2>Tunemate Radio <span class="small muted" style="font-weight:400">· music generated live, never ends</span></h2><div class="grid st-grid">${recs.map(stationCard).join('')}</div>`;
  h+=`<h2>Quick games <button class="more" data-go="games">All games</button></h2><div class="grid g-grid">${GAMES.slice(0,4).map(gameCard).join('')}</div>`;
  return h;
}

/* =================== discover =================== */
function vDiscover(){
  const me=S.me; let list=allProfiles().map(p=>({p,m:match(me,p)}));
  if(S.filter!=='All') list=list.filter(x=>(x.p.genres||[]).includes(S.filter));
  list.sort((a,b)=>b.m.score-a.m.score);
  let h=`<h1>Discover</h1><div class="sub">People ranked by how closely their taste matches yours. Tap <b>Connect</b>. When they connect back, you're friends.</div>`;
  if(!isCloud()) h+=`<div class="banner info" style="margin-top:16px">Demo mode: profiles marked <span class="tag">demo</span> are examples so you can try everything out.</div>`;
  if(isCloud() && allProfiles().length<5) h+=`<div style="margin-top:16px">${inviteCard()}</div>`;
  h+=`<div class="chips" style="margin:18px 0 20px">${['All',...(me.genres||[])].map(g=>`<button class="chip btn ${S.filter===g?'on':''}" data-filter="${esc(g)}">${esc(g)}</button>`).join('')}</div>`;
  if(!list.length) h+=`<div class="card empty"><div><div class="big">🔎</div>${S.filter==='All'?'No one else has joined yet. Share your link to invite friends!':'No one here yet for this genre.'}</div></div>`;
  h+=`<div class="grid m-grid">${list.map(({p,m})=>matchCard(p,m)).join('')}</div>`;
  return h;
}
function connectBtn(p){
  const iLike=likes(S.me,p.id), theyLike=likes(p,S.myId);
  if(iLike&&theyLike) return `<button class="btns ok" data-chat="${esc(p.id)}">✓ Friends · Message</button>`;
  if(iLike) return `<button class="btns" data-unlike="${esc(p.id)}" title="Click to cancel">Requested ✕</button>`;
  if(theyLike && !p.demo) return `<button class="btnp" data-like="${esc(p.id)}">Accept request</button>`;
  return `<button class="btnp" data-like="${esc(p.id)}">+ Connect</button>`;
}
function matchCard(p,m){
  const on=S.online[p.id];
  return `<div class="card match"><div class="row">${avatar(p,'',!!on)}<div><div style="font-weight:700;font-size:17px">${esc(p.name)} ${p.demo?'<span class="tag">demo</span>':''}</div>
    <div class="small muted">${on&&on.st?`🎧 ${esc(on.tn||'listening')}`:p.anthem?`🎵 On repeat: ${esc(p.anthem)}`:'&nbsp;'}</div></div>
    <div class="ring" style="--p:${m.score}"><b><span>${m.score}%<small>match</small></span></b></div></div>
    ${p.bio?`<div class="quote">“${esc(p.bio)}”</div>`:''}
    <div class="chips">${(p.genres||[]).slice(0,6).map(g=>`<span class="chip ${m.sharedG.includes(g)?'hl':''}">${esc(g)}</span>`).join('')}</div>
    ${m.sharedA.length?`<div class="small">🎤 You both love <b>${m.sharedA.map(esc).join(', ')}</b></div>`:(p.artists||[]).length?`<div class="small muted">Into ${(p.artists||[]).slice(0,3).map(esc).join(', ')}</div>`:''}
    ${m.sharedS.length?`<div class="small">♥ You both liked <b>${m.sharedS.slice(0,3).map(id=>esc(songTitle(id,p)||songTitle(id,S.me))).join(', ')}</b>${m.sharedS.length>3?` +${m.sharedS.length-3}`:''}</div>`:''}
    ${m.sharedM.length?`<div class="small muted">Shared vibes: ${m.sharedM.map(esc).join(' · ')}</div>`:''}
    <div class="row" style="flex-wrap:wrap;gap:8px">${socials(p)}${p.beat?`<button class="social" data-beat="${esc(p.id)}">🥁 Play their beat</button>`:''}<span style="margin-left:auto;display:flex;gap:6px">${p.demo?'':`<button class="icon-btn" data-block="${esc(p.id)}" title="Block">🚫</button>`}${connectBtn(p)}</span></div></div>`;
}
function inviteCard(){
  return `<div class="card" style="margin-top:22px;background:linear-gradient(135deg,#1b1530,#13131a)"><div class="row" style="flex-wrap:wrap"><div style="font-size:34px">📣</div><div style="flex:1;min-width:200px"><b style="font-size:17px">Invite your friends</b><div class="small muted" style="margin-top:4px">Tunemate gets better with more people. Share your link on Instagram or WhatsApp.</div></div>
    <button class="btnp" data-copylink>🔗 Copy invite link</button><a class="btns" href="https://wa.me/?text=${encodeURIComponent('Find your music match on Tunemate 🎧 '+location.origin)}" target="_blank" rel="noopener">WhatsApp</a></div></div>`;
}
document.addEventListener('click',e=>{
  const f=e.target.closest('[data-filter]'); if(f){ S.filter=f.dataset.filter; render(); return; }
  const l=e.target.closest('[data-like]'); if(l){ const id=l.dataset.like; l.disabled=true; connectTo(id).then(ok=>{ if(!ok) return; const p=getP(id); if(likes(p,S.myId)) toast(`🎉 You and <b>${esc(p.name)}</b> are now friends!`,[{label:'Say hi',primary:true,fn:()=>{S.chatWith=id;go('friends');}}]); else toast(`Request sent to <b>${esc(p.name)}</b>. You'll be friends when they connect back.`); if(S.view==='friends') afterFriends(); else render(); }); if(S.view==='friends') afterFriends(); else render(); return; }
  const u=e.target.closest('[data-unlike]'); if(u){ disconnect(u.dataset.unlike).then(()=>render()); render(); return; }
  const bl=e.target.closest('[data-block]'); if(bl){ const id=bl.dataset.block, p=getP(id); toast(`Block <b>${esc(p?p.name:'this person')}</b>? They won't be able to message you.`,[{label:'Block',primary:true,fn:()=>blockUser(id)},{label:'Cancel',fn:()=>{}}],8000); return; }
  const cl=e.target.closest('[data-copylink]'); if(cl){ const url=location.origin; (navigator.clipboard?navigator.clipboard.writeText(url):Promise.reject()).then(()=>toast('🔗 Link copied! Paste it anywhere to invite friends.')).catch(()=>toast('Your link: '+esc(url),null,8000)); return; }
  const c=e.target.closest('[data-chat]'); if(c){ S.chatWith=c.dataset.chat; go('friends'); return; }
  const b=e.target.closest('[data-beat]'); if(b){ const p=getP(b.dataset.beat); if(p&&p.beat){ go('games'); startGame('beat',{beat:p.beat,owner:p.name}); } return; }
});

/* =================== library =================== */
function trackRow(s,i,showArtist=true,listKey=''){
  SONG_REG[s.id]=s;
  const on=isLiked(s.id), playing=Preview.song&&Preview.song.id===s.id&&Preview.playing;
  return `<div class="trk ${playing?'now':''}"><span class="n">${s.p&&listKey?`<button class="tplay" data-prev="${listKey}|${i}" title="Play preview">${playing?IC.pause:IC.play}</button>`:i+1}</span>
    <div class="trk-main">${s.img?`<img class="art" src="${esc(s.img)}" alt="" loading="lazy">`:''}<div style="min-width:0"><div class="tt">${esc(s.t)}</div>${showArtist?`<div class="aa">${esc(s.a)}${s.al?` · ${esc(s.al)}`:''}</div>`:''}</div></div>
    <div class="acts"><button class="heart ${on?'on':''}" data-heart="${esc(s.id)}" title="Like">${on?'♥':'♡'}</button>
    <button class="lnk full" data-full="${esc(s.id)}" title="Play the full song">${IC.play}<span>Full song</span></button>
    <a class="lnk sp" href="${spUrl(s)}" target="_blank" rel="noopener" title="Open in Spotify">${IC.sp}<span>Spotify</span></a></div></div>`;
}
function trackList(key,list,showArtist){ regList(key,list); return list.map((s,i)=>trackRow(s,i,showArtist,key)).join(''); }
function plMeta(o){
  if(o==='liked') return {pl:{name:'Liked Songs',emoji:'♥',c:['#7b5cff','#1ed78a']},list:(S.me.liked||[]).map(x=>typeof x==='string'?songById(x):x).filter(Boolean).slice().reverse(),label:'YOUR PLAYLIST'};
  if(o.startsWith('mix-')){ const m=MIXES.find(x=>x.k===o); if(!m) return null;
    const lists=m.from.map(k=>(artistSongs[k]&&artistSongs[k].songs)||libByK(k).list); const out=[]; for(let i=0;i<10;i++) lists.forEach(l=>{ if(l[i]) out.push(l[i]); });
    return {pl:m,list:out.slice(0,30),label:'TUNEMATE MIX',sub:m.desc}; }
  const a=libByK(o); if(!a) return null;
  return {pl:a,list:(artistSongs[o]&&artistSongs[o].songs)||a.list,label:'ARTIST PLAYLIST',sub:a.tags.join(' · '),link:spArtist(a.name)};
}
function vLibrary(){
  const o=S.lib.open;
  if(o){
    const M=plMeta(o); if(!M){ S.lib.open=null; return vLibrary(); }
    const {pl}=M;
    return `<button class="btns sm" id="libBack" style="margin-bottom:18px">← Library</button>
      <div class="pl-head"><div class="cover" style="background:linear-gradient(135deg,${pl.c[0]},${pl.c[1]})">${pl.emoji}</div><div>
        <div class="small muted" style="font-weight:600;letter-spacing:.6px">${M.label}</div>
        <h1 style="font-size:clamp(32px,5vw,54px);letter-spacing:-1.5px">${esc(pl.name)}</h1><div class="sub" id="plSub">${esc(M.sub||'')}</div>
        <div class="row" style="margin-top:14px;flex-wrap:wrap;gap:8px"><button class="btnp" id="plPlay">${IC.play} Play previews</button>${M.link?`<a class="btns" href="${M.link}" target="_blank" rel="noopener">${IC.sp} Open in Spotify</a>`:''}<span class="small muted" id="plFans"></span></div></div></div>
      <div class="card" style="padding:8px" id="plList"></div>
      <div class="small muted" style="margin-top:14px;line-height:1.5">▶ plays a 30-second preview here (provided by Apple Music). <b>Full song</b> plays the whole track${S.cfg.youtube?' from YouTube right inside Tunemate':' on YouTube'}. ♥ saves it to your Liked Songs and improves your matches.</div>`;
  }
  return `<h1>Library</h1><div class="sub">Real songs from your favourite artists. Play previews, like songs to build your playlist, and open anything in Spotify or YouTube.</div>
    <div class="search" style="margin-top:20px">${IC.search}<input id="libQ" placeholder="Search any song or artist" value="${esc(S.lib.q)}" autocomplete="off"></div>
    <div id="libBody"></div>`;
}
function renderPlList(){
  const o=S.lib.open, el=$('#plList'); if(!o||!el) return;
  const M=plMeta(o); if(!M) return;
  const loading=!o.startsWith('mix-') && o!=='liked' && artistSongs[o] && artistSongs[o].state==='loading';
  el.innerHTML = M.list.length ? trackList('pl:'+o,M.list,o==='liked'||o.startsWith('mix-')) + (loading?'<div class="small muted" style="padding:10px 12px">Loading songs…</div>':'')
    : `<div class="empty"><div><div class="big">♡</div>Tap the heart on any song to save it here. Liked songs also improve your matches.</div></div>`;
  const sub=$('#plSub'); if(sub) sub.textContent=`${M.sub?M.sub+' · ':''}${M.list.length} songs`;
  const ids=new Set(M.list.map(s=>s.id)); const fans=allProfiles().filter(p=>likedIds(p).some(id=>ids.has(id))).slice(0,6);
  const f=$('#plFans'); if(f) f.textContent=fans.length?'Liked by '+fans.map(p=>p.name).join(', '):'';
}
let searchT=null, searchSeq=0;
function libBodyHtml(){
  const liked=likedIds(S.me).length;
  return `<h2>Your playlists</h2><div class="grid lib-grid">${plCard({k:'liked',name:'Liked Songs',emoji:'♥',c:['#7b5cff','#1ed78a']},liked+' songs')}${MIXES.map(m=>plCard(m,m.desc)).join('')}</div>
    <h2>Artists</h2><div class="grid lib-grid">${recArtists(S.me).map(a=>plCard(a,a.tags.join(' · '))).join('')}</div>`;
}
function runSearch(){
  const q=S.lib.q.trim(), body=$('#libBody'); if(!body) return;
  if(!q){ body.innerHTML=libBodyHtml(); return; }
  const local=SONGS.filter(s=>norm(s.t).includes(norm(q))||norm(s.a).includes(norm(q))).slice(0,20);
  body.innerHTML=`<h2>Results</h2><div class="card" style="padding:8px" id="sres">${local.length?trackList('search',local,true):''}<div class="small muted" style="padding:10px 12px">Searching all songs…</div></div>`;
  clearTimeout(searchT); const seq=++searchSeq;
  searchT=setTimeout(()=>{
    fetchSongs({q,limit:25}).then(songs=>{ if(seq!==searchSeq) return; const el=$('#sres'); if(el) el.innerHTML=songs.length?trackList('search',songs,true):'<div class="empty">No songs found. Try another name.</div>'; })
      .catch(()=>{ if(seq!==searchSeq) return; const el=$('#sres'); if(el) el.innerHTML=(local.length?trackList('search',local,true):'')+'<div class="small muted" style="padding:10px 12px">Full search is unavailable right now, showing saved songs only.</div>'; });
  },350);
}
function afterLibrary(){
  const b=$('#libBack'); if(b) b.onclick=()=>{ S.lib.open=null; render(); };
  const o=S.lib.open;
  if(o){
    renderPlList();
    const ks=o==='liked'?[]:o.startsWith('mix-')?MIXES.find(m=>m.k===o).from:[o];
    ks.forEach(k=>loadArtist(k).then(()=>{ if(S.view==='library'&&S.lib.open===o) renderPlList(); }));
    const pp=$('#plPlay'); if(pp) pp.onclick=()=>{ const M=plMeta(o); regList('pl:'+o,M.list); if(!M.list.some(s=>s.p)) return toast('Previews are still loading or unavailable. Try again in a moment.'); activeSrc='preview'; Preview.play(M.list,0); };
    return;
  }
  const q=$('#libQ'); if(q){ runSearch(); q.oninput=()=>{ S.lib.q=q.value; runSearch(); }; }
}

/* =================== friends & chat =================== */
function vFriends(){
  return `<h1>Friends</h1><div class="sub">Chat privately with your friends. Only you and the person you're talking to can read your messages. You can message someone once you've both connected.</div>
  <div class="fr-wrap" style="margin-top:20px"><div class="fr-list" id="frList"></div><div class="chat" id="chat"></div></div>`;
}
function renderFriendList(){
  const el=$('#frList'); if(!el) return;
  const ps=allProfiles(); const friends=ps.filter(p=>isFriend(p.id)), inc=pendingIn(), sent=ps.filter(p=>likes(S.me,p.id)&&!likes(p,S.myId));
  if(!S.chatWith && friends.length) S.chatWith=friends[0].id;
  const row=(p,sub)=>{ const n=unread(p.id), on=S.online[p.id]; return `<div class="fr ${S.chatWith===p.id?'on':''}" data-open="${esc(p.id)}">${avatar(p,'sm',!!on)}<div style="min-width:0"><div class="nm">${esc(p.name)} ${p.demo?'<span class="tag">demo</span>':''}</div><div class="st">${sub}</div></div>${n?`<span class="badge" style="margin-left:auto">${n}</span>`:''}</div>`; };
  let h='';
  if(inc.length) h+=`<div class="fr-sec">Wants to connect</div>`+inc.map(p=>`<div class="fr">${avatar(p,'sm')}<div style="min-width:0;flex:1"><div class="nm">${esc(p.name)}</div><div class="st">${match(S.me,p).score}% match</div></div><button class="btnp sm" data-like="${esc(p.id)}">Accept</button></div>`).join('');
  h+=`<div class="fr-sec">Friends · ${friends.length}</div>`;
  h+= friends.length ? friends.map(p=>{ const c=convo(p.id), last=c[c.length-1], on=S.online[p.id]; return row(p, on&&on.st?`🎧 ${esc(on.tn||'Listening')}`: last?esc((last.from===S.myId?'You: ':'')+last.text):`${match(S.me,p).score}% match`); }).join('')
    : `<div class="small muted" style="padding:6px 10px 12px;line-height:1.5">No friends yet. Go to <a href="#" data-go="discover">Discover</a> and connect with your matches.</div>`;
  if(sent.length) h+=`<div class="fr-sec">Requests sent</div>`+sent.map(p=>`<div class="fr" style="cursor:default">${avatar(p,'sm')}<div style="flex:1;min-width:0"><div class="nm">${esc(p.name)}</div><div class="st">Waiting for them to connect</div></div><button class="btns sm" data-unlike="${esc(p.id)}">Cancel</button></div>`).join('');
  el.innerHTML=h;
}
const QUICK=['🔥 What are you listening to?','Send me your top 3 songs','Wanna play a game? 🎮','Your taste is elite 👌'];
function renderChatHeader(){
  const el=$('#chat'); if(!el) return;
  const id=S.chatWith, p=id&&getP(id);
  if(!p || !isFriend(id)){ el.innerHTML=`<div class="empty"><div><div class="big">💬</div><div>Pick a friend to start chatting.</div></div></div>`; el.dataset.for=''; return; }
  const on=S.online[id];
  el.innerHTML=`<div class="chat-h">${avatar(p,'sm',!!on)}<div><div style="font-weight:700">${esc(p.name)}</div><div class="small muted">${on?(on.st?`🎧 ${esc(on.tn||'listening')} · `:'')+'Online':match(S.me,p).score+'% match'}</div></div>
    <div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">${on&&on.st?`<button class="btns sm" data-play="${esc(on.st)}" data-seed="${+on.seed||0}">🎧 Listen along</button>`:''}
    <button class="btns sm" data-challenge="${esc(id)}">🎮 Challenge</button>${p.demo?'':`<button class="icon-btn" data-block="${esc(id)}" title="Block">🚫</button>`}</div></div>
    <div class="msgs" id="msgs"></div>
    <div class="quick">${QUICK.map(q=>`<button class="chip btn" data-quick="${esc(q)}">${esc(q)}</button>`).join('')}</div>
    <form class="chat-f" id="chatF"><input class="inp" id="chatIn" placeholder="Message ${esc(p.name)}…" autocomplete="off" maxlength="600"><button class="btnp" style="padding:10px 16px">${IC.send}</button></form>`;
  $('#chatF').onsubmit=ev=>{ ev.preventDefault(); const i=$('#chatIn'); sendMsg(id,i.value); i.value=''; i.focus(); };
  el.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>sendMsg(id,b.dataset.quick));
  el.dataset.for=id;
  renderChatMsgs();
}
function renderChatMsgs(){
  if(S.view!=='friends') return;
  const chat=$('#chat'); if(!chat) return;
  if(chat.dataset.for!==(S.chatWith||'')) return renderChatHeader();
  const box=$('#msgs'); if(!box) return;
  const id=S.chatWith, p=getP(id), c=convo(id);
  const atBottom = box.scrollHeight-box.scrollTop-box.clientHeight<60;
  box.innerHTML = (c.length?'':`<div class="msg sys">You matched with ${esc(p.name)} 🎶<br>You both like ${esc(match(S.me,p).sharedG.join(', ')||'good music')}. Say hi!</div>`)+
    c.map(m=>`<div class="msg ${m.from===S.myId?'me':'them'}" ${m.pending?'style="opacity:.6"':''}>${esc(m.text)}<span class="tm">${m.pending?'sending…':ago(m.ts)}</span></div>`).join('');
  if(atBottom || !box.dataset.init){ box.scrollTop=box.scrollHeight; box.dataset.init=1; }
  if(c.length){ S.lastRead[id]=c[c.length-1].ts; LS.set('lastRead',S.lastRead); }
  renderSide(); renderFriendList();
}
function afterFriends(){ renderFriendList(); renderChatHeader(); }
document.addEventListener('click',e=>{
  const o=e.target.closest('[data-open]'); if(o){ S.chatWith=o.dataset.open; renderFriendList(); renderChatHeader(); return; }
  const ch=e.target.closest('[data-challenge]'); if(ch){ challenge(ch.dataset.challenge); return; }
});

/* =================== games =================== */
const GAMES = [
  {id:'song',name:'Guess the Song',emoji:'🎧',c:['#1ed78a','#7b5cff'],desc:'Hear a real song clip and pick its name. Uses your favourite artists.',unit:'pts'},
  {id:'quiz',name:'Guess the Artist',emoji:'🎤',c:['#7b5cff','#ff5c8a'],desc:'See a song title, pick who sings it. Faster answers score more.',unit:'pts'},
  {id:'beat',name:'Beat Maker',emoji:'🎛️',c:['#ff9f43','#7a2d0c'],desc:'Build your own beat on a drum grid and save it to your profile.',unit:''},
  {id:'rhythm',name:'Rhythm Tap',emoji:'🥁',c:['#1ed78a','#3fb5ff'],desc:'Hit the falling notes on the beat with D F J K or by tapping.',unit:'pts'},
  {id:'memory',name:'Melody Memory',emoji:'🎹',c:['#3fb5ff','#1a2a6b'],desc:'Listen to the melody and play it back. It gets longer each round.',unit:'lvl'},
  {id:'bpm',name:'Tap the Tempo',emoji:'⏱️',c:['#ffcf3f','#c44b16'],desc:'Feel the beat, then tap along to guess its BPM.',unit:'pts'},
  {id:'ear',name:'Ear Test',emoji:'👂',c:['#e84cff','#2a0d4f'],desc:'Which note is higher? The gap gets smaller as you improve.',unit:'pts'},
  {id:'ttt',name:'Tic-Tac-Toe',emoji:'⭕',c:['#ff5c8a','#3a0f40'],desc:'Live head-to-head with an online friend, or play the computer.',unit:''},
];
const gameById = id => GAMES.find(g=>g.id===id);
function gameCard(g){ const b=sc(S.me,g.id); return `<div class="card gcard" data-game="${g.id}"><div class="cover" style="background:linear-gradient(135deg,${g.c[0]},${g.c[1]})">${g.emoji}</div><div style="font-weight:700;font-size:17px">${g.name}</div><div class="small muted" style="line-height:1.4">${g.desc}</div>${g.unit?`<div class="best">Your best: <b style="color:var(--text)">${b}</b> ${g.unit}</div>`:''}</div>`; }
function vGames(){ return `<h1>Games</h1><div class="sub">Music games to play solo or with friends. Best scores go on the leaderboard.</div><div id="stage" style="margin-top:22px"></div><div id="gamesBody"></div>`; }
function renderGamesBody(){
  const el=$('#gamesBody'); if(!el) return;
  const ranked=GAMES.filter(g=>g.unit);
  const g=S.lbGame, board=[S.me,...allProfiles()].filter(p=>p&&sc(p,g)>0).sort((a,b)=>sc(b,g)-sc(a,g)).slice(0,10);
  el.innerHTML=`<div class="grid g-grid">${GAMES.map(gameCard).join('')}</div>
    <h2>🏆 Leaderboards</h2><div class="card"><div class="chips" style="margin-bottom:12px">${ranked.map(x=>`<button class="chip btn ${g===x.id?'on':''}" data-lb="${x.id}">${x.emoji} ${x.name}</button>`).join('')}</div>
    <div class="lb">${board.length?board.map((p,i)=>`<div class="r ${p.id===S.myId?'me':''}"><span class="n">${['🥇','🥈','🥉'][i]||i+1}</span>${avatar(p,'sm')}<span>${esc(p.name)}${p.id===S.myId?' (you)':''}${p.demo?' <span class="tag">demo</span>':''}</span><b style="margin-left:auto">${sc(p,g)} ${gameById(g).unit}</b></div>`).join(''):'<div class="small muted">No scores yet. Be the first!</div>'}</div></div>`;
}
function afterGames(){ renderGamesBody(); renderStage(); }
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-game]'); if(g){ startGame(g.dataset.game); return; }
  const l=e.target.closest('[data-lb]'); if(l){ S.lbGame=l.dataset.lb; renderGamesBody(); return; }
});
let gameCleanup=null;
function stopGame(){ if(gameCleanup){ try{gameCleanup()}catch(e){} gameCleanup=null; } if(S.game && S.game.kind!=='ttt') S.game=null; }
function stageShell(g,inner){ return `<div class="stage" id="stageBox"><div class="stage-h"><span style="font-size:26px">${g.emoji}</span><b>${g.name}</b><button class="btns sm x" id="stageX">✕ Close</button></div>${inner}</div>`; }
function startGame(id,opts){
  if(S.view!=='games'){ S.view='games'; LS.set('view','games'); render(); }
  stopGame(); if(id!=='ttt' && S.game && S.game.kind==='ttt') S.game=null;
  Preview.stop();
  const fn={song:SongQuiz,quiz:Quiz,beat:BeatMaker,rhythm:Rhythm,memory:Memory,bpm:Tempo,ear:Ear,ttt:TTTMenu}[id];
  fn(opts||{});
  const box=$('#stageBox'); if(box) box.scrollIntoView({behavior:'smooth',block:'start'});
}
function bindClose(){ const x=$('#stageX'); if(x) x.onclick=()=>{ stopGame(); if(S.game&&S.game.kind==='ttt'){ if(gameRoom){ try{gameRoom.leave()}catch(e){} gameRoom=null; } S.game=null; } $('#stage').innerHTML=''; renderGamesBody(); }; }
function endScreen(g,score,detail,isBest,again){
  $('#stage').innerHTML=stageShell(g,`<div style="font-size:52px">${isBest?'🏆':g.emoji}</div><div class="qtitle">${score} ${g.unit}</div><div style="font-weight:700;color:${isBest?'var(--acc)':'var(--muted)'}">${isBest?'New personal best!':'Best: '+sc(S.me,g.id)+' '+g.unit}</div>
    <div class="muted small" style="margin-top:8px">${detail}</div><div class="row" style="justify-content:center;margin-top:18px"><button class="btnp" id="again">Play again</button><button class="btns" id="toLb">Leaderboard</button></div>`);
  bindClose(); $('#again').onclick=again; $('#toLb').onclick=()=>{ S.lbGame=g.id; $('#stage').innerHTML=''; renderGamesBody(); $('#gamesBody').scrollIntoView({behavior:'smooth'}); };
  renderGamesBody();
}

/* ---- Guess the Artist ---- */
function Quiz(){
  const g=gameById('quiz'); const N=10;
  const qs=shuffle(SONGS).slice(0,N).map(s=>({s,opts:shuffle([s.a,...shuffle(LIB.filter(a=>a.k!==s.k)).slice(0,3).map(a=>a.name)])}));
  let i=0,score=0,streak=0,right=0,timer=null,t0=0,locked=false;
  S.game={kind:'quiz'}; gameCleanup=()=>clearTimeout(timer);
  function show(){
    if(i>=N){ const best=setScore('quiz',score); return endScreen(g,score,`${right}/${N} correct`,best,()=>startGame('quiz')); }
    const q=qs[i]; locked=false; t0=performance.now();
    $('#stage').innerHTML=stageShell(g,`<div class="hud"><span>Question <b>${i+1}</b>/${N}</span><span>Score <b>${score}</b></span><span>Streak <b>${streak}🔥</b></span></div>
      <div class="small muted" style="margin-top:22px">Who sings…</div><div class="qtitle">“${esc(plainTitle(q.s.t))}”</div>
      <div class="tbar"><i id="qbar"></i></div>
      <div class="opts">${q.opts.map(o=>`<button class="opt" data-ans="${esc(o)}">${esc(o)}</button>`).join('')}</div><div id="qfb" class="small" style="margin-top:14px;min-height:28px"></div>`);
    bindClose();
    const bar=$('#qbar'); requestAnimationFrame(()=>{ bar.style.transition='width 10s linear'; bar.style.width='0%'; });
    document.querySelectorAll('[data-ans]').forEach(b=>b.onclick=()=>answer(b.dataset.ans));
    clearTimeout(timer); timer=setTimeout(()=>answer(null),10000);
  }
  function answer(a){
    if(locked) return; locked=true; clearTimeout(timer);
    const q=qs[i], ok=a===q.s.a, ctx=Music.sfx(), t=ctx.currentTime;
    if(ok){ streak++; right++; const pts=Math.round(400+600*Math.max(0,1-(performance.now()-t0)/10000))+(streak>=3?150:0); score+=pts; Music.tone(76,t,.12,'triangle',.15); Music.tone(83,t+.1,.2,'triangle',.15); }
    else { streak=0; Music.tone(52,t,.3,'sawtooth',.08,800); }
    document.querySelectorAll('[data-ans]').forEach(b=>{ b.disabled=true; if(b.dataset.ans===q.s.a) b.classList.add('right'); else if(b.dataset.ans===a) b.classList.add('wrong'); });
    const bar=$('#qbar'); if(bar){ bar.style.transition='none'; }
    $('#qfb').innerHTML=`${ok?'✅ Correct!':a?'❌ Not quite.':'⏰ Time\'s up!'} <a class="lnk sp" href="${spUrl(q.s)}" target="_blank" rel="noopener" style="margin-left:8px">${IC.sp}<span>Listen</span></a>`;
    timer=setTimeout(()=>{ i++; show(); },1500);
  }
  show();
}

/* ---- Guess the Song (real 30-sec previews) ---- */
function SongQuiz(){
  const g=gameById('song'); Music.pause();
  let alive=true, timer=null, au=null;
  S.game={kind:'song'};
  gameCleanup=()=>{ alive=false; clearTimeout(timer); if(au){ au.pause(); au.src=''; } };
  $('#stage').innerHTML=stageShell(g,`<div class="spin" style="margin:20px auto"></div><div class="muted">Loading songs from your favourite artists…</div>`); bindClose();
  const picks=shuffle(recArtists(S.me).slice(0,6)).slice(0,4);
  Promise.all(picks.map(a=>loadArtist(a.k))).then(lists=>{
    if(!alive) return;
    const pool=lists.flat().filter(s=>s&&s.p);
    if(pool.length<8){ $('#stage').innerHTML=stageShell(g,`<div style="font-size:40px">📡</div><div class="qtitle" style="font-size:22px">Song clips aren't available right now</div><div class="muted">This game needs the music service. Try again in a minute, or play Guess the Artist instead.</div><button class="btnp" style="margin-top:16px" id="toQuiz">Play Guess the Artist</button>`); bindClose(); $('#toQuiz').onclick=()=>startGame('quiz'); return; }
    const N=8; const qs=shuffle(pool).slice(0,N).map(s=>({s,opts:shuffle([s,...shuffle(pool.filter(x=>x.id!==s.id&&norm(x.t)!==norm(s.t))).slice(0,3)])}));
    let i=0,score=0,streak=0,right=0,t0=0,locked=false;
    function show(){
      if(!alive) return;
      if(i>=N){ if(au) au.pause(); const best=setScore('song',score); return endScreen(g,score,`${right}/${N} songs recognised`,best,()=>startGame('song')); }
      const q=qs[i]; locked=false;
      $('#stage').innerHTML=stageShell(g,`<div class="hud"><span>Song <b>${i+1}</b>/${N}</span><span>Score <b>${score}</b></span><span>Streak <b>${streak}🔥</b></span></div>
        <div class="disc" id="disc">🎵</div><div class="small muted">Listen… which song is this?</div>
        <div class="tbar"><i id="qbar"></i></div>
        <div class="opts">${q.opts.map(o=>`<button class="opt" data-ans="${esc(o.id)}">${esc(plainTitle(o.t))}<div class="small muted" style="font-weight:400">${esc(o.a)}</div></button>`).join('')}</div><div id="qfb" class="small" style="margin-top:14px;min-height:30px"></div>`);
      bindClose();
      if(au) au.pause(); au=new Audio(q.s.p); au.volume=Music.vol; au.play().catch(()=>{});
      t0=performance.now();
      const bar=$('#qbar'); requestAnimationFrame(()=>{ bar.style.transition='width 15s linear'; bar.style.width='0%'; });
      document.querySelectorAll('[data-ans]').forEach(b=>b.onclick=()=>answer(b.dataset.ans));
      clearTimeout(timer); timer=setTimeout(()=>answer(null),15000);
    }
    function answer(id){
      if(locked||!alive) return; locked=true; clearTimeout(timer);
      const q=qs[i], ok=id===q.s.id;
      if(ok){ streak++; right++; score+=Math.round(400+600*Math.max(0,1-(performance.now()-t0)/15000))+(streak>=3?150:0); } else streak=0;
      document.querySelectorAll('[data-ans]').forEach(b=>{ b.disabled=true; if(b.dataset.ans===q.s.id) b.classList.add('right'); else if(b.dataset.ans===id) b.classList.add('wrong'); });
      const bar=$('#qbar'); if(bar) bar.style.transition='none';
      const d=$('#disc'); if(d && q.s.img) d.innerHTML=`<img src="${esc(q.s.img)}" alt="">`;
      SONG_REG[q.s.id]=q.s;
      $('#qfb').innerHTML=`${ok?'✅ Correct!':id?'❌ Not quite.':'⏰ Time\'s up!'} It's <b>${esc(q.s.t)}</b> by ${esc(q.s.a)} <button class="heart ${isLiked(q.s.id)?'on':''}" data-heart="${esc(q.s.id)}" style="display:inline-grid;vertical-align:middle">${isLiked(q.s.id)?'♥':'♡'}</button><br><button class="btnp sm" id="nextQ" style="margin-top:10px">${i+1<N?'Next song →':'See results'}</button>`;
      $('#nextQ').onclick=()=>{ i++; show(); };
    }
    show();
  });
}

/* ---- Melody Memory ---- */
function Memory(){
  const g=gameById('memory'); Music.pause();
  const PADS=[{c:'#1ed78a',n:60},{c:'#3fb5ff',n:64},{c:'#ff5c8a',n:67},{c:'#ffb547',n:72}];
  let seq=[],pos=0,state='idle',alive=true,tmo=[];
  S.game={kind:'memory'}; gameCleanup=()=>{ alive=false; tmo.forEach(clearTimeout); };
  $('#stage').innerHTML=stageShell(g,`<div class="hud"><span>Level <b id="mlv">0</b></span><span id="mst">Get ready…</span></div>
    <div class="pads">${PADS.map((p,i)=>`<button class="pad" data-pad="${i}" style="background:${p.c};color:${p.c}"></button>`).join('')}</div><div class="small muted">Keys 1 2 3 4 work too.</div>`);
  bindClose();
  function flash(i,dur=300){ const el=document.querySelector(`[data-pad="${i}"]`); if(!el) return; const ctx=Music.sfx(); Music.tone(PADS[i].n,ctx.currentTime,dur/1000+.1,'triangle',.25,4000); el.classList.add('lit'); tmo.push(setTimeout(()=>el.classList.remove('lit'),dur)); }
  async function playSeq(){
    state='show'; $('#mst').textContent='Listen…'; $('#mlv').textContent=seq.length;
    const gap=Math.max(260,600-seq.length*25);
    await sleep(600);
    for(const i of seq){ if(!alive) return; flash(i,gap*.7); await sleep(gap); }
    if(!alive) return; state='input'; pos=0; $('#mst').textContent='Your turn!';
  }
  function nextRound(){ seq.push(Math.floor(Math.random()*4)); playSeq(); }
  function press(i){
    if(state!=='input') return; flash(i,200);
    if(i!==seq[pos]){ state='over'; const lvl=seq.length-1; const ctx=Music.sfx(); Music.tone(45,ctx.currentTime+.15,.5,'sawtooth',.1,700); const best=setScore('memory',lvl); tmo.push(setTimeout(()=>{ if(alive) endScreen(g,lvl,`You remembered a melody of ${lvl} notes.`,best,()=>startGame('memory')); },700)); return; }
    pos++; if(pos===seq.length){ state='wait'; $('#mst').textContent='Nice! 🎉'; tmo.push(setTimeout(nextRound,700)); }
  }
  document.querySelectorAll('[data-pad]').forEach(b=>b.onpointerdown=()=>press(+b.dataset.pad));
  const kh=e=>{ const k='1234'.indexOf(e.key); if(k>=0) press(k); }; document.addEventListener('keydown',kh);
  const prevC=gameCleanup; gameCleanup=()=>{ prevC(); document.removeEventListener('keydown',kh); };
  nextRound();
}

/* ---- Tap the Tempo ---- */
function Tempo(){
  const g=gameById('bpm'); Music.pause();
  const R=5; let round=0,total=0,taps=[],bpm=0,state='idle',alive=true,tmo=[],results=[];
  S.game={kind:'bpm'};
  function shell(inner){ $('#stage').innerHTML=stageShell(g,inner); bindClose(); }
  function startRound(){
    if(round>=R){ const best=setScore('bpm',total); return endScreen(g,total,results.map((r,i)=>`R${i+1}: ${r.g} vs ${r.b}`).join(' · '),best,()=>startGame('bpm')); }
    bpm=70+Math.floor(Math.random()*81); taps=[]; state='listen';
    shell(`<div class="hud"><span>Round <b>${round+1}</b>/${R}</span><span>Score <b>${total}</b></span></div><div class="qtitle" style="margin-top:24px">🎧 Listen to the beat…</div><div class="small muted">Feel the tempo. It will stop, then you tap.</div><div class="tapbtn" style="opacity:.35">LISTEN</div>`);
    const ctx=Music.sfx(), beat=60/bpm, t0=ctx.currentTime+.2;
    for(let k=0;k<8;k++){ Music.kick(t0+k*beat,.9); Music.hat(t0+k*beat+beat/2,.08); if(k%2===1) Music.snare(t0+k*beat,.35); }
    tmo.push(setTimeout(()=>{ if(!alive) return; state='tap'; shell(`<div class="hud"><span>Round <b>${round+1}</b>/${R}</span><span>Score <b>${total}</b></span></div><div class="qtitle" style="margin-top:24px">Now tap the beat!</div><div class="small muted">Tap 8 times (or press Space) at the same speed.</div><button class="tapbtn" id="tapB">TAP<br><span id="tapN" style="font-size:14px">0/8</span></button>`); $('#tapB').onpointerdown=tap; },(8*beat+.6)*1000));
  }
  function tap(){
    if(state!=='tap') return; const now=performance.now(); taps.push(now); const ctx=Music.sfx(); Music.kick(ctx.currentTime,.5);
    const b=$('#tapB'); if(b){ b.classList.add('hit'); setTimeout(()=>b.classList.remove('hit'),80); } $('#tapN').textContent=taps.length+'/8';
    if(taps.length>=8){ state='res'; const iv=taps.slice(1).map((t,i)=>t-taps[i]).sort((a,b)=>a-b); const med=iv[Math.floor(iv.length/2)]; const guess=Math.round(60000/med); const diff=Math.abs(guess-bpm); const pts=Math.max(0,1000-diff*45); total+=pts; results.push({g:guess,b:bpm});
      shell(`<div class="hud"><span>Round <b>${round+1}</b>/${R}</span><span>Score <b>${total}</b></span></div><div style="font-size:46px;margin-top:16px">${diff<=3?'🎯':diff<=8?'👍':'😅'}</div><div class="qtitle">You tapped ${guess} BPM</div><div class="muted">The beat was <b style="color:var(--text)">${bpm} BPM</b> · +${pts} points</div><button class="btnp" id="nxt" style="margin-top:18px">${round+1<R?'Next round →':'See results'}</button>`);
      $('#nxt').onclick=()=>{ round++; startRound(); }; }
  }
  const kh=e=>{ if(e.code==='Space' && state==='tap'){ e.preventDefault(); tap(); } }; document.addEventListener('keydown',kh);
  gameCleanup=()=>{ alive=false; tmo.forEach(clearTimeout); document.removeEventListener('keydown',kh); };
  startRound();
}

/* ---- Ear Test ---- */
function Ear(){
  const g=gameById('ear'); Music.pause();
  let lives=3,score=0,streak=0,interval=7,a=0,b=0,state='idle',n=0,alive=true,tmo=[];
  S.game={kind:'ear'}; gameCleanup=()=>{ alive=false; tmo.forEach(clearTimeout); };
  function round(){
    if(lives<=0){ const best=setScore('ear',score); return endScreen(g,score,`${n-3+lives} correct · smallest gap ${interval} semitone${interval>1?'s':''}`,best,()=>startGame('ear')); }
    n++; a=55+Math.floor(Math.random()*14); b=a+(Math.random()<.5?interval:-interval); state='play';
    $('#stage').innerHTML=stageShell(g,`<div class="hud"><span>Lives <b>${'❤️'.repeat(lives)}${'🖤'.repeat(3-lives)}</b></span><span>Score <b>${score}</b></span><span>Gap <b>${interval}</b> st</span></div>
      <div class="qtitle" style="margin-top:24px">Which note is higher?</div><div class="small muted">Two notes play. Choose the higher one.</div>
      <div class="opts"><button class="opt" data-e="1">1st note</button><button class="opt" data-e="2">2nd note</button></div><button class="btns sm" id="rep" style="margin-top:14px">🔁 Replay</button><div id="efb" style="margin-top:12px;min-height:24px"></div>`);
    bindClose(); document.querySelectorAll('[data-e]').forEach(x=>x.onclick=()=>pick(+x.dataset.e)); $('#rep').onclick=playPair; playPair();
  }
  function playPair(){ const ctx=Music.sfx(), t=ctx.currentTime+.1; Music.tone(a,t,.6,'triangle',.25,4000); Music.tone(b,t+.75,.6,'triangle',.25,4000); }
  function pick(w){
    if(state!=='play') return; state='res'; const right=(b>a)?2:1, ok=w===right;
    if(ok){ streak++; score+=100*(8-interval); if(streak%2===0) interval=Math.max(1,interval-1); } else { lives--; streak=0; interval=Math.min(7,interval+1); }
    document.querySelectorAll('[data-e]').forEach(x=>{ x.disabled=true; if(+x.dataset.e===right) x.classList.add('right'); else if(+x.dataset.e===w) x.classList.add('wrong'); });
    $('#efb').textContent=ok?'✅ Nice ear!':'❌ That was the other one.';
    tmo.push(setTimeout(()=>{ if(alive) round(); },1100));
  }
  round();
}

/* ---- Beat Maker ---- */
const BM_ROWS=[{n:'Kick',c:'#ff5c8a'},{n:'Snare',c:'#ffb547'},{n:'Clap',c:'#ffd84a'},{n:'Hi-hat',c:'#3fb5ff'},{n:'Bass',c:'#7b5cff'},{n:'Chord',c:'#1ed78a'}];
const BM_PRESETS={
  'Boom bap':{bpm:90,rows:['x......xx.x.....','....x.......x...','................','x.x.x.x.x.xxx.x.','x......x..x.....','x...............']},
  'House':{bpm:124,rows:['x...x...x...x...','................','....x.......x...','..x...x...x...x.','x.x.x.x.x.x.x.x.','..x.....x.x.....']},
  'Trap':{bpm:140,rows:['x.......x..x....','........x.......','........x.......','xxxxxxx.xxxxxxxx','x.......x..x....','................']},
  'Bhangra':{bpm:100,rows:['x..x..x.x..x..x.','....x.......x...','..x...x...x...x.','x.x.x.x.x.x.x.x.','x.....x.x.......','x.......x.......']},
  'Reggaeton':{bpm:96,rows:['x...x...x...x...','...x..x....x..x.','................','x.x.x.x.x.x.x.x.','x.....x.x.......','................']},
};
function BeatMaker(opts){
  const g=gameById('beat'); Music.pause();
  const src=opts.beat || (S.me.beat) || BM_PRESETS['Boom bap'];
  let grid=BM_ROWS.map((_,r)=>Array.from({length:16},(_,i)=>((src.rows||[])[r]||'')[i]==='x'));
  let bpm=src.bpm||90, playing=false, timer=null, step=0, nextT=0, uiT=[];
  S.game={kind:'beat'};
  $('#stage').innerHTML=stageShell(g,`${opts.owner?`<div class="banner info" style="text-align:left">Playing <b>${esc(opts.owner)}</b>'s beat. Remix it and save it as yours!</div>`:''}
    <div class="bm-ctl"><button class="btnp" id="bmPlay">▶ Play</button><label class="small muted">Tempo <b id="bmBpmL" style="color:var(--text)">${bpm}</b> BPM</label><input type="range" id="bmBpm" min="60" max="170" value="${bpm}" style="width:150px">
      <select class="inp" id="bmPre" style="width:auto;padding:8px 12px"><option value="">Presets…</option>${Object.keys(BM_PRESETS).map(k=>`<option>${k}</option>`).join('')}</select>
      <button class="btns sm" id="bmClr">Clear</button><button class="btnp sm" id="bmSave">💾 Save to my profile</button></div>
    <div style="overflow-x:auto"><div class="seq" id="seq">${BM_ROWS.map((row,r)=>`<div class="lab" style="color:${row.c}">${row.n}</div>`+Array.from({length:16},(_,i)=>`<button class="cell ${i%4===0?'beat':''} ${grid[r][i]?'on':''}" data-r="${r}" data-i="${i}" style="--c:${row.c}"></button>`).join('')).join('')}</div></div>
    <div class="small muted">Tap squares to add sounds. Saved beats show on your profile and match card, so friends can play them.</div>`);
  bindClose();
  const seqEl=$('#seq');
  seqEl.onclick=e=>{ const c=e.target.closest('.cell'); if(!c) return; const r=+c.dataset.r,i=+c.dataset.i; grid[r][i]=!grid[r][i]; c.classList.toggle('on',grid[r][i]); if(grid[r][i]){ const ctx=Music.sfx(); hit(r,ctx.currentTime); } };
  function hit(r,t){ if(r===0) Music.kick(t,1); else if(r===1) Music.snare(t,.45); else if(r===2) Music.clap(t,.5); else if(r===3) Music.hat(t,.12); else if(r===4) Music.tone(45,t,.25,'sawtooth',.3,500); else if(r===5) [57,60,64].forEach(n=>Music.tone(n,t,.3,'sawtooth',.06,1800)); }
  function tick(){ const ctx=Music.sfx(), sd=60/bpm/4; while(nextT<ctx.currentTime+.12){ const s=step%16; for(let r=0;r<6;r++) if(grid[r][s]) hit(r,nextT); const d=(nextT-ctx.currentTime)*1000; uiT.push(setTimeout(()=>{ seqEl.querySelectorAll('.now').forEach(x=>x.classList.remove('now')); seqEl.querySelectorAll(`[data-i="${s}"]`).forEach(x=>x.classList.add('now')); },Math.max(0,d))); if(uiT.length>64) uiT.splice(0,32); nextT+=sd; step++; } }
  function stop(){ playing=false; clearInterval(timer); uiT.forEach(clearTimeout); uiT=[]; seqEl.querySelectorAll('.now').forEach(x=>x.classList.remove('now')); const b=$('#bmPlay'); if(b) b.textContent='▶ Play'; }
  $('#bmPlay').onclick=()=>{ if(playing) return stop(); const ctx=Music.sfx(); playing=true; step=0; nextT=ctx.currentTime+.05; timer=setInterval(tick,25); $('#bmPlay').textContent='■ Stop'; };
  $('#bmBpm').oninput=e=>{ bpm=+e.target.value; $('#bmBpmL').textContent=bpm; };
  $('#bmPre').onchange=e=>{ const p=BM_PRESETS[e.target.value]; if(!p) return; bpm=p.bpm; $('#bmBpm').value=bpm; $('#bmBpmL').textContent=bpm; grid=BM_ROWS.map((_,r)=>Array.from({length:16},(_,i)=>p.rows[r][i]==='x')); seqEl.querySelectorAll('.cell').forEach(c=>c.classList.toggle('on',grid[+c.dataset.r][+c.dataset.i])); e.target.value=''; };
  $('#bmClr').onclick=()=>{ grid=grid.map(r=>r.map(()=>false)); seqEl.querySelectorAll('.cell').forEach(c=>c.classList.remove('on')); };
  $('#bmSave').onclick=()=>{ S.me.beat={bpm,rows:grid.map(r=>r.map(v=>v?'x':'.').join(''))}; saveMe(true); toast('🥁 Beat saved to your profile! Friends can play it from your match card.'); };
  gameCleanup=stop;
}

/* ---- Rhythm Tap ---- */
function Rhythm(){
  const g=gameById('rhythm'); Music.pause();
  let cv,cx,notes=[],t0=0,end=0,score=0,combo=0,best=0,raf,judge='',jt=0,flash=[0,0,0,0],ctx,hits={p:0,g:0,m:0},alive=true;
  const LANES=['D','F','J','K'], COLS=['#1ed78a','#3fb5ff','#ff5c8a','#ffb547'], BPM=112;
  S.game={kind:'rhythm'};
  $('#stage').innerHTML=stageShell(g,`<canvas class="rh" id="rh" width="440" height="480"></canvas><div class="small muted">Press D F J K or tap a lane when a note reaches the line.</div>`);
  bindClose();
  ctx=Music.sfx(); cv=$('#rh'); cx=cv.getContext('2d');
  cv.onpointerdown=e=>{ const r=cv.getBoundingClientRect(); hit(Math.min(3,Math.floor((e.clientX-r.left)/r.width*4))); };
  const beat=60/BPM; t0=ctx.currentTime+2.2;
  const r=rng(Date.now()); const total=Math.floor(30/beat);
  for(let k=0;k<total*2;k++){ const prog=k/(total*2); const d=k%2===0?.55+prog*.35:.12+prog*.35; if(r()<d) notes.push({t:t0+k*beat/2,lane:Math.floor(r()*4),done:false}); }
  for(let k=-4;k<total;k++){ const t=t0+k*beat; Music.kick(t,k<0?.6:.9); Music.hat(t+beat/2,.08); if(k>=0&&k%2===1) Music.snare(t,.3); }
  end=t0+total*beat+1;
  const kh=e=>{ const i=LANES.indexOf(e.key.toUpperCase()); if(i>=0){ e.preventDefault(); hit(i); } };
  document.addEventListener('keydown',kh);
  gameCleanup=()=>{ alive=false; cancelAnimationFrame(raf); document.removeEventListener('keydown',kh); };
  function hit(l){
    const now=ctx.currentTime; flash[l]=now;
    let bestN=null, bd=1; notes.forEach(n=>{ if(!n.done&&n.lane===l){ const d=Math.abs(n.t-now); if(d<bd){bd=d;bestN=n;} } });
    if(bestN && bd<.13){ bestN.done=true; combo++; best=Math.max(best,combo); const pts=bd<.05?300:100; score+=pts*(1+Math.floor(combo/10)*.5)|0; judge=bd<.05?'PERFECT':'GOOD'; hits[bd<.05?'p':'g']++; Music.tone(72+[0,3,7,10][l],now,.15,'triangle',.12,4000); }
    else { combo=0; judge='MISS'; }
    jt=now;
  }
  function loop(){
    if(!alive) return;
    const now=ctx.currentTime, W=cv.width, H=cv.height, lw=W/4, hy=H-70, speed=320;
    cx.clearRect(0,0,W,H);
    for(let i=0;i<4;i++){ cx.fillStyle=i%2?'#0c0c12':'#0f0f17'; cx.fillRect(i*lw,0,lw,H); const f=Math.max(0,1-(now-flash[i])*5); if(f>0){ cx.fillStyle=COLS[i]+Math.floor(f*60).toString(16).padStart(2,'0'); cx.fillRect(i*lw,0,lw,H);} }
    cx.fillStyle='#ffffff30'; cx.fillRect(0,hy-2,W,4);
    notes.forEach(n=>{ if(!n.done && now>n.t+.15){ n.done=true; combo=0; hits.m++; judge='MISS'; jt=now; } if(n.done) return; const y=hy-(n.t-now)*speed; if(y<-30||y>H+30) return;
      cx.fillStyle=COLS[n.lane]; cx.beginPath(); if(cx.roundRect) cx.roundRect(n.lane*lw+10,y-11,lw-20,22,11); else cx.rect(n.lane*lw+10,y-11,lw-20,22); cx.fill(); });
    cx.font='600 15px Outfit, sans-serif'; LANES.forEach((k,i)=>{ cx.fillStyle='#ffffff70'; cx.textAlign='center'; cx.fillText(k,i*lw+lw/2,H-30); });
    cx.textAlign='left'; cx.fillStyle='#fff'; cx.font='800 26px Outfit, sans-serif'; cx.fillText(score,16,38);
    cx.font='500 13px Outfit, sans-serif'; cx.fillStyle='#9a9aab'; cx.fillText('combo '+combo,16,58);
    if(now<t0){ cx.textAlign='center'; cx.fillStyle='#fff'; cx.font='800 60px Outfit, sans-serif'; cx.fillText(Math.ceil(t0-now),W/2,H/2); }
    if(now-jt<.5 && judge){ cx.textAlign='center'; cx.font='800 24px Outfit, sans-serif'; cx.fillStyle=judge==='PERFECT'?'#1ed78a':judge==='GOOD'?'#3fb5ff':'#ff5c8a'; cx.fillText(judge,W/2,hy-60); }
    if(now>end){ gameCleanup(); gameCleanup=null; const b=setScore('rhythm',score); return endScreen(g,score,`Perfect ${hits.p} · Good ${hits.g} · Miss ${hits.m} · Best combo ${best}`,b,()=>startGame('rhythm')); }
    raf=requestAnimationFrame(loop);
  }
  loop();
}

/* ---- Tic-Tac-Toe ---- */
function TTTMenu(){
  const g=gameById('ttt'); const friends=allProfiles().filter(p=>isFriend(p.id));
  S.game=null;
  $('#stage').innerHTML=stageShell(g,`<div class="small muted" style="margin-bottom:14px">Challenge a friend who has Tunemate open right now, or warm up against the computer.</div>
    <div class="row" style="justify-content:center;flex-wrap:wrap;gap:10px"><select class="inp" id="tttFriend" style="width:auto;min-width:200px"><option value="">Choose a friend…</option>${friends.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}${p.demo?' (demo)':S.online[p.id]?' · online 🟢':' · offline'}</option>`).join('')}</select>
    <button class="btnp" id="tttGo">Challenge</button><button class="btns" id="tttCpu">Play vs computer</button></div>
    ${friends.length?'':'<div class="small muted" style="margin-top:12px">No friends yet. Connect with people on Discover to challenge them.</div>'}`);
  bindClose();
  $('#tttGo').onclick=()=>{ const id=$('#tttFriend').value; if(!id) return toast('Pick a friend first.'); challenge(id); };
  $('#tttCpu').onclick=()=>startCpu();
}
function challenge(id){
  const p=getP(id);
  if(S.view!=='games'){ S.view='games'; LS.set('view','games'); render(); }
  stopGame();
  if(id.startsWith('demo_')){ startCpu(p); return; }
  if(!room){ toast('Live games need a connection. Try the computer instead.'); return; }
  if(!S.online[id]){ toast(`${esc(p.name)} isn't online right now. They need to have Tunemate open.`); return; }
  const key=pairKey(S.myId,id)+'-'+Date.now().toString(36);
  S.game={kind:'ttt',pending:key,opp:id}; room.emit('invite',{kind:'ask',from:S.myId,to:id,key});
  renderStage();
  setTimeout(()=>{ if(S.game&&S.game.pending===key){ S.game=null; toast(`${esc(p.name)} didn't answer.`); renderStage(); } },20000);
}
const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function winner(b){ for(const l of LINES){ const [a,c,d]=l; if(b[a]!=='.'&&b[a]===b[c]&&b[a]===b[d]) return {w:b[a],l}; } return b.includes('.')?null:{w:'draw',l:[]}; }
function startCpu(opp){ S.game={kind:'ttt',cpu:true,oppP:opp||{emoji:'🤖',color:1,name:'Computer'},b:'.........',turn:'x',me:'x',n:0}; renderStage(); }
function cpuMove(){
  const g=S.game; if(!g||!g.cpu) return; const b=g.b.split('');
  function mm(b,pl){ const w=winner(b.join('')); if(w) return {s:w.w==='o'?10:w.w==='x'?-10:0}; let best={s:pl==='o'?-99:99}; b.forEach((c,i)=>{ if(c!=='.')return; b[i]=pl; const r=mm(b,pl==='o'?'x':'o'); b[i]='.'; if(pl==='o'?r.s>best.s:r.s<best.s) best={s:r.s,i}; }); return best; }
  let i; if(Math.random()<.25){ const free=b.map((c,i)=>c==='.'?i:-1).filter(i=>i>=0); i=free[Math.floor(Math.random()*free.length)]; } else i=mm(b,'o').i;
  b[i]='o'; g.b=b.join(''); g.turn='x'; g.n++; renderStage();
}
function startOnline(key,opp,iAmX){
  if(gameRoom){ try{gameRoom.leave()}catch(e){} gameRoom=null; }
  S.game={kind:'ttt',online:true,key,opp,me:iAmX?'x':'o',b:'.........',turn:'x',n:0};
  try{
    gameRoom=room.join('ttt-'+key);
    gameRoom.on('move',raw=>{ const d=unwrap(raw); const g=S.game; if(!g||!g.online||!d||d.key!==g.key) return; if(typeof d.b!=='string'||!/^[.xo]{9}$/.test(d.b)||!/^[xo]$/.test(d.turn)) return; if(d.n>g.n){ g.b=d.b; g.turn=d.turn; g.n=d.n; renderStage(); } });
    gameRoom.on('hello',()=>{ const g=S.game; if(g&&g.online) emitState(); });
    gameRoom.emit('hello',{key});
  }catch(e){ toast('Could not start the live game.'); S.game=null; }
  renderStage();
}
function emitState(){ const g=S.game; if(!gameRoom||!g) return; try{ gameRoom.emit('move',{key:g.key,b:g.b,turn:g.turn,n:g.n}); }catch(e){} }
setInterval(()=>{ const g=S.game; if(g&&g.kind==='ttt'&&g.online&&!winner(g.b)) emitState(); },4000);
function renderStage(){
  const el=$('#stage'); if(!el) return; const g=S.game; const meta=gameById('ttt');
  if(!g || g.kind!=='ttt') return;
  if(g.pending){ el.innerHTML=stageShell(meta,`<div class="spin" style="margin:10px auto"></div>Waiting for ${esc(getP(g.opp).name)} to accept…`); bindClose(); return; }
  const opp=g.cpu?g.oppP:getP(g.opp), w=winner(g.b), myTurn=g.turn===g.me && !w;
  const status = w ? (w.w==='draw'?"It's a draw 🤝": w.w===g.me?'You win! 🎉':`${esc(opp.name)} wins`) : myTurn?'Your move':`${esc(opp.name)} is thinking…`;
  el.innerHTML=stageShell(meta,`<div class="row" style="justify-content:center;gap:14px;flex-wrap:wrap">${avatar(S.me,'sm')}<b style="color:${g.me==='x'?'var(--acc)':'var(--pink)'}">You (${g.me.toUpperCase()})</b><span class="muted">vs</span><b style="color:${g.me==='x'?'var(--pink)':'var(--acc)'}">${esc(opp.name)} (${g.me==='x'?'O':'X'})</b>${avatar(opp,'sm')}</div>
    <div class="ttt">${g.b.split('').map((c,i)=>`<button data-cell="${i}" class="${c==='.'?'':c} ${w&&w.l.includes(i)?'win':''}" ${!myTurn||c!=='.'?'disabled':''}>${c==='.'?'':c.toUpperCase()}</button>`).join('')}</div>
    <div style="font-weight:700;font-size:18px">${status}</div>
    <div class="row" style="justify-content:center;margin-top:14px">${w?(g.cpu||g.me==='x'?`<button class="btnp" id="again">${g.cpu?'Play again':'Rematch'}</button>`:''):''}</div>`);
  bindClose();
  el.querySelectorAll('[data-cell]').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.cell; if(g.b[i]!=='.'||g.turn!==g.me||winner(g.b)) return;
    g.b=g.b.slice(0,i)+g.me+g.b.slice(i+1); g.turn=g.me==='x'?'o':'x'; g.n++;
    const ctx=Music.sfx(); Music.tone(g.me==='x'?72:67,ctx.currentTime,.12,'triangle',.12);
    renderStage();
    if(g.cpu){ if(!winner(g.b)) setTimeout(cpuMove,450); } else emitState();
  });
  const a=$('#again'); if(a) a.onclick=()=>{ if(g.cpu) startCpu(g.oppP.demo?g.oppP:null); else { g.b='.........'; g.turn='x'; g.n++; renderStage(); emitState(); } };
}

/* =================== profile =================== */
function vProfile(){
  const p=S.me;
  if(!S.editing){
    const st=recStations(p)[0], liked=(p.liked||[]).map(x=>typeof x==='string'?songById(x):x).filter(Boolean).slice(-5).reverse();
    const blocked=[...S.blocks].map(id=>S.profiles[id]).filter(Boolean);
    return `<div class="hero-prof">${avatar(p,'lg')}<div><div class="small muted" style="font-weight:600;letter-spacing:.5px">PROFILE</div><h1 style="font-size:44px">${esc(p.name)}</h1><div class="sub">${allProfiles().filter(x=>isFriend(x.id)).length} friends · ${likedIds(p).length} liked songs</div></div></div>
    ${p.bio?`<p class="quote" style="margin-top:18px;font-size:15px">“${esc(p.bio)}”</p>`:''}
    <div class="row" style="margin-top:16px;gap:8px;flex-wrap:wrap">${socials(p)||'<span class="small muted">No socials linked yet. Add them so matches can follow you.</span>'}${p.beat?'<button class="social" data-beat="'+esc(S.myId)+'">🥁 My beat</button>':''}<button class="btns" id="edit" style="margin-left:auto">✏️ Edit profile</button></div>
    <div class="two" style="margin-top:24px"><div class="card"><div style="font-weight:700;margin-bottom:14px">Your taste DNA</div><div class="dna">${dna(p).map(([l,v,d])=>`<div><div class="lbl"><span>${l}</span><span>${esc(d)}</span></div><div class="bar"><i style="width:${v}%"></i></div></div>`).join('')}</div></div>
    <div class="card"><div style="font-weight:700;margin-bottom:12px">Your sound</div><div class="chips">${(p.genres||[]).map(g=>`<span class="chip hl">${esc(g)}</span>`).join('')}</div>
    <div class="small muted" style="margin:14px 0 6px">Top artists</div><div>${(p.artists||[]).map(esc).join(' · ')||'—'}</div>
    <div class="small muted" style="margin:14px 0 6px">On repeat</div><div>${esc(p.anthem||'—')}</div>
    <div class="small muted" style="margin:14px 0 6px">Your station</div><button class="social" data-play="${st.id}">${st.emoji} ${esc(st.name)}</button></div></div>
    <h2>Recently liked <button class="more" data-pl="liked">See all</button></h2><div class="card" style="padding:8px">${liked.length?trackList('recent',liked,true):'<div class="small muted" style="padding:12px">No liked songs yet. <a href="#" data-go="library">Browse the library</a>.</div>'}</div>
    <h2>Game scores</h2><div class="scores">${GAMES.filter(g=>g.unit).map(g=>`<div><span>${g.emoji} ${g.name}</span><b>${sc(p,g.id)} <small class="muted" style="font-size:12px">${g.unit}</small></b></div>`).join('')}</div>
    <h2>Account</h2><div class="card"><div class="small muted" style="line-height:1.5">${isCloud()?`Signed in as <b style="color:var(--text)">${esc((S.session&&S.session.user.email)||'')}</b>. Your profile, liked songs and scores are visible to other Tunemate users. Your email and messages are private.`:'Demo mode: your profile is saved in this browser only.'}</div>
    ${blocked.length?`<div style="margin-top:14px"><div class="small muted" style="margin-bottom:6px">Blocked people</div>${blocked.map(b=>`<div class="row" style="padding:6px 0">${avatar(b,'sm')}<span>${esc(b.name)}</span><button class="btns sm" data-unblock="${esc(b.id)}" style="margin-left:auto">Unblock</button></div>`).join('')}</div>`:''}
    <div class="row" style="margin-top:14px;flex-wrap:wrap">${isCloud()?'<button class="btns" id="signOut">Sign out</button>':''}${S.confirmDel?`<span class="small">Delete your profile, connections and messages? This can't be undone.</span><button class="btns danger" id="delYes">Yes, delete</button><button class="btns" id="delNo">Cancel</button>`:`<button class="btns danger" id="delP">Delete my profile</button>`}</div></div>`;
  }
  const chip=(list,sel,attr)=>list.map(x=>`<button type="button" class="chip btn ${sel.includes(x)?'on':''}" data-${attr}="${esc(x)}">${esc(x)}</button>`).join('');
  return `<h1>Edit your profile</h1><div class="sub">Update how you show up to your matches.</div>
  <form class="form card" id="pform" style="margin-top:22px;padding:24px">
    <div class="two"><div class="field"><label>Display name</label><input class="inp" name="name" maxlength="30" required value="${esc(p.name)}"></div>
      <div class="field"><label>Song on repeat</label><input class="inp" name="anthem" maxlength="60" value="${esc(p.anthem)}"></div></div>
    <div class="field"><label>Avatar</label><div class="pick">${EMOJIS.map(e=>`<button type="button" class="${p.emoji===e?'on':''}" data-emo="${e}">${e}</button>`).join('')}</div>
      <div class="pick" style="margin-top:10px">${COLORS.map((c,i)=>`<button type="button" class="col ${p.color===i?'on':''}" data-col="${i}" style="background:${grad(i)}"></button>`).join('')}</div></div>
    <div class="field"><label>Bio</label><textarea class="inp" name="bio" rows="2" maxlength="160">${esc(p.bio)}</textarea></div>
    <div class="two"><div class="field"><label>Instagram</label><div class="inp-wrap">${IC.ig}<input class="inp" name="insta" maxlength="60" value="${esc(p.insta)}" placeholder="yourhandle"></div></div>
      <div class="field"><label>Spotify</label><div class="inp-wrap">${IC.sp}<input class="inp" name="spotify" maxlength="140" value="${esc(p.spotify)}" placeholder="open.spotify.com/user/…"></div></div></div>
    <div class="field"><label>Genres</label><div class="chips">${chip(GENRES,p.genres||[],'g')}</div></div>
    <div class="field"><label>Top artists</label><div class="hint">Separate with commas.</div><input class="inp" name="artists" maxlength="300" value="${esc((p.artists||[]).join(', '))}"></div>
    <div class="field"><label>When do you listen?</label><div class="chips">${chip(MOODS,p.moods||[],'m')}</div></div>
    <div class="two"><div class="field"><label>Energy</label><input type="range" name="energy" min="0" max="100" value="${p.energy??50}"><div class="range-lbl"><span>Chill</span><span>Hype</span></div></div>
      <div class="field"><label>Discovery</label><input type="range" name="under" min="0" max="100" value="${p.under??50}"><div class="range-lbl"><span>Chart hits</span><span>Underground</span></div></div></div>
    <div class="row"><button class="btnp" type="submit">Save changes</button><button type="button" class="btns" id="cancel">Cancel</button><span class="err" id="perr"></span></div>
  </form>`;
}
function afterProfile(){
  const e=$('#edit'); if(e) e.onclick=()=>{ S.editing=true; render(); };
  const d=$('#delP'); if(d) d.onclick=()=>{ S.confirmDel=true; render(); };
  const dn=$('#delNo'); if(dn) dn.onclick=()=>{ S.confirmDel=false; render(); };
  const so=$('#signOut'); if(so) so.onclick=()=>signOut();
  document.querySelectorAll('[data-unblock]').forEach(b=>b.onclick=()=>unblockUser(b.dataset.unblock));
  const dy=$('#delYes'); if(dy) dy.onclick=async()=>{
    dy.disabled=true;
    if(isCloud()){ const {error}=await sb.from('profiles').delete().eq('id',S.myId); if(error){ dy.disabled=false; return dbErr(error,'delete your profile'); } delete S.profiles[S.myId]; S.conns=S.conns.filter(c=>c.from_id!==S.myId&&c.to_id!==S.myId); S.msgs=[]; }
    else LS.del('local');
    S.me=null; S.confirmDel=false; S.ob={step:isCloud()?1:0,d:null}; Music.pause(); Preview.stop(); toast('Your profile was deleted.'); render();
  };
  const f=$('#pform'); if(!f) return;
  let emo=S.me.emoji||'🎧', col=S.me.color||0;
  f.querySelectorAll('[data-emo]').forEach(b=>b.onclick=()=>{ emo=b.dataset.emo; f.querySelectorAll('[data-emo]').forEach(x=>x.classList.toggle('on',x===b)); });
  f.querySelectorAll('[data-col]').forEach(b=>b.onclick=()=>{ col=+b.dataset.col; f.querySelectorAll('[data-col]').forEach(x=>x.classList.toggle('on',x===b)); });
  f.querySelectorAll('[data-g],[data-m]').forEach(b=>b.onclick=()=>b.classList.toggle('on'));
  $('#cancel').onclick=()=>{ S.editing=false; if(S.profiles[S.myId]) S.me=JSON.parse(JSON.stringify(S.profiles[S.myId])); render(); };
  f.onsubmit=ev=>{
    ev.preventDefault(); const fd=new FormData(f);
    const genres=[...f.querySelectorAll('[data-g].on')].map(b=>b.dataset.g), moods=[...f.querySelectorAll('[data-m].on')].map(b=>b.dataset.m);
    const name=String(fd.get('name')).trim();
    if(!name) return $('#perr').textContent='Add a display name.';
    if(genres.length<2) return $('#perr').textContent='Pick at least 2 genres.';
    const s=cleanSocial({insta:String(fd.get('insta')||''),spotify:String(fd.get('spotify')||'')}); if(s.err) return $('#perr').textContent=s.err;
    const artists=String(fd.get('artists')||'').split(',').map(x=>x.trim()).filter(Boolean).slice(0,10);
    Object.assign(S.me,{name:name.slice(0,30),emoji:emo,color:col,bio:String(fd.get('bio')||'').trim().slice(0,160),anthem:String(fd.get('anthem')||'').trim().slice(0,60),insta:s.insta,spotify:s.spotify,genres,moods,artists,energy:+fd.get('energy'),under:+fd.get('under')});
    saveMe(true); S.editing=false; toast('✅ Profile saved.'); render();
  };
}

/* =================== player bar (radio + real previews) =================== */
function renderPlayer(){
  const pv = activeSrc==='preview' && Preview.song;
  const s=Music.station, t=Music.track, ps=Preview.song;
  let np;
  if(pv) np=`${ps.img?`<img class="cover" src="${esc(ps.img)}" alt="">`:`<div class="cover" style="background:#1b1b25">🎵</div>`}<div style="min-width:0"><div class="tt">${esc(ps.t)}</div><div class="ss">${esc(ps.a)} · Preview by Apple Music</div></div>
      <button class="heart ${isLiked(ps.id)?'on':''}" data-heart="${esc(ps.id)}" title="Like">${isLiked(ps.id)?'♥':'♡'}</button>`;
  else if(s) np=`<div class="cover" style="background:linear-gradient(135deg,${s.c[0]},${s.c[1]})">${s.emoji}</div><div style="min-width:0"><div class="tt">${esc(t.name)}</div><div class="ss">${esc(s.name)} · Tunemate Radio</div></div>`;
  else np=`<div class="cover" style="background:#1b1b25">🎵</div><div style="min-width:0"><div class="tt">Nothing playing</div><div class="ss">Play a song or Tunemate Radio</div></div>`;
  const playing = pv ? Preview.playing : Music.playing;
  $('#player').innerHTML=`<div class="np">${np}</div>
    <div class="ctl"><div class="bt"><button class="icon-btn" id="pPrev" title="Previous">${IC.prev}</button><button class="pp" id="pPlay" title="Play/Pause">${playing?IC.pause:IC.play}</button><button class="icon-btn" id="pNext" title="Next">${IC.next}</button>${pv?`<button class="icon-btn" id="pFull" title="Play the full song">⤢</button>`:''}</div>
      <div class="prog"><span id="pEl">0:00</span><div class="bar"><i id="pBar" style="width:0"></i></div><span id="pLen">${pv?'0:30':t?fmtT(t.len):'0:00'}</span></div></div>
    <div class="vol"><canvas id="viz" width="180" height="60"></canvas>${IC.vol}<input type="range" id="pVol" min="0" max="1" step=".01" value="${Music.vol}"></div>`;
  $('#pPlay').onclick=()=>{ if(pv) Preview.toggle(); else Music.toggle(); };
  $('#pNext').onclick=()=>{ if(pv) Preview.next(); else Music.next(); };
  $('#pPrev').onclick=()=>{ if(pv) Preview.prev(); else Music.prev(); };
  const pf=$('#pFull'); if(pf) pf.onclick=()=>playFull(ps);
  $('#pVol').oninput=e=>{ Music.setVol(+e.target.value); Preview.setVol(+e.target.value); };
}
function refreshPlayingUI(){
  renderPlayer(); setPresence();
  if(!S.me) return;
  $('#main').style.setProperty('--hero', activeSrc==='radio'&&Music.station? Music.station.c[1] : '#1a1530');
  document.querySelectorAll('.station[data-play]').forEach(el=>{ const s=stById(el.dataset.play); if(s) el.outerHTML=stationCard(s); });
  if(S.view==='library' && S.lib.open) renderPlList();
  if(S.view==='library' && !S.lib.open && S.lib.q) document.querySelectorAll('[data-prev]').forEach(b=>{ const [k,i]=b.dataset.prev.split('|'); const so=(LISTS[k]||[])[+i]; const on=so&&Preview.song&&Preview.song.id===so.id&&Preview.playing; b.innerHTML=on?IC.pause:IC.play; });
  if(S.view==='friends') renderChatHeader();
}
Music.onChange=()=>{ if(Music.playing){ activeSrc='radio'; Preview.stop(); } refreshPlayingUI(); };
Preview.onChange=()=>{ if(Preview.playing) activeSrc='preview'; refreshPlayingUI(); };
(function frame(){
  const pv = activeSrc==='preview' && Preview.song;
  const el=$('#pEl'), b=$('#pBar');
  if(pv){ const d=Preview.duration||30, e=Math.min(Preview.elapsed,d); if(el) el.textContent=fmtT(e); if(b) b.style.width=(e/d*100)+'%'; }
  else { const t=Music.track; if(t){ const e=Math.min(Music.elapsed,t.len); if(el) el.textContent=fmtT(e); if(b) b.style.width=(e/t.len*100)+'%'; } }
  const cv=$('#viz'), an=Music.analyser;
  if(cv){ const c=cv.getContext('2d'); c.clearRect(0,0,cv.width,cv.height); const n=18, w=cv.width/n; let d=null;
    if(!pv && an){ d=new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(d); }
    const tt=performance.now()/1000;
    for(let i=0;i<n;i++){ const v= d ? d[i+1]/255 : (pv&&Preview.playing ? .25+.6*Math.abs(Math.sin(tt*3+i*0.7)*Math.sin(tt*1.3+i)) : 0); const h=Math.max(3,v*cv.height); c.fillStyle=`hsl(${150+i*8},80%,${45+v*20}%)`; c.fillRect(i*w+1,cv.height-h,w-3,h); } }
  requestAnimationFrame(frame);
})();

init();
