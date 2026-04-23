/* ===== Survey Charts (Chart.js) ===== */
Chart.defaults.color='#7a8ba8';
Chart.defaults.borderColor='rgba(255,255,255,0.04)';
Chart.defaults.font.family='Inter';

const surveyData={
    subjects:['Азот','Фосфор','Мышьяк','Сурьма','Висмут','Қосылыстар','Реакциялар'],
    before:[35,40,25,20,30,45,50],
    after:[75,82,60,55,70,85,88],
    interest:{labels:['Өте қызықты','Қызықты','Бейтарап','Қызық емес'],values:[38,42,15,5],colors:['#00e5ff','#3d5af1','#7c4dff','#ff5252']},
    difficulty:{labels:['Аммиак','Азот оксидтері','Фосфор аллотропиясы','HNO₃ алу','Электрон конфигурация','Гибридизация','Реакция теңестіру'],
        values:[18,68,45,52,60,55,40]},
    rating:{labels:['5 ⭐','4 ⭐','3 ⭐','2 ⭐','1 ⭐'],values:[52,30,12,4,2],colors:['#00e676','#00e5ff','#3d5af1','#ff9100','#ff5252']}
};

let chartBA,chartInterest,chartDifficulty,chartRating;

function initCharts(){
    // Before vs After
    const ctx1=document.getElementById('chart-before-after');
    if(ctx1){chartBA=new Chart(ctx1,{type:'bar',data:{labels:surveyData.subjects,datasets:[
        {label:'Бұрын (%)',data:surveyData.before,backgroundColor:'rgba(255,145,0,0.6)',borderColor:'#ff9100',borderWidth:1,borderRadius:6},
        {label:'Кейін (%)',data:surveyData.after,backgroundColor:'rgba(0,229,255,0.6)',borderColor:'#00e5ff',borderWidth:1,borderRadius:6}
    ]},options:{responsive:true,plugins:{legend:{position:'top'}},scales:{y:{beginAtZero:true,max:100,grid:{color:'rgba(255,255,255,0.03)'}},x:{grid:{display:false}}}}})}

    // Interest Pie
    const ctx2=document.getElementById('chart-interest');
    if(ctx2){chartInterest=new Chart(ctx2,{type:'doughnut',data:{labels:surveyData.interest.labels,datasets:[{data:surveyData.interest.values,backgroundColor:surveyData.interest.colors,borderWidth:0,hoverOffset:8}]},options:{responsive:true,plugins:{legend:{position:'bottom'}}}})}

    // Difficulty
    const ctx3=document.getElementById('chart-difficulty');
    if(ctx3){chartDifficulty=new Chart(ctx3,{type:'bar',data:{labels:surveyData.difficulty.labels,datasets:[{label:'Қиындық деңгейі (%)',data:surveyData.difficulty.values,backgroundColor:'rgba(124,77,255,0.6)',borderColor:'#7c4dff',borderWidth:1,borderRadius:6}]},options:{responsive:true,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,max:100,grid:{color:'rgba(255,255,255,0.03)'}},y:{grid:{display:false}}}}})}

    // Rating
    const ctx4=document.getElementById('chart-rating');
    if(ctx4){chartRating=new Chart(ctx4,{type:'pie',data:{labels:surveyData.rating.labels,datasets:[{data:surveyData.rating.values,backgroundColor:surveyData.rating.colors,borderWidth:0,hoverOffset:8}]},options:{responsive:true,plugins:{legend:{position:'bottom'}}}})}
}

// Load demo data
document.getElementById('load-demo-data')?.addEventListener('click',()=>{
    initCharts();showNotif('📊 Демо деректер жүктелді!');
});

// Manual input update
document.getElementById('mi-update')?.addEventListener('click',()=>{
    const count=document.getElementById('mi-count').value;
    const before=parseInt(document.getElementById('mi-before').value);
    const after=parseInt(document.getElementById('mi-after').value);
    document.getElementById('ss-students').textContent=count;
    document.getElementById('ss-before').textContent=before+'%';
    document.getElementById('ss-after').textContent=after+'%';
    const growth=Math.round((after-before)/before*100);
    document.getElementById('ss-growth').textContent=(growth>0?'+':'')+growth+'%';

    if(chartBA){
        const scale=before/42;
        chartBA.data.datasets[0].data=surveyData.before.map(v=>Math.round(v*scale));
        const scaleA=after/78;
        chartBA.data.datasets[1].data=surveyData.after.map(v=>Math.round(v*scaleA));
        chartBA.update();
    }
    showNotif('📊 Деректер жаңартылды!');
});

// File upload
document.getElementById('file-upload')?.addEventListener('change',e=>{
    const file=e.target.files[0];
    if(!file)return;
    if(file.name.endsWith('.csv')){
        const reader=new FileReader();
        reader.onload=ev=>{
            const lines=ev.target.result.split('\n').filter(l=>l.trim());
            if(lines.length>1){showNotif('📁 CSV жүктелді: '+lines.length+' жол');initCharts()}
        };reader.readAsText(file);
    }else{showNotif('📁 Файл жүктелді: '+file.name);initCharts()}
});

// Auto-init charts
initCharts();
