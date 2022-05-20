var app = rpc("localhost", "MiGestionPacientes");
var seccionActual = "login";

// debo definir las funciones que recojo del servidor 
var login = app.procedure("login");
var listadoVariables = app.procedure("listadoVariables");
var datosMedico = app.procedure("datosMedico");
var listadoMuestras = app.procedure("listadoMuestras");
var agregarMuestra =app.procedure("agregarMuestra");
var eliminarMuestra=app.procedure("eliminarMuestra");
var getAllMuestras =app.procedure("getAllMuestras");

//variables globales
var idMedico;
var idPaciente;
var pacienteGlobal=[];

//funcion para ir cambiando de pestañas
function cambiarSeccion(seccion){   
    document.getElementById(seccionActual).classList.remove("activa");
    document.getElementById(seccion).classList.add("activa");
    seccionActual=seccion;
}
//funcion para slair al menu principal
function salir(){
    cambiarSeccion("login");
    //recargar la pagina
    location.reload();
}
//creo la conexion al webSocket fuera para hacerla global 
//debo hacer esto porque si quiero que el ws no haga nada hasta que la funcion log in 
//no se ejcute, debe de ser asi --> ver funcion openWs()
//ademas debo de crear conexion como global para pdoer enviar mensjaes desde diferentes funciones 
//al servidor
var conexion ="";
function logearAsincrono(){
    var codAcc= document.getElementById("codAcc").value;
    //console.log(codAcc);
    login(codAcc,function(pacientes){
        //console.log(pacientes);
        if(pacientes!=null){
            //recojo los pacientes en la variable global
            pacienteGlobal=pacientes;
            //console.log(pacientesGlobal);
            //console.log("PACIENTE",pacientesGlobal);
            //recojo el id del medico y del paciente para futuras funciones
            idMedico=pacientes.medicoID;
            //console.log(idMedico);
            idPaciente=pacientes.id;
            //console.log(idPaciente);

            //creo esta funcion para abrir el ws en el main y recoger los
            //Datos que me envia el server
            openWs();
            
            //console.log("El paciente se ha logeado");
            cambiarSeccion("listaPacientes");

            //mostrar el nombre etc..variables y muestras
            mostrarDatosMedico();
            mostrarMuestras();
            //mostrarVariables();
        }else{
            alert("Error, el paciente no se ha logeado");
        }
    });
}
var idMedicoGlobal;
function mostrarDatosMedico(){
    datosMedico(idMedico, function(datosMed){
        if(datosMed!=null){
            //console.log("Este es el paciente global: ",pacientesGlobal);
            var bienvenida=document.getElementById("bienvenida"); 
            bienvenida.innerHTML = "Bienvenido/a al menú principal." +" ¡ "+ pacienteGlobal.nombre+" ! <br>" +"Tu medico es : " + datosMed[1] + "<br> Observaciones: " + pacienteGlobal.observaciones;
            idMedicoGlobal=datosMed[1];
        }else{
            alert("El medico no existe");
        }
    });
}


