// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/6z7GQewK-Ks

var canvas;
var rendering = false;
var xVal = 0;
var yVal = 0;
var maxZoom = 1000000000;
var xZoom = 1;
var yZoom = 1;
var aspectRatio;
var zoomVal = maxZoom;
var maxIterations = 128;
var palettes = ['tol-rainbow', 'tol-dv', 'tol-sq'];
var xSlider;
var ySlider;
var zoomSlider;

var activePalette;
var gui;


function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    pixelDensity(1);

    gui = createGui('Navigation');
    sliderRange(-2.5, 2.5, 10 / maxZoom);
    gui.addGlobals('xVal', 'yVal');
    sliderRange(1, maxZoom, 1);
    gui.addGlobals('zoomVal');
    sliderRange(1, 10000, 1);
    gui.addGlobals('maxIterations');
    gui.addGlobals('palettes');

    xSlider = document.getElementById('xVal');
    ySlider = document.getElementById('yVal');
    zoomSlider = document.getElementById('zoomVal');

    // Stop click through to canvas
    var guiPalette = document.getElementsByClassName('qs_main');
    guiPalette[0].addEventListener('mousedown', function (event) {
        event.stopPropagation();
    });

    noLoop();
}


function draw() {
    rendering = true;
    cursorBusy();

    activePalette = palette(palettes, 255);
    aspectRatio = width / height;

    loadPixels();

    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {

            updateVisibleArea();

            // map current pixel to visible area
            var a = map(x, 0, width, xVal - xZoom, xVal + xZoom);
            var b = map(y, 0, height, yVal - yZoom, yVal + yZoom);

            var ca = a;
            var cb = b;

            var n = 0;

            while (n < maxIterations) {
                var aa = a * a - b * b;
                var bb = 2 * a * b;
                a = aa + ca;
                b = bb + cb;
                if (a * a + b * b > 16) {
                    break;
                }
                n++;
            }

            var colorIndex = n % 254;
            var color = hexToRgb(activePalette[colorIndex]);

            if (n == maxIterations) {
                color = {'r': 0, 'g': 0, 'b': 0};
            }

            var pix = (x + y * width) * 4;
            pixels[pix + 0] = color.r;
            pixels[pix + 1] = color.g;
            pixels[pix + 2] = color.b;
            pixels[pix + 3] = 255;
        }
    }

    // No double binding on the GUI elements, so force update
    xSlider.value = xVal;
    xSlider.parentElement.children[0].innerText = 'xVal: ' + xVal;
    ySlider.value = yVal;
    ySlider.parentElement.children[0].innerText = 'yVal: ' + yVal;
    zoomSlider.value = zoomVal;
    zoomSlider.parentElement.children[0].innerText = 'zoomVal: ' + zoomVal;

    updatePixels();

    rendering = false;
    cursorReady();
}


function mouseWheel(event) {
    if (rendering === false) {
        zoomAndRedraw();
    }

    return false;
}


function mousePressed() {
    if (rendering === false) {
        centerAndZoomIn();
    }

    return false;
}


function keyPressed() {
    switch( keyCode ) {
        case LEFT_ARROW:
            move( 'left' );
            break;

        case RIGHT_ARROW:
            move( 'right' );
            break;

        case UP_ARROW:
            move( 'up' );
            break;

        case DOWN_ARROW:
            move( 'down' );
            break;

        case ENTER:
            zoom( 'in' );
            break;

        case BACKSPACE:
            zoom( 'out' );
            break;

        case ESCAPE:
            reset();
            break;
    }

    return false;
}


// dynamically adjust the canvas to the window
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function updateVisibleArea() {
    // get the extents of visible mandelbrot
    xZoom = (2.5 * zoomVal / maxZoom);
    yZoom = (2.5 * zoomVal / maxZoom) / aspectRatio;
}


function centerAndZoomIn() {
    updateVisibleArea();

    // map clicked position to visible extents and update position
    xVal = map(mouseX, 0, width, xVal - xZoom, xVal + xZoom);
    yVal = map(mouseY, 0, height, yVal - yZoom, yVal + yZoom);

    // Zoom in a bit
    zoomVal = zoomVal / 10;
    if (zoomVal < 1) {
        zoomVal = 1;
    }

    redraw()
}


function move( direction ) {
    var xStep = xZoom / 10;
    var yStep = yZoom / 10;

    switch ( direction ) {
        case 'up':
            yVal -= yStep;
            break;

        case 'down':
            yVal += yStep;
            break;

        case 'left':
            xVal -= xStep;
            break;

        case 'right':
            xVal += xStep;
            break;
    }

    redraw();
}


function zoom( direction ) {
    var zoomStep = zoomVal / 10;

    switch( direction ) {
        case 'in':
            zoomVal -= zoomStep;
            break;

        case 'out':
            zoomVal += zoomStep;
            break;
    }

    redraw();
}


function reset() {
    zoomVal = maxZoom;
    maxIterations = 128;
    xVal = 0;
    yVal = 0;

    redraw();
}


function zoomAndRedraw() {
    // Zoom is relative to current zoom level
    zoomVal += event.delta * (zoomVal / 1000);

    // Stay inside set bounds
    if (zoomVal < 1) {
        zoomVal = 1;
    }

    if (zoomVal > maxZoom) {
        zoomVal = maxZoom;
    }

    redraw()
}


function cursorBusy() {
    document.body.style.cursor = 'wait';
}

function cursorReady() {
    document.body.style.cursor = 'default';
}


/**
 * Convert hex color code to object with r, g, b properties
 *
 * @param hex
 * @returns {*}
 */
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
