//crear selectores
const btnGuardarCliente = document.querySelector('#guardar-cliente');
const btnCerrar = document.querySelector('#cerrar')
const mostrar = document.querySelector('#mostrarPedidos')

//estructura para guardar
let cliente = {
    mesa:'',
    hora:'',
    pedido:[]
}

const categorias = {
    1:'Pizzas',
    2:'Postres',
    3:'Jugos',
    4:'Comida',
    5:'Cafe',
    6:'Bebidas'
}
const usuario = JSON.parse(localStorage.getItem('usuario'));
console.log(usuario);
if(!usuario){
    //caso de que el usuario no este en LS
    window.location.href = '../Home/index.html'
}


btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente(){
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    const camposVacios = [mesa,hora].some(campo => campo === '');

    if(camposVacios){
        //console.log('campos vacios')
        const existeAlerta = document.querySelector('.invalid-feedback')
        if(!existeAlerta){
            const alerta = document.querySelector('div');
            alerta.classList.add('invalid-feedback', 'text-center', 'text-danger');
            alerta.textContent = 'Los campos son obligatorios';
            document.querySelector('.modal-body form').appendChild(alerta);

            setTimeout(() =>{
                alerta.remove();
            },3000)
        }
    } else {
        //caso tener los campos llenos
       // console.log('campos llenos')

       cliente = {...cliente,mesa,hora}; //esto es para guardar los datos
       console.log(cliente)

       const modalForm = document.querySelector('#formulario');
       const modal = bootstrap.Modal.getInstance(modalForm);
       modal.hide();

       mostrarSecciones(); 
       obtenerMenu();

    }
}

function mostrarSecciones(){
    const secciones = document.querySelectorAll('.d-none')
    //console.log(secciones)

    secciones.forEach(seccion => seccion.classList.remove('d-none'))
}

function obtenerMenu() {
    const url = 'http://localhost:3000/menu'

    fetch(url)
    .then(respuesta =>respuesta.json())
    .then(resultado => mostrarMenu(resultado))
    .catch(error=>console.log(error))
}

function mostrarMenu(menu){
    const contenido = document.querySelector('#menu .contenido');

    menu.forEach(pos=> {
        const fila = document.createElement('div');
        fila.classList.add('row', 'border-top')
        const nombre = document.createElement('div');
        nombre.textContent = pos.nombre;
        nombre.classList.add('col-md-4', 'py-3')

        const precio = document.createElement('div');
        precio.textContent = '$'+pos.precio;
        precio.classList.add('col-md-3', 'py-3')

        const categoria = document.createElement('div');
        categoria.textContent = categorias[pos.categoria]
        categoria.classList.add('col-md-3', 'py-3')

        const inputCantidad = document.createElement('input');
        inputCantidad.type = 'number',
        inputCantidad.min = 0;
        inputCantidad.value = 0;
        inputCantidad.id = `producto-${pos.id}`;
        //inputCantidad.classList.add('col-1');
        inputCantidad.onchange = function(){
            const cantidad = parseInt(inputCantidad.value)
            agregarOrden({...pos,cantidad})
        }
        const agregar = document.createElement('div');
        agregar.classList.add('col-md-1', 'py,3');
        agregar.appendChild(inputCantidad)

        fila.appendChild(nombre);
        fila.appendChild(precio);
        fila.appendChild(categoria)
        fila.appendChild(agregar)

        contenido.appendChild(fila);
    })
}

