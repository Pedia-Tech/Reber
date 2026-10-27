/**
 * 3D PROGRESSIVE STRUCTURAL REBAR ASSEMBLY ENGINE
 * Stages:
 * 01: Structural Frame & Grid Lines
 * 02: Foundation Reinforcement (Mat + Starter Bars)
 * 03: Column Reinforcement (Longitudinal + Stirrups)
 * 04: Beam Reinforcement (Top/Bottom + Shear Links)
 * 05: Slab Reinforcement (Two-Way Mesh + Spacers)
 * 06: Technical Dimensions & Bar Marks
 * 07: Complete Rebar Model (Fully Integrated)
 */

(function () {
  const container = document.getElementById('assembly-canvas-wrapper');
  if (!container) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf6f9fc);

  const width = container.clientWidth || 700;
  const height = container.clientHeight || 640;

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
  camera.position.set(22, 16, 26);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 0.85);
  sunLight.position.set(30, 40, 25);
  sunLight.castShadow = true;
  scene.add(sunLight);

  const softBlueFill = new THREE.DirectionalLight(0x90bfe8, 0.5);
  softBlueFill.position.set(-25, 10, -20);
  scene.add(softBlueFill);

  // Root Assembly Group
  const assemblyRoot = new THREE.Group();
  scene.add(assemblyRoot);

  // Materials
  const matBlueRebar = new THREE.MeshStandardMaterial({
    color: 0x0b57d0, // Accent Rebar Blue
    metalness: 0.65,
    roughness: 0.35,
  });

  const matDarkSteel = new THREE.MeshStandardMaterial({
    color: 0x1a2e45, // Primary Structural Steel Navy
    metalness: 0.7,
    roughness: 0.3,
  });

  const matStirrup = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Cyan-Blue for ties & shear links
    metalness: 0.6,
    roughness: 0.4,
  });

  const matFrameLine = new THREE.LineBasicMaterial({
    color: 0x475569,
    linewidth: 1.5,
    transparent: true,
    opacity: 0.4,
  });

  const matGridRed = new THREE.LineBasicMaterial({
    color: 0x0b57d0,
    transparent: true,
    opacity: 0.6,
  });

  // Base Grid Plane
  const gridFloor = new THREE.GridHelper(36, 36, 0x0b57d0, 0xdbeafe);
  gridFloor.position.y = -7.0;
  assemblyRoot.add(gridFloor);

  // ================= STAGE 1: STRUCTURAL FRAME & GRID =================
  const stage1Group = new THREE.Group();
  
  // Coordinate Datum Axis Lines
  const createAxisLine = (start, end, mat) => {
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geo, mat);
  };

  stage1Group.add(createAxisLine([-15, -7, 0], [15, -7, 0], matGridRed));
  stage1Group.add(createAxisLine([0, -7, -15], [0, -7, 15], matGridRed));

  // Wireframe Building Bay Outlines (Footing outline + Column outlines + Beam outlines)
  const bayOutlineGeo = new THREE.BoxGeometry(16, 18, 16);
  const bayWireframe = new THREE.LineSegments(
    new THREE.EdgesGeometry(bayOutlineGeo),
    matFrameLine
  );
  bayWireframe.position.set(0, 2, 0);
  stage1Group.add(bayWireframe);

  // Column Footing Concrete Outlines
  [-6, 6].forEach(x => {
    [-6, 6].forEach(z => {
      const colFootGeo = new THREE.BoxGeometry(4.5, 1.5, 4.5);
      const colFootWire = new THREE.LineSegments(new THREE.EdgesGeometry(colFootGeo), matFrameLine);
      colFootWire.position.set(x, -6.25, z);
      stage1Group.add(colFootWire);

      const colShaftGeo = new THREE.BoxGeometry(2, 14, 2);
      const colShaftWire = new THREE.LineSegments(new THREE.EdgesGeometry(colShaftGeo), matFrameLine);
      colShaftWire.position.set(x, 1, z);
      stage1Group.add(colShaftWire);
    });
  });

  assemblyRoot.add(stage1Group);

  // ================= STAGE 2: FOUNDATION REINFORCEMENT =================
  const stage2Group = new THREE.Group();
  const footings = [[-6, -6], [6, -6], [-6, 6], [6, 6]];

  footings.forEach(([fx, fz]) => {
    // Mat mesh bottom
    for (let i = -1.8; i <= 1.8; i += 0.6) {
      // X-bars
      const barXGeo = new THREE.CylinderGeometry(0.09, 0.09, 4.0, 10);
      barXGeo.rotateZ(Math.PI / 2);
      const barX = new THREE.Mesh(barXGeo, matDarkSteel);
      barX.position.set(fx, -6.6, fz + i);
      stage2Group.add(barX);

      // Z-bars
      const barZGeo = new THREE.CylinderGeometry(0.09, 0.09, 4.0, 10);
      barZGeo.rotateX(Math.PI / 2);
      const barZ = new THREE.Mesh(barZGeo, matDarkSteel);
      barZ.position.set(fx + i, -6.45, fz);
      stage2Group.add(barZ);
    }

    // Starter Dowel Bars for Column
    const starterPos = [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]];
    starterPos.forEach(([dx, dz]) => {
      const dowelGeo = new THREE.CylinderGeometry(0.1, 0.1, 3.2, 10);
      const dowel = new THREE.Mesh(dowelGeo, matBlueRebar);
      dowel.position.set(fx + dx, -5.0, fz + dz);
      stage2Group.add(dowel);

      // 90 deg footing hook
      const footHookGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.7, 10);
      footHookGeo.rotateZ(Math.PI / 2);
      const footHook = new THREE.Mesh(footHookGeo, matBlueRebar);
      footHook.position.set(fx + dx + (dx > 0 ? 0.35 : -0.35), -6.5, fz + dz);
      stage2Group.add(footHook);
    });
  });

  assemblyRoot.add(stage2Group);

  // ================= STAGE 3: COLUMN REINFORCEMENT =================
  const stage3Group = new THREE.Group();

  footings.forEach(([fx, fz]) => {
    const colCornerBars = [
      [-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6],
      [0, -0.6], [0, 0.6], [-0.6, 0], [0.6, 0]
    ];

    // Longitudinal bars Ø25
    colCornerBars.forEach(([dx, dz]) => {
      const vertBarGeo = new THREE.CylinderGeometry(0.12, 0.12, 13.5, 12);
      const vertBar = new THREE.Mesh(vertBarGeo, matDarkSteel);
      vertBar.position.set(fx + dx, 0.75, fz + dz);
      stage3Group.add(vertBar);
    });

    // Column Ties / Stirrups
    for (let y = -4.0; y <= 7.2; y += 0.8) {
      const tieSize = 1.5;
      const tieGeo = new THREE.CylinderGeometry(0.06, 0.06, tieSize, 8);

      const tNorth = new THREE.Mesh(tieGeo, matStirrup);
      tNorth.rotateZ(Math.PI / 2);
      tNorth.position.set(fx, y, fz + tieSize / 2);

      const tSouth = new THREE.Mesh(tieGeo, matStirrup);
      tSouth.rotateZ(Math.PI / 2);
      tSouth.position.set(fx, y, fz - tieSize / 2);

      const tEast = new THREE.Mesh(tieGeo, matStirrup);
      tEast.rotateX(Math.PI / 2);
      tEast.position.set(fx + tieSize / 2, y, fz);

      const tWest = new THREE.Mesh(tieGeo, matStirrup);
      tWest.rotateX(Math.PI / 2);
      tWest.position.set(fx - tieSize / 2, y, fz);

      stage3Group.add(tNorth, tSouth, tEast, tWest);
    }
  });

  assemblyRoot.add(stage3Group);

  // ================= STAGE 4: BEAM REINFORCEMENT =================
  const stage4Group = new THREE.Group();
  const beamY = 7.0;

  // Perimeter Beams connecting the 4 columns
  const beamSpans = [
    { start: [-6, 6], end: [6, 6], axis: 'x' },   // North beam
    { start: [-6, -6], end: [6, -6], axis: 'x' }, // South beam
    { start: [-6, -6], end: [-6, 6], axis: 'z' }, // West beam
    { start: [6, -6], end: [6, 6], axis: 'z' },   // East beam
  ];

  beamSpans.forEach(span => {
    const isX = span.axis === 'x';
    const spanLen = 12.0;

    // Top tension bars (2 bars)
    // Bottom compression bars (2 bars)
    [-0.5, 0.5].forEach(offset => {
      [beamY - 0.4, beamY + 0.4].forEach(yPos => {
        const bGeo = new THREE.CylinderGeometry(0.1, 0.1, spanLen, 10);
        if (isX) {
          bGeo.rotateZ(Math.PI / 2);
        } else {
          bGeo.rotateX(Math.PI / 2);
        }
        const bMesh = new THREE.Mesh(bGeo, matBlueRebar);
        if (isX) {
          bMesh.position.set(0, yPos, span.start[1] + offset);
        } else {
          bMesh.position.set(span.start[0] + offset, yPos, 0);
        }
        stage4Group.add(bMesh);
      });
    });

    // Beam Stirrups / Shear Links along span
    for (let s = -5.0; s <= 5.0; s += 0.9) {
      const linkSub = new THREE.Group();
      const lW = 1.2;
      const lH = 1.0;
      const lGeoV = new THREE.CylinderGeometry(0.05, 0.05, lH, 8);
      const lGeoH = new THREE.CylinderGeometry(0.05, 0.05, lW, 8);

      if (isX) {
        lGeoH.rotateX(Math.PI / 2);
        const l1 = new THREE.Mesh(lGeoV, matStirrup);
        l1.position.set(s, beamY, span.start[1] - lW / 2);
        const l2 = new THREE.Mesh(lGeoV, matStirrup);
        l2.position.set(s, beamY, span.start[1] + lW / 2);
        const l3 = new THREE.Mesh(lGeoH, matStirrup);
        l3.position.set(s, beamY + lH / 2, span.start[1]);
        const l4 = new THREE.Mesh(lGeoH, matStirrup);
        l4.position.set(s, beamY - lH / 2, span.start[1]);
        linkSub.add(l1, l2, l3, l4);
      } else {
        lGeoH.rotateZ(Math.PI / 2);
        const l1 = new THREE.Mesh(lGeoV, matStirrup);
        l1.position.set(span.start[0] - lW / 2, beamY, s);
        const l2 = new THREE.Mesh(lGeoV, matStirrup);
        l2.position.set(span.start[0] + lW / 2, beamY, s);
        const l3 = new THREE.Mesh(lGeoH, matStirrup);
        l3.position.set(span.start[0], beamY + lH / 2, s);
        const l4 = new THREE.Mesh(lGeoH, matStirrup);
        l4.position.set(span.start[0], beamY - lH / 2, s);
        linkSub.add(l1, l2, l3, l4);
      }
      stage4Group.add(linkSub);
    }
  });

  assemblyRoot.add(stage4Group);

  // ================= STAGE 5: SLAB REINFORCEMENT =================
  const stage5Group = new THREE.Group();
  const slabY = beamY + 0.6;
  const slabSpan = 13.0;

  // Bottom Two-Way Rebar Mat
  for (let pos = -5.8; pos <= 5.8; pos += 0.8) {
    // X-direction slab bars
    const slabXGeo = new THREE.CylinderGeometry(0.06, 0.06, slabSpan, 8);
    slabXGeo.rotateZ(Math.PI / 2);
    const slabX = new THREE.Mesh(slabXGeo, matDarkSteel);
    slabX.position.set(0, slabY - 0.1, pos);
    stage5Group.add(slabX);

    // Z-direction slab bars
    const slabZGeo = new THREE.CylinderGeometry(0.06, 0.06, slabSpan, 8);
    slabZGeo.rotateX(Math.PI / 2);
    const slabZ = new THREE.Mesh(slabZGeo, matDarkSteel);
    slabZ.position.set(pos, slabY, 0);
    stage5Group.add(slabZ);
  }

  // Top Reinforcement at Beams & Columns (Negative moment rebar)
  for (let pos = -5.8; pos <= 5.8; pos += 1.2) {
    [-5.5, 5.5].forEach(zEdge => {
      const topBarXGeo = new THREE.CylinderGeometry(0.065, 0.065, 3.5, 8);
      topBarXGeo.rotateZ(Math.PI / 2);
      const topBarX = new THREE.Mesh(topBarXGeo, matBlueRebar);
      topBarX.position.set(pos, slabY + 0.25, zEdge);
      stage5Group.add(topBarX);
    });
  }

  assemblyRoot.add(stage5Group);

  // ================= STAGE 6: TECHNICAL DIMENSIONS & BBS TAGS =================
  const stage6Group = new THREE.Group();

  // Create 3D Dimension Leader Lines
  const createLeader = (from, to, text) => {
    const leaderSub = new THREE.Group();
    const line = createAxisLine(from, to, new THREE.LineBasicMaterial({ color: 0x0b57d0 }));
    leaderSub.add(line);

    // End ticks
    const tickGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6);
    const tick1 = new THREE.Mesh(tickGeo, matBlueRebar);
    tick1.position.set(...from);
    const tick2 = new THREE.Mesh(tickGeo, matBlueRebar);
    tick2.position.set(...to);
    leaderSub.add(tick1, tick2);
    return leaderSub;
  };

  // Dimension: Footing to Footing 12.0m Span
  stage6Group.add(createLeader([-6, -6.8, 8.5], [6, -6.8, 8.5]));
  // Dimension: Column Height 14.0m
  stage6Group.add(createLeader([8.5, -6.5, 6], [8.5, 7.5, 6]));

  assemblyRoot.add(stage6Group);

  // ================= STAGE 7: COMPLETE MODEL HIGHLIGHT =================
  const stage7Group = new THREE.Group();

  // Add subtle architectural coordinate callout markers
  const markerGeo = new THREE.SphereGeometry(0.2, 12, 12);
  const markerMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  footings.forEach(([x, z]) => {
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.set(x, 7.8, z);
    stage7Group.add(marker);
  });

  assemblyRoot.add(stage7Group);

  // Stage Visibility Array
  const stages = [
    { group: stage1Group, title: 'Structural Grid & Datum Frames' },
    { group: stage2Group, title: 'Foundation Mat Reinforcement' },
    { group: stage3Group, title: 'Column Vertical Bars & Seismic Ties' },
    { group: stage4Group, title: 'Beam Girders & Shear Links' },
    { group: stage5Group, title: 'Two-Way Slab Mesh & Top Steel' },
    { group: stage6Group, title: 'Technical Dimension Lines & Callouts' },
    { group: stage7Group, title: 'Full Unified LOD 400 Rebar Model' },
  ];

  let currentStageIndex = 0;

  function setStage(index) {
    currentStageIndex = Math.max(0, Math.min(6, index));

    // Update 3D visibility progressively:
    // When at stage N, show stages 0 through N
    stages.forEach((st, i) => {
      st.group.visible = i <= currentStageIndex;
    });

    // Update UI elements
    const stageNameElem = document.getElementById('assembly-stage-name');
    if (stageNameElem) {
      stageNameElem.textContent = `STAGE ${currentStageIndex + 1}/7: ${stages[currentStageIndex].title.toUpperCase()}`;
    }

    const scrubber = document.getElementById('assembly-scrubber');
    if (scrubber && Number(scrubber.value) !== currentStageIndex) {
      scrubber.value = currentStageIndex;
    }

    // Update step list active states
    document.querySelectorAll('.assembly-step-item').forEach((item, idx) => {
      if (idx === currentStageIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Subtle Camera Shift per stage for dramatic architectural perspective
    const targetCamPositions = [
      { x: 26, y: 18, z: 30 }, // Stage 1: Wide overview
      { x: 18, y: -2, z: 22 }, // Stage 2: Low angle on foundation
      { x: 20, y: 8, z: 24 },  // Stage 3: Columns
      { x: 18, y: 15, z: 22 }, // Stage 4: Beams
      { x: 15, y: 22, z: 20 }, // Stage 5: Slab bird's eye
      { x: 24, y: 14, z: 26 }, // Stage 6: Dimensions
      { x: 22, y: 16, z: 25 }, // Stage 7: Complete
    ];

    if (window.gsap) {
      gsap.to(camera.position, {
        x: targetCamPositions[currentStageIndex].x,
        y: targetCamPositions[currentStageIndex].y,
        z: targetCamPositions[currentStageIndex].z,
        duration: 0.8,
        ease: 'power2.out',
      });
    } else {
      camera.position.set(
        targetCamPositions[currentStageIndex].x,
        targetCamPositions[currentStageIndex].y,
        targetCamPositions[currentStageIndex].z
      );
    }
  }

  // Initial stage
  setStage(0);

  // Hook Step Items Click
  document.querySelectorAll('.assembly-step-item').forEach((item, idx) => {
    item.addEventListener('click', () => {
      setStage(idx);
    });
  });

  // Hook Scrubber Slider
  const scrubber = document.getElementById('assembly-scrubber');
  if (scrubber) {
    scrubber.addEventListener('input', (e) => {
      setStage(parseInt(e.target.value, 10));
    });
  }

  // GSAP ScrollTrigger Integration if available
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: '#assembly-interactive-section',
      start: 'top 20%',
      end: 'bottom 80%',
      scrub: true,
      onUpdate: (self) => {
        const step = Math.min(6, Math.floor(self.progress * 7));
        if (step !== currentStageIndex) {
          setStage(step);
        }
      }
    });
  }

  // Mouse Orbit Dragging on assembly canvas
  let isDragging = false;
  let prevMouse = { x: 0, y: 0 };

  renderer.domElement.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMouse = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - prevMouse.x;
    const deltaY = e.clientY - prevMouse.y;

    assemblyRoot.rotation.y += deltaX * 0.007;
    assemblyRoot.rotation.x += deltaY * 0.004;
    assemblyRoot.rotation.x = Math.max(-0.5, Math.min(0.5, assemblyRoot.rotation.x));

    prevMouse = { x: e.clientX, y: e.clientY };
  });

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);
    if (!isDragging) {
      assemblyRoot.rotation.y += 0.002;
    }
    camera.lookAt(0, 0, 0);
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
