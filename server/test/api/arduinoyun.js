const chai = require('chai');
const expect = chai.expect;

const arduinoyun = require('../../api/arduinoyun')

describe("Test algoritme parseig de dades meteorlogògiques rebudes de arduinoyun", function() {
    it("Si les dades rebudes són un string hem de donar error", function(done) {
        var receivedData = "";
        var configSource = {};

        arduinoyun.parseMeteoData(receivedData, configSource, function(err, parsedData) {
            // Comprovem que err és undefined
            expect(err.message).to.eql("receivedData must be an object");
            done();
        });
    });

    it("Si les dades rebudes són un objecte json sense la propietat value hem de donar error", function(done) {
        var receivedData = { "a":"b" };
        var configSource = {};

        arduinoyun.parseMeteoData(receivedData, configSource, function(err, parsedData) {
            // Comprovem que err és undefined
            expect(err.message).to.eql("receivedData must have a property value");
            done();
        });
    });

    it("Si les dades de configuració són un string hem de donar error", function(done) {
        var receivedData = {
            "value":"{\"temp\":19.80, \"press\":1020.39, \"alt\":-0.50, \"gasvolt\":0.39, \"gasrs\":11.96, \"gasratio\":10.44, \"air\":3, \"dust\":373.34, \"dustugm3\":0.58, \"dustppmv\":0.00}",
            "key":"all",
            "response":"get"
        };
        var configSource = "";

        arduinoyun.parseMeteoData(receivedData, configSource, function(err, parsedData) {
            // Comprovem que err és undefined
            expect(err.message).to.eql("configSource must be an object with a property units array");
            done();
        });
    });

    it("Si les dades de configuració no tenen la propietat id hem de donar error", function(done) {
        var receivedData = {
            "value":"{\"temp\":19.80, \"press\":1020.39, \"alt\":-0.50, \"gasvolt\":0.39, \"gasrs\":11.96, \"gasratio\":10.44, \"air\":3, \"dust\":373.34, \"dustugm3\":0.58, \"dustppmv\":0.00}",
            "key":"all",
            "response":"get"
        };
        var configSource = {
            units: []
        };

        arduinoyun.parseMeteoData(receivedData, configSource, function(err, parsedData) {
            // Comprovem que err és undefined
            expect(err.message).to.eql("configSource must be an object with a property id");
            done();
        });
    });

    it("Si les dades de configuració no tenen la propietat name hem de donar error", function(done) {
        var receivedData = {
            "value":"{\"temp\":19.80, \"press\":1020.39, \"alt\":-0.50, \"gasvolt\":0.39, \"gasrs\":11.96, \"gasratio\":10.44, \"air\":3, \"dust\":373.34, \"dustugm3\":0.58, \"dustppmv\":0.00}",
            "key":"all",
            "response":"get"
        };
        var configSource = {
            id: 0,
            units: []
        };

        arduinoyun.parseMeteoData(receivedData, configSource, function(err, parsedData) {
            // Comprovem que err és undefined
            expect(err.message).to.eql("configSource must be an object with a property name");
            done();
        });
    });

    it("Si les dades de configuració no tenen la propietat description hem de donar error", function(done) {
        var receivedData = {
            "value":"{\"temp\":19.80, \"press\":1020.39, \"alt\":-0.50, \"gasvolt\":0.39, \"gasrs\":11.96, \"gasratio\":10.44, \"air\":3, \"dust\":373.34, \"dustugm3\":0.58, \"dustppmv\":0.00}",
            "key":"all",
            "response":"get"
        };
        var configSource = {
            id: 0,
            name: "",
            units: []
        };

        arduinoyun.parseMeteoData(receivedData, configSource, function(err, parsedData) {
            // Comprovem que err és undefined
            expect(err.message).to.eql("configSource must be an object with a property description");
            done();
        });
    });

    it("Si les dades de configuració no tenen la propietat location hem de donar error", function(done) {
        var receivedData = {
            "value":"{\"temp\":19.80, \"press\":1020.39, \"alt\":-0.50, \"gasvolt\":0.39, \"gasrs\":11.96, \"gasratio\":10.44, \"air\":3, \"dust\":373.34, \"dustugm3\":0.58, \"dustppmv\":0.00}",
            "key":"all",
            "response":"get"
        };
        var configSource = {
            id: 0,
            name: "",
            description:"",
            units: []
        };

        arduinoyun.parseMeteoData(receivedData, configSource, function(err, parsedData) {
            // Comprovem que err és undefined
            expect(err.message).to.eql("configSource must be an object with a property location");
            done();
        });
    });

    it("Si rebem dades de diferents sensors d'un sol yun s'han de parsejar correctament, camps de value delimitats per \\\"", function(done) {
        var receivedData = {
            "value":"{\"temp\":19.80, \"press\":1020.39, \"alt\":-0.50, \"gasvolt\":0.39, \"gasrs\":11.96, \"gasratio\":10.44, \"air\":3, \"dust\":373.34, \"dustugm3\":0.58, \"dustppmv\":0.00}",
            "key":"all",
            "response":"get"
        };
        //{"value":"{\u0022temp\u0022:19.80, \u0022press\u0022:1023.12, \u0022alt\u0022:-0.66, \u0022gasvolt\u0022:0.50, \u0022gasrs\u0022:8.94, \u0022gasratio\u0022:9.91, \u0022air\u0022:-1, \u0022dust\u0022:251.20, \u0022dustugm3\u0022:0.39, \u0022dustppmv\u0022:0.00}","key":"all","response":"get"}
        var configSource = {
            id: "minairo01",
            name: "Minairó-meteo01",
            description: "Sensor combinat de temp, press, alt, gas, aire, partícules",
            location: {
                description: "Lluria 98",
                latitude: 41.395687425472,
                longitude: 2.1656673100194874
            },
            units: [
                { sourceUnit: "temp", unit: "ºC", name: "Temperatura", description: "Temperatura en graus Celsius"},
                { sourceUnit: "press", unit: "HPa", name: "Pressió", description: "Pressió atmosfèrica en hecto Pascals"},
                { sourceUnit: "alt", unit: "m", name: "Altitud", description: "Altitud sobre el nivell del mar"},
                { sourceUnit: "gasvolt", unit: "volts", name: "Gas v.", description: "Detecta: CO, CH4 i LPG (gas liquat del petroli, p.e. propà i butà), concentracions des de 200 ppm fins a 1000, 10000 i 10000 ppm"},
                { sourceUnit: "gasrs", unit: "Rs", name: "Gas Rs", description: "Detecta: CO, CH4 i LPG (gas liquat del petroli, p.e. propà i butà), concentracions des de 200 ppm fins a 1000, 10000 i 10000 ppm"},
                { sourceUnit: "gasratio", unit: "Rs/R0", name: "Gas ratio", description: "Detecta: CO, CH4 i LPG (gas liquat del petroli, p.e. propà i butà), concentracions des de 200 ppm fins a 1000, 10000 i 10000 ppm"},
                { sourceUnit: "air", unit: "", name: "Qualitat", description: "Qualitat de l'aire"},
                { sourceUnit: "dust", unit: "pcs/0.01cf", name: "Partícules", description: "Concentració de partícules a l'aire superiors a 1 micròmetre per 0.01 peus cúbics"},
                { sourceUnit: "dustugm3", unit: "ug/m3", name: "Partícules", description: "Concentració de partícules a l'aire superiors a 1 micròmetre per metre cúbic"},
                { sourceUnit: "dustppmv", unit: "ppm/v", name: "Partícules", description: "Concentració de partícules a l'aire superiors a 1 micròmetre per parts per milió en volum"}
            ],
            source: {
                type: "restapi",
                format: "json-arduinoyun",  // { value: "78", key: "var", response: "get" }
                url: "http://192.168.1.143/data/get/all"
            }
        };
        var expectedParsedData = {
            id: "minairo01",
            name: "Minairó-meteo01",
            description: "Sensor combinat de temp, press, alt, gas, aire, partícules",
            location: {
                description: "Lluria 98",
                latitude: 41.395687425472,
                longitude: 2.1656673100194874
            },
            measures: [
                {
                    name: "Temperatura",
                    description: "Temperatura en graus Celsius",
                    unit: "ºC",
                    value: 19.80
                },
                {
                    name: "Pressió",
                    description: "Pressió atmosfèrica en hecto Pascals",
                    unit: "HPa",
                    value: 1020.39
                },
                {
                    name: "Altitud",
                    description: "Altitud sobre el nivell del mar",
                    unit: "m",
                    value: -0.50
                },
                {
                    name: "Gas v.",
                    description: "Detecta: CO, CH4 i LPG (gas liquat del petroli, p.e. propà i butà), concentracions des de 200 ppm fins a 1000, 10000 i 10000 ppm",
                    unit: "volts",
                    value: 0.39
                },
                {
                    name: "Gas Rs",
                    description: "Detecta: CO, CH4 i LPG (gas liquat del petroli, p.e. propà i butà), concentracions des de 200 ppm fins a 1000, 10000 i 10000 ppm",
                    unit: "Rs",
                    value: 11.96
                },
                {
                    name: "Gas ratio",
                    description: "Detecta: CO, CH4 i LPG (gas liquat del petroli, p.e. propà i butà), concentracions des de 200 ppm fins a 1000, 10000 i 10000 ppm",
                    unit: "Rs/R0",
                    value: 10.44
                },
                {
                    name: "Qualitat",
                    description: "Qualitat de l'aire",
                    unit: "",
                    value: 3
                },
                {
                    name: "Partícules",
                    description: "Concentració de partícules a l'aire superiors a 1 micròmetre per 0.01 peus cúbics",
                    unit: "pcs/0.01cf",
                    value: 373.34
                },
                {
                    name: "Partícules",
                    description: "Concentració de partícules a l'aire superiors a 1 micròmetre per metre cúbic",
                    unit: "ug/m3",
                    value: 0.58
                },
                {
                    name: "Partícules",
                    description: "Concentració de partícules a l'aire superiors a 1 micròmetre per parts per milió en volum",
                    unit: "ppm/v",
                    value: 0.00
                }
            ]
        };

        arduinoyun.parseMeteoData(receivedData, configSource, function(err, parsedData) {

//console.log(parsedData);

            // Comprovem que err és undefined
            expect(err).to.be.null;

            // Comprovem que parsedData es correspon amb els valors esperats
            expect(parsedData).to.eql(expectedParsedData);

            done();
        });
    });

    it("Si rebem dades de diferents sensors d'un sol yun s'han de parsejar correctament, camps de value delimitats per \\u0022", function(done) {
        var receivedData = {
            //"value":"{\"temp\":19.80, \"press\":1020.39, \"alt\":-0.50, \"gasvolt\":0.39, \"gasrs\":11.96, \"gasratio\":10.44, \"air\":3, \"dust\":373.34, \"dustugm3\":0.58, \"dustppmv\":0.00}",
            "value":"{\u0022temp\u0022:19.80, \u0022press\u0022:1023.12, \u0022alt\u0022:-0.66, \u0022gasvolt\u0022:0.50, \u0022gasrs\u0022:8.94, \u0022gasratio\u0022:9.91, \u0022air\u0022:-1, \u0022dust\u0022:251.20, \u0022dustugm3\u0022:0.39, \u0022dustppmv\u0022:0.00}",
            "key":"all",
            "response":"get"
        };
        var configSource = {
            id: "minairo01",
            name: "Minairó-meteo01",
            description: "Sensor combinat de temp, press, alt, gas, aire, partícules",
            location: {
                description: "Lluria 98",
                latitude: 41.395687425472,
                longitude: 2.1656673100194874
            },
            units: [
                { sourceUnit: "temp", unit: "ºC", name: "Temperatura", description: "Temperatura en graus Celsius"},
                { sourceUnit: "press", unit: "HPa", name: "Pressió", description: "Pressió atmosfèrica en hecto Pascals"},
                { sourceUnit: "alt", unit: "m", name: "Altitud", description: "Altitud sobre el nivell del mar"},
                { sourceUnit: "gasvolt", unit: "volts", name: "Gas v.", description: "Detecta: CO, CH4 i LPG (gas liquat del petroli, p.e. propà i butà), concentracions des de 200 ppm fins a 1000, 10000 i 10000 ppm"},
                { sourceUnit: "gasrs", unit: "Rs", name: "Gas Rs", description: "Detecta: CO, CH4 i LPG (gas liquat del petroli, p.e. propà i butà), concentracions des de 200 ppm fins a 1000, 10000 i 10000 ppm"},
                { sourceUnit: "gasratio", unit: "Rs/R0", name: "Gas ratio", description: "Detecta: CO, CH4 i LPG (gas liquat del petroli, p.e. propà i butà), concentracions des de 200 ppm fins a 1000, 10000 i 10000 ppm"},
                { sourceUnit: "air", unit: "", name: "Qualitat", description: "Qualitat de l'aire"},
                { sourceUnit: "dust", unit: "pcs/0.01cf", name: "Partícules", description: "Concentració de partícules a l'aire superiors a 1 micròmetre per 0.01 peus cúbics"},
                { sourceUnit: "dustugm3", unit: "ug/m3", name: "Partícules", description: "Concentració de partícules a l'aire superiors a 1 micròmetre per metre cúbic"},
                { sourceUnit: "dustppmv", unit: "ppm/v", name: "Partícules", description: "Concentració de partícules a l'aire superiors a 1 micròmetre per parts per milió en volum"}
            ],
            source: {
                type: "restapi",
                format: "json-arduinoyun",  // { value: "78", key: "var", response: "get" }
                url: "http://192.168.1.143/data/get/all"
            }
        };
        var expectedParsedData = {
            id: "minairo01",
            name: "Minairó-meteo01",
            description: "Sensor combinat de temp, press, alt, gas, aire, partícules",
            location: {
                description: "Lluria 98",
                latitude: 41.395687425472,
                longitude: 2.1656673100194874
            },
            measures: [
                {
                    name: "Temperatura",
                    description: "Temperatura en graus Celsius",
                    unit: "ºC",
                    value: 19.80
                },
                {
                    name: "Pressió",
                    description: "Pressió atmosfèrica en hecto Pascals",
                    unit: "HPa",
                    value: 1023.12
                },
                {
                    name: "Altitud",
                    description: "Altitud sobre el nivell del mar",
                    unit: "m",
                    value: -0.66
                },
                {
                    name: "Gas v.",
                    description: "Detecta: CO, CH4 i LPG (gas liquat del petroli, p.e. propà i butà), concentracions des de 200 ppm fins a 1000, 10000 i 10000 ppm",
                    unit: "volts",
                    value: 0.50
                },
                {
                    name: "Gas Rs",
                    description: "Detecta: CO, CH4 i LPG (gas liquat del petroli, p.e. propà i butà), concentracions des de 200 ppm fins a 1000, 10000 i 10000 ppm",
                    unit: "Rs",
                    value: 8.94
                },
                {
                    name: "Gas ratio",
                    description: "Detecta: CO, CH4 i LPG (gas liquat del petroli, p.e. propà i butà), concentracions des de 200 ppm fins a 1000, 10000 i 10000 ppm",
                    unit: "Rs/R0",
                    value: 9.91
                },
                {
                    name: "Qualitat",
                    description: "Qualitat de l'aire",
                    unit: "",
                    value: -1
                },
                {
                    name: "Partícules",
                    description: "Concentració de partícules a l'aire superiors a 1 micròmetre per 0.01 peus cúbics",
                    unit: "pcs/0.01cf",
                    value: 251.20
                },
                {
                    name: "Partícules",
                    description: "Concentració de partícules a l'aire superiors a 1 micròmetre per metre cúbic",
                    unit: "ug/m3",
                    value: 0.39
                },
                {
                    name: "Partícules",
                    description: "Concentració de partícules a l'aire superiors a 1 micròmetre per parts per milió en volum",
                    unit: "ppm/v",
                    value: 0.00
                }
            ]
        };

        arduinoyun.parseMeteoData(receivedData, configSource, function(err, parsedData) {

//console.log(parsedData);

            // Comprovem que err és undefined
            expect(err).to.be.null;

            // Comprovem que parsedData es correspon amb els valors esperats
            expect(parsedData).to.eql(expectedParsedData);

            done();
        });
    });
});