function agregarOrden(producto) {
    let {pedido} = cliente;

    //const {producto} = cliente.pedido 
    

    //console.log(producto);
    if(producto.cantidad>0){
        //validar que el producto exista
        if (pedido.some(item =>item.id === producto.id)) {
            //haya productos
            const pedidoActualizado = pedido.map(i => {
                if(i.id === producto.id){
                    i.cantidad = producto.cantidad;
                }
                return i;
            })

            cliente.pedido = [...pedidoActualizado]
        }else {
            //caso de que no exista el producto
            //agregamos el nuevo
            cliente.pedido = [...pedido,producto]
            console.log(cliente)
        }
    }else {
        //caso cantidad es igual 0
        const resultado = pedido.filter(item => item.id !== producto.id);
        cliente.pedido = resultado;
    }
    limpiarHTML();

    if(cliente.pedido.length){
        actualizarResumen();
    }else{
        mensajePedidoVacio();
    }
    
    }
     
    function actualizarResumen(){
        const contenido = document.querySelector('#resumen .contenido');
        const resumen = document.createElement('div')
        resumen.classList.add('col-md-4', 'card', 'shadow', 'py-5', 'px-3')

        //mostrar la mesa 
        const mesa = document.createElement('p')
        mesa.textContent = 'Mesa: '
        mesa.classList.add('fw-bold');

        const mesaCliente = document.createElement('span');
        mesaCliente.textContent = cliente.mesa;
        mesa.appendChild(mesaCliente);

        //mostrar hora
        const hora = document.createElement('p')
        hora.textContent = 'Hora: '
        hora.classList.add('fw-bold');

        const horaCliente = document.createElement('span');
        horaCliente.textContent = cliente.hora;
        hora.appendChild(horaCliente)

        //mostrar los items del menu solcitados
        const heading = document.createElement('h3');
        heading.textContent = 'Pedidos: '
        heading.classList.add('my-4');

        const grupo = document.createElement('ul');
        grupo.classList.add('list-group');

        //producto pedido 
        const {pedido} = cliente;
        pedido.forEach(item =>{
            const {nombre,cantidad,precio,id} = item;
            const lista = document.createElement('li');
            lista.classList.add('list-group-item');

            const nombreP = document.createElement('h4');
            nombreP.textContent = nombre;
            nombreP.classList.add('text-center', 'my-4');

            const cantidadP = document.createElement('p');
            cantidadP.classList.add('fw-bold');
            cantidadP.textContent = 'Cantidad: ';

            const cantidadValor = document.createElement('span');
            cantidadValor.textContent = cantidad;

            const precioP = document.createElement('p');
            precioP.classList.add('fw-bold');
            precioP.textContent = 'Precio'; 

            const precioValor = document.createElement('span');
            precioValor.textContent = `$${precio}`;

            const subtotalP = document.createElement('p')
            subtotalP.classList.add('fw-bold');
            subtotalP.textContent = 'Subtotal';

            const subtotalValor = document.createElement('span')
            subtotalValor.textContent = calcularSubtotal(item);


            //boton eliminar 
            const btnEliminar = document.createElement('button');
            btnEliminar.classList.add('btn', 'btn-danger')
            btnEliminar.textContent = 'Eliminar pedido'
            btnEliminar.onclick = function(){
                eliminarProductos(id)
            }

            cantidadP.appendChild(cantidadValor)
            precioP.appendChild(precioValor)
            subtotalP.appendChild(subtotalValor)

            lista.appendChild(nombreP);
            lista.appendChild(cantidadP);
            lista.appendChild(precioP);
            lista.appendChild(subtotalP)
            lista.appendChild(btnEliminar)


            grupo.appendChild(lista);
        })
         
        resumen.appendChild(hora)
        resumen.appendChild(mesa);
        resumen.appendChild(heading);
        resumen.appendChild(grupo);

        contenido.appendChild(resumen);

        //mostrar la calculadora de propinas 
       formularioPropinas();
    
    }
    

    function formularioPropinas(){
        const contenido = document.querySelector('#resumen .contenido')
        const formulario = document.createElement('div')
        formulario.classList.add('col-md-4', 'formulario');

        const heading = document.createElement('h3')
        heading.classList.add('my-4');
        heading.textContent = 'Propina';

        //propina 5%
        const op5 = document.createElement('input')
        op5.type = 'radio';
        op5.name = 'propina';
        op5.value = '5';
        op5.classList.add('form-check-input')
        op5.onclick = calcularPropina;

        const labelop5 = document.createElement('label');
        labelop5.classList.add('px-2')
        labelop5.textContent = '5%'

        //propina 10%
        const op10 = document.createElement('input')
        op10.type = 'radio';
        op10.name = 'propina';
        op10.value = '10';
        op10.classList.add('form-check-input')
        op10.onclick = calcularPropina;

        const labelop10 = document.createElement('label');
        labelop10.classList.add('px-2')
        labelop10.textContent = '10%'

        formulario.appendChild(heading);
        formulario.appendChild(op5);
        formulario.appendChild(labelop5)
        formulario.appendChild(op10)
        formulario.appendChild(labelop10)

        contenido.appendChild(formulario)
        
    }

    function calcularPropina(){
        //console.log('calcular propina');
        const radioSeleccionado = document.querySelector('[name = "propina"]:checked').value;
        //console.log(radioSeleccionado)

        const {pedido} = cliente;
        let subtotal = 0;
        pedido.forEach(i => {
            subtotal += i.cantidad * i.precio;
        })

        const divTotales = document.createElement('div');
        divTotales.classList.add('total-pagar')

        //propina
        const propina = (subtotal+parseInt(radioSeleccionado))/100;
        const iva = subtotal*0.16
        const total = propina + subtotal + iva;

        //subtotal
        const subtotalP = document.createElement('p');
        subtotalP.textContent = 'Subtotal Pedido'
        subtotalP.classList.add('fw-bold', 'fs-3', 'mt-5')

        const subtotalValor = document.createElement('span');
        subtotalValor.textContent = `$${subtotal}`;
        subtotalP.appendChild(subtotalValor);

        //iva
        const ivaP = document.createElement('p');
        ivaP.textContent = 'IVA 16%: ';

        const ivaValor = document.createElement('span');
        ivaValor.textContent = `$${iva}`;
        ivaP.appendChild(ivaValor);

        //propina
        const propinaP = document.createElement('p');
        propinaP.textContent = 'Propina: ';

        const propinaValor = document.createElement('span')
        propinaValor.textContent = `$${propina}`;
        propinaP.appendChild(propinaValor);

        const totalP = document.createElement('p');
        totalP.textContent = 'Total a pagar: '

        const totalValor = document.createElement('p');
        totalValor.textContent = `$${total}`;
        totalP.appendChild(totalValor);

        const totalPagarDiv = document.querySelector('.total-pagar');
        if (totalPagarDiv) {
            totalPagarDiv.remove();
        }

        const btnGuardar = document.createElement('button')
        btnGuardar.classList.add('btn','btn-success')
        btnGuardar.textContent = 'Guardar Pedido'

        divTotales.appendChild(subtotalP);
        divTotales.appendChild(ivaP);
        divTotales.appendChild(propinaP);
        divTotales.appendChild(totalP);
        divTotales.appendChild(btnGuardar);
      

        const formulario = document.querySelector('.formulario')
        formulario.appendChild(divTotales);

        btnGuardar.addEventListener('click', async e => {
            e.preventDefault();
            await fetch('http://localhost:3000/Cliente', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({mesa:cliente.mesa,hora:cliente.hora,pedido:cliente.pedido, mesero:usuario.nombre})
            })
            obtenerLista()
        });
        
    }

    const obtenerLista = async () => {
        //la ruta a la cual se va a consultar
        const respuesta = await fetch('http://localhost:3000/Cliente', {
            method: 'GET'
        })
        const list = await respuesta.json();
        //comparar el nombre del objeto json con el nombre de la persona logueada
        const userList = list.filter(lista => lista.mesero === usuario.nombre)
        
        //console.log(list)
        userList.forEach(i => {
            const {mesa, hora, mesero, pedido} = i;    
            console.log(pedido[0].categoria);

            const listado = document.createElement('div');
            listado.classList.add('d-flex' , 'justify-content-evenly', 'mt-4')

        
            mostrar.classList.add('card', 'py-5', 'px-3')
             
            listado.innerHTML = `<li id=${i.id} class="card shadow border border-dark p-3 col-3"
            <p>Mesa: ${mesa}</p>
            <p>Hora: ${hora}</p>  
            <p>Mesero: ${mesero}</p>
            <p>Pedido: ${pedido[0].nombre}</p>
            <p>Precio: $${pedido[0].precio}</p>
            <p>Cantidad: ${pedido[0].cantidad}</p>
            <button class="delete-btn btn-danger p-1 border-0 rounded-3 mb-2">Eliminar</button>
            </li>
            `
            mostrar.appendChild(listado);
        });
    }
    obtenerLista();

    mostrar.addEventListener('click', async e=> {
        e.preventDefault();
        if(e.target.classList.contains('delete-btn')) {
            const id = e.target.parentElement.id;
            await fetch(`http://localhost:3000/Cliente/${id}`, {
            method: 'DELETE'
            })
            e.target.parentElement.remove();
            //console.log(id)
            //console.log('eliminar');
        } 
    })



