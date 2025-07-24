
// === Global DOM refs ===
const video = document.getElementById('video');
const qrCanvas = document.getElementById('qr-canvas');
const qrCtx = qrCanvas.getContext('2d');
const urlList = document.getElementById('url-list');
const trackedQRCodes = new Map();

const offscreenCanvas = document.createElement('canvas');
const offCtx = offscreenCanvas.getContext('2d');

// === Resize support ===
function resizeCanvas() {
    qrCanvas.width = window.innerWidth;
    qrCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);

// === Random color per QR ===
function getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 100%, 50%)`;
}

// === Camera setup ===
// Use of back camera with ideal resolution

navigator.mediaDevices.getUserMedia({
    video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
    }
}).then(stream => {
    video.srcObject = stream;
    // Start scanning frames when video is ready
    video.onloadedmetadata = () => {
        video.play();
        resizeCanvas();
        requestAnimationFrame(scanFrame); // scan recursively
    };
}).catch(err => alert('Camera error: ' + err.message));

// === URL List update ===
// Update the displayed list of scanned QR codes
function updateURLList() {
    urlList.innerHTML = '';
    for (const [data, qr] of trackedQRCodes.entries()) {
        const div = document.createElement('div');
        div.className = 'url-item';
        div.style.color = qr.color;
        div.textContent = data.length > 120 ? data.slice(0, 120) + '…' : data;
        urlList.appendChild(div);
    }
}
