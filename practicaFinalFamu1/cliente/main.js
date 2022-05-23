//VARIABLES GLOBALES

var seccionActual = "login";
//creo una variable medicoGlobal para recoger el id 
//del medico que ha hecho login en el programa
var idMedicoGlobal;
//id global del pac
var idPacienteGlobal;
//creo la ocnexion para el ws
var conexion ="";



//fuciones para salir etc...
function cambiarSeccion(seccion){   
    document.getElementById(seccionActual).classList.remove("activa");
    document.getElementById(seccion).classList.add("activa");
    seccionActual=seccion;
}
function salir(){
    cambiarSeccion("login");
    resetLogin();
}

function salirlistado(){
    cambiarSeccion("listado");
    mostrarPacientes(idMedicoGlobal);
}
function resetLogin(){
    //si hago reload NO pierdon la nueva info metida
    location.reload();
}
function cambiarA_agregarPac(){
    cambiarSeccion("agregarPaciente");
}













//controla y da la bienvenida 
function controlarAcceso(){  
    var log={
    login: document.getElementById("loginMedico").value,
    pass: document.getElementById("pass").value
    };
    //desde esta ruta le mando log al server para validar los datos
    //el callback se ejecuta cuadno deeuvlo un estado y respuesta
    rest.post("/api/medico/login", log, function (estado, envioMedico) {
        //console.log(envioMedico);
        if(estado == 200){
            //el id del medico global
            idMedicoGlobal=envioMedico[1];
            openWsMedico();
            cambiarSeccion("listado");
            var welcome= document.getElementById("bienvenida");
            welcome.innerHTML="Bienvenido al menu principal: " + envioMedico[0] +"<br>" +" "+ "Estos son tus pacientes: ";
            //repsuesta==id del medico que me devuelve el servidor
            mostrarPacientes(idMedicoGlobal);
        }else{
            alert("Error al introducir los datos");
            resetLogin();
        }
        //id global del medico
    });
}

//obtieeen un array con los datos de sus pacientes
//le debo pasar el id del medico como parametro para poder crear la url 
function mostrarPacientes(id){
    rest.get("/api/medico/"+id+"/pacientes", (estado, newPac) => {
        if (estado != 200) {
            alert("Error cargando la lsita de pacientes");
        }
        console.log("msotrar",newPac);
        var lista = document.getElementById("pacientes");
        lista.innerHTML = "";  
        for (var i = 0; i < newPac.length; i++) {
            lista.innerHTML += "<li>" + "Paciente"+ " " + (i+1) +":   ID: " + newPac[i].id + " - " + newPac[i].nombre + " - Fecha de Nacimiento:  " + newPac[i].fecha_nacim+ " - Género: " + newPac[i].genero + " - ID del Médico: "+ newPac[i].medicoID + " - Código acceso: "+ newPac[i].codigo_acceso + " - Observaciones: "+ newPac[i].observaciones+ "  "+ " - " + '<button type="submit" onclick="imprimirVariablesPaciente('+newPac[i].id+')"> Consultar </button>'+ " " + '<button type="submit" onclick="duplicar('+newPac[i].id+')"> Duplicar </button>' + "</li><br>";
        }
    });
}

function imprimirVariablesPaciente(id){
    //el id que le paso como parametro es el id que se aigna a cada boton 
    //que se va creando
    var idactualMuestra;
    cambiarSeccion("expedientePac");
    imprimirDatosPaciente(id);
    rest.get("/api/paciente/"+id+'/muestras', (estado, newMus) => {
        //console.log("Muestras de ese paciente: ",newMus);
        var arrayVari=newMus;
            if (estado != 200) {
                alert("Error cargando el paciente");
                cambiarSeccion("listado");
            }
            var listaVar= document.getElementById("listaVariables");
            listaVar.innerHTML = "";
            for (var i = 0; i < arrayVari.length; i++) {
                idactualMuestra=arrayVari[i].idMuestra;
                listaVar.innerHTML +=  "<li> Muestra: "+i+" con ID: " + idactualMuestra+" Valor: "+arrayVari[i].valor+"</li><br>";
            }
    });
}

function imprimirDatosPaciente(id){
    idPacienteGlobal=id;
    //cambiarSeccion("expedientePac");
    rest.get("/api/paciente/"+id , (estado, datosPaciente) => {
        // console.log(respuesta);
        var arrayDatos=datosPaciente;
        //console.log("Datos del paciente: ",arrayDatos);
         if (estado != 200) {
             alert("Error cargando el paciente");
         }
         var listaVar= document.getElementById("listadatos");
         //creo este array para imprimir el nombre de los valores que tendran las 
         //variables que se van a mostrar
         var arrayForPrint=['ID: ', "Nombre: ", "ID del médico: ", "Observaciones: "];
         listaVar.innerHTML = "";    
         for (var i=0; i<arrayDatos.length;i++) {
            listaVar.innerHTML += "<li>"+arrayForPrint[i]+ " "+ arrayDatos[i]+"</li><br>";        
         }
         listaVar.innerHTML += '<button onclick="modificarDatos('+id+')">Modificar Datos Paciente</button>' ;
         
     });

}

