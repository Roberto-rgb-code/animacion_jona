function createFallbackScene() {
    // Crear geometrías de respaldo grandes y visibles
    
    // Esfera animada izquierda - MUY GRANDE
    const sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sphereMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x667eea,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.6,
        transparent: true,
        opacity: 0.9
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(-8, 0, 0);
    sphere.userData = { 
        originalY: 0, 
        type: 'fallback',
        animationType: 'float',
        fileName: 'fallback_left'
    };
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);
    models.push(sphere);

    // Cubo animado derecha - MUY GRANDE
    const boxGeometry = new THREE.BoxGeometry(10, 10, 10);  // Más grande para respaldo
    const boxMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x764ba2,
        metalness: 0.8,
        roughness: 0.2
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(8, 2, 0);
    box.userData = { 
        originalY: 2, 
        type: 'fallback',
        animationType: 'rotate',
        fileName: 'fallback_right'
    };
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);
    models.push(box);

    // Torus central - MUY GRANDE
    const torusGeometry = new THREE.TorusGeometry(6, 2, 16, 100);
    const torusMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.5,
        roughness: 0.3,
        wireframe: true
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(0, 0, -8);
    torus.userData = { 
        type: 'fallback',
        animationType: 'spin',
        fileName: 'fallback_center'
    };
    torus.castShadow = true;
    torus.receiveShadow = true;
    scene.add(torus);
    models.push(torus);

    // Partículas de fondo
    createParticles();
    
    console.log('🎯 Geometrías de respaldo GRANDES creadas');
    console.log(`📊 Total modelos: ${models.length}`);
}import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Variables principales
let scene, camera, renderer, controls;
const mixers = [];
const clock = new THREE.Clock();
let models = [];
let scrollY = 0;
let currentScrollY = 0;

// Configuración de scroll suave
const lerp = (start, end, factor) => start + (end - start) * factor;

// Inicialización
init();
animate();
setupScrollEffects();

function init() {
    // Crear escena
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x111111, 10, 50);

    // Configurar cámara
    camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );
    camera.position.set(0, 2, 20);

    // Configurar renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: false,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a0a);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    document.body.appendChild(renderer.domElement);

    // Configurar controles
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 1.8;
    controls.minDistance = 10;
    controls.maxDistance = 40;

    // Configurar iluminación mejorada
    setupLighting();

    // Crear escena base con geometrías si no hay modelos FBX
    createFallbackScene();

    // Intentar cargar modelos FBX - FLOATING ABSOLUTAMENTE COLOSAL
    loadFBXModel('base.fbx', -8, 0, 0, 0.1);      // 10 veces más grande (REGRESADO COMO ESTABA)
    loadFBXModel('Floating.fbx', 8, 2, 0, 10.0);  // 3000 veces más grande - ABSOLUTAMENTE COLOSAL!!!

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('scroll', onScroll);
}

function setupLighting() {
    // Luz ambiental más intensa
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    scene.add(ambientLight);

    // Luz hemisférica
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    hemisphereLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);

    // Luz direccional principal más intensa
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    scene.add(dirLight);

    // Luz adicional para iluminar el área de Floating.fbx
    const spotLight = new THREE.SpotLight(0xffffff, 1.5);
    spotLight.position.set(8, 10, 10);
    spotLight.target.position.set(8, 2, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.3;
    spotLight.decay = 2;
    spotLight.distance = 30;
    scene.add(spotLight);
    scene.add(spotLight.target);

    // Luces de acento
    const pointLight1 = new THREE.PointLight(0x4f7fff, 1.0, 30);
    pointLight1.position.set(-10, 5, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff4f7f, 0.8, 25);
    pointLight2.position.set(10, -5, -10);
    scene.add(pointLight2);
}

