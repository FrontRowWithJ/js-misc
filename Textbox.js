const BACKSPACE = 8;
const DELETE = 127;
class TextBox {
    constructor(x, y, label, id, min, max, width = 50, height = 25) {
        this.x = x;
        this.y = y;
        this.min = min;
        this.max = max;
        this.width = width;
        this.height = height;
        this.label = label;
        this.id = id;
        this.canUpdateTextbox = true;
        this.oldValue = "";
        this.body = document.createElement("div");
        this.textName = document.createElement("div");
        this.textBody = document.createElement("input");
        this.setOnInputEvent();
        this.setOnKeyDownEvent();
        this.initBody();
        this.initTextBody();
        this.initTextName();
        this.body.appendChild(this.textName);
        this.body.appendChild(this.textBody);
    }

    initTextName() {
        let tn = this.textName;
        tn.innerHTML = this.label;
        tn.style.position = "absolute";
        tn.style.width = this.height;
        tn.style.height = this.height;
        tn.style.display = "flex";
        tn.style.justifyContent = "center";
        tn.style.alignItems = "center";
    }

    initTextBody() {
        let tb = this.textBody;
        tb.type = "text";
        tb.id = "id";
        tb.style.position = "absolute";
        tb.style.left = this.height;
        tb.style.top = 0;
        tb.style.height = this.height;
        tb.style.width = this.width;
    }

    initBody() {
        this.body.style.position = "absolute";
        this.body.style.left = this.x;
        this.body.style.top = this.y;
    }

    setOnInputEvent() {
        this.textBody.oninput = (evt) => {
            if (this.canUpdateTextbox) {
                this.oldValue = evt.target.value;
            } else {
                evt.target.value = this.oldValue;
            }
        }
    }

    setOnKeyUpEvent(onkeyup) {
        //This needs to be custom set;
        this.textBody.onkeyup = onkeyup;
    }

    setOnKeyDownEvent() {
        this.textBody.onkeydown = (evt) => {
            let code = evt.keyCode;
            let value = evt.target.value;
            let isValidKeyCode = (code >= 48 && code <= 57) ||
                code == BACKSPACE || code == DELETE;
            if (isValidKeyCode) {
                let pos = evt.target.selectionStart;
                let newValue;
                if (code == BACKSPACE || code == DELETE) {
                    newValue = value.substring(0, pos - 1) + value.substring(pos + 1);
                } else
                    newValue = value.substring(0, pos) + evt.key + value.substring(pos);
                this.canUpdateTextbox = +newValue >= this.min && +newValue <= this.max;
            } else
                this.canUpdateTextbox = false;
        }
    }

    appendToDom(arg) {
        if (typeof arg === "string")
            document.getElementById(arg).appendChild(this.body);
        else if (typeof arg === "object")
            arg.appendChild(this.body);
        else
            throw TypeError("argument is not a DOM Object");
    }

    setTextBody(value) {
        if (typeof value === "number" && +value >= this.min && +value <= this.max)
            this.textBody.value = value;
        else throw TypeError("Invalid input: The value is not a number or is out of range: " + value);
    }

    setPos(x, y) {
        this.x = x;
        this.y = y;
        this.body.style.left = x;
        this.body.style.top = y;
    }
}