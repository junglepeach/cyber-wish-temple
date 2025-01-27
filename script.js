let scene, camera, renderer, controls, burner;
let particleMaterial, smokeMaterial;
let incenseParticles = [];
let smokeParticles = [];
let isSceneInitialized = false;

// 初始化场景
async function initScene() {
    try {
        // 创建场景
        scene = new THREE.Scene();
        console.log('Scene created');
        
        // 创建相机
        camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 1, 4);
        camera.lookAt(0, 0, 0);
        
        // 创建渲染器
        const canvas = document.getElementById('burner-canvas');
        if (!canvas) {
            throw new Error('Canvas element not found');
        }
        
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        
        // 创建控制器
        controls = new THREE.OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 2;
        controls.maxDistance = 8;
        controls.minPolarAngle = Math.PI / 4;
        controls.maxPolarAngle = Math.PI / 1.5;
        
        // 添加环境光和定向光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffd700, 1);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // 创建香火粒子材质
        particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            color: 0xff3300,
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.8
        });

        // 创建烟雾粒子材质
        smokeMaterial = new THREE.PointsMaterial({
            size: 0.2,
            color: 0x666666,
            transparent: true,
            opacity: 0.4
        });
        
        // 加载模型
        await loadModel();
        
        // 处理窗口大小变化
        window.addEventListener('resize', onWindowResize, false);
        
        isSceneInitialized = true;
        console.log('Scene initialized successfully');
    } catch (error) {
        console.error('Error initializing scene:', error);
        throw error;
    }
}// 加载模型
function loadModel() {
    return new Promise((resolve, reject) => {
        const loader = new THREE.GLTFLoader();
        console.log('Loading model...');
        
        loader.load(
            'models/Tibetan_Ritual_Incens_0127051158_texture.glb',
            function (gltf) {
                burner = gltf.scene;
                burner.scale.set(2, 2, 2);
                burner.position.set(0, 0, 0);
                scene.add(burner);
                console.log('Model loaded successfully');
                resolve();
            },
            function (progress) {
                console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
            },
            function (error) {
                console.error('Error loading model:', error);
                reject(error);
            }
        );
    });
}

// 创建香火效果
function createIncenseEffect(type) {
    const particleCount = getParticleCount(type);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for(let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 0.1;
        positions[i * 3 + 1] = 1;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(geometry, particleMaterial);
    
    scene.add(particles);
    incenseParticles.push({
        points: particles,
        velocities: Array(particleCount).fill().map(() => ({
            x: (Math.random() - 0.5) * 0.01,
            y: Math.random() * 0.02 + 0.02,
            z: (Math.random() - 0.5) * 0.01
        }))
    });

    createSmokeEffect(particleCount / 2);
}

// 创建烟雾效果
function createSmokeEffect(particleCount) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for(let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 0.2;
        positions[i * 3 + 1] = 1.5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(geometry, smokeMaterial);
    
    scene.add(particles);
    smokeParticles.push({
        points: particles,
        velocities: Array(particleCount).fill().map(() => ({
            x: (Math.random() - 0.5) * 0.005,
            y: Math.random() * 0.01 + 0.005,
            z: (Math.random() - 0.5) * 0.005
        }))
    });
}

// 获取粒子数量
function getParticleCount(type) {
    switch(type) {
        case 'medium': return 100;
        case 'large': return 200;
        case 'extra': return 300;
        case 'super': return 500;
        default: return 100;
    }
}

// 更新粒子
function updateParticles() {
    incenseParticles.forEach((system, index) => {
        const positions = system.points.geometry.attributes.position.array;
        
        for(let i = 0; i < positions.length; i += 3) {
            const velocity = system.velocities[i / 3];
            positions[i] += velocity.x;
            positions[i + 1] += velocity.y;
            positions[i + 2] += velocity.z;
            
            if(positions[i + 1] > 3) {
                positions[i] = (Math.random() - 0.5) * 0.1;
                positions[i + 1] = 1;
                positions[i + 2] = (Math.random() - 0.5) * 0.1;
            }
        }
        
        system.points.geometry.attributes.position.needsUpdate = true;
    });

    smokeParticles.forEach((system, index) => {
        const positions = system.points.geometry.attributes.position.array;
        
        for(let i = 0; i < positions.length; i += 3) {
            const velocity = system.velocities[i / 3];
            positions[i] += velocity.x;
            positions[i + 1] += velocity.y;
            positions[i + 2] += velocity.z;
            
            if(positions[i + 1] > 4) {
                positions[i] = (Math.random() - 0.5) * 0.2;
                positions[i + 1] = 1.5;
                positions[i + 2] = (Math.random() - 0.5) * 0.2;
            }
        }
        
        system.points.geometry.attributes.position.needsUpdate = true;
    });
}// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    if (!isSceneInitialized) {
        return;
    }
    
    try {
        if (controls) {
            controls.update();
        }
        
        if (burner) {
            burner.rotation.y += 0.001;
        }

        updateParticles();
        
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    } catch (error) {
        console.error('Error in animation loop:', error);
    }
}

