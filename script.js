// Coordenadas de Puerto Argentino (Malvinas)
const puertoArgentino = {
    lat: -51.6954,
    lon: -57.8500
};

let ultimoAnguloBrujula = 0;

// Función para calcular el ángulo entre dos coordenadas geográficas
function calcularAngulo(lat1, lon1, lat2, lon2) {
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    lat1 = lat1 * (Math.PI / 180);
    lat2 = lat2 * (Math.PI / 180);

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    const angulo = Math.atan2(y, x);
    return angulo * (180 / Math.PI); // Convertimos el ángulo a grados
}

// Función para actualizar la brújula
function actualizarBrujula(lat, lon, heading = null) {
    const anguloHaciaMalvinas = calcularAngulo(lat, lon, puertoArgentino.lat, puertoArgentino.lon);
    const flecha = document.getElementById('flecha');
    const brujula = document.getElementById('brujula');
    
    // Si tenemos información de orientación (heading), usarla para girar la brújula
    if (heading !== null) {
        brujula.style.transform = `rotate(${-heading}deg)`;
        ultimoAnguloBrujula = heading;
    }
    
    // La flecha gira en dirección a Malvinas, compensando la rotación de la brújula
    flecha.style.transform = `rotate(${anguloHaciaMalvinas}deg)`;
}

// Obtener la geolocalización y orientación del usuario
function obtenerUbicacion() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            // Verificar si el dispositivo soporta orientación
            if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
                window.addEventListener('deviceorientation', function(event) {
                    if (event.absolute && event.webkitCompassHeading !== undefined) {
                        // Para Safari en iOS
                        actualizarBrujula(lat, lon, event.webkitCompassHeading);
                    } else if (event.alpha !== null) {
                        // Para otros navegadores
                        actualizarBrujula(lat, lon, event.alpha);
                    }
                });
            } else {
                // Si no hay soporte para orientación, solo actualizar la flecha
                actualizarBrujula(lat, lon);
            }
        }, function(error) {
            console.log("Error al obtener la ubicación: ", error);
            alert("No se pudo obtener la ubicación. Asegúrate de habilitar la geolocalización.");
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
        });
    } else {
        alert("La geolocalización no está soportada en este navegador.");
    }
}

// Llamamos a la función para obtener la ubicación cuando cargue la página
window.onload = obtenerUbicacion;
