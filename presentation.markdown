% Hardware-Accelerated Rendering of Intersecting Volumes using Boolean Operations
% Andrew Brown \
  Rochester Institute of Technology

About Me
--------

 - BFA in Applied Media Arts
 - AS in Computer Science
 - Started Master's in 2007
 - Currently work at AFRL in Rome, NY

Overview
--------

 - Background
 - Previous Work
 - Approaches
 - Implementation
 - Results
 - Conclusion

Background
==========

Volume
------

 - Three-dimensional image
 - Instead of pixels, _voxels_
 - MRI, CT scans

**Picture of three-dimensional grid**

How do you render?

Ray-Casting
-----------

![](traditional-ray-casting.pdf)

<!-- Maybe improve this by coloring pixels -->

<!--
 - Ray = origin + direction
 - Process
    - Cast ray through volume
    - Sample along ray

Slow on the CPU...
 -->

OpenGL
------

 - OpenGL = Open Graphics Language
 - Library for rendering 3D graphics
 - Faster than CPU

Featuring...

Texturing
---------

<!--
 - What is a texture?
 - Texture coordinates
 - Video cards are really good at this...
-->

<!--
**Picture of 2D texture on a shape**
-->
![](crate.png)

<!--
**Picture of texture coordinates**
-->

Shaders
-------

<!--
    in vec3 Coord0;
    out vec4 FragColor;

    void main() {
        if (Coord0.s < 0.5) {
            FragColor = vec4(1, 0, 0, 1);
        } else {
            FragColor = vec4(0, 1, 0, 1);
        }
    }
-->

![](xmas.png)

<!--
Demonstration...
-->

<!-- Fragment approximates pixel... -->

Boolean Operations
------------------

![](venn.pdf)

Depth Buffer
------------

 - Buffer storing depth at each pixel
 - Fragments farther back normally discarded
 - Can change behavior:
    - Function (*LESS*, *GEQUAL*, etc.)
    - Clear at any time to any value

Framebuffer Objects
--------------------------

 - Render to a texture

<!--
 - Basis of multiple passes
 -->

<!-- End list -->

    uniform sampler2D Pass;
    void main() {
      ivec2 pos = ivec2(gl_FragCoord.xy);
      vec4 color = texelFetch(Pass, pos, 0);
      /* Use color... */
    }

Demonstration...

Previous Work
=============

Kruger Method
-------------

![](fragment-ray-casting.pdf)

<!-- Improve this by adding red dots where they exit... -->

First pass of Kruger Method
---------------------------

 1. Bind framebuffer with texture
 2. Cull front faces
 3. Render, and for each fragment:
     - Store texture coordinates

- - -

**Picture of back faces**

Second pass of Kruger Method
----------------------------

 1. Unbind framebuffer
 2. Cull back faces
 3. Render, and for each fragment:
      - Form ray between texture coordinates
      - Sample along ray, back to front
      - Store accumulated value

- - -

**Shader code snippet**

Demonstration...

Rendering Intersecting Volumes
------------------------------

 - Why is it hard?
    - Need to paint back-to-front
    - Need to properly blend each sample

**Top-down view of intersecting volumes**

What has been done so far...

Slicing Method
--------------

![](slicing-aligned.pdf)

- - -

![](slicing-rotated.pdf)

<!--
 - A lot of geometry
 - Tricky to implement
-->

Other Methods
-------------------------

 - Dynamic Shader Generation
 - GPGPU (General-Purpose Graphics Processing Unit)

Approaches
==========

Motivation
----------

For simple cases...

 - Can we make it easier to implement?
    - May be able to use existing libraries...

 - Is it possible to get any faster?
    - Don't have to regenerate geometry every frame...

Basis
-----

 1. Render behind intersection
 2. Render intersection
 3. Render in front of intersection

Boolean AND with Depth-Buffer Masking
-------------------------------------

![](boolean-and.pdf)

Boolean AND with Boolean XOR
----------------------------

![](boolean-xor.pdf)

Implementation
==============

Basics
------

 - C++
 - OpenGL 3 core profile

