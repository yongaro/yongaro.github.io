// The option of loading json from either jquery or pure javascript is placed on hiatus for now.
// Loading local json is purposely prevented on the chrome browsers familly for security reasons.
// Lacking for now a proper server setup, it is a real pain to implement this feature and fully test it.
// Considering the very little size of this wanna-be json database below, I'll spend more time implementing
// other features instead for now.
const static_project_json_string = '{\
  "projects" : [\
    {\
      "content" :[\
        {"type" : "Image", "file" : "cc1.png"}, {"type" : "Image", "file" : "cc2.png"}, {"type" : "Image", "file" : "ms.png"}, {"type" : "Image", "file" : "melynx.png"},\
        {"type" : "Image", "file" : "mush.png"}, {"type" : "Image", "file" : "clank.png"}, {"type" : "Image", "file" : "seg.png"}, {"type" : "Image", "file" : "seg2.png"}\
      ]\
    },\
    {\
      "content" :[\
        {"type" : "Image", "file" : "bor5.jpg"}, {"type" : "Image", "file" : "bor3.jpg"}, {"type" : "Image", "file" : "bor2.jpg"},\
        {"type" : "Image", "file" : "bor1.jpg"}, {"type" : "Image", "file" : "gun.png"}, {"type" : "Image", "file" : "gun2.png"}\
      ]\
    },\
    {\
      "content" :[\
        {"type" : "Image", "file" : "https://cdna.artstation.com/p/assets/images/images/010/573/682/large/victor-dufayard-downtown-finale.jpg?1544157382"},\
        {"type" : "Image", "file" : "https://cdnb.artstation.com/p/assets/images/images/010/573/521/large/victor-dufayard-downtown-clay.jpg?1525136138"},\
        {"type" : "Image", "file" : "https://cdnb.artstation.com/p/assets/images/images/015/655/257/large/aron-kamolz-pathtoforest-web.jpg?1549128749"},\
        {"type" : "Image", "file" : "https://cdna.artstation.com/p/assets/images/images/015/915/570/large/maxime-benoit-final01.jpg?1550157098"},\
        {"type" : "Image", "file" : "https://cdnb.artstation.com/p/assets/images/images/005/758/781/large/thomas-revidon-island-02.jpg?1493575075"},\
        {"type" : "Image", "file" : "https://cdna.artstation.com/p/assets/images/images/015/888/106/large/aleksandr-demm-s-little-worlds-egypt2notext.jpg?1550056300"},\
        {"type" : "Image", "file" : "https://cdnb.artstation.com/p/assets/images/images/013/808/917/large/robin-roeske-moos-forest-v002.jpg?1541172662"},\
        {"type" : "Image", "file" : "https://cdnb.artstation.com/p/assets/images/images/013/808/921/large/robin-roeske-moos-forestviewport-v002.jpg?1541172520"},\
        {"type" : "Video", "file" : "https://www.youtube.com/embed/NtgogEy349Q"},\
        {"type" : "Video", "file" : "https://www.youtube.com/embed/BdwHVmASffM"},\
        {"type" : "Video", "file" : "https://www.youtube.com/embed/mfCSBa590Y8"},\
        {"type" : "Video", "file" : "https://www.youtube.com/embed/PNaVGXo9br0"},\
        {"type" : "Video", "file" : "https://www.youtube.com/embed/T8UhiA6y7J8"}\
      ]\
    },\
    {\
      "content" :[\
        {"type" : "Image", "file" : "e3.png"}, {"type" : "Image", "file" : "e1.png"}, {"type" : "Image", "file" : "e2.png"}, {"type" : "Image", "file" : "m.jpg"},\
        {"type" : "Image", "file" : "b1.jpg"}, {"type" : "Image", "file" : "b2.jpg"}, {"type" : "Image", "file" : "s2_surf.jpg"}, {"type" : "Image", "file" : "s1_vol.png"},\
        {"type" : "Image", "file" : "recalage1.jpg"}, {"type" : "Image", "file" : "recalage4.jpg"}\
      ]\
    },\
    {\
      "content" :[\
        {"type" : "Image", "file" : "m6.png"}, {"type" : "Image", "file" : "m3.png"}, {"type" : "Image", "file" : "julia.png"}, {"type" : "Image", "file" : "budha.jpg"},\
        {"type" : "Image", "file" : "m2.png"}, {"type" : "Image", "file" : "m5.png"}, {"type" : "Image", "file" : "m4.png"}, {"type" : "Image", "file" : "m1.png"}\
      ]\
    },\
    {\
      "content" :[\
        {"type" : "Image", "file" : "pokemon.gif"}, {"type" : "Image", "file" : "pok2.jpg"}, {"type" : "Image", "file" : "pok3.jpg"},\
        {"type" : "Image", "file" : "pok4.jpg"}, {"type" : "Image", "file" : "pok5.png"}, {"type" : "Image", "file" : "pok6.jpg"}\
      ]\
    },\
    {\
      "content" :[\
        {"type" : "Image", "file" : "SeriousFarm1.jpg"}, {"type" : "Image", "file" : "spring.png"}, {"type" : "Image", "file" : "automn.png"}, {"type" : "Image", "file" : "winter.png"}\
      ]\
    },\
    {\
      "content" :[\
        {"type" : "Image", "file" : "VoxEngine-deferred.jpg"}, {"type" : "Image", "file" : "VoxEngine-forward.jpg"}, {"type" : "Image", "file" : "VoxEngine-snow.jpg"},\
        {"type" : "Image", "file" : "VoxEngine-sea.jpg"}, {"type" : "Image", "file" : "VoxEngine-lights.jpg"}\
      ]\
    },\
    {\
      "content" :[\
        {"type" : "Image", "file" : "vk4.jpg"}, {"type" : "Image", "file" : "vk1.jpg"}, {"type" : "Image", "file" : "vk2.jpg"}, {"type" : "Image", "file" : "vk3.jpg"}\
      ]\
    }\
  ]\
}';
