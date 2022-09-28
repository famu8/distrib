// SERVIDOR REST
var express = require("express");
var app = express();
//creacion de la app
app.use("/cliente", express.static("cliente"));
app.use("/paciente", express.static("paciente"));

app.use(express.json()); // en el req.body tengamos el body JSON
//sentencias necesarias para crear la zona rpc del servidor 
//var servidor = rpc.server();
//var app = servidor.createApp("MiGestionPacientes");
//var rpc = require("./rpc.js");



//CONEXION AL SERVIDOR DE BBDD
const mysql = require('mysql');
const basedatos = {
    host: 'localhost', 
    user: 'famu1', 
    password: 'famu123', 
    database: 'teoria_telemedicina'
}
var connection = mysql.createConnection(basedatos);
connection.connect((err)=>{
    if(err){console.error('Error conectando a la bbdd: ', err);
        process.exit();
    }else{console.log('Conectado correctamente a servidor de bbdd')}
});
















//// PARTE DEL SERVIDOR DEL MEDICO/////
//ARRAY VARIABLES DE LA APP

//Obtiene un array con todas las variables
app.get('/api/variable', (req, res) => {
    var sql = 'SELECT * FROM variables';
    connection.query(sql, (err, variables) => {
        if(err){
            console.log('Error en la obtencion de variables: ', err);
        }else{console.log('Datos obtenidos: ', variables);
        res.json(variables);}   
    });
    
});

//VALIDAR DATOS EL LOGIN
app.post("/api/medico/login",(req,res)=>{
    //res=lo que el envio al main
    //hago el sql 
    var medicoActual={
        login: req.body.login,
        pass: req.body.pass
    };
    var sql = "SELECT idMedico, nombreMedico FROM medicos WHERE nombreUsuario='"+medicoActual.login+"' AND contrasenyaMedico='"+medicoActual.pass+"'";
    connection.query(sql,  function(err, medico)  {
        if(err){
            console.log('Error en la obtencion de medicos: ', err);
            res.status(403).json("Validacion incorrecta");
        } else{
            console.log("este es el medico: ", medico)
            res.status(200).json(medico);

        }
    });
});

//MOSTRAR PACIENES POR ID DEL MEDICO
app.get("/api/medico/:id/pacientes",function(req,res){
    var sql= "SELECT * FROM pacientes WHERE idMedicoPaciente = '"+req.params.id+"'";
    connection.query(sql, (err, pacientes) => {
        if(err){
            console.log('Error en la obtencion de pacientes: ', err);
        }else{
            res.status(200).json(pacientes);
            return;        
        }   
    });
});
//mostrar las muestras de un paciente 
app.get("/api/paciente/:id/muestras",(req,res)=>{
    var sql= "SELECT * from muestras WHERE idPaciente_muestras = '"+req.params.id+"'";
    connection.query(sql, (err, muestrasPaciente) => {
        if(err){
            console.log('Error en la obtencion de pacientes: ', err);
        }else{
            console.log("estas son las muestras: ", muestrasPaciente)
            res.status(200).json(muestrasPaciente);
        }   
    })
});

//MOSTRAR DATOS PAC POR ID SIN COD ACCESO 
app.get("/api/paciente/:id",(req,res)=>{
    //recojo el id de la url 
    var sql= "SELECT idPaciente, nombrePaciente, idMedicoPaciente, observacionesPaciente from pacientes WHERE idPaciente = '"+req.params.id+"'";
    connection.query(sql, (err, paciente) => {
        if(err){
            console.log('Error en la obtencion de pacientes: ', err);
            res.status(404).json("No existe paciente con ese id.");
        }else{
            console.log("este es el pac: ", paciente)
            res.status(200).json(paciente);
        }   
    })
});

//MOSTRAR DATOS MEDICO POR ID SIN PASSWORD 
app.get("/api/medico/:id",(req,res)=>{
    //recojo el id de la url 
    var sql= "SELECT idMedico, nombreMedico, nombreUsuario from medicos WHERE idMedico = '"+req.params.id+"'";
    connection.query(sql, (err, medico) => {
        if(err){
            console.log('Error en la obtencion del medico: ', err);
            res.status(404).json("No existe medico con ese id.");
        }else{
            console.log("este es el medico: ", medico)
            res.status(200).json(medico);
        }   
    })
});

