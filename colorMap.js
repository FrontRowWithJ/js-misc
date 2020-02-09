const ASCII_CODE_0 = 48;
const ASCII_CODE_9 = 57;
const ASCII_CODE_A = 65;
const ASCII_CODE_F = 70;
const ASCII_CODE_a = 97;
const ASCII_CODE_f = 102;


class ColorMap {
    constructor(width) {
        this.body = document.createElement("div");
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.textbox = document.createElement("input");
        this.preview = document.createElement("div");
        this.onchange = null;
        let d = new Date();
        this.canvas.id = "color-map-canvas-" + d.getMilliseconds();
        this.body.id = "color-map-body-" + d.getMilliseconds();
        this.textbox.id = "color-map-text-box-" + d.getMilliseconds();
        this.slider = {
            width: undefined,
            height: undefined,
            left: undefined,
            top: undefined
        };
        this.cmap = {
            width: undefined,
            height: undefined,
            left: undefined,
            top: undefined
        };
        this.hsv = {
            h: 0,
            s: 0,
            v: 1
        }
        this.circle = {
            radius: 6,
            left: undefined,
            top: undefined
        }
        this.sliderLine = {
            width: undefined,
            height: undefined,
            left: undefined,
            top: undefined,
            color: undefined //? rgb or hsv?
        };
        //setting the dimensions of the visual components
        this.margin = 2;
        this.setTextBoxDimensions(width);
        this.setCMapDimensions(width - this.margin * 4);
        this.setSliderDimensions(width - this.margin * 4);
        this.setCanvasDimensions(width);
        this.setSliderLineDimensions();
        this.setBodyDimensions(width);
        this.setPreviewDimensions();
        //setting the positions of the visual components;
        this.setTextBoxPos();
        this.setCanvasPos();
        this.setColorMapPos();
        this.setSliderPos();
        this.setSliderLinePos();
        this.setCirclePos();
        this.setPreviewPos();
        //drawing the visual components
        this.drawTextBox();
        this.draw(false);
        //append the visual elements to the body
        this.appendToBody();
        //Add functionality to the color map
        this.addTextBoxEvents();
        this.addWindowEvent();
        this.addColorMapEvents();
        this.canvas.style.display = "none";
        this.textbox.style.transition = "0.5s";
        this.textbox.style.webkitTransition = "0.5s";
        this.textbox.value = "FFFFFF";
    }

    setPreviewDimensions() {
        this.preview.style.width = this.textBoxHeight;
        this.preview.style.height = this.textBoxHeight;
    }

    setTextBoxDimensions(width) {
        this.textBoxHeight = 25;
        this.textbox.style.width = width - this.textBoxHeight;
        this.textbox.style.height = this.textBoxHeight;
    }

    setCMapDimensions(w) {
        this.cmap.width = this.cmap.height = Math.floor(w * 5 / 6);
    }
    setSliderDimensions(w) {
        this.slider.width = w - this.cmap.width;
        this.slider.height = this.cmap.height;
    }

    setCanvasDimensions(width) {
        this.canvas.width = width;
        this.canvas.height = this.cmap.height + this.margin * 2;
    }

    setSliderLineDimensions() {
        this.sliderLine.width = this.slider.width;
        this.sliderLine.height = 3;
    }

    setBodyDimensions(width) {
        this.body.style.width = width;
        this.body.style.height = this.textBoxHeight + this.canvas.height;
    }

    setPreviewPos() {
        this.preview.style.left = 0;
        this.preview.style.top = 0;
    }

    setTextBoxPos() {
        //setting caret position
        this.textbox.style.position = "absolute";
        this.textbox.style.left = this.textBoxHeight;
        this.textbox.style.top = 0;
    }

    setCanvasPos() {
        this.canvas.style.position = "absolute";
        this.canvas.style.left = 0;
        this.canvas.style.top = this.textBoxHeight;
    }

    setColorMapPos() {
        this.cmap.left = this.margin;
        this.cmap.top = this.margin;
    }

    setSliderPos() {
        this.slider.left = this.margin * 3 + this.cmap.width;
        this.slider.top = this.margin;
    }

