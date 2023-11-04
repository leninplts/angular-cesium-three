import { Component, OnInit } from '@angular/core';
import { Cartesian3, Color, Ion, Viewer, Math } from 'cesium';
import * as THREE from 'three'
import { getThreeModelQuaternion } from './3d';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'cesium-three';
  threeDiv!: HTMLDivElement
  viewer!: Viewer
  camera!: THREE.PerspectiveCamera
  renderer!: THREE.WebGLRenderer
  scene!: THREE.Scene
  cube!: THREE.Mesh
  minWGS84 = [115.23,39.55];
  maxWGS84 = [116.23,41.55];
  ngOnInit(): void {
    this.initializeCesium()
    this.initializeThree()
    // this.addCesiumObjects()
    this.addThreeObjects()
  }

  initializeThree() {
    this.threeDiv = document.getElementById('threeViewer') as HTMLDivElement;
    this.camera = this.createCamera(this.threeDiv)
    this.renderer = this.createRenderer(this.threeDiv)
    this.scene = this.createScene()
    this.addThreeLights()
    console.log({camera: this.camera, renderer: this.renderer, scene: this.scene});
    this.animate()
  }
  addThreeLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
  }

  createScene = () => {
    let scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000)
    return scene
  }

  createRenderer = (dom: HTMLDivElement) => {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true,
    });
    renderer.setSize(dom.clientWidth, dom.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // renderer.gammaFactor = 2.2;
    // renderer.outputEncoding = THREE.sRGBEncoding;
    // renderer.physicallyCorrectLights = true
    dom.appendChild(renderer.domElement);
    return renderer;
  }

  createCamera(dom: HTMLDivElement) {
    const camera = new THREE.PerspectiveCamera(
      75,
      dom.clientWidth / dom.clientHeight,
      0.1,
      100000,
    );
    return camera;
  }
  
  initializeCesium() {
    Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwYTZlMzlkOS1jM2I3LTRhNTEtYmE3My00MWM3ZmIwZTQxNWEiLCJpZCI6MTcwODk3LCJpYXQiOjE2OTY4ODMzOTd9.WFF_tqnNfHMMSEpvHcBVT8SL27PlkIayt3a0HK2gGYg';
    this.viewer = new Viewer('cesiumViewer')
    this.viewer.camera.setView({
			destination: Cartesian3.fromDegrees(120, 30, 100),
		});
  }

  // Cesium Objects
  addCesiumObjects() {
    var entity = {
      name : 'Polygon',
      polygon : {
        hierarchy : Cartesian3.fromDegreesArray([
          this.minWGS84[0], this.minWGS84[1],
          this.maxWGS84[0], this.minWGS84[1],
          this.maxWGS84[0], this.maxWGS84[1],
          this.minWGS84[0], this.maxWGS84[1],
        ]),
        material : Color.RED.withAlpha(0.2)
      }
    };
    var polygon = this.viewer.entities.add(entity);
    this.viewer.flyTo(polygon)
  }

  // Three js Objects
  addThreeObjects() {
    // add cube
		const cubeGeo = new THREE.BoxGeometry(6, 6, 6);
		cubeGeo.translate(0, 3, 0);
		this.cube = new THREE.Mesh(
			cubeGeo,
			new THREE.MeshPhongMaterial({ color: 0xff0000, side: THREE.DoubleSide }),
		);
		this.cube.name = 'cube';
		// @ts-ignore
		this.cube.position.copy(Cartesian3.fromDegrees(120, 30));
		this.cube.setRotationFromQuaternion(
			new THREE.Quaternion(...getThreeModelQuaternion(120, 30))
		);
		this.scene.add(this.cube);
  }

  animate = () => {
    // Render
    this.renderer.render(this.scene, this.camera);

    // Call tick again on the next frame
    this.renderCesium()
    this.renderThreejs()
    window.requestAnimationFrame(this.animate);
    console.log('animating');
  };
  renderThreejs() {
    //@ts-ignore
    this.camera.fov = Math.toDegrees(this.viewer.camera.frustum.fovy);
    this.camera.updateProjectionMatrix();
    this.camera.matrixAutoUpdate = false;
    this.camera.matrixWorldNeedsUpdate = false;

    const cvm = this.viewer.camera.viewMatrix;
    const civm = this.viewer.camera.inverseViewMatrix;

    this.camera.matrixWorld.set(
      civm[0], civm[4], civm[8], civm[12],
      civm[1], civm[5], civm[9], civm[13],
      civm[2], civm[6], civm[10], civm[14],
      civm[3], civm[7], civm[11], civm[15],
    );

    this.camera.matrixWorldInverse.set(
      cvm[0], cvm[4], cvm[8], cvm[12],
      cvm[1], cvm[5], cvm[9], cvm[13],
      cvm[2], cvm[6], cvm[10], cvm[14],
      cvm[3], cvm[7], cvm[11], cvm[15],
    );
    this.renderer.render(this.scene, this.camera)
  }
  renderCesium() {
    this.viewer.render()
  }
}
