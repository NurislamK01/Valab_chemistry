const practiceLessons = [
    { id: 'nitrogen', title: '1-сабақ. Азот', desc: 'Азоттың құрылысы, қасиеттері және маңызды қосылыстары.' },
    { id: 'phosphorus', title: '2-сабақ. Фосфор', desc: 'Фосфордың аллотропиясы, қышқылдары және қолданылуы.' },
    { id: 'arsenic', title: '3-сабақ. Мышьяк', desc: 'Мышьяктың металлоидтық қасиеттері және GaAs материалы.' },
    { id: 'antimony', title: '4-сабақ. Сүрьма', desc: 'Сүрьманың қосылыстары, стибнит және техникалық қолданылуы.' },
    { id: 'bismuth', title: '5-сабақ. Висмут', desc: 'Висмуттың ерекшелігі, медицинадағы және қорытпалардағы рөлі.' },
    { id: 'compounds', title: '6-сабақ. Қосылыстар мен реакциялар', desc: 'Габер процесі, Оствальд процесі және VA топ қосылыстары.' }
];

const practiceDbName = 'valab-practice-db';
const practiceStoreName = 'practice-files';
let practiceDb = null;

function openPracticeDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(practiceDbName, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            const store = db.createObjectStore(practiceStoreName, { keyPath: 'id' });
            store.createIndex('lessonId', 'lessonId', { unique: false });
        };
        request.onsuccess = () => {
            practiceDb = request.result;
            resolve(practiceDb);
        };
        request.onerror = () => reject(request.error);
    });
}

