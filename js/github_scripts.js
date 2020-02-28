
class GithubInfos{
  constructor(){
    this.m_repo     = "";
    this.m_commits  = [];
    this.m_releases = [];
    this.m_loaded   = false;
  }
}

class GitAuthor{
  constructor(){
    this.m_id    = 0;
    this.m_login = null;
    this.m_name  = null;
  }
}

class GitCommit{
  constructor(){
    this.m_sha         = "";
    this.m_author      = new GitAuthor();
    this.m_date        = null;
    this.m_description = [];
    this.m_html_url    = "";
    this.m_repo_name   = "";
  }

  static async request_github_commit(commit){
    var data = await ajax_request(github_commit_url(commit.m_repo_name, commit.m_sha), "GET", "json");
    commit.m_sha           = data.sha;
    commit.m_html_url      = data.html_url;
    commit.m_date          = Date.parse(data.commit.author.date);
    commit.m_author.m_name = data.commit.author.name;

    // Those author informations are not always filled by the github api and must be filtered.
    if(data.author != null){
      commit.m_author.m_id    = data.author.id;
      commit.m_author.m_login = data.author.login;
    }
    else if(data.commiter != null){
      commit.m_author.m_id    = data.commiter.id;
      commit.m_author.m_login = data.commiter.login;
    }
  }

  static async request_push_events_commits(commits, user_name){
    var data = await ajax_request(github_user_events_url(user_name), "GET", "json");
    for(var i = 0; i < data.length; ++i){
      if( data[i].type == "PushEvent" ){
        for(var j = 0; j < data[i].payload.commits.length; ++j){
          if( data[i].payload.commits[j].message.length > 50 ){
            var commit_ref = new GitCommit();
            commit_ref.m_sha         = data[i].payload.commits[j].sha;
            commit_ref.m_repo_name   = data[i].repo.name;
            commit_ref.m_description = data[i].payload.commits[j].message.match(/[^\r\n]+/g);
            commits.push(commit_ref);
          }
        }
      }
    }
  }

  static async fetch_push_events_commits(user_name, progress_text_elt, on_success_func, ...args){
    var commits = [];
    var status_text = [];
    var update_status_display = function(){
      var temp_inner_html = "";
      for(var i = 0; i < status_text.length; ++i){
        temp_inner_html += status_text[i];
      }
      progress_text_elt.innerHTML = temp_inner_html;
    }

    status_text.push("Requesting the push events from the github API. <br />");
    update_status_display();
    await GitCommit.request_push_events_commits(commits, user_name);

    status_text.push("");
    for(var i = 0; i < commits.length; ++i){
      status_text[status_text.length-1] = "Fetching additionnal commit information " + (i+1) + "/" + commits.length + "<br />";
      update_status_display();
      await GitCommit.request_github_commit(commits[i]);
    }

    status_text.push("Building the display. <br />");
    update_status_display();
    // progress_text_elt.innerText = "Building the display";

    if( on_success_func && typeof(on_success_func) == "function"){
      on_success_func(commits, ...args);
    }
  }


  static async request_github_repo_commits(user_and_repo_name, project, on_success_func, ...args){
    var data = await ajax_request(github_user_repo_all_commits_list_url(user_and_repo_name), "GET", "json");
    var commits = project.m_github_infos.m_commits;
    for(var i = 0; i < data.length; ++i){
      var commit = new GitCommit();
      commit.m_sha           = data[i].sha;
      commit.m_html_url      = data[i].html_url;
      commit.m_date          = Date.parse(data[i].commit.author.date);
      commit.m_author.m_name = data[i].commit.author.name;
      commit.m_description   = data[i].commit.message.match(/[^\r\n]+/g);
      commit.m_repo_name     = user_and_repo_name;

      // Those author informations are not always filled by the github api and must be filtered.
      if(data[i].author != null){
        commit.m_author.m_id    = data[i].author.id;
        commit.m_author.m_login = data[i].author.login;
      }
      else if(data[i].commiter != null){
        commit.m_author.m_id    = data[i].commiter.id;
        commit.m_author.m_login = data[i].commiter.login;
      }

      project.m_github_infos.m_commits.push(commit);
    }

    project.m_github_infos.m_commits.sort(GitCommit.compare_desc);

    if( on_success_func && typeof(on_success_func) == "function"){
      on_success_func(commits, ...args);
    }
  }


