var express = require('express');
var jwt = require('express-jwt');
var router = express.Router();
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
var passport = require('passport');

var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

router.get('/posts', function(req, res, next){
  console.log("getall-GET");
  Post.find(function(err, posts) {
    if(err){return next(err);}
    res.json(posts);
  });
});

router.post('/posts', auth, function(req, res, next){
  var post = new Post(req.body);
  post.author = req.payload.username;

    console.log('here it is: ');
    console.log(post.author);
    console.log('here it end_______--------______: ');

  post.save(function(err, post){
    if(err){return next(err);}
    res.json(post);
    //console.log(res)
    console.log('here it end_______--------______: ');
    console.log(post.author);
  });
});

// Preload Post objects
router.param('post', function(req, res, next, id){
  var query = Post.findById(id);

  query.exec(function(err, post){
    if(err){return next(err);}
    if (!post) {return next(new Error('can\'t find post'));}
    req.post = post;
    return next();
  });
});

// Preload comment objects on routes with ':comment'
router.param('comment', function(req, res, next, id) {
  var query = Comment.findById(id);

  query.exec(function (err, comment){
    if (err) { return next(err); }
    if (!comment) { return next(new Error("can't find comment")); }

    req.comment = comment;
    return next();
  });
});


router.get('/posts/:post', function(req,res){
  req.post.populate('comments', function(err, post){
    res.json(req.post);
  });
});

// upvote a post
router.put('/posts/:post/upvote', auth, function(req, res, next) {
  req.post.upvote(function(err, post){
    if (err) { return next(err); }

    res.json(post);
  });
});

// upvote a post
router.put('/posts/:post/comments/:comment/upvote', auth, function(req, res, next) {
  req.comment.upvote(function(err, comment){
    if (err) { return next(err); }
    res.json(comment);
  });
});


//post comments
router.post('/posts/:post/comments', auth, function(req, res, next){
  var comment = new Comment(req.body);
  comment.post = req.post;
  comment.author = req.payload.username;

  comment.save(function(err, comment){
    if(err){return next(err);}
    req.post.comments.push(comment);
    req.post.save(function(err, post){
      if(err){return next(err);}
      res.json(comment);
    });
  });
});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

router.post('/register', function (req, res, next) {
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }
  var user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password);

  user.save(function (err) {
    if(err){return next(err);}
    return res.json({token: user.generateJWT()})
  });
});




module.exports = router;
