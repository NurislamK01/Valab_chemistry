/* ===== Games Engine ===== */
let playerPoints=parseInt(localStorage.getItem('valab-points')||'0');
let badges=JSON.parse(localStorage.getItem('valab-badges')||'[]');

function updatePlayerUI(){
    const el=document.getElementById('total-points');if(el)el.textContent=playerPoints;
    let lvl='Бастаушы';if(playerPoints>=50)lvl='Оқушы';if(playerPoints>=150)lvl='Білгір';if(playerPoints>=300)lvl='Маман';if(playerPoints>=500)lvl='Шебер';
    const lel=document.getElementById('player-level');if(lel)lel.textContent=lvl;
    const bel=document.getElementById('badge-count');if(bel)bel.textContent=badges.length;
    const xp=document.getElementById('xp-fill');if(xp)xp.style.width=Math.min(100,playerPoints/5)+'%';
    document.querySelectorAll('.badge-item').forEach(b=>{if(badges.includes(b.dataset.badge)){b.classList.remove('locked');b.classList.add('unlocked')}});
    localStorage.setItem('valab-points',playerPoints);localStorage.setItem('valab-badges',JSON.stringify(badges));
}

function addPoints(n){playerPoints+=n;updatePlayerUI()}
function unlockBadge(id){if(!badges.includes(id)){badges.push(id);updatePlayerUI();showNotif('🎖 Жаңа марапат: '+id)}}

// Game Tab Switching
document.querySelectorAll('.game-tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
        document.querySelectorAll('.game-tab').forEach(t=>t.classList.remove('active'));tab.classList.add('active');
        document.querySelectorAll('.game-panel').forEach(p=>p.style.display='none');
        document.getElementById('game-'+tab.dataset.game).style.display='block';
    });
});

// ===== BUILD MOLECULE =====
const buildTargets=[
    {name:'NH₃',atoms:['N','H','H','H']},
    {name:'NO₂',atoms:['N','O','O']},
    {name:'PCl₃',atoms:['P','Cl','Cl','Cl']},
    {name:'H₃PO₄',atoms:['H','H','H','P','O','O','O','O']},
    {name:'PCl₅',atoms:['P','Cl','Cl','Cl','Cl','Cl']},
];
let buildIdx=0,buildDropped=[];

function initBuild(){
    buildIdx=buildIdx%buildTargets.length;
    const target=buildTargets[buildIdx];
    document.getElementById('build-target-name').textContent=target.name;
    buildDropped=[];
    const zone=document.getElementById('build-zone');
    zone.innerHTML='<p class="build-hint">Атомдарды осы жерге сүйреңіз</p>';
    document.getElementById('build-feedback').textContent='';document.getElementById('build-feedback').className='build-feedback';

    const atomColors={N:'#4fc3f7',H:'#ffffff',O:'#ef5350',P:'#ff7043',Cl:'#66bb6a',S:'#ffeb3b'};
    const allAtoms=['N','H','H','H','H','O','O','O','O','P','Cl','Cl','Cl','Cl','Cl','S'];
    const shuffled=allAtoms.sort(()=>Math.random()-.5).slice(0,Math.min(10,Math.max(target.atoms.length+3,6)));

    const atomsDiv=document.getElementById('build-atoms');
    atomsDiv.innerHTML='';
    shuffled.forEach((a,i)=>{
        const div=document.createElement('div');div.className='build-atom';div.draggable=true;div.dataset.atom=a;div.dataset.idx=i;
        div.style.setProperty('--atom-color',atomColors[a]||'#ccc');div.textContent=a;
        div.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',JSON.stringify({atom:a,idx:i}))});
        div.addEventListener('click',()=>{
            if(!div.classList.contains('in-zone')){
                div.classList.add('in-zone');buildDropped.push(a);
                const chip=document.createElement('div');chip.className='build-atom';chip.style.setProperty('--atom-color',atomColors[a]||'#ccc');chip.textContent=a;chip.style.cursor='pointer';
                chip.addEventListener('click',()=>{chip.remove();buildDropped.splice(buildDropped.indexOf(a),1);div.classList.remove('in-zone');if(!zone.children.length)zone.innerHTML='<p class="build-hint">Атомдарды осы жерге сүйреңіз</p>'});
                zone.querySelector('.build-hint')?.remove();zone.appendChild(chip);
            }
        });
        atomsDiv.appendChild(div);
    });

    // Drop zone
    zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('drag-over')});
    zone.addEventListener('dragleave',()=>zone.classList.remove('drag-over'));
    zone.addEventListener('drop',e=>{
        e.preventDefault();zone.classList.remove('drag-over');
        const data=JSON.parse(e.dataTransfer.getData('text/plain'));
        const src=atomsDiv.querySelector(`[data-idx="${data.idx}"]`);if(src)src.classList.add('in-zone');
        buildDropped.push(data.atom);
        const chip=document.createElement('div');chip.className='build-atom';chip.style.setProperty('--atom-color',{N:'#4fc3f7',H:'#fff',O:'#ef5350',P:'#ff7043',Cl:'#66bb6a'}[data.atom]||'#ccc');chip.textContent=data.atom;
        zone.querySelector('.build-hint')?.remove();zone.appendChild(chip);
    });
}

