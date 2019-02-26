// The option of loading json from either jquery or pure javascript is placed on hiatus for now.
// Loading local json is purposely prevented on the chrome browsers familly for security reasons.
// Lacking for now a proper server setup, it is a real pain to implement this feature and fully test it.
// Considering the very little size of this wanna-be json database below, I'll spend more time implementing
// other features instead for now.
const static_project_json_string = '{\
  "projects" : [\
    {\
      "description": [\
        {"name" : "Geometry Algorithms", "text" : "A collection of post processing algorithms using a basic OpenGL 3 asset viewer and implemented during my 4th college year."},\
        {"name" : "Algorithmes de géométrie", "text" : "Une collection d\'algorithmes de post processing de géométrie implémentés en M1 IMAGINA utilisant un viewer basique OpenGL."}\
      ],\
      "content" :[\
        {"type" : "Image", "file" : "cc1.png"}, {"type" : "Image", "file" : "cc2.png"}, {"type" : "Image", "file" : "ms.png"}, {"type" : "Image", "file" : "melynx.png"},\
        {"type" : "Image", "file" : "mush.png"}, {"type" : "Image", "file" : "clank.png"}, {"type" : "Image", "file" : "seg.png"}, {"type" : "Image", "file" : "seg2.png"}\
      ]\
    },\
    {\
      "description": [\
        {"name" : "Borderlands", "text" : "An Unreal Engine 4.10 demo of some features implemented in the Borderlands games, such as procedural weapons and character assembly and animation."},\
        {"name" : "Borderlands", "text" : "Une démo Unreal Engine 4.10 d\'assemblages procédural de models 3D, d\'animations et l\'implémentation d\'une ligne de produits logicielle."}\
      ],\
      "content" :[\
        {"type" : "Image", "file" : "bor5.jpg"}, {"type" : "Image", "file" : "bor3.jpg"}, {"type" : "Image", "file" : "bor2.jpg"},\
        {"type" : "Image", "file" : "bor1.jpg"}, {"type" : "Image", "file" : "gun.png"}, {"type" : "Image", "file" : "gun2.png"}\
      ]\
    },\
    {\
      "description": [\
        {"name" : "Clarisse iFX", "text" : "Some illustrations of my contributions to the Clarisse iFX software product line."},\
        {"name" : "Clarisse iFX", "text" : "Une série d\'illustrations de ma contribution à la suite logicielle Clarisse iFX."}\
      ],\
      "content" :[\
        {"type" : "Image", "file" : "hairs.jpg"},\
        {"type" : "Video", "file" : "https://www.youtube.com/embed/mfCSBa590Y8"},\
        {"type" : "Video", "file" : "https://www.youtube.com/embed/PNaVGXo9br0"},\
        {"type" : "Video", "file" : "https://www.youtube.com/embed/T8UhiA6y7J8"}\
      ]\
    },\
    {\
      "description": [\
        {"name" : "3D Image processing", "text" : "Several algorithms allowing some filtering and surface extraction on 3D image and load them in more classical rendering engines."},\
        {"name" : "Imagerie 3D", "text" : "Plusieurs algorithmes de traitements d\'images 3D permettant d\'extraire des volumes et des surfaces puis de les visualiser dans un moteur de rendu."}\
      ],\
      "content" :[\
        {"type" : "Image", "file" : "e3.png"}, {"type" : "Image", "file" : "e1.png"}, {"type" : "Image", "file" : "e2.png"}, {"type" : "Image", "file" : "m.jpg"},\
        {"type" : "Image", "file" : "b1.jpg"}, {"type" : "Image", "file" : "b2.jpg"}, {"type" : "Image", "file" : "s2_surf.jpg"}, {"type" : "Image", "file" : "s1_vol.png"},\
        {"type" : "Image", "file" : "recalage1.jpg"}, {"type" : "Image", "file" : "recalage4.jpg"}\
      ]\
    },\
    {\
      "description": [\
        {"name" : "Mandelbrot", "text" : "A small project aiming to process Mandelbrot and Julia fractals in a very basic OpenGL 1 viewer."},\
        {"name" : "Mandelbrot", "text" : "Projet de L2 informatique permettant de visualiser les fractales de Mandelbrot et Julia avec différentes colorations et implémenté en OpenGL 1."}\
      ],\
      "content" :[\
        {"type" : "Image", "file" : "m6.png"}, {"type" : "Image", "file" : "m3.png"}, {"type" : "Image", "file" : "julia.png"}, {"type" : "Image", "file" : "budha.jpg"},\
        {"type" : "Image", "file" : "m2.png"}, {"type" : "Image", "file" : "m5.png"}, {"type" : "Image", "file" : "m4.png"}, {"type" : "Image", "file" : "m1.png"}\
      ]\
    },\
    {\
      "description": [\
        {"name" : "Pokemon libGDX", "text" : "A 2D game engine using Java, libGDX and Tiled aiming to recreate as many feature as possible from the Pokemon franchise."},\
        {"name" : "Pokemon libGDX", "text" : "Projet de L3 informatique visant à créer un moteur de jeux Pokemon en java utilisant libGDX et Tiled."}\
      ],\
      "content" :[\
        {"type" : "Image", "file" : "pokemon.gif"}, {"type" : "Image", "file" : "pok2.jpg"}, {"type" : "Image", "file" : "pok3.jpg"},\
        {"type" : "Image", "file" : "pok4.jpg"}, {"type" : "Image", "file" : "pok5.png"}, {"type" : "Image", "file" : "pok6.jpg"}\
      ]\
    },\
    {\
      "description": [\
        {"name" : "SeriousFarm", "text" : "A Unity animated tiled map system implemented in a Harvest Moon like game."},\
        {"name" : "SeriousFarm", "text" : "Projet de L3 informatique visant à créer un moteur de jeux Pokemon en java utilisant libGDX et Tiled."}\
      ],\
      "content" :[\
        {"type" : "Image", "file" : "winter.png"}, {"type" : "Image", "file" : "spring.png"}, {"type" : "Image", "file" : "automn.png"}\
      ]\
    },\
    {\
      "description": [\
        {"name" : "VoxEngine", "text" : "Project aiming to recreate a Minecraft game from scratch using 3D images and modern OpenGL (4.3)."},\
        {"name" : "VoxEngine", "text" : "Projet de M2 IMAGINA visant à créer un Minecraft \'from scratch\' en OpenGL 4.3."}\
      ],\
      "content" :[\
        {"type" : "Image", "file" : "VoxEngine-deferred.jpg"}, {"type" : "Image", "file" : "VoxEngine-forward.jpg"}, {"type" : "Image", "file" : "VoxEngine-snow.jpg"},\
        {"type" : "Image", "file" : "VoxEngine-sea.jpg"}, {"type" : "Image", "file" : "VoxEngine-lights.jpg"}\
      ]\
    },\
    {\
      "description": [\
        {"name" : "Vulkan", "text" : "An early Vulkan 1.0 3D assets viewer implementing several rendering effects (phong lighting, normal map, specular map, parralax, displacement)."},\
        {"name" : "Vulkan", "text" : "Un viewer de modèles 3D avec plusieurs effets de rendu (illumination Phong, normal map, specular map, parralax, displacement) utilisant Vulkan 1.0 et Assimp."}\
      ],\
      "content" :[\
        {"type" : "Image", "file" : "vk4.jpg"}, {"type" : "Image", "file" : "vk1.jpg"}, {"type" : "Image", "file" : "vk2.jpg"}, {"type" : "Image", "file" : "vk3.jpg"}\
      ]\
    }\
  ]\
}';
