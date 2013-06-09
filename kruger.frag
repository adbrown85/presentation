#version 140

// Constants
const int SAMPLES = 200;
const float SAMPLE_RATE = 1.0 / SAMPLES;

// Uniforms
uniform sampler2D Framebuffer;
uniform sampler3D Volume;

// Inputs
in vec4 Coord0;

// Outputs
out vec4 FragColor;

/*
 * Computes the fragment color.
 */
void main() {

   // Initialize fragment color to black
   FragColor = vec4(0, 0, 0, 0);

   // Compute ray
   vec4 exit = texelFetch(Framebuffer, ivec2(gl_FragCoord.xy), 0);
   vec4 origin = Coord0;
   vec4 direction = normalize(exit - origin);

   // Compute times
   vec4 times = (exit - origin) / direction;
   float tExit = min(times.x, min(times.y, times.z));

   // Sample until out of volume
   float t = tExit;
   while (t > 0) {
      vec4 pos = origin + (direction * t);
      float sample = texture(Volume, pos.stp).r;
      vec4 color = vec4(sample);
      FragColor = mix(FragColor, color, sample);
      t -= SAMPLE_RATE;
   }
}
