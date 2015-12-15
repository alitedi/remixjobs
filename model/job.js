var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost:27017/remixjobs');

var Job = new Schema({
  id: String,
  title: String,
  company: String,
  ville: String,
  date: Date,
  contrat: String,
  category: String,
  tags: [String],
  description: String,
  url: String
});

module.exports = mongoose.model('Job', Job);
