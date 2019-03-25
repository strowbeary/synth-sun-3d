import {
    BufferGeometry,
    LineBasicMaterial,
    Mesh,
    Vector2,
    Vector3,
    CatmullRomCurve3,
    Line,
    Group
} from "three";

import * as audio from "../capture_audio";

import SimplexNoise from "simplex-noise";
const simplex = new SimplexNoise(Math.random);
import sma from "sma";
const line_length = 50;
const line_height = 70;

function compute_keys(datas, datas2) {
    datas = Array.from(datas);
    datas = sma(datas, 10);
    datas2 = Array.from(datas2);
    datas2 = sma(datas2, 10);
    return datas.map((sample, i) => {
        const x = i * (line_length / datas.length) - line_length / 2;
        return new Vector3(
            x,
            Math.sin(x) * (datas2[i] / (line_height / 2) + 1),
            Math.cos(x) * (datas2[i] / (line_height / 2) + 1)
        );
    });
}
export default async function init(scene, camera, renderer) {
    const {
        analyser_left,
        analyser_right
    } = await audio.init();

    const sample_number_left = analyser_left.frequencyBinCount;
    const sample_number_right = analyser_right.frequencyBinCount;

    let data_max = new Uint8Array(sample_number_left);
    let data_left = new Uint8Array(sample_number_left);
    let data_right = new Uint8Array(sample_number_right);

    const material_left = new LineBasicMaterial({
        color: 0xff3d3d,
        linewidth: 2,
        linecap: 'round', //ignored by WebGLRenderer
        linejoin: 'round' //ignored by WebGLRenderer
    });
    const material_right = new LineBasicMaterial({
        color: 0xffffff,
        linewidth: 2,
        linecap: 'round', //ignored by WebGLRenderer
        linejoin: 'round' //ignored by WebGLRenderer
    });

    const curve_left = new CatmullRomCurve3(compute_keys(data_left, data_max));
    const curve_right = new CatmullRomCurve3(compute_keys(data_right, data_max));

    const geometry_left = new BufferGeometry();
    const geometry_right = new BufferGeometry();

    const spline_left = new Line(geometry_left, material_left);
    const spline_right = new Line(geometry_right, material_right);

    spline_left.updateMatrix();
    spline_right.updateMatrix();

    spline_left.rotation.y = -Math.PI / 2;
    spline_right.rotation.y = Math.PI / 2;

    spline_left.geometry.applyMatrix(spline_left.matrix);
    spline_right.geometry.applyMatrix(spline_right.matrix);

    spline_left.rotation.x = Math.PI;
    const group = new Group()
    group.add(spline_left);
    group.add(spline_right);
    scene.add(group);

    return function animate(ts) {
        data_max = data_max.map((old, i) => Math.max(old, data_left[i], data_right[i]));
        analyser_left.getByteFrequencyData(data_left);
        analyser_right.getByteFrequencyData(data_right);
        curve_left.points = compute_keys(data_left, data_max);
        curve_right.points = compute_keys(data_right, data_max);

        geometry_left.setFromPoints(curve_left.getPoints(sample_number_left * 2));
        geometry_right.setFromPoints(curve_right.getPoints(sample_number_right * 2));

        data_max = data_max.map((old) => old - 0.05)
        group.rotation.z -= 0.01;

    }
}