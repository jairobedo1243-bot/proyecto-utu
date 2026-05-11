"use strict";

const mensajeSistema = document.querySelector("#mensajeSistema");

const mostrarMensaje = (texto) => {
    if (!mensajeSistema) {
        return;
    }

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

const registrarSubmit = (selector, accion) => {
    const formulario = document.querySelector(selector);

    if (formulario) {
        formulario.addEventListener("submit", accion);
    }
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

const crearBoton = (texto, tipo, accion) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = texto;
    boton.className = `btn btn-sm ${tipo}`;
    boton.addEventListener("click", accion);
    return boton;
};

const crearAcciones = (editar, eliminar) => {
    const acciones = document.createElement("div");
    acciones.className = "record-actions";
    acciones.appendChild(crearBoton("Editar", "btn-outline-secondary", editar));
    acciones.appendChild(crearBoton("Eliminar", "btn-outline-danger", eliminar));
    return acciones;
};

const crearCeldaAcciones = (editar, eliminar) => {
    const celda = document.createElement("td");
    celda.appendChild(crearAcciones(editar, eliminar));
    return celda;
};

const actualizarTexto = (selector, texto) => {
    const elemento = document.querySelector(selector);

    if (elemento) {
        elemento.textContent = texto;
    }
};

const obtenerTexto = (selector) => {
    const elemento = document.querySelector(selector);
    return elemento ? elemento.textContent : "0";
};

const contarRegistrosTabla = (selector) => {
    return document.querySelectorAll(`${selector} tr:not(.empty-row)`).length;
};

const contarTickets = () => {
    return document.querySelectorAll("#listaTickets .ticket-item").length;
};

const actualizarContadores = () => {
    actualizarTexto("#totalEquipos", contarRegistrosTabla("#tablaInventario"));
    actualizarTexto("#ticketsPendientes", contarTickets());
    actualizarTexto("#prestamosActivos", contarRegistrosTabla("#tablaPrestamos"));
    actualizarTexto("#solicitudesSemana", contarRegistrosTabla("#tablaSolicitudes"));
    sincronizarReportes();
};

const sincronizarReportes = () => {
    actualizarTexto("#reporteEquipos", obtenerTexto("#totalEquipos"));
    actualizarTexto("#reporteTickets", obtenerTexto("#ticketsPendientes"));
    actualizarTexto("#reporteSolicitudes", obtenerTexto("#solicitudesSemana"));
};

const mostrarEstadoVacioTabla = (selector, columnas, texto) => {
    const tabla = document.querySelector(selector);

    if (contarRegistrosTabla(selector) === 0) {
        const fila = document.createElement("tr");
        fila.className = "empty-row";
        const celda = document.createElement("td");
        celda.colSpan = columnas;
        celda.textContent = texto;
        fila.appendChild(celda);
        tabla.appendChild(fila);
    }
};

const mostrarEstadoVacioTickets = () => {
    const listaTickets = document.querySelector("#listaTickets");

    if (contarTickets() === 0) {
        const mensaje = document.createElement("p");
        mensaje.className = "empty-message";
        mensaje.textContent = "Todavia no hay tickets registrados.";
        listaTickets.appendChild(mensaje);
    }
};

const pedirDato = (mensaje, valorActual) => {
    const nuevoValor = window.prompt(mensaje, valorActual);

    if (nuevoValor === null) {
        return valorActual;
    }

    return nuevoValor.trim() || valorActual;
};

const editarFilaTabla = (fila, campos, indiceEstado = null) => {
    campos.forEach((campo, indice) => {
        if (indice === indiceEstado) {
            const estadoActual = fila.children[indice].textContent.trim();
            const nuevoEstado = pedirDato(campo, estadoActual);
            fila.children[indice].replaceChildren(crearEstado(nuevoEstado));
            return;
        }

        fila.children[indice].textContent = pedirDato(campo, fila.children[indice].textContent.trim());
    });

    mostrarMensaje("Registro modificado correctamente.");
};

const eliminarFilaTabla = (fila, opciones) => {
    if (!window.confirm("Desea eliminar este registro?")) {
        return;
    }

    fila.remove();
    mostrarEstadoVacioTabla(opciones.selector, opciones.columnas, opciones.textoVacio);
    actualizarContadores();
    mostrarMensaje("Registro eliminado correctamente.");
};

document.querySelectorAll(".app-form").forEach((formulario) => {
    formulario.addEventListener("input", (evento) => {
        if (evento.target.matches("input, select, textarea")) {
            validarCampo(evento.target);
        }
    });
});

registrarSubmit("#formInventario", (evento) => {
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
        fila.appendChild(crearCeldaAcciones(
            () => editarFilaTabla(fila, ["Codigo del equipo", "Tipo de equipo", "Ubicacion", "Estado"], 3),
            () => eliminarFilaTabla(fila, {
                selector: "#tablaInventario",
                columnas: 5,
                textoVacio: "Todavia no hay equipos registrados."
            })
        ));

        quitarEstadoVacio(tablaInventario);
        tablaInventario.prepend(fila);
        actualizarContadores();
        formulario.reset();
        mostrarMensaje("Equipo registrado correctamente.");
    } catch (error) {
        console.error(error);
        mostrarMensaje("No se pudo registrar el equipo.");
    }
});

