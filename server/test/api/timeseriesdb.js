const chai = require('chai');
const expect = chai.expect;

const TEST_DBPATH = "./database/test/";

const db = require('../../api/timeseriesdb')

describe("Test timeseriesdb", function() {
    it("Si guardem dades en un fitxer, fem un drop, no ha de quedar cap fitxer al path de la BD", function(done) {
        let config = {
            dbPath : TEST_DBPATH
        };
        let dataToSave = {
            id: "hydra01",
            name: "hydra 01",
            description: "Dispositiu hydra 01",
            location: {
                description: "casa",
                latitude: 0,
                longitude: 0
            },
            measures: [
                { sourceUnit: "temp", unit: "ºC", name: "Temperatura", description: "Temperatura en graus Celsius", value: 25.5 },
                { sourceUnit: "press", unit: "HPa", name: "Pressió", description: "Pressió atmosfèrica en hecto Pascals", value: 1024 },
                { sourceUnit: "alt", unit: "m", name: "Altitud", description: "Altitud sobre el nivell del mar", value: 200 }
            ]
        };

        db.save(dataToSave, config, function(err, result) {
            if (err) {
                console.log(err);
                // Comprovem que err és undefined
                expect(err).to.be.null;
                done();
            } else {
                let date = new Date(); 
                let expectedFileName = date.getUTCFullYear() + date.getUTCMonth().toString().padStart(2, '0') + date.getUTCDate().toString().padStart(2, '0') + ".json";
                let expectedFilePath = TEST_DBPATH + expectedFileName;

                expect(result).is.equal(expectedFilePath);

                db.show(config, function(err, databaseFiles) {
                    if (err) {
                        console.log(err);
                        // Comprovem que err és undefined
                        expect(err).to.be.null;
                        done();
                    } else {
                        expect(databaseFiles).to.be.an('array').that.does.include(expectedFileName);

                        db.drop(config, function(err, data) {
                            if (err) {
                                console.log(err);
                                // Comprovem que err és undefined
                                expect(err).to.be.null;
                                done();
                            } else {
                                db.show(config, function(err, databaseFiles2) {
                                    if (err) {
                                        console.log(err);
                                        // Comprovem que err és undefined
                                        expect(err).to.be.null;
                                        done();
                                    }
                                    else {
                                        expect(databaseFiles2).to.be.an('array').to.deep.equal([]);
                                        done();
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    it("Si guardem dades en un fitxer i el tornem a obrir les dades han de ser les mateixes", function(done) {
        let config = {
            dbPath : TEST_DBPATH
        };
        let dataToSave = {
            id: "hydra01",
            name: "hydra 01",
            description: "Dispositiu hydra 01",
            location: {
                description: "casa",
                latitude: 0,
                longitude: 0
            },
            measures: [
                { sourceUnit: "temp", unit: "ºC", name: "Temperatura", description: "Temperatura en graus Celsius", value: 25.5 },
                { sourceUnit: "press", unit: "HPa", name: "Pressió", description: "Pressió atmosfèrica en hecto Pascals", value: 1024 },
                { sourceUnit: "alt", unit: "m", name: "Altitud", description: "Altitud sobre el nivell del mar", value: 200 }
            ]
        };

        db.save(dataToSave, config, function(err, result) {
            if (err) {
                console.log(err);
                // Comprovem que err és undefined
                expect(err).to.be.null;
                done();
            } else {
                let date = new Date(); 
                let expectedFileName = date.getUTCFullYear() + date.getUTCMonth().toString().padStart(2, '0') + date.getUTCDate().toString().padStart(2, '0') + ".json";
                let expectedFilePath = TEST_DBPATH + expectedFileName;

                //console.log("--->1:", result);
                //console.log("--->1:", expectedFilePath);

                expect(result).is.equal(expectedFilePath);

                db.show(config, function(err, databaseFiles) {
                    if (err) {
                        console.log(err);
                        // Comprovem que err és undefined
                        expect(err).to.be.null;
                        done();
                    } else {
                        expect(databaseFiles).to.be.an('array').that.does.include(expectedFileName);

                        db.load(expectedFileName, config, function(err, data) {
                            if (err) {
                                console.log(err);
                                // Comprovem que err és undefined
                                expect(err).to.be.null;
                                done();
                            } else {
                                expect(data).to.be.an('array').to.deep.include(dataToSave);
                                done();
                            }
                        });
                    }
                });
            }
        });
    });
});