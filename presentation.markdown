% Hardware-Accelerated Rendering of Intersecting Volumes using Boolean Operations
% Andrew Brown \
  Rochester Institute of Technology
% June 13, 2013

<!--
I'll be going over a new method to render intersecting volumes, or at least a
variation of existing methods.
-->

Overview
--------

 - Introduction
 - Background
 - Previous Work
 - Approaches
 - Results
 - Conclusion

<!--
Here's the structure of the presentation.
-->

Introduction
============

Volume
------

![](representations.pdf)

<!--

So what is a volume?  A volume is a 3D image.  You can think of it as either a
grid of values, called _voxels_, or a stack of 2D images.  Volumes are generally
from medical/scientific sources, such as MRI or CT scans.  We have to remember
when we're rendering them that people make important decisions using them, so
not only should the rendering be accurate, but it needs to be interactive so
that the user is free to do whatever he or she needs to do to make those
decisions.

 - Three-dimensional image
 - Instead of pixels, _voxels_
 - MRI, CT scans

How do you render?
-->

Intersecting Volumes
--------------------

![](intersecting-volumes.pdf)

<!--

Normally rendering volumes is pretty easy.  However, it starts to get a little
tricky when the volumes intersect.  For two reasons...  First, when you're in
the intersection you need to alternate samples.  So one from blue, one from red,
and so on...  Second, you have to do everything in order.  Either back-to-front
or front-to-back.  And each sample you take has to be blended in as you go.  So
you can't do all of the red section, all of the green section, all of the blue
section and then combine them.  It's kind of like how (x + y) * 5 does not equal
5x + 5y...

Of course, there are ways to do it already.  However, the most popular of which
generates a lot of geometry, and it has to do it every frame, even if the
volumes themselves haven't moved.  To make things worse all of that geometry
always has to be created, even if a lot of it isn't going to contribute to the
final image.

Why is it hard?
 - Need to paint back-to-front
 - Need to properly blend each sample

For simple cases...

 - Can we make it easier to implement?
    - May be able to use existing libraries...

 - Is it possible to get any faster?
    - Don't have to regenerate geometry every frame...

What has been done so far...
-->

Boolean Operations
------------------

![](venn.pdf)

<!--

So for that reason I've been looking at using Boolean operations to adapt some
of the other methods to handle intersecting volumes.

Boolean operations just combine two shapes in some way.  The ones we're
interested in are the Boolean AND on the top, as well as the Boolean XOR on the
bottom.  The Boolean AND takes the intersection, while the Boolean XOR takes
everything but the intersection.

There's two nice things about using Booleans for rendering intersecting volumes.
One, you don't have to regenerate any geometry as long as the volumes don't
move.  So you can pan, zoom, rotate around (move the camera all you want) and
the geometry doesn't have to change.  It can just stay on the video card, which
should theoretically make it faster.  The other thing is that most developers
are pretty familiar with them, and there are libraries for doing it, so the
implementation should be relatively straightforward.

I should say to make things easier for now, we're only concerned with two
volumes.  And those volumes have to be axis-aligned, so individual volumes can't
be rotated at all.  The idea being try it for a simple case first, then if it's
good expand it later.  Also, we want to see what's possible if you do have a
simple case like that, at least as a benchmark for other methods.

-->

Background
==========

OpenGL
------

 - OpenGL = Open Graphics Language
 - API for rendering 3D graphics
 - Hardware-accelerated

Featuring...

<!--

The main thing here is that it is hardware-accelerated, meaning it renders using
specialized circuitry on the video card as opposed to the CPU, making it a lot
faster.

Some features of OpenGL that are worth noting...

-->

Texturing
---------

![](texturing.png)

<!--

Texturing is taking a 2D image and *plastering* it onto a 3D shape.  For example
here we've applied an image of a crate to a cube.  Texturing works by assigning
texture coordinates to the shape, which then map into the image.  On the left we
have the texture coordinates of the cube.

The thing to note about texturing is that with recent versions of OpenGL it's
really become much more than just applying an image to a shape.  Now textures
are more of just storage mechanisms that can be used for a lot of different
things.

 - What is a texture?
 - Texture coordinates
 - Video cards are really good at this...
-->

Shaders
-------

![](xmas.png)

<!--

The reason why textures are seeing such general usage is because of shaders...

Originally OpenGL had a fixed-function pipeline, so the reason that *this* pixel
is red is because of some combination of predefined options and behaviors.  You
set things up, tell the video card to render, and pixels come out the other
side.  But now with shaders you can write the actual instructions to color a
pixel.

Here we just have a really simple shader.  It colors the left side of a face
red, and the right side green.

