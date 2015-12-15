

var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var engines = require('consolidate');
var async = require('async');
var app     = express();
var mongoose = require('mongoose');
var monscrap = require('./scrap');

var bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost/remixjobs');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
        });

app.set('views','public');
app.engine('html', engines.mustache);
app.set('view engine', 'html');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}))
app.use(express.static('public'))
app.get('/scrap', function(req, res) {
        monscrap.scrapp(req, res, function(req, res){
                        res.send('COOL')
                        });
        });

app.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var Job = require("../model/job");
var router = express.Router();
app.use('/api', router);

//EMPTY API FOR TESTING
router.get('/', function(req, res) {
           res.json({ message: 'CORRECTLY CONNECTED TO API :)' });
           });

//JOBS HAS TWO POST AND GET
router.route('/jobs')
.post(function(req, res) {      //Create a new job
      
      var job = new Job();		// create a new instance
      job.title = req.body.title;
      job.company = req.body.company;
      job.ville = req.body.ville;
      job.category = req.body.category;
      job.description = req.body.description;
      job.contrat = req.body.contrat;
      job.date = req.body.date;
      job.tags = req.body.tags;
      job.id=req.body.id;
      job.save(function(err) {
               if (err)
                res.send(err);
               
               res.json({ message: 'Job has been created!' });
               
               });
      
      })
.get(function(req, res) {       //Return all jobs
          Job.find(function(err, jobs) {
              if (err)
                res.send(err);
              res.json(jobs);
              });
     });
//and post for adding new job

router.route('/jobs/:parameters')
    .post(function(req, res) {      //Update a jobs
                    Job.findById(req.params.parameters, function(err, job) {
                        if (err)
                            res.send(err);
                        // change the users location
                        job.title = req.body.title;             //change
                        job.company = req.body.company;
                        job.ville = req.body.ville;
                        job.category = req.body.category;
                        job.description = req.body.description;
                        job.contrat = req.body.contrat;
                        job.date = req.body.date;
                        job.tags = req.body.tags;
                        job.id=req.body.id;
                        // save the user
                        job.save(function(err) {
                                 if (err)
                                    res.send(err);
                                  
                                  console.log('Job successfully updated!');
                                  });
            });
          })
    .get(function(req, res) {
         if(req.params.parameters == "latest")
         {
         
         var query = Job.find({});
         //sort DESC by date
         query.sort({date : -1});
         //only 10 last
         query.limit(10);
         query.exec(function(err, job) {            //Return all jobs of the current day
                    if (err)
                        res.send(err);
                    res.json(job);
                    });
         }
         else           //Return information of a job -> Find By Job Id
         {
         
         Job.findById(req.params.parameters, function(err, job) {  //example : 566f5304985c16f302dec238
                      if (err)
                        res.send(err);
                      res.json(job);
                      console.log(job);
                       });
         }
     });




router.route('/companies')
.get(function(req, res) {
     if(req.query.company)
     {
					var query = Job.find({});
					query.where("company" , req.query.company);
					query.exec(function(err, job) {
                               if (err)
                               res.send(err);
                               res.json(job);
                               });
     }
     else {
					Job.aggregate([{$group : { _id : "$company", count : {$sum : 1} }}, {$sort : { count : -1 }}]).exec(function(err, job)
                    {
                          if (err)
                                  res.send(err);
                          res.json(job);
                     });
     }
     });






