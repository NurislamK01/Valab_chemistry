/* ===== Reaction Animations ===== */
const rxnData={
    haber:{title:'Габер процесі',eq:'N₂ + 3H₂ → 2NH₃',type:'Қосылу (синтез)',cond:'T=450°C, P=200 атм, Fe катализатор',imp:'Әлемдік аммиак өндірісінің негізі (1913 ж. Нобель сыйлығы)',
        steps:['N≡N үштік байланысы үзіледі','H—H байланыстары үзіледі','N және H атомдары қайта қосылады','2 NH₃ молекуласы түзіледі']},
    ostwald:{title:'Оствальд процесі',eq:'4NH₃ + 5O₂ → 4NO + 6H₂O',type:'Каталитикалық тотығу',cond:'Pt катализаторы, T=850°C',imp:'Азот қышқылы өндірісінің бірінші кезеңі',
        steps:['NH₃ молекулалары Pt бетіне адсорбцияланады','N—H байланыстары үзіледі','N атомы O₂-мен қосылады → NO','Қалған H мен O → H₂O түзеді']},
    p4burn:{title:'Фосфордың жануы',eq:'P₄ + 5O₂ → 2P₂O₅',type:'Жану реакциясы',cond:'Ақ P ауада өздігінен тұтанады',imp:'P₂O₅ — күшті сусыздандырғыш',
        steps:['P₄ тетраэдрі O₂-мен жанасады','P—P байланыстары үзіле бастайды','P—O байланыстары түзіледі','2 P₂O₅ молекуласы пайда болады']}
};

const atomColors={N:'#4fc3f7',H:'#ffffff',O:'#ef5350',P:'#ff7043'};
let currentRxn='haber',rxnStep=0,rxnPlaying=false,rxnAnimId=null,rxnFrame=0;