//CREAR NUEVOS PACIENTES (agregarPacientes)
app.post("/api/medico/:id/pacientes",(req,res)=>{
    var sql= "INSERT INTO pacientes (idPaciente, nombrePaciente, fechaNacimientoPaciente, idMedicoPaciente, codigoAccesoPaciente, observacionesPaciente, generoPaciente) VALUES ('NULL','"+req.body.nombreNuevoPaciente+"','"+req.body.fechaNacimientoNuevoPaciente+"','"+req.params.id+"','"+req.body.codigoAccesoNuevoPaciente+"','"+req.body.obersvacionesNuevoPaciente+"','"+req.body.generoNuevoPaciente+"')";
    connection.query(sql, (err, paciente) => {
        if(err){
            console.log("No es posible crear el paciente.", err);
            res.status(404).json("No es posible crear el paciente.");
        }else{  
            console.log("este es el paciente nuevo: ", paciente)
            res.status(201).json("paciente creado");
        }   
    });
});

//ACTUALIZAR DATOS DE UN PACIENTE
app.put("/api/paciente/:id",(req,res)=>{
    var sql= "UPDATE pacientes SET nombrePaciente= '"+req.body.nombreNuevoPaciente+"', fechaNacimientoPaciente='"+req.body.fechaNacimientoNuevoPaciente+"', codigoAccesoPaciente='"+req.body.codigoAccesoNuevoPaciente+"', observacionesPaciente ='"+req.body.obersvacionesNuevoPaciente+"', generoPaciente='"+req.body.generoNuevoPaciente+"' WHERE idPaciente = '"+req.params.id+"'";
    connection.query(sql, (err, paciente) => {
        if(err){
            console.log("No es posible actualizar el paciente.", err);
            res.status(204).json("Paciente no actualizado");
        }else{  
            //console.log("este es el paciente nuevo: ", paciente)
            res.status(201).json("paciente actualizado");
        }   
    });
});

//Filtrar
app.get("/api/paciente/:pacienteglobal/muestras/:listafiltrar",(req,res)=>{
    var sql="SELECT idMuestra, valorMuestra FROM muestras WHERE idPaciente_muestras='"+req.params.pacienteglobal+"' AND idVariable_muestras ='"+req.params.listafiltrar+"' ";
    connection.query(sql, (err, muestras) => {
        if(err){
            console.log("No es posible encontrar las muestras", err);
            res.status(204).json("Muestras no encontradas");
        }else{  
            console.log("estas son las muestras: ", muestras)
            res.status(200).json(muestras);
        }   
    });
});

/*
app.post("/api/paciente/:id/duplicar", function (req, res){
    //Obtener los datos del nuevo paciente
    var idPac=req.params.id;
    var paciente;
    for (let i = 0; i < pacientes.length; i++) {
        if (pacientes[i].id == idPac) {
            paciente = pacientes[i];  
        } 
    }
    var nuevoPaciente =  {   
        id: contadorPacientes, 
        nombre: paciente.nombre, 
        fecha_nacimiento: paciente.fecha_nacim, 
        genero: paciente.genero, 
        medicoID: paciente.medicoID, 
        codigo_acceso: paciente.codigo_acceso, 
        observaciones: paciente.observaciones
    };
    console.log("nuevo pac:",nuevoPaciente);//Visualizar nuevo paciente
    pacientes.push(nuevoPaciente);//Incluir en array de pacientes
    res.status(200).json(nuevoPaciente.id);//Se envia el nuevo paciente creado
    console.log(pacientes);
    console.log("Paciente duplicado!");
    
});

let date = new Date();
let output = String(date.getDate()).padStart(2, '0') + '/' + String(date.getMonth() + 1).padStart(2, '0') + '/' + date.getFullYear();
console.log(output);

function duplicarMuestrafunc(idValor){
    //console.log("idValor:",idValor);
    var pos;
    for(var i=0; i<pacientes.length;i++ ){
        if(pacientes[i].id==idValor){
            pos=i;
        }
    }
    if(pos==-1){
        return -1;
    }else{
        var nuevaMuestra={idMuestra: idMuestraGlobal, pacienteID: muestras[pos].pacienteID, variable: muestras[pos].variable, fecha: output, valor: muestras[pos].valor};
        muestras.push(nuevaMuestra);
        idMuestraGlobal++;
        console.log(muestras);
        return idMuestraGlobal--;
    }
        
}
*/
//////////////////////////////////////






