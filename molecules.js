/* ===== 3D Molecule Viewer (Three.js) ===== */
const molData={
    NH3:{name:'Аммиак (NH₃)',formula:'NH₃',geometry:'Тригоналды пирамида',angle:'107.8°',hybrid:'sp³',polar:'Полярлы',desc:'Аммиак — түссіз, өткір иісті газ. Азот атомында бір бөлінбеген электрон жұбы бар, ол молекулаға пирамидалық пішін береді. Габер процесі арқылы өндіріледі: N₂ + 3H₂ → 2NH₃.',
        atoms:[{el:'N',pos:[0,.3,0],color:0x4fc3f7,r:.4},{el:'H',pos:[.8,-.3,.5],color:0xffffff,r:.25},{el:'H',pos:[-.8,-.3,.5],color:0xffffff,r:.25},{el:'H',pos:[0,-.3,-.9],color:0xffffff,r:.25}],
        bonds:[[0,1],[0,2],[0,3]]},
    NO2:{name:'Азот диоксиді (NO₂)',formula:'NO₂',geometry:'Бұрыштық (V-тәрізді)',angle:'134.1°',hybrid:'sp²',polar:'Полярлы',desc:'NO₂ — қоңыр түсті, улы газ. Атмосфераны ластаушы зат. Азот қышқылы өндірісінде аралық өнім.',
        atoms:[{el:'N',pos:[0,.3,0],color:0x4fc3f7,r:.35},{el:'O',pos:[.7,-.3,0],color:0xef5350,r:.3},{el:'O',pos:[-.7,-.3,0],color:0xef5350,r:.3}],
        bonds:[[0,1],[0,2]]},
    HNO3:{name:'Азот қышқылы (HNO₃)',formula:'HNO₃',geometry:'Жазық тригоналды',angle:'120° (шамамен)',hybrid:'sp²',polar:'Полярлы',desc:'HNO₃ — күшті қышқыл және тотықтырғыш. Тыңайтқыштар, жарылғыш заттар, бояулар өндірісінде қолданылады.',
        atoms:[{el:'N',pos:[0,0,0],color:0x4fc3f7,r:.35},{el:'O',pos:[.8,.5,0],color:0xef5350,r:.3},{el:'O',pos:[-.8,.5,0],color:0xef5350,r:.3},{el:'O',pos:[0,-.8,0],color:0xef5350,r:.3},{el:'H',pos:[.5,-.9,.6],color:0xffffff,r:.2}],
        bonds:[[0,1],[0,2],[0,3],[3,4]]},
    P4:{name:'Тетрафосфор (P₄)',formula:'P₄',geometry:'Тетраэдр',angle:'60°',hybrid:'sp³',polar:'Бейполярлы',desc:'P₄ — ақ фосфордың молекулалық формуласы. Тетраэдр тәрізді, бұрыштары фосфор атомдарынан тұрады. Ауада өздігінен тұтанады, қараңғыда жарқырайды.',
        atoms:[{el:'P',pos:[0,.8,0],color:0xff7043,r:.38},{el:'P',pos:[.75,-.3,.45],color:0xff7043,r:.38},{el:'P',pos:[-.75,-.3,.45],color:0xff7043,r:.38},{el:'P',pos:[0,-.3,-.9],color:0xff7043,r:.38}],
        bonds:[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]]},
    PCl3:{name:'Фосфор трихлориді (PCl₃)',formula:'PCl₃',geometry:'Тригоналды пирамида',angle:'100.3°',hybrid:'sp³',polar:'Полярлы',desc:'PCl₃ — түссіз сұйық, хлорлаушы агент. Фосфор атомында бөлінбеген электрон жұбы бар. Органикалық синтезде қолданылады.',
        atoms:[{el:'P',pos:[0,.3,0],color:0xff7043,r:.38},{el:'Cl',pos:[.9,-.4,.5],color:0x66bb6a,r:.35},{el:'Cl',pos:[-.9,-.4,.5],color:0x66bb6a,r:.35},{el:'Cl',pos:[0,-.4,-1],color:0x66bb6a,r:.35}],
        bonds:[[0,1],[0,2],[0,3]]},
    PCl5:{name:'Фосфор пентахлориді (PCl₅)',formula:'PCl₅',geometry:'Тригоналды бипирамида',angle:'90°/120°',hybrid:'sp³d',polar:'Бейполярлы',desc:'PCl₅ — қатты зат, 5 хлор атомы фосфорды қоршайды. Тригоналды бипирамида пішіні — 3 экваторлық (120°) және 2 аксиалды (90°) байланыс.',
        atoms:[{el:'P',pos:[0,0,0],color:0xff7043,r:.38},{el:'Cl',pos:[1,0,.2],color:0x66bb6a,r:.32},{el:'Cl',pos:[-.5,0,.85],color:0x66bb6a,r:.32},{el:'Cl',pos:[-.5,0,-.85],color:0x66bb6a,r:.32},{el:'Cl',pos:[0,1.1,0],color:0x66bb6a,r:.32},{el:'Cl',pos:[0,-1.1,0],color:0x66bb6a,r:.32}],
        bonds:[[0,1],[0,2],[0,3],[0,4],[0,5]]}
};

let scene,camera,renderer,molGroup,autoRotate=true,currentMol='NH3';