// 窗口大小调整处理
function onWindowResize() {
    if (!camera || !renderer) return;
    
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
}

// 播放上香动画
function playIncenseAnimation(type) {
    const animationArea = document.querySelector('.animation-area');
    const messageArea = document.querySelector('.message-area');
    const harmonicaAudio = document.getElementById('harmonica');
    
    // 清除之前的动画和消息
    animationArea.innerHTML = '';
    messageArea.innerHTML = '';
    
    switch(type) {
        case 'medium':
            harmonicaAudio.play();
            // 创建菩萨图片
            const buddha = document.createElement('div');
            buddha.className = 'buddha-image';
            animationArea.appendChild(buddha);
            
            // 添加图片动画效果
            gsap.from(buddha, {
                y: -50,
                scale: 0,
                opacity: 0,
                duration: 1.5,
                ease: 'power2.out',
                onComplete: () => {
                    showMessage('好人一生平安！');
                }
            });
            break;
        case 'large':
            createPersimmon();
            break;
        case 'extra':
            createFireworks();
            break;
        case 'super':
            createFortuneGod();
            break;
    }
}

// 显示消息
function showMessage(text) {
    const messageArea = document.querySelector('.message-area');
    messageArea.innerHTML = ''; // 清除之前的消息
    
    const message = document.createElement('div');
    message.className = 'blessing-message';
    message.textContent = text;
    messageArea.appendChild(message);
    
    gsap.from(message, {
        y: -30,
        scale: 0,
        opacity: 0,
        duration: 1,
        ease: 'back.out(1.7)'
    });
}

// 创建柿子动画
function createPersimmon() {
    const animationArea = document.querySelector('.animation-area');
    const persimmon = document.createElement('div');
    persimmon.className = 'persimmon';
    animationArea.appendChild(persimmon);
    
    gsap.from(persimmon, {
        y: -300,
        scale: 0,
        rotation: 720,
        duration: 1.5,
        ease: 'bounce.out',
        opacity: 0,
        onStart: function() {
            gsap.to(persimmon, {
                opacity: 1,
                duration: 0.3
            });
        },
        onComplete: () => {
            showMessage('事事如意！');
            gsap.to(persimmon, {
                scale: 1.2,
                duration: 0.3,
                yoyo: true,
                repeat: 1
            });
        }
    });
}// 创建烟花动画
function createFireworks() {
    const animationArea = document.querySelector('.animation-area');
    
    // 创建视频容器
    const fireworkContainer = document.createElement('div');
    fireworkContainer.className = 'firework-video';
    
    // 创建视频元素
    const video = document.createElement('video');
    video.src = 'videos/firework.mp4';
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    
    fireworkContainer.appendChild(video);
    animationArea.appendChild(fireworkContainer);
    
    // 添加视频加载完成事件
    video.addEventListener('loadeddata', () => {
        gsap.from(fireworkContainer, {
            scale: 0,
            opacity: 0,
            duration: 1,
            ease: 'power2.out'
        });
    });
    
    setTimeout(() => {
        showMessage('幸福美好！');
    }, 500);
}

