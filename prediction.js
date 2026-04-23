const rangeFields = [
    { id: 'attendance', out: 'attendance-val', suffix: '%' },
    { id: 'study-hours', out: 'study-hours-val', suffix: ' сағат' },
    { id: 'gpa', out: 'gpa-val', suffix: '' },
    { id: 'sleep', out: 'sleep-val', suffix: ' сағат' }
];

rangeFields.forEach(({ id, out, suffix }) => {
    const input = document.getElementById(id);
    const output = document.getElementById(out);
    if (!input || !output) return;
    const render = () => {
        output.textContent = `${input.value}${suffix}`;
    };
    input.addEventListener('input', render);
    render();
});

document.querySelectorAll('.pf-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        const value = btn.dataset.val;
        const hidden = document.getElementById(target);
        if (!hidden) return;

        document.querySelectorAll(`.pf-toggle[data-target="${target}"]`).forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        hidden.value = value;
    });
});

function animateAlgorithmBars() {
    document.querySelectorAll('.algo-bar-fill').forEach(bar => {
        const width = bar.dataset.width || '0';
        requestAnimationFrame(() => {
            bar.style.width = `${width}%`;
        });
    });
}

function drawGauge(value) {
    const canvas = document.getElementById('gauge-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = 150;
    const radius = 90;
    const start = Math.PI;
    const end = 0;
    const progress = start + (Math.PI * value / 100);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.arc(cx, cy, radius, start, end, false);
    ctx.stroke();

    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, '#00e5ff');
    grad.addColorStop(1, '#7c4dff');

    ctx.beginPath();
    ctx.strokeStyle = grad;
    ctx.arc(cx, cy, radius, start, progress, false);
    ctx.stroke();
}

function getGrade(score) {
    if (score >= 85) return { letter: 'A', text: 'Өте жоғары нәтиже', gpa: '3.7 - 4.0' };
    if (score >= 70) return { letter: 'B', text: 'Жақсы нәтиже', gpa: '3.0 - 3.6' };
    if (score >= 55) return { letter: 'C', text: 'Орташа нәтиже', gpa: '2.3 - 2.9' };
    if (score >= 40) return { letter: 'D', text: 'Қолдауды қажет етеді', gpa: '1.7 - 2.2' };
    return { letter: 'F', text: 'Қосымша жұмыс қажет', gpa: '0.0 - 1.6' };
}

function getRecommendations(values, score) {
    const tips = [];
    if (values.attendance < 70) tips.push('Сабаққа қатысу пайызын арттыру негізгі нәтижеге тікелей әсер етеді.');
    if (values.studyHours < 3) tips.push('Күнделікті өздік оқу уақытын кемінде 3-4 сағатқа жеткізу ұсынылады.');
    if (values.gpa < 2.8) tips.push('Алдыңғы тақырыптар бойынша олқылықтарды теория және quiz арқылы толықтырған дұрыс.');
    if (!values.internet) tips.push('Үйдегі интернет қолжетімділігі цифрлық ресурстарды тұрақты пайдалануға көмектеседі.');
    if (!values.extraClasses) tips.push('Қосымша сабақ немесе кеңес алу күрделі тақырыптарды меңгеруді жеделдетеді.');
    if (values.sleep < 6.5) tips.push('Ұйқы режимін тұрақтандыру зейін мен оқу өнімділігін жақсартады.');
    if (score >= 80) tips.push('Жетістік деңгейі жоғары: күрделі есептер мен зерттеу тапсырмаларына көшуге болады.');
    return tips.slice(0, 4);
}

function renderImportance(values) {
    const container = document.getElementById('importance-bars');
    if (!container) return;

    const items = [
        { label: 'Сабаққа қатысу', value: Math.round(values.attendance * 0.25) },
        { label: 'Өздік оқу уақыты', value: Math.round(values.studyHours / 12 * 20) },
        { label: 'Алдыңғы GPA', value: Math.round(values.gpa / 4 * 20) },
        { label: 'Ата-ана білім деңгейі', value: Math.round(values.parentEdu / 4 * 10) },
        { label: 'Интернет қолжетімділігі', value: values.internet ? 5 : 1 },
        { label: 'Қосымша сабақ', value: values.extraClasses ? 10 : 3 },
        { label: 'Ұйқы тәртібі', value: Math.round(values.sleep / 12 * 10) }
    ];

    container.innerHTML = items.map(item => `
        <div class="importance-item">
            <div class="importance-head"><span>${item.label}</span><span>${item.value}%</span></div>
            <div class="importance-bar"><div class="importance-fill" style="width:${item.value}%"></div></div>
        </div>
    `).join('');
}

function readFormValues() {
    return {
        attendance: Number(document.getElementById('attendance')?.value || 0),
        studyHours: Number(document.getElementById('study-hours')?.value || 0),
        gpa: Number(document.getElementById('gpa')?.value || 0),
        parentEdu: Number(document.getElementById('parent-edu')?.value || 1),
        internet: Number(document.getElementById('internet')?.value || 0),
        extraClasses: Number(document.getElementById('extra-classes')?.value || 0),
        sleep: Number(document.getElementById('sleep')?.value || 0)
    };
}

function calculateScore(values) {
    const attendance = values.attendance * 0.25;
    const study = (values.studyHours / 12) * 20;
    const gpa = (values.gpa / 4) * 20;
    const parent = (values.parentEdu / 4) * 10;
    const internet = values.internet ? 5 : 1;
    const extra = values.extraClasses ? 10 : 3;
    const sleep = Math.max(0, 10 - Math.abs(values.sleep - 8) * 2);
    return Math.max(0, Math.min(100, Math.round(attendance + study + gpa + parent + internet + extra + sleep)));
}

const predForm = document.getElementById('pred-form');
if (predForm) {
    predForm.addEventListener('submit', event => {
        event.preventDefault();

        const values = readFormValues();
        const score = calculateScore(values);
        const grade = getGrade(score);
        const confidence = Math.max(72, Math.min(97, 80 + Math.round(values.attendance / 10)));

        document.getElementById('pr-placeholder').style.display = 'none';
        document.getElementById('pr-content').style.display = 'block';
        document.getElementById('gauge-val').textContent = `${score}%`;
        document.getElementById('grade-letter').textContent = grade.letter;
        document.getElementById('grade-text').textContent = grade.text;
        document.getElementById('pred-gpa').textContent = grade.gpa;
        document.getElementById('pred-conf').textContent = `${confidence}%`;

        const recList = document.getElementById('rec-list');
        recList.innerHTML = getRecommendations(values, score).map(item => `<li>${item}</li>`).join('');

        drawGauge(score);
        renderImportance(values);
    });
}

animateAlgorithmBars();
drawGauge(0);
