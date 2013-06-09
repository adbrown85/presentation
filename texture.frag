#version 140

// Uniforms
uniform sampler2D Texture;

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
        FragColor = texture(Texture, Coord0.pt);
        return;
    }

    // Right side
    if (s >= 1.0) {
        FragColor = texture(Texture, Coord0.pt);
        return;
    }

    // Top side
    if (t >= 1.0) {
        FragColor = texture(Texture, Coord0.sp);
        return;
    }

    // Bottom side
    if (t <= 0.0) {
        FragColor = vec4(1, 0.5, 0, 1);
        return;
    }

    // Front side
    if (p >= 1.0) {
        FragColor = texture(Texture, Coord0.st);
        return;
    }

    // Back side
    if (p <= 0.0) {
        FragColor = vec4(1, 1, 0, 1);
        return;
    }

    FragColor = texture(Texture, Coord0.st);
}
