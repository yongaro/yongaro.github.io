var ContentType = {Image: 0, Video: 1};
var Languages = {En: 0, Fr: 1, Count: 2};

class Description{
  constructor(text){
    this.m_text = text;
  }
}

class Content{
  constructor(type, location){
    this.m_type = type;
    this.m_location = location;
  }
}


class Project{
  constructor(){
    this.m_description = []; // One per language
    this.m_content = []; // A collection of images and videos
  }
}

var ProjectId = {
  AlgoGeo: 0,
  Borderlands: 1,
  Clarisse: 2,
  Imagerie3D: 3,
  Mandelbrot: 4,
  Pokemon: 5,
  SeriousFarm: 6,
  VoxEngine: 7,
  Vulkan: 8,
  Count: 9
};

// Static variables and constants
const github_raw_url = "https://raw.githubusercontent.com/yongaro/yongaro.github.io/master/";
const content_dir = "data/images";
const project_modal_id = "project_fullscreen_modal";
const languages_folders = ["en", "fr"];
const projects_names = ["AlgoGeo", "Borderlands", "Clarisse", "Imagerie3D",
"Mandelbrot", "Pokemon", "SeriousFarm", "VoxEngine", "Vulkan"];

var current_project = -1;
var current_language = Languages.Fr;
var project_list = [];
var project_modal_vue_desc_app;


// This function use
function configure_project_modal(project_id){
  if( current_project != project_id)
  var project = project_list[project_id];
  var modal_root = document.getElementById(project_modal_id);

  openNav();


  // Configure the title
  // var modal_header = modal_root.querySelector("#modal_title");
  // modal_header.textContent = project.m_description[current_language].m_name;

  // Configure the content current content
  configure_project_modal_current_content(modal_root, project.m_content[0]);

  // Clear and configure the image slider
  configure_project_modal_image_slider(modal_root, project_id);

  // Clear and configure the modal text.
  configure_project_modal_text(project);
}


function configure_project_modal_current_content(modal_root, content){
  var modal_current_content = modal_root.querySelector("#modal_current_content");

  // First clear the current content div
  while(modal_current_content.firstChild){
    modal_current_content.removeChild(modal_current_content.firstChild);
  }

  // Depending on the type either insert an img tag or a frame
  // var content = project.m_content[content_id];
  var location_is_url = is_url(content.m_location);
  var content_element;

  if(content.m_type == ContentType.Image){
    var content_src = "";
    content_element = document.createElement("img");

    if( location_is_url ){ content_src = content.m_location; }
    else{ content_src = content_dir + "/" + content.m_location; }

    content_element.src = content_src;
    content_element.setAttribute("onclick", "open_fullscreen_image_viewer('" + content_src + "')");
    content_element.style.cursor = "zoom-in"


    modal_current_content.appendChild(content_element);
  }
  if(content.m_type == ContentType.Video){
    var responsive_element = document.createElement("div");
    responsive_element.className = "embed-responsive embed-responsive-16by9";
    content_element = document.createElement("iframe");
    content_element.className = "embed-responsive-item";

    if( location_is_url ){ content_element.src = content.m_location; }
    else{ content_element.src = content_dir + "/" + content.m_location; }

    responsive_element.appendChild(content_element);
    modal_current_content.appendChild(responsive_element);
  }
}

function slider_element_onclick(modal_id, project_id, content_id){
  var project = project_list[project_id];
  var modal_root = document.getElementById(modal_id);
  var content = project.m_content[content_id];
  configure_project_modal_current_content(modal_id, content);
}


function configure_project_modal_image_slider(modal_root, project_id){
  var project = project_list[project_id];
  var modal_current_content = modal_root.querySelector("#modal_current_content");

  // Clear and configure the image slider
  var modal_image_slider = modal_root.querySelector("#modal_image_slider");
  while(modal_image_slider.firstChild){
    modal_image_slider.removeChild(modal_image_slider.firstChild);
  }

  var t_content;
  for(var i = 0; i < project.m_content.length; i++){
    t_content = project.m_content[i];
    if( t_content.m_type == ContentType.Image ){
      var slider_elt = document.createElement("div");
      var slider_image = document.createElement("img");
      var location_is_url = is_url(t_content.m_location);

      slider_elt.className = "flex-lg-row px-1 py-2 flex-hz-slider-elt zoom-hover";
      slider_elt.setAttribute("onclick", "slider_element_onclick(" + project_modal_id + ", " + project_id + ", " + i + ")");

      if( !location_is_url ){ slider_image.src += content_dir + "/"; }
      slider_image.src += t_content.m_location;

      slider_elt.appendChild(slider_image);
      modal_image_slider.appendChild(slider_elt);
    }

    if( t_content.m_type == ContentType.Video){
      var slider_elt = document.createElement("div");
      var slider_image = document.createElement("img");
      var location_is_url = is_url(t_content.m_location);
      var location_is_youtube_url = location_is_url ? is_youtube_video_url(t_content.m_location) : false;
      var default_thumbnail_src = "https://via.placeholder.com/640x360?text=Could+not+create+thumbnail+from+video+" + i;

      slider_elt.className = "flex-lg-row px-1 py-2 flex-hz-slider-elt zoom-hover";
      slider_elt.setAttribute("onclick", "slider_element_onclick(" + project_modal_id + ", " + project_id + ", " + i + ")");

      if( location_is_url && location_is_youtube_url ){
        // For remote videos only supports youtube thumbnails for now
        var thumbnail_src = get_youtube_thumbnail_src(t_content.m_location);
        if( thumbnail_src != "" ){ slider_image.src = thumbnail_src; }
        else{ slider_image.src = default_thumbnail_src; }
      }
      else{
        slider_image.src = default_thumbnail_src;
      }

      slider_elt.appendChild(slider_image);
      modal_image_slider.appendChild(slider_elt);
    }
  }
}


