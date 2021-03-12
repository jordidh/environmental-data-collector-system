const logger = require('../api/logger');
const { config } = require('winston');
const querystring = require('querystring');

/**
 * Versions
 * 1.0.0 - Funcións per processar les dades rebudes del arduinoyun
 */
const VERSION = '1.0.0';

/**
 * 
 * @param {*} receivedData : Dades rebudes des de l'arduinoyun. Han de ser del tipus { <unitat>: <valor> }
 *  Ex: {"value":"{temp:19.80, press:1020.39, alt:-0.50, gasvolt:0.39, gasrs:11.96, gasratio:10.44, air:3, dust:373.34, dustugm3:0.58, dustppmv:0.00}","key":"all","response":"get"}
 * @param {*} configSource : Configuració per tal d'extreure les dades rebudes i convertir-les en objectes separats. Ha de ser un objecte amb un array amb <unitat rebuda>: <unitat>
 *  Ex: {
 *         id: "minairo01",
 *         name: "Minairó-meteo01",
 *         description: "Sensor combinat de temp, press, alt, gas, aire, partícules",
 *         location: {
 *            description: "",
 *            latitude: 0,
 *            longitude: 0
 *         },
 *         units: [
 *           { sourceUnit: "temp", unit: "ºC", name: "Temperatura", description: "Temperatura en graus Celsius"},
 *           { sourceUnit: "press", unit: "HPa", name: "Pressió", description: "Pressió atmosfèrica en hecto Pascals"},
 *           { sourceUnit: "alt", unit: "m", name: "Altitud", description: "Altitud sobre el nivell del mar"},
 *           { sourceUnit: "gasvolt", unit: "volts", name: "Gas v.", description: "Detecta: CO, CH4 i LPG (gas liquat del petroli, p.e. propà i butà), concentracions des de 200 ppm fins a 1000, 10000 i 10000 ppm"},
 *           { sourceUnit: "gasrs", unit: "Rs", name: "Gas Rs", description: "Detecta: CO, CH4 i LPG (gas liquat del petroli, p.e. propà i butà), concentracions des de 200 ppm fins a 1000, 10000 i 10000 ppm"},
 *           { sourceUnit: "gasratio", unit: "Rs/R0", name: "Gas ratio", description: "Detecta: CO, CH4 i LPG (gas liquat del petroli, p.e. propà i butà), concentracions des de 200 ppm fins a 1000, 10000 i 10000 ppm"},
 *           { sourceUnit: "air", unit: "", name: "", description: "Qualitat de l'aire"},
 *           { sourceUnit: "dust", unit: "pcs/0.01cf", name: "Partícules", description: "Concentració de partícules a l'aire superiors a 1 micròmetre per 0.01 peus cúbics"},
 *           { sourceUnit: "dustugm3", unit: "ug/m3", name: "Partícules", description: "Concentració de partícules a l'aire superiors a 1 micròmetre per metre cúbic"},
 *           { sourceUnit: "dustppmv", unit: "ppm/v", name: "Partícules", description: "Concentració de partícules a l'aire superiors a 1 micròmetre per parts per milió en volum"}
 *         ]
 *      }
 * Retorna: doneParsingMethod(err, parsedData)
 * parsedData: Objecte amb dades del arduinoyun i de les mesures preses
 * Ex: {
 *   name: nom del dispositiu
 *   description: descripció del dispositiu
 *   measures: [ {
 *       name: unitFound.name,
 *       description: unitFound.description,
 *       unit: unitFound.unit,
 *       value: receivedValue[key]
 *     }, ...
 *   ]
 * }
 */
exports.parseMeteoData = function(receivedData, configSource, doneParsingMeteoData) {
    try {
        // Comprovem els paràmetres d'entrada
        if (typeof receivedData != "object") {
            logger.error("parseMeteoData error, receivedData must be an object");
            return doneParsingMeteoData(new Error("receivedData must be an object"), null);
        }

        if (receivedData.hasOwnProperty("value") === false) {
            logger.error("parseMeteoData error, receivedData must have a property value");
            return doneParsingMeteoData(new Error("receivedData must have a property value"), null);
        }

        if (typeof configSource != "object" || configSource.hasOwnProperty("units") === false || Array.isArray(configSource.units) === false) {
            logger.error("parseMeteoData error, configSource must be an object with a property units array");
            return doneParsingMeteoData(new Error("configSource must be an object with a property units array"), null);
        }

        if (configSource.hasOwnProperty("id") === false) {
            logger.error("parseMeteoData error, configSource must be an object with a property id");
            return doneParsingMeteoData(new Error("configSource must be an object with a property id"), null);
        }

        if (configSource.hasOwnProperty("name") === false) {
            logger.error("parseMeteoData error, configSource must be an object with a property name");
            return doneParsingMeteoData(new Error("configSource must be an object with a property name"), null);
        }

        if (configSource.hasOwnProperty("description") === false) {
            logger.error("parseMeteoData error, configSource must be an object with a property description");
            return doneParsingMeteoData(new Error("configSource must be an object with a property description"), null);
        }

        if (configSource.hasOwnProperty("location") === false) {
            logger.error("parseMeteoData error, configSource must be an object with a property location");
            return doneParsingMeteoData(new Error("configSource must be an object with a property location"), null);
        }

        //console.log(receivedData.value);
        var receivedValue = JSON.parse(querystring.unescape(receivedData.value));

        //console.log(receivedValue);

        var parsedData = {
            id: configSource.id,
            name: configSource.name,
            description: configSource.description,
            location: configSource.location,
            timestamp: Math.floor(new Date().getTime()),  // epoch time in milliseconds
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

        doneParsingMeteoData(null, parsedData);
    } catch (e) {
        logger.error('parseMeteoData exception ' + e.message);
        doneParsingMeteoData(e, null);
    }
};