document.getElementById('build-check')?.addEventListener('click',()=>{
    const target=buildTargets[buildIdx];
    const tSorted=[...target.atoms].sort().join(',');
    const dSorted=[...buildDropped].sort().join(',');
    const fb=document.getElementById('build-feedback');
    if(tSorted===dSorted){fb.textContent='✅ Дұрыс! '+target.name+' молекуласы құрастырылды! +10 ұпай';fb.className='build-feedback correct';addPoints(10);
        if(buildIdx>=2)unlockBadge('molecule-builder');
    }else{fb.textContent='❌ Қате! '+target.name+' үшін қажет: '+target.atoms.join(', ');fb.className='build-feedback wrong'}
});
document.getElementById('build-reset')?.addEventListener('click',initBuild);
document.getElementById('build-next')?.addEventListener('click',()=>{buildIdx++;initBuild()});
document.querySelectorAll('.lvl-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.lvl-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active')}));

// ===== REACTION PUZZLE =====
const puzzles=[
    {pieces:['N₂','+','3H₂','→','2NH₃'],correct:['N₂','+','3H₂','→','2NH₃']},
    {pieces:['4NH₃','+','5O₂','→','4NO','+','6H₂O'],correct:['4NH₃','+','5O₂','→','4NO','+','6H₂O']},
    {pieces:['P₄','+','5O₂','→','2P₂O₅'],correct:['P₄','+','5O₂','→','2P₂O₅']},
    {pieces:['2P','+','3Cl₂','→','2PCl₃'],correct:['2P','+','3Cl₂','→','2PCl₃']},
];
let puzzleIdx=0,puzzleSlots=[];

function initPuzzle(){
    puzzleIdx=puzzleIdx%puzzles.length;
    const p=puzzles[puzzleIdx];puzzleSlots=new Array(p.correct.length).fill(null);
    const slotsDiv=document.getElementById('puzzle-slots');
    slotsDiv.innerHTML='';
    p.correct.forEach((_,i)=>{const s=document.createElement('div');s.className='puzzle-slot';s.dataset.idx=i;
    s.addEventListener('click',()=>{if(puzzleSlots[i]!==null){const piece=document.querySelector(`.puzzle-piece[data-val="${puzzleSlots[i]}"].used`);if(piece)piece.classList.remove('used');puzzleSlots[i]=null;s.textContent='';s.classList.remove('filled')}});
    slotsDiv.appendChild(s)});
    const piecesDiv=document.getElementById('puzzle-pieces');
    piecesDiv.innerHTML='';
    const shuffled=[...p.pieces].sort(()=>Math.random()-.5);
    shuffled.forEach(val=>{const pc=document.createElement('div');pc.className='puzzle-piece';pc.textContent=val;pc.dataset.val=val;
    pc.addEventListener('click',()=>{if(pc.classList.contains('used'))return;
        const emptyIdx=puzzleSlots.indexOf(null);if(emptyIdx===-1)return;
        puzzleSlots[emptyIdx]=val;pc.classList.add('used');
        slotsDiv.children[emptyIdx].textContent=val;slotsDiv.children[emptyIdx].classList.add('filled')});
    piecesDiv.appendChild(pc)});
    document.getElementById('puzzle-feedback').textContent='';document.getElementById('puzzle-feedback').className='build-feedback';
}