Libraries
---------

 - M3d
 - Gloop
 - Glycerin
 - RapidGL

M3d
---

 - Structures for 3D math
    - `Vec3`, `Vec4`
    - `Mat3`, `Mat4`
    - `Quat`
 - _glm_

Gloop
-----

 - Light-weight OpenGL wrapper
 - C++
 - Assertions

<!-- end list -->

    Shader s = Shader::create(GL_FRAGMENT_SHADER);
    s.source("...");
    s.compile();
    if (!s.compiled()) {
       std::cerr << s.log() << std::endl;
    }

Glycerin
--------

 - OpenGL utilities
    - `Projection`
    - `BufferLayout`
    - `Volume`
    - `TextRenderer`

RapidGL
-------

 - Node-based render graph
 - Features
    - Lazy updates
    - Groups and instancing
    - XML (eXtensible Markup Language)

RapidGL "Hello, World!"
-----------------------

    <scene>
      <program id="color-program">
        <shader type="vertex" file="color.vert" />
        <shader type="fragment" file="color.frag" />
      </program>
      <use program="color-program">
        <uniform type="mat4" name="MVPMat" usage="mvp" />
        <cube />
      </use>
    </scene>

RapidGL Node
------------

    Node
     # Node( id : String )
     + preVisit( state : State& )
     + visit( state : State& )
     + postVisit( state : State& )

Boolean AND Node
----------------

    // Find extents of cubes in world space
    Extent e1 = findExtent(c1);
    Extent e2 = findExtent(c2);

    // Take intersection
    Vec4 min = max(e1.min, e2.min);
    Vec4 max = min(e1.max, e2.max);

Boolean XOR Node
----------------

 - Based on Hodgman/Sutherland line-clipping algorithm
 - Separate function for clipping each side
 - Keep what's outside instead of inside

- - -

**Picture of clipping process**

Application
-----------

    gander <file.xml>

First Approach
--------------

    <cull faces="front" />
    <!-- Store texture coords of first cube -->
    <!-- Store texture coords of second cube -->
    <framebuffer>
      <attachment usage="color" link="results-texture" />
      <use program="third-pass-program">
        <cull faces="back" />
        <!-- Assign uniform variables -->
        <booleanAnd of="c1 c2" />
      </use>
    </framebuffer>

- - -

    void main() {

      ivec2 pos = ivec2(gl_FragCoord.xy);
      FragColor = texelFetch(Results, pos, 0);

      // Form ray and sample volume...

      gl_FragDepth = 0.0;
    }

- - -

**Screen shot of first approach**

Second Approach
---------------

 - Use depth buffer to only take back-most or front-most

**XML of second approach**

Demonstration...

Results
=======

Performance
-----------

 - Frame rates of approaches about the same

| Approach                  | Macbook   | Desktop |
|:--------------------------|----------:|--------:|
| Boolean AND with Masking  | 22        | 13      |
| Boolean AND with XOR      | 24        | 13      |
| Slicing                   | ?         | ?       |

Quality
-------

 - Boolean XOR has problems with certain angles

**Picture of problem with perspective**

Evaluation
----------

 - First approach can be done with existing components
 - Second approach requires less passes
 - Both approaches require a lot of context-switching
 - Both approaches fragment-bound

Conclusion
==========

Future Work
-----------

 - Break up Boolean XOR more?
 - Performance optimizations
 - Possibly expand to three volumes?
 - Slicing on the GPU
    - Started off with this
    - Technical limitations...

Lessons
-------

 - OpenGL 3
    - Pixel-space functions
 - C++ libraries
 - Tools

Advice
------

 - Start work on libraries in classes *
 - Limit scope of project

Availability
------------

 - Source code on [GitHub](http://www.github.com/adbrown85)
 - Linux and Mac OS X (Lion or Mountain Lion)
 - Under open-source licenses

Thanks
------

 - Committee
    - Joe Geigel
    - Reynold Bailey
    - Warren Carithers
 - Friends and family!

Questions/Comments
------------------