const rxnCanvas=document.getElementById('rxn-canvas');
if(rxnCanvas){
    const ctx=rxnCanvas.getContext('2d');
    let W=rxnCanvas.width=rxnCanvas.parentElement.clientWidth-48;
    let H=rxnCanvas.height=400;
    window.addEventListener('resize',()=>{W=rxnCanvas.width=rxnCanvas.parentElement.clientWidth-48;H=rxnCanvas.height=400;drawRxn()});

    function drawAtom(x,y,r,color,label){
        ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
        const grad=ctx.createRadialGradient(x-r*.3,y-r*.3,r*.1,x,y,r);
        grad.addColorStop(0,color);grad.addColorStop(1,shadeColor(color,-.3));
        ctx.fillStyle=grad;ctx.fill();
        ctx.strokeStyle='rgba(255,255,255,.2)';ctx.lineWidth=1;ctx.stroke();
        ctx.fillStyle='#fff';ctx.font='bold '+(r*.8)+'px Inter';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,x,y);
    }
    function drawBond(x1,y1,x2,y2,color='rgba(255,255,255,.3)'){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.stroke()}
    function shadeColor(c,p){const n=parseInt(c.replace('#',''),16);const r=Math.max(0,Math.min(255,((n>>16)&0xFF)*(1+p)));const g=Math.max(0,Math.min(255,((n>>8)&0xFF)*(1+p)));const b=Math.max(0,Math.min(255,(n&0xFF)*(1+p)));return`rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`}

    function drawHaber(step,frame){
        ctx.clearRect(0,0,W,H);
        const cx=W/2,cy=H/2;
        const t=Math.min(1,frame/60); // transition

        if(step===0){ // Initial: N≡N + 3H₂
            drawBond(cx-180,cy,cx-120,cy,'rgba(79,195,247,.5)');
            drawBond(cx-180,cy-4,cx-120,cy-4,'rgba(79,195,247,.3)');
            drawBond(cx-180,cy+4,cx-120,cy+4,'rgba(79,195,247,.3)');
            drawAtom(cx-180,cy,25,'#4fc3f7','N');drawAtom(cx-120,cy,25,'#4fc3f7','N');
            ctx.fillStyle='rgba(255,255,255,.3)';ctx.font='24px Inter';ctx.textAlign='center';ctx.fillText('+',cx-60,cy);
            for(let i=0;i<3;i++){const hx=cx+40+i*80;drawBond(hx-20,cy,hx+20,cy,'rgba(255,255,255,.3)');drawAtom(hx-20,cy,18,'#fff','H');drawAtom(hx+20,cy,18,'#fff','H')}
        } else if(step===1){ // Breaking N≡N
            const spread=t*40;
            drawAtom(cx-150-spread,cy,25,'#4fc3f7','N');drawAtom(cx-120+spread,cy,25,'#4fc3f7','N');
            if(t<1){drawBond(cx-150-spread,cy,cx-120+spread,cy,`rgba(79,195,247,${.5-t*.5})`)}
            ctx.fillStyle='rgba(255,82,82,.6)';ctx.font='14px Inter';ctx.textAlign='center';ctx.fillText('💥 Байланыс үзіледі',cx-135,cy-40);
            for(let i=0;i<3;i++){const hx=cx+40+i*80;const hs=t*20;drawAtom(hx-20-hs,cy,18,'#fff','H');drawAtom(hx+20+hs,cy,18,'#fff','H')}
        } else if(step===2){ // Atoms recombining
            drawAtom(cx-120,cy-50,25,'#4fc3f7','N');drawAtom(cx+120,cy-50,25,'#4fc3f7','N');
            const positions=[[-40,-10],[0,40],[40,-10],[-40,-10],[0,40],[40,-10]];
            for(let i=0;i<3;i++){const px=cx-120+positions[i][0]*t,py=cy-50+positions[i][1]*t;if(t>.3)drawBond(cx-120,cy-50,px,py,'rgba(255,255,255,.3)');drawAtom(px,py,15,'#fff','H')}
            for(let i=3;i<6;i++){const px=cx+120+positions[i][0]*t,py=cy-50+positions[i][1]*t;if(t>.3)drawBond(cx+120,cy-50,px,py,'rgba(255,255,255,.3)');drawAtom(px,py,15,'#fff','H')}
        } else if(step===3){ // Final: 2NH₃
            // NH3 molecule 1
            drawBond(cx-120,cy-30,cx-160,cy+20,'rgba(255,255,255,.4)');drawBond(cx-120,cy-30,cx-80,cy+20,'rgba(255,255,255,.4)');drawBond(cx-120,cy-30,cx-120,cy+30,'rgba(255,255,255,.4)');
            drawAtom(cx-120,cy-30,25,'#4fc3f7','N');drawAtom(cx-160,cy+20,16,'#fff','H');drawAtom(cx-80,cy+20,16,'#fff','H');drawAtom(cx-120,cy+30,16,'#fff','H');
            // NH3 molecule 2
            drawBond(cx+120,cy-30,cx+80,cy+20,'rgba(255,255,255,.4)');drawBond(cx+120,cy-30,cx+160,cy+20,'rgba(255,255,255,.4)');drawBond(cx+120,cy-30,cx+120,cy+30,'rgba(255,255,255,.4)');
            drawAtom(cx+120,cy-30,25,'#4fc3f7','N');drawAtom(cx+80,cy+20,16,'#fff','H');drawAtom(cx+160,cy+20,16,'#fff','H');drawAtom(cx+120,cy+30,16,'#fff','H');
            ctx.fillStyle='var(--accent)';ctx.font='bold 16px Inter';ctx.textAlign='center';ctx.fillText('2NH₃ ✓',cx,cy+80);
        }
    }

    function drawOstwald(step,frame){
        ctx.clearRect(0,0,W,H);const cx=W/2,cy=H/2,t=Math.min(1,frame/60);
        if(step===0){drawAtom(cx-150,cy,22,'#4fc3f7','N');for(let i=0;i<3;i++){const a=(i*120-90)*Math.PI/180;drawBond(cx-150,cy,cx-150+35*Math.cos(a),cy+35*Math.sin(a),'rgba(255,255,255,.3)');drawAtom(cx-150+35*Math.cos(a),cy+35*Math.sin(a),14,'#fff','H')}
            ctx.fillStyle='rgba(255,255,255,.3)';ctx.font='20px Inter';ctx.textAlign='center';ctx.fillText('+ O₂',cx,cy);drawAtom(cx+120,cy-15,20,'#ef5350','O');drawAtom(cx+120,cy+15,20,'#ef5350','O');drawBond(cx+120,cy-15,cx+120,cy+15,'rgba(239,83,80,.4)')}
        else if(step===1){drawAtom(cx-100,cy,22,'#4fc3f7','N');for(let i=0;i<3;i++){const a=(i*120-90)*Math.PI/180;const d=35+t*30;drawAtom(cx-100+d*Math.cos(a),cy+d*Math.sin(a),14-t*4,'#fff','H')}ctx.fillStyle='rgba(255,82,82,.5)';ctx.font='14px Inter';ctx.textAlign='center';ctx.fillText('N—H байланыстары үзіледі',cx,cy-60)}
        else if(step===2){drawBond(cx-60,cy,cx-20,cy,'rgba(239,83,80,.4)');drawAtom(cx-60,cy,22,'#4fc3f7','N');drawAtom(cx-20,cy,20,'#ef5350','O');ctx.fillStyle='rgba(0,229,255,.6)';ctx.font='bold 16px Inter';ctx.textAlign='center';ctx.fillText('NO',cx-40,cy-40)}
        else if(step===3){drawBond(cx-120,cy,cx-80,cy,'rgba(239,83,80,.4)');drawAtom(cx-120,cy,22,'#4fc3f7','N');drawAtom(cx-80,cy,20,'#ef5350','O');
            drawAtom(cx+80,cy,18,'#ef5350','O');drawBond(cx+80,cy,cx+50,cy-20,'rgba(255,255,255,.3)');drawBond(cx+80,cy,cx+110,cy+20,'rgba(255,255,255,.3)');drawAtom(cx+50,cy-20,12,'#fff','H');drawAtom(cx+110,cy+20,12,'#fff','H');
            ctx.fillStyle='var(--accent)';ctx.font='bold 14px Inter';ctx.textAlign='center';ctx.fillText('NO + H₂O ✓',cx,cy+70)}
    }

    function drawP4Burn(step,frame){
        ctx.clearRect(0,0,W,H);const cx=W/2,cy=H/2,t=Math.min(1,frame/60);
        if(step===0){const ps=[[cx-80,cy-50],[cx-20,cy-50],[cx-80,cy+20],[cx-20,cy+20]];ps.forEach(([x,y])=>drawAtom(x,y,22,'#ff7043','P'));for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++)drawBond(ps[i][0],ps[i][1],ps[j][0],ps[j][1],'rgba(255,112,67,.3)');
            ctx.fillStyle='rgba(255,255,255,.3)';ctx.font='20px Inter';ctx.textAlign='center';ctx.fillText('+ O₂',cx+80,cy);drawAtom(cx+140,cy-10,18,'#ef5350','O');drawAtom(cx+140,cy+10,18,'#ef5350','O')}
        else if(step===1){const ps=[[cx-100,cy-40],[cx,cy-40],[cx-100,cy+30],[cx,cy+30]];const spread=t*30;ps.forEach(([x,y],i)=>{const sx=x+(i%2?spread:-spread);drawAtom(sx,y,22,'#ff7043','P')});ctx.fillStyle='rgba(255,145,0,.5)';ctx.font='14px Inter';ctx.textAlign='center';ctx.fillText('🔥 P—P үзіледі',cx-50,cy-70)}
        else if(step===2){for(let i=0;i<4;i++){const x=cx-120+i*70,y=cy-10+Math.sin(i)*20;drawBond(x,y,x+20,y-15,'rgba(239,83,80,.4)');drawAtom(x,y,20,'#ff7043','P');drawAtom(x+20,y-15,15,'#ef5350','O')}ctx.fillStyle='rgba(0,229,255,.5)';ctx.font='14px Inter';ctx.textAlign='center';ctx.fillText('P—O байланыстары түзіледі',cx,cy+60)}
        else if(step===3){for(let i=0;i<2;i++){const bx=cx-100+i*200;drawAtom(bx,cy,20,'#ff7043','P');for(let j=0;j<5;j++){const a=(j*72-90)*Math.PI/180;drawBond(bx,cy,bx+30*Math.cos(a),cy+30*Math.sin(a),'rgba(239,83,80,.3)');drawAtom(bx+30*Math.cos(a),cy+30*Math.sin(a),13,'#ef5350','O')}}
            ctx.fillStyle='var(--accent)';ctx.font='bold 16px Inter';ctx.textAlign='center';ctx.fillText('2P₂O₅ ✓',cx,cy+80)}
    }

    function drawRxn(){
        const drawFn={haber:drawHaber,ostwald:drawOstwald,p4burn:drawP4Burn}[currentRxn];
        if(drawFn)drawFn(rxnStep,rxnFrame);
    }

    function animateRxn(){
        if(!rxnPlaying)return;
        rxnFrame++;
        drawRxn();
        if(rxnFrame>=80){
            rxnFrame=0;rxnStep++;
            const data=rxnData[currentRxn];
            if(rxnStep>=data.steps.length){rxnPlaying=false;document.getElementById('rxn-play').disabled=false;document.getElementById('rxn-pause').disabled=true;return}
            updateStepUI();
        }
        rxnAnimId=requestAnimationFrame(animateRxn);
    }

    function updateStepUI(){
        const data=rxnData[currentRxn];
        document.getElementById('rxn-step-num').textContent=rxnStep+1;
        document.getElementById('rxn-step-desc').innerHTML='<p>📍 Қадам '+(rxnStep+1)+': '+data.steps[rxnStep]+'</p>';
    }

    function setRxn(key){
        currentRxn=key;rxnStep=0;rxnFrame=0;rxnPlaying=false;
        if(rxnAnimId)cancelAnimationFrame(rxnAnimId);
        const data=rxnData[key];
        document.getElementById('rxn-title').textContent=data.title;
        document.getElementById('rxn-eq').textContent=data.eq;
        document.getElementById('rxn-type').textContent=data.type;
        document.getElementById('rxn-cond').textContent=data.cond;
        document.getElementById('rxn-imp').textContent=data.imp;
        document.getElementById('rxn-step-total').textContent=data.steps.length;
        document.getElementById('rxn-step-num').textContent='0';
        document.getElementById('rxn-step-desc').innerHTML='<p>▶ «Бастау» батырмасын басыңыз</p>';
        document.getElementById('rxn-play').disabled=false;
        document.getElementById('rxn-pause').disabled=true;
        drawRxn();
    }

    document.querySelectorAll('.rxn-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.rxn-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');setRxn(b.dataset.rxn)}));
    document.getElementById('rxn-play').addEventListener('click',()=>{rxnPlaying=true;document.getElementById('rxn-play').disabled=true;document.getElementById('rxn-pause').disabled=false;if(rxnStep===0&&rxnFrame===0)updateStepUI();animateRxn()});
    document.getElementById('rxn-pause').addEventListener('click',()=>{rxnPlaying=false;document.getElementById('rxn-play').disabled=false;document.getElementById('rxn-pause').disabled=true});
    document.getElementById('rxn-reset').addEventListener('click',()=>setRxn(currentRxn));

    drawRxn();
}
