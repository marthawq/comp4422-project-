import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// var
let camera, scene, renderer
let axesHelper
let hemiLight, ambientLight
let hesLight, dirLight
let box, plane1, plane2, plane3
let treeGroup, treeGroup2
let controls
let root, model
let action = []
let clip
let mixer, mixerFloor
let clock = new THREE.Clock()


// init
// 初始化场景
initScene()
loadSkyLand()
// 初始化相机
initCamera()
// 初始化辅助轴
initAxesHelper()
// 初始化灯光
initLight()
// 初始化渲染器
initRenderer()
// 鼠标控件
initMouse()

// initMeshes()
initHorse()
initTree()
initTree2()
// initAnimation()
// enableAnimation()
// 循环执行
animate()
// 初始化轨道控制器
// initControl()

// 窗体重置
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})


function initScene() {
    scene = new THREE.Scene()
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(-3, 15, -10)
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}

function initAxesHelper() {
    axesHelper = new THREE.AxesHelper(3)
    scene.add(axesHelper)
}

function initLight() {
    hesLight = new THREE.HemisphereLight(0xffffff, 0x000000)
    hesLight.intensity = 3
    hesLight.position.set(0, 5, 0);
    scene.add(hesLight)
    // const hemiLightHelper = new THREE.HemisphereLightHelper(hesLight, 1);
    // scene.add(hemiLightHelper);

    // ambientLight = new THREE.AmbientLight("#111111");
    // scene.add(ambientLight);


    dirLight = new THREE.DirectionalLight(0xffffff, 2)
    dirLight.position.set(5, 8, -10)

    dirLight.castShadow = true; // 投射阴影
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.left = -10; // 左平面
    dirLight.shadow.camera.right = 10; // 右平面
    dirLight.shadow.camera.top = 10; // 上平面
    dirLight.shadow.camera.bottom = -10; // 下平面
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;

    scene.add(dirLight);

    // const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 1);
    // scene.add(dirLightHelper);

    //光投影相机
    // const cam = dirLight.shadow.camera;
    // const cameraHelper = new THREE.CameraHelper(cam);
    // scene.add(cameraHelper);
    // cameraHelper.visible = true;

}

function initRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)

    renderer.shadowMap.enabled = true;

    document.body.appendChild(renderer.domElement)
}

function animate() {
    const delta = clock.getDelta() //获取自 .oldTime 设置后到当前的秒数。
    requestAnimationFrame(animate)
    // 更新mixer，delta 一个时间的概念
    if (mixer) {
        mixer.update(delta)
    }

    // 地面平移
    plane1.position.x -= 0.1;
    treeGroup.position.x -= 0.1;
    treeGroup2.position.x -= 0.1;

    // 当地面移出屏幕时，生成新的地面
    if (plane1.position.x <= -5) {
        generateNewPlane();
    }
    if (treeGroup.position.x <= -23) {
        generateNewTree();
    }
    if (treeGroup2.position.x <= -28) {
        generateNewTree2();
    }


    renderer.render(scene, camera)
}

function initMouse() {
    new OrbitControls(camera, renderer.domElement)
}

function initHorse() {
    const loader = new FBXLoader();
    loader.load('asset/horse_animation(6).fbx', function (model) {
        // loader.load('asset/mutant.fbx', function (model) {
        // loader.load( 'asset/wraith.glb', function ( glb ) {
        // loader.load( 'asset/Wraith_Animated.glb', function ( glb ) {

        // console.log(glb);
        console.log(model.animations)
        // console.log(model.animations[0])

        model.scale.set(0.005, 0.005, 0.005)

        // root.rotation.set(0, -0.9, 0)
        // root.position.set(0,-10,-20)
        // root.scale.set(30, 30, 30)
        // root.rotation.set(0, 5, 0)

        scene.add(model);

        model.traverse(function (obj) {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        })

        console.log("loaded");

        mixer = new THREE.AnimationMixer(model)
        // console.log(model.animations.length)
        for (let i = 0; i < model.animations.length; i++) {
            action[i] = mixer.clipAction(model.animations[i])
            // console.log(action[i])
        }
        action[0].play()

    }, function (xhr) {

        console.log((xhr.loaded / xhr.total * 100) + "% loaded");

    }, function (error) {

        console.log(error);

    });
}

function initTree() {
    treeGroup = new THREE.Group();
    OneTree(6, 0, 4, 0.02, treeGroup)
    OneTree(2, 0, -5, 0.02, treeGroup)
    OneTree(-3, 0, -2, 0.02, treeGroup)
    OneTree(5, 0, 3, 0.018, treeGroup)

    treeGroup.position.set(0, 0, 0);
    scene.add(treeGroup)

}

