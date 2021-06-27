precision highp float;

uniform float cx;
uniform float cy;
uniform float width;
uniform float height;
uniform float zoom_amount;

vec2 imagine_multiplying(vec2 a, vec2 b) {
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec3 mandelbrot_perturbation(vec2 c, vec2 dc) {
    vec2 z = vec2(0.0);
    vec2 dz = vec2(0.0);
    float n = -1.0;

    for (int i=0; i < 10000; i++) {
        dz = imagine_multiplying(2.0 * z + dz, dz) + dc;
        z  = imagine_multiplying(z, z) + c;
        
        if (sqrt(dot(dz, dz)) > 50000000000.0) {
          n = float(i);
          break;
        }
    }

    if (n < 0.0)
      // FIXME: Something wacky going on with "in-set" pixels for some cx, cy values
      return vec3(0.0);

    return 0.5 + 0.5 * cos(pow(zoom_amount, 0.22) * n * 0.05 + vec3(3.0, 3.5, 4.0));
}

void main() {
    float maxDim = max(width, height);
    vec2 p = 2.0 * vec2(gl_FragCoord.x / maxDim, gl_FragCoord.y / maxDim) - vec2(width / maxDim, height / maxDim);

    vec2 c = vec2(cx, cy);

    //c = vec2(-1.1900443, 0.3043895);
    //c = vec2(-0.7436441,0.1318255);

    vec2 dc = p * zoom_amount;
    vec3 color = mandelbrot_perturbation(c, dc);
    
    gl_FragColor = vec4(color, 1.0);
}
