var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var engines = require('consolidate');
var bodyParser = require('body-parser');
var async = require('async');
var app     = express();




//connect to mongo db


var Job = require("../model/job");

//scrapping module:
function scrapp(req, res,callback){

//mongoose.connect('mongodb://localhost:8081/my_database');
var pages = [];
var source = 'http://remixjobs.com';

for (var i=0; i < 2; i++) {
  pages.push('http://remixjobs.com/?page=' +i+"&in=all");
}

for (var page in pages) {
    
  request(pages[page], (function(page) { return function(error, resp, body) {
        if (!error) {
            var $ = cheerio.load(body);
            var urls = [];
            $('.job-link').each(function() {
              urls.push(source + $(this).attr('href'));
              });
            for (var url in urls) {
              request(urls[url], (function(url) {
                 return function(error, resp, jobpage) {
                 var $ = cheerio.load(jobpage);
                 try {
                    if (!error) {                                      
                    if ($('.job-title h1').text() !== "") {
                      // 1. Créer le document en json
                      var document = new Job();
                      var urlSplit = urls[url].split('/');                      
                      document.id = urlSplit[urlSplit.length-1];// on prend le dernier du tableau
                      document.title =  $('.job-title h1').text();
                      var temp = $('.job-infos li').text();
                                 
                      temp = temp.replace(/\r?\n|\r/g,"");
                      temp = temp.split(' ').join('');
                      temp = temp.split(',');
                      document.company =temp[0];
                       
                      if (temp[1].indexOf("minutes") >= 0 || temp[1].indexOf("heures") >= 0 || temp[1].indexOf("heure") >= 0) {
                        document.date = new Date();
                      }
                      else if(temp[1]!=""){
                                  var numberPattern = /\d+/g;
                                  var numbers=temp[1].match( numberPattern );
                                  var day=numbers[0];
                                  var string_day="";
                                  if(day<10)
                                    string_day='0'+day;
                                  else
                                    string_day=day;
                                  var year=numbers[1];
                                  var month=temp[1].replace(/[0-9]/g, '');
                                  month=month.replace('.', '');
                                  switch (month) {
                                  case "jan":
                                    month = "01";
                                    break;
                                  case "fev":
                                    month = "02";
                                    break;
                                  case "févr":
                                    month = "02";
                                    break;
                                  case "mars":
                                    month = "03";
                                    break;
                                  case "avr":
                                    month = "04";
                                    break;
                                  case "mai":
                                    month = "05";
                                    break;
                                  case "juin":
                                    month = "06";
                                    break;
                                  case "juil":
                                    month = "07";
                                    break;
                                  case "août":
                                    month = "08";
                                    break;
                                  case "sept":
                                    month = "09";
                                    break;
                                  case "oct":
                                    month = "10";
                                    break;
                                  case "nov":
                                    month = "11";
                                    break;
                                  case "déc":
                                    month = "12";
                                    break;
                                  }
                                  document.date = Date.parse(year+'-'+month+'-'+string_day);
                                  console.log('final date: '+document.date);
                      }
                                  else
                                  {
                                    document.date = new Date();
                                    //console.log('oooooooooooof');
                                  }
                      //document.date =temp[1];
                      document.contrat =temp[2];
                      document.ville =temp[3];
                      var tempstags= [];
                      document.categorie=urlSplit[urlSplit.length-3];
                      $('.tags-occupation li a').each(function(){tempstags.push($(this).text())});
                      
                      for(var tag in tempstags)
                      {
                         tempstags[tag] = tempstags[tag].replace(/\r?\n|\r/g,"");
                         tempstags[tag] = tempstags[tag].split(' ').join('');                        
                      }
                      document.tags= tempstags;
                      var description= $('.job-description').text();
                      description = description.replace(/\r?\n|\r/g,"");
                      document.description= description;
                      document.url = urls[url];
                      // 2. ajouter dans mongo
                      document.save(function(err) {
                        if (err)
                                    res.send(err);
                        //res.json({ message: 'Job added!' });
                      });
                      
                      
                      
                      // 3. Sauvegarder document
                      console.log(document);
                                                                  
                   } else {
                     //console.log(jobpage);
                   }
                   }
                 } catch(err) {
                   console.log(err);
                   
                 }
                   
                }
                                  
               })(url))
                        
            }              
            //console.log('je scrappe https://remixjobs.com/?page=' + page);
        } else {
          console.log(body);
        }
                        
       }})(page));
    
    }
    
}
//mongoose.connection.close();
exports.scrapp=scrapp;


/*
 //test for having all jobs -> OK
 Job.find({}, function(err, jobs) {
 if (err) throw err;
 
 // object of all the jobs
 console.log(jobs);
 });
 */