  static compare_asc(c1, c2){
    return Date.compare(c1.m_date, c2.m_date);
  }

  static compare_desc(c1, c2){
    return -1 * GitCommit.compare_asc(c1, c2);
  }
}

class GitRelease{
  constructor(){
    this.m_id            = -1;
    this.m_name          = "";
    this.m_tag_name      = "";
    this.m_author        = new GitAuthor();
    this.m_date          = null;
    this.m_html_url      = "";
    this.m_markdown_body = "";
    this.m_assets        = [];
  }

  static async request_github_repo_releases(user_and_repo_name, releases, on_success_func, ...args){
    var data = await ajax_request(github_user_repo_release_list_url(user_and_repo_name), "GET", "json");
    // var releases = project.m_github_infos.m_releases;
    for(var i = 0; i < data.length; ++i){
      var release = new GitRelease();
      release.m_id = data[i].id;
      release.m_name = data[i].name;
      release.m_tag_name = data[i].tag_name;
      release.m_markdown_body = marked(data[i].body);
      release.m_html_url = data[i].html_url;
      release.m_date = Date.parse(data[i].published_at);

      if( data[i].author != null){
        release.m_author = new GitAuthor();
        release.m_author.m_id = data[i].author.id;
        release.m_author.m_login = data[i].author.login;
      }

      for(var j = 0; j < data[i].assets.length; ++j){
        var release_asset = new GitReleaseAsset();
        release_asset.m_id = data[i].assets[j].id;
        release_asset.m_name = data[i].assets[j].name;
        release_asset.m_size = data[i].assets[j].size;
        release_asset.m_download_url = data[i].assets[j].browser_download_url;
        release.m_assets.push(release_asset);
      }
      releases.push(release);
    }

    // project.m_github_infos.m_releases.sort(GitRelease.compare_desc);
    releases.sort(GitRelease.compare_desc);

    if( on_success_func && typeof(on_success_func) == "function"){
      on_success_func(releases, ...args);
    }
  }

  static compare_asc(c1, c2){
    return Date.compare(c1.m_date, c2.m_date);
  }

  static compare_desc(c1, c2){
    return -1 * GitCommit.compare_asc(c1, c2);
  }
}

class GitReleaseAsset{
  constructor(){
    this.m_id   = -1;
    this.m_name = "";
    this.m_size = -1;
    this.m_download_url = "";
  }
}


const github_api_url = "https://api.github.com/";
function github_user_id_url(user_name)                                              { return "https://api.github.com/users/" + user_name;                                             }
function github_user_repo_list_url(user_name)                                       { return github_api_url + "users/" + user_name + "/repos";                                        }
function github_user_events_url(user_name)                                          { return github_api_url + "users/" + user_name + "/events";                                       }
function github_commit_url(user_and_repo_name, sha)                                 { return github_api_url + "repos/" + user_and_repo_name + "/commits/" + sha;                      }
function github_user_repo_all_commits_list_url(user_and_repo_name)                  { return github_api_url + "repos/" + user_and_repo_name + "/commits";                             }
function github_user_repo_branch_list_url(user_name, repo_name)                     { return github_api_url + "repos/" + user_name + "/" + repo_name + "/branches";                   }
function github_user_repo_branch_commits_list_url(user_name, repo_name, branch_name){ return github_api_url + "repos/" + user_name + "/" + repo_name + "/commits?sha=" + branch_name; }
function github_user_repo_release_list_url(user_and_repo_name)                      { return github_api_url + "repos/" + user_and_repo_name + "/releases";                            }
function github_user_repo_release_url(user_and_repo_name, id)                       { return github_api_url + "repos/" + user_and_repo_name + "/releases/" + id;                      }
