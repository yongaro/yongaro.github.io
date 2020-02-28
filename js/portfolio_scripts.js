var ContentType = {Image: 0, Video: 1};
var Languages = {En: 0, Fr: 1, Count: 2};

class Description{
  constructor(text){
    this.m_text = text;
  }
}

class Content{
  constructor(type, location){
    this.m_type     = type;
    this.m_location = location;
  }
}


class Project{
  constructor(){
    this.m_id           = -1;
    this.m_description  = []; // One per language
    this.m_content      = []; // A collection of images and videos
    this.m_github_infos = new GithubInfos();
  }
}


var ProjectId = {
  AlgoGeo: 0,
  Borderlands: 1,
  Clarisse: 2,
  Imagerie3D: 3,
  LuaBender: 4,
  Mandelbrot: 5,
  Pokemon: 6,
  SeriousFarm: 7,
  VoxEngine: 8,
  Vulkan: 9,
  Count: 10
};

const projects_names = [
  "AlgoGeo",
  "Borderlands",
  "Clarisse",
  "Imagerie3D",
  "LuaBender",
  "Mandelbrot",
  "Pokemon",
  "SeriousFarm",
  "VoxEngine",
  "Vulkan"
];


// Static variables and constants
const github_raw_url = "https://raw.githubusercontent.com/yongaro/yongaro.github.io/master/";
const content_dir = "data/images";
const languages_folders = ["en", "fr"];

const github_activity_table_id     = "github_push_events";
const github_project_modal_id      = "modal_github_commits";
const my_github_user_name          = "yongaro";
var max_commit_displayed           = 6;
var modal_max_commit_displayed     = 2;

var current_language = Languages.En;
var current_project = -1;
var project_list = [];

async function delayed_project_description(project_id, project_desc){
  project_desc.innerHTML = "<div class=\"loader\"></div><div style=\"text-align:center;\"><strong>Loading the project description.</strong></div>";

  if(current_project == project_id){
    if(project_list[project_id].m_description[current_language].m_text.length == 0){
      console.log("used timeout");
      setTimeout(function(){delayed_project_description(project_id, project_desc);}, 500);
    }
    else{
      project_desc.innerHTML = marked(project_list[project_id].m_description[current_language].m_text);
    }
  }
}


// This function use
function configure_project_modal(project_id){
  var project = project_list[project_id];
  var project_has_images = project.m_content.length > 0;
  var modal_github_commits = null;
  var modal_github_releases = null;
  const project_modal_id = project_has_images ? "project_modal" : "project_text_only_modal";
  var modal_root = document.getElementById(project_modal_id);

  open_modal_element(modal_root);

  if( current_project != project_id || project.m_description[current_language].m_text.length == 0){
    current_project = project_id;

    // Clean the github commit display if necessary
    modal_github_commits = modal_root.querySelector("#modal_github_commits");
    modal_github_releases = modal_root.querySelector("#modal_github_releases");
    modal_github_commits.innerHTML = "";
    modal_github_releases.innerHTML = "";

    // If there images are available, clean and prepare the image viewer.
    if( project_has_images ){
      // Configure the image viewer to the first image of the collection.
      configure_project_modal_current_content(modal_root, project.m_content[0]);

      // Clear and configure the image slider
      configure_project_modal_image_slider(project_modal_id, modal_root, project_id);
    }

    // Compile the project markdown description and give the html code to the description element.
    var project_desc = modal_root.querySelector("#modal_project_desc");
    if( project.m_description[current_language].m_text.length == 0 ){
      delayed_project_description(project_id, project_desc);
      // project_desc.innerHTML = "It seems the description of this project is not yet loaded, please close this panel and wait a bit before opening it again.<br />Thanks !";
    }
    else{
      project_desc.innerHTML = marked(project.m_description[current_language].m_text);
    }

    // Use highlight js to properly handle the potential code sections syntax highlighting.
    project_desc.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightBlock(block);
    });

    // If a repository was specified, load some github informations.
    if(project.m_github_infos.m_repo.length > 0){
      modal_github_commits.innerHTML += "<div class=\"loader\"></div>";
      modal_github_commits.innerHTML += "<div style=\"text-align:center;\"><strong>Fetching repository informations from the github API.</strong></div>";

      // Load the commit history if available and display it.
      if( project.m_github_infos.m_commits.length == 0){
        GitCommit.request_github_repo_commits(project.m_github_infos.m_repo, project, function(){
          build_commit_display(project.m_github_infos.m_commits, modal_github_commits, CommitDisplayMode.CommitHistory, modal_max_commit_displayed);
        });
      }
      else{
        build_commit_display(project.m_github_infos.m_commits, modal_github_commits, CommitDisplayMode.CommitHistory, modal_max_commit_displayed);
      }

      // load informations on the available releases.
      if( project.m_github_infos.m_releases.length == 0 ){
        GitRelease.request_github_repo_releases(project.m_github_infos.m_repo, project.m_github_infos.m_releases, function(){
          build_github_release_display(project.m_github_infos.m_releases, modal_github_releases, 1);
        });
      }
      else{
        build_github_release_display(project.m_github_infos.m_releases, modal_github_releases, 1);
      }
    }
  }
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

    if(content_element.naturalWidth > content_element.naturalHeight){
      content_element.style.minWidth = "100%";
      content_element.style.minHeight = "auto";
    }
    else{
      content_element.style.minWidth = "auto";
      content_element.style.minHeight = "100%";
    }

    content_element.setAttribute("onclick", "open_fullscreen_image_viewer('" + content_src + "', " + content_element.naturalWidth + ", " + content_element.naturalHeight + ")");


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
  // var modal_root = document.getElementById(modal_id);
  var content = project.m_content[content_id];
  configure_project_modal_current_content(modal_id, content);
}


