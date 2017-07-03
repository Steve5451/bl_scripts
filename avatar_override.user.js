// ==UserScript==
// @name         Avatar Override
// @namespace    http://thepotato.net/
// @version      1.0.2
// @description  Change people's avatars.
// @author       Steve5451
// @include      https://forum.blockland.us*
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @noframes
// ==/UserScript==

const SEAMLESS_MODE = true, // Run while the page is loading rather than at the end? Reduces pop-in effect.
      AVATAR_STYLE = "max-width: 75px; max-height: 75px;"; // You should probably keep this the way it is unless you want big avatars.

// ------------------------------------------------ no touch --------------------------------------------------- //

var gmSettings = GM_getValue("avatar_overrides"),
    settings = {},
    interval,
    PaintCanvas;

if(!gmSettings) {
    GM_setValue("avatar_overrides", "{}");
} else {
    try {
        settings = JSON.parse(gmSettings);
    } catch(error) {
        console.log(error + "\nCouldn't load settings.");
        GM_setValue("avatar_overrides", "{}");
        settings = {};
    }
}

if(window.location.href.startsWith("https://forum.blockland.us/index.php?topic=")) { // In a topic
    if(SEAMLESS_MODE)
        interval = setInterval(replaceAvatars, 1);

    document.addEventListener("DOMContentLoaded", SEAMLESS_MODE ? () => { // In seamless mode:
        replaceAvatars(); // Run oncemore to assure all avatars are processed.
        clearInterval(interval); // Kill our avatar polling interval.
    } : replaceAvatars ); // Not in seamless mode, run now that the document has loaded.
} else if(window.location.href.match(/^(.*\?action=profile;u=[0-9]{1,})$/)) { // On a users profile
    const uIDIndex = window.location.href.indexOf(";u=");
    if(uIDIndex === -1) return;

    const userID = window.location.href.substr(uIDIndex + 3).split("&")[0].split("#")[0]; // Get user ID from url and just in case remove any GET params after

    document.addEventListener("DOMContentLoaded", function() { // Page loaded
        const isEdited = (settings[userID] !== undefined),
              isBlocked = (settings[userID] === "block"),

              userTable = document.body.querySelector('table[border="0"][cellspacing="0"][cellpadding="2"][width="100%"]'),
              firstTD = userTable.getElementsByTagName("td")[0];

        var avatar = document.getElementsByClassName("avatar")[0];

        const containerShow = document.createElement("span");
        containerShow.setAttribute("style", (isEdited ? "font-size: 8pt; color: #d00;" : "font-size: 7pt;") + " cursor: pointer;");
        containerShow.innerHTML = isEdited ? (isBlocked ? "[blocked]" : "[edited]") : "[edit]";
        containerShow.onclick = function() {
            buttonContainer.style.display = "block";
            this.style.display = "none";
        };

        const buttonContainer = document.createElement("div");
        buttonContainer.setAttribute("style", "display: none;");

        const replaceImageURL = document.createElement("input");
        replaceImageURL.type = "button";
        replaceImageURL.value = "Replace avatar by URL";
        replaceImageURL.onclick = function() {
            let newURL = prompt("Paste url of new image");

            if(!newURL) return;
            if(avatar && (newURL === avatar.src || (settings[userID] && settings[userID] === newURL))) {
                alert("That's already the current URL.");
                return;
            }

            settings[userID] = newURL;
            saveSettings();

            updateUserPageAvatar(userID);
        };
        buttonContainer.appendChild(replaceImageURL);

        const replaceImageFile = document.createElement("input");
        replaceImageFile.type = "file";
        replaceImageFile.accept = "image/*";
        replaceImageFile.style.display = "none";
        replaceImageFile.onchange = function() {
            if(!this.files && this.files.length <= 0) return;
            if(!this.files[0].type.startsWith("image/")) return alert("File must be an image");

            const fileReader = new FileReader();
            fileReader.onloadend = function() {
                settings[userID] = fileReader.result;
                saveSettings();

                updateUserPageAvatar(userID);
            };
            fileReader.readAsDataURL(this.files[0]);
        };
        buttonContainer.appendChild(replaceImageFile);

        const replaceImageFileHandler = document.createElement("input");
        replaceImageFileHandler.type = "button";
        replaceImageFileHandler.value = "Replace avatar by file";
        replaceImageFileHandler.onclick = function() { replaceImageFile.click(); };
        buttonContainer.appendChild(replaceImageFileHandler);

        const drawImage = document.createElement("input");
        drawImage.type = "button";
        drawImage.value = "Draw";
        drawImage.onclick = function() {
            if(PaintCanvas) return;

            Paint = new Painter(avatar, userID);
            document.body.appendChild(Paint.bg);
        };
        buttonContainer.appendChild(drawImage);

        const resetImage = document.createElement("input");
        resetImage.type = "button";
        resetImage.value = "Reset image";
        resetImage.onclick = function() {
            if(!settings[userID]) return;

            delete settings[userID];
            saveSettings();

            location.reload();
        };
        buttonContainer.appendChild(resetImage);

        if(settings[userID] !== "block") {
            const blockImage = document.createElement("input");
            blockImage.type = "button";
            blockImage.value = "Block avatar";
            blockImage.onclick = function() {
                settings[userID] = "block";
                saveSettings();

                updateUserPageAvatar(userID);
            };
            buttonContainer.appendChild(blockImage);
        }

        if(!avatar) {
            firstTD.innerHTML = "";

            avatar = document.createElement("img");
            avatar.setAttribute("class", "avatar");

            firstTD.appendChild(avatar);

            firstTD.appendChild(document.createElement("br"));
            firstTD.appendChild(document.createElement("br"));
        }

        avatar.setAttribute("style", AVATAR_STYLE);
        updateUserPageAvatar(userID);

        firstTD.insertBefore(containerShow, firstTD.firstChild);
        firstTD.insertBefore(document.createElement("br"), containerShow.nextSibling);
        firstTD.insertBefore(buttonContainer, firstTD.firstChild);
    });
}