function createFallbackForFile(fileName, posX, posY, posZ, scale) {
    console.log(`🔄 Creando respaldo para ${fileName}`);
    
    let geometry, material, mesh;
    
    if (fileName.includes('base')) {
        // Cubo normal para base.fbx (regresado)
        geometry = new THREE.BoxGeometry(8, 8, 8);
        material = new THREE.MeshPhysicalMaterial({
            color: 0xff6b6b,
            metalness: 0.7,
            roughness: 0.3,
            transparent: false
        });
        mesh = new THREE.Mesh(geometry, material);
        mesh.userData.animationType = 'rotate_base';
        console.log(`🔄 RESPALDO NORMAL CREADO PARA BASE.FBX`);
    } else if (fileName.includes('Floating')) {
        // Esfera ABSOLUTAMENTE COLOSAL para Floating.fbx
        geometry = new THREE.SphereGeometry(100, 32, 32);  // COLOSAL!!!
        material = new THREE.MeshPhysicalMaterial({
            color: 0x4ecdc4,
            metalness: 0.3,
            roughness: 0.1,
            transmission: 0.1,
            transparent: false,  // Sin transparencia para máxima visibilidad
            opacity: 1.0
        });
        mesh = new THREE.Mesh(geometry, material);
        mesh.userData.animationType = 'float_sphere';
        console.log(`🔄🔄🔄🔄🔄 RESPALDO ABSOLUTAMENTE COLOSAL CREADO PARA FLOATING.FBX`);
    }
    
    if (mesh) {
        mesh.position.set(posX, posY, posZ);
        mesh.scale.setScalar(scale * 10); // Hacer el respaldo aún más grande
        mesh.userData.fileName = fileName + '_fallback';
        mesh.userData.originalPosition = { x: posX, y: posY, z: posZ };
        mesh.userData.type = 'fallback';
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        scene.add(mesh);
        models.push(mesh);
        
        console.log(`✅ Respaldo creado para ${fileName} en posición (${posX}, ${posY}, ${posZ})`);
    }
}

function createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.005,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    models.push(particlesMesh);
}

