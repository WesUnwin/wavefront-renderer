[![npm version](https://badge.fury.io/js/obj-renderer.svg)](https://badge.fury.io/js/obj-renderer)

# OBJ Renderer

A simple library to parse and render Wavefront 3D (.OBJ) files
and Material Template Library (.MTL) files.

## Installation

```javascript
npm install obj-renderer
```

## Examples
This repository comes with an easy to run demonstration using webpack development server.
To see the example application, clone this repo, run npm install, then npm run examples.
Then open localhost:8080 in a browser tab.

![Screenshot](docs/screenshot.png)

## Renderer
The principle type of object used with this library is a Renderer. A renderer performs the task of
rendering a given scene over a canvas, and limits the rendering to a rectangular area of the canvas
(the viewport).

```javascript
const Renderer = require('obj-renderer').Renderer;

// Create a renderer for drawing to an HTML canvas element
const renderer = new Renderer(canvas);

// Customize rendering parameters
renderer.setClearColor(0, 0, 255); // blue backdrop

// Load model(s) from .obj files.
// These are then referenced by the objects in a scene to draw models to given locations within the scene.
const crateModel = require('raw-loader!./Crate.obj'); // gets file's contents as a string
const otherModels = require('raw-loader!./OtherModels.obj');
renderer.loadOBJFile(crateModel, 'Crate'); // Gives an untitled object (one with no preceding "o modelName" statement) a name
renderer.loadOBJFile(otherModels);

// Draw a scene of objects to the canvas
renderer.renderScene(myScene);
```

| Method | Description |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `constructor(canvasElement, viewportX, viewportY, viewportWidth, viewportHeight)` | Creates a renderer instance for drawing to an HTML canvas element. If no viewport arguments are given, the entire area of the canvas is used. |
| `setViewPort(x, y, width, height)` | Changes the area of the canvas that the final rendered image should be drawn to. |
| `loadOBJFile(objFileContents, defaultModelName)` | Loads all models defined in the given .obj file (file contents should be passed in as a string), adding them to the renderers list of models. Models not assigned a name via a preceeding "o modelName" statement are assigned the defaultModelName. |
| `loadMTLFile(mtlFileContents)` | Loads all materials defined in an .mtl file (file contents should be passed in as a string), adding them to the renderers list of materials.
| `renderScene(scene)` | Draws the given scene object to the renderer's underlying canvas. |


## Scene
A scene object represents a 3D world, with a camera, and an array scene objects.
The objects can themselves have objects, forming a hierarchy of objects under the scene.
A scene can be constructed and initialized by passing in an object literal:

```javascript
  const Scene = require('obj-renderer').Scene;

  const myScene = new Scene({
    camera: {
      x: 0,
      y: 2,
      z: 10,
      rx: -20
    },
    objects: [
      { 
        modelName: 'Box',
        x: 0,
        y: 0,
        z: 0
      },
      {
        name: 'parentBox',
        modelName: 'Crate',
        x: 0,
        y: 1,
        z: 0,
        objects: [
          { 
            name: 'childBox',
            modelName: 'Crate',
            x: 3,
            y: 0,
            z: 0,
            sx: 0.5,
            sy: 0.5,
            sz: 0.5,
            rx: 0,
            ry: 0,
            rz: 0
          }
        ]
      }
    ]
  });
```

| Method | Description |
| --- | --- |
| `constructor(json)` | Creates a scene populating with the objects and camera defined in json. |
| `addObject(object)` | Adds an object to the scenes list of objects. |
| `removeObject(object)` | Removes the specified object from the scene. |
| `find(objectName)` | Returns the first scene object in the scene's hierarchy of objects with the given name. |
| `getCamera()` | Returns the Camera object associated with this scene. |


## Scene Objects
A scene object represents a 3D object that can be placed in a scene.
Each scene object can be directly attached to the scene, or another object within a scene.

Each scene object has a position, scale and rotation, that positions it relative
to its parent object (or the scene itself for top-level objects).

### Rotation:
The rotation of an object is specified by three Euler angles, which are applied sequentially in order of x, y then z, relative to the parent object.
- rx rotates the object in degrees, clockwise (when facing the direction the x-axis points) around the x-axis.
- ry rotates the object in degrees, clockwise (when facing the direction the y-axis points) around the y-axis.
- rz rotates the object in degrees, clockwise (when facing the direction the z-axis points) around the z-axis.

### Scale:
- sx scales the object by a float, in the x-axis
- sy scales the object by a float, in the y-axis
- sz scales the object by a float, in the z-axis

### Position:
Each object is positioned in space relative to its parent, by three signed floats, following a "left handed" coordinate system:
- x increases to the right
- y increases upwards
- z increases towards the camera

A scene object can be assigned a model name or not.
When assigned a model name, that model is rendered at the position of the scene object.
Scene objects with no model name will not render anything (but can be used to group child objects
that may or may not render a model).

```javascript
  const SceneObject = require('obj-renderer').SceneObject;

  const myObject = new SceneObject({ modelName: 'Crate', x: 0, y: 0, z: 0 });

  myObject.setScale(1, 2, 1); // Stretch vertically by a factor of two
  myObject.setRotation(45, 0, 1, 0); // Then rotate it 45 degrees to the left

  // Add any sub-objects
  myObject.addObject(new SceneObject({ name: 'childObject', modelName: null }));

  // Add the object (and its children) to a scene:
  myScene.addObject(myObject);
```

| Method | Description |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| `constructor(json)` | Creates a new scene object initializing with the given values and optionally sub-objects |
| `resetTransform()` | Resets the position to (0,0,0) and rotation to (0,0,0). |
| `setPosition(x, y, z)` | Sets the position of the object relative to its parent, to the given coordinates. |
| `setScale(sx, sy, sz)` | Sets the scaling factors, scaling the object by the given multiplication factors along the x, y, and z axis. |
| `setRotation(rx, ry, rz)` | Sets the rotation, in euler angles clockwise around the x, y an z axis. |
| `setPitch(degrees)` | Sets the pitch rotation in degrees, a positive value rotates the object counter-clockwise from looking downwards on the object from the sky. |
| `setYaw(degrees)` | Sets the yaw rotation in degrees, a positive value tilts the object upwards from the horizon. |
| `rotate(degrees, x, y, z)` | Rotates the object (in addition to its current position/rotation) the specified degrees clockwise around the vector formed from looking in the direction of point x,y,z from being situated at the origin (0,0,0). |
| `scale(sx, sy, sz)` | Scales the object by the given factors, across the x, y, z axis. |
| `addObject(object)` | Adds a scene object as a child object of this object. |
| `find(objectName)` | Finds the first object that is a descendent of this object with the given object name. |