document.getElementById('puzzle-check')?.addEventListener('click',()=>{
    const p=puzzles[puzzleIdx];const fb=document.getElementById('puzzle-feedback');
    const correct=puzzleSlots.every((v,i)=>v===p.correct[i]);
    const slots=document.querySelectorAll('.puzzle-slot');
    slots.forEach((s,i)=>{s.classList.remove('correct-slot','wrong-slot');s.classList.add(puzzleSlots[i]===p.correct[i]?'correct-slot':'wrong-slot')});
    if(correct){fb.textContent='✅ Тамаша! Реакция дұрыс құрастырылды! +15 ұпай';fb.className='build-feedback correct';addPoints(15);unlockBadge('reaction-master')}
    else{fb.textContent='❌ Дұрыс ретті табыңыз!';fb.className='build-feedback wrong'}
});
document.getElementById('puzzle-reset')?.addEventListener('click',initPuzzle);
document.getElementById('puzzle-next')?.addEventListener('click',()=>{puzzleIdx++;initPuzzle()});

// ===== QUIZ =====
const quizDB={easy:[
    {q:'Азот атмосферада қанша % құрайды?',o:['78%','21%','50%','1%'],a:0},
    {q:'Аммиактың формуласы?',o:['NO₂','NH₃','N₂O','HNO₃'],a:1},
    {q:'VA тобындағы ең ауыр тұрақты элемент?',o:['Азот','Мышьяк','Сурьма','Висмут'],a:3},
    {q:'Фосфордың қанша аллотропиялық түрі бар?',o:['1','2','3','4'],a:2},
    {q:'Азоттың атом нөмірі?',o:['5','7','14','15'],a:1},
    {q:'VA тобы элементтерінің сыртқы электрон саны?',o:['3','5','7','2'],a:1},
    {q:'Сұйық азоттың t?',o:['-78°C','-196°C','-273°C','-100°C'],a:1},
    {q:'Висмут қандай кристалдар түзеді?',o:['Ақ','Қара','Кемпірқосақ','Сары'],a:2},
    {q:'Қай элемент металлоид?',o:['N','P','As','Bi'],a:2},
    {q:'NH₃ молекуласының геометриясы?',o:['Сызықтық','Тригоналды','Пирамидалық','Тетраэдрлік'],a:2},
],medium:[
    {q:'N≡N байланыс энергиясы?',o:['400','946','150','600'],a:1},
    {q:'Азоттың электртерістілігі?',o:['2.04','2.55','3.04','3.44'],a:2},
    {q:'Ақ фосфордың формуласы?',o:['P₂','P₄','P₆','P₈'],a:1},
    {q:'GaAs қай салада қолданылады?',o:['Медицина','Электроника','Тыңайтқыш','Тағам'],a:1},
    {q:'Габер процесінің өнімі?',o:['HNO₃','H₃PO₄','NH₃','NO'],a:2},
    {q:'Сурьманың латынша атауы?',o:['Antimonium','Stibium','Arsenicum','Bismuthum'],a:1},
    {q:'N₂O медицинада?',o:['Оттегі','Күлкі газы','Наркоз','Анестетик'],a:1},
    {q:'Висмуттың балқу t?',o:['100°C','271°C','630°C','1000°C'],a:1},
    {q:'ДНҚ, РНҚ, АТФ-те қай элемент бар?',o:['N','P','As','Bi'],a:1},
    {q:'Топ бойынша не артады?',o:['Электртерістілік','Атом радиусы','Бейметалл қасиет','Иондану энергиясы'],a:1},
],hard:[
    {q:'N₂ байланыс реті?',o:['1','2','3','4'],a:2},
    {q:'Вуд қорытпасының балқу t?',o:['70°C','100°C','150°C','200°C'],a:0},
    {q:'NaBiO₃ қандай қасиет?',o:['Тотықтырғыш','Тотықсыздандырғыш','Қышқыл','Негіз'],a:0},
    {q:'As кристалл құрылымы?',o:['Кубтық','Гексагоналдық','Ромбоэдрлік','Тетрагоналдық'],a:2},
    {q:'H₃PO₄ неше негіздік?',o:['1','2','3','4'],a:2},
    {q:'Bi₂O₃ сипаты?',o:['Қышқылдық','Амфотерлік','Негіздік','Бейтарап'],a:2},
    {q:'AsH₃ ерекшелігі?',o:['Иіссіз','Өте улы','Сулы','Ерімейді'],a:1},
    {q:'Стибнит формуласы?',o:['SbCl₃','Sb₂O₃','Sb₂S₃','SbH₃'],a:2},
    {q:'Қара P құрылымы неге ұқсас?',o:['Алмаз','Графит','Фуллерен','Кварц'],a:1},
    {q:'Пепто-Бисмолда қай элемент?',o:['As','Sb','P','Bi'],a:3},
]};

