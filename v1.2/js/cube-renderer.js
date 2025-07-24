/* VISIBLE CANVA ON LIVE VIDEO
 * show detected code outline
 * make ui interactive with rotating cube
 * give users real-time feedback that scanning is working
*/ 

// Draw detected QR code borders and animated cube
function drawTrackedQRCodes(viewWidth, viewHeight, scanWidth, scanHeight) {
    // Coordinate Mapping
    // QR coordinates are downscaled, scale them back up
    const scaleX = viewWidth / scanWidth;
    const scaleY = viewHeight / scanHeight;
    const time = Date.now() / 1000;

    for (const qr of trackedQRCodes.values()) {
        const loc = qr.location;
        const points = [
            loc.topLeftCorner,
            loc.topRightCorner,
            loc.bottomRightCorner,
            loc.bottomLeftCorner
        ].map(p => ({
            x: p.x * scaleX,
            y: p.y * scaleY
        }));

        // DRAW COLORED POLYGON FOR QR CODE
        qrCtx.strokeStyle = qr.color;
        qrCtx.lineWidth = 4;
        qrCtx.beginPath();
        qrCtx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            qrCtx.lineTo(points[i].x, points[i].y);
        }
        qrCtx.closePath();
        qrCtx.stroke();

        // === ROTATING CUBE ===
        const t = (time % 4); //number between 0–4, repeating every 4 seconds, loop takes 4sec in total
        const edge = Math.floor(t); // which side we're on
        const prog = t - edge; // how far along that edge we are

        const from = points[edge];
        const to = points[(edge + 1) % 4];
        // cube’s animated position
        //interpolated position along the current edge
        const cx = from.x + (to.x - from.x) * prog;
        const cy = from.y + (to.y - from.y) * prog;

        const cubeSize = 25;
        const angle = time * 2 * Math.PI; // rotation 1 per sec,

        // Draw rotating cube (square)
        qrCtx.save();
        qrCtx.translate(cx, cy);
        qrCtx.rotate(angle);
        qrCtx.fillStyle = qr.color;
        qrCtx.fillRect(-cubeSize / 2, -cubeSize / 2, cubeSize, cubeSize);

        // Add black stroke border
        qrCtx.strokeStyle = "#000";
        qrCtx.lineWidth = 2;
        qrCtx.strokeRect(-cubeSize / 2, -cubeSize / 2, cubeSize, cubeSize);
        qrCtx.restore(); //for cube of nother qrcode to not have the same parameter when created
    }
}