//agrega un paciente a la bbdd
function agregarPaciente(){
    //recojo el paciente del formulario 
    var nuevoPaciente={
        nombreNuevoPaciente: document.getElementById("nombreNuevoPaciente").value,
        fechaNacimientoNuevoPaciente: document.getElementById("fechaNacimNuevoPaciente").value,
        generoNuevoPaciente: document.getElementById("generoNuevoPaciente").value,
        codigoAccesoNuevoPaciente: document.getElementById("codigoAccesoNuevoPaciente").value, 
        obersvacionesNuevoPaciente: document.getElementById("obersvacionesNuevoPaciente").value,               
        };
    if(nuevoPaciente.nombreNuevoPaciente==""||nuevoPaciente.fechaNacimientoNuevoPaciente==""||
        nuevoPaciente.generoNuevoPaciente==""||nuevoPaciente.codigoAccesoNuevoPaciente==""
        ||nuevoPaciente.obersvacionesNuevoPaciente==""){
        alert("Rellene todos los campos");
    }else{        
        // console.log(nuevoPaciente);
        rest.post("/api/medico/"+idMedicoGlobal+"/pacientes", nuevoPaciente, (estado,respuesta) => {
            if (estado == 201) {
                //medicoGlobal== id del medico que acutalmente está en el sistema
                alert("Se ha añadido un nuevo paciente!");
                mostrarPacientes(idMedicoGlobal); 
                document.getElementById("nombreNuevoPaciente").value="";
                document.getElementById("fechaNacimNuevoPaciente").value="";
                document.getElementById("generoNuevoPaciente").value="";
                document.getElementById("codigoAccesoNuevoPaciente").value="";
                document.getElementById("obersvacionesNuevoPaciente").value="";
                cambiarSeccion("listado");
            }else{
                alert("Error introduciendo nuevo paciente");
                cambiarSeccion("listado");
            }
        });
    }


}


function modificarDatos(id){
    //creo el nuevo paciente
    var nuevoPaciente={
        nombreNuevoPaciente: document.getElementById("nombreNuevoPaciente2").value,
        fechaNacimientoNuevoPaciente: document.getElementById("fechaNacimNuevoPaciente2").value,
        generoNuevoPaciente: document.getElementById("generoNuevoPaciente2").value,
        codigoAccesoNuevoPaciente: document.getElementById("codigoAccesoNuevoPaciente2").value, 
        obersvacionesNuevoPaciente: document.getElementById("obersvacionesNuevoPaciente2").value,               
    };
    if(nuevoPaciente.nombreNuevoPaciente==""||nuevoPaciente.fechaNacimientoNuevoPaciente=="" ||
    nuevoPaciente.generoNuevoPaciente==""||nuevoPaciente.codigoAccesoNuevoPaciente==""||
    nuevoPaciente.obersvacionesNuevoPaciente==""){
        alert("Rellene todos los campos");
    }else{
        //console.log("Este es el nuevo paciente: ",nuevoPaciente);
        rest.put("/api/paciente/"+id , nuevoPaciente, (estado,respuesta) => {
            //como cuando le envio al servidor los nuevos datos del apc se actualiza sola 
            //la bbdd no tengo que hacer nada con la respuesta que me envía el servidor.
           if (estado == 201) {
               imprimirVariablesPaciente(id);
               //ponemos el formulario vacio
               document.getElementById("nombreNuevoPaciente2").value="";
               document.getElementById("fechaNacimNuevoPaciente2").value="";
               document.getElementById("generoNuevoPaciente2").value="";
               document.getElementById("codigoAccesoNuevoPaciente2").value="";
               document.getElementById("obersvacionesNuevoPaciente2").value="";
               alert("Se han modificado los datos del paciente!");
           }else{
               alert("Error introduciendo nuevo paciente");   
           }
       });
       imprimirDatosPaciente(id);
    }
}

function Filtrar(){
    var listafiltrar= document.getElementById('listaVariables1').value;
    //console.log("Esta es la variable a filtrar: ",listafiltrar)
    rest.get("/api/paciente/"+idPacienteGlobal+"/muestras/"+listafiltrar , (estado, respuesta) => {
        //console.log('Muetsras que me envia el server: ', respuesta);
        var muestraFiltrada=[];
        muestraFiltrada=respuesta;
         if (estado != 200) {
             alert("NO existen muestras para esas variables.");
             return;
         }
         alert("Esta es la evolucion de la variable elegida!");
         var listaVar= document.getElementById("listaVariables");
         listaVar.innerHTML = "";   
         //si es ==9 que es mostrar todas las variables
         if(listafiltrar==9){
            imprimirVariablesPaciente(idPacienteGlobal);
         }
        else{
            for(var i = 0; i < muestraFiltrada.length; i++) {
                listaVar.innerHTML += "<li>" +muestraFiltrada[i].valor+ "</li>";       
            }
        }
     });

}


function duplicar(idPac){
    rest.post("/api/paciente/"+idPac+"/duplicar",function(estado,respuesta){
        console.log("estoy aqui");
        if(estado==200){
            cambiarSeccion("listado");
            mostrarPacientes(idMedicoGlobal);
        }else{
            alert("error no se ha duplicado el apciente");
        }
    });
}












//web socket para el medico

function openWsMedico(){
    conexion = new WebSocket('ws://localhost:4444', "pacientes");
    //con esto le digo al server que estoy conectado
    conexion.addEventListener('open', function (event) {
        console.log("SOY EL WEBSOCKET MAIN!!!");
        conexion.send(JSON.stringify({operacion:"login",rol:"medico",id:idMedicoGlobal}));
    }); // Connection opened 

    conexion.addEventListener('message', function (event){
        var msg=JSON.parse(event.data);
        //console.log(msg);
        switch(msg.operacion){
            case "notificar":
                var mensajeEmergente=msg.nombre+" ha compartido contigo que el día " + msg.muestra.fecha
                    +" realizó la actividad "+  msg.variable + " y obtuvo un valor de " +msg.muestra.valor;
                alert(mensajeEmergente);      
                break;
        }
    });
}








