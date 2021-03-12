const logger = require('../api/logger');
const { config } = require('winston');
const querystring = require('querystring');

const fs = require("fs");
const os = require("os");
const path = require('path');

/**
 * Versions
 * 1.0.0 - Funcións per processar les dades rebudes del arduinoyun
 */
const VERSION = '1.0.0';

/**
 * Funció que guarda dades a la BD de series temporals. Es guarden en format json en fitxers.
 * - Guarda una altra copia de les dades en un fitxer de dades històriques (un fitxer per dia)
 * - Els fitxers creats porten com a nom "AAAAMMDD.json"
 * Retorna el path del fitxer a on s'ha guardat
 * @param {*} data : Dades que s'han de guardar, objecte JSON
 *       {
 *           id: configSource.id,
 *           name: configSource.name,
 *           description: configSource.description,
 *           location: configSource.location,
 *           measures: [{
 *                   name: unitFound.name,
 *                   description: unitFound.description,
 *                   unit: unitFound.unit,
 *                   value: receivedValue[key]
 *               }, ...]
 *       }
 * @param {*} config : configuració del timeseriesdb. Propietats:
  *                     - dbPath: ruta a on es guardaran els fitxers de dades, acabat amb "/"
 * @param {*} doneSaving 
 */
exports.save = function(data, config, doneSaving) {
    try {
        // Comprovem els paràmetres d'entrada
        if (typeof data != "object") {
            logger.error("timeseriesdb.save error, receivedData must be an object");
            return doneSaving(new Error("timeseriesdb.save, receivedData must be an object"), null);
        }

        if (typeof config != "object" || config.hasOwnProperty("dbPath") === false) {
            logger.error("timeseriesdb.save error, config must be an object with a property dbPath");
            return doneSaving(new Error("timeseriesdb.save, config must be an object with a property dbPath"), null);
        }

        // Afegim la data actual a les dades (sinó existeix)
        if (!data.hasOwnProperty("timestamp")) {
            data.timestamp = (new Date()).getTime();
        }

        // Guardem les dades a la BD
        let date = new Date(); 
        let path = config.dbPath + date.getUTCFullYear() + date.getUTCMonth().toString().padStart(2, '0') + date.getUTCDate().toString().padStart(2, '0') + ".json";

        fs.appendFileSync(path, JSON.stringify(data) + os.EOL);
        /*
        fs.open(path, 'a', 666, function( e, id ) {
            fs.write( id, JSON.stringify(data) + os.EOL, null, 'utf8', function() {
                fs.close(id, function() {
                    console.log('file is updated');
                });
            });
        });
        */

        doneSaving(null, path);
    } catch (e) {
        logger.error('parseMeteoData exception ' + e.message);
        doneSaving(e, null);
    }
};

/**
 * Funció que carrega dades de la BD de series temporals
 * @param {*} source : origen de les dades que s'ha de carregar. Quan es tracta de dies es carreguen 3 fitxers, el demanat, l'anteriori el posterior
 *                     ja que després s'hauràn d'agafar només les dades segons el timezone demanat que pot ser diferent del guardat als fitxers
 *                     en UTC. 
 * @param {*} config : configuració del timeseriesdb. Propietats:
  *                     - dbPath: ruta a on es guardaran els fitxers de dades
 * @param {*} doneLoading 
 */
exports.load = function(source, config, doneLoading) {
    try {
        // Comprovem els paràmetres d'entrada
        if (typeof config != "object" || config.hasOwnProperty("dbPath") === false) {
            logger.error("timeseriesdb.load error, config must be an object with a property dbPath");
            return doneLoading(new Error("timeseriesdb.load, config must be an object with a property dbPath"), null);
        }

        // Recuperem tots els fitxers
        fs.readdir(config.dbPath, (err, files) => {
            if (err) {
                doneLoading(err, null);
            } else {
                let data = [];
                let lines = "";

                // Ordenem els fitxers alfabèticament
                files.sort();

                //console.log(files);
                //console.log(source);

                // Busquem el fitxer que hem d'obrir i també agafem l'anterior i el següent
                for (let i = 0; i < files.length; i++) {
                    // Els obrim i els fiquema dins d'un array
                    if (files[i] === source) {
                        if (i > 0) {
                            // Obrim l'anterior
                            lines = fs.readFileSync(config.dbPath + files[i - 1], 'utf8');
                            lineArray = lines.split(os.EOL);
                            data = lineArray.filter(l => l.length > 0);  // retornem les línies que no siguin buides
                        }

                        // Obrim l'actual
                        lines = fs.readFileSync(config.dbPath + source, 'utf8');
                        lineArray = lines.split(os.EOL);
                        lineArray = lineArray.filter(l => l.length > 0);  // retornem les línies que no siguin buides
                        data = data.concat(lineArray);

                        if (i < files.length - 1) {
                            // obrim el següent
                            lines = fs.readFileSync(config.dbPath + files[i + 1], 'utf8');
                            lineArray = lines.split(os.EOL);
                            lineArray = lineArray.filter(l => l.length > 0);  // retornem les línies que no siguin buides
                            data = data.concat(lineArray);
                        }

                        //console.log(data);
                        data = data.map(l => JSON.parse(l));

                        //console.log(data);
                    }
                }

                doneLoading(null, data);
            }
        });
    } catch (e) {
        logger.error('parseMeteoData exception ' + e.message);
        doneLoading(e, null);
    }
};

/**
 * Funció que retorna tots els fitxers disponibles de la BD
  * @param {*} config : configuració del timeseriesdb. Propietats:
 *                     - dbPath: ruta a on es guardaran els fitxers de dades
 * @param {*} doneShowing 
 */
