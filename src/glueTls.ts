import fs from './assets/mandlebrot.frag?raw';
import vs from './assets/identity.vert?raw';

export const initializeGl = (gl: WebGLRenderingContext): number => {
    // Only continue if WebGL is available and working
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    const program = gl.createProgram();

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vs);
    gl.compileShader(vertexShader);
    gl.attachShader(program, vertexShader);


    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fs);
    gl.compileShader(fragmentShader);
    gl.attachShader(program, fragmentShader);

    [vertexShader, fragmentShader].map((shader) => {
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            var info = gl.getShaderInfoLog( shader );
            throw 'Could not compile WebGL program. \n\n' + info;
        }
    });

    gl.linkProgram(program);

    if (!gl.getProgramParameter( program, gl.LINK_STATUS)) {
        var info = gl.getProgramInfoLog(program);
        throw 'Could not compile WebGL program. \n\n' + info;
    }

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    // Create a buffer to put three 2d clip space points in
    const positionBuffer = gl.createBuffer();

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // fill it with a 2 triangles that cover clip space
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,  // first triangle
        1, -1,
            -1,  1,
            -1,  1,  // second triangle
        1, -1,
        1,  1,
    ]), gl.STATIC_DRAW);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    gl.vertexAttribPointer(
        positionAttributeLocation,
        2,          // 2 components per iteration
        gl.FLOAT,   // the data is 32bit floats
        false,      // don't normalize the data
        0,          // 0 = move forward size * sizeof(type) each iteration to get the next position
        0,          // start at the beginning of the buffer
    );

    return program;
}