//puerto de escucha del server
app.listen(3000);

































//////////////////////////////////////////////////////
//SERVIDOR RPC
/////PARTE DEL CLIENTE (PACIENTE) //////
var rpc = require("./rpc.js");
var datos=require("./datos.js");

//id paciente global
var idPacienteGlobal;
//variable global para el id de las nuevas muestras
//empieza en 8 porque ya tenemos  muestras creadas previamente
var idMuestraGlobal=5000;
var idMedicoGlobal;


function login(codAcc){
    for(var i=0; i < pacientes.length;i++){
        if(codAcc==pacientes[i].codigo_acceso){
            idMedicoGlobal=pacientes[i].medicoID;
            //console.log("ID del medico actual: ", idMedicoGlobal);
            idPacienteGlobal=pacientes[i].id;
            return pacientes[i];
        }
    }
    return null;
}
function datosMedico(idMedico){
    var datosMed=[];
    for(var i=0; i<medicos.length;i++){
        //aqui antes era medicos[i].id==pacientes[i].medicoID
        if(idMedico==pacientes[i].medicoID){
            datosMed.push(medicos[i].id);
            datosMed.push(medicos[i].nombre);
            //console.log(datosMed);
            return datosMed;
        }
    }
    return null;
}


function listadoMuestras(idPaciente){
    var muestraActual=[];
    //console.log(idPaciente);
    for(var i=0; i< muestras.length;i++){
        if(muestras[i].pacienteID==idPaciente){
            //console.log(muestras[i].pacienteID);
            muestraActual.push(muestras[i]);
        }
    }
    //console.log(muestraActual);
    return muestraActual;
}


function agregarMuestra(idPaciente, idVariable,fecha,valor){
    //si me envian algo diferente devuelve 0
    if(!idPaciente||!idVariable||!fecha||!valor){
        return 0;
    }else{
        idMuestraGlobal++;
        muestras.push({idMuestra:idMuestraGlobal,pacienteID:idPaciente,variable:idVariable,fecha:fecha,valor:valor});
        //console.log("Estas son las muestras que hay: ",muestras);
        return idMuestraGlobal;
    }
}

function eliminarMuestra(idValor){
    //console.log("idValor:",idValor);
    for(var i=0; i<muestras.length;i++ ){
        if(idValor==muestras[i].idMuestra){
            muestras.splice(i,1);
            //console.log(muestras);
            //meustra borrada
            return true;
        }
    }
    //console.log(muestras);
    //muetra no borrada
    return false;

}

function listadoVariables(){
    return variables;
}

var servidor = rpc.server();
var app = servidor.createApp("MiGestionPacientes");

app.register(listadoMuestras);
app.register(listadoVariables);
app.register(login);
app.register(datosMedico);
app.register(agregarMuestra);
app.register(eliminarMuestra);
//funciones creadas por mi para la parte 3: 
app.register(getAllMuestras);

//app.register(duplicarMuestrafunc);


function getAllMuestras(){
    return muestras;
}

























//////////////////////////////////////////////////////
///////PARTE DEL WEBSOCKET////////////////////////////
// Crear un servidor HTTP
var http = require("http");
var httpServer = http.createServer();
//Creo el sevidor ws
var WebSocketServer= require("websocket").server; 
var wsServer= new WebSocketServer({
    httpServer: httpServer
});
// Iniciar el servidor HTTP en un puerto
var puerto = 4444;
httpServer.listen(puerto, function () {
	console.log("Servidor de WebSocket iniciado en puerto:", puerto);
});




//variables globales
var conexiones = []; //array conexiones
var nombreMuestraGlobal;