function configure_project_modal_text(project){
  project_modal_vue_desc_app.$set(project_modal_vue_desc_app.$data, "input", project.m_description[current_language].m_text);
}


function load_projects_from_json(string_data){
  var data = JSON.parse(string_data);

  for(var itp = 0; itp < data.projects.length; ++itp){
    var temp_project = new Project();
    // Load descriptions to the current project.
    for(var itd = 0; itd < Languages.Count; ++itd){
      temp_project.m_description.push(new Description("empty"));
    }

    // Load content to the current project.
    for(var itc = 0; itc < data.projects[itp].content.length; ++itc){
      temp_project.m_content.push( new Content(get_content_type(data.projects[itp].content[itc].type), data.projects[itp].content[itc].file) );
    }

    // Push the project to the final list.
    project_list.push(temp_project);
  }
}


function load_projects_descriptions(){
  var dataType = "text";
  var url = "";
  var async = true;

  for(var pid = 0; pid < ProjectId.Count; ++pid){
    for(var l = 0; l < Languages.Count; ++l){
      if( l == Languages.En ){ continue; }
      url = github_raw_url + "data/projects/" + languages_folders[l] + "/" + projects_names[pid] + ".md";
      request_project_description(url, dataType, async, project_list[pid], l);
    }
  }
}

function request_project_description(url, dataType, async, project, language){
  $.ajax({
    url: url,
    dataType: dataType,
    async: async,
    success: function(data, textStatus, jqXHR){
      project.m_description[language].m_text = data;
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.log(errorThrown);
    }
  });
}

function load_projects(){
  load_projects_from_json(static_project_json_string);
  load_projects_descriptions();


  // Setup the location map
  // 43.468771, 3.184393 || 43.631, 3.90876
  var home_leaflet_map = L.map('home_map', {center: [43.631, 3.90876], zoom: 14, scrollWheelZoom: false, dragging: false});
  var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  var home_marker = L.marker([43.631, 3.90876]);
  // home_marker.bindTooltip("Address", {permanent: true, className: "my-label", offset: [0, 0] });

  OpenStreetMap_Mapnik.addTo(home_leaflet_map);
  home_marker.addTo(home_leaflet_map);

  // window.onresize = on_resize;


  project_modal_vue_desc_app = new Vue({
    el: '#modal_project_desc',
    data: {
      input: "**Default Vue app Markdown**"
    },
    computed: {
      compiledMarkdown: function(){
        return marked(this.input, {sanitize: true});
      },
      methods: {
        setInput: function(newInput){ this.input = newInput; }
      }
    }
  });
}




function openNav() {
  document.getElementById("project_fullscreen_modal").style.display = "block";
  $('body').css({'overflow':'hidden'});
  $(document).bind('scroll',function (){ window.scrollTo(0,0); });
}

function closeNav() {
  document.getElementById("project_fullscreen_modal").style.display = "none";
  $(document).unbind('scroll');
  $('body').css({'overflow':'visible'});
}


function open_fullscreen_image_viewer(img_src){
  document.getElementById("fullscreen_image_viewer").style.display = "flex";
  document.getElementById("fullscreen_image_viewer_image").src = img_src;
}

function close_fullscreen_image_viewer(){
  document.getElementById("fullscreen_image_viewer").style.display = "none";
}

function get_content_type(type_string){
  if( type_string == "Image" ){ return ContentType.Image; }
  if( type_string == "Video" ){ return ContentType.Video; }
  return ContentType.Image;
}

/* Expect an embed type link */
function get_youtube_thumbnail_src(youtube_video_url){
  // Process the youtube url
  var video_id = find_youtube_video_id(youtube_video_url);
  if( video_id != "" ){ return "https://img.youtube.com/vi/" + video_id + "/maxresdefault.jpg"; }
  return "";
}

// source https://stackoverflow.com/a/8260383
function find_youtube_video_id(url){
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  var match = url.match(regExp);
  return (match&&match[7].length==11) ? match[7] : "";
}

// In order to avoid useless complexity all given youtube videos in the database must have youtube in them.
function is_youtube_video_url(url){
  var url_regex = /youtube/;
  return url_regex.test(url);
}

// In order to avoid useless complexity all given urls in the database must have https in them.
function is_url(location){
  var url_regex = /https/;
  return url_regex.test(location);
}
