let body = document.body;
//each number can be represented in 3 bits, where each bit represents an rgb value
// the change in bits between each succesive number determines the change in rgb value;
// e.g if  100 (4) => 110 (6) means that red remains the same, g is transitioning from 0 to 255 
// and blue remains the same value of 0
let bits = [4, 6, 2, 3, 1, 5];
// the maximum number of colors.
let numOfColors = 1536;

let getRGB = (c) => "rgb(" + c[0] + ", " + c[1] + ", " + c[2] + ")";

// takes an number between 0 and 1536 and returns a color on the rainbow 
// spectrum that corresponds to that color
function getColor(num) {
    let region = Math.floor((+num / +numOfColors) * +bits.length);
    let bit = +bits[region];
    let interpol = num % 256;
    let b1 = bit.toString(2).padStart(3, "0").split("").map(n => +n);
    let b2 = bits[(region + 1) % bits.length].toString(2).padStart(3, "0").split("").map(n => +n);
    let c = [0, 1, 2];
    c = c.map((n) => b1[n] == b2[n] ? (b1[n] == 0 ? 0 : 255) : Math.floor(b1[n] * 255 + (b2[n] * 255 - b1[n] * 255) * (interpol / 256)));
    return getRGB(c);
}
// offset valuez so that the start of the interpolation is different from the end
let a = 0;
let b = 256;

function wave() {
    let rgb1 = getColor(a);
    a = (a+1) % numOfColors;
    let rgb2 = getColor(b);
    b = (b+1) % numOfColors;
    body.style.background = "linear-gradient(" + rgb1 + ", " + rgb2 + ") center center fixed";
    body.style.backgroundClip = "text";
}
//interval so that the background color changes every 10milliseconds
setInterval(wave, 10);
