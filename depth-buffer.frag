#version 140

// Uniforms
uniform vec4 Color = vec4(1);

// Inputs
out vec4 FragColor;

void main() {
    FragColor = Color;
}
