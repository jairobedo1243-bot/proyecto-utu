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

const quitarEstadoVacio = (contenedor) => {
    const vacio = contenedor.querySelector(".empty-row, .empty-message");

    if (vacio) {
        vacio.remove();
    }
};

const crearCelda = (texto) => {
    const celda = document.createElement("td");
    celda.textContent = texto;
    return celda;
};

const incrementarNumero = (selector) => {
    const elemento = document.querySelector(selector);
    const valorActual = Number(elemento.textContent);
    elemento.textContent = valorActual + 1;
};

const sincronizarReportes = () => {
    document.querySelector("#reporteEquipos").textContent = document.querySelector("#totalEquipos").textContent;
    document.querySelector("#reporteTickets").textContent = document.querySelector("#ticketsPendientes").textContent;
    document.querySelector("#reporteSolicitudes").textContent = document.querySelector("#solicitudesSemana").textContent;
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

        const tablaInventario = document.querySelector("#tablaInventario");
        const fila = document.createElement("tr");
        const datos = [
            document.querySelector("#codigoEquipo").value.trim(),
            document.querySelector("#tipoEquipo").value,
            document.querySelector("#ubicacionEquipo").value.trim()
        ];

        datos.forEach((dato) => {
            fila.appendChild(crearCelda(dato));
        });

        const celdaEstado = document.createElement("td");
        celdaEstado.appendChild(crearEstado(document.querySelector("#estadoEquipo").value));
        fila.appendChild(celdaEstado);

        quitarEstadoVacio(tablaInventario);
        tablaInventario.prepend(fila);
        incrementarNumero("#totalEquipos");
        sincronizarReportes();
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

        const listaTickets = document.querySelector("#listaTickets");
        const numeroTicket = Math.floor(1000 + Math.random() * 9000);
        const articulo = document.createElement("article");
        articulo.className = "ticket-item";

        const contenido = document.createElement("div");
        const titulo = document.createElement("strong");
        const descripcion = document.createElement("p");

        titulo.textContent = `#TK-${numeroTicket} - ${document.querySelector("#categoriaTicket").value} - ${document.querySelector("#prioridadTicket").value}`;
        descripcion.textContent = `${document.querySelector("#solicitanteTicket").value.trim()}: ${document.querySelector("#descripcionTicket").value.trim()}`;

        contenido.appendChild(titulo);
        contenido.appendChild(descripcion);
        articulo.appendChild(contenido);
        articulo.appendChild(crearEstado("Pendiente"));

        quitarEstadoVacio(listaTickets);
        listaTickets.prepend(articulo);
        incrementarNumero("#ticketsPendientes");
        sincronizarReportes();
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

    const tablaPrestamos = document.querySelector("#tablaPrestamos");
    const fila = document.createElement("tr");
    const celdaEstado = document.createElement("td");

    fila.appendChild(crearCelda(document.querySelector("#equipoPrestamo").value.trim()));
    fila.appendChild(crearCelda(document.querySelector("#personaPrestamo").value.trim()));
    fila.appendChild(crearCelda(document.querySelector("#fechaDevolucion").value));
    celdaEstado.appendChild(crearEstado("Prestado"));
    fila.appendChild(celdaEstado);

    quitarEstadoVacio(tablaPrestamos);
    tablaPrestamos.prepend(fila);
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

    const tablaSolicitudes = document.querySelector("#tablaSolicitudes");
    const fila = document.createElement("tr");
    const celdaEstado = document.createElement("td");

    fila.appendChild(crearCelda(document.querySelector("#docenteSolicitud").value.trim()));
    fila.appendChild(crearCelda(document.querySelector("#tipoSolicitud").value));
    fila.appendChild(crearCelda(document.querySelector("#fechaSolicitud").value));
    fila.appendChild(crearCelda(document.querySelector("#laboratorioSolicitud").value.trim()));
    celdaEstado.appendChild(crearEstado("Pendiente"));
    fila.appendChild(celdaEstado);

    quitarEstadoVacio(tablaSolicitudes);
    tablaSolicitudes.prepend(fila);
    incrementarNumero("#solicitudesSemana");
    sincronizarReportes();
    formulario.reset();
    mostrarMensaje("Solicitud de servicio registrada.");
});

sincronizarReportes();
