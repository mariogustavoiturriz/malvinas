// Coordenadas de Puerto Argentino (Malvinas)
const PUERTO_ARGENTINO = {
    lat: -51.6954,
    lon: -57.8500
};

// Variables de estado
let ultimaLatitud = null;
let ultimaLongitud = null;
let ultimoHeading = null;

// Función para calcular el ángulo hacia Malvinas
function calcularAnguloHaciaMalvinas(lat, lon) {
    const dLon = (PUERTO_ARGENTINO.lon - lon) * Math.PI / 180;
    const latRad = lat * Math.PI / 180;
    const malvinasLatRad = PUERTO_ARGENTINO.lat * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(malvinasLatRad);
    const x = Math.cos(latRad) * Math.sin(malvinasLatRad) - 
              Math.sin(latRad) * Math.cos(malvinasLatRad) * Math.cos(dLon);
    
    return Math.atan2(y, x) * 180 / Math.PI;
}

// Actualiza la brújula con los nuevos datos
function actualizarBrujula() {
    const baseBrujula = document.getElementById('base-brujula');
    const aguja = document.getElementById('aguja');
    
    // Rotar la base según el norte físico (solo en móviles)
    if (ultimoHeading !== null) {
        baseBrujula.style.transform = `rotate(${-ultimoHeading}deg)`;
    }
    
    // Rotar la aguja hacia Malvinas (si hay ubicación)
    if (ultimaLatitud !== null && ultimaLongitud !== null) {
        const angulo = calcularAnguloHaciaMalvinas(ultimaLatitud, ultimaLongitud);
        aguja.style.transform = `translate(-50%, -100%) rotate(${angulo}deg)`;
    }
}

// Maneja los datos del giroscopio
function manejarOrientacion(event) {
    if (event.alpha !== null) {
        ultimoHeading = event.webkitCompassHeading || event.alpha;
        actualizarBrujula();
    }
}

// Solicita permisos en iOS
function solicitarPermisosIOS() {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    window.addEventListener('deviceorientation', manejarOrientacion);
                }
            })
            .catch(console.error);
    } else {
        window.addEventListener('deviceorientation', manejarOrientacion);
    }
}

// Obtiene la ubicación del usuario
function iniciarGeolocalizacion() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                ultimaLatitud = position.coords.latitude;
                ultimaLongitud = position.coords.longitude;
                actualizarBrujula();
            },
            (error) => {
                console.error("Error de geolocalización:", error);
                document.getElementById('mensaje').textContent = 
                    "Error al obtener ubicación. Recarga la página e intenta nuevamente.";
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
    } else {
        document.getElementById('mensaje').textContent = 
            "Tu navegador no soporta geolocalización. Prueba con Chrome o Firefox.";
    }
}

// Inicialización al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    // Activar al hacer clic (requerido para iOS)
    document.getElementById('contenedor-brujula').addEventListener('click', () => {
        solicitarPermisosIOS();
    });
    
    iniciarGeolocalizacion();
});
