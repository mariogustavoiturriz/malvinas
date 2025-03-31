// Coordenadas de Puerto Argentino (Malvinas)
const puertoArgentino = {
    lat: -51.6954,
    lon: -57.8500
};

let ultimoAnguloBrujula = 0;

// Función para calcular el ángulo entre dos coordenadas
function calcularAngulo(lat1, lon1, lat2, lon2) {
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    lat1 = lat1 * (Math.PI / 180);
    lat2 = lat2 * (Math.PI / 180);

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    const angulo = Math.atan2(y, x);
    return angulo * (180 / Math.PI); // Convertir a grados
}

// Función para actualizar la brújula y la flecha
function actualizarBrujula(lat, lon, heading = null) {
    const anguloHaciaMalvinas = calcularAngulo(lat, lon, puertoArgentino.lat, puertoArgentino.lon);
    const flecha = document.getElementById('flecha');
    const brujula = document.getElementById('brujula');

    // Rotar la brújula base (para alinear el norte físico)
    if (heading !== null) {
        brujula.style.transform = `rotate(${-heading}deg)`; // El signo negativo corrige la dirección
        ultimoAnguloBrujula = heading;
    }

    // Rotar la flecha (para apuntar a Malvinas), compensando la rotación de la brújula
    flecha.style.transform = `rotate(${anguloHaciaMalvinas}deg)`;
}

// Función para manejar la orientación del dispositivo (giroscopio)
function manejarOrientacion(event) {
    if (event.alpha !== null) {
        actualizarBrujula(ultimaLatitud, ultimaLongitud, event.alpha);
    }
}

let ultimaLatitud, ultimaLongitud;

// Obtener la geolocalización del usuario
function obtenerUbicacion() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                ultimaLatitud = position.coords.latitude;
                ultimaLongitud = position.coords.longitude;
                actualizarBrujula(ultimaLatitud, ultimaLongitud, ultimoAnguloBrujula);

                // Si el dispositivo soporta orientación, activar el giroscopio
                if (window.DeviceOrientationEvent) {
                    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                        // iOS 13+ requiere permisos adicionales
                        DeviceOrientationEvent.requestPermission()
                            .then(response => {
                                if (response === 'granted') {
                                    window.addEventListener('deviceorientation', manejarOrientacion);
                                }
                            })
                            .catch(console.error);
                    } else {
                        // Android y otros navegadores
                        window.addEventListener('deviceorientation', manejarOrientacion);
                    }
                }
            },
            (error) => {
                console.error("Error de geolocalización:", error);
                alert("No se pudo obtener la ubicación. Usando modo demo.");
                // Modo demo con rotación aleatoria
                setInterval(() => {
                    const anguloDemo = Math.random() * 360;
                    document.getElementById('brujula').style.transform = `rotate(${anguloDemo}deg)`;
                }, 2000);
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
    } else {
        alert("Geolocalización no soportada en este navegador.");
    }
}

// Iniciar al cargar la página
window.onload = obtenerUbicacion;
