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

//datos tiene que estar obligatoriamente en la misma carpeta que el servidor
var datos=require("./datos.js");

//BASES DE DATOS (exportadas)
var medicos=datos.medicos;
var pacientes=datos.pacientes; 
var variables=datos.variables;
var muestras=datos.muestras;

//contador de pacientes a incrementar 
var contadorPacientes=6;


//// PARTE DEL SERVIDOR DEL MEDICO/////
//ARRAY VARIABLES DE LA APP
app.get("/api/variable", (req,res)=>{
    res.status(200).json(variables);
});

//VALIDAR DATOS EL LOGIN
app.post("/api/medico/login",(req,res)=>{
    //peticion=log del main
    //res=lo que el envio al main
    var medicoActual={
        login: req.body.login,
        pass: req.body.pass
    };
    //array apra enviarle al main el nombre del medico y el id de este
    var envioMedico=[];
    //console.log("Credenciales medico actual: ",medicoActual);
    for(var i=0; i< medicos.length;i++ ) { 
        if(medicos[i].login==medicoActual.login && medicos[i].pass==medicoActual.pass){
            //le devuelvo el id del medico que ha accedido al programa, 
            //en el main lo veo como "respuesta"
            envioMedico.push(medicos[i].nombre);
            envioMedico.push(medicos[i].id);
            console.log(envioMedico);
            res.status(200).json(envioMedico); 
            //debo poner este return porque si no me da un error: 
            //Cannot set headers after they are sent to the client
            //no afecta al funcionamineto de la app pero ensucia el terminal
            return;
        }    
    } 
    res.status(403).json("Validacion incorrecta");
});

//MOSTRAR DATOS PAC POR ID SIN COD ACCESO 
app.get("/api/paciente/:id",(req,res)=>{
    //recojo el id de la url 
    var id = req.params.id;
    var datos=[];
    for(var i=0;i<pacientes.length;i++){
        if(pacientes[i].id==id){
            //recojo las variables 
            datos.push(pacientes[i].id);
            datos.push(pacientes[i].nombre);
            datos.push(pacientes[i].medicoID);
            datos.push(pacientes[i].observaciones)
            console.log("Estos son los datos del paciente:",datos);
            //las envio en formato json, lo que me permite no recoger el codigo de acceso 
            res.status(200).json(datos);
        }
    }
    res.status(404).json("No existe paciente con ese id.");
});

//MOSTRAR PACIENES POR ID DEL MEDICO
app.get("/api/medico/:id/pacientes",(req,res)=>{
    //recojo  el id del medico
    //.params recoge el id de la url que le manda el main
    var id=req.params.id;
    var newPac=[];
    for(var i=0; i<pacientes.length;i++){
        if(pacientes[i].medicoID==id){
            newPac.push(pacientes[i]);  
        }
    }
    // console.log(newPac);
    //le envio todos los pacientes asoaciado a ese medico
    res.status(200).json(newPac);
});

//mostrar las muestras de un paciente 
app.get("/api/paciente/:id/muestras",(req,res)=>{
    var id=req.params.id;
    var newMus=[];
    for(var i=0; i<muestras.length;i++){
        if(muestras[i].pacienteID==id){
            newMus.push(muestras[i]);
            //console.log(newMus);
        }
    }
    res.status(200).json(newMus);
});

//MOSTRAR DATOS MEDICO POR ID SIN PASSWORD 
app.get("/api/medico/:id",(req,res)=>{
    //recojo el id de la url 
    var id = req.params.id;
    for(var i=0;i< medicos.length;i++){
        if(medicos[i].id==id){
            //recojo las variables
            idMed=medicos[i].id;
            nombreMed=medicos[i].nombre;
            logMed=medicos[i].login;
            res.status(200).json({
                idMed,
                nombreMed,
                logMed
            });
        }
    }
    res.status(404).json("No existen medicos con ese id"); 
});

//CREAR NUEVOS PACIENTES (agregarPacientes)
app.post("/api/medico/:id/pacientes",(req,res)=>{
    var idMedico= req.params.id;
    console.log(idMedico);
    var pacNuevo={
        id: contadorPacientes,
        nombre: req.body.nombreNuevoPaciente,
        fecha_nacim: req.body.fechaNacimientoNuevoPaciente,
        genero:req.body.generoNuevoPaciente,
        medicoID: idMedico, 
        codigo_acceso:req.body.codigoAccesoNuevoPaciente,
        observaciones:req.body.obersvacionesNuevoPaciente
    };
    for(var i=0;i<medicos.length;i++){
        if(medicos[i].id==idMedico){
            pacientes.push(pacNuevo);
            contadorPacientes++;
            // console.log(pacActual);
            res.status(201).json("paciente creado");
        }
    }
    //console.log(pacientes);
});