// 创建财神和金元宝动画
function createFortuneGod() {
    const animationArea = document.querySelector('.animation-area');
    
    // 创建财神视频
    const fortuneGodContainer = document.createElement('div');
    fortuneGodContainer.className = 'fortune-god';
    const video = document.createElement('video');
    video.src = 'videos/fortune-god.mp4';
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    fortuneGodContainer.appendChild(video);
    animationArea.appendChild(fortuneGodContainer);

    // 创建金元宝容器
    const goldIngotsContainer = document.createElement('div');
    goldIngotsContainer.className = 'gold-ingots-container';
    animationArea.appendChild(goldIngotsContainer);
    
    // 创建金元宝
    for(let i = 0; i < 15; i++) {
        const goldIngot = document.createElement('div');
        goldIngot.className = 'gold-ingot';
        goldIngotsContainer.appendChild(goldIngot);
        
        // 计算金元宝的随机位置（限制在容器内）
        const randomX = (Math.random() - 0.5) * 300;
        const randomY = (Math.random() - 0.5) * 300;
        
        gsap.from(goldIngot, {
            x: randomX,
            y: randomY,
            rotation: Math.random() * 1080,
            scale: 0,
            duration: 2,
            delay: Math.random() * 0.7,
            ease: 'bounce.out',
            opacity: 0,
            onStart: function() {
                gsap.to(goldIngot, {
                    opacity: 1,
                    duration: 0.3
                });
            }
        });
    }
    
    // 添加视频加载完成事件
    video.addEventListener('loadeddata', () => {
        gsap.from(fortuneGodContainer, {
            x: 100,
            opacity: 0,
            duration: 1,
            ease: 'power2.out'
        });
    });
    
    setTimeout(() => {
        showMessage('心想事成！');
    }, 800);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('DOM Content Loaded');
        await initScene();
        animate();
        
        // 添加上香按钮点击事件
        const buyButtons = document.querySelectorAll('.buy-btn');
        buyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const type = button.parentElement.dataset.type;
                createIncenseEffect(type);
                playIncenseAnimation(type);
            });
        });

        // 添加分享和赠送按钮的点击事件
        const shareBtn = document.querySelector('.share-btn');
        const giftBtn = document.querySelector('.gift-btn');

        shareBtn.addEventListener('click', () => {
            const animationArea = document.querySelector('.animation-area');
            const messageArea = document.querySelector('.message-area');
            
            // 清除之前的动画和消息
            animationArea.innerHTML = '';
            messageArea.innerHTML = '';
            
            // 显示分享提示消息
            showMessage('阿弥陀佛，请施主自行复制网页给善信，阿弥陀佛');
        });

        giftBtn.addEventListener('click', () => {
            const animationArea = document.querySelector('.animation-area');
            const messageArea = document.querySelector('.message-area');
            
            // 清除之前的动画和消息
            animationArea.innerHTML = '';
            messageArea.innerHTML = '';
            
            // 显示赠送提示消息
            showMessage('阿弥陀佛，请施主自行选择香型，点击上香即可，阿弥陀佛');
        });

        // 添加图片点击事件
        const incenseImages = document.querySelectorAll('.incense-item img');
        const imageModal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const closeModal = document.querySelector('.close-modal');

        incenseImages.forEach(img => {
            img.addEventListener('click', function(e) {
                e.stopPropagation();
                modalImage.src = this.src;
                imageModal.style.display = 'block';
            });
        });

        imageModal.addEventListener('click', function() {
            this.style.display = 'none';
        });

        closeModal.addEventListener('click', function(e) {
            e.stopPropagation();
            imageModal.style.display = 'none';
        });
        
        console.log('Scene started');
    } catch (error) {
        console.error('Failed to initialize scene:', error);
    }
});