function updateUserPageAvatar(userID) {
    const avatar = document.getElementsByClassName("avatar")[0];
    if(!avatar) return;
    if(!settings[userID]) return;

    if(settings[userID] === "block") {
        avatar.src = "";
        return ;
    }

    avatar.src = settings[userID];
}


function replaceAvatars() {
    const users = document.body.querySelectorAll('td[valign="top"][width="15%"][rowspan="2"] > b > a[href^="https://forum.blockland.us/index.php?action=profile;u="]');

    for(let i = 0; i < users.length; ++i) {
        const userID = users[i].href.split(";u=")[1].split("&")[0].split("#")[0];

        if(!settings[userID]) continue;

        var avatarContainer = users[i].parentNode.nextSibling.nextSibling.nextSibling,
            avatar = avatarContainer.getElementsByClassName("avatar")[0];

        if(!avatar) {
            avatar = document.createElement("img");
            avatar.setAttribute("class", "avatar");
            avatar.setAttribute("style", AVATAR_STYLE);

            avatarContainer.appendChild(avatar);
        }

        if(settings[userID] === "block") {
            avatar.src = "";
            avatar.display = "none";

            continue;
        }

        avatar.src = settings[userID];
    }
}

function saveSettings() {
    GM_setValue("avatar_overrides", JSON.stringify(settings));
}