//ACTUALIZAR DATOS DE UN PACIENTE
app.put("/api/paciente/:id",(req,res)=>{
    var idActual = req.params.id;
    for(var i=0;i< pacientes.length;i++){
        if(pacientes[i].id==idActual){
            pacientes[i].nombre = req.body.nombreNuevoPaciente;
            pacientes[i].fecha_nacimiento = req.body.fechaNacimientoNuevoPaciente;
            pacientes[i].genero = req.body.generoNuevoPaciente;
            pacientes[i].codigo_acceso = req.body.codigoAccesoNuevoPaciente;
            pacientes[i].observaciones = req.body.obersvacionesNuevoPaciente;
            console.log("Nuevos datos del paciente: ",pacientes);
            res.status(201).json('correcto');
        }
    }
    res.status(201).json("Paciente no actualizado");
});



//Filtrar
app.get("/api/paciente/:pacienteglobal/muestras/:listafiltrar",(req,res)=>{
    //recojo el id de la url 
    var newMuestra=[];
    var pacienteglobal = req.params.pacienteglobal;
    var listafiltrar = req.params.listafiltrar;
    //console.log("ID del apceinte seleccionado",pacienteglobal);
    //console.log("Valor de la variable seleccionada",listafiltrar);
    for(var i=0;i< muestras.length;i++){
        if(muestras[i].variable==listafiltrar && muestras[i].pacienteID==pacienteglobal){
            newMuestra.push(muestras[i])
        }
    }
    //console.log(newMuestra);
    res.status(200).json(newMuestra);
    return;
   
});

//puerto de escucha del server
app.listen(3000);

































//////////////////////////////////////////////////////
//SERVIDOR RPC
/////PARTE DEL CLIENTE (PACIENTE) //////
var rpc = require("./rpc.js");
var datos=require("./datos.js");

//id paciente global
var idPaciente;
//variable global para el id de las nuevas muestras
//empieza en 8 porque ya tenemos  muestras creadas previamente
var idMuestraGlobal=14;
var idMedicoGlobal;


function login(codAcc){
    for(var i=0; i < pacientes.length;i++){
        if(codAcc==pacientes[i].codigo_acceso){
            idMedicoGlobal=pacientes[i].medicoID;
            console.log("ID del medico actual: ", idMedicoGlobal);
            idPaciente=pacientes[i].id;
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
    if(!idPaciente||!idVariable||!fecha||!valor) return 0;
    idMuestraGlobal++;
    muestras.push({idMuestra:idMuestraGlobal,pacienteID:idPaciente,variable:idVariable,fecha:fecha,valor:valor});
    //console.log("Estas son las muestras que hay: ",muestras);
    return idMuestraGlobal;
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
//var pacientesFiltrados=getPacientes(idMedicoGlobal);
//console.log(pacientesProfe); // array de pacientes
var conexiones = []; //array conexiones

//.on es igual a addEventListener
wsServer.on("request", function (request) {
    // aceptar conexión (necesario para empezar la comunicacion)
    var connection = request.accept("pacientes", request.origin);
    conexiones.push(connection); // guardar la conexión
    console.log("Cliente conectado. Ahora hay", conexiones.length);
    //le envio los pacientes para crear el select

    // recibir el mensaje que me envia el main
    connection.on("message", function (message) { 
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
                        connection.nombre=msg.nombre;
                        connection.id=msg.id;
                        console.log("SOY UN:", connection.rolServer);
                        console.log("ID MEDICO:", connection.id);
                        //console.log("Me llamo: ", connection.nombre);
                        //le asigno a esa conexion el rol de medico
                    }
					break;

				case "enviar":
                    console.log("Valor del select: ",msg.valorSelect);
                    if(msg.valorSelect<0){
                        //compartir con el medico
                        if(msg.valorSelect==-1){
                            for(var i=0; i<conexiones.length;i++){
                                //si el rol ser medico y si el id de la conexion es igual al id del medico del array de pacientes
                                //envia la info 
                                if(conexiones[i].rolServer=="medico" && conexiones[i].id==msg.idMedico){
                                    console.log("Esta es la muestra: ",msg.muestra);
                                    // se pone msg.muestra.variable-1 porque el array busca por posicion y no por id 
                                    // porque sé que el orden de id=1,2,3.... 
                                    // si el envio la primera muestra con (msg.muestra.variable)
                                    //me voy a la posicion 1 del array de variables que corresponde con metros
                                    //por eso se le resta 1,para irme a peso
                                    conexiones[i].sendUTF(JSON.stringify({operacion:"notificar",muestra:msg.muestra, 
                                    nombre:msg.nombre, variable:variables[(msg.muestra.variable)-1].nombre}));
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
                                    nombre:msg.nombre, variable:variables[(msg.muestra.variable)-1].nombre}));
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
                                nombre:msg.nombre, variable:variables[(msg.muestra.variable)-1].nombre}));
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
































