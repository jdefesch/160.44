
const VSHADER_SOURCE = `precision mediump float;
attribute vec4 a_Position;
attribute vec2 a_UV;

attribute vec3 a_Normal;
varying vec3 v_Normal;
varying vec4 v_VertPos;

varying vec2 v_UV;
uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotateMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position =   u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`;

// Fragment shader program
const FSHADER_SOURCE = `precision mediump float;
  uniform vec4 u_FragColor;
  varying vec2 v_UV;

  varying vec3 v_Normal;
  uniform vec3 u_lightPos;
  varying vec4 v_VertPos;
  uniform vec3 u_cameraPos;
  uniform bool u_lightOn;

  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  void main() {
    if(u_whichTexture == -3){
        gl_FragColor = vec4((v_Normal + 1.0)/2.0, 1.0);               
     } else if(u_whichTexture == -2){
        gl_FragColor = u_FragColor;                
     } else if (u_whichTexture == -1){
        gl_FragColor = vec4(v_UV, 1.0, 1.0);        
     } else if(u_whichTexture == 0){
        gl_FragColor = texture2D(u_Sampler0, v_UV);  
     } else if(u_whichTexture == 1){
        gl_FragColor = texture2D(u_Sampler1, v_UV);  
     } else if (u_whichTexture == 2) {
        gl_FragColor = texture2D(u_Sampler2, v_UV);
     } else {
        gl_FragColor = vec4(1,.2,.2,1);             
     }

     vec3 lightVector = u_lightPos - vec3(v_VertPos);
     float r = length(lightVector);


    //  if (r < 1.0){
    //     gl_FragColor = vec4(1,0,0,1);
    //  } else if (r < 2.0){
    //     gl_FragColor = vec4(0,1,0,1);
    //  }

    // gl_FragColor = vec4(vec3(gl_FragColor) / (r*r), 1);

    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);
    // gl_FragColor = gl_FragColor * nDotL;
    // gl_FragColor.a = 1.0;

    vec3 R = reflect(-L, N);
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    float specular = pow(max(dot(E, R), 0.0), 10.0);

    vec3 diffuse = vec3(gl_FragColor) * nDotL;
    vec3 ambient = vec3(gl_FragColor) * 0.3;

    if (u_lightOn){
        if (u_whichTexture == 0){
            gl_FragColor = vec4(diffuse + specular + ambient, 1.0);
        } else {
            gl_FragColor = vec4(diffuse + ambient, 1.0);
        }
    }
    

  }`;

let canvas, gl, a_Position, u_FragColor, u_ModelMatrix, u_GlobalRotateMatrix;
let color = [1, 0, 0, 1];
let g_globalAngleY = 0
let g_globalAngleX = 0
let g_globalScale = 0.6
let g_yellowAngleZ = 0
let g_blueAngleX = 0
let g_yellowAngleX = 0
let g_blueAngleY = 0

let g_legAngleX = 5
let g_legAngleZ = 0
let g_calfAngleX = 0
let g_calfAngleY = 0

let g_startTime = performance.now() / 1000
let g_seconds = 0
let g_timeSpeed = 3
let g_isAnimationRunning = true
let isDragging = false;
let prevMouseX, prevMouseY;

let a_UV, u_lightOn, u_lightPos,u_cameraPos, a_Normal, u_Sampler0, u_Sampler1, u_whichTexture, u_ViewMatrix, u_ProjectionMatrix, u_Sampler2;
let g_eye = [0, 0, -1]
let g_at = [0, 0, 0]
let g_up = [0, 1, 0]
let g_map = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]

]
let isRotating = 0
let camera
let userCoords = []
let g_normalOn = false
let g_lightPos = [0,1,-2]
let g_lightOn = true

const setupWebGL = () => {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    camera = new Camera()
    camera.back()
    camera.back()
    camera.back()
    camera.back()
    camera.back()
    camera.back()
    camera.back()
    camera.back()
    camera.back()
    camera.back()

};

const connectVariablesToGLSL = () => {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (!a_UV) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (!a_Normal) {
        console.log('Failed to get the storage location of a_Normal');
        return;
    }

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }


    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
        console.log('Failed to get the storage location of u_Sampler2');
        return false;
    }

    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (!u_lightOn) {
        console.log('Failed to get the storage location of u_lightOn');
        return false;
    }

  

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get u_whichTexture');
        return;
    }

    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos) {
        console.log('Failed to get u_lightPos');
        return;
    }

    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
        console.log('Failed to get u_cameraPos');
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get u_ViewMatrix');
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get u_ProjectionMatrix');
        return;
    }

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return false;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return false;
    }


    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }
};