function initTree2() {
    treeGroup2 = new THREE.Group();
    OneTree(16, 0, 4, 0.02, treeGroup2)
    OneTree(9, 0, -3, 0.02, treeGroup2)
    OneTree(7, 0, -1.5, 0.02, treeGroup2)
    OneTree(18, 0, -3, 0.018, treeGroup2)

    treeGroup2.position.set(0, 0, 0);
    scene.add(treeGroup2)
}

function OneTree(x, y, z, scale, group) {
    const loader = new FBXLoader();
    loader.load('asset/Tree_low.fbx', function (tree) {
        console.log(tree.animations)

        tree.scale.set(scale, scale, scale)
        tree.position.set(x, y, z)

        tree.traverse(function (obj) {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        })

        group.add(tree)

        console.log("loaded");
    }, function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + "% loaded");
    }, function (error) {
        console.log(error);
    });
}

function loadSkyLand() {

    const loader = new THREE.TextureLoader();

    const skyBox = loader.load('asset/sky.jpg');
    // const back = new THREE.TextureLoader().load('asset/longGrass.jpg');

    scene.background = skyBox;
    scene.fog = new THREE.Fog(0xbeffb8, 0.5, 100);


    const geometry = new THREE.PlaneGeometry(50, 20);
    const grass = new THREE.TextureLoader().load('asset/longGrass.jpg');
    const materialGrass = new THREE.MeshPhongMaterial({ map: grass, side: THREE.DoubleSide, transparent: true });
    const front = new THREE.TextureLoader().load('asset/front.jpg');
    const materialFront = new THREE.MeshPhongMaterial({ map: front, side: THREE.DoubleSide, transparent: true });
    const back = new THREE.TextureLoader().load('asset/back.jpeg');
    const materialBack = new THREE.MeshPhongMaterial({ map: back, side: THREE.DoubleSide, transparent: true });
    const mater = new THREE.MeshPhongMaterial({ color: 0x999999, side: THREE.DoubleSide, transparent: true });

    plane1 = new THREE.Mesh(geometry, materialGrass);
    plane1.position.set(0, 0, 0)
    plane1.rotateX(Math.PI / 2)

    plane1.receiveShadow = true;
    scene.add(plane1);

    const geo = new THREE.PlaneGeometry(20, 10);
    plane2 = new THREE.Mesh(geo, materialBack);
    plane2.position.x = -10;
    plane2.position.y = 5;

    plane2.rotateY(Math.PI / 2)
    scene.add(plane2);

    plane3 = new THREE.Mesh(geo, materialFront);
    plane3.position.x = 10;
    plane3.position.y = 5;

    plane3.rotateY(Math.PI / 2)
    scene.add(plane3);

}

function initMeshes() {
    box = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    )
    box.position.set(0, 0.6, 0)
    box.castShadow = true
    box.receiveShadow = true
    scene.add(box)
}

function initAnimation() {
    // 移动
    const moveKeyFrame = new THREE.VectorKeyframeTrack(
        '.position',//要控制关键帧的名称
        [0, 1, 2],// 定义三帧
        [
            0, 0, 0,//第一帧位置
            5, 0, 0,//第二帧位置
            0, 0, 0//第三帧位置
        ]
    )
    clip = new THREE.AnimationClip(
        'Action', //动画名称
        4,//动画持续时间
        [moveKeyFrame]//轨迹
    )

}

function enableAnimation() {
    // 通过创建动画混合器实例，实现要做动画的物体与动画关联起来
    mixer = new THREE.AnimationMixer(root)
    // 通过动画混合器的clipAction方法，实现动画剪辑AnimationClip与动画混合器的关联
    const clipAction = mixer.clipAction(clip)
    clipAction.play()
}


function generateNewPlane() {
    const newPlane = plane1.clone();
    // 移除旧的地面
    scene.remove(plane1);
    newPlane.position.x = 10; // 根据原始地面的位置计算新地面的位置
    scene.add(newPlane);
    plane1 = newPlane;
}

function generateNewTree() {
    const newTG = treeGroup.clone();
    scene.remove(treeGroup);
    newTG.position.x = 14;
    scene.add(newTG);
    treeGroup = newTG;
}

function generateNewTree2() {
    const newTG = treeGroup2.clone();
    scene.remove(treeGroup2);
    newTG.position.x = 9;
    scene.add(newTG);
    treeGroup2 = newTG;
}
