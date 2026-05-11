RESUMEN DEL SQL DEL PROYECTO SGRSI
==================================

El archivo database_sgrsi.sql crea la base de datos del Sistema de Gestion de Recursos y Soporte de Informatica.

La base se llama:

sgrsi

Esta pensada para MySQL o MariaDB.


TABLAS PRINCIPALES
==================

roles
-----
Guarda los perfiles del sistema:

- Administrador
- Tecnico
- Solicitante


usuarios
--------
Guarda los usuarios que ingresan al sistema.

Cada usuario pertenece a un rol.

Usuarios de prueba cargados:

- admin@sgrsi.local / admin123
- tecnico@sgrsi.local / tecnico123
- usuario@sgrsi.local / usuario123

En el SQL, las contrasenas se guardan usando SHA2 como demostracion.
En una version futura se recomienda usar un mecanismo de autenticacion seguro.


categorias_equipo
-----------------
Guarda tipos de equipos:

- Notebook
- PC de escritorio
- Proyector
- Router
- Impresora


laboratorios
------------
Guarda los laboratorios o salas donde pueden estar los equipos o donde se realizan solicitudes.


equipos
-------
Guarda el inventario tecnologico.

Incluye:

- Codigo de inventario.
- Categoria.
- Laboratorio.
- Marca.
- Modelo.
- Numero de serie.
- Estado.


historial_equipos
-----------------
Registra movimientos del equipo.

Sirve para la trazabilidad:

- Alta.
- Modificacion.
- Prestamo.
- Devolucion.
- Reparacion.
- Baja.


prestamos
---------
Registra prestamos y devoluciones de equipos.

Relaciona:

- Equipo prestado.
- Usuario solicitante.
- Tecnico responsable.
- Fecha de prestamo.
- Fecha estimada de devolucion.
- Estado del prestamo.


categorias_ticket
-----------------
Guarda categorias de incidencias:

- Hardware.
- Software.
- Red.
- Usuario y acceso.


tickets
-------
Registra incidencias tecnicas.

Incluye:

- Usuario solicitante.
- Tecnico asignado.
- Equipo relacionado.
- Prioridad.
- Estado.
- Fecha de creacion.


intervenciones_ticket
---------------------
Guarda diagnosticos y soluciones realizadas por los tecnicos.

Sirve como historial y base de conocimiento.


solicitudes_servicio
--------------------
Registra solicitudes como:

- Preparacion de laboratorio.
- Instalacion de software.
- Configuracion de equipos.


tareas_soporte
--------------
Permite calendarizar tareas preventivas o reactivas.

Puede relacionarse con un ticket o con una solicitud de servicio.


RELACIONES IMPORTANTES
======================

- Un rol puede tener muchos usuarios.
- Un usuario puede crear muchos tickets.
- Un tecnico puede atender muchos tickets.
- Un equipo puede tener muchos prestamos.
- Un equipo puede tener muchos movimientos en su historial.
- Un ticket puede tener muchas intervenciones.
- Un laboratorio puede tener muchos equipos.
- Un laboratorio puede tener muchas solicitudes.


CONCLUSION
==========

La base de datos permite cubrir los modulos principales del SGRSI:

- Inventario.
- Prestamos.
- Mesa de ayuda.
- Solicitudes de servicio.
- Tareas de soporte.
- Trazabilidad.
- Reportes.