Shaders are the basis of this work.  Without shaders we couldn't do what we
wanted...  Or it would be a billion times harder!

One thing I do want to note before I go on is that a potential pixel is called a
fragment...  Multiple fragments may be generated for each pixel on the screen.
They might get blended together, some may be discarded, etc.

    in vec3 Coord0;
    out vec4 FragColor;

    void main() {
        if (Coord0.s < 0.5) {
            FragColor = vec4(1, 0, 0, 1);
        } else {
            FragColor = vec4(0, 1, 0, 1);
        }
    }

Demonstration...

Fragment approximates pixel...
-->

Depth Buffer
------------

![](depth-buffer.png)

<!--

Normally when you draw things they just get drawn over top of each other.  Here
even though the green cube is behind the red cube in the scene, because I drew
it second it's drawn over the red one.  One way to get around that is to sort
all your objects before you draw them.  Another way is to use the depth
buffer...

The depth buffer keeps track of the depths of everything that has been drawn so
far at each pixel.  Where the depth is how far back into the scene you are.
That way if you draw something that's farther back from what's already there,
those fragments just get discarded.

What's interesting about the depth buffer is that you can do some cool tricks
with it.  You can change which function it uses, so instead of _LESS_ you can
use _GREATER_ for example.  You can clear the whole depth buffer to a particular
value, or you can just mask off parts of it to keep anything from being drawn
there.

Remember that...

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

By default OpenGL draws to the screen.  But framebuffer objects let you render
to a texture or some other storage mechanism instead.  Then those results can be
used in later passes.

Here we've rendered the texture coordinates of the cube to a texture, then
applied that texture to the cube.

Framebuffer Objects are the basis for multiple-pass algorithms.  Generally you
make the FBO the same size as the window, then take the result of the previous
pass at the same pixel location.

 - Render to a texture
 - Basis of multiple passes

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

<!--

One of the original ways to render volumes was ray casting.  Essentially you
*fire* rays through the scene for each pixel.  If the ray intersects the volume,
you sample along that ray.

Generates really nice results, but it was originally on the CPU, so slow...

However, one good thing about ray-casting is that if you go front-to-back you
can stop when the ray color is opaque, or just about opaque.  For most volumes
that's a *big* speed-up.  One of the major reasons to use ray-casting.

 - Ray = origin + direction
 - Process
    - Cast ray through volume
    - Sample along ray

Slow on the CPU...
-->

Kruger Method
-------------

![](fragment-ray-casting.pdf)

<!--

Eventually someone (Kruger) came along and figured out how to do that with
hardware.  He realized you can get the ray by using the texture coordinates of
a cube.  The entry points are on the front faces and the exit points are on the
back faces.  You can form a ray by taking a fragment on one of the front faces
and the fragment on one of the back faces that's behind it.

-->

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

With the slicing method, you sample the volume by generating geometry at regular
intervals through it.  Then blend the geometry together.

The nice thing about the slicing method is that it will handle intersecting
volumes as long as you sort the geometry first.

The bad thing is as I said before that's a lot of geometry and you have to do it
every frame even if the volumes themselves didn't move.

 - A lot of geometry
 - Tricky to implement
-->

Other Methods
-------------------------

 - Dynamic Shader Generation
 - GPGPU (General-Purpose Graphics Processing Unit)

<!--

Aren't necessarily bad, this is probably where the future is, but they start to
get pretty difficult to actually implement.  In the first case it's more for
static scenes.  In the second case it's not necessarily bad, this is probably
where the future is, but you're looking at general-purpose APIs that aren't
really set up to do graphics.  It may take awhile to just get anything up on the
screen, let alone volumes.  May not fit into your application, just impractical
to do in the real-world.

-->

First Approach
==============

Boolean AND with Boolean XOR
----------------------------

![](boolean-xor.pdf)

<!--

The idea here is to break up the areas around the intersection so they can be
drawn separately.  Draw the pieces in front of the intersection first, then the
intersection, then the pieces in front of the intersection.

-->

Boolean AND Node
----------------

    // Find extents of cubes in world space
    Extent e1 = findExtent(c1);
    Extent e2 = findExtent(c2);

    // Take intersection
    Vec4 min = max(e1.min, e2.min);
    Vec4 max = min(e1.max, e2.max);

<!--

Really simple to determine the intersection of two axis-aligned cubes.  Just
find the corners of the cubes in world-space.  So after any translations.  Then
take the maximum of the minimum corners, and the minimum of the maximum corners.

-->

Boolean XOR Node
----------------

 - Based on Hodgman/Sutherland line-clipping algorithm

![](clipping.pdf)

<!--