const renderScene = () => {
    let startTime = performance.now()
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var identityM = new Matrix4()
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements)

    var projMat = new Matrix4();
    projMat.setPerspective(90, canvas.width / canvas.height, 0.1, 100)
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMat.elements);

    if (isRotating === 1) {
        camera.panLeft(1)
    }
    if (isRotating === -1) {
        camera.panRight(1)
    }
    let globalRotMat = new Matrix4()
        .rotate(g_globalAngleY, 0, 1, 0)
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements)

    renderAllShapes()

    duration = performance.now() - startTime
    document.getElementById('performance').innerHTML = `${duration.toFixed(2)}ms ${Math.floor(1000 / duration)}fps`

};


const drawMap = () => {
//     for (let x = 0; x < 32; x++) {
//         for (let z = 0; z < 32; z++) {
//             for (let y = 0; y < 1; y++) {
//                 if (x < 1 || x === 31 || z === 0 || z === 31) {
//                     let cube = new Cube()
//                     cube.color = [0, 0, 1, 1]
//                     cube.textureNum = 1
//                     cube.matrix.translate(x - 16, y - 2, z - 16)
//                     cube.render()
//                 }
//             }
//    continue
//         }
//     }
    let coords = [ ...userCoords ]

    for (let coord of coords) {
        let [x, y, z] = coord
        let cube = new Cube()
        cube.color = [0, 0, 1, 1]
        cube.textureNum = 0
        cube.matrix.translate(...coord)
        cube.render()
    }



}

const renderAllShapes = () => {
    drawMap()

    let floor = new Cube();
    floor.color = [.5, .7, 0, 1]
    floor.matrix.translate(-5, -2, -5)
        .scale(10, 0, 10)

    floor.render()

    let sky = new Cube()
    sky.matrix.scale(-7, -7, -7)
        .translate(-.5, -.5, -.5)
    sky.color = [.5,0,.5,1]
    sky.textureNum = -2
    if (g_normalOn ) {sky.textureNum = -3}

    sky.render()
    
    let cube = new Cube();
    cube.color = [0, 1, 1, 1]
    cube.matrix.translate(0, -2, 0)
    if (g_normalOn ) {cube.textureNum = -3}


    cube.render()

    let sphere = new Sphere()
    if (g_normalOn ) {sphere.textureNum = -3}
    sphere.render()


    gl.uniform3f(u_lightPos, ...g_lightPos)
    gl.uniform3f(u_cameraPos, camera.eye.x,  camera.eye.y,  camera.eye.z)
    gl.uniform1i(u_lightOn, g_lightOn)

    let light = new Cube()
    light.color = [2,2,0,1]
    light.matrix.translate(...g_lightPos)
                .scale(-.1,-.1,-.1)
                .translate(-.5,-.5,-.5)
    light.render()

}

const updateAnimationAngles = () => {
    if (!g_isAnimationRunning) return

    if (g_isAnimationRunning) {
        g_lightPos = [Math.cos(g_seconds) , g_lightPos[1], g_lightPos[2]]
    }

}

const tick = () => {
    g_seconds = performance.now() / 1000 - g_startTime
    updateAnimationAngles()
    renderScene()
    requestAnimationFrame(tick)

}



const handleKeyDownInput = (e) => {
    let inputKey = e.key

    if (inputKey === 'w' || inputKey === 'ArrowUp') {
        camera.forward()
    }
    if (inputKey === 'a' || inputKey === 'ArrowLeft') {
        camera.left()
    }
    if (inputKey === 's' || inputKey === 'ArrowDown') {
        camera.back()
    }
    if (inputKey === 'd' || inputKey === 'ArrowRight') {
        camera.right()
    }
    if (inputKey === 'q') {
        camera.panLeft()
    }
    if (inputKey === 'e') {
        camera.panRight()
    }
}


const handleMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const canvasWidth = rect.width;
    const mouseX = e.clientX - rect.left;

    const leftBound = canvasWidth * 0.25;
    const rightBound = canvasWidth * 0.75;

    const rotationSpeed = 0.5; // Adjust this value to control the rotation speed

    if (mouseX < leftBound) {
        isRotating = 1;
        // camera.panLeft(rotationSpeed);
    } else if (mouseX > rightBound) {
        isRotating = -1;
        // camera.panRight(rotationSpeed);
    } else {
        isRotating = 0;
    }

    renderScene();
};
const handleMouseLeave = () => {
    isRotating = 0;
};

