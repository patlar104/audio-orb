/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// tslint:disable:organize-imports
// tslint:disable:ban-malformed-import-paths
// tslint:disable:no-new-decorators

import {LitElement, css, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {Analyser} from './analyser';

import * as THREE from 'three';
import {EXRLoader} from 'three/addons/loaders/EXRLoader.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {FXAAShader} from 'three/addons/shaders/FXAAShader.js';
import {fs as backdropFS, vs as backdropVS} from './backdrop-shader';
import {vs as sphereVS} from './sphere-shader';

interface AudioDevice {
  deviceId: string;
  label: string;
}

/**
 * 3D live audio visual.
 */
@customElement('gdm-live-audio-visuals-3d')
export class GdmLiveAudioVisuals3D extends LitElement {
  private inputAnalyser!: Analyser;
  private outputAnalyser!: Analyser;
  private camera!: THREE.PerspectiveCamera;
  private backdrop!: THREE.Mesh;
  private composer!: EffectComposer;
  private sphere!: THREE.Mesh;
  private prevTime = 0;
  private rotation = new THREE.Vector3(0, 0, 0);

  @state() isMuted = false;
  @state() showSettings = false;
  @state() showCaptions = false;
  @state() audioDevices: AudioDevice[] = [];
  @state() selectedAudioDevice = 'default';
  @state() selectedVoice = 'Orus';
  @state() captions = '';

  private _outputNode!: AudioNode;

  @property()
  set outputNode(node: AudioNode) {
    this._outputNode = node;
    this.outputAnalyser = new Analyser(this._outputNode);
  }

  get outputNode() {
    return this._outputNode;
  }

  private _inputNode!: AudioNode;

  @property()
  set inputNode(node: AudioNode) {
    this._inputNode = node;
    this.inputAnalyser = new Analyser(this._inputNode);
  }

  get inputNode() {
    return this._inputNode;
  }

  private canvas!: HTMLCanvasElement;

  static styles = css`
    canvas {
      width: 100% !important;
      height: 100% !important;
      position: absolute;
      inset: 0;
      image-rendering: pixelated;
    }

    .top-bar {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 20;
      display: flex;
      gap: 12px;
    }

    .caption {
      position: absolute;
      top: 20px;
      left: 20px;
      z-index: 20;
      background: rgba(0, 0, 0, 0.7);
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-size: 16px;
      max-width: 300px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .controls-bottom {
      position: absolute;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 20;
      display: flex;
      gap: 12px;
      align-items: center;
      background: rgba(0, 0, 0, 0.6);
      padding: 16px 20px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
    }

    button {
      outline: none;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.1);
      width: 48px;
      height: 48px;
      cursor: pointer;
      font-size: 24px;
      padding: 0;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      &.muted {
        background: rgba(245, 87, 108, 0.3);
        border-color: rgba(245, 87, 108, 0.5);
      }

      &.settings {
        background: rgba(102, 126, 234, 0.3);
        border-color: rgba(102, 126, 234, 0.5);
      }
    }

    .icon-button {
      font-size: 20px;
    }

    .divider {
      width: 1px;
      height: 24px;
      background: rgba(255, 255, 255, 0.2);
    }

    .top-controls {
      display: flex;
      gap: 12px;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      backdrop-filter: blur(5px);
    }

    .modal {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      padding: 24px;
      color: white;
      min-width: 320px;
      max-width: 400px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      font-size: 20px;
      font-weight: 600;
    }

    .close-button {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 24px;
      width: auto;
      height: auto;
      padding: 0;
      opacity: 0.7;
      transition: opacity 0.2s;

      &:hover {
        opacity: 1;
      }
    }

    .modal-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .setting-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .setting-label {
      font-size: 14px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
    }

    select {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;

      option {
        background: #1a1a2e;
        color: white;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      &:focus {
        outline: none;
        border-color: rgba(102, 126, 234, 0.5);
        background: rgba(255, 255, 255, 0.12);
      }
    }

    .apply-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 8px;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
      }
    }

    .back-button {
      position: absolute;
      top: 20px;
      left: 20px;
      z-index: 20;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.getAudioDevices();
  }

  private async getAudioDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.audioDevices = devices
        .filter((device) => device.kind === 'audioinput')
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.substring(0, 5)}`,
        }));
    } catch (err) {
      console.error('Error getting audio devices:', err);
    }
  }

  private toggleMute() {
    this.isMuted = !this.isMuted;
    this.dispatchEvent(
      new CustomEvent('mute-toggle', { detail: { isMuted: this.isMuted } })
    );
  }

  private toggleCaptions() {
    this.showCaptions = !this.showCaptions;
  }

  private handleScreenShare() {
    console.log('Screen share clicked - feature coming soon');
  }

  private handleCameraToggle() {
    console.log('Camera toggle clicked - feature coming soon');
  }

  private exitLiveMode() {
    this.dispatchEvent(new CustomEvent('back-to-chat'));
  }

  private toggleSettings() {
    this.showSettings = !this.showSettings;
  }

  private applySettings() {
    this.showSettings = false;
  }

  private init() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x100c14);

    const backdrop = new THREE.Mesh(
      new THREE.IcosahedronGeometry(10, 5),
      new THREE.RawShaderMaterial({
        uniforms: {
          resolution: {value: new THREE.Vector2(1, 1)},
          rand: {value: 0},
        },
        vertexShader: backdropVS,
        fragmentShader: backdropFS,
        glslVersion: THREE.GLSL3,
      }),
    );
    backdrop.material.side = THREE.BackSide;
    scene.add(backdrop);
    this.backdrop = backdrop;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(2, -2, 5);
    this.camera = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio / 1);

    const geometry = new THREE.IcosahedronGeometry(1, 10);

    new EXRLoader().load('piz_compressed.exr', (texture: THREE.Texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
      sphereMaterial.envMap = exrCubeRenderTarget.texture;
      sphere.visible = true;
    });

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x000010,
      metalness: 0.5,
      roughness: 0.1,
      emissive: 0x000010,
      emissiveIntensity: 1.5,
    });

    sphereMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.time = {value: 0};
      shader.uniforms.inputData = {value: new THREE.Vector4()};
      shader.uniforms.outputData = {value: new THREE.Vector4()};

      sphereMaterial.userData.shader = shader;

      shader.vertexShader = sphereVS;
    };

    const sphere = new THREE.Mesh(geometry, sphereMaterial);
    scene.add(sphere);
    sphere.visible = false;

    this.sphere = sphere;

    const renderPass = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      5,
      0.5,
      0,
    );

    const fxaaPass = new ShaderPass(FXAAShader);

    const composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    // composer.addPass(fxaaPass);
    composer.addPass(bloomPass);

    this.composer = composer;

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      const dPR = renderer.getPixelRatio();
      const w = window.innerWidth;
      const h = window.innerHeight;
      backdrop.material.uniforms.resolution.value.set(w * dPR, h * dPR);
      renderer.setSize(w, h);
      composer.setSize(w, h);
      fxaaPass.material.uniforms['resolution'].value.set(
        1 / (w * dPR),
        1 / (h * dPR),
      );
    }

    window.addEventListener('resize', onWindowResize);
    onWindowResize();

    this.animation();
  }

  private animation() {
    requestAnimationFrame(() => this.animation());

    this.inputAnalyser.update();
    this.outputAnalyser.update();

    const t = performance.now();
    const dt = (t - this.prevTime) / (1000 / 60);
    this.prevTime = t;
    const backdropMaterial = this.backdrop.material as THREE.RawShaderMaterial;
    const sphereMaterial = this.sphere.material as THREE.MeshStandardMaterial;

    backdropMaterial.uniforms.rand.value = Math.random() * 10000;

    if (sphereMaterial.userData.shader) {
      this.sphere.scale.setScalar(
        1 + (0.2 * this.outputAnalyser.data[1]) / 255,
      );

      const f = 0.001;
      this.rotation.x += (dt * f * 0.5 * this.outputAnalyser.data[1]) / 255;
      this.rotation.z += (dt * f * 0.5 * this.inputAnalyser.data[1]) / 255;
      this.rotation.y += (dt * f * 0.25 * this.inputAnalyser.data[2]) / 255;
      this.rotation.y += (dt * f * 0.25 * this.outputAnalyser.data[2]) / 255;

      const euler = new THREE.Euler(
        this.rotation.x,
        this.rotation.y,
        this.rotation.z,
      );
      const quaternion = new THREE.Quaternion().setFromEuler(euler);
      const vector = new THREE.Vector3(0, 0, 5);
      vector.applyQuaternion(quaternion);
      this.camera.position.copy(vector);
      this.camera.lookAt(this.sphere.position);

      sphereMaterial.userData.shader.uniforms.time.value +=
        (dt * 0.1 * this.outputAnalyser.data[0]) / 255;
      sphereMaterial.userData.shader.uniforms.inputData.value.set(
        (1 * this.inputAnalyser.data[0]) / 255,
        (0.1 * this.inputAnalyser.data[1]) / 255,
        (10 * this.inputAnalyser.data[2]) / 255,
        0,
      );
      sphereMaterial.userData.shader.uniforms.outputData.value.set(
        (2 * this.outputAnalyser.data[0]) / 255,
        (0.1 * this.outputAnalyser.data[1]) / 255,
        (10 * this.outputAnalyser.data[2]) / 255,
        0,
      );
    }

    this.composer.render();
  }

  protected firstUpdated() {
    this.canvas = this.shadowRoot!.querySelector('canvas') as HTMLCanvasElement;
    this.init();
  }

  protected render() {
    return html`
      <canvas></canvas>
      
      <button class="back-button" @click=${this.exitLiveMode} title="Back to chat">
        ← Back
      </button>

      ${this.showCaptions
        ? html`<div class="caption">${this.captions || 'Listening...'}</div>`
        : ''}

      <div class="top-bar">
        <button
          class="icon-button ${this.showCaptions ? 'active' : ''}"
          @click=${this.toggleCaptions}
          title="Toggle captions">
          📝
        </button>
        <button
          class="icon-button settings"
          @click=${this.toggleSettings}
          title="Settings">
          ⚙️
        </button>
      </div>

      <div class="controls-bottom">
        <button
          class="icon-button ${this.isMuted ? 'muted' : ''}"
          @click=${this.toggleMute}
          title=${this.isMuted ? 'Unmute' : 'Mute'}>
          ${this.isMuted ? '🔇' : '🎤'}
        </button>
        <div class="divider"></div>
        <button
          class="icon-button"
          @click=${this.handleCameraToggle}
          title="Camera">
          📷
        </button>
        <button
          class="icon-button"
          @click=${this.handleScreenShare}
          title="Share screen">
          🖥️
        </button>
        <button
          class="icon-button"
          @click=${this.exitLiveMode}
          title="Exit live mode">
          ⏹️
        </button>
      </div>

      ${this.showSettings
        ? html`
            <div class="modal-overlay" @click=${() => (this.showSettings = false)}>
              <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
                <div class="modal-header">
                  <span>Settings</span>
                  <button
                    class="close-button"
                    @click=${() => (this.showSettings = false)}>
                    ✕
                  </button>
                </div>
                <div class="modal-content">
                  <div class="setting-group">
                    <label class="setting-label">Microphone</label>
                    <select
                      .value=${this.selectedAudioDevice}
                      @change=${(e: Event) =>
                        (this.selectedAudioDevice = (e.target as HTMLSelectElement).value)}>
                      <option value="default">Default</option>
                      ${this.audioDevices.map(
                        (device) => html`
                          <option value=${device.deviceId}>
                            ${device.label}
                          </option>
                        `
                      )}
                    </select>
                  </div>

                  <div class="setting-group">
                    <label class="setting-label">AI Voice</label>
                    <select
                      .value=${this.selectedVoice}
                      @change=${(e: Event) =>
                        (this.selectedVoice = (e.target as HTMLSelectElement).value)}>
                      <option value="Orus">Orus</option>
                      <option value="Puck">Puck</option>
                      <option value="Charon">Charon</option>
                      <option value="Kore">Kore</option>
                      <option value="Fenrir">Fenrir</option>
                      <option value="Aoede">Aoede</option>
                    </select>
                  </div>

                  <button
                    class="apply-button"
                    @click=${this.applySettings}>
                    Apply
                  </button>
                </div>
              </div>
            </div>
          `
        : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gdm-live-audio-visuals-3d': GdmLiveAudioVisuals3D;
  }
}
