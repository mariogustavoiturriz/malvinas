// Coordenadas de Puerto Argentino
const puertoArgentino = { lat: -51.6954, lon: -57.8500 };

function calcularAngulo(lat1, lon1, lat2, lon2) {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    return Math.atan2(y, x) * 180 / Math.PI;
}

// Rotación independiente para brújula y flecha
function actualizarBrujula(lat, lon, heading = null) {
    const angulo = calcularAngulo(lat, lon, puertoArgentino.lat, puertoArgentino.lon);
    const flecha = document.getElementById('flecha');
    
    // Solo actualiza la rotación (el centrado ya está en CSS)
    flecha.style.transform = `translate(-50%, -50%) rotate(${angulo}deg)`;
    
    if (heading !== null) {
        document.getElementById('brujula').style.transform = `rotate(${-heading}deg)`;
    }
}


// Iniciar sensores (para móviles)
function iniciarSensores() {
    if (window.DeviceOrientationEvent) {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS 13+
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        window.addEventListener('deviceorientation', (e) => {
                            if (e.alpha !== null) actualizarBrujula(ultimaLat, ultimaLon, e.alpha);
                        });
                    }
                });
        } else {
            // Android y otros
            window.addEventListener('deviceorientation', (e) => {
                const heading = e.webkitCompassHeading || e.alpha;
                if (heading !== null) actualizarBrujula(ultimaLat, ultimaLon, heading);
            });
        }
    }
}

// Geolocalización
let ultimaLat, ultimaLon;
navigator.geolocation.watchPosition(
    (pos) => {
        ultimaLat = pos.coords.latitude;
        ultimaLon = pos.coords.longitude;
        actualizarBrujula(ultimaLat, ultimaLon);
    },
    (err) => console.error("Error de geolocalización:", err),
    { enableHighAccuracy: true }
);

// Activar al tocar (requerido para iOS)
document.getElementById('contenedor').addEventListener('click', iniciarSensores);