function initThree(){
    const canvas=document.getElementById('mol-canvas');
    if(!canvas)return;
    const container=document.getElementById('mol-viewer');
    const w=container.clientWidth,h=container.clientHeight||450;

    scene=new THREE.Scene();
    camera=new THREE.PerspectiveCamera(50,w/h,.1,100);
    camera.position.set(0,0,5);
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
    renderer.setSize(w,h);
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff,.6));
    const dl=new THREE.DirectionalLight(0xffffff,.8);dl.position.set(5,5,5);scene.add(dl);
    const pl=new THREE.PointLight(0x00e5ff,.5,10);pl.position.set(-3,3,3);scene.add(pl);

    molGroup=new THREE.Group();scene.add(molGroup);
    buildMolecule('NH3');

    // Mouse rotation
    let isDragging=false,prevX=0,prevY=0;
    canvas.addEventListener('mousedown',e=>{isDragging=true;prevX=e.clientX;prevY=e.clientY;autoRotate=false});
    window.addEventListener('mouseup',()=>isDragging=false);
    window.addEventListener('mousemove',e=>{if(!isDragging)return;const dx=e.clientX-prevX,dy=e.clientY-prevY;molGroup.rotation.y+=dx*.01;molGroup.rotation.x+=dy*.01;prevX=e.clientX;prevY=e.clientY});
    canvas.addEventListener('wheel',e=>{e.preventDefault();camera.position.z=Math.max(2.5,Math.min(10,camera.position.z+e.deltaY*.005))},{passive:false});
    // Touch
    canvas.addEventListener('touchstart',e=>{if(e.touches.length===1){isDragging=true;prevX=e.touches[0].clientX;prevY=e.touches[0].clientY;autoRotate=false}});
    canvas.addEventListener('touchmove',e=>{if(!isDragging||e.touches.length!==1)return;const dx=e.touches[0].clientX-prevX,dy=e.touches[0].clientY-prevY;molGroup.rotation.y+=dx*.01;molGroup.rotation.x+=dy*.01;prevX=e.touches[0].clientX;prevY=e.touches[0].clientY});
    canvas.addEventListener('touchend',()=>isDragging=false);

    function loop(){requestAnimationFrame(loop);if(autoRotate)molGroup.rotation.y+=.005;renderer.render(scene,camera)}
    loop();

    window.addEventListener('resize',()=>{const nw=container.clientWidth,nh=container.clientHeight||450;camera.aspect=nw/nh;camera.updateProjectionMatrix();renderer.setSize(nw,nh)});
}

function buildMolecule(key){
    while(molGroup.children.length)molGroup.remove(molGroup.children[0]);
    const data=molData[key];if(!data)return;
    currentMol=key;

    // Atoms
    data.atoms.forEach(a=>{
        const geo=new THREE.SphereGeometry(a.r,32,32);
        const mat=new THREE.MeshPhongMaterial({color:a.color,shininess:80,transparent:true,opacity:.9});
        const mesh=new THREE.Mesh(geo,mat);
        mesh.position.set(...a.pos);
        molGroup.add(mesh);
        // Label
        const canvas2=document.createElement('canvas');canvas2.width=64;canvas2.height=64;
        const c=canvas2.getContext('2d');c.fillStyle='#fff';c.font='bold 32px Inter';c.textAlign='center';c.textBaseline='middle';c.fillText(a.el,32,32);
        const tex=new THREE.CanvasTexture(canvas2);
        const spriteMat=new THREE.SpriteMaterial({map:tex,transparent:true});
        const sprite=new THREE.Sprite(spriteMat);
        sprite.position.set(...a.pos);sprite.position.y+=a.r+.2;sprite.scale.set(.4,.4,.4);
        molGroup.add(sprite);
    });

    // Bonds
    data.bonds.forEach(([i,j])=>{
        const a1=new THREE.Vector3(...data.atoms[i].pos),a2=new THREE.Vector3(...data.atoms[j].pos);
        const dir=new THREE.Vector3().subVectors(a2,a1);
        const len=dir.length();
        const geo=new THREE.CylinderGeometry(.06,.06,len,8);
        const mat=new THREE.MeshPhongMaterial({color:0x888888,transparent:true,opacity:.6});
        const mesh=new THREE.Mesh(geo,mat);
        mesh.position.copy(a1).add(dir.multiplyScalar(.5));
        mesh.lookAt(a2);mesh.rotateX(Math.PI/2);
        molGroup.add(mesh);
    });

    // Update info
    document.getElementById('mol-name').textContent=data.name;
    document.getElementById('mol-formula').textContent=data.formula;
    document.getElementById('mol-geometry').textContent=data.geometry;
    document.getElementById('mol-angle').textContent=data.angle;
    document.getElementById('mol-hybrid').textContent=data.hybrid;
    document.getElementById('mol-polar').textContent=data.polar;
    document.getElementById('mol-desc').querySelector('p').textContent=data.desc;
    molGroup.rotation.set(0,0,0);
    autoRotate=true;
}

// Init
initThree();

// Buttons
document.querySelectorAll('.mol-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
        document.querySelectorAll('.mol-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        buildMolecule(btn.dataset.mol);
    });
});

const resetBtn=document.getElementById('mol-reset');
if(resetBtn)resetBtn.addEventListener('click',()=>{molGroup.rotation.set(0,0,0);camera.position.z=5;autoRotate=true});
const spinBtn=document.getElementById('mol-spin');
if(spinBtn)spinBtn.addEventListener('click',()=>{autoRotate=!autoRotate});
const explainBtn=document.getElementById('mol-explain');
if(explainBtn)explainBtn.addEventListener('click',()=>{const d=molData[currentMol];if(d)showNotif(d.name+': '+d.geometry+', гибридизация '+d.hybrid+', бұрыш '+d.angle)});
