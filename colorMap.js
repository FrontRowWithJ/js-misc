class ColorMap {
    constructor(id, width) {
        if (arguments.length < 1)
            throw TypeError(`Failed to construct 'ColorMap' Object: id is ${id}`);
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.margin = Math.floor(width * 25 / 1000);
        let size = Math.floor(width * 60 / 100);
        this.sliderWidth = Math.floor(width * 5 / 100);
        this.displayWidth = Math.floor(width * 10 / 100);
        let n = width * 25 / 1000;
        this.ctx.strokeWidth = Math.floor(n * 10 / 75);
        this.triangleHeight = Math.floor(n * 65 / 75);
        this.tHeight = this.triangleHeight + this.ctx.strokeWidth;
        this.rgbWidth = Math.floor((width * 125 / 1000) * 2 / 3);
        this.rgbHeight = 25;
        this.size = size;
        this.triangleSideLength = this.triangleHeight / Math.sin(Math.PI / 3);
        this.canvas.width = this.size + this.margin * 4 + (this.tHeight) * 2 + this.sliderWidth + (this.rgbWidth + this.rgbHeight) * 2;
        this.canvas.height = this.size;
        this.circleX;
        this.circleY;
        this.radius = 6;
        this.canUpdateTextbox = true;
        this.canMoveColorMap = false;
        this.canMoveSlider = false;
        this.oldValue;
        this.color = {
            h: 0,
            s: 1,
            v: 1
        };
        let x = 0;
        let y = (1 - this.color.s) * this.size;
        this.body = document.createElement("div");
        this.body.id = id;
        this.body.style.position = "relative";
        this.initTrianglePoints();
        this.initOnmouseup();
        this.initOnmousedown();
        this.initOnmouseleave();
        this.initOnmousemove();
        this.initTextbox();
        this.updateColorMap(x, y);
        this.updateSlider();
        this.updateDisplay();
        this.addTextboxListeners();
        this.updateTextBox();
        this.initTextBoxes();
        this.setTextBoxInputs();
        this.body.appendChild(this.canvas);
        this.body.appendChild(this.textbox);
        this.onchange;
    }
    rescale(width) {
        this.margin = Math.floor(width * 25 / 1000);
        let size = Math.floor(width * 60 / 100);
        this.sliderWidth = Math.floor(width * 5 / 100);
        this.displayWidth = Math.floor(width * 10 / 100);
        let n = width * 25 / 1000;
        this.ctx.strokeWidth = Math.floor(n * 10 / 75);
        this.triangleHeight = Math.floor(n * 65 / 75);
        this.tHeight = this.triangleHeight + this.ctx.strokeWidth;
        this.rgbWidth = Math.floor((width * 125 / 1000) * 2 / 3);
        this.size = size;
        this.triangleSideLength = this.triangleHeight / Math.sin(Math.PI / 3);
        this.canvas.width = this.size + this.margin * 4 + (this.tHeight) * 2 + this.sliderWidth + (this.rgbWidth + this.rgbHeight) * 2;
        this.canvas.height = this.size;
        let x = 0;
        let y = (1 - this.color.s) * this.size;
        this.updateColorMap(x, y);
        this.updateSlider();
        this.updateDisplay();
        this.setTextBoxPos();
        let w = this.rgbWidth + this.rgbHeight;
        let c = "RGBHSV";
        let left = this.size + this.margin + this.sliderWidth + this.tHeight * 2;
        let mg = this.canvas.width - left;
        mg = (mg - 2 * w) / 3;
        let top = this.textbox.style.top;
        top = +top.substring(0, top.length - 2);
        for (let i = 0; i < c.length; i++) {
            let label = c.charAt(i);
            let l = Math.floor(i / 3) * (w + mg);
            let t = this.margin * 4 + i % 3 * this.rgbHeight;
            this.textBoxes[label].setPos(left + l, top + t);
        }
    }
    initTrianglePoints() {
        this.triangleLeft = {
            x0: 0,
            y0: 0,
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0
        };
        this.triangleRight = {
            x0: 0,
            y0: 0,
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0
        };
    }
    initOnmouseup() {
        this.canvas.onmouseup = () => {
            this.canMoveColorMap = false;
            this.canMoveSlider = false;
        }
    }
    initOnmousedown() {
        this.canvas.onmousedown = (evt) => {
            let xpos = evt.layerX;
            let ypos = evt.layerY;
            //checking if it is within the color map
            if (xpos >= 0 && xpos < this.size && ypos >= 0 && ypos < this.size) {
                this.canMoveColorMap = true;
                this.color.h = (xpos / this.size) * 360;
                this.color.s = 1 - ypos / this.size;
                this.updateColorMap(xpos, ypos);
                this.updateDisplay();
                this.updateSlider();
                this.updateTextBox();
                this.setRGBHSVTextBox(this.hsvToRgb(this.color.h, this.color.s, this.color.v));
                if (this.onchange)
                    this.onchange(this.hsvToRgb(this.color.h, this.color.s, this.color.v));
            }
            //checking if it is within the slider
            let x = this.size + this.margin + this.tHeight;
            if (this.canMoveSlider || xpos >= x && xpos < x + this.sliderWidth && ypos >= 0 && ypos < this.size) {
                this.canMoveSlider = true;
                this.color.v = 1 - ypos / this.size;
                this.updateColorMap();
                this.updateDisplay();
                this.updateSlider(ypos);
                this.updateTextBox();
                this.setRGBHSVTextBox(this.hsvToRgb(this.color.h, this.color.s, this.color.v));
                if (this.onchange)
                    this.onchange(this.hsvToRgb(this.color.h, this.color.s, this.color.v));
            }
        }
    }

    initOnmouseleave() {
        this.canvas.onmouseleave = () => {
            this.canMoveColorMap = false;
            this.canMoveSlider = false;
        }
    }

    initOnmousemove() {
        this.canvas.onmousemove = (evt) => {
            let xpos = evt.layerX;
            let ypos = evt.layerY;
            if (this.canMoveColorMap) {
                //checking if it is within the color map
                if (xpos >= 0 && xpos < this.size && ypos >= 0 && ypos < this.size) {
                    this.updateColorMap(xpos, ypos);
                    this.color.h = (xpos / this.size) * 360;
                    this.color.s = 1 - ypos / this.size;
                    this.updateDisplay();
                    this.updateSlider();
                    this.updateTextBox();
                    this.setRGBHSVTextBox(this.hsvToRgb(this.color.h, this.color.s, this.color.v));
                    if (this.onchange)
                        this.onchange(this.hsvToRgb(this.color.h, this.color.s, this.color.v));
                }
            }
            if (this.canMoveSlider) {
                let x = this.size + this.margin + this.tHeight;
                //checking if it is within the lider
                if (xpos >= x && xpos < x + this.sliderWidth && ypos >= 0 && ypos < this.size) {
                    this.color.v = 1 - ypos / this.size;
                    this.updateColorMap();
                    this.updateDisplay();
                    this.updateSlider(ypos);
                    this.updateTextBox();
                    this.setRGBHSVTextBox(this.hsvToRgb(this.color.h, this.color.s, this.color.v));
                    if (this.onchange)
                        this.onchange(this.hsvToRgb(this.color.h, this.color.s, this.color.v));
                }
            }
        }
    }
    initTextbox() {
        this.textbox = document.createElement("input");
        this.textbox.type = "text";
        this.textbox.style.position = "absolute";
        this.setTextBoxPos();
    }

    setTextBoxPos() {
        this.textbox.style.width = (this.rgbWidth + this.rgbHeight) + this.margin * 2 / 3 + this.rgbWidth + this.rgbHeight;
        let w = (this.margin + this.rgbWidth + this.rgbHeight) * 2;
        let x = this.canvas.width - w;
        let s = this.textbox.style.width;
        s = s.substring(0, s.length - 2);
        x += (w - +s) / 2;
        this.textbox.style.left = x;
        this.textbox.style.top = this.displayWidth + this.margin * 3;
    }

    initTextBoxes() {
        this.textBoxes = {};
        let width = this.rgbWidth + this.rgbHeight;
        let c = "RGBHSV";
        let left = this.size + this.margin + this.sliderWidth + this.tHeight * 2;
        let mg = this.canvas.width - left;
        mg = (mg - 2 * width) / 3;
        let top = this.textbox.style.top;
        top = +top.substring(0, top.length - 2);
        for (let i = 0; i < c.length; i++) {
            let label = c.charAt(i);
            let max;
            if (i < 3)
                max = 255;
            else if (i == 3)
                max = 360;
            else max = 100;
            let l = Math.floor(i / 3) * (width + mg);
            let t = this.margin * 4 + i % 3 * this.rgbHeight
            this.textBoxes[label] = new TextBox(left + l, top + t, label, label, 0, max, this.rgbWidth, this.rgbHeight);
            this.textBoxes[label].appendToDom(this.body);
        }
        this.textBoxes.R.textBody.value = 255;
        this.textBoxes.G.textBody.value = 0;
        this.textBoxes.B.textBody.value = 0;
        this.textBoxes.H.textBody.value = 0;
        this.textBoxes.S.textBody.value = 100;
        this.textBoxes.V.textBody.value = 100;
    }

    setTextBoxInputs() {
        for (let tb in this.textBoxes) {
            switch (tb) {
                case "H":
                    this.textBoxes[tb].setOnKeyUpEvent((evt) => {
                        let val = evt.target.value;
                        this.color.h = val;
                        this.circleX = val / 360 * this.size;
                        if (this.onchange)
                            this.onchange(this.hsvToRgb(this.color.h, this.color.s, this.color.v));
                        this.draw();
                    });
                    break;
                case "S":
                    this.textBoxes[tb].setOnKeyUpEvent((evt) => {
                        let val = evt.target.value;
                        this.color.s = val / 100;
                        this.circleY = (100 - val) / 100 * this.size;
                        if (this.onchange)
                            this.onchange(this.hsvToRgb(this.color.h, this.color.s, this.color.v));
                        this.draw();
                    });
                    break;
                case "V":
                    this.textBoxes[tb].setOnKeyUpEvent((evt) => {
                        let val = evt.target.value;
                        this.color.v = val / 100;
                        if (this.onchange)
                            this.onchange(this.hsvToRgb(this.color.h, this.color.s, this.color.v));
                        this.updateSlider();
                    });
                    break;
                case "R":
                case "G":
                case "B":
                    this.textBoxes[tb].setOnKeyUpEvent(() => {
                        let r = this.textBoxes.R.textBody.value;
                        r = r.length == 0 ? 0 : +r;
                        let g = this.textBoxes.G.textBody.value;
                        g = g.length == 0 ? 0 : +g;
                        let b = this.textBoxes.B.textBody.value;
                        b = b.length == 0 ? 0 : +b;
                        this.color = this.rgbToHsv(r, g, b);
                        this.circleX = this.color.h / 360 * this.size;
                        this.cirlceY = (1 - this.color.s) * this.size;
                        this.draw();
                        this.textBoxes.H.setTextBody(Math.floor(this.color.h));
                        this.textBoxes.S.setTextBody(Math.floor(this.color.s * 100));
                        this.textBoxes.V.setTextBody(Math.floor(this.color.v * 100));
                        if (this.onchange)
                            this.onchange(this.hsvToRgb(this.color.h, this.color.s, this.color.v));
                    });
            }
        }
    }
    setRGBHSVTextBox(r, g, b) {
        if (arguments.length == 1) {
            let hex = r.substring(1);
            r = parseInt(hex.substr(0, 2), 16);
            g = parseInt(hex.substr(2, 2), 16);
            b = parseInt(hex.substr(4, 2), 16);
        }
        this.circleX = this.color.h / 360 * this.size;
        this.cirlceY = (1 - this.color.s) * this.size;
        this.textBoxes.R.setTextBody(r);
        this.textBoxes.G.setTextBody(g);
        this.textBoxes.B.setTextBody(b);
        this.textBoxes.H.setTextBody(Math.floor(this.color.h));
        this.textBoxes.S.setTextBody(Math.floor(this.color.s * 100));
        this.textBoxes.V.setTextBody(Math.floor(this.color.v * 100));
    }

    updateColorMap(x = this.circleX, y = this.circleY) {
        this.circleX = x;
        this.circleY = y;
        this.ctx.clearRect(0, 0, this.size + this.radius, this.size);
        let fs = this.ctx.fillStyle;
        this.ctx.beginPath();
        for (let i = 0; i < this.size; i++) {
            let grad = this.ctx.createLinearGradient(i, 0, i, this.size);
            grad.addColorStop(0, this.hsvToRgb((i * 360) / this.size, 1, this.color.v));
            grad.addColorStop(1, this.hsvToRgb((i * 360) / this.size, 0, this.color.v));
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(i, 0, 1, this.size);
        }
        this.ctx.closePath();
        this.ctx.fillStyle = fs;
        //Drawing the circle
        let h = (this.size - x) / this.size * 360;
        let s = y / this.size;
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.hsvToRgb(h, s, 1 - this.color.v);
        this.ctx.arc(x, y, this.radius, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.beginPath();
        this.ctx.strokeStyle = "white";
        this.ctx.arc(x, y, this.radius - 1, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.fillStyle = fs;
    }

    updateTextBox() {
        this.textbox.value = this.hsvToRgb(this.color.h, this.color.s, this.color.v).toUpperCase();
        this.oldValue = this.textbox.value;
    }
    addTextboxListeners() {
        this.textbox.oninput = (evt) => {
            if (this.canUpdateTextbox) {
                this.oldValue = evt.target.value;
            } else {
                evt.target.value = this.oldValue;
            }
        }
        this.textbox.onkeyup = () => {
            let hex = this.textbox.value.substr(1);
            let len = hex.length;
            if (len == 3 || len == 6) {
                let r, g, b;
                if (len == 3) {
                    r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
                    g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
                    b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
                } else {
                    r = parseInt(hex.substr(0, 2), 16);
                    g = parseInt(hex.substr(2, 2), 16);
                    b = parseInt(hex.substr(4, 2), 16);
                }
                this.color = this.rgbToHsv(r, g, b);
                this.circleX = (this.color.h / 360) * this.size;
                this.circleY = (1 - this.color.s) * this.size;
                this.updateColorMap();
                this.updateDisplay();
                this.updateSlider();
                this.setRGBHSVTextBox(r, g, b);
                if (this.onchange)
                    this.onchange(this.hsvToRgb(this.color.h, this.color.s, this.color.v));
            }
        }

        this.textbox.onkeydown = (evt) => {
            let code = evt.keyCode;
            let str = evt.target.value;
            let isBackspace = code == 8 || code == 127;
            let isValidKeyCode = (code >= 48 && code <= 57) ||
                (code >= 65 && code <= 70) ||
                (code >= 97 && code <= 102);
            this.canUpdateTextbox = (str.length < 8 && str.length > 1) && (isValidKeyCode || isBackspace);
            if (str.length == 1)
                this.canUpdateTextbox = isValidKeyCode;
            if (str.length == 7 && isValidKeyCode)
                this.canUpdateTextbox = false;
            if (evt.target.selectionStart == 0 || (evt.target.selectionStart == 1 && isBackspace))
                this.canUpdateTextbox = false;
        }
    }

    rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        let h, s, v;
        let min, max, delta;
        min = r < g ? r : g;
        min = min < b ? min : b;
        max = r > g ? r : g;
        max = max > b ? max : b;
        v = max; // v
        delta = max - min;
        if (delta < 0.00001) {
            s = 0;
            h = 0; // undefined, maybe nan?
            return {
                h: h,
                s: s,
                v: v
            };
        }
        if (max > 0.0) { // NOTE: if Max is == 0, this divide would cause a crash
            s = (delta / max); // s
        } else {
            // if max is 0, then r = g = b = 0              
            // s = 0, h is undefined
            s = 0.0;
            h = NaN; // its now undefined
            return {
                h: h,
                s: s,
                v: v
            };
        }
        if (r >= max) // > is bogus, just keeps compilor happy
            h = (g - b) / delta; // between yellow & magenta
        else
        if (g >= max)
            h = 2.0 + (b - r) / delta; // between cyan & yellow
        else
            h = 4.0 + (r - g) / delta; // between magenta & cyan
        h *= 60.0; // degrees
        if (h < 0.0)
            h += 360.0;
        return {
            h: h,
            s: s,
            v: v
        };
    }
    updateSlider(y = (1 - this.color.v) * this.size) {
        let x = this.size + this.margin;
        let width = this.sliderWidth + this.tHeight * 2;
        let fs = this.ctx.fillStyle;
        this.ctx.beginPath();
        this.ctx.clearRect(this.size + this.margin - 1, 0, width + 2, this.size);
        this.ctx.fillStyle = (() => {
            let grd = this.ctx.createLinearGradient(0, 0, 0, this.size);
            grd.addColorStop(0, this.hsvToRgb(this.color.h, this.color.s, 1));
            grd.addColorStop(1, this.hsvToRgb(this.color.h, this.color.s, 0));
            return grd;
        })();
        this.ctx.fillRect(x + this.tHeight, 0, this.sliderWidth, this.size);
        this.setTriangle(this.triangleLeft, x + this.tHeight, y, -1);
        this.setTriangle(this.triangleRight, x + this.sliderWidth + this.tHeight, y, 1);
        this.drawTriangle(this.triangleLeft, {
            fill: "white",
            stroke: "black"
        });
        this.drawTriangle(this.triangleRight, {
            fill: "white",
            stroke: "black"
        });
        this.ctx.closePath();
        this.ctx.fillStyle = fs;
    }

    updateDisplay() {
        let width = (this.margin + this.rgbWidth + this.rgbHeight) * 2;
        let x = this.canvas.width - width;
        x += (width - this.displayWidth) / 2;
        let fs = this.ctx.fillStyle;
        this.ctx.fillStyle = this.hsvToRgb(this.color.h, this.color.s, this.color.v);
        this.ctx.fillRect(x, 0, this.displayWidth, this.displayWidth);
        this.ctx.fillStyle = fs;
    }

    hsvToRgb(h, s, v) {
        let hh, p, q, t, ff;
        let i;
        let r, g, b;

        function getHex(res, val) {
            return res += Number(Math.round(val)).toString(16).padStart(2, "0");
        }
        if (s <= 0.0) {
            return [v * 255, v * 255, v * 255].reduce(getHex, "#");
        }
        hh = h;
        if (hh >= 360.0) hh = 0.0;
        hh /= 60.0;
        i = Math.floor(hh);
        ff = hh - i;
        p = v * (1.0 - s);
        q = v * (1.0 - (s * ff));
        t = v * (1.0 - (s * (1.0 - ff)));
        switch (i) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = v;
                b = p;
                break;
            case 2:
                r = p;
                g = v;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = v;
                break;
            case 4:
                r = t;
                g = p;
                b = v;
                break;
            case 5:
            default:
                r = v;
                g = p;
                b = q;
                break;
        }
        return [r * 255, g * 255, b * 255].reduce(getHex, "#");
    }

    setTriangle(points, x, y, factor) {
        points.x0 = x;
        points.y0 = y;
        points.x1 = points.x0 + this.triangleHeight * factor;
        points.y1 = y - this.triangleSideLength / 2;
        points.x2 = points.x1;
        points.y2 = y + this.triangleSideLength / 2;
    }
    fillColor(color) {
        let tmp = this.ctx.fillStyle;
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.fillStyle = tmp;
    }
    strokeColor(color) {
        let tmp = this.ctx.strokeStyle;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
        this.ctx.strokeStyle = tmp;
    }
    drawTriangle(points, colors = {
        fill: "white",
        stroke: "white"
    }) {
        this.ctx.beginPath();
        this.ctx.moveTo(points.x0, points.y0);
        this.ctx.lineTo(points.x1, points.y1);
        this.ctx.lineTo(points.x2, points.y2);
        this.ctx.lineTo(points.x0, points.y0);
        if (colors.fill)
            this.fillColor(colors.fill);
        if (colors.stroke)
            this.strokeColor(colors.stroke);
        this.ctx.closePath();
    }

    appendCanvas(node) {
        if (typeof node === "string")
            document.getElementById(node).appendChild(this.body);
        else if (typeof node === "object")
            node.appendChild(this.body);
    }

    getColor() {
        return this.hsvToRgb(this.color.h, this.color.s, this.color.v);
    }
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateSlider();
        this.updateColorMap();
        this.updateDisplay();
        this.updateTextBox();
    }
    setRadius(radius) {
        this.radius = radius;
        this.draw();
    }

    setColor(color) {
        let hex = color.charAt(0) == '#' ? color.substr(1) : color;
        let len = hex.length;
        if (len == 3 || len == 6) {
            let r, g, b;
            if (len == 3) {
                r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
                g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
                b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
            } else {
                r = parseInt(hex.substr(0, 2), 16);
                g = parseInt(hex.substr(2, 2), 16);
                b = parseInt(hex.substr(4, 2), 16);
            }
            this.color = this.rgbToHsv(r, g, b);
            this.circleX = (this.color.h / 360) * this.size;
            this.circleY = (1 - this.color.s) * this.size;
            this.draw();
            this.setRGBHSVTextBox(r, g, b);
        }
    }
    getColor() {
        return this.hsvToRgb(this.color.h, this.color.s, this.color.v);
    }
}