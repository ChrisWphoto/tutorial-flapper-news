angular.module('controllers.myapp', ['post.service'])


.controller('MainCtrl', [
'$scope',
'posts',
'auth',
function($scope, posts, auth){
  $scope.posts = posts.posts

  $scope.addPost = function(newtitle, newLink){
    if (newtitle && newLink){
      posts.create({title: newtitle, link: newLink})
      $scope.title = '';
      $scope.link = '';
    }else {
      alert("your need both")
    }
  };

  $scope.upvote = function(post) {
    posts.upvote(post);
  }
}])

.controller('PostCtrl', function($scope, posts, post, $stateParams){
  $scope.post = post;

  $scope.addComment = function(){
    if($scope.body === '') { return; }
    posts.addComment(post._id, {
      body: $scope.body,
      author: 'user',
    }).success(function(comment) {
      $scope.post.comments.push(comment);
    });
    $scope.body = '';
  };

  $scope.upvoteComment = function (comment) {
    console.log(post);
    console.log(post._id);
    posts.upvoteComment(post, comment);
  }
})

//LOGIN / Register controller
.controller('AuthCtrl', ['$scope','$state','auth',
  function($scope, $state, auth){
  $scope.user = {};

  $scope.register = function(){
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
}])

.controller('NavCtrl', [
'$scope',
'auth',
function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);
