import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { ZeroSlopeEnding } from 'three';

//Loading
const textureLoader = new THREE.TextureLoader();
const normalTexture = textureLoader.load('/textures/NormalMap.png');

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene();

// Geometry
const geometry = new THREE.TorusGeometry( .7, .2, 16, 100 );
const cube = new THREE.BoxGeometry(1, 1, 1);
const movingWallGeom = new THREE.BoxGeometry(28, 20, 5);

// Materials

const greenMat = new THREE.MeshBasicMaterial({color:0x00ff00});
const redMat = new THREE.MeshBasicMaterial({color:0xff0000});

const floorMat = new THREE.MeshStandardMaterial();
floorMat.normalMap = normalTexture;

const ringMat = new THREE.MeshStandardMaterial();
ringMat.color = new THREE.Color(0xFFD700);
ringMat.metalness = 0.4;
ringMat.roughness = 0.2;

// Objects
//rings
const ring = new THREE.Mesh(geometry,ringMat);
ring.position.set(0, 5, -5);
scene.add(ring);

const ringGui = gui.addFolder('ring');
ringGui.add(ring.position, 'x').min(-100).max(100).step(0.01);
ringGui.add(ring.position, 'y').min(-100).max(100).step(0.01);
ringGui.add(ring.position, 'z').min(-100).max(100).step(0.01);

let rings = {
    'r1': {x: 35, y: 5, z: 88, obj: new THREE.Mesh(geometry,ringMat)},
    'r2': {x: 35, y: 5, z: 80, obj: new THREE.Mesh(geometry,ringMat)},
    'r3': {x: 0, y: 5, z: -5, obj: new THREE.Mesh(geometry,ringMat)},
    'r4': {x: 3, y: 3, z: 1, obj: new THREE.Mesh(geometry,ringMat)}
}

//floor
const floor = new THREE.Mesh(
    new THREE.BoxGeometry(100, 0.1, 200),
    floorMat
);
scene.add(floor);

//walls
const wall = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 20, 50),
    floorMat
)
wall.position.set(23,10,75);
scene.add(wall);

//crates
const crate = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    redMat
)
crate.position.z = -5;
crate.position.y = 5;
crate.position.x = 2;
//scene.add(crate);

//enemies
const movingWall = new THREE.Mesh(
    new THREE.BoxGeometry(28, 20, 5),
    redMat
)
scene.add(movingWall);
let movingWalls = {
    'w1': {x: 36, y: 10, z: 53, dir: -1, obj: new THREE.Mesh(movingWallGeom, redMat)}
}

const testGui = gui.addFolder('test');
testGui.add(movingWall.position, 'x');
testGui.add(movingWall.position, 'y');
testGui.add(movingWall.position, 'z');

// Lights

const pointLight1 = new THREE.PointLight(0xffffff, 1.8);
pointLight1.position.x = 50;
pointLight1.position.y = 10;
pointLight1.position.z = 90;
scene.add(pointLight1);

const light1 = gui.addFolder('light1');
light1.add(pointLight1.position, 'x').min(-100).max(100).step(0.01);
light1.add(pointLight1.position, 'y').min(-100).max(100).step(0.01);
light1.add(pointLight1.position, 'z').min(-100).max(100).step(0.01);
light1.add(pointLight1, 'intensity').min(0).max(5).step(0.01);

const pointLightHelper = new THREE.PointLightHelper(pointLight1, 1);
scene.add(pointLightHelper);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 20;
camera.position.y = 10;
camera.position.z = 80;
scene.add(camera);

// Controls
// controls.enableDamping = true
const controls = new OrbitControls( camera, canvas );
controls.update();

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


//Adding Objects to the Scene
function addSceneObjects(list){
	for(let key in list){
		list[key].obj.position.x = list[key].x;
		list[key].obj.position.y = list[key].y;
		list[key].obj.position.z = list[key].z;
		scene.add(list[key].obj); 
	}
}

addSceneObjects(rings);
addSceneObjects(movingWalls);


/**
 * Animate
 */

const clock = new THREE.Clock()

function moveObjects(lista, xmin, xmax, speed){
	for(let key in lista){
		if(lista[key].obj.position.x + speed * lista[key].dir < xmin
			|| lista[key].obj.position.x + speed * lista[key].dir > xmax
			){
            lista[key].dir *= -1;
		}
		lista[key].obj.position.x += speed * lista[key].dir;
	}
}

function rotateRings(rings, elapsedTime){
    for(let key in rings){
        rings[key].obj.rotation.y = .5 * elapsedTime;
    }
}

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime();

    // Update objects
    ring.rotation.y = .5 * elapsedTime
    rotateRings(rings, elapsedTime);
    moveObjects(movingWalls, 9, 36, 0.5);

    // Update Orbital Controls
    controls.update();

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()