registrarSubmit("#formTicket", (evento) => {
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
        articulo.dataset.categoria = document.querySelector("#categoriaTicket").value;
        articulo.dataset.prioridad = document.querySelector("#prioridadTicket").value;
        articulo.dataset.solicitante = document.querySelector("#solicitanteTicket").value.trim();
        articulo.dataset.descripcion = document.querySelector("#descripcionTicket").value.trim();
        articulo.dataset.numero = `#TK-${numeroTicket}`;

        const contenido = document.createElement("div");
        const titulo = document.createElement("strong");
        const descripcion = document.createElement("p");

        titulo.textContent = `${articulo.dataset.numero} - ${articulo.dataset.categoria} - ${articulo.dataset.prioridad}`;
        descripcion.textContent = `${articulo.dataset.solicitante}: ${articulo.dataset.descripcion}`;

        contenido.appendChild(titulo);
        contenido.appendChild(descripcion);
        articulo.appendChild(contenido);
        articulo.appendChild(crearEstado("Pendiente"));
        articulo.appendChild(crearAcciones(
            () => {
                articulo.dataset.solicitante = pedirDato("Solicitante", articulo.dataset.solicitante);
                articulo.dataset.categoria = pedirDato("Categoria", articulo.dataset.categoria);
                articulo.dataset.prioridad = pedirDato("Prioridad", articulo.dataset.prioridad);
                articulo.dataset.descripcion = pedirDato("Descripcion", articulo.dataset.descripcion);
                titulo.textContent = `${articulo.dataset.numero} - ${articulo.dataset.categoria} - ${articulo.dataset.prioridad}`;
                descripcion.textContent = `${articulo.dataset.solicitante}: ${articulo.dataset.descripcion}`;
                mostrarMensaje("Ticket modificado correctamente.");
            },
            () => {
                if (!window.confirm("Desea eliminar este ticket?")) {
                    return;
                }

                articulo.remove();
                mostrarEstadoVacioTickets();
                actualizarContadores();
                mostrarMensaje("Ticket eliminado correctamente.");
            }
        ));

        quitarEstadoVacio(listaTickets);
        listaTickets.prepend(articulo);
        actualizarContadores();
        formulario.reset();
        mostrarMensaje("Ticket creado y enviado a soporte.");
    } catch (error) {
        console.error(error);
        mostrarMensaje("No se pudo crear el ticket.");
    }
});

registrarSubmit("#formPrestamo", (evento) => {
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
    fila.appendChild(crearCeldaAcciones(
        () => editarFilaTabla(fila, ["Codigo del equipo", "Responsable", "Fecha estimada de devolucion", "Estado"], 3),
        () => eliminarFilaTabla(fila, {
            selector: "#tablaPrestamos",
            columnas: 5,
            textoVacio: "Todavia no hay prestamos registrados."
        })
    ));

    quitarEstadoVacio(tablaPrestamos);
    tablaPrestamos.prepend(fila);
    actualizarContadores();
    formulario.reset();
    mostrarMensaje("Prestamo registrado correctamente.");
});

registrarSubmit("#formSolicitud", (evento) => {
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
    fila.appendChild(crearCeldaAcciones(
        () => editarFilaTabla(fila, ["Usuario", "Tipo de solicitud", "Fecha requerida", "Laboratorio", "Estado"], 4),
        () => eliminarFilaTabla(fila, {
            selector: "#tablaSolicitudes",
            columnas: 6,
            textoVacio: "Todavia no hay solicitudes registradas."
        })
    ));

    quitarEstadoVacio(tablaSolicitudes);
    tablaSolicitudes.prepend(fila);
    actualizarContadores();
    formulario.reset();
    mostrarMensaje("Solicitud de servicio registrada.");
});

actualizarContadores();