function addPracticeFile(record) {
    return new Promise((resolve, reject) => {
        const tx = practiceDb.transaction(practiceStoreName, 'readwrite');
        tx.objectStore(practiceStoreName).add(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

function getLessonFiles(lessonId) {
    return new Promise((resolve, reject) => {
        const tx = practiceDb.transaction(practiceStoreName, 'readonly');
        const index = tx.objectStore(practiceStoreName).index('lessonId');
        const request = index.getAll(lessonId);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

function deletePracticeFile(id) {
    return new Promise((resolve, reject) => {
        const tx = practiceDb.transaction(practiceStoreName, 'readwrite');
        tx.objectStore(practiceStoreName).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

function getFileUrl(file) {
    return URL.createObjectURL(file.blob);
}

function renderPracticeCards() {
    const grid = document.getElementById('practice-grid');
    if (!grid) return;

    grid.innerHTML = practiceLessons.map(lesson => `
        <article class="practice-card glass animate-on-scroll" id="lesson-${lesson.id}">
            <div class="practice-card-top">
                <div>
                    <div class="practice-lesson-tag">Практика нәтижесі</div>
                    <h3>${lesson.title}</h3>
                    <p>${lesson.desc}</p>
                </div>
                <a class="btn btn-outline btn-sm practice-theory-link" href="theory.html">Теорияға өту</a>
            </div>

            <div class="practice-upload-grid">
                <div class="practice-upload-box">
                    <div class="practice-upload-head">
                        <h4>ҚМЖ</h4>
                        <span>DOC, DOCX, PDF</span>
                    </div>
                    <label class="practice-upload-label">
                        <input type="file" class="practice-input" data-lesson="${lesson.id}" data-type="plan" accept=".doc,.docx,.pdf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" multiple>
                        <span>ҚМЖ жүктеу</span>
                    </label>
                    <div class="practice-file-list" id="plan-list-${lesson.id}"></div>
                </div>

                <div class="practice-upload-box">
                    <div class="practice-upload-head">
                        <h4>Презентациялар</h4>
                        <span>PPT, PPTX, PDF</span>
                    </div>
                    <label class="practice-upload-label">
                        <input type="file" class="practice-input" data-lesson="${lesson.id}" data-type="presentation" accept=".ppt,.pptx,.pdf,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" multiple>
                        <span>Презентация жүктеу</span>
                    </label>
                    <div class="practice-file-list" id="presentation-list-${lesson.id}"></div>
                </div>

                <div class="practice-upload-box">
                    <div class="practice-upload-head">
                        <h4>Суреттер</h4>
                        <span>JPG, PNG, WEBP</span>
                    </div>
                    <label class="practice-upload-label">
                        <input type="file" class="practice-input" data-lesson="${lesson.id}" data-type="image" accept="image/*" multiple>
                        <span>Сурет жүктеу</span>
                    </label>
                    <div class="practice-file-list" id="image-list-${lesson.id}"></div>
                </div>
            </div>
        </article>
    `).join('');
}

function fileItemTemplate(file) {
    const url = getFileUrl(file);
    const isImage = file.type === 'image';
    const preview = isImage
        ? `<img src="${url}" alt="${file.name}" class="practice-thumb">`
        : `<div class="practice-file-icon">${file.type === 'plan' ? '📝' : '📄'}</div>`;

    return `
        <div class="practice-file-item">
            <div class="practice-file-main">
                ${preview}
                <div class="practice-file-meta">
                    <strong>${file.name}</strong>
                    <span>${formatFileSize(file.size)} · ${new Date(file.createdAt).toLocaleDateString('kk-KZ')}</span>
                </div>
            </div>
            <div class="practice-file-actions">
                <a class="btn btn-outline btn-sm" href="${url}" target="_blank" rel="noopener">Ашу</a>
                <a class="btn btn-outline btn-sm" href="${url}" download="${file.name}">Жүктеу</a>
                <button class="btn btn-danger btn-sm practice-delete-btn" data-id="${file.id}">Өшіру</button>
            </div>
        </div>
    `;
}

async function renderLessonFiles(lessonId) {
    const files = await getLessonFiles(lessonId);
    const planList = document.getElementById(`plan-list-${lessonId}`);
    const presentationList = document.getElementById(`presentation-list-${lessonId}`);
    const imageList = document.getElementById(`image-list-${lessonId}`);
    if (!planList || !presentationList || !imageList) return;

    const plans = files.filter(file => file.type === 'plan').sort((a, b) => b.createdAt - a.createdAt);
    const presentations = files.filter(file => file.type === 'presentation').sort((a, b) => b.createdAt - a.createdAt);
    const images = files.filter(file => file.type === 'image').sort((a, b) => b.createdAt - a.createdAt);

    planList.innerHTML = plans.length
        ? plans.map(fileItemTemplate).join('')
        : '<div class="practice-empty">Бұл сабаққа ҚМЖ жүктелмеген.</div>';

    presentationList.innerHTML = presentations.length
        ? presentations.map(fileItemTemplate).join('')
        : '<div class="practice-empty">Бұл сабаққа презентация жүктелмеген.</div>';

    imageList.innerHTML = images.length
        ? images.map(fileItemTemplate).join('')
        : '<div class="practice-empty">Бұл сабаққа сурет жүктелмеген.</div>';
}

async function handlePracticeUpload(event) {
    const input = event.target;
    const files = Array.from(input.files || []);
    if (!files.length) return;

    const lessonId = input.dataset.lesson;
    const type = input.dataset.type;

    for (const file of files) {
        const record = {
            id: `${lessonId}-${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            lessonId,
            type,
            name: file.name,
            size: file.size,
            mimeType: file.type || '',
            createdAt: Date.now(),
            blob: file
        };
        await addPracticeFile(record);
    }

    await renderLessonFiles(lessonId);
    input.value = '';
    if (typeof showNotif === 'function') showNotif('Файлдар практика нәтижесіне сақталды');
}

async function handleDeleteClick(event) {
    const button = event.target.closest('.practice-delete-btn');
    if (!button) return;

    const fileId = button.dataset.id;
    await deletePracticeFile(fileId);

    for (const lesson of practiceLessons) {
        await renderLessonFiles(lesson.id);
    }
    if (typeof showNotif === 'function') showNotif('Файл өшірілді');
}

async function initPracticePage() {
    const grid = document.getElementById('practice-grid');
    if (!grid || !window.indexedDB) return;

    await openPracticeDb();
    renderPracticeCards();

    for (const lesson of practiceLessons) {
        await renderLessonFiles(lesson.id);
    }

    document.querySelectorAll('.practice-input').forEach(input => {
        input.addEventListener('change', handlePracticeUpload);
    });

    grid.addEventListener('click', handleDeleteClick);
}

initPracticePage().catch(() => {
    const grid = document.getElementById('practice-grid');
    if (grid) {
        grid.innerHTML = '<div class="glass practice-error">Бұл браузерде файл сақтау функциясы қолжетімсіз.</div>';
    }
});
