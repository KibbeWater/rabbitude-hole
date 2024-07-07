'use client';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { type Mesh, Vector3 } from 'three';
import { useEffect, useRef } from 'react';

type Point = { x: number; y: number };

function getCubicBezierPosition(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
    const invT = 1 - t;
    const invT2 = invT * invT;
    const invT3 = invT2 * invT;
    const t2 = t * t;
    const t3 = t2 * t;

    const x = invT3 * p0.x + 3 * invT2 * t * p1.x + 3 * invT * t2 * p2.x + t3 * p3.x;

    const y = invT3 * p0.y + 3 * invT2 * t * p1.y + 3 * invT * t2 * p2.y + t3 * p3.y;

    return { x, y };
}

const scaleInDur = 1.25; // seconds
const rotateDur = 22; // seconds

const _dScale = 1.2;
const deviceScale = new Vector3(_dScale, _dScale, _dScale);
function DeviceMesh(meshProps: JSX.IntrinsicElements['mesh']) {
    const mesh = useRef<Mesh>(null!);
    const { scene, materials } = useLoader(GLTFLoader, 'http://localhost:3000/assets/models/device.glb', (loader) => {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        loader.setDRACOLoader(dracoLoader);
    });

    useEffect(() => {
        const matGlass = materials?.['Material.002'];
        if (matGlass) {
            matGlass.transparent = true;
            matGlass.opacity = 0.4;
        }
    }, [materials]);

    useFrame(({ clock }) => {
        // Create a simple ease in-out effect for the scale with duration of 1.2 seconds
        const time = clock.getElapsedTime();
        const scaleInProg = Math.min(time / scaleInDur, 1);

        // Cubic bezier control points
        const p0 = { x: 0, y: 0 };
        const p1 = { x: 0, y: 1.2 };
        const p2 = { x: 0.8, y: 1 };
        const p3 = { x: 1, y: 1 };

        const scale = getCubicBezierPosition(scaleInProg, p0, p1, p2, p3);

        mesh.current.position.y = -0.1 + Math.sin(time) * 0.2;
        mesh.current.scale.set(deviceScale.x * scale.y, deviceScale.y * scale.y, deviceScale.z * scale.y);
        mesh.current.rotation.y = ((time % rotateDur) / rotateDur) * (Math.PI * 2);
    });

    return (
        <mesh ref={mesh} {...meshProps}>
            <primitive object={scene} />
        </mesh>
    );
}

export function DeviceScene() {
    return (
        <Canvas>
            <ambientLight intensity={100} />
            <directionalLight color='white' position={[0, 0, 5]} intensity={6} />
            <DeviceMesh />
        </Canvas>
    );
}
