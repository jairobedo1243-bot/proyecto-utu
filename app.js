"use strict";

const mensajeSistema = document.querySelector("#mensajeSistema");
const appContent = document.querySelector("#appContent");
const loginSection = document.querySelector("#login");
const panelSesion = document.querySelector("#panelSesion");
const usuarioActual = document.querySelector("#usuarioActual");
const btnCerrarSesion = document.querySelector("#btnCerrarSesion");
const menuModulos = document.querySelector("#menuModulos");

const usuariosSistema = [
    {
        email: "admin@sgrsi.local",
        password: "admin123",
        nombre: "Administrador SGRSI",
        rol: "Administrador"
    },
    {
        email: "tecnico@sgrsi.local",
        password: "tecnico123",
        nombre: "Tecnico Soporte",
        rol: "Tecnico"
    },
    {
        email: "usuario@sgrsi.local",
        password: "usuario123",
        nombre: "Usuario Solicitante",
        rol: "Solicitante"
    }
];

const mostrarMensaje = (texto) => {
    mensajeSistema.textContent = texto;
    mensajeSistema.classList.add("visible");

    window.setTimeout(() => {
        mensajeSistema.classList.remove("visible");
    }, 3000);
};

const obtenerMensajeError = (campo) => {
    if (campo.validity.valueMissing) {
        return "Este campo es obligatorio.";
    }

    if (campo.validity.tooShort) {
        return `Debe tener al menos ${campo.minLength} caracteres.`;
    }

    if (campo.validity.typeMismatch) {
        return "El formato ingresado no es valido.";
    }

    return "Revisa el valor ingresado.";
};

const validarCampo = (campo) => {
    const contenedor = campo.closest(".mb-3") || campo.parentElement;
    const error = contenedor.querySelector(".error-message");

    if (campo.checkValidity()) {
        campo.classList.remove("is-invalid");
        if (error) {
            error.textContent = "";
        }
        return true;
    }

    campo.classList.add("is-invalid");
    if (error) {
        error.textContent = obtenerMensajeError(campo);
    }
    return false;
};

const validarFormulario = (formulario) => {
    const campos = Array.from(formulario.querySelectorAll("input, select, textarea"));
    return campos.every((campo) => validarCampo(campo));
};

const crearEstado = (texto) => {
    const estado = document.createElement("span");
    estado.textContent = texto;
    estado.className = "status";

    if (texto === "Disponible" || texto === "Resuelto") {
        estado.classList.add("status-ok");
    } else if (texto === "Prestado" || texto === "En proceso") {
        estado.classList.add("status-warning");
    } else {
        estado.classList.add("status-danger");
    }

    return estado;
};

const incrementarNumero = (selector) => {
    const elemento = document.querySelector(selector);
    const valorActual = Number(elemento.textContent);
    elemento.textContent = valorActual + 1;
};

const rolPuedeVer = (rolesPermitidos, rolUsuario) => {
    return rolesPermitidos.split(",").map((rol) => rol.trim()).includes(rolUsuario);
};

const aplicarPermisos = (usuario) => {
    document.querySelectorAll("[data-roles]").forEach((seccion) => {
        const puedeVer = rolPuedeVer(seccion.dataset.roles, usuario.rol);
        seccion.classList.toggle("module-hidden", !puedeVer);
    });

    menuModulos.querySelectorAll(".nav-link").forEach((link) => {
        const idSeccion = link.getAttribute("href").replace("#", "");
        const seccion = document.getElementById(idSeccion);
        const puedeVer = !seccion || !seccion.dataset.roles || rolPuedeVer(seccion.dataset.roles, usuario.rol);
        link.closest(".nav-item").classList.toggle("d-none", !puedeVer);
    });
};

const iniciarSesion = (usuario) => {
    loginSection.classList.add("d-none");
    appContent.classList.remove("is-locked");
    panelSesion.classList.remove("d-none");
    usuarioActual.textContent = `${usuario.nombre} - ${usuario.rol}`;
    aplicarPermisos(usuario);
    mostrarMensaje(`Bienvenido, ${usuario.nombre}.`);
    window.location.hash = "#inicio";
};

