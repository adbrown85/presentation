#version 140

// Uniforms
uniform mat4 MVPMatrix;

// Inputs
in vec4 MCVertex;
in vec3 TexCoord0;

// Outputs
out vec3 Coord0;

void main() {
    gl_Position = MVPMatrix * MCVertex;
    Coord0 = TexCoord0;
}