class Painter {
    constructor(avatar, userID) {
        if(avatar)
            this.avatar = avatar;
        if(userID)
            this.userID = userID;

        this.mouseDown = false;
        this.color = "#000000";
        this.lastStroke = undefined;

        this.bg = document.createElement("div");
        this.bg.setAttribute("style", "text-align: center; padding-top: 50px; z-index: 100; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; background-color: rgba(0, 0, 0, 0.5); position: absolute; top: 0px; left: 0px; width: 100%; height: 5000px; overflow: hidden;");

        this.bg.onmousedown = e => {
            this.mouseDown = true;
        };

        this.bg.onmouseup = e => {
            this.mouseDown = false;

            if(this.ctx && this.lastStroke)
                this.ctx.stroke();

            this.lastStroke = undefined;
        };

        this.toolbox = document.createElement("div");
        this.toolbox.setAttribute("style", "display: inline-block; text-align: left; width: 500px; background-color: #eee; border: 1px solid #000; border-bottom: 0px solid transparent; z-index: 101;");
        this.bg.appendChild(this.toolbox);

        this.colorPicker = document.createElement("input");
        this.colorPicker.type = "color";
        this.colorPicker.value = "#000000";
        this.colorPicker.style.marginRight = "5px";
        this.colorPicker.onchange = e => {
            this.color = this.colorPicker.value;
            if(this.ctx)
                this.ctx.strokeStyle = this.colorPicker.value;
        };
        this.toolbox.appendChild(this.colorPicker);

        this.importAvatar = document.createElement("input");
        this.importAvatar.type = "button";
        this.importAvatar.value = "Import current avatar";
        this.importAvatar.onclick = e => {
            if(!this.ctx || !this.avatar) return;

            this.ctx.drawImage(this.avatar, 0, 0, this.canvas.width, this.canvas.height);
        };
        this.toolbox.appendChild(this.importAvatar);

        this.clearCanvas = document.createElement("input");
        this.clearCanvas.type = "button";
        this.clearCanvas.value = "Clear";
        this.clearCanvas.onclick = e => {
            if(!this.ctx || !this.avatar) return;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        };
        this.toolbox.appendChild(this.clearCanvas);

        this.cancel = document.createElement("input");
        this.cancel.type = "button";
        this.cancel.value = "Close";
        this.cancel.style.float = "right";
        this.cancel.onclick = e => {
            if(!confirm("Exit painter?")) return;

            PaintCanvas = undefined;
            this.bg.remove();
        };
        this.toolbox.appendChild(this.cancel);

        this.apply = document.createElement("input");
        this.apply.type = "button";
        this.apply.value = "Save";
        this.apply.style.float = "right";
        this.apply.onclick = e => {
            let tempCanvas = document.createElement("canvas");
            tempCanvas.width = 75;
            tempCanvas.height = 75;

            tempCanvas.getContext("2d").drawImage(this.canvas, 0, 0, 75, 75);

            settings[this.userID] = tempCanvas.toDataURL("image/png");
            saveSettings();

            updateUserPageAvatar(this.userID);
        };
        this.toolbox.appendChild(this.apply);

        this.bg.appendChild(document.createElement("br"));

        this.canvas = document.createElement("canvas");
        this.canvas.width = this.canvas.height = 500;
        this.canvas.setAttribute("style", "background-color: #fff; cursor: crosshair; background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAANElEQVQ4y2O8devWfwYigKqqKjHKGJgYqAxGDRw1cDAYyPj//3+icsrt27dHw3DUwJFrIADkIQqwsXiZKgAAAABJRU5ErkJggg==); border: 1px solid #000;");

        this.canvas.onmousemove = e => {
            if(!this.mouseDown) return;

            console.log(e);

            this.strokeStyle = this.color;

            if(!this.lastStroke) {
                this.ctx.beginPath();
                this.ctx.moveTo(e.offsetX, e.offsetY);
            } else {
                this.ctx.lineTo(e.offsetX, e.offsetY);
                this.ctx.stroke();
            }

            this.lastStroke = {x: e.offsetX, y: e.offsetY };

        };

        this.canvas.onmouseleave = e => {
            this.lastStroke = undefined;
        };

        this.ctx = this.canvas.getContext("2d");
        this.bg.appendChild(this.canvas);

        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = 10;
    }
}

/* Changelog:

1.0   - Initial release
1.0.1 - Added clear button to painter and bugfix
1.0.2 - Fixed a bug related to user's profiles.

*/