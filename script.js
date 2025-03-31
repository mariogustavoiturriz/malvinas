const puertoArgentino = { lat: -51.6954, lon: -57.8500 };
let ultimoAnguloGiroscopio = 0;

function calcularAngulo(lat1, lon1, lat2, lon2) {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    
    return Math.atan2(y, x) * 180 / Math.PI;
}

function actualizarBrujula(lat, lon, heading = null) {
    const brujula = document.getElementById('brujula');
    const flecha = document.getElementById('flecha');
    const anguloHaciaMalvinas = calcularAngulo(lat, lon, puertoArgentino.lat, puertoArgentino.lon);

    // Rotación de la brújula (norte físico)
    if (heading !== null) {
        brujula.style.transform = `rotate(${-heading}deg)`;
        ultimoAnguloGiroscopio = heading;
    }

    // Rotación compensada de la flecha
    flecha.style.transform = `rotate(${anguloHaciaMalvinas}deg)`;
}

// Manejo de sensores
function iniciarSensores() {
    if (window.DeviceOrientationEvent) {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        window.addEventListener('deviceorientation', (e) => {
                            if (e.alpha !== null) actualizarBrujula(ultimaLatitud, ultimaLongitud, e.alpha);
                        });
                    }
                });
        } else {
            window.addEventListener('deviceorientation', (e) => {
                if (e.webkitCompassHeading) { // Para Safari
                    actualizarBrujula(ultimaLatitud, ultimaLongitud, e.webkitCompassHeading);
                } else if (e.alpha !== null) { // Para otros navegadores
                    actualizarBrujula(ultimaLatitud, ultimaLongitud, e.alpha);
                }
            });
        }
    }
}

// Geolocalización
let ultimaLatitud, ultimaLongitud;
navigator.geolocation.watchPosition(
    (pos) => {
        ultimaLatitud = pos.coords.latitude;
        ultimaLongitud = pos.coords.longitude;
        actualizarBrujula(ultimaLatitud, ultimaLongitud, ultimoAnguloGiroscopio);
    },
    (err) => console.error("Error de geolocalización:", err),
    { enableHighAccuracy: true }
);

// Iniciar al hacer clic (requerido para iOS)
document.getElementById('brujula').addEventListener('click', iniciarSensores);
