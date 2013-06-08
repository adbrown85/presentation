#version 140

// Inputs
in vec3 Coord0;

// Outputs
out vec4 FragColor;

void main() {
    FragColor = vec4(Coord0, 1);
}
