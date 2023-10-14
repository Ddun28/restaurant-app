const login = document.querySelector('#login')
const create = document.querySelector('#registrar')
const inputL = document.querySelector('#input-login')
const inputC = document.querySelector('#create-input')
const notificacion = document.querySelector('.notificacion')

create.addEventListener('submit', async e => {
    e.preventDefault();

    const respuesta = await fetch('http://localhost:3000/Mesero', {
        method:'GET'
    });
    const usuarios = await respuesta.json();

    const usuario = usuarios.find(usuario => usuario.nombre === inputC.value);
    
    if(!inputC.value){
        //console.log("no puede estar vacio");
        notificacion.innerHTML = "el usuario no puede estar vacio";
        notificacion.classList.add('show-notification');

        setTimeout(()=>{
            notificacion.remove('show-notification')
        },2000);
    }else if(usuario){
       // console.log('existe');
        notificacion.innerHTML = "El usuario ya existe";
        notificacion.classList.add('show-notification');

        setTimeout(()=>{
            notificacion.remove('show-notification')
        },2000);
    }else{
        await fetch('http://localhost:3000/Mesero', {
            method:'POST',
            headers:{
                'Content-Type' : 'application/json'
            },
            body:JSON.stringify({nombre:inputC.value})
        });
        notificacion.innerHTML = `El usuario ${createInput.value} ha sido creado`
        notificacion.classList.add('show-notification');
        setTimeout(()=>{
            notificacion.remove('show-notification')
        },2000);
        createInput.value = '';
    }
})

login.addEventListener('submit', async e => {
    e.preventDefault()

    const respuesta = await fetch('http://localhost:3000/Mesero', {
        method:'GET'
    });
    const usuarios = await respuesta.json();

    const usuario = usuarios.find(usuario => usuario.nombre === inputL.value);

    if(!usuario){
        notificacion.innerHTML = `El usuario no existe`
        notificacion.classList.add('show-notification');
        setTimeout(()=>{
            notificacion.remove('show-notification')
        },2000);
    }else{
        localStorage.setItem('usuario', JSON.stringify(usuario));
        window.location.href = '../pedidos/index.html'
    }
})