exports.show = function(config, doneShowing) {
    try {
        // Comprovem els paràmetres d'entrada
        if (typeof config != "object" || config.hasOwnProperty("dbPath") === false) {
            logger.error("timeseriesdb.show error, config must be an object with a property dbPath");
            return doneShowing(new Error("timeseriesdb.show, config must be an object with a property dbPath"), null);
        }

        fs.readdir(config.dbPath, (err, files) => {
            if (err) {
                return doneShowing(err, null);
            }
            
            doneShowing(null, files);
        });
    } catch (e) {
        logger.error('timeseriesdb.show exception ' + e.message);
        doneShowing(e, null);
    }
};

/**
 * Funció que crea fitxers de resum mensuals, anuals i plurianuals a partir de les dades diàries
 * - El fitxer creat porta com a nom "AAAAMMDD-AAAAMMDD-<TZ>-<nom>.json"
 * - TZ agafa els valors del format https://www.iso.org/iso-8601-date-and-time-format.html
 *   - Z: Zulu time, p.e. 20210221-202010223-Z-sumary1.json
 *   - <+/+>hhmm, u voldir up Z, l:down Z, p.e. 20210221-202010223-0300-sumary1.json, 20210221-202010223+0600-sumary1.json
 * @param {*} dateInit : data inicial
 * @param {*} dateEnd : data final
 * @param {*} interval : interval entre dues dades, s'agafaràn les dades dins de l'interval, 
 *                       es calcularà la mitjana i es guardarà el màxim i mínim
 * @param {*} config : configuració del timeseriesdb. Propietats:
 *                     - dbPath: ruta a on es guardaran els fitxers de dades
 * @param {*} doneSummarizing
 */
exports.summary = function(dataeInit, dateEnd, source, config, doneSummarizing) {
    try {
        // Comprovem els paràmetres d'entrada
        if (typeof receivedData != "object") {
            logger.error("parseMeteoData error, receivedData must be an object");
            return doneSummarizing(new Error("receivedData must be an object"), null);
        }

        if (receivedData.hasOwnProperty("value") === false) {
            logger.error("parseMeteoData error, receivedData must have a property value");
            return doneSummarizing(new Error("receivedData must have a property value"), null);
        }

        if (typeof configSource != "object" || configSource.hasOwnProperty("units") === false || Array.isArray(configSource.units) === false) {
            logger.error("parseMeteoData error, configSource must be an object with a property units array");
            return doneSummarizing(new Error("configSource must be an object with a property units array"), null);
        }

        if (configSource.hasOwnProperty("id") === false) {
            logger.error("parseMeteoData error, configSource must be an object with a property id");
            return doneSummarizing(new Error("configSource must be an object with a property id"), null);
        }

        if (configSource.hasOwnProperty("name") === false) {
            logger.error("parseMeteoData error, configSource must be an object with a property name");
            return doneSummarizing(new Error("configSource must be an object with a property name"), null);
        }

        if (configSource.hasOwnProperty("description") === false) {
            logger.error("parseMeteoData error, configSource must be an object with a property description");
            return doneSummarizing(new Error("configSource must be an object with a property description"), null);
        }

        if (configSource.hasOwnProperty("location") === false) {
            logger.error("parseMeteoData error, configSource must be an object with a property location");
            return doneSummarizing(new Error("configSource must be an object with a property location"), null);
        }

        //console.log(receivedData.value);
        var receivedValue = JSON.parse(querystring.unescape(receivedData.value));

        //console.log(receivedValue);

        var parsedData = {
            id: configSource.id,
            name: configSource.name,
            description: configSource.description,
            location: configSource.location,
            measures: []
        }

        // Per cada valor rebut des de l'arduino es busca si està configurat i si es així es crea el nou objecte.
        Object.keys(receivedValue).forEach(function(key) {
            //console.log('Key : ' + key + ', Value : ' + receivedValue[key]);
            // Busquem si la key està configurada en el sourceUnit de la configuració
            var unitFound = configSource.units.find((unit) => unit.sourceUnit === key);

            //console.log(unitFound);

            if (unitFound) {
                parsedData.measures.push({
                    name: unitFound.name,
                    description: unitFound.description,
                    unit: unitFound.unit,
                    value: receivedValue[key]
                });
            } else {
                logger.error("parseMeteoData error, key " + key + " not found in config object");
            }
        });

        doneSummarizing(null, parsedData);
    } catch (e) {
        logger.error('parseMeteoData exception ' + e.message);
        doneSummarizing(e, null);
    }
};

/**
 * Elimina tots els fitxers de la carpeta
 * @param {*} config 
 * @param {*} doneDroping 
 */
exports.drop = function(config, doneDroping) {
    try {
        if (typeof config != "object" || config.hasOwnProperty("dbPath") === false) {
            logger.error("timeseriesdb.drop error, config must be an object with a property dbPath");
            return doneShowing(new Error("timeseriesdb.drop, config must be an object with a property dbPath"), null);
        }

        fs.readdir(config.dbPath, (err, files) => {
            if (err) {
                return doneDroping(err, null);
            }

            if (files.length === 0) {
                doneDroping(null, 0);
            }

            // Async delete
            files = files.map(f => config.dbPath + f);
            var f = files.pop();

            fs.unlink(f, function(err){
                if (err) {
                    doneDroping(err, null);
                } else {
                   console.log(f + ' deleted.');
                   doneDroping(null, files.length);
                }
            });

            /*
            // Sincronous delete
            for (const file of files) {
                fs.unlinkSync(config.dbPath + file);
            }

            doneDroping(null, files.length);
            */
        });

    } catch (e) {
        logger.error('timeseriesdb.drop exception ' + e.message);
        doneDroping(e, null);
    }
};