let quizState={qs:[],cur:0,score:0,correct:0,level:'easy',timer:null,time:60};

document.getElementById('quiz-start-btn')?.addEventListener('click',()=>{
    document.querySelectorAll('.qlvl-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.qlvl-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');quizState.level=b.dataset.lvl}));
    quizState.qs=[...quizDB[quizState.level]].sort(()=>Math.random()-.5).slice(0,10);
    quizState.cur=0;quizState.score=0;quizState.correct=0;quizState.time=60;
    document.getElementById('quiz-start').style.display='none';
    document.getElementById('quiz-result').style.display='none';
    document.querySelector('.quiz-game').style.display='block';
    showQuizQ();startTimer();unlockBadge('first-quiz');
});

function startTimer(){clearInterval(quizState.timer);quizState.timer=setInterval(()=>{quizState.time--;document.getElementById('quiz-time').textContent=quizState.time;if(quizState.time<=0){clearInterval(quizState.timer);endQuiz()}},1000)}

function showQuizQ(){
    const q=quizState.qs[quizState.cur];
    document.getElementById('quiz-q').textContent=q.q;
    document.getElementById('quiz-qnum').textContent=(quizState.cur+1)+'/'+quizState.qs.length;
    document.getElementById('quiz-pfill').style.width=(quizState.cur/quizState.qs.length*100)+'%';
    document.getElementById('quiz-feedback').textContent='';document.getElementById('quiz-feedback').className='build-feedback';
    document.getElementById('quiz-next').style.display='none';
    const opts=document.getElementById('quiz-opts');opts.innerHTML='';
    q.o.forEach((o,i)=>{const btn=document.createElement('button');btn.className='quiz-opt';btn.textContent=o;
    btn.addEventListener('click',()=>{
        document.querySelectorAll('.quiz-opt').forEach((b,j)=>{b.classList.add('disabled');if(j===q.a)b.classList.add('correct');if(j===i&&i!==q.a)b.classList.add('wrong')});
        const fb=document.getElementById('quiz-feedback');
        if(i===q.a){quizState.score+=10;quizState.correct++;fb.textContent='✅ Дұрыс!';fb.className='build-feedback correct'}
        else{fb.textContent='❌ Қате! Жауап: '+q.o[q.a];fb.className='build-feedback wrong'}
        document.getElementById('quiz-next').style.display='block';
    });opts.appendChild(btn)});
}

document.getElementById('quiz-next')?.addEventListener('click',()=>{quizState.cur++;if(quizState.cur<quizState.qs.length)showQuizQ();else endQuiz()});

function endQuiz(){
    clearInterval(quizState.timer);
    document.querySelector('.quiz-game').style.display='none';
    const r=document.getElementById('quiz-result');r.style.display='block';
    document.getElementById('qr-score-num').textContent=quizState.score;
    document.getElementById('qr-correct').textContent=quizState.correct;
    document.getElementById('qr-wrong').textContent=quizState.qs.length-quizState.correct;
    const pct=quizState.correct/quizState.qs.length;
    document.getElementById('qr-icon').textContent=pct>=.8?'🏆':pct>=.5?'👍':'📚';
    document.getElementById('qr-title').textContent=pct>=.8?'Тамаша!':pct>=.5?'Жақсы!':'Тағы жаттығыңыз';
    addPoints(quizState.score);if(quizState.score===100)unlockBadge('perfect-score');
}
document.getElementById('quiz-restart')?.addEventListener('click',()=>{document.getElementById('quiz-result').style.display='none';document.getElementById('quiz-start').style.display='block'});

