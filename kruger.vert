#version 140

// Uniforms
uniform mat4 MVPMatrix = mat4(1.0);

// Inputs
in vec4 MCVertex;
in vec4 TexCoord0;

// Outputs
out vec4 Coord0;

/*
 * Computes position.
 */
void main() {
   gl_Position = MVPMatrix * MCVertex;
   Coord0 = TexCoord0;
}
