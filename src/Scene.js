'use strict';

const Matrix = require('./Matrix.js');
const ShaderProgram = require('./graphics/ShaderProgram.js');
const DefaultVertexShaderSource = require('raw-loader!../data/shaders/vertexshader.shader');
const DefaultFragmentShaderSource = require('raw-loader!../data/shaders/fragmentshader.shader');
const TexturedVertexShaderSource = require('raw-loader!../data/shaders/TexturedVertexShader.shader');
const TexturedFragmentShaderSource = require('raw-loader!../data/shaders/TexturedFragmentShader.shader');
const Camera = require('./Camera.js');


class Scene {

  constructor(canvasElement, viewportX, viewportY, viewportWidth, viewportHeight) {
    this.canvas = canvasElement;

    this.gl = this.canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!this.gl) alert('Unable to obtain WebGL/Experiment WebGL context');

    this.setViewPort(viewportX, viewportY, viewportWidth, viewportHeight);

    this.camera = new Camera();

    this.objects = [];

    window.defaultShaderProgram = new ShaderProgram(this.gl, DefaultVertexShaderSource, DefaultFragmentShaderSource);
    window.texturedShaderProgram = new ShaderProgram(this.gl, TexturedVertexShaderSource, TexturedFragmentShaderSource);
  }

  setViewPort(x = 0, y = 0, width = this.canvas.width, height = this.canvas.height) {
    this.gl.viewportWidth = 640;
    this.gl.viewportHeight = 480;
    this.gl.viewport(x, y, width, height);
  }

  addObject(object) {
    this.objects.push(object);
  }

  removeObject(object) {
    this.objects = this.objects.filter(obj => {
      return obj != object;
    });
  }

  enableBackFaceCulling(cullBackFaces = true) {
    const gl = this.gl;
    if (cullBackFaces) {
      gl.enable(gl.CULL_FACE);   // Turn on face-culling
      gl.frontFace(gl.CCW);      // Counter clockwise (CCW) vertex winding means your facing the front of a polygon
      gl.cullFace(gl.BACK);      // Cull (don't draw) polygons when their back is facing the camera
    } else {
      gl.disable(gl.CULL_FACE);
    }
  }

  render() {
    const gl = this.gl;

    // Depth Testing
    gl.enable(gl.DEPTH_TEST);  // Enable depth testing
    gl.depthFunc(gl.LESS);     // Draw pixels with a Z value less than the z value of the pixel already drawn at the same location on the frame buffer
    gl.depthMask(true);        // allow writing to Z-buffer

    // Set values to clear framebuffer bits to:
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything

    // Clear the framebuffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVerticesBuffer);

    const projMatrix = this.camera.getProjectionMatrix();
    const modelViewMatrix = this.camera.getModelViewMatrix();

    for(var i = 0; i < this.objects.length; i++) {
      this.objects[i].render(gl, projMatrix, modelViewMatrix);
    }
  }

  play() {
    setInterval(() => {
      this.render(this.gl); 
    }, 1500);
  }

}

module.exports = Scene;