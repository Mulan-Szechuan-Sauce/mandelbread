<script lang="ts">
import { onMount } from 'svelte';

const vs = `
attribute vec4 a_position;

void main() {
  gl_Position = a_position;
}
`;

const fs = `
precision highp float;

uniform float zoom_amount;

vec2 imagine_multiplying(vec2 a, vec2 b) {
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec3 mandelbrot_perturbation(vec2 c, vec2 dc) {
    vec2 z = vec2(0.0);
    vec2 dz = vec2(0.0);
    float n = -1.0;

    for (int i=0; i < 6000; i++)
    {
        dz = imagine_multiplying(2.0 * z + dz, dz) + dc;
        z  = imagine_multiplying(z, z) + c;
        
        if (dot(dz, dz) > 4.0) {
          n = float(i);
          break;
        }
    }

    if (n < 0.0)
      return vec3(0.0);

    return 0.5 + 0.5 * cos(pow(zoom_amount, 0.22) * n * 0.05 + vec3(3.0, 3.5, 4.0));
}

void main()
{
    vec2 p = (2.0 * gl_FragCoord.xy - vec2(float(1000), float(1000))) / float(1000);
    
    vec2 c;

    //c = vec2(-1.1900443, 0.3043895);
    c = vec2(-0.7436441,0.1318255);

    vec2 dc = p * zoom_amount;
    vec3 color = mandelbrot_perturbation(c, dc);
    
    gl_FragColor = vec4(color, 1.0);
}`;

let canvas;

onMount(() => {
    // Initialize the GL context
    const gl: WebGLRenderingContext = canvas.getContext("webgl");

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
    
    // create time uniform
    const zoomAmount = gl.getUniformLocation(program, "zoom_amount"); 

    let zoomValue = 2.0;

    const renderLoop = (timeStamp) => {
        // set time uniform
        gl.uniform1f(zoomAmount, zoomValue);
        zoomValue *= 0.98;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(
            gl.TRIANGLES,
            0,     // offset
            6,     // num vertices to process
        );


        // recursive invocation
        window.requestAnimationFrame(renderLoop);
    };

    // start the loop
    window.requestAnimationFrame(renderLoop);
});
</script>

<main>
    <canvas bind:this={canvas} width="1000" height="1000"></canvas>
</main>
