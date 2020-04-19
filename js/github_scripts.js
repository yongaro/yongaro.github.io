const GithubLoadingStatus = {New: 0, LoadingCommits: 2, CommitsLoaded: 4, LoadingReleases: 8, ReleasesLoaded: 16};



class GithubInfos{
  constructor(){
    this.m_repo     = "";
    this.m_commits  = [];
    this.m_releases = [];
    this.m_status   = GithubLoadingStatus.New;
  }

  async request_commits(){
    if( this.m_repo.length > 0 && (~(this.m_status & GithubLoadingStatus.LoadingCommits) && ~(this.m_status & GithubLoadingStatus.CommitsLoaded)) ){
      this.m_status = this.m_status | GithubLoadingStatus.LoadingCommits;
      this.m_commits = await GitCommit.request_github_repo_commits(this.m_repo);
      this.m_status = this.m_status & ~GithubLoadingStatus.LoadingCommits;
      this.m_status = this.m_commits.length > 0 ? this.m_status | GithubLoadingStatus.CommitsLoaded : this.m_status;
    }
  }

  async request_releases(){
    if( this.m_repo.length > 0 && (~(this.m_status & GithubLoadingStatus.LoadingReleases) && ~(this.m_status & GithubLoadingStatus.ReleasesLoaded)) ){
      this.m_status = this.m_status | GithubLoadingStatus.LoadingReleases;
      this.m_releases = await GitRelease.request_github_repo_releases(this.m_repo);
      this.m_status = this.m_status & ~GithubLoadingStatus.LoadingReleases;
      this.m_status = this.m_commits.length > 0 ? this.m_status | GithubLoadingStatus.ReleasesLoaded : this.m_status;
    }
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

  static async request_github_commit_additional_infos(commit){
    var data = await ajax_request(github_commit_url(commit.m_repo_name, commit.m_sha), "GET", "json");
    if( data != null ){
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
  }

  static async request_push_events_commits(user_name){
    var data = await ajax_request(github_user_events_url(user_name), "GET", "json");
    var commits = [];
    if( data != null ){
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

    return commits;
  }

  static async request_github_repo_commits(user_and_repo_name){
    var data = await ajax_request(github_user_repo_all_commits_list_url(user_and_repo_name), "GET", "json");
    var commits = [];
    if( data != null ){
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

        commits.push(commit);
      }

      commits.sort(GitCommit.compare_desc);
    }

    return commits;
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

  static async request_github_repo_releases(user_and_repo_name){
    var data = await ajax_request(github_user_repo_release_list_url(user_and_repo_name), "GET", "json");
    var releases = [];
    if( data != null ){
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
      // releases.sort(GitRelease.compare_desc);
      releases.sort(GitRelease.compare_desc);
    }

    return releases;
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
function github_rate_limit()                                                        { return github_api_url + "rate_limit";                                                           }
