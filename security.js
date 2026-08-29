/**
 * Módulo: security.js
 * Propósito: Sensor pasivo de seguridad.
 * No conoce el DOM del examen, no abre modales ni lee configuraciones.
 * Solo detecta eventos del sistema/navegador y despacha un CustomEvent ('security-infraction').
 */

class SecurityDetector {
    constructor() {
        this.initialWidth = window.innerWidth;
        this.initialHeight = window.innerHeight;
        this.init();
    }

    init() {
        this.preventCopyPaste();
        this.preventTextDrag();
        this.preventSwipeBack();
        this.detectVisibilityChange();
        this.detectWindowBlur();
        this.detectSplitScreen();
        this.detectScreenshots();
    }

    // Despachador central de eventos hacia app.js
    dispatchInfraction(reason, type = 'general') {
        const event = new CustomEvent('security-infraction', {
            detail: { reason, type }
        });
        window.dispatchEvent(event);
    }

    preventCopyPaste() {
        document.addEventListener('contextmenu', e => { 
            e.preventDefault(); 
            this.dispatchInfraction('Intento de abrir menú contextual.', 'copy-paste'); 
        });
        document.addEventListener('copy', e => { 
            e.preventDefault(); 
            this.dispatchInfraction('Intento de copiar texto.', 'copy-paste'); 
        });
        document.addEventListener('cut', e => { 
            e.preventDefault(); 
            this.dispatchInfraction('Intento de cortar texto.', 'copy-paste'); 
        });
        document.addEventListener('selectstart', e => e.preventDefault());
        
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (['c', 'x', 'p', 's'].includes(e.key.toLowerCase())) {
                    e.preventDefault();
                    this.dispatchInfraction(`Uso de atajo bloqueado (Ctrl + ${e.key.toUpperCase()}).`, 'keyboard');
                }
            }
        });
    }

    preventTextDrag() {
        document.addEventListener('dragstart', e => { 
            e.preventDefault(); 
            this.dispatchInfraction('Intento de arrastrar contenido.', 'drag'); 
        });
    }

    preventSwipeBack() {
        window.history.pushState(null, null, window.location.href);
        window.addEventListener('popstate', () => {
            window.history.pushState(null, null, window.location.href);
            this.dispatchInfraction('Intento de navegación hacia atrás detectado.', 'navigation');
        });
    }

    detectVisibilityChange() {
        document.addEventListener('visibilitychange', () => { 
            if (document.hidden) this.dispatchInfraction('La aplicación pasó a segundo plano.', 'visibility'); 
        });
        window.addEventListener('pagehide', () => {
            this.dispatchInfraction('Intento de suspender o cerrar la pestaña.', 'visibility');
        });
    }

    detectWindowBlur() {
        window.addEventListener('blur', () => {
            setTimeout(() => { 
                // Verificamos si el foco se perdió realmente
                if (!document.hasFocus()) {
                    this.dispatchInfraction('Cambio a otra aplicación detectado.', 'blur'); 
                }
            }, 100);
        });
    }

    detectSplitScreen() {
        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const currentWidth = window.innerWidth;
            if (Math.abs(this.initialWidth - currentWidth) > 150 || Math.abs(this.initialHeight - currentHeight) > 250) {
                this.initialHeight = currentHeight;
                this.initialWidth = currentWidth;
                this.dispatchInfraction('Cambio brusco de resolución detectado (Posible pantalla dividida).', 'resize');
            }
        });
    }

    detectScreenshots() {
        window.addEventListener('keyup', (e) => {
            if (e.key === 'PrintScreen' || e.key === 'PrtScn') {
                this.dispatchInfraction('Intento de captura de pantalla mediante teclado.', 'screenshot');
            }
        });
    }
}

// Iniciar el sensor independientemente
document.addEventListener('DOMContentLoaded', () => {
    new SecurityDetector();
});
