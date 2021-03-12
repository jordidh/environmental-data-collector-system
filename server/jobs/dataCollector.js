/**
 * Created by jordi on 18/11/16.
 */
var schedule = require('node-schedule');
const logger = require('../api/logger');
const config = require('../config/config');
//var http = require('http');
const request = require('request');
const arduinoyun = require('../api/arduinoyun');
const db = require('../api/timeseriesdb');

logger.info(config.jobs.dataCollector.name + " cron planned at " + config.jobs.dataCollector.schedule + " active = " + config.jobs.dataCollector.active);

var j = schedule.scheduleJob(config.jobs.dataCollector.schedule, function() {
    try {
        if (!('active' in config.jobs.dataCollector) || (config.jobs.dataCollector.active === 1)) {
            logger.info('DataCollector JOB Start');

            logger.info("config.dataSources.length = " + config.dataSources.length);

            config.dataSources.forEach(configuredSource => {

                logger.info("requesting data from source " + configuredSource.name);

                if (configuredSource.source.type === "restapi") {
                    // Recuperem les dades del datasource
                    request(configuredSource.source.url, { json: true }, (err, res, body) => {
                        if (err) { return console.log(err); }

                        if (configuredSource.source.format === "json-arduinoyun") {
                            if (body.value && body.key) {
                                logger.info("data received from source " + configuredSource.name + ":" + body.key + "=" + body.value);

                                // Processem les dades obtingudes per obtenir un array amb els valors dels sensor
                                arduinoyun.parseMeteoData(res.body, configuredSource, function(error, parsedData) {
                                    if (err) {
                                        logger.error("Error parsingMeteoData ", err);
                                    } else {
                                        // Guardem les dades
                                        db.save(parsedData, config.jobs.dataCollector, function(err, result) {
                                            if (err) {
                                                logger.error("Error savind data to DB ", err);
                                            }
                                        });
                                    }
                                });
                            } else {
                                logger.error(configuredSource.name + " sensor returns invalid data format, is not json-aduinoyun. " + body);
                            }
                        } else {
                            logger.info(body);
                        }
                    });
                }
            });

            logger.info('DataCollector JOB End');
        } else {
            logger.info('DataCollector JOB disabled');
        }

    } catch (e) {
        logger.error('DataCollector JOB exception: ' + e.message);
    }
});

/*
 Method to get the package version
 */
module.exports.getVersion = function() {
    return "1.0.0";
};