Left, right, top, bottom clipping stages.  Output of one is the input of the
next, and so on.  Normally you discard everything but the clipping area but we
actually want to keep them...

 - Separate function for clipping each side
 - Keep what's outside instead of inside
-->

Drawing Multiple Pieces at Once
-------------------------------

    <attachment usage="depth" link="depth-renderbuffer" />
    <depth function="greater" />

<!--

Maybe take this out?  Definitely need to simplify!

Can draw all the pieces behind the intersection, or all the pieces in front of
the intersection at once if you use the depth buffer.

-->

Compositing Pass
----------------

    uniform sampler2D ResultsTexture;

    void main() {
      ivec2 c = ivec2(gl_FragCoord.xy);
      FragColor = texelFetch(ResultsTexture, c, 0);
    }

<!--

Picture of degenerate case where no pieces are in front of intersection?

Originally was planning to have the pieces that are in front of the intersection
render directly to the screen.  However, there's the case where the volumes only
intersect in one dimension...  Didn't work so well, so had to put in a
compositing pass at the end.

-->

Screenshot
----------

![](boolean-xor-screenshot.png)

<!--

And a bunny stuck to a head...

Never really found time to look for better volumes...

-->

Problem with Perspective
------------------------

![](boolean-xor-problem.png)

<!--

Yet another problem with this approach pops up with certain angles.  What
happends is that when in perspective pieces that have the same depth may
actually be overlapped...

-->

- - -

![](pieces-in-perspective.pdf)

<!--

For example, both the blue and the red piece have the same depth, but part of
the blue one actually ends up behind the red one on screen.  If the blue one is
drawn second it won't draw correctly.

This is a limitation with depth-based approaches.  Would like to look at using
the distance to the camera instead...

-->

Second Approach
===============

Boolean AND with Depth-Buffer Masking
-------------------------------------

![](boolean-and.pdf)

<!--

Ok, this is a little bit more sophisticated...

The idea here is to draw the red, draw the green, draw the blue, mask off *this*
area with the depth buffer so that nothing else will get drawn there, then
render everything else.

Nice thing about the masking is that even though you do generate the extra
fragments, they won't be processed because of early Z-kill.  Basically as long
as you don't change the depth of a fragment, OpenGL will check its depth before
it processes it.

-->

Using Back Faces as Front Faces
-------------------------------

    <!-- Draw back faces of cube into texture -->
    <cull faces="front"
    <framebuffer>
      <attachment usage="color" link="back-faces-texture" />
      <use program="coords-program">
        <instance of="c1" />
      </use>
    </framebuffer>

    <!-- Draw back faces of intersection -->
    <use program="volume-program">
      <booleanAnd of="c1 c2" />
    </use>

<!--

Another thing to note is that we could mask off the depth buffer before we
render to keep it from drawing anything in the *yellow*, but instead we just
make sure we use the intersection faces to render...

-->

Depth Assignment
----------------

    gl_FragDepth = 0.0;

<!--

This is how we mask off...

Would have to do something more sophisticated if you wanted to render the
volumes with other things in the scene...

-->

Screenshot
----------

![](boolean-and-screenshot.png)

Results
=======

Implementation
--------------

 - C++
 - OpenGL 3 core profile

<!--

Chose C++ because it's fast but also pretty easy to use.

Use the OpenGL core profile to be as lean-and-mean as possible.  And to learn
the new stuff...  :)

-->

Frame Rates of Approaches
-------------------------

\begin{figure}
\centering
\begin{tikzpicture}
\begin{semilogxaxis}[
    xbar,
    xmin=0,
    xlabel=Frames Per Second,
    enlarge y limits=0.2,
    symbolic y coords={ Slicing with Attributes, Slicing with Uniforms, Boolean AND, Boolean XOR},
    ytick=data
]
\addplot coordinates {
    (172,Slicing with Attributes)
    (130,Slicing with Uniforms)
    (51,Boolean AND)
    (76,Boolean XOR)
};
\addplot coordinates {
    (25,Slicing with Attributes)
    (6,Slicing with Uniforms)
    (24,Boolean AND)
    (24,Boolean XOR)
};
\addplot coordinates {
    (15,Slicing with Attributes)
    (18,Slicing with Uniforms)
    (10,Boolean AND)
    (13,Boolean XOR)
};
\end{semilogxaxis}
\end{tikzpicture}
\end{figure}

<!--

Here's the frame rates of the approaches compared to two different
implementations of the slicing method.  The first implementation is for an
arbitrary number of volumes, and requires a lot of context-switching. The second
is for just two volumes.

As you can see both Boolean-based approaches beat the general slicing method,
but the optimized slicing method beats both of them.

So that was unfortunate!  But this is just with one hundred samples...  I wanted
to see what would happen as the number of samples increases...

