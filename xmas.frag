#version 140

// Constants
const vec4 RED = vec4(1, 0, 0, 1);
const vec4 GREEN = vec4(0, 1, 0, 1);

// Inputs
in vec3 Coord0;

// Outputs
out vec4 FragColor;

void main() {

    // Store components
    float s = Coord0.s;
    float t = Coord0.t;
    float p = Coord0.p;

    // Left side
    if (s <= 0.0) {
        if (p < 0.5) {
            FragColor = RED;
        } else {
            FragColor = GREEN;
        }
        return;
    }

    // Right side
    if (s >= 1.0) {
        if (p < 0.5) {
            FragColor = RED;
        } else {
            FragColor = GREEN;
        }
        return;
    }

    // Top side
    if (t >= 1.0) {
        if (s < 0.5) {
            FragColor = RED;
        } else {
            FragColor = GREEN;
        }
        return;
    }

    // Bottom side
    if (t <= 0.0) {
        FragColor = vec4(1, 0.5, 0, 1);
        return;
    }

    // Front side
    if (p >= 1.0) {
        if (s < 0.5) {
            FragColor = RED;
        } else {
            FragColor = GREEN;
        }
        return;
    }

    // Back side
    if (p <= 0.0) {
        FragColor = vec4(1, 1, 0, 1);
        return;
    }

    FragColor = vec4(1);
}
