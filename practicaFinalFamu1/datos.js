
var medicos =[
    {id:1,nombre:"DR. QUINTANA",login:"f",pass:"f"},
    {id:2,nombre:"DR. JIMENEZ",login:"j",pass:"j"},
    {id:3,nombre:"DR. MELENDEZ",login:"a",pass:"a"}
];
var pacientes = [
    {id:1, nombre:"FERNANDO A",fecha_nacim:"2022-04-18",genero:"M",medicoID:1, codigo_acceso:"a",observaciones:"ANALISIS DE SANGRE URGENTE"},
    {id:2, nombre:"JUANJO",fecha_nacim:"2022-04-18",genero:"M",medicoID:1, codigo_acceso:"b",observaciones:"ANEMIA"},
    {id:3, nombre:"GINES",fecha_nacim:"2022-04-18",genero:"M",medicoID:3, codigo_acceso:"c",observaciones:"ok"},
    {id:4, nombre:"ENRIQUE",fecha_nacim:"2022-04-18",genero:"M",medicoID:1, codigo_acceso:"d",observaciones:"ok"},
    {id:5, nombre:"JUANFRAN",fecha_nacim:"2022-04-18",genero:"M",medicoID:3, codigo_acceso:"ae",observaciones:"ok"}
];
var variables=[
    {id:1,nombre:"peso"},
    {id:2,nombre:"metros"},
    {id:3,nombre:"minutosEjercicio"},
    {id:4,nombre:"ritmoCardiaco"},
    {id:5,nombre:"pasos"},
    {id:6,nombre:"caloriasQuemadas"},
    {id:7,nombre:"energiaReposo"},
    {id:8,nombre:"horasSueno"},
];

//se han puesto todas las muestras con pacienteID=1 porque siempre s ehace login con este paciente 
//para hacer las pruebas necesarias
var muestras=[
    {idMuestra:1,pacienteID:1,variable:1,fecha:"2022-04-18",valor:70},
    {idMuestra:2,pacienteID:1,variable:1,fecha:"2022-04-18",valor:65},
    {idMuestra:3,pacienteID:1,variable:1,fecha:"2022-04-18",valor:900000},
    {idMuestra:4,pacienteID:1,variable:2,fecha:"2022-04-18",valor:1200},
    {idMuestra:5,pacienteID:1,variable:2,fecha:"2022-04-18",valor:1400},
    {idMuestra:6,pacienteID:1,variable:3,fecha:"2022-04-18",valor:3000},
    {idMuestra:7,pacienteID:2,variable:3,fecha:"2022-04-18",valor:60},
    {idMuestra:8,pacienteID:4,variable:4,fecha:"2022-04-18",valor:1},
    {idMuestra:9,pacienteID:1,variable:4,fecha:"2022-04-18",valor:1},
    {idMuestra:10,pacienteID:1,variable:5,fecha:"2022-04-18",valor:1},
    {idMuestra:11,pacienteID:1,variable:5,fecha:"2022-04-18",valor:1},
    {idMuestra:12,pacienteID:1,variable:6,fecha:"2022-04-18",valor:1},
    {idMuestra:13,pacienteID:1,variable:7,fecha:"2022-04-18",valor:1},
    {idMuestra:14,pacienteID:1,variable:8,fecha:"2022-04-18",valor:1},

    {idMuestra:15,pacienteID:3,variable:1,fecha:"2022-04-18",valor:70},
    {idMuestra:16,pacienteID:3,variable:1,fecha:"2022-04-18",valor:65},
    {idMuestra:17,pacienteID:3,variable:1,fecha:"2022-04-18",valor:78},
    {idMuestra:18,pacienteID:3,variable:2,fecha:"2022-04-18",valor:1200},
    {idMuestra:19,pacienteID:3,variable:2,fecha:"2022-04-18",valor:1400},
    {idMuestra:20,pacienteID:3,variable:2,fecha:"2022-04-18",valor:3000},
    {idMuestra:21,pacienteID:3,variable:4,fecha:"2022-04-18",valor:60}
];

module.exports.pacientes=pacientes;
module.exports.medicos=medicos;
module.exports.variables=variables;
module.exports.muestras=muestras;