function configure_project_modal_image_slider(project_modal_id, modal_root, project_id){
  var project = project_list[project_id];
  // var modal_current_content = modal_root.querySelector("#modal_current_content");

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


function load_projects_from_json(string_data){
  var data = JSON.parse(string_data);

  for(var itp = 0; itp < data.projects.length; ++itp){
    var temp_project = new Project();
    // Load descriptions to the current project.
    for(var itd = 0; itd < Languages.Count; ++itd){
      temp_project.m_description.push(new Description(""));
    }

    // Load content to the current project.
    for(var itc = 0; itc < data.projects[itp].content.length; ++itc){
      temp_project.m_content.push( new Content(get_content_type(data.projects[itp].content[itc].type), data.projects[itp].content[itc].file) );
    }

    // Load the github repository infos.
    temp_project.m_github_infos.m_repo = data.projects[itp].github;

    // Push the project to the final list.
    project_list.push(temp_project);
  }
}


async function request_project_description(url, project_description){
  project_description.m_text = await ajax_request(url, "GET", "text");
}


function load_projects_descriptions(){
  for(var pid = 0; pid < ProjectId.Count; ++pid){
    for(var l = 0; l < Languages.Count; ++l){
      if( l == Languages.Fr ){ continue; } // Skip french until some language switch is implemented.
      var url = github_raw_url + "data/projects/" + languages_folders[l] + "/" + projects_names[pid] + ".md";
      request_project_description(url, project_list[pid].m_description[l]);
    }
  }
}


async function ajax_request(url, method, dataType){
  return $.ajax({
    url: url,
    dataType: dataType,
    method: method,
    async: true,
    error: function(jqXHR, textStatus, errorThrown){ console.log(errorThrown); }
  });
}


const CommitDisplayMode = {
  PushEvent: 0,
  CommitHistory: 1
};

async function build_commit_display(commits, display_element, display_mode, commit_count){
  var count = Math.min(commits.length, commit_count);

  var new_html = "";
  if( display_mode ==  CommitDisplayMode.CommitHistory ){
    new_html += "<h3 class=\"my-3 border-bottom\">Recent github commits</h3>";
  }


  for(var i = 0; i < count; ++i){
    var commit_card_head_id = "commit_card_head_" + i;
    var commit_card_collapse_id = "commit_card_collapse_" + i;
    var repo_url = "https://github.com/" + commits[i].m_repo_name;

    new_html += "<div class=\"card git-card-head my-2\">";
    new_html +=      "<div class=\"card-header\" id=\"" + commit_card_head_id + "\">";
    new_html +=        "<div class=\"mb-3 border-bottom\">";

    switch(display_mode){
      case CommitDisplayMode.PushEvent :
      new_html +=          "<a href=\"" + repo_url + "\">" + commits[i].m_repo_name + "</a>";
      new_html +=          "<p style=\"float:right;\"><small><a href=\"" + commits[i].m_html_url + "\">" + commits[i].m_sha.substring(0, 7) + "</a> on </small> " + commits[i].m_date.toString("dd MMMM yyyy") + "</p>";
      break;
      case CommitDisplayMode.CommitHistory :
      new_html +=          "<small><a href=\"" + commits[i].m_html_url + "\">" + commits[i].m_sha.substring(0, 7) + "</a> on </small> " + commits[i].m_date.toString("dd MMMM yyyy") + " <small>by</small> ";
      new_html +=          "<strong>" + (commits[i].m_author.m_login != null ? commits[i].m_author.m_login : commits[i].m_author.m_name) + "</strong>";
      break;
    }

    new_html +=        "</div>";
    new_html +=        commits[i].m_description[0];
    if( commits[i].m_description.length > 1 ){
      new_html +=        "<a data-toggle=\"collapse\" href=\"#" + commit_card_collapse_id + "\" style=\"float:right;\"><small>more...</small></a>";
    }
    new_html +=      "</div>";
    new_html +=    "<div id=\"" + commit_card_collapse_id + "\" class=\"collapse\" data-parent=\"#" + display_element.getAttribute("id") + "\">";
    new_html +=      "<div class=\"card-body git-card-body\">";
    for(var j = 1; j < commits[i].m_description.length; ++j){
      new_html += commits[i].m_description[j] + "<br>";
    }
    new_html +=      "</div>";
    new_html +=    "</div>";
    new_html +=  "</div>";
  }

  display_element.innerHTML = new_html;
}

function get_byte_string_size(size){
  if( size > 1000000000   ){ return "" + (size / 1000000000).toPrecision(2) + " GB"; }
  else if( size > 1000000 ){ return "" + (size / 1000000).toPrecision(4) + " MB";    }
  else if( size > 1000    ){ return "" + (size / 1000).toPrecision(4) + " kB";       }
  return "" + size + " B"
}

function build_github_release_display(releases, display_element, release_count){
  if( (releases != null || releases != undefined) && releases.length > 0 ){

    var new_html = "<h3 class=\"my-3 border-bottom\">Current release</h3>";

    var release_card_head_id = "release_card_head_" + "0";
    var release_card_collapse_id = "release_card_collapse_" + "0";

    new_html +=    "<div class=\"card git-card-head my-2\">";
    new_html +=      "<div class=\"card-header\" id=\"" + release_card_head_id + "\">";

    new_html +=          "<strong><a href=\"" + releases[0].m_html_url + "\">" +  releases[0].m_name + "</a> on </strong> " + releases[0].m_date.toString("dd MMMM yyyy");

    if( releases[0].m_markdown_body.length > 1 ){
      new_html +=        "<a data-toggle=\"collapse\" href=\"#" + release_card_collapse_id + "\" style=\"float:right;\"><small>more...</small></a>";
    }


    new_html +=      "</div>";
    new_html +=    "<div id=\"" + release_card_collapse_id + "\" class=\"collapse\" data-parent=\"#" + display_element.getAttribute("id") + "\">";
    new_html +=      "<div class=\"card-body git-card-body\">";

    new_html += releases[0].m_markdown_body;
    new_html += "<br>";

    for(var i = 0; i < releases[0].m_assets.length; ++i){
      new_html += "<a href=\"" + releases[0].m_assets[i].m_download_url + "\">" + releases[0].m_assets[i].m_name + "</a> <strong>" + get_byte_string_size(releases[0].m_assets[i].m_size) + "</strong><br>";
    }

    new_html +=      "</div>";
    new_html +=    "</div>";
    new_html +=  "</div>";
    display_element.innerHTML = new_html;
  }
}


function load_projects() {
  load_projects_from_json(static_project_json_string);
  load_projects_descriptions();

  var github_activity_div = document.getElementById(github_activity_table_id);
  GitCommit.fetch_push_events_commits("yongaro", github_activity_div.children[1].children[0], build_commit_display, github_activity_div, CommitDisplayMode.PushEvent, max_commit_displayed);

  // Setup the location map
  // 43.468771, 3.184393 || 43.631, 3.90876 || zoom 14 // dunno
  // 43.423233, 3.2201016 || zoom 12 St genies de fontedit
  // 43.3397709, 3.214989 || Béziers
  var home_leaflet_map = L.map('home_map',{ center: [43.3823759, 3.202865], zoom: 5, scrollWheelZoom: false, dragging: false});
  var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  var home_marker = L.marker([43.423233,3.2201016]);
  // home_marker.bindTooltip("NAME", { permanent: true,className: "home_label",offset: [0,0] });
  home_marker.bindTooltip( {permanent: true, className: "home_label", offset: [0, 0] });

  OpenStreetMap_Mapnik.addTo(home_leaflet_map);
  home_marker.addTo(home_leaflet_map);
}


function open_modal_element(modal_element) {
  modal_element.style.display = "block";
  $('body').css({ 'overflow': 'hidden' });
  $(document).bind('scroll',function () { window.scrollTo(0,0); });

  // Also bind a closing function to the escape key.
  document.onkeydown = function(e){
    if(e.which == 27){
      close_modal_element(modal_element);
    }
  };
}

function close_modal_element(modal_element) {
  modal_element.style.display = "none";
  $(document).unbind('scroll');
  document.getElementsByTagName("body")[0].style.overflow = "visible";
  document.onkeydown = null;
}


function close_modal_by_id(modal_id) {
  document.getElementById(modal_id).style.display = "none";
  $(document).unbind('scroll');
  document.getElementsByTagName("body")[0].style.overflow = "visible";
  document.onkeydown = null;
}


function open_fullscreen_image_viewer(img_src, image_width, image_height){
  document.getElementById("fullscreen_image_viewer").style.display = "flex";
  var image_elt = document.getElementById("fullscreen_image_viewer_image");
  image_elt.src = img_src;

  if(image_width > image_height){
    image_elt.style.minWidth = "75%";
    image_elt.style.minHeight = "auto";
  }
  else{
    image_elt.style.minWidth = "auto";
    image_elt.style.minHeight = "75%";
  }
}

function close_fullscreen_image_viewer(){
  document.getElementById("fullscreen_image_viewer").style.display = "none";
}


// *********************** UTILITY FUNCTIONS ************************

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
