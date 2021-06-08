const express = require('express');
const router= express.Router();

//Bring in Article Model
let {Article} = require('../models/article');
//Bring in User Model
let {User} =require('../models/user')

//add route
router.get('/add', ensureAuthenticated , function(req,res){
  res.render('add_article',{
    title:"add article"
  })
});

//Add submit post route  es
router.post('/add',function(req,res) {

  req.checkBody('title','Title is required').notEmpty();
  //req.checkBody('author','Author is required').notEmpty();
  req.checkBody('body','Body is required').notEmpty();


let errors = req.validationErrors();

if(errors){
  res.render('add_article',{
    title:'Add Article',
    errors:errors
  });
}
else{
  let article= new Article();
  article.title= req.body.title;
  article.author= req.user._id;
  article.body= req.body.body;

  article.save(function(err){
    if(err){
      console.log(err);
      return;
    }
    else{
      req.flash('success','Article added');
      res.redirect('/');
    }
  });
}

});
//load edit form
router.get('/edit/:id', ensureAuthenticated ,function(req,res) {
  Article.findById(req.params.id,function(err,article) {
    if(article.author != req.user._id){
       res.flash('danger','Not Authorized');
       res.redirect('/');
    }

    // console.log(article);
    // return;
    res.render('edit_article',{
      title: 'Edit article',
      article: article
    });
  })
})


//update submit post route  es
router.post('/edit/:id',function(req,res) {
  let article= {};
  article.title= req.body.title;
  article.author= req.body.author;
  article.body= req.body.body;

let query ={_id:req.params.id}

  Article.update(query, article , function(err){
    if(err){
      console.log(err);
      return;
    }
    else{
      req.flash('danger','Article updated');
      res.redirect('/');
    }
  })
});
//Delete Article
router.delete('/:id', async (req, res) => {

  try {
    if (!req.user._id) {
      res.status(500).send();
    }
    let query = { _id: req.params.id }
    const article = await Article.findById(req.params.id);

    if (article.author != req.user._id) {
      res.status(500).send();
    } else {
      remove = await Article.findByIdAndRemove(query);
      if (remove) {
        res.send('Success');
      }
    };
  } catch (e) {
    res.send(e);
  }

});


//get single article
router.get('/:id',function(req,res) {
  Article.findById(req.params.id,function(err,article) {
    User.findById(article.author, function(err,user){
      res.render('article',{
        article:article,
        author: user.name
      });
    })
    // console.log(article);
    // return;

  })
})
//access control
function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated())
  {
    return next();
  }
  else
   {
    req.flash('danger','please Login');
    res.redirect('/users/login')
  }
}
module.exports = router;
