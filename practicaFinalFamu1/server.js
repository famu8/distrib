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
            //console.log("este es el medico: ", medico)
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



/////////////////////////////////////////////////////////////////////


//de aqui para abajo implementaciones propias
var contador=150;
//como el codigoAccesoPaciente es clave alternativa y no se duplicar, 
//creo una variable que se incremetara como codigo de acceso apra el paciente duplicado 
app.post("/api/paciente/:id/duplicar", function (req, res){
    var contadorCodigoAcceso="code"+contador+"";
    console.log(contadorCodigoAcceso);
    //Obtener los datos del nuevo paciente
    var idPac=req.params.id;
    //console.log("ID del paciente a duplicar: ", idPac);
    var sql="INSERT INTO pacientes (nombrePaciente,fechaNacimientoPaciente,idMedicoPaciente,codigoAccesoPaciente,observacionesPaciente,generoPaciente) SELECT nombrePaciente,fechaNacimientoPaciente,idMedicoPaciente,'"+contadorCodigoAcceso+"',observacionesPaciente,generoPaciente FROM pacientes WHERE idPaciente ='"+idPac+"' ";
    connection.query(sql, (err, paciente) => {
        if(err){
            //console.log("No es posible encontrar ese paciente", err);
            res.status(204).json("Paciente no duplicado");
        }else{  
            contador++;
            //console.log("Paciente duplicado:", paciente);
            res.status(200).json("todo ok");
        }   
    });
});

app.delete("/api/paciente/:id/eliminar",function(req,res){
    var idPac=req.params.id;
    console.log("Id del paciente a eliminar: ",idPac);
    var sql="DELETE FROM pacientes WHERE idPaciente='"+idPac+"'";
    connection.query(sql, (err, paciente) => {
        if(err){
            res.status(204);
        }else{  
            res.status(200);
        }   
    });

});





