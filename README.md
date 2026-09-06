# ExamApp - Módulo de Seguridad e Interfaz para Exámenes

`app.js` es un módulo orientado a objetos que gestiona la interfaz de usuario, las advertencias y las reglas de suspensión para evaluaciones en línea. Su arquitectura está basada en eventos (`CustomEvents`), lo que permite aislar la lógica de detección de trampas (ej. `security.js`) de la lógica de presentación.

## Características Principales
* **Desacoplamiento total:** Escucha pasivamente el evento global `security-infraction`.
* **Sistema de Strikes:** Acumula infracciones hasta alcanzar el límite permitido.
* **Cero Tolerancia:** Regla especial para anulación inmediata (ej. capturas de pantalla).
* **Configuración Persistente:** Almacena y recupera los parámetros del examen usando `localStorage`.

## 1. Estructura HTML Requerida
El script interactúa con el DOM utilizando identificadores (`id`) estrictos. Asegúrate de incluir esta estructura en tu vista principal:

```html
<!-- Contenedor principal que será reemplazado en caso de anulación -->
<div id="examContent">
    <!-- Contenido de tu examen aquí -->
</div>

<!-- Panel de información y acceso a configuración (Administradores) -->
<button id="openConfigBtn">Configuración de Seguridad</button>
<p>Límite de infracciones: <span id="maxInfractionsDisplay">3</span></p>

<!-- Modal de Advertencias (Visible para el alumno) -->
<dialog id="securityModal">
    <h3>⚠️ Advertencia</h3>
    <p id="modalMessage"></p>
    <p>Infracciones acumuladas: <span id="infractionCount">0</span></p>
    <button id="closeModalBtn" class="btn-primary">Entendido</button>
</dialog>

<!-- Modal de Configuración (Visible para el instructor/admin) -->
<dialog id="configModal">
    <div style="display: flex; justify-content: space-between;">
        <h3>Configuración</h3>
        <button id="closeConfigXBtn">X</button>
    </div>
    <label>
        Límite de Infracciones:
        <input type="number" id="inputMaxInfractions" min="1">
    </label>
    <label>
        <input type="checkbox" id="checkAutoAnnul">
        Anular automáticamente por Capturas de Pantalla
    </label>
    <button id="cancelConfigBtn">Cancelar</button>
    <button id="saveConfigBtn">Guardar</button>
</dialog>
