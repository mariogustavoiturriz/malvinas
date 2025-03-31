// Debug inicial
document.getElementById('debug').textContent = "Cargando...";

// Configuración
const PUERTO_ARGENTINO = { lat: -51.6954, lon: -57.8500 };
let ubicacionActual = null;
let orientacionActual = null;

// Elementos DOM
const baseBrujula = document.getElementById('base-brujula');
const aguja = document.getElementById('aguja');
const debug = document.getElementById('debug');

// Calcula dirección hacia Malvinas
function calcularDireccion(lat, lon) {
    const φ1 = lat * Math.PI/180;
    const φ2 = PUERTO_ARGENTINO.lat * Math.PI/180;
    const Δλ = (PUERTO_ARGENTINO.lon - lon) * Math.PI/180;
    
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1)*Math.sin(φ2) - Math.sin(φ1)*Math.cos(φ2)*Math.cos(Δλ);
    return Math.atan2(y, x) * 180/Math.PI;
}

// Actualiza la visualización
function actualizarBrujula() {
    if (!ubicacionActual) return;
    
    const angulo = calcularDireccion(ubicacionActual.lat, ubicacionActual.lon);
    aguja.style.transform = `translate(-50%, -50%) rotate(${angulo}deg)`;
    
    if (orientacionActual !== null) {
        baseBrujula.style.transform = `rotate(${-orientacionActual}deg)`;
    }
    
    debug.textContent = `Lat: ${ubicacionActual.lat.toFixed(4)}, Lon: ${ubicacionActual.lon.toFixed(4)}, Ángulo: ${angulo.toFixed(1)}°`;
}

// Maneja geolocalización
navigator.geolocation.watchPosition(
    pos => {
        ubicacionActual = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
        };
        actualizarBrujula();
    },
    err => {
        debug.textContent = `Error GPS: ${err.message}`;
        // Modo demo
        ubicacionActual = { lat: -34.6037, lon: -58.3816 }; // Buenos Aires
        actualizarBrujula();
    },
    { enableHighAccuracy: true }
);

// Maneja orientación (giroscopio)
window.addEventListener('deviceorientation', ev => {
    if (ev.alpha !== null) {
        orientacionActual = ev.webkitCompassHeading || ev.alpha;
        actualizarBrujula();
    }
});

// Permisos para iOS
document.getElementById('contenedor-brujula').addEventListener('click', () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    window.addEventListener('deviceorientation', e => {
                        orientacionActual = e.webkitCompassHeading || e.alpha;
                        actualizarBrujula();
                    });
                }
            });
    }
});
