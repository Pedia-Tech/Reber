/**
 * REBAR 3D STRUCTURAL MODEL VISUALIZER
 * Interactive Three.js realistic reinforcement cage with stirrups, hooks, and technical callouts.
 */

(function () {
  const container = document.getElementById('hero-rebar-canvas');
  if (!container) return;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f8fc);

  const width = container.clientWidth || 600;
  const height = container.clientHeight || 580;

  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
  camera.position.set(18, 14, 22);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
  keyLight.position.set(25, 35, 20);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xbdd4ea, 0.6);
  fillLight.position.set(-20, 15, -20);
  scene.add(fillLight);

  const blueTechLight = new THREE.DirectionalLight(0x0b57d0, 0.35);
  blueTechLight.position.set(0, -10, 15);
  scene.add(blueTechLight);

  // Blueprint Grid Plane at Base
  const gridHelper = new THREE.GridHelper(30, 30, 0x0b57d0, 0xd0e0f0);
  gridHelper.position.y = -6.01;
  scene.add(gridHelper);

  // Groups
  const mainGroup = new THREE.Group();
  scene.add(mainGroup);

  // Materials
  const rebarMaterial = new THREE.MeshStandardMaterial({
    color: 0x1b3b5f, // Deep Engineering Rebar Navy
    roughness: 0.35,
    metalness: 0.7,
  });

  const stirrupMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b57d0, // Precision Engineering Blue for stirrups
    roughness: 0.3,
    metalness: 0.65,
  });

  const concreteMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd4e3f3,
    transparent: true,
    opacity: 0.15,
    roughness: 0.1,
    transmission: 0.6,
    thickness: 0.5,
    wireframe: false,
  });

  const concreteWireframeMat = new THREE.MeshBasicMaterial({
    color: 0x82a5c8,
    wireframe: true,
    transparent: true,
    opacity: 0.35
  });

  // Rebar Cage Construction Functions
  // 1. Foundation Footing Reinforcement (Mat Grid + Pedestal)
  const footingGroup = new THREE.Group();
  const footingWidth = 10;
  const footingLength = 10;
  const footingSpacing = 1.25;

  // Bottom Mesh (X-direction & Z-direction rebars with hooks)
  for (let z = -footingLength / 2; z <= footingLength / 2; z += footingSpacing) {
    const barGeo = new THREE.CylinderGeometry(0.12, 0.12, footingWidth, 12);
    barGeo.rotateZ(Math.PI / 2);
    const bar = new THREE.Mesh(barGeo, rebarMaterial);
    bar.position.set(0, -5.5, z);
    bar.castShadow = true;
    footingGroup.add(bar);

    // End 90 deg hooks
    [-footingWidth / 2, footingWidth / 2].forEach(xPos => {
      const hookGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 12);
      const hook = new THREE.Mesh(hookGeo, rebarMaterial);
      hook.position.set(xPos, -5.1, z);
      footingGroup.add(hook);
    });
  }

  for (let x = -footingWidth / 2; x <= footingWidth / 2; x += footingSpacing) {
    const barGeo = new THREE.CylinderGeometry(0.12, 0.12, footingLength, 12);
    barGeo.rotateX(Math.PI / 2);
    const bar = new THREE.Mesh(barGeo, rebarMaterial);
    bar.position.set(x, -5.25, 0);
    bar.castShadow = true;
    footingGroup.add(bar);
  }

  mainGroup.add(footingGroup);

  // 2. Column Vertical Bars (8 main longitudinal bars Ø25)
  const columnGroup = new THREE.Group();
  const colHeight = 15;
  const colPositions = [
    [-1.6, -1.6], [0, -1.6], [1.6, -1.6],
    [-1.6, 0],               [1.6, 0],
    [-1.6, 1.6],  [0, 1.6],  [1.6, 1.6]
  ];

  colPositions.forEach(([x, z]) => {
    const colBarGeo = new THREE.CylinderGeometry(0.16, 0.16, colHeight, 16);
    const colBar = new THREE.Mesh(colBarGeo, rebarMaterial);
    colBar.position.set(x, 2, z);
    colBar.castShadow = true;
    columnGroup.add(colBar);

    // L-Bend into footing
    const bendGeo = new THREE.CylinderGeometry(0.16, 0.16, 1.2, 16);
    const bendAngle = Math.atan2(z, x);
    bendGeo.rotateZ(Math.PI / 2);
    const bend = new THREE.Mesh(bendGeo, rebarMaterial);
    bend.position.set(x + Math.cos(bendAngle) * 0.5, -5.35, z + Math.sin(bendAngle) * 0.5);
    bend.rotation.y = -bendAngle;
    columnGroup.add(bend);
  });

  // 3. Column Stirrups / Ties (@150 C/C spacing)
  const stirrupsGroup = new THREE.Group();
  const stirrupSize = 3.6;
  const stirrupRadius = 0.08;

  function createStirrup(yPos) {
    const stirrupSub = new THREE.Group();
    // 4 straight sides
    const sideGeo = new THREE.CylinderGeometry(stirrupRadius, stirrupRadius, stirrupSize, 10);
    
    // North side
    const north = new THREE.Mesh(sideGeo, stirrupMaterial);
    north.rotateZ(Math.PI / 2);
    north.position.set(0, yPos, stirrupSize / 2);
    stirrupSub.add(north);

    // South side
    const south = new THREE.Mesh(sideGeo, stirrupMaterial);
    south.rotateZ(Math.PI / 2);
    south.position.set(0, yPos, -stirrupSize / 2);
    stirrupSub.add(south);

    // East side
    const east = new THREE.Mesh(sideGeo, stirrupMaterial);
    east.rotateX(Math.PI / 2);
    east.position.set(stirrupSize / 2, yPos, 0);
    stirrupSub.add(east);

    // West side
    const west = new THREE.Mesh(sideGeo, stirrupMaterial);
    west.rotateX(Math.PI / 2);
    west.position.set(-stirrupSize / 2, yPos, 0);
    stirrupSub.add(west);

    // 135 degree seismic hook at corner
    const hookGeo = new THREE.CylinderGeometry(stirrupRadius, stirrupRadius, 0.7, 10);
    hookGeo.rotateZ(Math.PI / 4);
    const hook = new THREE.Mesh(hookGeo, stirrupMaterial);
    hook.position.set(stirrupSize / 2 - 0.25, yPos, stirrupSize / 2 - 0.25);
    stirrupSub.add(hook);

    return stirrupSub;
  }

  for (let y = -4.5; y <= 9.0; y += 0.9) {
    stirrupsGroup.add(createStirrup(y));
  }
  mainGroup.add(stirrupsGroup);
  mainGroup.add(columnGroup);

  // 4. Cantilevered Beam Reinforcement (Intersection at Mid-Level)
  const beamGroup = new THREE.Group();
  const beamLength = 8;
  const beamY = 5;

  // Beam Longitudinal Bars (Top & Bottom)
  const beamBarPositions = [
    [-1.4, beamY + 1.2], [1.4, beamY + 1.2], // Top tension bars
    [-1.4, beamY - 1.2], [1.4, beamY - 1.2]  // Bottom compression bars
  ];

  beamBarPositions.forEach(([z, y]) => {
    const bBarGeo = new THREE.CylinderGeometry(0.14, 0.14, beamLength, 12);
    bBarGeo.rotateZ(Math.PI / 2);
    const bBar = new THREE.Mesh(bBarGeo, rebarMaterial);
    bBar.position.set(beamLength / 2 + 1.5, y, z);
    beamGroup.add(bBar);
  });

  // Beam Stirrup Links
  for (let x = 2.5; x <= beamLength + 1; x += 1.1) {
    const linkSub = new THREE.Group();
    const linkHeight = 2.6;
    const linkWidth = 3.0;
    const lGeoVert = new THREE.CylinderGeometry(0.07, 0.07, linkHeight, 8);
    const lGeoHoriz = new THREE.CylinderGeometry(0.07, 0.07, linkWidth, 8);
    lGeoHoriz.rotateX(Math.PI / 2);

    const lLeft = new THREE.Mesh(lGeoVert, stirrupMaterial);
    lLeft.position.set(x, beamY, -linkWidth / 2);
    const lRight = new THREE.Mesh(lGeoVert, stirrupMaterial);
    lRight.position.set(x, beamY, linkWidth / 2);

    const lTop = new THREE.Mesh(lGeoHoriz, stirrupMaterial);
    lTop.position.set(x, beamY + linkHeight / 2, 0);
    const lBot = new THREE.Mesh(lGeoHoriz, stirrupMaterial);
    lBot.position.set(x, beamY - linkHeight / 2, 0);

    linkSub.add(lLeft, lRight, lTop, lBot);
    beamGroup.add(linkSub);
  }
  mainGroup.add(beamGroup);

  // 5. Subtle Concrete Silhouette Blocks
  const colConcreteGeo = new THREE.BoxGeometry(4.2, 15, 4.2);
  const colConcrete = new THREE.Mesh(colConcreteGeo, concreteMaterial);
  colConcrete.position.set(0, 2, 0);
  const colWireframe = new THREE.Mesh(colConcreteGeo, concreteWireframeMat);
  colWireframe.position.copy(colConcrete.position);

  const footingConcreteGeo = new THREE.BoxGeometry(11, 1.8, 11);
  const footingConcrete = new THREE.Mesh(footingConcreteGeo, concreteMaterial);
  footingConcrete.position.set(0, -5.2, 0);
  const footingWireframe = new THREE.Mesh(footingConcreteGeo, concreteWireframeMat);
  footingWireframe.position.copy(footingConcrete.position);

  const concreteEnclosure = new THREE.Group();
  concreteEnclosure.add(colConcrete, colWireframe, footingConcrete, footingWireframe);
  mainGroup.add(concreteEnclosure);

  // Controls & Camera Orbit
  let isRotating = true;
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  renderer.domElement.addEventListener('mousedown', e => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    mainGroup.rotation.y += deltaX * 0.008;
    mainGroup.rotation.x += deltaY * 0.005;

    // Limit vertical pitch
    mainGroup.rotation.x = Math.max(-0.6, Math.min(0.6, mainGroup.rotation.x));

    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  // Touch Support
  renderer.domElement.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      isDragging = true;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.y;

    mainGroup.rotation.y += deltaX * 0.01;
    mainGroup.rotation.x += deltaY * 0.008;
    mainGroup.rotation.x = Math.max(-0.6, Math.min(0.6, mainGroup.rotation.x));

    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  // External Control Buttons Hooks
  const btnRotate = document.getElementById('btn-hero-rotate');
  if (btnRotate) {
    btnRotate.addEventListener('click', () => {
      isRotating = !isRotating;
      btnRotate.classList.toggle('active', isRotating);
      btnRotate.textContent = isRotating ? 'Auto-Rotate: ON' : 'Auto-Rotate: OFF';
    });
  }

  const btnConcrete = document.getElementById('btn-hero-concrete');
  if (btnConcrete) {
    let concreteState = 1; // 1: semi-transparent, 2: wireframe only, 0: hidden
    btnConcrete.addEventListener('click', () => {
      concreteState = (concreteState + 1) % 3;
      if (concreteState === 1) {
        concreteEnclosure.visible = true;
        colConcrete.visible = true;
        footingConcrete.visible = true;
        btnConcrete.textContent = 'Concrete: Ghost';
      } else if (concreteState === 2) {
        concreteEnclosure.visible = true;
        colConcrete.visible = false;
        footingConcrete.visible = false;
        btnConcrete.textContent = 'Concrete: Lines';
      } else {
        concreteEnclosure.visible = false;
        btnConcrete.textContent = 'Concrete: Hidden';
      }
    });
  }

  const btnReset = document.getElementById('btn-hero-reset');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      mainGroup.rotation.set(0, 0, 0);
      camera.position.set(18, 14, 22);
      camera.lookAt(0, 1, 0);
    });
  }

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (isRotating && !isDragging) {
      mainGroup.rotation.y += delta * 0.35;
    }

    camera.lookAt(0, 1, 0);
    renderer.render(scene, camera);
  }

  animate();

  // Resize Handler
  window.addEventListener('resize', () => {
    if (!container) return;
    const newW = container.clientWidth;
    const newH = container.clientHeight;
    camera.aspect = newW / newH;
    camera.updateProjectionMatrix();
    renderer.setSize(newW, newH);
  });
})();