// ===== TRUE/FALSE =====
const tfStatements=[
    {s:'Азот атмосфераның 78%-ін құрайды',a:true},
    {s:'Фосфордың тек бір аллотропиялық түрі бар',a:false},
    {s:'Висмут — VA тобының ең жеңіл элементі',a:false},
    {s:'NH₃ молекуласы пирамидалық пішінге ие',a:true},
    {s:'Мышьяк — типтік металл',a:false},
    {s:'GaAs — жартылай өткізгіш',a:true},
    {s:'N₂ молекуласындағы байланыс — екілік',a:false},
    {s:'Ақ фосфор ауада тұтанады',a:true},
    {s:'Сурьма ежелгі Мысырда белгілі болды',a:true},
    {s:'Висмут кристалдары ақ түсті',a:false},
    {s:'Азот қышқылы — әлсіз қышқыл',a:false},
    {s:'Габер процесінде аммиак алынады',a:true},
    {s:'PCl₅ молекуласы sp³d гибридизацияланған',a:true},
    {s:'Bi₂O₃ — қышқылдық оксид',a:false},
];
let tfState={qs:[],cur:0,score:0,correct:0};

document.getElementById('tf-start-btn')?.addEventListener('click',()=>{
    tfState.qs=[...tfStatements].sort(()=>Math.random()-.5).slice(0,10);
    tfState.cur=0;tfState.score=0;tfState.correct=0;
    document.getElementById('tf-start').style.display='none';
    document.getElementById('tf-result').style.display='none';
    document.querySelector('.tf-game').style.display='block';
    showTF();
});

function showTF(){
    const s=tfState.qs[tfState.cur];
    document.getElementById('tf-statement').textContent=s.s;
    document.getElementById('tf-num').textContent=(tfState.cur+1)+'/'+tfState.qs.length;
    document.getElementById('tf-score').textContent='Ұпай: '+tfState.score;
    document.getElementById('tf-feedback').textContent='';document.getElementById('tf-feedback').className='build-feedback';
    document.getElementById('tf-true').disabled=false;document.getElementById('tf-false').disabled=false;
}

function answerTF(ans){
    const s=tfState.qs[tfState.cur];const fb=document.getElementById('tf-feedback');
    document.getElementById('tf-true').disabled=true;document.getElementById('tf-false').disabled=true;
    if(ans===s.a){tfState.score+=10;tfState.correct++;fb.textContent='✅ Дұрыс!';fb.className='build-feedback correct'}
    else{fb.textContent='❌ Қате! Жауап: '+(s.a?'Рас':'Жалған');fb.className='build-feedback wrong'}
    setTimeout(()=>{tfState.cur++;if(tfState.cur<tfState.qs.length)showTF();else endTF()},1200);
}

document.getElementById('tf-true')?.addEventListener('click',()=>answerTF(true));
document.getElementById('tf-false')?.addEventListener('click',()=>answerTF(false));

function endTF(){
    document.querySelector('.tf-game').style.display='none';
    document.getElementById('tf-result').style.display='block';
    document.getElementById('tf-r-score').textContent=tfState.score;
    const pct=tfState.correct/tfState.qs.length;
    document.getElementById('tf-r-icon').textContent=pct>=.8?'🏆':pct>=.5?'👍':'📚';
    document.getElementById('tf-r-title').textContent=pct>=.8?'Тамаша!':pct>=.5?'Жақсы!':'Тағы жаттығыңыз';
    addPoints(tfState.score);if(pct>=.8)unlockBadge('tf-expert');
}
document.getElementById('tf-restart')?.addEventListener('click',()=>{document.getElementById('tf-result').style.display='none';document.getElementById('tf-start').style.display='block'});

// Init
updatePlayerUI();initBuild();initPuzzle();