//.on es igual a addEventListener
wsServer.on("request", function (request) {
    // aceptar conexión (necesario para empezar la comunicacion)
    var connection = request.accept("pacientes", request.origin);
    conexiones.push(connection); // guardar la conexión
    console.log("Cliente conectado. Ahora hay", conexiones.length);
    //le envio los pacientes para crear el select

    // recibir el mensaje que me envia el main
    connection.on("message", function (message){ 
        // mensaje recibido del cliente
		if (message.type === "utf8") {
			//con msg recojo el mensaje que me envia el main y lo parseo 
            //(le quito comillas)
            var msg = JSON.parse(message.utf8Data);

            //aginar un id a la conexion

            switch (msg.operacion){

				case "login":
                    //console.log(msg);
                    if(msg.rol=="paciente"){
                        connection.rolServer=msg.rol;
                        connection.id=msg.id;
                        console.log("ID PACIENTE:", connection.id);
                        console.log("SOY UN:", connection.rolServer);
                        //le asigno a esa conexion el rol de paciente
                        connection.sendUTF(JSON.stringify({operacion:"filtrarPacs",pacientesTodos:pacientes}));
                    }else{
                        connection.rolServer=msg.rol;
                        //connection.nombre=msg.nombre;
                        connection.id=msg.id;
                        console.log("SOY UN:", connection.rolServer);
                        console.log("ID MEDICO:", connection.id);
                        //console.log("Me llamo: ", connection.nombre);
                        //le asigno a esa conexion el rol de medico
                    }
					break;

				case "enviar":
                    console.log("Valor del select: ",msg.valorSelect);
                    //For para obtener el nombre de la muestra
                    for(var i=0;i<variables.length;i++){
                        if(variables[i].id==msg.muestra.variable){
                            nombreMuestraGlobal=variables[i].nombre;
                        }
                    }
                    console.log("Nombre de la variable a compartir:",nombreMuestraGlobal);
                    if(msg.valorSelect<0){
                        //compartir con el medico
                        if(msg.valorSelect==-1){
                            for(var i=0; i<conexiones.length;i++){
                                //si el rol ser medico y si el id de la conexion es igual al id del medico del array de pacientes
                                //envia la info 
                                if(conexiones[i].rolServer=="medico" && conexiones[i].id==msg.idMedico){
        
                                    conexiones[i].sendUTF(JSON.stringify({operacion:"notificar",muestra:msg.muestra, 
                                    nombre:msg.nombre, variable:nombreMuestraGlobal}));
                                }
                            }
                        }else{
                            //Compartir con todos 
                            //console.log("Esta es la muestra: ",msg.muestra);
                            for(var i=0;i<conexiones.length;i++){
                                //connection es la persona que ha hecho el login por eso si la conexion[i] es distinta
                                //a  connection, le envio el mensaje, para que una persona NO se comparta asi misma
                                //y le comparto a todas las personas ya demas de ello ponog que las conexinoes[i] sean 
                                // distintas de medico para no enviarlo medicos y solo enviar a pacientes
                                if(conexiones[i]!=connection && conexiones[i].rolServer!="medico"){
                                    conexiones[i].sendUTF(JSON.stringify({operacion:"notificar",muestra:msg.muestra, 
                                    nombre:msg.nombre, variable:nombreMuestraGlobal}));
                                }
                            }
                        }
                    }else{
                        //compartir con un paciente en concreto
                        for(var i=0; i<conexiones.length;i++){
                            //si es == paciente
                            //si es distinto de el id de la conexion (para no enviarselo asi mismo)
                            //si la conexion[i].id == valor del select(el valro de cada selecet es el id de ese paciente)), le envio el mensjae
                            //&& conexiones[i].id!=connection.id (esto creo que no hace falta)
                            if(conexiones[i].rolServer=="paciente" && conexiones[i].id==msg.valorSelect){
                                conexiones[i].sendUTF(JSON.stringify({operacion:"notificar",muestra:msg.muestra, 
                                nombre:msg.nombre, variable:nombreMuestraGlobal}));
                            }
                        }
                    }
					break;
			}
     
		}
	});
    
    
    //cuando el cliente se desconecte hace el callback que es borrar
    //del array de connexiones y mostrarlo por consola
    connection.on("close", function (reasonCode, description) { // conexión cerrada
        conexiones.splice(conexiones.indexOf(connection), 1);
        console.log("Cliente desconectado. Ahora hay", conexiones.length);
    });  
});
































