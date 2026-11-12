// 3D Earth for the home page, drawn with the Canvas API (no library).
// - the continents are made of points (land outline: Natural Earth, public domain),
// - glowing nodes are servers in 15 real cities, joined by arcs that carry packets,
// - a shield ring scans the planet and catches the packets flagged as threats,
//   which come from unknown hosts out at sea.
// Drag the globe to turn it. It pauses when it is off screen or the tab is hidden,
// and stays still for visitors who prefer reduced motion.
(() => {
    const canvas = document.getElementById('globe');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const stage = canvas.parentElement;
    const still = matchMedia('(prefers-reduced-motion: reduce)');
    const counters = {
        packets: document.querySelector('[data-net="packets"]'),
        threats: document.querySelector('[data-net="threats"]')
    };

    const TAU = Math.PI * 2;
    const RAD = Math.PI / 180;
    const CAMERA = 3.6;            // camera distance, in globe radii
    const TILT_X = 0.36;           // the planet leans towards the visitor
    const TILT_Z = 0.14;
    const SPIN = 0.07;             // radians per second, west to east like the Earth
    const CATCH_AT = 0.62;         // where the shield stops a threat on its arc
    const ARC_STEPS = 44;

    // Land / sea grid: 240 x 120 cells of 1.5 degrees, one bit per cell (1 = land).
    const LAND_COLUMNS = 240, LAND_ROWS = 120;
    const LAND = atob('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8DwD4/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPD//////30AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//+f///x8AAPgBgAEAAMADAAAAAAAAAAAAAAAg3P4//v///wcAgB8AAAAAAAA+AAAAAAAAAAAAAAADAOMP/v///wcAAAwAAAAAAABwAAAAAAAAAAAAAAD8cf0DAP///wcAAAAAAIAPAPD/DwDwAAAAAAAAAOADAGcDAPz//wcAAAAAAHAAAP7/BwBAAAAAAAAAAPB/8/MfAPj//wEAAAAAABjAwP///z/gAAAAAYAAAGD+A/P/APj//wEAAAAAADjg/v///3//HwAAAPj/w//8z4f3B/D//wAAAPA/AADi/////////xc8A/7///9fz96jD+D/PwAAAPz/Y/z//f//////////P/z///////+Bf/D/AQAAAP7/5///////////////HP/////////wJ+A/AH8AAH9/+P//////////////APD//////8+DH+AfAB4AwL////////////////9/APz//////wNxDIAPAAAA+M////////////////8/AP7//////wHwAwAHAAAA+M////////////////AHAPAL+P///wHwMwAAAAAA8A//////////////bxwAAIADwP///wPwfwAAAAAwAAf///////////8fAB4AAGAAAP///z/gfwAAAABwYMf///////////8PAB8AAAgAAP7////5/wMAAABsQOj///////////8HAA8AAAAAgPz////5/wcAAADs+P//////////////AAcAAAAAAPj////7/wcAAADk/f//////////////AAEAAAAAAPj//////wYAAAAg/v////////////+/AAAAAAAAAPD/////Hx4AAADg//////////////+/AAAAAAAAAOD/////HxgAAADA//////////////+fAAAAAAAAAOD//////wAAAACA///P/vj///////8PAAAAAAAAAOD/////FwAAAACA//0HfPz////////HAAAAAAAAAOD/////AQAAAAD8g/MH+Pj////////gAAAAAAAAAOD/////AQAAAAD8A+b//fH//////38gAAAAAAAAAOD///9/AAAAAAD8YOT8//n//////z5gAAAAAAAAAMD///8/AAAAAAD8AMb8//H/////fzggAAAAAAAAAMD///8/AAAAAAB8fkD8/////////zE4AAAAAAAAAID///8fAAAAAADwfwAA/////////zA/AAAAAAAAAAD+//8PAAAAAAD4fwCA/////////4AHAAAAAAAAAAD8//8DAAAAAAD8/+OA/////////4EAAAAAAAAAAAD8//8DAAAAAAD+/////////////wEAAAAAAAAAAADo/wkDAAAAAAD+//////z//////wEAAAAAAAAAAADQfwAGAAAAAID///////n//////wEAAAAAAAAAAACgfwAGAAAAAMD///9//8P//////wAAAAAAAAAAAAAgfwAAAAAAAMD//////jfw////fwEAAAAAAAAAAABAfgACAAAAAOD//////H/A////PwEAAAAAAAAAAAAAfAAYAAAAAOD//////f/A/+//BwAAAAAAAAAAAAAA/DAwAAAAAOD/////+X8A/8N/AgAAAAAAAAAAAAAA/D2AAwAAAOD/////+T8A/4B/AwAAAAAAAAAAAAAA8B8AAAAAAOD/////8x8AfoB/AAMAAAAAAAAAAAAAgP4AAAAAAOD/////9wcAPoD+AQEAAAAAAAAAAAAAAPgBAAAAAPD/////7wEAPgD+AQMAAAAAAAAAAAAAAOAAAAAAAOD/////PwAAPAD8AQEAAAAAAAAAAAAAAMDAAwAAAMD/////HwMAHADkAAoAAAAAAAAAAAAAAIDhfwAAAMD//////wMAGABAAAAAAAAAAAAAAAAAAAD3/wAAAID//////wMAKAAEAAwAAAAAAAAAAAAAAADw/wMAAAD//////wEAYAAMAAwAAAAAAAAAAAAAAADw/x8AAAD++P///wAAAAAZYAAAAAAAAAAAAAAAAADw/z8AAAAAwP///wAAAAAbeAAAAAAAAAAAAAAAAADw/z8AAAAAwP//fwAAAAAefAAAAAAAAAAAAAAAAAD4/38AAAAAwP//HwAAAAAcficAAAAAAAAAAAAAAAD8//8BAAAAwP//DwAAAAAYPoMBAAAAAAAAAAAAAAD8//8HAAAAwP//BwAAAAA4vgEbAAAAAAAAAAAAAAD8//8/AAAAgP//BwAAAABwkAP/IAAAAAAAAAAAAAD8////AAAAAP//AwAAAABgAAL4EwAAAAAAAAAAAAD8////AQAAAP//AwAAAADABwDwAwAAAAAAAAAAAAD4////AQAAAP7/AwAAAAAAXAHwBgAAAAAAAAAAAADw////AAAAAP7/BwAAAAAAAAQADAAAAAAAAAAAAADw//9/AAAAAP7/BwAAAAAAAAAAAAAAAAAAAAAAAADg//9/AAAAAP7/BwEAAAAAAIDHAAAAAAAAAAAAAADg//8/AAAAAP//BwMAAAAAANDHAAAAAAAAAAAAAADA//8/AAAAAP//xwMAAAAAAPjHAYAAAAAAAAAAAAAA//8/AAAAAP//4wEAAAAAAPzfAQAAAAAAAAAAAAAA/v8/AAAAAP//4AEAAAAAAP7/AwAAAAAAAAAAAAAA/v8fAAAAAP5/4AEAAAAAgP//BwAAAAAAAAAAAAAA/v8fAAAAAP7/4AAAAAAA8P//D0AAAAAAAAAAAAAA/v8HAAAAAP7/4AAAAAAA8P//HwAAAAAAAAAAAAAA/v8BAAAAAPx/YAAAAAAA8P//PwAAAAAAAAAAAAAA/v8AAAAAAPw/AAAAAAAA8P//PwAAAAAAAAAAAAAA/v8AAAAAAPw/AAAAAAAA8P//PwAAAAAAAAAAAAAA/38AAAAAAPgfAAAAAAAA8P//PwAAAAAAAAAAAAAA/z8AAAAAAPAPAAAAAAAA4P//PwAAAAAAAAAAAAAA/x8AAAAAAPAHAAAAAAAA4B/+PwAAAAAAAAAAAAAA/x8AAAAAAPADAAAAAAAA4Af8HwAAAAAAAAAAAAAA/wMAAAAAAAAAAAAAAAAAQADwHwAIAAAAAAAAAACA/wMAAAAAAAAAAAAAAAAAAADgDwAQAAAAAAAAAACA/wEAAAAAAAAAAAAAAAAAAADAAwBwAAAAAAAAAACAfwAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAACAPwAAAAAAAAAAAAAAAAAAAAAABwA4AAAAAAAAAADAHwAAAAAAAAAAAAAAAAAAAAAABgAMAAAAAAAAAACAHwAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAADABwAAAAAAAAAAAAAAAAAAAAAAAIADAAAAAAAAAADADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgBwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAwEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAHwAAAT4P/7/AQAAAAAAAAAAAAAAGAAAAAAAAAAA4P8/4P//////BwAAAAAAAAAAAAAAPwAAAAAAABjw//8//v///////wcAAAAAAAAAAACAfwAAAAD6/v////8///////////8DAAAAAAAAeBAAfwAAAMD///////////////////8DAAAAwPcf8P//fwAAAOD///////////////////8AAADA////////DwAAAPz//////////////////x8AAMD///////8/AAAA+P///////////////////x8AADj///////8PAIAH/////////////////////38AAADA//////9/4PAH8P///////////////////wcAAAD+////////P8Dz/////////////////////w8AAAD8//////////////////////////////////8A/wfA////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////');

    function isLand(latitude, longitude) {
        const column = Math.min(LAND_COLUMNS - 1, Math.floor((longitude + 180) / 360 * LAND_COLUMNS));
        const row = Math.min(LAND_ROWS - 1, Math.floor((90 - latitude) / 180 * LAND_ROWS));
        const index = row * LAND_COLUMNS + column;
        return (LAND.charCodeAt(index >> 3) >> (index & 7)) & 1;
    }

    // Latitude and longitude (degrees) to a point on a sphere of radius 1.
    // Longitude 0 faces the visitor, east is to the right, north is up.
    function place(latitude, longitude) {
        const lat = latitude * RAD, lon = longitude * RAD;
        return [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
    }

    // ---------- Geometry (built once) ----------

    // Evenly spread points on the sphere (Fibonacci lattice); only the ones on land are kept.
    const compact = matchMedia('(max-width: 700px)').matches;
    const land = [];
    {
        const count = compact ? 6500 : 11000;
        const golden = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < count; i++) {
            const y = 1 - (i / (count - 1)) * 2;
            const r = Math.sqrt(1 - y * y);
            const theta = golden * i;
            const x = Math.cos(theta) * r, z = Math.sin(theta) * r;
            if (isLand(Math.asin(y) / RAD, Math.atan2(x, z) / RAD)) land.push([x, y, z]);
        }
    }

    // Lines of latitude and longitude, every 30 degrees.
    const graticule = [];
    for (let latitude = -60; latitude <= 60; latitude += 30) {
        const line = [];
        for (let longitude = -180; longitude <= 180; longitude += 5) line.push(place(latitude, longitude));
        graticule.push(line);
    }
    for (let longitude = -180; longitude < 180; longitude += 30) {
        const line = [];
        for (let latitude = -85; latitude <= 85; latitude += 5) line.push(place(latitude, longitude));
        graticule.push(line);
    }

    // Servers. The two labelled ones are where I study: Fes and Paris.
    const cities = [
        ['Paris', 48.86, 2.35], ['Fes', 34.03, -5.0], ['New York', 40.71, -74.0],
        ['San Francisco', 37.77, -122.42], ['Mexico City', 19.43, -99.13], ['Sao Paulo', -23.55, -46.63],
        ['Lagos', 6.52, 3.38], ['Johannesburg', -26.2, 28.05], ['Cairo', 30.04, 31.24],
        ['Moscow', 55.76, 37.62], ['Dubai', 25.2, 55.27], ['Mumbai', 19.08, 72.88],
        ['Singapore', 1.35, 103.82], ['Tokyo', 35.68, 139.69], ['Sydney', -33.87, 151.21]
    ].map(([name, latitude, longitude]) => ({ name, point: place(latitude, longitude) }));
    const city = name => cities.find(item => item.name === name).point;
    const labels = [
        { point: city('Paris'), en: 'PARIS', fr: 'PARIS', dx: 9, dy: -9, align: 'left' },
        { point: city('Fes'), en: 'FES', fr: 'FÈS', dx: -9, dy: 13, align: 'right' }
    ];

    // A connection follows the shortest path on the globe and rises above the
    // surface in its middle; longer connections rise higher.
    function makeArc(a, b) {
        const angle = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
        const sine = Math.sin(angle) || 1;
        const height = 0.025 + angle * 0.075;
        const points = [];
        for (let step = 0; step <= ARC_STEPS; step++) {
            const t = step / ARC_STEPS;
            const fa = Math.sin((1 - t) * angle) / sine, fb = Math.sin(t * angle) / sine;
            const lift = 1 + height * Math.sin(Math.PI * t);
            points.push([(a[0] * fa + b[0] * fb) * lift, (a[1] * fa + b[1] * fb) * lift, (a[2] * fa + b[2] * fb) * lift]);
        }
        return points;
    }

    const arcs = [];
    [
        ['Fes', 'Paris'], ['Paris', 'New York'], ['Paris', 'Moscow'], ['Cairo', 'Paris'], ['Fes', 'Lagos'],
        ['New York', 'San Francisco'], ['New York', 'Sao Paulo'], ['San Francisco', 'Mexico City'],
        ['Lagos', 'Johannesburg'], ['Cairo', 'Dubai'], ['Dubai', 'Mumbai'], ['Mumbai', 'Singapore'],
        ['Singapore', 'Tokyo'], ['Sydney', 'Singapore'], ['Moscow', 'Tokyo'], ['Sao Paulo', 'Lagos'],
        ['Tokyo', 'San Francisco']
    ].forEach(([from, to], index) => {
        arcs.push({
            points: makeArc(city(from), city(to)), threat: false, main: index === 0,
            speed: 0.1 + (index % 5) * 0.025, offset: (index * 0.37) % 1, last: 0
        });
    });
    // Threats come from unknown hosts out at sea and aim at a server.
    const threatSources = [];
    [[36, -42, 'Paris'], [-8, 82, 'Mumbai'], [24, -150, 'San Francisco'], [-38, -8, 'Johannesburg']]
        .forEach(([latitude, longitude, target], index) => {
            const source = place(latitude, longitude);
            threatSources.push(source);
            arcs.push({
                points: makeArc(source, city(target)), threat: true, main: false,
                speed: 0.13 + index * 0.02, offset: (index * 0.29) % 1, last: 0
            });
        });

    // One orbit ring around the planet, with a small satellite.
    const orbit = [];
    for (let step = 0; step <= 120; step++) {
        const a = (step / 120) * TAU, radius = 1.4, rotX = 0.3, rotZ = 0.26;
        const x = Math.cos(a) * radius, z = Math.sin(a) * radius;
        const y1 = -z * Math.sin(rotX), z1 = z * Math.cos(rotX);
        orbit.push([x * Math.cos(rotZ) - y1 * Math.sin(rotZ), x * Math.sin(rotZ) + y1 * Math.cos(rotZ), z1]);
    }

    // ---------- State ----------

    let width = 0, height = 0, radius = 0, cx = 0, cy = 0;
    let colors = {};
    let spin = -0.12, pitch = 0;               // starts facing Europe and Africa
    let velocity = 0;                          // spin speed left over after a drag
    let lookX = 0, lookY = 0, lookTX = 0, lookTY = 0; // small tilt towards the pointer
    let dragging = false, lastX = 0, lastY = 0;
    let time = 0, lastFrame = 0, frame = 0, visible = true;
    let packets = 0, threats = 0;
    const bursts = [];                         // flashes where a threat was caught
    const matrix = new Float64Array(9);
    const tiltOnly = new Float64Array(9);

    function readColors() {
        const style = getComputedStyle(canvas);
        const get = name => style.getPropertyValue(name).trim();
        colors = {
            land: get('--globe-dot'), node: get('--globe-node'), arc: get('--globe-arc'),
            packet: get('--globe-packet'), threat: get('--globe-threat'), ring: get('--globe-ring'),
            oceanLight: get('--globe-ocean-light'), oceanDark: get('--globe-ocean-dark'),
            shade: get('--globe-shade'), atmosphere: get('--globe-atmosphere'), grid: get('--globe-grid'),
            font: style.getPropertyValue('--font-mono').trim() || 'monospace'
        };
    }

    function resize() {
        const box = stage.getBoundingClientRect();
        const size = Math.round(Math.min(box.width, box.height || box.width));
        if (!size) return;
        const dpr = Math.min(devicePixelRatio || 1, 2);
        width = height = size;
        canvas.width = canvas.height = Math.round(size * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cx = cy = size / 2;
        radius = size * 0.325;
        if (!frame) draw();
    }

    // Rotation matrix: spin around the planet's axis, then the two tilts (Rz * Rx * Ry).
    function buildMatrix(out, yaw, tiltX, tiltZ) {
        const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
        const cosX = Math.cos(tiltX), sinX = Math.sin(tiltX);
        const cosZ = Math.cos(tiltZ), sinZ = Math.sin(tiltZ);
        const a = cosY, b = 0, c = sinY;
        const d = sinX * sinY, e = cosX, f = -sinX * cosY;
        out[0] = cosZ * a - sinZ * d; out[1] = cosZ * b - sinZ * e; out[2] = cosZ * c - sinZ * f;
        out[3] = sinZ * a + cosZ * d; out[4] = sinZ * b + cosZ * e; out[5] = sinZ * c + cosZ * f;
        out[6] = -cosX * sinY; out[7] = sinX; out[8] = cosX * cosY;
    }

    // Turns a globe point into a screen point: [x, y, depth, scale].
    const projected = [0, 0, 0, 0];
    function project(m, p) {
        const x = m[0] * p[0] + m[1] * p[1] + m[2] * p[2];
        const y = m[3] * p[0] + m[4] * p[1] + m[5] * p[2];
        const z = m[6] * p[0] + m[7] * p[1] + m[8] * p[2];
        const scale = CAMERA / (CAMERA - z);
        projected[0] = cx + x * radius * scale;
        projected[1] = cy - y * radius * scale;
        projected[2] = z;
        projected[3] = scale;
        return projected;
    }

    // Lines fade as they go round to the far side.
    const depthFade = z => 0.12 + 0.88 * Math.max(0, Math.min(1, (z + 0.25) / 0.5));

    // Draws a line through 3D points, one half of the scene at a time
    // (far side first, near side last). `dashed` skips every other segment.
    const screenX = new Float64Array(128), screenY = new Float64Array(128), depth = new Float64Array(128);
    function polyline(m, points, front, color, alpha, lineWidth, dashed) {
        for (let i = 0; i < points.length; i++) {
            const p = project(m, points[i]);
            screenX[i] = p[0]; screenY[i] = p[1]; depth[i] = p[2];
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        for (let i = 0; i < points.length - 1; i++) {
            if (dashed && i % 2) continue;
            const z = (depth[i] + depth[i + 1]) / 2;
            if ((z >= 0) !== front) continue;
            ctx.globalAlpha = alpha * depthFade(z);
            ctx.beginPath();
            ctx.moveTo(screenX[i], screenY[i]);
            ctx.lineTo(screenX[i + 1], screenY[i + 1]);
            ctx.stroke();
        }
    }

    function disc(x, y, r, color, alpha) {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
    }

    function scanHeight() { return Math.sin(time * 0.55) * 0.86; }

    function shieldRing() {
        const y = scanHeight();
        const ringRadius = Math.sqrt(Math.max(1 - y * y, 0.0001)) * 1.05;
        const ring = [];
        for (let step = 0; step <= 96; step++) {
            const a = (step / 96) * TAU;
            ring.push([Math.cos(a) * ringRadius, y, Math.sin(a) * ringRadius]);
        }
        return ring;
    }

    // Everything that floats above the surface: connections, shield, servers, packets.
    function drawAbove(front, unit, ring) {
        polyline(tiltOnly, orbit, front, colors.arc, 0.34, 1);

        arcs.forEach(arc => {
            polyline(matrix, arc.points, front, arc.threat ? colors.threat : colors.arc,
                arc.threat ? 0.8 : (arc.main ? 0.95 : 0.6), (arc.main ? 1.9 : 1.2) * unit, arc.threat);
        });

        if (front) polyline(tiltOnly, ring, true, colors.ring, 0.16, 7 * unit);
        polyline(tiltOnly, ring, front, colors.ring, 0.95, 1.8 * unit);

        if (front) {
            // Unknown hosts: small hollow markers
            threatSources.forEach(source => {
                const p = project(matrix, source);
                if (p[2] < 0.05) return;
                ctx.globalAlpha = 0.85 * depthFade(p[2]);
                ctx.strokeStyle = colors.threat;
                ctx.lineWidth = 1.2 * unit;
                ctx.beginPath();
                ctx.arc(p[0], p[1], 3 * unit * p[3], 0, TAU);
                ctx.stroke();
            });

            // Servers, with a slow pulse
            cities.forEach((item, index) => {
                const p = project(matrix, item.point);
                if (p[2] < 0) return;
                const x = p[0], y = p[1], s = p[3], fade = depthFade(p[2]);
                const pulse = 0.5 + 0.5 * Math.sin(time * 1.6 + index * 1.3);
                disc(x, y, (6 + pulse * 4) * unit * s, colors.node, (0.2 - pulse * 0.1) * fade);
                disc(x, y, 2.7 * unit * s, colors.node, fade);
            });

            // Labels of the two cities
            const french = document.documentElement.lang === 'fr';
            ctx.font = `600 ${Math.max(9, 10.5 * unit)}px ${colors.font}`;
            ctx.textBaseline = 'middle';
            labels.forEach(label => {
                const p = project(matrix, label.point);
                if (p[2] < 0.25) return;
                ctx.globalAlpha = Math.min(1, (p[2] - 0.25) / 0.25);
                ctx.textAlign = label.align;
                // A dark outline keeps the name readable over the lines.
                ctx.lineJoin = 'round';
                ctx.lineWidth = 3.5 * unit;
                ctx.strokeStyle = colors.oceanDark;
                ctx.strokeText(french ? label.fr : label.en, p[0] + label.dx * unit, p[1] + label.dy * unit);
                ctx.fillStyle = colors.node;
                ctx.fillText(french ? label.fr : label.en, p[0] + label.dx * unit, p[1] + label.dy * unit);
            });
        }

        // Packets, each followed by a short fading trail
        arcs.forEach(arc => {
            const progress = (time * arc.speed + arc.offset) % 1;
            if (arc.threat && progress > CATCH_AT) return;
            const flashing = arc.threat && progress > CATCH_AT - 0.1;
            const color = arc.threat ? colors.threat : colors.packet;
            for (let tail = 6; tail >= 0; tail--) {
                const at = progress - tail * 0.013;
                if (at < 0) continue;
                const exact = at * ARC_STEPS, index = Math.min(Math.floor(exact), ARC_STEPS - 1), mix = exact - index;
                const a = arc.points[index], b = arc.points[index + 1];
                const p = project(matrix, [a[0] + (b[0] - a[0]) * mix, a[1] + (b[1] - a[1]) * mix, a[2] + (b[2] - a[2]) * mix]);
                if ((p[2] >= 0) !== front) continue;
                const x = p[0], y = p[1], s = p[3], fade = depthFade(p[2]);
                const size = (arc.threat ? 3 : 2.4) * unit * s;
                if (tail) {
                    disc(x, y, size * (1 - tail * 0.11), color, 0.55 * fade * (1 - tail / 7));
                    continue;
                }
                const pulse = flashing ? 1.4 + Math.sin(time * 30) * 0.35 : 1;
                if (front) disc(x, y, size * pulse * 2.6, color, 0.22);
                disc(x, y, size * pulse, color, fade);
            }
        });

        // Satellite
        const p = project(tiltOnly, orbit[Math.floor((((time * 0.045) % 1) + 1) % 1 * 120)]);
        if ((p[2] >= 0) === front) {
            const x = p[0], y = p[1], fade = depthFade(p[2]);
            if (front) disc(x, y, 6 * unit, colors.node, 0.16);
            disc(x, y, 2.3 * unit, colors.node, fade);
        }
    }

    function draw() {
        if (!width) return;
        buildMatrix(matrix, spin + lookX, TILT_X + pitch + lookY, TILT_Z);
        buildMatrix(tiltOnly, 0, TILT_X + pitch + lookY, TILT_Z);
        ctx.clearRect(0, 0, width, height);
        const unit = radius / 150;                           // keeps sizes proportional to the globe
        const edge = radius * CAMERA / Math.sqrt(CAMERA * CAMERA - 1);   // radius of the planet on screen
        const ring = shieldRing();

        // Atmosphere: a soft glow that is strongest right at the edge of the planet
        const glow = ctx.createRadialGradient(cx, cy, edge * 0.9, cx, cy, edge * 1.32);
        glow.addColorStop(0, colors.atmosphere);
        glow.addColorStop(0.28, colors.atmosphere);
        glow.addColorStop(1, 'transparent');
        ctx.globalAlpha = 1;
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);

        drawAbove(false, unit, ring);

        // Oceans: a sphere lit from the upper left
        const ocean = ctx.createRadialGradient(cx - edge * 0.38, cy - edge * 0.42, edge * 0.05, cx, cy, edge);
        ocean.addColorStop(0, colors.oceanLight);
        ocean.addColorStop(1, colors.oceanDark);
        ctx.globalAlpha = 1;
        ctx.fillStyle = ocean;
        ctx.beginPath();
        ctx.arc(cx, cy, edge, 0, TAU);
        ctx.fill();

        // Lines of latitude and longitude
        graticule.forEach(line => polyline(matrix, line, true, colors.grid, 1, 1));

        // Continents; the points under the shield light up
        const scanY = scanHeight();
        ctx.fillStyle = colors.land;
        for (let i = 0; i < land.length; i++) {
            const point = land[i];
            const z = matrix[6] * point[0] + matrix[7] * point[1] + matrix[8] * point[2];
            if (z < 0.02) continue;
            const p = project(matrix, point);
            const scanned = Math.abs(point[1] - scanY) < 0.045;
            const size = (scanned ? 2.3 : 1.55) * unit * p[3];
            ctx.globalAlpha = scanned ? 1 : 0.32 + z * 0.62;
            ctx.fillRect(p[0] - size / 2, p[1] - size / 2, size, size);
        }

        // Night side: the lower right of the planet falls into shadow
        const shade = ctx.createRadialGradient(cx - edge * 0.45, cy - edge * 0.5, edge * 0.55, cx - edge * 0.1, cy - edge * 0.1, edge * 1.25);
        shade.addColorStop(0, 'transparent');
        shade.addColorStop(1, colors.shade);
        ctx.globalAlpha = 1;
        ctx.fillStyle = shade;
        ctx.beginPath();
        ctx.arc(cx, cy, edge, 0, TAU);
        ctx.fill();

        // Thin bright line where the atmosphere meets the planet
        const rim = ctx.createLinearGradient(cx - edge, cy - edge, cx + edge, cy + edge);
        rim.addColorStop(0, colors.arc);
        rim.addColorStop(0.55, colors.atmosphere);
        rim.addColorStop(1, 'transparent');
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = rim;
        ctx.lineWidth = 1.4 * unit;
        ctx.beginPath();
        ctx.arc(cx, cy, edge, 0, TAU);
        ctx.stroke();

        drawAbove(true, unit, ring);

        // Flash where the shield caught a threat
        for (let i = bursts.length - 1; i >= 0; i--) {
            const burst = bursts[i];
            const age = (time - burst.born) / 0.8;
            if (age >= 1) { bursts.splice(i, 1); continue; }
            const p = project(matrix, burst.point);
            if (p[2] < 0) continue;
            ctx.strokeStyle = colors.threat;
            for (let wave = 0; wave < 2; wave++) {
                const grown = Math.max(0, age - wave * 0.18);
                ctx.globalAlpha = (1 - age) * 0.9;
                ctx.lineWidth = 1.5 * unit;
                ctx.beginPath();
                ctx.arc(p[0], p[1], (4 + grown * 22) * unit * p[3], 0, TAU);
                ctx.stroke();
            }
        }
        ctx.globalAlpha = 1;
    }

    // Counts the packets that arrived and the threats the shield stopped.
    function updateCounters() {
        arcs.forEach(arc => {
            const progress = (time * arc.speed + arc.offset) % 1;
            if (arc.threat) {
                if (arc.last <= CATCH_AT && progress > CATCH_AT) {
                    threats++;
                    bursts.push({ point: arc.points[Math.round(CATCH_AT * ARC_STEPS)], born: time });
                }
            } else if (progress < arc.last) packets++;
            arc.last = progress;
        });
        if (counters.packets) counters.packets.textContent = String(packets).padStart(4, '0');
        if (counters.threats) counters.threats.textContent = String(threats).padStart(4, '0');
    }

    function animate(now) {
        const delta = lastFrame ? Math.min((now - lastFrame) / 1000, 0.05) : 0.016;
        lastFrame = now;
        time += delta;
        if (!dragging) {
            spin += (SPIN + velocity) * delta;
            velocity *= Math.exp(-2.2 * delta);
            pitch += (0 - pitch) * (1 - Math.exp(-1.2 * delta));
        }
        const ease = 1 - Math.exp(-3 * delta);
        lookX += (lookTX - lookX) * ease;
        lookY += (lookTY - lookY) * ease;
        updateCounters();
        draw();
        frame = requestAnimationFrame(animate);
    }

    function sync() {
        cancelAnimationFrame(frame);
        frame = 0;
        lastFrame = 0;
        if (visible && !document.hidden && !still.matches) frame = requestAnimationFrame(animate);
        else draw();
    }

    // ---------- Interaction ----------

    canvas.addEventListener('pointerdown', event => {
        dragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
        velocity = 0;
        canvas.setPointerCapture(event.pointerId);
        canvas.classList.add('is-dragging');
    });
    canvas.addEventListener('pointermove', event => {
        if (!dragging) return;
        const dx = event.clientX - lastX, dy = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
        spin += dx * 0.008;
        pitch = Math.max(-0.8, Math.min(0.8, pitch + dy * 0.006));
        velocity = Math.max(-6, Math.min(6, dx * 0.35));
        if (!frame) draw();
    });
    const release = () => {
        dragging = false;
        canvas.classList.remove('is-dragging');
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);

    // With a mouse, the globe leans slightly towards the pointer.
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
        addEventListener('pointermove', event => {
            const box = canvas.getBoundingClientRect();
            const x = (event.clientX - (box.left + box.width / 2)) / innerWidth;
            const y = (event.clientY - (box.top + box.height / 2)) / innerHeight;
            lookTX = Math.max(-1, Math.min(1, x)) * 0.3;
            lookTY = Math.max(-1, Math.min(1, y)) * 0.2;
        }, { passive: true });
    }

    // ---------- Start ----------

    readColors();
    new MutationObserver(() => { readColors(); if (!frame) draw(); })
        .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'lang'] });
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
    else addEventListener('resize', resize);
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
            visible = entries[0].isIntersecting;
            sync();
        }, { rootMargin: '100px' }).observe(canvas);
    }
    document.addEventListener('visibilitychange', sync);
    still.addEventListener('change', sync);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!frame) draw(); });
    resize();
    sync();
})();
