# **Imagerie 3D**

You can see here a demonstration of several 3D images processing algorithms implemented in C++

* The first 6 images represents the extraction of regions of interest from CT scan images based on their density.  
  Metal alloy, bones or organs are extracted with a simple 2 phase thresholding.  
  The surface of this area is then processed with a simplified marching cube which give this cubic voxel look.

* The pink and white blood systems in the 7 and 8 images are extracted with a breadth first search starting from a given voxel.

* The last two images illustrate the registration of two femur extracted from two CT scans.  
  The goal here is to process the best linear transformation (rotation, translation, scale) allowing the two objects to be comparable.  
  This technique is usefull to either compare medical data from two patients or use CT scans of the same person but from different hardware.


The images were loaded and processed using the [CImg](http://www.cimg.eu/) C++ library and the surfaces are rendered either with [Blender](https://www.blender.org/) or [Fiji](https://fiji.sc/).
