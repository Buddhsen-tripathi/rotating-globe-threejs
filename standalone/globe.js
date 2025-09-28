// Globe visualization using Three.js
class GlobeRenderer {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.globe = null;
        this.atmosphere = null;
        this.controls = null;
        this.animationId = null;
        this.time = 0;
        this.isHoveringGlobe = false; // Track if user is hovering over globe for zoom control
        this.mousePosition = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        
        this.init();
    }

    init() {
        // Hide the loading message once Three.js is ready
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';

        // Set up the complete 3D scene step by step
        this.setupScene();
        this.setupLighting();
        this.createGlobe();
        this.createAtmosphere();
        this.createStars();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.container.appendChild(this.renderer.domElement);
        this.camera.position.set(0, 0, 15);
    }

    setupLighting() {
        // Main sun light
        const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
        sunLight.position.set(15, 3, 6);
        this.scene.add(sunLight);
        
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.12);
        this.scene.add(ambientLight);
        
        // Rim light
        const rimLight = new THREE.DirectionalLight(0x87ceeb, 0.25);
        rimLight.position.set(-6, 0, -2);
        this.scene.add(rimLight);
    }

    createGlobe() {
        const loader = new THREE.TextureLoader();
        
        // Load textures
        const earthTexture = loader.load('./assets/earth-day.jpg', 
            () => console.log('Day texture loaded'),
            () => console.log('Day texture loading...'),
            (error) => {
                console.warn('Could not load day texture:', error);
                // Fallback to a simple blue texture
                const canvas = document.createElement('canvas');
                canvas.width = 1024;
                canvas.height = 512;
                const ctx = canvas.getContext('2d');
                const gradient = ctx.createLinearGradient(0, 0, 1024, 512);
                gradient.addColorStop(0, '#1e40af');
                gradient.addColorStop(1, '#1e3a8a');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 1024, 512);
                return new THREE.CanvasTexture(canvas);
            }
        );

        const nightTexture = loader.load('./assets/earth-night.jpg',
            () => console.log('Night texture loaded'),
            () => console.log('Night texture loading...'),
            (error) => {
                console.warn('Could not load night texture:', error);
                // Fallback to a simple dark texture
                const canvas = document.createElement('canvas');
                canvas.width = 1024;
                canvas.height = 512;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(0, 0, 1024, 512);
                return new THREE.CanvasTexture(canvas);
            }
        );

        const globeGeometry = new THREE.SphereGeometry(5, 128, 128);

        const globeMaterial = new THREE.ShaderMaterial({
            uniforms: {
                dayTexture: { value: earthTexture },
                nightTexture: { value: nightTexture },
                sunDirection: { value: new THREE.Vector3(1.2, 0.2, 0.5) },
                time: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D dayTexture;
                uniform sampler2D nightTexture;
                uniform vec3 sunDirection;
                uniform float time;
                
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    float sunAlignment = dot(vNormal, normalize(sunDirection));
                    float dayFactor = smoothstep(-0.05, 0.2, sunAlignment);
                    
                    vec4 dayColor = texture2D(dayTexture, vUv);
                    vec4 nightColor = texture2D(nightTexture, vUv);
                    
                    vec4 finalColor = mix(nightColor, dayColor, dayFactor);
                    
                    float atmosphereEffect = pow(max(0.0, sunAlignment), 0.6);
                    vec3 atmosphereColor = vec3(0.4, 0.6, 1.0) * 0.08 * atmosphereEffect;
                    finalColor.rgb += atmosphereColor;
                    
                    if (dayFactor < 0.2) {
                        finalColor.rgb += nightColor.rgb * (1.0 - dayFactor) * 1.5;
                    }
                    
                    gl_FragColor = finalColor;
                }
            `
        });

        this.globe = new THREE.Mesh(globeGeometry, globeMaterial);
        this.scene.add(this.globe);
    }

    createAtmosphere() {
        const atmosphereGeometry = new THREE.SphereGeometry(5.12, 64, 64);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            uniforms: {
                sunDirection: { value: new THREE.Vector3(1.2, 0.2, 0.5) }
            },
            vertexShader: `
                varying vec3 vNormal;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 sunDirection;
                varying vec3 vNormal;
                
                void main() {
                    float sunAlignment = dot(vNormal, normalize(sunDirection));
                    float atmosphereStrength = pow(max(0.0, sunAlignment), 1.5);
                    
                    vec3 atmosphereColor = vec3(0.5, 0.8, 1.0);
                    
                    gl_FragColor = vec4(atmosphereColor, 0.08 + atmosphereStrength * 0.15);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });
        
        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.scene.add(this.atmosphere);
    }

    createStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.025,
            opacity: 0.75,
            sizeAttenuation: true,
        });

        const starVertices = [];
        const starColors = [];
        
        for (let i = 0; i < 15000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starVertices.push(x, y, z);
            
            const starColor = new THREE.Color();
            starColor.setHSL(Math.random() * 0.1 + 0.6, 0.2, Math.random() * 0.4 + 0.6);
            starColors.push(starColor.r, starColor.g, starColor.b);
        }

        starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3));
        starGeometry.setAttribute("color", new THREE.Float32BufferAttribute(starColors, 3));
        starMaterial.vertexColors = true;
        
        this.stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.stars);
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.rotateSpeed = 0.5;
        this.controls.enableZoom = false; // Disable default zoom
        this.controls.minDistance = 8;
        this.controls.maxDistance = 30;
        this.controls.enablePan = false;
    }

    setupEventListeners() {
        // Mouse move handler
        this.onMouseMove = (event) => {
            this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(this.mousePosition, this.camera);
            const intersects = this.raycaster.intersectObjects([this.globe, this.atmosphere]);
            
            const wasHovering = this.isHoveringGlobe;
            this.isHoveringGlobe = intersects.length > 0;
            
            if (this.isHoveringGlobe !== wasHovering) {
                this.container.style.cursor = this.isHoveringGlobe ? 'grab' : 'default';
            }
        };

        // Wheel handler
        this.onWheel = (event) => {
            if (this.isHoveringGlobe) {
                event.preventDefault();
                event.stopPropagation();
                
                const zoomSpeed = 0.5;
                const distance = this.camera.position.distanceTo(this.controls.target);
                const delta = event.deltaY > 0 ? zoomSpeed : -zoomSpeed;
                const newDistance = Math.max(this.controls.minDistance, 
                    Math.min(this.controls.maxDistance, distance + delta));
                
                const direction = this.camera.position.clone().sub(this.controls.target).normalize();
                this.camera.position.copy(this.controls.target).add(direction.multiplyScalar(newDistance));
                this.controls.update();
            }
        };

        // Mouse down/up handlers
        this.onMouseDown = () => {
            if (this.isHoveringGlobe) {
                this.container.style.cursor = 'grabbing';
            }
        };

        this.onMouseUp = () => {
            if (this.isHoveringGlobe) {
                this.container.style.cursor = 'grab';
            } else {
                this.container.style.cursor = 'default';
            }
        };

        this.onMouseLeave = () => {
            this.isHoveringGlobe = false;
            this.container.style.cursor = 'default';
        };

        // Resize handler
        this.onResize = () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        };

        // Add event listeners
        this.container.addEventListener('mousemove', this.onMouseMove);
        this.container.addEventListener('wheel', this.onWheel, { passive: false });
        this.container.addEventListener('mousedown', this.onMouseDown);
        this.container.addEventListener('mouseup', this.onMouseUp);
        this.container.addEventListener('mouseleave', this.onMouseLeave);
        window.addEventListener('resize', this.onResize);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        this.time += 0.01;

        // Update shader uniforms
        if (this.globe && this.globe.material.uniforms) {
            this.globe.material.uniforms.time.value = this.time;
        }

        // Gentle floating animation
        const amplitude = 0.04;
        const frequency = 0.25;
        const floatingY = Math.sin(this.time * frequency) * amplitude;
        
        if (this.globe) {
            this.globe.position.y = floatingY;
            this.globe.rotation.y += 0.002;
        }
        
        if (this.atmosphere) {
            this.atmosphere.position.y = floatingY;
            this.atmosphere.rotation.y += 0.0015;
        }

        // Star twinkling
        if (this.stars && this.stars.material) {
            this.stars.material.opacity = 0.5 + Math.sin(this.time * 1.5) * 0.2;
        }

        if (this.controls) {
            this.controls.update();
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    dispose() {
        // Cancel animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // Remove event listeners
        if (this.container) {
            this.container.removeEventListener('mousemove', this.onMouseMove);
            this.container.removeEventListener('wheel', this.onWheel);
            this.container.removeEventListener('mousedown', this.onMouseDown);
            this.container.removeEventListener('mouseup', this.onMouseUp);
            this.container.removeEventListener('mouseleave', this.onMouseLeave);
        }
        window.removeEventListener('resize', this.onResize);

        // Dispose of Three.js objects
        if (this.renderer) {
            this.renderer.dispose();
            if (this.container && this.container.contains(this.renderer.domElement)) {
                this.container.removeChild(this.renderer.domElement);
            }
        }
    }
}

// Initialize the globe when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('globe-container');
    if (container) {
        const globe = new GlobeRenderer(container);
        
        // Store globe instance globally for debugging
        window.globe = globe;
    } else {
        console.error('Globe container not found!');
    }
});