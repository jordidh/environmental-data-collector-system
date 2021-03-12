var express = require('express');
var router = express.Router();
const config = require('../config/config');

/** GET home page. 
 * Mostra la pàgina principal,llistat de dispositius configurats
 */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Air Quality Station', sources: config.dataSources });
});

/**
 * Recupera les dades d'avui del dispositiu sel·leccionat i les mostra en una gràfica
 * Permet triar dades d'altres dies, de setmanes (interval horari), de mesos (interval diari) o d'anys (interval diari)
 */
router.get('/grafiques/:id', function(req, res, next) {
  
  // TODO

  // Recupera les dades actuals i les mostra en una gràfica

  // 

  res.render('index', { title: 'Air Quality Station', sources: config.dataSources });
});


module.exports = router;