/*

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
rpc.debug = true;

//variable global para el id de las nuevas muestras
//empieza en 8 porque ya tenemos  muestras creadas previamente


function login(codAcc, callback){
    connection.query("SELECT * FROM pacientes WHERE codigoAccesoPaciente = '"+codAcc+"' ", function (error, paciente) {
        //console.log("paciente que me devuelve la bbdd:",paciente)
        if (error) {
            callback(null); // error en la consulta
        }else {
            let pacienteParse = JSON.parse(JSON.stringify(paciente))[0];
            callback(pacienteParse);
        }
    });
}

function datosMedico(idMedico,callback){
    var sql="SELECT * from medicos WHERE idMedico ='"+idMedico+"'";
    connection.query(sql,function (error, medico) {
        //console.log("medico que me devuelve la bbdd:",medico)
        if (error) {
            callback(null); 
        }else {
            let medicoParse = JSON.parse(JSON.stringify(medico))[0];
            callback(medicoParse);       
        }
    });
}

function listadoMuestras(idPaciente,callback){
    var sql="SELECT * FROM muestras WHERE idPaciente_muestras='"+idPaciente+"'";
    connection.query(sql,function (error, muestra) {
        //console.log("muestras de ese pac:",muestra)
        if (error) {
            callback(null);
        }else {
            callback(muestra);       
        }
    });
}

function agregarMuestra(idPaciente, idVariable,fecha,valor,callback){
    //console.log("Nuevas variables: ", idPaciente, idVariable,fecha,valor);
        var sql="INSERT INTO muestras (idPaciente_muestras,idVariable_muestras,fechaMuestra,valorMuestra) VALUES ('"+idPaciente+"','"+idVariable+"','"+fecha+"', '"+valor+"')";
        connection.query(sql,function (error,confirmacion) {
            //console.log(confirmacion.insertId);
            if(error){
                //Devuelvo 0 porque no se ha creado la muestra en la bbdd
                callback(0);
            }else {
                callback(confirmacion.insertId);       
            }
        });
}

function eliminarMuestra(idValor,callback){
    var sql = 'DELETE FROM muestras WHERE idMuestra="'+idValor+'"';
    connection.query(sql, (error, resultado)=>{
        if(error){
            callback(false);
        }else{ 
            callback(true);
        }
    });
}

function listadoVariables(){
    return variables;
}

function buscarAlergia(idPaciente, callback){
    var sql = "SELECT nombreAlergia FROM alergias WHERE idPaciente_alergia ='"+idPaciente+"'";
    connection.query(sql, (error, resultado)=>{
        if(error){
            callback(false);
        }else{ 
            //console.log("nombre de la alergia",resultado);
            callback(resultado);
        }
    });
}


var servidor = rpc.server();
var app = servidor.createApp("MiGestionPacientes");

app.registerAsync(listadoMuestras);
app.registerAsync(listadoVariables);
app.registerAsync(login);
app.registerAsync(datosMedico);
app.registerAsync(agregarMuestra);
app.registerAsync(eliminarMuestra);
app.registerAsync(buscarAlergia);
//funciones creadas por mi para la parte 3: 

//app.register(duplicarMuestrafunc);















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
var conexionesWS = []; //array conexiones
var nombreMuestraGlobal;
var variablesGlobales=[];


//.on es igual a addEventListener
wsServer.on("request", function (request) {
    // aceptar conexión (necesario para empezar la comunicacion)
    var connectionWS = request.accept("pacientes", request.origin);
    conexionesWS.push(connectionWS); // guardar la conexión
    console.log("Cliente conectado. Ahora hay", conexionesWS.length);
    //le envio los pacientes para crear el select

    // recibir el mensaje que me envia el main
    connectionWS.on("message", function (message){ 
        // mensaje recibido del cliente
		if (message.type === "utf8") {
			//con msg recojo el mensaje que me envia el main y lo parseo 
            //(le quito comillas)
            var msg = JSON.parse(message.utf8Data);
            const sql = "SELECT * FROM variables";
                    connection.query(sql, (error, variables)=>{
                        if (error){
                            console.log('Error en busqueda de variables');
                        }else{
                            variablesGlobales=variables;    
                        }
                    });

            //aginar un id a la conexion

            switch (msg.operacion){

				case "login":
                    //console.log(msg);
                    if(msg.rol=="paciente"){
                        connectionWS.rolServer=msg.rol;
                        connectionWS.idMedico=msg.idMedico;
                        connectionWS.idPaciente=msg.idPaciente;
                        //console.log("ID PACIENTE:", connectionWS.id);
                        //console.log("SOY UN:", connectionWS.rolServer);
                        //le asigno a esa conexion el rol de paciente
                        const sql = "SELECT * FROM pacientes WHERE idMedicoPaciente ='"+connectionWS.idMedico+"' AND idPaciente != '"+connectionWS.idPaciente+"' ";
                        connection.query(sql, (error, pacientesAmigos)=>{
                            if (error){
                                console.log('Error en busqueda de pacientes');
                            }else{
                                pacientesAmigosGlobal=pacientesAmigos;
                                connectionWS.sendUTF(JSON.stringify({operacion:"recibirAmigos",pacientesTodos:pacientesAmigos}));
                            }
                        });
                    }else{
                        connectionWS.rolServer=msg.rol;
                        //connection.nombre=msg.nombre;
                        connectionWS.id=msg.id;
                        //console.log("SOY UN:", connectionWS.rolServer);
                        //console.log("ID MEDICO:", connectionWS.id);
                        //console.log("Me llamo: ", connection.nombre);
                        //le asigno a esa conexion el rol de medico
                    }
					break;

				case "enviar":
                    //console.log("Valor del select: ",msg.valorSelect);
                    for(var i=0;i<variablesGlobales.length;i++){
                        if(variablesGlobales[i].idVariables==msg.muestra.idVariable_muestras){
                            nombreMuestraGlobal=variablesGlobales[i].nombreVariables;
                        }
                    }
        
                    //console.log("Nombre de la variable a compartir:",nombreMuestraGlobal);
                    if(msg.valorSelect<0){
                        //compartir con el medico
                        if(msg.valorSelect==-1){
                            for(var i=0; i<conexionesWS.length;i++){
                                //si el rol ser medico y si el id de la conexion es igual al id del medico del array de pacientes
                                //envia la info 
                                if(conexionesWS[i].rolServer=="medico" && conexionesWS[i].id==msg.idMedico){
                                    //console.log("esta es la muestras: ",msg.muestra)
                                    conexionesWS[i].sendUTF(JSON.stringify({operacion:"notificar",muestra:msg.muestra, 
                                    nombre:msg.nombre, variable:nombreMuestraGlobal}));
                                }
                            }
                        }else{
                            //Compartir con todos 
                            //console.log("Esta es la muestra: ",msg.muestra);
                            for(var i=0;i<conexionesWS.length;i++){
                                //connection es la persona que ha hecho el login por eso si la conexion[i] es distinta
                                //a  connection, le envio el mensaje, para que una persona NO se comparta asi misma
                                //y le comparto a todas las personas ya demas de ello ponog que las conexinoes[i] sean 
                                // distintas de medico para no enviarlo medicos y solo enviar a pacientes
                                if(conexionesWS[i]!=connectionWS && conexionesWS[i].rolServer!="medico"){
                                    conexionesWS[i].sendUTF(JSON.stringify({operacion:"notificar",muestra:msg.muestra, 
                                    nombre:msg.nombre, variable:nombreMuestraGlobal}));
                                }
                            }
                        }
                    }else{
                        //compartir con un paciente en concreto
                        for(var i=0; i<conexionesWS.length;i++){
                            //si es == paciente
                            //si es distinto de el id de la conexion (para no enviarselo asi mismo)
                            //si la conexion[i].id == valor del select(el valro de cada selecet es el id de ese paciente)), le envio el mensjae
                            //&& conexiones[i].id!=connection.id (esto creo que no hace falta)
                            if(conexionesWS[i].rolServer=="paciente" && conexionesWS[i].idPaciente==msg.valorSelect){
                                conexionesWS[i].sendUTF(JSON.stringify({operacion:"notificar",muestra:msg.muestra, 
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
    connectionWS.on("close", function (reasonCode, description) { // conexión cerrada
        conexionesWS.splice(conexionesWS.indexOf(connectionWS), 1);
        console.log("Cliente desconectado. Ahora hay", conexionesWS.length);
    });  
});
