const cerrarSesion = () => {
    appContent.classList.add("is-locked");
    loginSection.classList.remove("d-none");
    panelSesion.classList.add("d-none");
    usuarioActual.textContent = "";
    document.querySelector("#formLogin").reset();
    mostrarMensaje("Sesion cerrada correctamente.");
    window.location.hash = "#login";
};

document.querySelectorAll(".app-form").forEach((formulario) => {
    formulario.addEventListener("input", (evento) => {
        if (evento.target.matches("input, select, textarea")) {
            validarCampo(evento.target);
        }
    });
});

document.querySelector("#formLogin").addEventListener("submit", (evento) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;

    if (!validarFormulario(formulario)) {
        mostrarMensaje("Ingrese correo y contrasena para continuar.");
        return;
    }

    const email = document.querySelector("#emailLogin").value.trim().toLowerCase();
    const password = document.querySelector("#passwordLogin").value;
    const usuario = usuariosSistema.find((item) => item.email === email && item.password === password);

    if (!usuario) {
        mostrarMensaje("Usuario o contrasena incorrectos.");
        return;
    }

    iniciarSesion(usuario);
});

btnCerrarSesion.addEventListener("click", cerrarSesion);

document.querySelector("#formInventario").addEventListener("submit", (evento) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;

    try {
        if (!validarFormulario(formulario)) {
            mostrarMensaje("Hay datos del inventario que deben corregirse.");
            return;
        }

        const fila = document.createElement("tr");
        const datos = [
            document.querySelector("#codigoEquipo").value.trim(),
            document.querySelector("#tipoEquipo").value,
            document.querySelector("#ubicacionEquipo").value.trim()
        ];

        datos.forEach((dato) => {
            const celda = document.createElement("td");
            celda.textContent = dato;
            fila.appendChild(celda);
        });

        const celdaEstado = document.createElement("td");
        celdaEstado.appendChild(crearEstado(document.querySelector("#estadoEquipo").value));
        fila.appendChild(celdaEstado);

        document.querySelector("#tablaInventario").prepend(fila);
        incrementarNumero("#totalEquipos");
        formulario.reset();
        mostrarMensaje("Equipo registrado correctamente.");
    } catch (error) {
        console.error(error);
        mostrarMensaje("No se pudo registrar el equipo.");
    }
});

document.querySelector("#formTicket").addEventListener("submit", (evento) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;

    try {
        if (!validarFormulario(formulario)) {
            mostrarMensaje("Completa correctamente los datos del ticket.");
            return;
        }

        const numeroTicket = Math.floor(1000 + Math.random() * 9000);
        const articulo = document.createElement("article");
        articulo.className = "ticket-item";

        const contenido = document.createElement("div");
        const titulo = document.createElement("strong");
        const descripcion = document.createElement("p");

        titulo.textContent = `#TK-${numeroTicket} - ${document.querySelector("#categoriaTicket").value}`;
        descripcion.textContent = document.querySelector("#descripcionTicket").value.trim();

        contenido.appendChild(titulo);
        contenido.appendChild(descripcion);
        articulo.appendChild(contenido);
        articulo.appendChild(crearEstado("Pendiente"));

        document.querySelector("#listaTickets").prepend(articulo);
        incrementarNumero("#ticketsPendientes");
        formulario.reset();
        mostrarMensaje("Ticket creado y enviado a soporte.");
    } catch (error) {
        console.error(error);
        mostrarMensaje("No se pudo crear el ticket.");
    }
});

document.querySelector("#formPrestamo").addEventListener("submit", (evento) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;

    if (!validarFormulario(formulario)) {
        mostrarMensaje("Revisa los datos del prestamo.");
        return;
    }

    incrementarNumero("#prestamosActivos");
    formulario.reset();
    mostrarMensaje("Prestamo registrado correctamente.");
});

document.querySelector("#formSolicitud").addEventListener("submit", (evento) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;

    if (!validarFormulario(formulario)) {
        mostrarMensaje("Revisa los datos de la solicitud.");
        return;
    }

    formulario.reset();
    mostrarMensaje("Solicitud de servicio registrada.");
});
