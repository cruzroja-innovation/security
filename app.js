/**
 * Módulo: app.js
 * Propósito: Interfaz de usuario, configuración y reglas de negocio.
 * Escucha los eventos emitidos por security.js y reacciona actualizando el DOM o suspendiendo el examen.
 */

class ExamApp {
    constructor() {
        this.infractions = 0;
        this.isModalOpen = false;
        
        // Configuración por defecto
        this.config = {
            maxInfractions: 3,
            autoAnnulScreenshot: false
        };
        
        // Cache de elementos DOM
        this.modal = document.getElementById('securityModal');
        this.modalMessage = document.getElementById('modalMessage');
        this.infractionCountSpan = document.getElementById('infractionCount');
        this.maxInfractionsDisplay = document.getElementById('maxInfractionsDisplay');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        
        this.configModal = document.getElementById('configModal');
        this.openConfigBtn = document.getElementById('openConfigBtn');
        this.saveConfigBtn = document.getElementById('saveConfigBtn');
        this.cancelConfigBtn = document.getElementById('cancelConfigBtn');
        this.closeConfigXBtn = document.getElementById('closeConfigXBtn');
        this.inputMaxInfractions = document.getElementById('inputMaxInfractions');
        this.checkAutoAnnul = document.getElementById('checkAutoAnnul');
        
        this.init();
    }

    init() {
        this.loadConfig();
        this.setupConfigPanel();
        this.setupWarningModal();
        this.listenToSecurityEvents();
    }

    // --- ESCUCHA DE EVENTOS DESACOPLADOS ---
    listenToSecurityEvents() {
        window.addEventListener('security-infraction', (e) => {
            const { reason, type } = e.detail;
            this.handleInfraction(reason, type);
        });
    }

    handleInfraction(reason, type) {
        // Regla especial: Anulación inmediata por captura de pantalla
        if (type === 'screenshot' && this.config.autoAnnulScreenshot) {
            if (this.isModalOpen) this.modal.close();
            this.suspendExam("Se detectó un intento de captura de pantalla. El examen se ha anulado automáticamente.");
            return;
        }

        // Si ya hay un modal abierto, no acumulamos más infracciones visuales de golpe 
        // para evitar que el evento 'blur' haga ciclo.
        if (this.isModalOpen) return;

        this.infractions++;
        console.warn(`[Infracción registrada: ${this.infractions}/${this.config.maxInfractions}] - ${reason}`);
        this.showWarning(reason);
    }

    // --- MANEJO DE UI: MODAL DE ADVERTENCIA ---
    setupWarningModal() {
        this.closeModalBtn.addEventListener('click', () => {
            this.modal.close();
            this.isModalOpen = false;
            
            if (this.infractions >= this.config.maxInfractions) {
                this.suspendExam("Límite de infracciones de seguridad superado.");
            }
        });
        
        // Evitar cierre con ESC
        this.modal.addEventListener('cancel', (e) => e.preventDefault());
    }

    showWarning(message) {
        this.isModalOpen = true;
        
        if (this.infractions >= this.config.maxInfractions) {
            this.modalMessage.innerText = "Has alcanzado el límite máximo de advertencias. El examen será suspendido.";
            this.closeModalBtn.innerText = "Finalizar Examen";
            this.closeModalBtn.classList.replace('btn-primary', 'btn-danger');
        } else {
            this.modalMessage.innerText = message;
        }

        this.infractionCountSpan.innerText = this.infractions;
        this.modal.showModal();
    }

    suspendExam(reason) {
        const container = document.getElementById('examContent');
        container.innerHTML = `
            <div style="text-align:center; padding: 40px 20px;">
                <h2 style="color:#dc3545; font-size: 2rem; margin-bottom: 10px;">Examen Suspendido</h2>
                <p style="font-size: 1.1rem; color: #495057;">${reason}</p>
                <p style="margin-top: 20px; font-weight: bold;">Tu evaluación ha sido anulada. Contacta al instructor.</p>
            </div>
        `;
        // Aquí iría el fetch() hacia el backend para invalidar la sesión
    }

    // --- MANEJO DE UI: CONFIGURACIÓN Y LOCALSTORAGE ---
    loadConfig() {
        const savedConfig = localStorage.getItem('examSecurityConfig');
        if (savedConfig) {
            try {
                this.config = { ...this.config, ...JSON.parse(savedConfig) };
            } catch (e) {
                console.error("Error al cargar configuración:", e);
            }
        }
        this.maxInfractionsDisplay.innerText = this.config.maxInfractions;
    }

    saveConfig() {
        const newMax = parseInt(this.inputMaxInfractions.value, 10);
        const newAutoAnnul = this.checkAutoAnnul.checked;
        
        if (isNaN(newMax) || newMax < 1) {
            alert("El número de infracciones debe ser al menos 1.");
            return;
        }

        this.config.maxInfractions = newMax;
        this.config.autoAnnulScreenshot = newAutoAnnul;
        localStorage.setItem('examSecurityConfig', JSON.stringify(this.config));
        
        this.maxInfractionsDisplay.innerText = this.config.maxInfractions;
        this.configModal.close();
        
        // Reset de intentos para facilitar pruebas
        this.infractions = 0; 
        console.log("Nueva configuración aplicada y guardada:", this.config);
    }

    setupConfigPanel() {
        this.openConfigBtn.addEventListener('click', () => {
            this.inputMaxInfractions.value = this.config.maxInfractions;
            this.checkAutoAnnul.checked = this.config.autoAnnulScreenshot;
            this.configModal.showModal();
        });

        this.saveConfigBtn.addEventListener('click', () => this.saveConfig());
        this.cancelConfigBtn.addEventListener('click', () => this.configModal.close());
        this.closeConfigXBtn.addEventListener('click', () => this.configModal.close());
        this.configModal.addEventListener('cancel', (e) => e.preventDefault());
    }
}

// Iniciar aplicación
document.addEventListener('DOMContentLoaded', () => {
    new ExamApp();
});