    setSliderLinePos(top = this.margin + (1 - this.hsv.v) * this.slider.height) {
        this.sliderLine.left = this.slider.left;
        this.sliderLine.top = top;
    }

    setCirclePos(left = this.margin + (this.hsv.h / 360) * this.cmap.width,
        top = this.margin + (1 - this.hsv.s) * this.cmap.height) {
        this.circle.left = left;
        this.circle.top = top;
    }

    drawTextBox() {
        this.textbox.style.paddingLeft = "5px";
        this.textbox.style.outline = "none";
        this.textbox.style.border = "none";
        this.textbox.style.margin = 0;
        this.textbox.style.overflow = "visible";
        this.textbox.type = "text";
    }

    drawColorMap() {
        this.ctx.clearRect(this.cmap.left, this.cmap.top, this.cmap.width, this.cmap.height);
        let fs = this.ctx.fillStyle;
        for (let i = 0; i < this.cmap.width; i++) {
            let grad = this.ctx.createLinearGradient(i, 0, i, this.cmap.width);
            grad.addColorStop(0, this.hsvToRgb((i * 360) / this.cmap.width, 1, this.hsv.v));
            grad.addColorStop(1, this.hsvToRgb((i * 360) / this.cmap.width, 0, this.hsv.v));
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(this.cmap.left + i, this.cmap.top, 1, this.cmap.height);
        }
        this.ctx.fillStyle = fs;
    }

    drawSlider() {
        this.ctx.clearRect(this.slider.left, this.slider.top, this.slider.width, this.slider.height);
        let fs = this.ctx.fillStyle;
        this.ctx.fillStyle = (() => {
            let grd = this.ctx.createLinearGradient(0, 0, 0, this.slider.height);
            grd.addColorStop(0, this.hsvToRgb(this.hsv.h, this.hsv.s, 1));
            grd.addColorStop(1, this.hsvToRgb(this.hsv.h, this.hsv.s, 0));
            return grd;
        })();
        this.ctx.fillRect(this.slider.left, this.slider.top, this.slider.width, this.slider.height);
        this.ctx.fillStyle = fs;
    }

    drawSliderLine() {
        this.ctx.fillStyle = this.hsvToRgb(this.hsv.h, this.hsv.s, 1 - this.hsv.v);
        this.ctx.fillRect(this.sliderLine.left, this.sliderLine.top, this.sliderLine.width, this.sliderLine.height);
    }

