import {
    SphereGeometry,
    MeshNormalMaterial,
    Mesh,
    Vector3
} from "three";

import * as audio from "../capture_audio";

import SimplexNoise from "simplex-noise";
const simplex = new SimplexNoise(Math.random);
import sma from "sma";
export default async function init(scene, camera, renderer) {
    const geometry = new SphereGeometry(5, 32, 32);
    const material = new MeshNormalMaterial();
    const cube = new Mesh(geometry, material);
    cube.position.set(0, 0, -8);
    scene.add(cube);
    const {
        analyser_left,
        analyser_right
    } = await audio.init();
    const tailleMemoireTampon = analyser_left.frequencyBinCount;
    const tableauDonnees = new Uint8Array(tailleMemoireTampon);

    return function animate(ts) {
        analyser_left.getByteFrequencyData(tableauDonnees);
        const scales = (tableauDonnees.reduce((a, c) => a + c) / tailleMemoireTampon) / 70;
        cube.scale.x = scales;
        cube.scale.y = scales;
        cube.scale.z = scales;
    }
}