function mostrarMuestras(){
    var listaMuestras= document.getElementById("listaMuestras");
    listaMuestras.innerHTML="";
    //console.log("Id del paciente que estamos viendo: ",idPaciente);
    listadoMuestras(idPaciente,function(muestraActual){
        //console.log(muestraActual);
        var variableForm = document.getElementById("filtrar").value;
        //console.log("Esta es la variable elegida: ",variableForm);
        if(muestraActual!==null){  
            //se pone '0' porque es el valor asignado a 'Mostrar Todo' lo que hace es imprimir todas las muestras
            if(variableForm!=='0'){
                for(var i=0; i< muestraActual.length;i++){
                    if(variableForm==muestraActual[i].variable){
                        listaMuestras.innerHTML+="<li>"+ "Muestra: "+i+" --- "+ "ID: "+ muestraActual[i].idMuestra +"-- Variable: "+ muestraActual[i].variable+"-- Valor:  "+muestraActual[i].valor+"-- Fecha: "+muestraActual[i].fecha+  " <button onclick='eliminarMain(" + muestraActual[i].idMuestra + ")'>Eliminar</button> <button onclick='compartir("+muestraActual[i].idMuestra+")'>Compartir</button></li>";
                    }
                }
            }else{
                for(var i=0; i<muestraActual.length;i++){
                    listaMuestras.innerHTML+="<li>"+ "Muestra: "+i+" --- "+ "ID: "+ muestraActual[i].idMuestra +"-- Variable: "+ muestraActual[i].variable+"-- Valor:  "+muestraActual[i].valor+"-- Fecha: "+muestraActual[i].fecha+  " <button onclick='eliminarMain(" + muestraActual[i].idMuestra + ")'>Eliminar</button> <button onclick='compartir("+muestraActual[i].idMuestra+")'>Compartir</button></li>";
                }
            }
        }else{
            alert("No se han obtenido las muestras del paciente");
        }
    });
}

function anyadirMuestras(){
    var idvariableActual=document.getElementById("listaVariables").value;
    var nuevaMuestra={    
        fecha: document.getElementById("fechaNuevaMuestra").value,
        valor: document.getElementById("valorNuevaMuestra").value,
    };
    //console.log(nuevaMuestra);
    //console.log("ID de la variable",nuevaMuestra.idVariable);
    //console.log("fecha: ",nuevaMuestra.fecha);
    //console.log("valor de la muestra",nuevaMuestra.valor);
    //console.log("ID del paciente",idPaciente);
    if(idvariableActual=="" || nuevaMuestra.fecha=="" || nuevaMuestra.valor==""){
        alert("Selecciona un valor para cada campo");
    }
    agregarMuestra(idPaciente, idvariableActual, nuevaMuestra.fecha, nuevaMuestra.valor, function(idMuestraGlobal){
        if(idMuestraGlobal==0){
            alert("No se ha podido añadir la muestra.");
            document.getElementById("listaVariables").value="";
            document.getElementById("fechaNuevaMuestra").value="";
            document.getElementById("valorNuevaMuestra").value="";
            cambiarSeccion("listaPacientes");
        }else{
            alert("Se ha añadido la muestra");
            //recargar el 'formulario'
            document.getElementById("listaVariables").value="";
            document.getElementById("fechaNuevaMuestra").value="";
            document.getElementById("valorNuevaMuestra").value="";
            cambiarSeccion("listaPacientes");
            mostrarMuestras();
        }
    });
}


function eliminarMain(idValor){
    //eliminado es un booleano
    eliminarMuestra(idValor,function(eliminado){
        //If elimiando==true
        if(eliminado){
            alert("Se ha elimiando la muestra");
            mostrarMuestras();
        }else{
            alert("No se ha eliminado la muestra");
        }
    });
}













///////////////////////////////////////////////////////////////////////////////////7






















//creo dos arrays de pacientes, uno para los filtrados(con los que comparto medico)
//y otro para lso que me envia el web socket del lado del servidor
var pacsFiltrados=[];
//array global para comaprtir la muestra a los usuarios que quiero
var muestraACompartir=[];


//funcion para filtrar la meustra que voy a compartir con los amigos
function filtrarMuestra(idMuestra){
    var allMuestras=[];
    var muestraFiltrada=[];
    //recojo todas las muestras del servidor
    allMuestras=getAllMuestras();
    for(var i=0;i<allMuestras.length;i++){
        if(idMuestra==allMuestras[i].idMuestra){
            muestraFiltrada=allMuestras[i];
        }
    }
    return muestraFiltrada;
}

function compartir(idMuestra){
    console.log("Muestra con ID: ",idMuestra);
    muestraACompartir=filtrarMuestra(idMuestra);
    //console.log("Esta es la muestra que vas a compartir:",muestraACompartir);
    cambiarSeccion("divCompartir");
    //creamos el select
    if(centinela==false){
        createSelect();
    }
}