function calcularSubtotal(p) {
    const {cantidad,precio} = p;
    return `$${cantidad*precio}`
} 

function eliminarProductos(id){
    const {pedido} = cliente;
    cliente.pedido = pedido.filter(i => i.id !== id)

    limpiarHTML();

    if(cliente.pedido.length){
        actualizarResumen();
    }else{
        
         mensajePedidoVacio();
    }

     const productoEliminado = `#producto-${id}` 
     const inputEliminado = document.querySelector(productoEliminado)
     inputEliminado.value = 0;
}

  
function limpiarHTML() {
    const contenido = document.querySelector('#resumen .contenido')
    while(contenido.firstChild){
        contenido.removeChild(contenido.firstChild)
    } 

  //ahora como eliminamos el producto debemos actualizar la cantidad en 0
}

function mensajePedidoVacio(){
    const contenido = document.querySelector('#resumen .contenido')
    const texto = document.createElement('p')
    texto.classList.add('text-center')
    texto.textContent = 'Agrega productos al pedido';
    contenido.appendChild(texto)
}

btnCerrar.addEventListener('click', async e=> {
    localStorage.removeItem('usuario');
    window.location.href = '../Home/index.html'
})

//crear para guardar en cliente y login para mesero guarda usuario y mesero
//un mesero puede atender varias mesas 