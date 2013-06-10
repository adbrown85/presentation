% Hardware-Accelerated Rendering of Intersecting Volumes using Boolean Operations
% Andrew Brown \
  Rochester Institute of Technology
% June 13, 2013

Overview
--------

 - Introduction
 - Background
 - Previous Work
 - Approaches
 - Results
 - Conclusion

Introduction
============

Volume
------

<!--
 - Three-dimensional image
 - Instead of pixels, _voxels_
 - MRI, CT scans
 -->

![](representations.pdf)

<!--
How do you render?
-->

Rendering Intersecting Volumes
------------------------------

<!--
 - Why is it hard?
    - Need to paint back-to-front
    - Need to properly blend each sample
 -->

![](intersecting-volumes.pdf)

<!--
What has been done so far...
-->

Boolean Operations
------------------

![](venn.pdf)

Background
==========

OpenGL
------

 - OpenGL = Open Graphics Language
 - API for rendering 3D graphics
 - Hardware-accelerated

Featuring...

Texturing
---------

<!--
 - What is a texture?
 - Texture coordinates
 - Video cards are really good at this...
-->

![](texturing.png)

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

Depth Buffer
------------

![](depth-buffer.png)
<!--
 - Buffer storing depth at each pixel
 - Fragments farther back normally discarded
 - Can change behavior:
    - Function (*LESS*, *GEQUAL*, etc.)
    - Clear at any time to any value
-->

Framebuffer Objects
--------------------------

![](fbo.png)

<!--
 - Render to a texture
 - Basis of multiple passes
 -->

<!-- End list -->

<!--
    uniform sampler2D Pass;
    void main() {
      ivec2 pos = ivec2(gl_FragCoord.xy);
      vec4 color = texelFetch(Pass, pos, 0);
      /* Use color... */
    }
-->

Previous Work
=============

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

Kruger Method
-------------

![](fragment-ray-casting.pdf)

<!-- Improve this by adding red dots where they exit... -->

First Pass of Kruger Method
---------------------------

 1. Bind framebuffer with texture
 2. Cull front faces
 3. Render, and for each fragment:
     - Store texture coordinates

- - -

![](back-faces.png)

Second Pass of Kruger Method
----------------------------

 1. Unbind framebuffer
 2. Cull back faces
 3. Render, and for each fragment:
      - Form ray between texture coordinates
      - Sample along ray, back to front
      - Store accumulated value

- - -

![](kruger.png)

Slicing Method
--------------

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

Boolean AND Node
----------------

    // Find extents of cubes in world space
    Extent e1 = findExtent(c1);
    Extent e2 = findExtent(c2);

    // Take intersection
    Vec4 min = max(e1.min, e2.min);
    Vec4 max = min(e1.max, e2.max);

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

![](boolean-and-screenshot.png)

Boolean XOR Node
----------------

 - Based on Hodgman/Sutherland line-clipping algorithm

![](clipping.pdf)

<!--
 - Separate function for clipping each side
 - Keep what's outside instead of inside
-->

Second Approach
---------------

    <cull faces="front" />
    <!-- Store texture coords -->
    <framebuffer>
      <attachment usage="color" link="results-texture" />
      <attachment usage="depth" link="depth-renderbuffer" />
      <depth function="less" />
      <cull faces="back" />
      <use program="third-pass-program">
        <!-- Assign uniform variables -->
        <booleanXor of="c1 c2" hide="c2" filter="less" />
      </use>
    </framebuffer>

- - -

    uniform sampler2D ResultsTexture;

    void main() {
      ivec2 c = ivec2(gl_FragCoord.xy);
      FragColor = texelFetch(ResultsTexture, c, 0);
    }

- - -

![](boolean-xor-screenshot.png)

Results
=======

Implementation
--------------

 - C++
 - OpenGL 3 core profile

Performance
-----------

\begin{figure}
\centering
\begin{tikzpicture}
\begin{semilogxaxis}[
    xbar,
    xmin=0,
    xlabel=Frames Per Second,
    enlarge y limits=0.2,
    symbolic y coords={ Slicing with Attributes, Slicing with Uniforms, Boolean XOR, Boolean AND},
    ytick=data
]
\addplot coordinates {
    (172,Slicing with Attributes)
    (130,Slicing with Uniforms)
    (76,Boolean XOR)
    (51,Boolean AND)
};
\addplot coordinates {
    (25,Slicing with Attributes)
    (6,Slicing with Uniforms)
    (24,Boolean XOR)
    (24,Boolean AND)
};
\addplot coordinates {
    (15,Slicing with Attributes)
    (18,Slicing with Uniforms)
    (13,Boolean XOR)
    (10,Boolean AND)
};
\end{semilogxaxis}
\end{tikzpicture}
\end{figure}

Quality
-------

 - Boolean XOR has problems with certain angles

![](pieces-in-perspective.pdf)

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

<!--
    - Started off with this
    - Technical limitations...
 -->

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
