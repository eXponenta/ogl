## NO GL
Not needs pass GL to constructor argument.

## No immediate instance for GL objects

Because gl not passed to constructor, we can't instantiate native object in constructor.

Now there are `prepare` step that called each use of OGL Object. Only in this step native elements SHOULD BE spawned and updated: renderbuffers/textures/arrays.

## Separate preparation and draw

For some reason any uploads in render phase is stall GPU. Needs upload/create all native objects and only after run render.

See restriction on [EXT_multisampled_render_to_texture](https://www.khronos.org/registry/OpenGL/extensions/EXT/EXT_multisampled_render_to_texture.txt)

And [Oculus blog](https://developer.oculus.com/blog/loads-stores-passes-and-advanced-gpu-pipelines)

## Other

- Based on TS
- Has sharable ProgramData feature
- Preparing to XR (coming soon)

