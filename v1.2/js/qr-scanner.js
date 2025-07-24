/* OFFSCREEN CANVA MODIFICATIONS:
 * resize frame to 320px for performance
 * detect qrcode using jsQR
 * erase each found qrcode to avoid duplicates
 * reanalyse for modified images
 * store info of qrcodes, draw overlays on it
 */

// CAPTURE PROCESS and DRAW every video frame
function scanFrame() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const vw = qrCanvas.width;
        const vh = qrCanvas.height;

        // Clear previous picture and draw video frame on main canvas
        qrCtx.clearRect(0, 0, vw, vh);
        qrCtx.drawImage(video, 0, 0, vw, vh);

        // Calculate scanning size (downscale for performance)
        const scanWidth = 320;
        const aspectRatio = video.videoHeight / video.videoWidth;
        const scanHeight = Math.floor(scanWidth * aspectRatio);

        // Draw current frame into offscreenCanvas (invisible but used for QR processing)
        offscreenCanvas.width = scanWidth;
        offscreenCanvas.height = scanHeight;
        offCtx.drawImage(video, 0, 0, scanWidth, scanHeight);

        // Extract raw pixel data for jsQR
        let imageData = offCtx.getImageData(0, 0, scanWidth, scanHeight);
        const found = new Set();

        // Max 6 QR codes per frame
        for (let i = 0; i < 6; i++) {
            const code = jsQR(imageData.data, scanWidth, scanHeight, { inversionAttempts: "dontInvert" });
            if (!code || found.has(code.data)) break;

            found.add(code.data);

            if (!trackedQRCodes.has(code.data)) {
                trackedQRCodes.set(code.data, {
                    color: getRandomColor(),
                    lastSeen: Date.now(),
                    location: code.location
                });
            }

            const qr = trackedQRCodes.get(code.data);
            qr.lastSeen = Date.now();
            qr.location = code.location;

            // MASK QR CODES FOR MULTI DETECTION
            const loc = code.location;
            const minX = Math.min(loc.topLeftCorner.x, loc.bottomLeftCorner.x);
            const maxX = Math.max(loc.topRightCorner.x, loc.bottomRightCorner.x);
            const minY = Math.min(loc.topLeftCorner.y, loc.topRightCorner.y);
            const maxY = Math.max(loc.bottomLeftCorner.y, loc.bottomRightCorner.y);

            // DRAWING A HIDDEN BLACK RECTANGLE TO AVOID REDUNDANT DETECTION
            // canvas element that’s never appended to the document
            offCtx.globalCompositeOperation = 'destination-out'; //completely erases the pixels
            offCtx.fillStyle = 'rgba(0,0,0,1)';
            offCtx.fillRect(minX - 10, minY - 10, (maxX - minX + 20), (maxY - minY + 20));
            offCtx.globalCompositeOperation = 'source-over'; //puts settings back to normal
            imageData = offCtx.getImageData(0, 0, scanWidth, scanHeight);
        }

        // REMOVE STALE QR codes (not seen for 500ms)
        const now = Date.now();
        for (const [data, qr] of trackedQRCodes.entries()) {
            if (now - qr.lastSeen > 500) {
                trackedQRCodes.delete(data);
            }
        }

        drawTrackedQRCodes(vw, vh, scanWidth, scanHeight);
        updateURLList();

        // Also detect visible text from canvas
        if (window.detectTextFromCanvas) {
            detectTextFromCanvas(qrCtx);
        }
    }

    requestAnimationFrame(scanFrame);
}
