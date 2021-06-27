<script lang="ts">
import { onMount } from 'svelte';
import { initializeGl } from './glueTls';
let canvas;

interface Vec2 {
  x: number;
  y: number;
}

const scalarMultiply = (a: number, v: Vec2): Vec2 => {
    return ({
        x: a * v.x,
        y: a * v.y,
    });
};

const add = (a: Vec2, b: Vec2): Vec2 => {
    return ({
        x: a.x + b.x,
        y: a.y + b.y,
    });
};

const multiply = (a: Vec2, b: Vec2): Vec2 => {
    return ({
        x: a.x * b.x - a.y * b.y,
        y: a.x * b.y + a.y * b.x
    });
}

const dot = (a: Vec2, b: Vec2): Vec2 => {
    return a.x * b.x + a.y * b.y;
}

const inBrot = (c: Vec2, dc: Vec2): boolean => {
    let z: Vec2 = { x: 0.0, y: 0.0 };
    let dz: Vec2 = { x: 0.0, y: 0.0 };

    for (let i = 0; i < 60; i++) {
        // console.log(dz, z);
        // console.log(multiply(add(scalarMultiply(2.0, z), dz), dz), dc);
        //console.log(typeof(z), scalarMultiply(2.0, z));

        dz = add(multiply(add(scalarMultiply(2.0, z), dz), dz), dc);
        z  = add(multiply(z, z), c);

        if (dot(dz, dz) > 4.0) {
            return false;
        }
    }

    console.log("final z:", z, dz);
    return true;
}

onMount(() => {
    const gl: WebGLRenderingContext = canvas.getContext("webgl");
    const program = initializeGl(gl);

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
        // window.requestAnimationFrame(renderLoop);
    };

    const c = {
        x: -0.7436441,
        y: 0.1318255,
    };

    const dc = {
        x: 0.5,
        y: 0.5,
    };

    console.log(inBrot(c, dc));

    // start the loop
    window.requestAnimationFrame(renderLoop);
});
</script>

<main>
    <canvas bind:this={canvas} width="1000" height="1000"></canvas>
</main>
