"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// React component that renders a 3D Earth globe using Three.js
export default function GlobeRenderer() {
  const globeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!globeRef.current) return;

    const container = globeRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Load real Earth texture
    const loader = new THREE.TextureLoader();
    const earthTexture = loader.load('/textures/earth-day.jpg');
    const nightTexture = loader.load('/textures/earth-night.jpg');

    // Globe geometry and material
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

    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    // Simple atmosphere
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
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Lighting
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(15, 3, 6);
    scene.add(sunLight);
    
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.12);
    scene.add(ambientLight);
    
    const rimLight = new THREE.DirectionalLight(0x87ceeb, 0.25);
    rimLight.position.set(-6, 0, -2);
    scene.add(rimLight);

    // Stars
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
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Controls with hover-based zoom restriction
    camera.position.set(0, 0, 15);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.enableZoom = false; // Disable default zoom
    controls.minDistance = 8;
    controls.maxDistance = 30;
    controls.enablePan = false;

    // Hover and scroll management
    let isHoveringGlobe = false;
    const mousePosition = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    // Track mouse position and globe intersection
    const onMouseMove = (event: MouseEvent) => {
      mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mousePosition, camera);
      const intersects = raycaster.intersectObjects([globe, atmosphere]);
      
      const wasHovering = isHoveringGlobe;
      isHoveringGlobe = intersects.length > 0;
      
      // Change cursor when hovering over globe
      if (isHoveringGlobe !== wasHovering) {
        container.style.cursor = isHoveringGlobe ? 'grab' : 'default';
      }
    };

    // Handle wheel events for zoom control
    const onWheel = (event: WheelEvent) => {
      if (isHoveringGlobe) {
        // Prevent page scroll when hovering over globe
        event.preventDefault();
        event.stopPropagation();
        
        // Manual zoom control
        const zoomSpeed = 0.5;
        const distance = camera.position.distanceTo(controls.target);
        const delta = event.deltaY > 0 ? zoomSpeed : -zoomSpeed;
        const newDistance = Math.max(controls.minDistance, Math.min(controls.maxDistance, distance + delta));
        
        // Apply zoom by moving camera along its direction
        const direction = camera.position.clone().sub(controls.target).normalize();
        camera.position.copy(controls.target).add(direction.multiplyScalar(newDistance));
        controls.update();
      }
      // If not hovering over globe, allow normal page scroll (don't prevent default)
    };

    // Handle mouse down for dragging cursor
    const onMouseDown = () => {
      if (isHoveringGlobe) {
        container.style.cursor = 'grabbing';
      }
    };

    const onMouseUp = () => {
      if (isHoveringGlobe) {
        container.style.cursor = 'grab';
      } else {
        container.style.cursor = 'default';
      }
    };

    // Add event listeners
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mouseup', onMouseUp);
    
    // Handle mouse leave to reset hover state
    const onMouseLeave = () => {
      isHoveringGlobe = false;
      container.style.cursor = 'default';
    };
    container.addEventListener('mouseleave', onMouseLeave);

    // Animation
    let time = 0;
    const amplitude = 0.04;
    const frequency = 0.25;

    function animate() {
      requestAnimationFrame(animate);

      time += 0.01;

      // Update shader uniforms
      globeMaterial.uniforms.time.value = time;

      // Gentle floating
      globe.position.y = Math.sin(time * frequency) * amplitude;
      atmosphere.position.y = globe.position.y;

      // Earth rotation
      globe.rotation.y += 0.002;
      atmosphere.rotation.y += 0.0015;

      // Star twinkling
      starMaterial.opacity = 0.5 + Math.sin(time * 1.5) * 0.2;

      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      // Cleanup event listeners
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener("resize", handleResize);
      
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={globeRef} className="absolute inset-0 z-0"></div>;
}