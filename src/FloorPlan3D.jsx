import { useEffect, useRef } from "react"; 
import * as THREE from "three"; 

function addCarImage({ scene, url, position, y = 0.02, rotationY = 0, width = 4.8, height = 2.2 }) {
  const loader = new THREE.TextureLoader();

  loader.load(url, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      roughness: 0.4,
      metalness: 0.1
    });

    const carPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      material
    );

    // Lay flat on ground
    carPlane.rotation.x = -Math.PI / 2;
    carPlane.rotation.z = rotationY;

    // Slight lift to avoid z-fighting
    carPlane.position.set(position.x, y, position.z);

    carPlane.receiveShadow = true;

    scene.add(carPlane);

    // Soft ground shadow
    const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(width * 1.1, height * 1.1),
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.25
        })
    );
    
    shadow.rotation.x = -Math.PI / 2;
    shadow.rotation.z = rotationY;
    shadow.position.set(position.x, y - 0.01, position.z);
    scene.add(shadow);
  });
}

export default function FloorPlan3D({ rooms, stairs, extras = [], columns = [], plotWidth, plotDepth, viewMode = 'floorplan', animationMode = 'none' }) { 
  const mountRef = useRef(); 
  
  const animationModeRef = useRef(animationMode);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
      animationModeRef.current = animationMode;
      if (animationMode !== 'none') {
          startTimeRef.current = Date.now();
      }
  }, [animationMode]);

  useEffect(() => { 
    if (mountRef.current) {
        while(mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }
    }

    const scene = new THREE.Scene(); 
    // Background based on view mode
    if (viewMode === 'exterior') {
        scene.background = new THREE.Color("#f5f5f5"); // Clean White/Grey for exterior render
    } else {
        scene.background = new THREE.Color("#f6f7fb");
    }

    // Ground Plane
    const createGrassTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base color (Darker green)
        ctx.fillStyle = '#3a5f0b'; 
        ctx.fillRect(0, 0, 512, 512);

        // Add noise/blades
        for (let i = 0; i < 100000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            
            // Random green variations
            const hue = 85 + Math.random() * 30; // 85-115
            const sat = 40 + Math.random() * 40; // 40-80%
            const light = 20 + Math.random() * 40; // 20-60%
            
            ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
            
            const radius = Math.random() * 1.5;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(100, 100); 
        return texture;
    };

    const groundGeometry = new THREE.PlaneGeometry(2000, 2000);
    const grassTexture = createGrassTexture();
    const groundMaterial = new THREE.MeshStandardMaterial({ map: grassTexture, roughness: 1 }); 
    
    // If exterior, make ground more neutral/paved look, or keep grass? 
    // The reference image has a white/grey clean base. Let's stick to neutral for exterior to match the "clean image" request.
    // UPDATE: User requested grass texture for the lawn (ground).
    // if (viewMode === 'exterior') groundMaterial.color.set("#eeeeee");

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Camera Setup
    const centerX = plotWidth / 2;
    const centerZ = plotDepth / 2;
    const maxDim = Math.max(plotWidth, plotDepth);
    const cameraRadius = maxDim * 1.0; 
    
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000); 
    
    if (viewMode === 'exterior') {
        // Exterior View: Lower, more isometric
        camera.position.set(centerX - maxDim, maxDim * 0.6, centerZ + maxDim);
    } else {
        // Floor Plan View: Higher, top-down
        const cameraHeight = maxDim * 1.2;
        camera.position.set(centerX, cameraHeight, centerZ + cameraRadius * 0.8); 
    }
    camera.lookAt(centerX, 0, centerZ); 

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); 
    renderer.setSize(width, height); 
    renderer.shadowMap.enabled = true; 
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.id = "floor-plan-3d-canvas";
    mountRef.current.appendChild(renderer.domElement); 

    // Handle Resize
    const handleResize = () => {
        if (!mountRef.current) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    };
    
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mountRef.current);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, viewMode === 'exterior' ? 0.4 : 0.6); 
    scene.add(ambientLight); 

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.1); 
    if (viewMode === 'exterior') {
        sunLight.position.set(30, 50, 20); // User's recommended position for depth
    } else {
        sunLight.position.set(50, 100, 50); 
    }
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    scene.add(sunLight); 

    // Materials
    const createWallTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base color (Pure White)
        ctx.fillStyle = '#FFFFFF'; 
        ctx.fillRect(0, 0, 512, 512);

        // Add extremely subtle noise for realism, but keep it bright
        for (let i = 0; i < 60000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const shade = 250 + Math.random() * 5; // 250-255 (Almost pure white noise)
            ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, 0.3)`;
            ctx.fillRect(x, y, 1, 1);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(0.5, 0.5); // Large scale for smooth look
        return texture;
    };

    const createWoodTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base color (Light oak/pine)
        ctx.fillStyle = '#E6CFA5'; // Warm light wood
        ctx.fillRect(0, 0, 512, 512);

        // Add grain
        for (let i = 0; i < 400; i++) {
            ctx.beginPath();
            const x = Math.random() * 512;
            const width = Math.random() * 10 + 2;
            
            // Random streak color (slightly darker)
            const alpha = 0.05 + Math.random() * 0.1;
            ctx.strokeStyle = `rgba(160, 110, 70, ${alpha})`;
            ctx.lineWidth = width;
            
            // Diagonal/Wavy lines for natural look
            ctx.moveTo(x, 0);
            ctx.bezierCurveTo(
                x + Math.random() * 40 - 20, 170, 
                x + Math.random() * 40 - 20, 340, 
                x + Math.random() * 20 - 10, 512
            );
            ctx.stroke();
        }
        
        // Add subtle noise
        for (let i = 0; i < 20000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            ctx.fillStyle = `rgba(140, 100, 60, 0.1)`;
            ctx.fillRect(x, y, 1, 1);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2); 
        return texture;
    };

    const wallTexture = createWallTexture();
    const woodTexture = createWoodTexture();
    
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        map: woodTexture, 
        roughness: 0.6,
        metalness: 0.1 
    }); 
    const wallWhiteMaterial = new THREE.MeshStandardMaterial({ 
        map: wallTexture, 
        color: "#ffffff",
        roughness: 0.9 // Matte finish like plaster
    }); 
    const wallWoodMaterial = new THREE.MeshStandardMaterial({ color: "#8d6e63", roughness: 0.6 }); // Accent
    const wallTopMaterial = new THREE.MeshStandardMaterial({ color: "#2d3436", roughness: 1.0 });  
    
    // Window Materials (User recommended)
    const glassMaterial = new THREE.MeshPhysicalMaterial({ 
        color: 0x88aaff, 
        transmission: 0.9, 
        roughness: 0.1, 
        thickness: 0.01,
        transparent: true
    });
    
    const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1e1e1e, 
        metalness: 0.2, 
        roughness: 0.4 
    });
    
    const roofMaterial = new THREE.MeshStandardMaterial({ color: "#263238", roughness: 0.9 }); 

    // Determine Wall Height
    const wallHeight = viewMode === 'exterior' ? 12 : 8; 

    // Helper: Window Assembly
    const createWindowAssembly = (x, y, z, width, height, wallThickness, isRotated = false) => {
        const group = new THREE.Group();
        const FRAME_DEPTH = 0.15; // Depth of the frame (into the wall)
        const FRAME_WIDTH = 0.15; // Width of the frame face
        const MULLION_WIDTH = 0.08; // Width of internal grid lines
        const GLASS_THICKNESS = 0.02;

        // --- 1. Outer Frame ---
        // Top
        const frameTop = new THREE.Mesh(
            new THREE.BoxGeometry(width, FRAME_WIDTH, FRAME_DEPTH),
            frameMaterial
        );
        frameTop.position.set(0, height / 2 - FRAME_WIDTH / 2, 0);
        frameTop.castShadow = true;
        group.add(frameTop);

        // Bottom
        const frameBottom = new THREE.Mesh(
            new THREE.BoxGeometry(width, FRAME_WIDTH, FRAME_DEPTH),
            frameMaterial
        );
        frameBottom.position.set(0, -height / 2 + FRAME_WIDTH / 2, 0);
        frameBottom.castShadow = true;
        group.add(frameBottom);

        // Left
        const frameLeft = new THREE.Mesh(
            new THREE.BoxGeometry(FRAME_WIDTH, height - 2 * FRAME_WIDTH, FRAME_DEPTH),
            frameMaterial
        );
        frameLeft.position.set(-width / 2 + FRAME_WIDTH / 2, 0, 0);
        frameLeft.castShadow = true;
        group.add(frameLeft);

        // Right
        const frameRight = new THREE.Mesh(
            new THREE.BoxGeometry(FRAME_WIDTH, height - 2 * FRAME_WIDTH, FRAME_DEPTH),
            frameMaterial
        );
        frameRight.position.set(width / 2 - FRAME_WIDTH / 2, 0, 0);
        frameRight.castShadow = true;
        group.add(frameRight);

        // --- 2. Grid (2 cols x 4 rows) ---
        // Inner dimensions
        const innerWidth = width - 2 * FRAME_WIDTH;
        const innerHeight = height - 2 * FRAME_WIDTH;

        // Vertical Mullion (1 center)
        const vMullion = new THREE.Mesh(
            new THREE.BoxGeometry(MULLION_WIDTH, innerHeight, FRAME_DEPTH * 0.8),
            frameMaterial
        );
        vMullion.position.set(0, 0, 0);
        vMullion.castShadow = true;
        group.add(vMullion);

        // Horizontal Transoms (3 dividers -> 4 rows)
        const rowHeight = innerHeight / 4;
        for (let i = 1; i < 4; i++) {
            const hMullion = new THREE.Mesh(
                new THREE.BoxGeometry(innerWidth, MULLION_WIDTH, FRAME_DEPTH * 0.8),
                frameMaterial
            );
            // Position: Top is innerHeight/2. i=1 is top divider.
            // y = innerHeight/2 - i * rowHeight
            hMullion.position.set(0, innerHeight / 2 - i * rowHeight, 0);
            hMullion.castShadow = true;
            group.add(hMullion);
        }

        // --- 3. Glass ---
        // Single pane behind the grid
        const glass = new THREE.Mesh(
            new THREE.BoxGeometry(innerWidth, innerHeight, GLASS_THICKNESS),
            glassMaterial
        );
        glass.position.z = 0; 
        group.add(glass);

        // Position group
        group.position.set(x, y, z);
        
        if (isRotated) {
            group.rotation.y = Math.PI / 2;
        }

        scene.add(group);
    };

    // Helper: Segmented Wall (for Exterior)
    const createSegmentedWall = (start, end, height, thickness, floorY, constCoord, orientation, windowsOnWall, mat) => {
        // orientation: 'H' (North/South) -> constCoord is Z. start/end are X.
        // orientation: 'V' (West/East) -> constCoord is X. start/end are Z.
        
        const wallY = floorY + height / 2;
        
        // Sort windows by position along the wall
        windowsOnWall.sort((a, b) => a.pos - b.pos);
        
        let currentPos = start;
        
        windowsOnWall.forEach(win => {
            const winWidth = 3; // Standard width
            const winHeight = 4; // Standard height
            const winSill = 2; // Height from floor
            const winCenterY = floorY + winSill + winHeight/2;
            
            const gapStart = (orientation === 'H' ? win.pos + start : win.pos + start) - winWidth/2; // win.pos is relative to wall start??
            // wait, room.windows are relative to room origin.
            // If orientation H, win.pos is X relative to room.x. So absolute X = room.x + win.pos.
            // My 'start' argument is absolute.
            // Let's assume 'win.pos' is absolute coordinate along the wall axis.
            
            const gapEnd = gapStart + winWidth;
            
            // Wall Segment before window
            if (gapStart > currentPos) {
                const segLen = gapStart - currentPos;
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(
                    orientation === 'H' ? segLen : thickness,
                    height,
                    orientation === 'H' ? thickness : segLen
                ), mat);
                
                mesh.position.set(
                    orientation === 'H' ? currentPos + segLen/2 : constCoord,
                    wallY,
                    orientation === 'H' ? constCoord : currentPos + segLen/2
                );
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                scene.add(mesh);
            }
            
            // Header (Top)
            const headerHeight = height - (winSill + winHeight);
            if (headerHeight > 0) {
                const header = new THREE.Mesh(new THREE.BoxGeometry(
                    orientation === 'H' ? winWidth : thickness,
                    headerHeight,
                    orientation === 'H' ? thickness : winWidth
                ), mat);
                header.position.set(
                    orientation === 'H' ? gapStart + winWidth/2 : constCoord,
                    floorY + height - headerHeight/2,
                    orientation === 'H' ? constCoord : gapStart + winWidth/2
                );
                header.castShadow = true;
                header.receiveShadow = true;
                scene.add(header);
            }
            
            // Sill (Bottom)
            if (winSill > 0) {
                const sill = new THREE.Mesh(new THREE.BoxGeometry(
                    orientation === 'H' ? winWidth : thickness,
                    winSill,
                    orientation === 'H' ? thickness : winWidth
                ), mat);
                sill.position.set(
                    orientation === 'H' ? gapStart + winWidth/2 : constCoord,
                    floorY + winSill/2,
                    orientation === 'H' ? constCoord : gapStart + winWidth/2
                );
                sill.castShadow = true;
                sill.receiveShadow = true;
                scene.add(sill);
            }

            // Create Window Assembly
            createWindowAssembly(
                orientation === 'H' ? gapStart + winWidth/2 : constCoord,
                winCenterY,
                orientation === 'H' ? constCoord : gapStart + winWidth/2,
                winWidth,
                winHeight,
                thickness,
                orientation === 'V'
            );
            
            currentPos = gapEnd;
        });
        
        // Final Segment
        if (currentPos < end) {
            const segLen = end - currentPos;
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(
                orientation === 'H' ? segLen : thickness,
                height,
                orientation === 'H' ? thickness : segLen
            ), mat);
            
            mesh.position.set(
                orientation === 'H' ? currentPos + segLen/2 : constCoord,
                wallY,
                orientation === 'H' ? constCoord : currentPos + segLen/2
            );
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            scene.add(mesh);
        }
    };

    // Helper for walls (Legacy / Floorplan)
    const createWall = (w, h, d, x, y, z, mat = wallWhiteMaterial) => {
        // If floorplan view, use array of materials to have dark top
        // If exterior view, use single material (white or wood)
        const materials = viewMode === 'exterior' 
            ? mat 
            : [
                mat, // Right
                mat, // Left
                wallTopMaterial, // Top (Cut section)
                mat, // Bottom
                mat, // Front
                mat  // Back
              ];

        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), materials);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
    };

    // Furniture Helper
    const addFurniture = (room) => {
        // Hide furniture in exterior view if roof is on? 
        // Or keep it visible through windows? Keep it.
        const cx = room.x + room.w / 2;
        const cy = room.floor * 10 + 1; 
        const cz = room.y + room.h / 2;

        if (room.type.includes("bedroom") || room.type.includes("guest")) {
            const bed = new THREE.Mesh(new THREE.BoxGeometry(6, 1.5, 7), new THREE.MeshStandardMaterial({ color: "#ffffff" }));
            bed.position.set(cx, cy + 0.75, cz);
            bed.castShadow = true;
            scene.add(bed);
            const pillow = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 2), new THREE.MeshStandardMaterial({ color: "#e0e0e0" }));
            pillow.position.set(cx, cy + 1.75, cz - 2.5);
            scene.add(pillow);
        }
        if (room.type === "living") {
            const sofa = new THREE.Mesh(new THREE.BoxGeometry(8, 2, 3), new THREE.MeshStandardMaterial({ color: "#64748b" }));
            sofa.position.set(cx, cy + 1, cz - 2);
            sofa.castShadow = true;
            scene.add(sofa);
            const table = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 2.5), new THREE.MeshStandardMaterial({ color: "#3e2723" }));
            table.position.set(cx, cy + 0.6, cz + 1);
            table.castShadow = true;
            scene.add(table);
        }
        if (room.type === "kitchen") {
            const counter = new THREE.Mesh(new THREE.BoxGeometry(room.w - 2, 3, 2), new THREE.MeshStandardMaterial({ color: "#eeeeee" }));
            counter.position.set(cx, cy + 1.5, room.y + 2);
            counter.castShadow = true;
            scene.add(counter);
        }
    };

    // Track roof bounds
    let maxFloor = 0;
    const floorBounds = {}; // floor -> {minX, maxX, minY, maxY}

    // Rooms 
    rooms.forEach(room => { 
      if (room.floor > maxFloor) maxFloor = room.floor;

      const isOutdoor = room.type === 'garden' || room.type === 'parking' || room.type === 'garage';

      // Update bounds for this floor (Skip for outdoor so roof doesn't cover them)
      if (!isOutdoor) {
        if (!floorBounds[room.floor]) {
            floorBounds[room.floor] = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity };
        }
        const b = floorBounds[room.floor];
        b.minX = Math.min(b.minX, room.x);
        b.maxX = Math.max(b.maxX, room.x + room.w);
        b.minZ = Math.min(b.minZ, room.y);
        b.maxZ = Math.max(b.maxZ, room.y + room.h);
      }

      const wallThickness = viewMode === 'exterior' ? 0.3 : 0.8;
      const floorY = room.floor * 10;

      // Floor Slab
      let currentFloorMaterial = floorMaterial;
      let floorThickness = 0.5;
      let floorYOffset = 0.25;

      if (room.type === 'garden') {
           const gardenTexture = grassTexture.clone();
           gardenTexture.wrapS = THREE.RepeatWrapping;
           gardenTexture.wrapT = THREE.RepeatWrapping;
           gardenTexture.repeat.set(Math.max(1, room.w / 20), Math.max(1, room.h / 20));
           currentFloorMaterial = new THREE.MeshStandardMaterial({ map: gardenTexture, roughness: 1 });
           floorThickness = 0.2;
           floorYOffset = 0.1;
      } else if (room.type === 'parking' || room.type === 'garage') {
           currentFloorMaterial = new THREE.MeshStandardMaterial({ color: "#e0e0e0" });
           floorThickness = 0.2;
           floorYOffset = 0.1;
      }

      const floorGeo = new THREE.BoxGeometry(room.w, floorThickness, room.h);
      const floorMesh = new THREE.Mesh(floorGeo, currentFloorMaterial);
      floorMesh.position.set(room.x + room.w / 2, floorY + floorYOffset, room.y + room.h / 2);
      floorMesh.receiveShadow = true;
      scene.add(floorMesh);

      // Skip Walls for Outdoor
      if (isOutdoor) {
          // Add outdoor features (Trees/Cars)
          if(room.type === "garden") {
              const treeCount = Math.floor((room.w * room.h) / 50); 
              for(let i=0; i<treeCount; i++) {
                  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3, 8), new THREE.MeshStandardMaterial({ color: "#5d4037" }));
                  const tx = room.x + Math.random() * room.w;
                  const ty = room.y + Math.random() * room.h;
                  trunk.position.set(tx, room.floor * 10 + 1.5, ty);
                  trunk.castShadow = true;
                  scene.add(trunk);
                  const leaves = new THREE.Mesh(new THREE.ConeGeometry(2, 6, 8), new THREE.MeshStandardMaterial({ color: "#2e7d32" }));
                  leaves.position.set(tx, room.floor * 10 + 4.5, ty);
                  leaves.castShadow = true;
                  scene.add(leaves);
              }
          }
          if(room.type === "parking" || room.type === "garage") {
              const centerX = room.x + room.w / 2;
              const centerZ = room.y + room.h / 2;
              const isVertical = room.h > room.w;
              const carY = room.floor * 10 + 0.22; 
              
              addCarImage({
                  scene,
                  url: "/icons/vecteezy_car-3d-illustration-icon_28213286.png",
                  position: { x: centerX, z: centerZ },
                  y: carY,
                  rotationY: isVertical ? Math.PI / 2 : 0,
                  width: 4.8,
                  height: 2.2
              });
          }
          return; // Skip walls/doors/windows/furniture
      }

      // Determine accent wall
      let mat = wallWhiteMaterial;
      if (viewMode === 'exterior' && (room.type === 'entrance')) {
          mat = wallWoodMaterial;
      }

      if (viewMode === 'exterior') {
          // Identify windows on each wall
          const winsN = [];
          const winsS = [];
          const winsW = [];
          const winsE = [];
          
          room.windows.forEach(w => {
              // Tolerance for wall detection
              if (Math.abs(w.y) < 1) winsN.push({ ...w, pos: w.x + wallThickness }); // Offset for corner
              else if (Math.abs(w.y - room.h) < 1) winsS.push({ ...w, pos: w.x + wallThickness });
              else if (Math.abs(w.x) < 1) winsW.push({ ...w, pos: w.y }); // Start at room.y
              else if (Math.abs(w.x - room.w) < 1) winsE.push({ ...w, pos: w.y });
          });

          // North (Horizontal)
          createSegmentedWall(
              room.x - wallThickness, 
              room.x + room.w + wallThickness, 
              wallHeight, wallThickness, floorY, 
              room.y - wallThickness/2, 
              'H', winsN, mat
          );
          
          // South (Horizontal)
          createSegmentedWall(
              room.x - wallThickness, 
              room.x + room.w + wallThickness, 
              wallHeight, wallThickness, floorY, 
              room.y + room.h + wallThickness/2, 
              'H', winsS, mat
          );
          
          // West (Vertical)
          createSegmentedWall(
              room.y, 
              room.y + room.h, 
              wallHeight, wallThickness, floorY, 
              room.x - wallThickness/2, 
              'V', winsW, mat
          );
          
          // East (Vertical)
          createSegmentedWall(
              room.y, 
              room.y + room.h, 
              wallHeight, wallThickness, floorY, 
              room.x + room.w + wallThickness/2, 
              'V', winsE, mat
          );

      } else {
          // Legacy Walls (Floorplan View)
          // North
          createWall(room.w + wallThickness * 2, wallHeight, wallThickness, room.x + room.w/2, floorY + wallHeight/2, room.y - wallThickness/2, mat);
          // South
          createWall(room.w + wallThickness * 2, wallHeight, wallThickness, room.x + room.w/2, floorY + wallHeight/2, room.y + room.h + wallThickness/2, mat);
          // West
          createWall(wallThickness, wallHeight, room.h, room.x - wallThickness/2, floorY + wallHeight/2, room.y + room.h/2, mat);
          // East
          createWall(wallThickness, wallHeight, room.h, room.x + room.w + wallThickness/2, floorY + wallHeight/2, room.y + room.h/2, mat);
      }

      // Doors 
      room.doors.forEach(d => { 
        const frameH = 7;
        const door = new THREE.Mesh(new THREE.BoxGeometry(3, frameH, 0.2), new THREE.MeshStandardMaterial({color: "#8d6e63"})); 
        door.position.set(room.x + d.x, floorY + frameH/2, room.y + d.y);
        scene.add(door);
      }); 

      // Windows (Only for floorplan view now, as exterior handles them in segmented walls)
      if (viewMode !== 'exterior') {
        room.windows.forEach(w => { 
            const win = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 0.2), glassMaterial);
            win.position.set(room.x + w.x, floorY + 4, room.y + w.y);
            win.castShadow = true;
            scene.add(win);
            const frame = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.2, 0.1), frameMaterial);
            frame.position.set(room.x + w.x, floorY + 4, room.y + w.y);
            scene.add(frame);
        }); 
      }

      addFurniture(room);
    }); 

    // Generate Roof (Only in Exterior Mode)
    if (viewMode === 'exterior') {
        Object.keys(floorBounds).forEach(fIndex => {
            const f = parseInt(fIndex);
            // Check if there is a floor above this one?
            // If yes, only roof the parts that are NOT covered by floor above.
            // Simplification: Just roof the top floor for now, or all floors if offset.
            // For a flat roof house, usually just one main roof.
            
            // Let's just roof the MAX floor for simplicity, assuming simple stacked house.
            // If we have multi-story with setbacks, we need complex logic.
            // But let's assume the top floor covers everything or just roof the top.
            
            if (f === maxFloor) {
                const b = floorBounds[f];
                const width = b.maxX - b.minX + 2; // Overhang
                const depth = b.maxZ - b.minZ + 2;
                const roofY = (f + 1) * 10;

                // Main Roof Slab
                const roof = new THREE.Mesh(
                    new THREE.BoxGeometry(width, 0.5, depth),
                    roofMaterial
                );
                roof.position.set(
                    (b.minX + b.maxX)/2,
                    roofY,
                    (b.minZ + b.maxZ)/2
                );
                roof.castShadow = true;
                roof.receiveShadow = true;
                scene.add(roof);

                // Parapet Wall (Rim)
                const rimHeight = 1.5;
                const rimThickness = 0.5;
                const rimMat = wallWhiteMaterial; // White parapet
                
                // 4 sides of parapet
                // North
                const pN = new THREE.Mesh(new THREE.BoxGeometry(width, rimHeight, rimThickness), rimMat);
                pN.position.set((b.minX + b.maxX)/2, roofY + rimHeight/2, b.minZ - 1 + rimThickness/2);
                scene.add(pN);
                // South
                const pS = new THREE.Mesh(new THREE.BoxGeometry(width, rimHeight, rimThickness), rimMat);
                pS.position.set((b.minX + b.maxX)/2, roofY + rimHeight/2, b.maxZ + 1 - rimThickness/2);
                scene.add(pS);
                // West
                const pW = new THREE.Mesh(new THREE.BoxGeometry(rimThickness, rimHeight, depth), rimMat);
                pW.position.set(b.minX - 1 + rimThickness/2, roofY + rimHeight/2, (b.minZ + b.maxZ)/2);
                scene.add(pW);
                // East
                const pE = new THREE.Mesh(new THREE.BoxGeometry(rimThickness, rimHeight, depth), rimMat);
                pE.position.set(b.maxX + 1 - rimThickness/2, roofY + rimHeight/2, (b.minZ + b.maxZ)/2);
                scene.add(pE);
            }
        });
    }

    // Stairs 
    stairs.forEach(s => { 
      const stepCount = 10;
      const stepHeight = 10 / stepCount;
      const stepDepth = s.h / stepCount;
      for(let i=0; i<stepCount; i++) {
          const step = new THREE.Mesh(new THREE.BoxGeometry(s.w, stepHeight, stepDepth), floorMaterial);
          step.position.set(s.x + s.w/2, s.fromFloor * 10 + (i * stepHeight) + stepHeight/2, s.y + (i * stepDepth) + stepDepth/2);
          step.castShadow = true;
          step.receiveShadow = true;
          scene.add(step);
      }
    }); 

    // Columns
    columns.forEach(col => { 
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(col.size, col.height, col.size), wallWhiteMaterial); 
      mesh.position.set(col.x + col.size / 2, col.floor * 10 + col.height / 2, col.y + col.size / 2); 
      mesh.castShadow = true;
      scene.add(mesh); 
    }); 

    // Extras (Garden, Parking)
    extras.forEach(e => { 
      let material;
      if (e.type === "garden") {
          const gardenTexture = grassTexture.clone();
          // Adjust repeat based on size (assuming 20 units per tile match the main ground density)
          gardenTexture.wrapS = THREE.RepeatWrapping;
          gardenTexture.wrapT = THREE.RepeatWrapping;
          gardenTexture.repeat.set(Math.max(1, e.w / 20), Math.max(1, e.h / 20));
          
          material = new THREE.MeshStandardMaterial({ map: gardenTexture, roughness: 1 });
      } else {
          let color = "#9e9e9e";
          if(e.type === "parking" || e.type === "garage") color = "#e0e0e0";
          material = new THREE.MeshStandardMaterial({ color });
      }
      
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(e.w, 0.2, e.h), material); 
      mesh.position.set(e.x + e.w / 2, e.floor * 10 + 0.1, e.y + e.h / 2); 
      mesh.receiveShadow = true;
      scene.add(mesh); 

      // Trees
      if(e.type === "garden") {
          const treeCount = Math.floor((e.w * e.h) / 50); 
          for(let i=0; i<treeCount; i++) {
              const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3, 8), new THREE.MeshStandardMaterial({ color: "#5d4037" }));
              const tx = e.x + Math.random() * e.w;
              const ty = e.y + Math.random() * e.h;
              trunk.position.set(tx, e.floor * 10 + 1.5, ty);
              trunk.castShadow = true;
              scene.add(trunk);
              const leaves = new THREE.Mesh(new THREE.ConeGeometry(2, 6, 8), new THREE.MeshStandardMaterial({ color: "#2e7d32" }));
              leaves.position.set(tx, e.floor * 10 + 4.5, ty);
              leaves.castShadow = true;
              scene.add(leaves);
          }
      }

      // Cars
      if(e.type === "parking" || e.type === "garage") {
          const centerX = e.x + e.w / 2;
          const centerZ = e.y + e.h / 2;
          const isVertical = e.h > e.w;
          const carY = e.floor * 10 + 0.22; // On top of parking mesh (0.1 center + 0.1 half-height + margin)
          
          addCarImage({
              scene,
              url: "/icons/vecteezy_car-3d-illustration-icon_28213286.png",
              position: { x: centerX, z: centerZ },
              y: carY,
              rotationY: isVertical ? Math.PI / 2 : 0,
              width: 4.8,
              height: 2.2
          });
      }
    }); 

    let animationId;
    const animate = () => { 
      const mode = animationModeRef.current;
      const now = Date.now();
      
      let camX, camY, camZ;
      let targetX = centerX;
      let targetY = 0;
      let targetZ = centerZ;
      
      const defaultCamHeight = maxDim * 1.2;

      if (mode === 'orbit') {
          // 360 Drone View (15s full loop)
          const elapsed = now - startTimeRef.current;
          const angle = (elapsed / 15000) * Math.PI * 2; 
          const radius = viewMode === 'exterior' ? maxDim * 1.5 : cameraRadius;
          
          camX = centerX + radius * Math.cos(angle);
          camZ = centerZ + radius * Math.sin(angle);
          camY = viewMode === 'exterior' ? maxDim * 0.8 : defaultCamHeight;
      } else if (mode === 'walkthrough') {
          // Interior Walkthrough (15s path)
          const elapsed = now - startTimeRef.current;
          const t = (elapsed / 15000) * Math.PI * 2;
          
          const pathW = Math.min(plotWidth, plotDepth) * 0.3; 
          
          camX = centerX + Math.sin(t) * pathW;
          camZ = centerZ + Math.sin(t * 2) * pathW; // Figure 8
          camY = 5.5; // Eye level

          const nextT = t + 0.1;
          targetX = centerX + Math.sin(nextT) * pathW;
          targetZ = centerZ + Math.sin(nextT * 2) * pathW;
          targetY = 5.5;
      } else {
          // Idle Animation (Slow Rotation)
          const time = now * 0.0001; 
          const radius = viewMode === 'exterior' ? maxDim * 1.5 : cameraRadius;
          camX = centerX + radius * Math.cos(time);
          camZ = centerZ + radius * Math.sin(time);
          camY = viewMode === 'exterior' ? maxDim * 0.6 : defaultCamHeight;
      }

      camera.position.x = camX;
      camera.position.y = camY;
      camera.position.z = camZ;
      camera.lookAt(targetX, targetY, targetZ);
      
      renderer.render(scene, camera); 
      animationId = requestAnimationFrame(animate); 
    }; 
    animate(); 

    return () => { 
      cancelAnimationFrame(animationId); 
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      resizeObserver.disconnect();
      renderer.dispose();
    }; 
  }, [rooms, stairs, extras, columns, plotWidth, plotDepth, viewMode]); 

  return <div ref={mountRef} style={{ width: "100%", height: "100%", borderRadius: '16px', overflow: 'hidden' }} />; 
}
