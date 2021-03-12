/**
 * Created by jordi on 12/02/2021
 */
module.exports = {
    jobs: {
        dataCollector: {
            name: 'DataCollector',
            schedule: '0 * * * * *',    // cada minut al segon 0
            active: 1,
            dbPath: './database/'   // acabat amb "/"
        }
    },
    dataSources: [
        {
            id: "string id",
            name: "string name",
            description: "string description",
            location: {
                description: "",
                latitude: 0,
                longitude: 0
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
                url: "http://192.168.1.164/data/get/all"
            }
        }
    ]
}