# Vulkan


Un moteur de rendu implémenté en C++ et utilisant Vulkan 1.0 et plusieurs bibliothèques :

* Gestion de la fenêtre et de l'API Vulkan avec [GLFW3](https://www.glfw.org/).
* Assimp 3 permet de charger tous les formats de géométrie qu'elle supporte.
* Une illumination de Phong est calculée à partir des matériaux définis avec la géométrie.
* Ce moteur implémente également les normal maps, le displacement et du parralax.
