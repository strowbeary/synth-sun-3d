import {
    Scene,
    WebGLRenderer,
    PerspectiveCamera,
    PointLight
} from "three";
import OrbitControls from 'orbit-controls-es6';
import simplex from "simplex-noise"
import spline from "./renderers/spline";
import cube from "./renderers/cube";
import audio from "./capture_audio";

const RENDERING_PILE = [];

function init() {
    const scene = new Scene();
    const renderer = new WebGLRenderer({ antialias: true });
    const {
        innerWidth,
        innerHeight
    } = window;
    renderer.setSize(innerWidth, innerHeight);
    document.body.appendChild(renderer.domElement);
    const camera = new PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 20000);
    camera.position.set(0, 0, 10);
    const controls = new OrbitControls( camera )
    scene.add(camera);
    renderer.setClearColor(0xffffff, 0)

    // Create a light, set its position, and add it to the scene.
    const point_light = new PointLight(0xffffff);
    point_light.position.set(0, 0, 0);
    scene.add(point_light);

    return {
        scene,
        renderer,
        camera,
        controls
    }
}

function animate(timestamp) {
	requestAnimationFrame(animate.bind(this));
    RENDERING_PILE.forEach(hook => hook(timestamp));
    this.renderer.setPixelRatio(1);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
}

window.addEventListener("DOMContentLoaded", () => {
    const {
        renderer,
        scene,
        camera,
        controls
    } = init();
    window.addEventListener('resize', function() {
        const {
            innerWidth,
            innerHeight
        } = window;
        renderer.setSize(innerWidth, innerHeight);
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
    });
    renderer.sortObjects = false;
    (async function () {

    	const spline_loop = await spline(scene, camera, renderer);
    	RENDERING_PILE.push(spline_loop);
    	return;
    })().then(animate.bind({scene, camera, renderer, controls}, [0]));
});