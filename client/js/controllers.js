var gitLabURL = 'http://bitnami-gitlab-b76b.cloudapp.net/api/v3/projects/'
var privateToken = '?private_token=AGrAjazL79tTNqJLeABp'

angular.module('lawtracker.controllers', [
  'lawtracker.services',
  'hljs'
])

.controller('AuthController', function ($scope, $location) {
  $scope.user = {};

  $scope.signin = function () {
    console.log($scope.user) //sign in through git lab here
    $("#hrBanner").toggle()
    $location.path('/dashboard');

  };

  $scope.signup = function () {
    console.log($scope.user) //sign up through git lab here
    $("#hrBanner").toggle()
    $location.path('/dashboard');
  };
})
.controller('DashController', function ($scope, $http, $routeParams) {
  $scope.userContributions = [];
  $scope.userBills = [];
  $http.get(gitLabURL + privateToken).success(function(data) {
    $scope.userBills = data;
    var name = $scope.userBills[0].name
    var id = $scope.userBills[0].id
    $http.get(gitLabURL + id + '/repository/commits' + privateToken).success(function(commits) {
      for (var j=0; j<commits.length; j++){
        var commit = commits[j]
        var commitStr = name + " - " + commit.title +  " (" + commit.created_at + ")";
        if ($scope.userContributions.length < 4) {
          $scope.userContributions.push({text: commitStr, billId: id, contribId: commit.id});
        }
      }
    })
  })
})
.controller('BillDetailController', function($scope, $http, $routeParams) {
    $scope.bill = {id: $routeParams.billId};

    $http.defaults.useXDomain = true;
    delete $http.defaults.headers.common['X-Requested-With'];
    // $http.defaults.headers.common.PRIVATE-TOKEN = 'AGrAjazL79tTNqJLeABp';
    // $httpProvider.defaults.headers.get = {'PRIVATE-TOKEN': 'AGrAjazL79tTNqJLeABp'};
    $http.get(gitLabURL + $routeParams.billId + privateToken).success(function(data) {
      $scope.bill = data;
    })
    .error(function(err) {
      console.log(err)
    });

    $http.get(gitLabURL + $routeParams.billId + '/repository/tree' + privateToken).success(function(data) {
      var repoTree = data;
      var repoSha = data[0].id;
      var fileName = data[0].name;

      $http.get(gitLabURL + $routeParams.billId + '/repository/raw_blobs/' + repoSha + privateToken).success(function(data) {
        $scope.bill.content = data;
      })
      .error(function(err) {
        console.log(err)
      });
    })
    .error(function(err) {
      console.log(err)
    });

})
.controller('BillRevisionsController', function($scope, $http, $routeParams) {
    $scope.bill = {id: $routeParams.billId};
    $scope.revisions = {};

    // TODO: Pass in the user dynamically

    $scope.user = {username: 'user', id: 1};

    $http.get(gitLabURL + $routeParams.billId + '/repository/commits' + privateToken).success(function(data) {
      $scope.revisions = data;
    })
    .error(function(err) {
      console.log(err)
    });

})
.controller('ViewRevisionController',
  function($scope, $http, $routeParams) {
    $scope.bill = {id: $routeParams.billId};
    $http.get(gitLabURL + $routeParams.billId + '/repository/commits/' + $routeParams.sha + '/diff' + privateToken).success(function(data) {
      $scope.bill.diff = data[0].diff;
    })
    .error(function(err) {
      console.log(err)
    });

    // get the file path
    $http.get(gitLabURL + $routeParams.billId + '/repository/tree' + privateToken).success(function(file_path_data) {
      // now look up the raw file content for that sha
      $http.get(gitLabURL + $routeParams.billId + '/repository/blobs/' + $routeParams.sha + privateToken + "&filepath=" + file_path_data[0].name).success(function(revision_content) {
        $scope.bill.content = revision_content;
      })
      .error(function(content_err) {
        console.log(content_err)
      });
    })
    .error(function(revision_content_err) {
      console.log("Error retrieving file content for revision");
      console.log(revision_content_err);
    });

})
.controller('CreateBillController', function($scope, $http, $routeParams, Repository) {
    $scope.bill = {};
    // Hardcode this for now...once we get login working we should know who
    // the user is and be able to access info via the api endpoint
    $scope.user = {username: 'user', id: 1};
    // we'll take the filename from the form, sanitize it, and use it for
    // creating the repo

    $scope.master = $scope.bill;

    $scope.create = function(bill) {
      /* if we're going to create a repo on the filesystem, we need to:
       * (where projectname is sanitized)
       * mkdir repositories/<username>/<projectname>
       * cd repositories/<username>/<projectname>
       * git init
       * fs.writeFile(<projectname>)
       * git add <projectname>
       * git commit -m "<commit message>"
       * git remote add origin git@<host>:<username>/<projectname>.git
       * git push -u origin master
       */
      // $scope.master = angular.copy(bill);
      // Repository.createRepository($scope.user, $scope.bill.filename);
      var sanitizedName = $scope.bill.filename.replace('/ /-/g');
      $http.post(gitLabURL + privateToken, {"name": sanitizedName, 'description': $scope.bill.description }).success(function(new_project) {
      // $http.post(gitLabURL + "user/" + $scope.user.id + privateToken  , {"name": sanitizedName, 'description': $scope.bill.description, "default_branch": "master"}).success(function(new_project) {
        console.log("Created new project:");
        console.log(new_project);

        // need to set up a hacky service. should just pass the name of a repo
        // and initalize it so the master branch gets created. right now,
        // creating a new project/repository leaves the default branch as null.
        // Other option is to create a repo on a users behalf, in which case we
        // have the option to set the default branch. (NM, this doesn't work)
        // $http.post(gitLabURL + new_project.id + '/repository/branches' + privateToken, {'id': new_project.id, 'branch_name': 'master'}).success(function(branch_data) {
          var file_path;
          var commitMsg = bill.commitMsg || "Updated at " + Date.now();

          // $http.put(gitLabURL + new_project.id + '/repository/files' + privateToken, {'id': new_project.id, 'content': $scope.bill.content, 'file_path': new_project.path, 'branch_name': 'master', 'commit_message': commitMsg}).success(function(data) {
          //   $scope.master = angular.copy(bill);
          // })
          $http.post('/api/repositories/create', {'id': new_project.id, 'file_path': new_project.path, 'branch_name': 'master', 'encoding': 'text', 'content': $scope.bill.content, 'commit_message': commitMsg}).success(function(data) {
            $scope.master = angular.copy(bill);
          })
          .error(function(file_create_err) {
            console.log("got an error when trying to update the bill");
            console.log(file_create_err);
          });
        // })
        // .error(function(branch_err) {
        //   console.log("Error creating default branch for new project");
        //   console.log(branch_err);
        // });

      })
      .error(function(err) {
        console.log(err);
      });

    };

    $scope.reset = function() {
      $scope.bill = angular.copy($scope.master);
    };

    $scope.reset();

})
.controller('EditBillController', function($scope, $http, $routeParams) {
    $scope.bill = {};
    // Hardcode this for now...once we get login working we should know who
    // the user is and be able to access info via the api endpoint
    $scope.user = {username: 'user', id: 1};
    $http.get(gitLabURL + $routeParams.billId + privateToken).success(function(data) {
      // console.log(data);
      $scope.bill.id = data.id;
      $scope.bill.description = data.description;
    })
    .error(function(err) {
      console.log(err)
    });

    $http.get(gitLabURL + $routeParams.billId + '/repository/tree' + privateToken).success(function(data) {
      var repoTree = data;
      var repoSha = data[0].id;
      $scope.bill.fileName = data[0].name;

      $http.get(gitLabURL + $routeParams.billId + '/repository/raw_blobs/' + repoSha + privateToken).success(function(data) {
        $scope.bill.content = data;
      })
      .error(function(err) {
        console.log(err)
      });
    })
    .error(function(err) {
      console.log(err)
    });

    $scope.master = $scope.bill;

    $scope.update = function(bill) {
      var file_path, branch_name, content, commit_message;
      var commitMsg = bill.commitMsg || "Updated at " + Date.now();

      $http.put(gitLabURL + bill.id + '/repository/files' + privateToken, {'id': $scope.bill.id, 'content': $scope.bill.content, 'file_path': $scope.bill.fileName, 'branch_name': 'master', 'commit_message': commitMsg}).success(function(data) {
        console.log("here's what we got back after trying to edit the file via the web api");
        console.log(data);

      $scope.master = angular.copy(bill);
      }).error(function(err) {
        console.log("got an error when trying to update the bill");
        console.log(err);
      });
    };

    $scope.reset = function() {
      $scope.bill = angular.copy($scope.master);
    };

});

// Kanged from https://stackoverflow.com/a/2919363
// function nl2br (str, is_xhtml) {
//   var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
//   return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
// }
function nl2br (str, is_xhtml) {
  var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
  return (str + '').replace(/([^\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
}