    drawCircle() {
        this.ctx.beginPath();
        let h = 360 - 360 * this.circle.left / this.cmap.width;
        let s = this.circle.top / this.cmap.height;
        this.ctx.strokeStyle = this.hsvToRgb(h, s, 1 - this.hsv.v);
        this.ctx.arc(this.circle.left, this.circle.top, this.circle.radius, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.strokeStyle = "white";
        this.ctx.arc(this.circle.left, this.circle.top, this.circle.radius - 1, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.closePath();
    }
    //THe margin must be drawn first or else it a visual component may not be visible
    drawMargin() {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawPreview() {
        this.preview.style.backgroundColor = this.hsvToRgb();
    }

    appendToBody() {
        this.body.style.position = "relative";
        this.body.appendChild(this.textbox);
        this.body.appendChild(this.canvas);
        this.body.appendChild(this.preview);
    }

    //Append to a DOM object by passing an id or the desired DOM Objec
    appendToDomObject(dom) {
        if (typeof dom === "string")
            document.getElementById(dom).appendChild(this.body);
        else if (typeof dom === "object")
            dom.appendChild(this.body);
    }

    addTextBoxEvents() {
        this.textbox.onclick = () => {
            this.canvas.style.display = "";
        };

        this.textbox.onkeyup = (evt) => {
            let hex = evt.target.value;
            let len = hex.length;
            let isValid = len == 3 || len == 6;
            for (let i = 0; i < hex.length && isValid; i++) {
                let c = hex.charCodeAt(i);
                isValid = (c >= ASCII_CODE_0 && c <= ASCII_CODE_9) ||
                    (c >= ASCII_CODE_A && c <= ASCII_CODE_F) ||
                    (c >= ASCII_CODE_a && c <= ASCII_CODE_f)
            }
            if (isValid) {
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
                this.hsv = this.rgbToHsv(r, g, b);
                this.setCirclePos();
                this.setSliderLinePos();
                this.draw();
            }
        }
    }

    addWindowEvent() {
        window.onmousedown = (e) => {
            if (e.target.id !== this.body.id &&
                e.target.id !== this.canvas.id &&
                e.target.id !== this.textbox.id) {
                this.canvas.style.display = "none";
                this.canMoveCircle = this.canMoveSlider = false;
            }
        };
    }

    addColorMapEvents() {
        this.canvas.onmouseup = () => {
            this.canMoveSlider = this.canMoveCircle = false;
        }

        this.canvas.onmouseleave = () => {
            this.canMoveSlider = this.canMoveCircle = false;
        }
        this.canvas.onmousedown = (evt) => {
            let left = evt.layerX;
            let top = evt.layerY;
            this.moveCircle(left, top, true);
            this.moveSlider(left, top, true);
        }

        this.canvas.onmousemove = (evt) => {
            let left = evt.layerX;
            let top = evt.layerY;
            this.moveCircle(left, top, this.canMoveCircle);
            this.moveSlider(left, top, this.canMoveSlider);
        }
    }

    moveCircle(left, top, canMove) {
        if (canMove)
            if (left >= this.cmap.left &&
                left < this.cmap.left + this.cmap.width &&
                top >= this.cmap.top &&
                top < this.cmap.top + this.cmap.height) {
                this.canMoveCircle = true;
                this.hsv.h = (left - this.margin) / this.cmap.width * 360;
                this.hsv.s = 1 - (top - this.margin) / this.cmap.height;
                this.setCirclePos();
                this.draw();
                this.textbox.value = this.hsvToRgb().substring(1).toUpperCase();
            }
    }

    moveSlider(left, top, canMove) {
        if (canMove) {
            if (left >= this.slider.left &&
                left < this.slider.left + this.slider.width &&
                top >= this.slider.top &&
                top < this.slider.top + this.slider.height) {
                this.canMoveSlider = true;
                this.hsv.v = 1 - (top - this.margin) / this.slider.height;
                this.setSliderLinePos();
                this.draw();
                this.textbox.value = this.hsvToRgb().substring(1).toUpperCase();
            }
        }
    }
    draw(canTrigger = true) {
        this.drawMargin();
        this.drawColorMap();
        this.drawCircle();
        this.drawSlider();
        this.drawSliderLine();
        this.drawPreview();
        if (!!this.onchange && canTrigger)
            this.onchange(this.hsvToRgb())
    }

    rescale(width) {
        //updating dimensions
        this.setTextBoxDimensions(width);
        this.setCMapDimensions(width - this.margin * 4);
        this.setSliderDimensions(width - this.margin * 4);
        this.setCanvasDimensions(width);
        this.setSliderLineDimensions();
        this.setBodyDimensions(width);
        //repositioning visual components
        this.setTextBoxPos();
        this.setCanvasPos();
        this.setColorMapPos();
        this.setSliderPos();
        this.setSliderLinePos();
        this.setCirclePos();
        //redraw all the components
        this.draw(false);
    }

    setColor(color) {
        let hex;
        let r, g, b;
        if (color.charAt(0) === "#") {
            hex = color.substring(1);
        } else {
            hex = color;
        }
        if (hex.length === 3) {
            r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
            g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
            b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
        } else if (hex.length === 6) {
            r = parseInt(hex.substr(0, 2), 16);
            g = parseInt(hex.substr(2, 2), 16);
            b = parseInt(hex.substr(4, 2), 16);
        }
        this.hsv = this.rgbToHsv(r, g, b);
        this.setCirclePos();
        this.setSliderLinePos();
        this.draw();
        this.textbox.value = this.hsvToRgb().substring(1);
    }

    getColor() {
        return this.hsvToRgb();
    }

    hsvToRgb(h = this.hsv.h, s = this.hsv.s, v = this.hsv.v) {
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
}