function loadFBXModel(file, posX, posY, posZ, scale = 0.05) {
    const loader = new FBXLoader();
    
    loader.load(
        file,
        (object) => {
            // Configurar modelo con escala MUY GRANDE
            object.scale.setScalar(scale);
            object.position.set(posX, posY, posZ);
            
            // Debug detallado
            console.log(`🔍 === CARGANDO ${file} ===`);
            console.log(`📦 Posición: (${posX}, ${posY}, ${posZ})`);
            console.log(`📏 Escala: ${scale} (${scale * 100}x más grande que 0.01)`);
            
            // Para Floating.fbx mostrar información especial
            if (file.includes('Floating')) {
                console.log(`🚀🚀🚀🚀🚀 FLOATING.FBX - ESCALA ABSOLUTAMENTE COLOSAL: ${scale}`);
                console.log(`🎯🎯🎯🎯🎯 DEBERÍA SER 3000 VECES MÁS GRANDE QUE EL ORIGINAL!!!`);
                console.log(`👁️‍🗨️👁️‍🗨️👁️‍🗨️ ESCALA 30.0 - DEBERÍA LLENAR TODA LA PANTALLA!!!`);
                console.log(`🔥🔥🔥 FLOATING ES AHORA 300 VECES MÁS GRANDE QUE BASE!!!`);
            }
            
            // Para base.fbx mostrar información especial
            if (file.includes('base')) {
                console.log(`🏗️ BASE.FBX - ESCALA NORMAL: ${scale}`);
                console.log(`📦 REGRESADO A 10 VECES MÁS GRANDE QUE EL ORIGINAL`);
            }
            
            console.log(`📐 Dimensiones del objeto:`, object);
            
            // Calcular bounding box
            const box = new THREE.Box3().setFromObject(object);
            const size = box.getSize(new THREE.Vector3());
            console.log(`📊 Tamaño real: ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`);
            
            // Habilitar sombras y mejorar visibilidad
            object.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    console.log(`🎨 Mesh encontrado: ${child.name || 'Sin nombre'}`);
                    
                    // Hacer el material más visible
                    if (child.material) {
                        // Si es un array de materiales
                        const materials = Array.isArray(child.material) ? child.material : [child.material];
                        
                        materials.forEach((material, idx) => {
                            console.log(`🎨 Material ${idx}:`, material.type);
                            
                            // Asegurar que el material sea visible
                            material.transparent = false;
                            material.opacity = 1.0;
                            material.needsUpdate = true;
                            
                            // Añadir emisión para mayor visibilidad
                            if (material.emissive !== undefined) {
                                material.emissive.setHex(0x222222);
                            }
                            
                            // Si es muy oscuro, aclararlo
                            if (material.color && material.color.getHex() < 0x333333) {
                                material.color.setHex(0x888888);
                                console.log(`💡 Material muy oscuro, aclarado`);
                            }
                        });
                    }
                }
            });
            
            // Asignar userData
            object.userData.fileName = file;
            object.userData.originalPosition = { x: posX, y: posY, z: posZ };
            object.userData.boundingBox = box;
            object.userData.size = size;
            
            scene.add(object);
            models.push(object);
            
            console.log(`✅ ${file} añadido a la escena`);
            console.log(`📍 Total de modelos en escena: ${models.length}`);
            console.log(`🔍 === FIN CARGA ${file} ===\n`);

            // Configurar animaciones
            if (object.animations && object.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(object);
                object.userData.mixer = mixer;
                
                object.animations.forEach((clip, index) => {
                    const action = mixer.clipAction(clip);
                    action.setLoop(THREE.LoopRepeat);
                    action.clampWhenFinished = true;
                    action.play();
                    console.log(`🎬 Animación ${index + 1} en ${file} - Duración: ${clip.duration.toFixed(2)}s`);
                });
                
                mixers.push(mixer);
                console.log(`🎞️ Total mixers activos: ${mixers.length}`);
            } else {
                console.log(`ℹ️ ${file} no tiene animaciones incluidas`);
            }
        },
        (progress) => {
            if (progress.total > 0) {
                const percentage = (progress.loaded / progress.total * 100).toFixed(1);
                console.log(`📈 Cargando ${file}: ${percentage}%`);
            }
        },
        (error) => {
            console.error(`❌ ERROR cargando ${file}:`, error);
            console.log(`🔄 Usando geometría de respaldo para ${file}`);
            
            // Crear geometría de respaldo específica para el archivo fallido
            createFallbackForFile(file, posX, posY, posZ, scale);
        }
    );
}