-->

Macbook with Varying Sample Rates
---------------------------------

\begin{figure}
\centering
\begin{tikzpicture}
\begin{axis}[
    xlabel=Samples,
    ylabel=Frames Per Second]
\addplot coordinates {
  (100, 20)
  (200, 10)
  (300, 7)
  (400, 5)
  (500, 4)
};
\addlegendentry{Boolean XOR}
\addplot coordinates {
  (100, 20)
  (200, 10)
  (300, 6)
  (400, 4)
  (500, 4)
};
\addlegendentry{Depth-masking}
\addplot coordinates {
  (100, 6)
  (200, 3)
  (300, 2)
  (400, 1)
  (500, 1)
};
\addlegendentry{Slicing (uniforms)}
\addplot coordinates {
  (100, 22)
  (200, 10)
  (300, 7)
  (400, 5)
  (500, 4)
};
\addlegendentry{Slicing (attributes)}
\end{axis}
\end{tikzpicture}
\end{figure}

<!--

For the most part they just converge...  :(

-->

Desktop with Varying Sample Rates
---------------------------------

\begin{figure}
\centering
\begin{tikzpicture}
\begin{axis}[
    xlabel=Samples,
    ylabel=Frames Per Second]
\addplot coordinates {
  (100, 13)
  (200, 7)
  (300, 5)
  (400, 4)
  (500, 3)
};
\addlegendentry{Boolean XOR}
\addplot coordinates {
  (100, 10)
  (200, 6)
  (300, 4)
  (400, 3)
  (500, 2)
};
\addlegendentry{Depth-masking}
\addplot coordinates {
  (100, 18)
  (200, 9)
  (300, 6)
  (400, 5)
  (500, 4)
};
\addlegendentry{Slicing (uniforms)}
\addplot coordinates {
  (100, 15)
  (200, 8)
  (300, 5)
  (400, 4)
  (500, 3)
};
\addlegendentry{Slicing (attributes)}
\end{axis}
\end{tikzpicture}
\end{figure}

Workstation with Varying Sample Rates
-------------------------------------

\begin{figure}
\centering
\begin{tikzpicture}
\begin{axis}[
    xlabel=Samples,
    ylabel=Frames Per Second]
\addplot coordinates {
  (100, 76)
  (200, 39)
  (300, 27)
  (400, 23)
  (500, 17)
};
\addlegendentry{Boolean XOR}
\addplot coordinates {
  (100, 51)
  (200, 28)
  (300, 19)
  (400, 14)
  (500, 11)
};
\addlegendentry{Depth-masking}
\addplot coordinates {
  (100, 130)
  (200, 68)
  (300, 46)
  (400, 36)
  (500, 29)
};
\addlegendentry{Slicing (uniforms)}
\addplot coordinates {
  (100, 172)
  (200, 89)
  (300, 60)
  (400, 46)
  (500, 38)
};
\addlegendentry{Slicing (attributes)}
\end{axis}
\end{tikzpicture}
\end{figure}

Evaluation
----------

 - No faster than slicing method
 - Boolean approaches require a lot of passes
 - Optimized slicing has good balance between CPU/GPU
 - Everything is fragment-bound

<!--

Even though the Boolean-based approaches don't generate a lot of geometry,
they're still not really faster than the slicing method.  So even if you just
want to render two volumes, you're better off sticking with the slicing method
since it handles volumes of any orientation.

Think that's because the Boolean-based approaches require a lot of passes, which
means a lot of context switching.  On the other hand the slicing method can be
optimized so that all the geometry is pushed down to the card at once and then
it can render it one swoop without going back to the CPU.  Furthermore, while
it's doing that the CPU can be working on the next frame's geometry.

-->

Conclusion
==========

Future Work
-----------

 - Possibly expand to three volumes?
 - Hybrid method using multiple Framebuffer attachments
 - Geometry/tesselation shaders

<!--

It'd be interested to see if it could be extended to more volumes...

Also before I worked on rendering volumes with Booleans I had started on a
hybrid method of some sorts that used multiple Framebuffer attachments.
Unfortunately currently the number of textures you're allowed to use right now
is pretty low.  If that ever went up it'd be interesting to see how that'd work
out.

Plus I could see using the new geometry and tesselation shaders in OpenGL 3 and
4 to do the slicing method...

-->

Lessons
-------

 - OpenGL 3 / GLSL
 - Libraries
 - Tools

<!--

Even though I didn't really get the results I was hoping for, I learned a ton
from doing this project.  Became much more professional, so very glad to have
done it.

Tools: Git, Make, Vim, Autotools, LaTeX, CppUnit, GTK

-->

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