//Creo unc entinela para que los apcientes nos e doblen en el select
//si centinale==false se crea de neuvo el select 
//else: NO se crea de nuevo el select y NO se doblan los pacientes
var centinela=false;
function createSelect(){
    var select = document.getElementById("formCompartir");
    select.innerHTML+="<optgroup label=NoAmigos>";
    select.innerHTML+="<option value="+-1+"> Medico </option>";
    select.innerHTML+="<option value="+-2+"> Todos </option>";
    select.innerHTML+="</optgroup>";
    select.innerHTML+="<optgroup label=Amigos>";
    for(var i = 0; i < pacsFiltrados.length; i++){
        select.innerHTML+="<option id=" + pacsFiltrados[i].id +"  value="+pacsFiltrados[i].id+"> " + pacsFiltrados[i].nombre + "</option>";
    }
    select.innerHTML+="</optgroup>";
    //si creo el select cambio el valor del centinela a true
    centinela=true;
}

function filtrarPacs(idMedico,pacienteJSON){
    var pacsFiltrados=[];
    for(var i=0; i < pacienteJSON.length;i++){
        //depues del && --> esto lo aho para NO PODER COMPARTIR la muestra el paciente consigo mismo
        //NO mando el paciente que va a compartir (no lo mando asi mismo)
        if(idMedico==pacienteJSON[i].medicoID && idPaciente!=pacienteJSON[i].id){
            pacsFiltrados.push(pacienteJSON[i]);
        }
    }
    return pacsFiltrados;
}


function openWs(){
    conexion = new WebSocket('ws://localhost:4444', "pacientes");
    // Connection opened 
    //con esto le digo al server que estoy conectado
    conexion.addEventListener('open', function (event) {
        console.log("SOY EL WEBSOCKET MAIN!!!");
        //le envio solo el rol de apciente porque desde este
        //Cliente solo entran pacientes
        conexion.send(JSON.stringify({operacion:"login",rol:"paciente",id:idPaciente}));
    });

    //cuando recibo un mensaje, se ejecuta el callback
    conexion.addEventListener('message', function (event) {
        var msg=JSON.parse(event.data);
        switch(msg.operacion){
            case "filtrarPacs":
                pacsFiltrados=filtrarPacs(idMedico,msg.pacientesTodos);
                break;
            case "notificar":
                var mensajeEmergente=msg.nombre+" ha compartido contigo que el día " + msg.muestra.fecha
                    +" realizó la actividad "+  msg.variable + " y obtuvo un valor de " +msg.muestra.valor;
                alert(mensajeEmergente);      
                break;
        }
        
    });
}

function enviar(){
    var selectValue=document.getElementById("formCompartir").value;
    console.log("Valor del select: ",selectValue);
    //Creo el  mensaje que voy a enviar al servidor
    switch (selectValue) {
        case "-1": //medico
        //le envio el nombre global del paciente para mostrarlo en el alert del medico
            conexion.send(JSON.stringify({operacion: "enviar",
                valorSelect: selectValue, muestra:muestraACompartir,rol:"medico",
                nombre:pacienteGlobal.nombre,idMedico:idMedico}));
            break;
        case "-2": //todos
            conexion.send(JSON.stringify({operacion: "enviar",
            valorSelect: selectValue, muestra:muestraACompartir, rol:"todos",nombre:pacienteGlobal.nombre}));
            break;
        default://un paciente en concreto
            conexion.send(JSON.stringify({operacion: "enviar",
            valorSelect: selectValue, muestra:muestraACompartir, rol:"paciente",nombre:pacienteGlobal.nombre}));
        break;
        
    }
   //Dejo el formulario de envio del value vacio
    alert("Has compartido tu logro!");
    cambiarSeccion("listaPacientes");
}









