// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/6z7GQewK-Ks

var XSlider;
var YSlider;
var ZoomSlider;
var IterationSlider;
var maxZoom;

var frDiv;
var palette;


function setup() {
    createCanvas(600, 600);
    pixelDensity(1);
    maxZoom = 100000;

    XSlider = createSlider(-2.5, 2.5, 0, 100/maxZoom);
    YSlider = createSlider(-2.5, 2.5, 0, 100/maxZoom);
    ZoomSlider = createSlider(1, maxZoom, maxZoom, 5);
    IterationSlider = createSlider(1, 255, 50, 5);

    frDiv = createDiv('');

    palette = palette('tol-rainbow', 255);
    // palette = palette('tol-dv', 255);
    // palette = palette('tol-sq', 255);
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
            var color = hexToRgb( palette[colorIndex] );

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