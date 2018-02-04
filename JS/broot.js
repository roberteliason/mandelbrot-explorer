// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/6z7GQewK-Ks

var canvas;
var XSlider;
var YSlider;
var ZoomSlider;
var IterationSlider;
var paletteSelector;
var maxZoom;

var frDiv;
var activePalette;


function setup() {
    maxZoom = 100000;

    canvas = createCanvas(600, 600);
    canvas.parent( 'canvas' );
    pixelDensity(1);

    paletteSelector = createSelect();
    paletteSelector.position(10, 10);
    paletteSelector.option('tol-rainbow');
    paletteSelector.option('tol-dv');
    paletteSelector.option('tol-sq');

    XSlider = createSlider(-2.5, 2.5, 0, 100/maxZoom);
    XSlider.parent( 'xSlider' );

    YSlider = createSlider(-2.5, 2.5, 0, 100/maxZoom);
    YSlider.parent( 'ySlider' );

    ZoomSlider = createSlider(1, maxZoom, maxZoom, 5);
    ZoomSlider.parent( 'zoomSlider' );

    IterationSlider = createSlider(1, 255, 50, 5);
    IterationSlider.parent( 'iterationSlider' );

    frDiv = createDiv('');

    activePalette = palette( paletteSelector.value(), 255);
}


function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}


function draw() {
    var Xval = XSlider.value();
    var Yval = YSlider.value();
    var zoom = ZoomSlider.value() / maxZoom;
    var maxIterations = IterationSlider.value();
    activePalette = palette( paletteSelector.value(), 255);


    loadPixels();
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {

            var a = map(x, 0, width, Xval - (2.5 * zoom), Xval + (2.5 * zoom));
            var b = map(y, 0, height, Yval - (2.5 * zoom), Yval + (2.5 * zoom));

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

            var colorIndex = n;
            if( colorIndex > 254 ) {
                colorIndex = 254;
            }
            var color = hexToRgb( activePalette[colorIndex] );

            if (n == maxIterations) {
                color = { 'r': 0, 'g': 0, 'b': 0 };
            }

            var pix = (x + y * width) * 4;
            pixels[pix + 0] = color.r;
            pixels[pix + 1] = color.g;
            pixels[pix + 2] = color.b;
            pixels[pix + 3] = 255;
        }
    }
    updatePixels();

    frDiv.html(floor(frameRate()));
}