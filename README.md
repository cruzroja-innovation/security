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
```

## 2. Emisión de Eventos de Seguridad
Para que ExamApp reaccione, tus scripts de monitoreo deben despachar eventos security-infraction al objeto window.

Para registrar una infracción estándar (suma 1 al contador):

JavaScript
```
window.dispatchEvent(new CustomEvent('security-infraction', {
    detail: { 
        type: 'blur', 
        reason: 'Se detectó que abandonaste la pestaña del examen.' 
    }
}));
```
Para detonar una anulación inmediata (requiere autoAnnulScreenshot: true):

JavaScript
```
window.dispatchEvent(new CustomEvent('security-infraction', {
    detail: { 
        type: 'screenshot', 
        reason: 'Uso de tecla de captura de pantalla detectado.' 
    }
}));
```

## 3. Configuración y Almacenamiento
La configuración se guarda en el localStorage del navegador bajo la clave examSecurityConfig. El formato almacenado es:

JSON
```
{
  "maxInfractions": 3,
  "autoAnnulScreenshot": false
}
```

## 4. Implementación Obligatoria (Backend)
En su estado actual, la función suspendExam(reason) de la clase solo reemplaza el DOM de manera visual. Para evitar que un estudiante recargue la página y continúe el examen tras una anulación, debes añadir una petición a tu servidor.

Localiza el método suspendExam en app.js e integra tu API:

JavaScript
```
suspendExam(reason) {
    const container = document.getElementById('examContent');
    container.innerHTML = `...`; // Código visual de anulación

    // Llamada requerida para invalidar la sesión en la base de datos
    fetch('/api/exams/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: reason })
    });
}
```