const makeEventListeners = () => {



    const handleCameraYAngleChange = (e) => {
        if (g_globalAngleY === parseInt(e.target.value))
            return
        g_globalAngleY = parseInt(e.target.value)
        renderScene();
    }

    const handleYellowAngleChange = (e) => {
        if (g_yellowAngleZ === parseInt(e.target.value))
            return
        g_yellowAngleZ = parseInt(e.target.value)
        renderScene()
    }

    const handleBlueChange = (e) => {
        if (g_blueAngleX === parseInt(e.target.value))
            return
        g_blueAngleX = parseInt(e.target.value)
        renderScene()
    }

    const handleAnimationChange = (e) => {
        // g_isAnimationRunning = g_isAnimationRunning === 1 ? 2 : 1

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Convert to WebGL coordinates
        const webglX = (x / canvas.width) * 2 - 1;
        const webglY = (y / canvas.height) * -2 + 1;
        let newCoord = convertToWorldCoordinates(webglX, webglY)
        let idx = -1
        let track = 0
        for (let coord of userCoords) {
            if (coord[0] !== newCoord[0] || coord[2] !== newCoord[2]) {
                track++
                continue
            }
            idx = track
            break
        }

        if (idx >= 0) {
            userCoords = userCoords.splice(idx, 1)
        } else {
            userCoords.push(newCoord)
        }
    }

    const convertToWorldCoordinates = (webglX, webglY) => {
        const projMat = new Matrix4();
        projMat.setPerspective(90, canvas.width / canvas.height, 0.1, 100);

        const viewMat = camera.viewMat;

        // Get the inverse of the projection and view matrices
        const invProjMat = new Matrix4();
        invProjMat.setInverseOf(projMat);

        const invViewMat = new Matrix4();
        invViewMat.setInverseOf(viewMat);

        // Convert the coordinates to the 4D homogeneous coordinate system
        const clipCoords = new Vector4([webglX, webglY, -1.0, 1.0]);

        // Multiply by the inverse projection matrix
        const eyeCoords = invProjMat.multiplyVector4(clipCoords);

        // Divide by the w component to normalize
        eyeCoords.elements[2] = -1;
        eyeCoords.elements[3] = 1; // Change 0 to 1 to maintain the 4D homogeneous coordinate

        // Multiply by the inverse view matrix
        const worldCoords = invViewMat.multiplyVector4(eyeCoords);

        return [parseInt(worldCoords.elements[0]), -2, parseInt(worldCoords.elements[2])];
    };


    const enableAnimation = () => g_isAnimationRunning = 1
    const disableAnimation = () => g_isAnimationRunning = 0


    canvas.onclick = handleAnimationChange;
    canvas.onmousemove = handleMouseMove;
    canvas.onmouseleave = handleMouseLeave;
    document.onkeydown = handleKeyDownInput


    document.getElementById('enable-animation').onclick = enableAnimation
    document.getElementById('disable-animation').onclick = disableAnimation
    document.getElementById('normal-on').onclick = () => {g_normalOn = true}
    document.getElementById('normal-off').onclick = () => {g_normalOn = false}

    document.getElementById('light-ani').onclick = () => {g_isAnimationRunning = !g_isAnimationRunning}
    document.getElementById('normal-off').onclick = () => {g_normalOn = false}
    document.getElementById('light-toggle').onclick = () => {g_lightOn = !g_lightOn}

    document.getElementById('camera-angle').onmousemove = handleCameraYAngleChange;
    // document.getElementById('yellow-angle').onmousemove = handleYellowAngleChange;
    // document.getElementById('blue-angle').onmousemove = handleBlueChange;
    document.getElementById('lightY').onmousemove = (e) => {g_lightPos[1] = e.target.value / 100};
    document.getElementById('lightX').onmousemove = (e) => {g_lightPos[0] = e.target.value / 100};
    document.getElementById('lightZ').onmousemove = (e) => {g_lightPos[2] = e.target.value / 100};
};

function initTextures() {

    // Create the image object
    var image = new Image();
    // Register the event handler to be called when image loading is completed
    image.onload = function () { sendTextureToTEXTURE0(image); };
    // Tell the browser to load an Image
    image.src = 'sky.jpg';

    var image1 = new Image();
    // Register the event handler to be called when image loading is completed
    image1.onload = function () { sendTextureToTEXTURE1(image1); };
    // Tell the browser to load an Image
    image1.src = 'dirt.jpg';


    return true;
}

function sendTextureToTEXTURE0(image) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate
    // Activate texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameter
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // Set the image to texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler0, 0);

    // gl.clear(gl.COLOR_BUFFER_BIT);  // Clear <canvas>

    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 0);  // Draw the rectangle
    console.log('Finished loading texture0')
}


function sendTextureToTEXTURE1(image) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate
    // Activate texture unit0
    gl.activeTexture(gl.TEXTURE1);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameter
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // Set the image to texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler1, 1);

    // gl.clear(gl.COLOR_BUFFER_BIT);  // Clear <canvas>

    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 0);  // Draw the rectangle
    console.log('Finished loading texture1')
}


function main() {
    setupWebGL();
    connectVariablesToGLSL();
    makeEventListeners();

    initTextures();

    tick()

}