function onScroll() {
    scrollY = window.pageYOffset;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateScrollAnimations() {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = Math.min(scrollY / maxScroll, 1);
    
    // Actualizar barra de progreso
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.transform = `scaleX(${scrollProgress})`;
    }

    // Smooth scroll interpolation
    currentScrollY = lerp(currentScrollY, scrollY, 0.1);
    const smoothProgress = Math.min(currentScrollY / maxScroll, 1);

    // Actualizar animaciones de modelos FBX
    mixers.forEach((mixer, index) => {
        if (mixer._actions && mixer._actions.length > 0) {
            mixer._actions.forEach((action) => {
                const clip = action.getClip();
                if (clip) {
                    // Control más preciso de la animación
                    const newTime = smoothProgress * clip.duration;
                    action.time = Math.max(0, Math.min(newTime, clip.duration));
                    mixer.update(0); // No acumulativo
                }
            });
        }
    });

    // Animar modelos FBX adicionales basado en scroll
    models.forEach((model, index) => {
        const time = clock.getElapsedTime();
        const scrollOffset = smoothProgress * Math.PI * 2;
        
        if (model.userData.fileName) {
            // Animación específica para Floating.fbx
            if (model.userData.fileName.includes('Floating')) {
                // MOVIMIENTO COLOSAL para modelo COLOSAL
                model.position.y = model.userData.originalPosition.y + 
                    Math.sin(time * 0.3 + scrollOffset) * 15; // Movimiento GIGANTESCO
                model.rotation.y = time * 0.2 + scrollOffset;
                
                // Balanceo suave para objeto gigante
                model.rotation.x = Math.sin(time * 0.5) * 0.1;
                model.rotation.z = Math.cos(time * 0.3) * 0.05;
                
                // Color ULTRA visible
                model.traverse((child) => {
                    if (child.isMesh && child.material && child.material.color) {
                        const hue = (time * 0.15) % 1;
                        child.material.color.setHSL(hue, 1.0, 0.8); // Súper brillante
                        child.material.emissive.setHSL(hue, 0.8, 0.4); // Emisión máxima
                    }
                });
                
                console.log(`🎯🎯🎯 Floating COLOSAL animándose en Y: ${model.position.y.toFixed(2)}`);
            }
            
            // Animación para base.fbx (regresada a normal)
            if (model.userData.fileName.includes('base')) {
                model.rotation.y = scrollOffset * 0.5;
                model.position.y = model.userData.originalPosition.y + 
                    Math.cos(time * 0.3) * 1; // Movimiento normal
                    
                // Color normal
                model.traverse((child) => {
                    if (child.isMesh && child.material && child.material.color) {
                        const hue = ((time * 0.05) + 0.5) % 1;
                        child.material.color.setHSL(hue, 0.7, 0.5);
                        if (child.material.emissive) {
                            child.material.emissive.setHSL(hue, 0.2, 0.1);
                        }
                    }
                });
            }
        }
        
        // Animaciones para geometrías de respaldo también
        if (model.userData.type === 'fallback') {
            switch (model.userData.animationType) {
                case 'float':
                case 'float_sphere':
                    model.position.y = model.userData.originalY + 
                        Math.sin(time + scrollOffset) * 4;
                    model.rotation.y = scrollOffset;
                    break;
                    
                case 'rotate':
                case 'rotate_base':
                    model.rotation.x = scrollOffset;
                    model.rotation.y = time * 0.5;
                    model.position.y = model.userData.originalY + 
                        Math.cos(time + scrollOffset) * 2;
                    break;
                    
                case 'spin':
                    model.rotation.x = time * 0.3;
                    model.rotation.y = scrollOffset * 0.5;
                    model.rotation.z = time * 0.2;
                    break;
            }
        }
    });

    // Animar modelos de respaldo
    models.forEach((model, index) => {
        if (model.userData.type === 'fallback') {
            const time = clock.getElapsedTime();
            const scrollOffset = smoothProgress * Math.PI * 4;
            
            switch (model.userData.animationType) {
                case 'float':
                    model.position.y = model.userData.originalY + 
                        Math.sin(time + scrollOffset) * 2;
                    model.rotation.y = scrollOffset;
                    break;
                    
                case 'rotate':
                    model.rotation.x = scrollOffset;
                    model.rotation.y = time * 0.5;
                    model.position.y = Math.cos(time + scrollOffset) * 1.5;
                    break;
                    
                case 'spin':
                    model.rotation.x = time * 0.3;
                    model.rotation.y = scrollOffset * 0.5;
                    model.rotation.z = time * 0.2;
                    break;
            }
        }
    });

    // Animar cámara basada en scroll
    const targetCameraY = 2 + (smoothProgress * 10);
    const targetCameraZ = 20 - (smoothProgress * 8);
    
    camera.position.y = lerp(camera.position.y, targetCameraY, 0.02);
    camera.position.z = lerp(camera.position.z, targetCameraZ, 0.02);
}

function setupScrollEffects() {
    // Intersection Observer para las tarjetas de contenido
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observar todas las tarjetas de contenido
    document.querySelectorAll('.content-card').forEach((card) => {
        observer.observe(card);
    });
}

function animate() {
    requestAnimationFrame(animate);

    // Actualizar animaciones basadas en scroll
    updateScrollAnimations();

    // Actualizar controles
    controls.update();

    // Renderizar escena
    renderer.render(scene, camera);
}