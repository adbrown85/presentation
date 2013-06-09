#version 140

// Uniforms
uniform mat4 MVPMatrix = mat4(1);

// Inputs
in vec4 MCVertex;

void main() {
    gl_Position = MVPMatrix * MCVertex;
}
