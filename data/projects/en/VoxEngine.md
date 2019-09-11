# [**VoxEngine** <img src="./data/images/link-icon-2.png" width="25"/>](https://github.com/yongaro/VoxEngine)

A Minecraft game engine written in C++ using OpenGL 4.5 and the [**SDL**](https://www.libsdl.org/) library.
 
This project has a different takes on several features of the game : 

* The maps are handled with 3D images, each cube being a voxel.
* The actual cubes are obj models loaded with [**Assimp**](http://assimp.org/) allowing a highly flexible convfiguration.
* The rendering is accelerated using the OpenGL instanced rendering and the extraction of the visibles cubes from the image.
* Both forward and deffered rendering are implemented and selectable at runtime with a simple key stroke.
* The deferred renderer also use SSAO (Screen Space Ambiant Occlusion).
* Both renderers can use several hundreds of different light sources being either directionnals, points or cones.
* This high number of lights allows to use some cube types as light sources and dynamically place or remove them.
* A custom random map generator create maps based on a given biome type.
* Some basic first person inputs are available to play in a creative mode. 
