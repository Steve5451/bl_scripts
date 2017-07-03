// ==UserScript==
// @name Blockland Embedder
// @version 3.4
// @updateURL http://pastebin.com/raw.php?i=V8uRXppr
// @downloadURL http://pastebin.com/raw.php?i=V8uRXppr
// @include https://forum.blockland.us*
// @description Embed YouTube, Soundcloud, gifv, various video, and audio links on BLF.
// @author Steve5451
// @grant none
// @noframes
// ==/UserScript==

const autoplay = true; // Whether to start playing the media after clicking embed. false to disable. note: NOT auto-embed.

// ----------------------------- You probably shouldn't touch anything below ----------------------- //

var links = document.getElementsByTagName("a"),
    embedButtons = [], // Get a list of links.

    resize = {
        dragging: false,
        element: null,

        startX: 0,
        startY: 0,

        original: {
            x: 0,
            y: 0
        }
    },

    videoSize;

const defaultVideoSize = {
    width: 640,
    height: 360
};

if(localStorage.videoSize) {
    try {
        videoSize = JSON.parse(localStorage.videoSize);
    } catch(error) {
        console.error(error);
        videoSize = defaultVideoSize;
        localStorage.videoSize = JSON.stringify(defaultVideoSize);
    }
} else {
    videoSize = defaultVideoSize;
    localStorage.videoSize = JSON.stringify(defaultVideoSize);
}

for(var i = 0; i < links.length; i++) { // For each link
    var href = links[i].getAttribute("href"); // Get URL of link.

    // Say hello to the else if stack to end all else if stacks.
    // A switch (or maybe a lovely little object key checking) would be preferred but doesn't offer both the includes() and endsWith() checks that I do.
    if(href && href.includes("youtube.com/watch")) { // This is a YouTube video
        if(href.includes("?v="))
            var vidId  = href.split("?v=")[1].split("&")[0]; // Get the YouTube video ID
        else if(href.includes("&v="))
            var vidId = href.split("&v=")[1].split("&")[0];

        var getParams = href.split(/[?&]/g); // Get the GET params in the URL
        for(var a = 0; a < getParams.length; a++) {
            if(getParams[a].startsWith("t=")) { // This is specifying a start time
                vidId += "?t=" + getParams[a].substr(2); // Add to the media ID
                break;
            }
        }

        embedMedia(vidId, links[i], "youtubeExpand"); // And pass it on to this function
    } else if(href && href.includes("youtu.be/")) { // This is another type of YouTube link.
        let vidId = href.substr(href.lastIndexOf("/") + 1);

        embedMedia(vidId, links[i], "youtubeExpand");
    } else if(href && href.includes("soundcloud.com/")) { // This is a SoundCloud link.
        let scId = href.replace(' ','');

        embedMedia(scId, links[i], "soundcloudExpand");

        /*} else if(href && href.includes("vocaroo.com/i/")) { // This is a Vocaroo link. DROPPED UNTIL VOCAROO SUPPORTS HTTPS.
        var vocId = href.substr(href.indexOf('/i/'));

        embedMedia(vocId, links[i], 'vocarooExpand'); */
    } else if(href && href.endsWith(".gifv")) { // This is an Imgur gifv.
        embedMedia(href, links[i], "gifv");
    } else if(href && (href.endsWith(".mp4") || href.endsWith(".webm") || href.endsWith(".avi") || href.endsWith(".mkv"))) {
        embedMedia(href, links[i], "genericVideo");
    } else if(href && (href.endsWith(".mp3") || href.endsWith(".ogg") || href.endsWith(".wav") || href.endsWith(".wma") || href.endsWith(".oga") || href.endsWith(".opus") || href.endsWith(".m4a") || href.endsWith(".aac"))) {
        embedMedia(href, links[i], "genericAudio");
    }
}

function embedMedia(medId, thisItem, embedType) { // This will create a button next to links.
    let newButton = document.createElement("input");
    newButton.type = "button";
    newButton.class = "embedMedia";
    newButton.id = embedType;
    newButton.value = "Embed";
    newButton.style.marginLeft = newButton.style.marginRight = "5px";
    newButton.setAttribute("medId", medId);
    newButton.setAttribute("expanded", "false");

    thisItem.parentNode.insertBefore(newButton, thisItem.nextSibling);

    newButton.onclick = embedClick;
}

function embedClick() {
    if(this.getAttribute("expanded") === "false") { // It's not expanded.
        var thisId = this.getAttribute("id"),
            newDiv = document.createElement("div");

        switch(thisId) {
            case "youtubeExpand":
                var medId = this.getAttribute("medId"), // Let's get the id of the video including any GET params.
                    pureUrl = medId.split('?')[0].split("#")[0]; // Remove extra info after video ID.

                if(medId.includes("?t=") || medId.includes("&t=") || medId.includes("#t=")) { // This video starts at a specified time.
                    let startTime = medId.replace("?t=","?start=").replace("&t=","&start=").replace("#t=","&start=").split('start=')[1].split('&')[0]; // Used a dorky method of considering both the possibility of ?t, &t and #t, converted, then replaced. Using this to isolate the start time.

                    if(startTime.indexOf('s') !== -1) // We've got an s in our time, which means it's using minute second format instead of just seconds. Let's convert.
                        startTime = convertTime(startTime); // Convert it.

                    pureUrl += "?start=" + startTime; // Add the start time param to the video id.
                }

                newDiv.style.width = videoSize.width + "px";
                newDiv.style.height = videoSize.height + "px";

                newDiv.setAttribute("class", "media-container");

                newDiv.innerHTML = '<iframe width="100%" height="100%" style="position: relative; z-index: 2;" src="//www.youtube.com/embed/' + pureUrl + (pureUrl.includes("?") ? "&" : "?") + 'autoplay=' + (autoplay ? "1" : "0") + '" frameborder="0" allowfullscreen></iframe>';
                this.parentNode.insertBefore(newDiv, this.nextSibling); // Append video.

                makeResizable(newDiv);

                break;

            case "soundcloudExpand":
                newDiv.innerHTML = '<iframe width="100%" height="100%" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=' + this.getAttribute("medId") + '&amp;color=ff5500&amp;auto_play=' + (autoplay ? "true" : "false") + '&amp;hide_related=false&amp;show_artwork=true"></iframe>';
                this.parentNode.insertBefore(newDiv, this.nextSibling);

                break;
                /*case "vocarooExpand":
                    newDiv.innerHTML = '<div style="width: 300px; background-color: #CAFF70; text-align: center; border-radius: 6px; margin-top: 3px; margin-bottom: 3px; padding-top: 5px; padding-bottom: 5px;"><embed src="http://vocaroo.com/mediafoo.swf?playMediaID=' + this.getAttribute("medId") + '&amp;autoplay=1" width="220" height="140" type="application/x-shockwave-flash" pluginspage="http://get.adobe.com/flashplayer/"></div>';
                    this.parentNode.insertBefore(newDiv, this.nextSibling);

                    break;*/

            case "gifv":
                var vidUrl = this.getAttribute("medId").replace("gifv","mp4"); // Imgur's gifv's are just mp4's and thankfully they will allow us to change the extension so our browsers recognize it.

                newDiv.innerHTML = '<video style="" ' + (autoplay ? "autoplay" : "") + ' loop><source src="' + vidUrl + '" type="video/mp4"/></video>';
                this.parentNode.insertBefore(newDiv, this.nextSibling);

                break;

            case "genericVideo":
                newDiv.style.width = videoSize.width + "px";
                newDiv.style.height = videoSize.height + "px";

                newDiv.setAttribute("class", "media-container");

                newDiv.innerHTML = '<video style="background-color: #000;" width="100%" height="100%" ' + (autoplay ? "autoplay" : "") + ' controls><source src="' + this.getAttribute("medId") + '"/></video>';
                this.parentNode.insertBefore(newDiv, this.nextSibling);

                makeResizable(newDiv);

                break;

            case "genericAudio":
                newDiv.innerHTML = '<audio ' + (autoplay ? "autoplay" : "") + ' controls><source src="' + this.getAttribute("medId") + '"/></audio>';
                this.parentNode.insertBefore(newDiv, this.nextSibling);

                break;
        }

        this.setAttribute("value","Remove");
        this.setAttribute("expanded", "true");
    } else { // It's already expanded, let's remove it.
        this.nextSibling.remove();
        this.setAttribute("value","Embed");
        this.setAttribute("expanded", "false");
    }
}

document.body.onselectstart = function(event) { // override onselect so we don't select stuff while resizing the video. only half works with youtube videos cause iframes are a bitch
    if(event.target.constructor.name !== "HTMLDivElement" || event.target.getAttribute) return true; // not our resize div, allow selection

    var className = event.target.getAttribute("class"); // get class of target
    return !(event.target.getAttribute("class") === "video-resize" || event.target.tagName.toLowerCase() === "iframe" || className === "media-container" || className === "media-cover"); // if it's our resize div return false, otherwise allow.
};

function makeResizable(element) {
    element.style.padding = "2px";
    element.style.position = "relative"; // to position the resizer in the bottom left we need to make the position relative

    var resizePoint = document.createElement("div"); // this is what we grab on to.
    resizePoint.setAttribute("class", "video-resize");
    resizePoint.style.position = "absolute";
    resizePoint.style.bottom = "-10px"; // 10px outside the box
    resizePoint.style.right = "-10px";
    resizePoint.style.width = "30px";
    resizePoint.style.height = "30px";
    resizePoint.style.zIndex = "1"; // make it layer below the video
    resizePoint.style.cursor = "nwse-resize"; // diagonal <--> arrow thingy

    var cover = document.createElement("div"); // covers the iframe. a hack to avoid the iframe from stealng the mousemove event.
    cover.setAttribute("class", "media-cover");
    cover.style.display = "none"; // hidden
    cover.style.backgroundColor = "rgba(0,0,0,0.3)"; // might as well make some use of it. dim the video while we resize it, sure.

    cover.style.position = "absolute";
    cover.style.top = "0px";
    cover.style.left = "0px";

    cover.style.width = "100%";
    cover.style.height = "100%";

    cover.style.zIndex = "3"; // above everything

    resizePoint.onmousedown = function(event) { // when clicking down to drag
        if(resize.dragging === true) return; // return if already resizing

        cover.style.display = "block"; // unhide the cover
        element.style.background = "#f00"; // red outline to show that we're resizing

        resize.element = element; // create a reference to our resize element

        resize.startX = event.clientX; //store starting resize positions
        resize.startY = event.clientY;

        resize.original.x = parseInt(resize.element.style.width.slice(0, -2)); // remove "px" from the size
        resize.original.y = parseInt(resize.element.style.height.slice(0, -2));

        resize.dragging = true;

        document.body.style.overflow = "hidden"; // prevents scrolling

        window.onmouseup = function() {
            window.onmouseup = null; // kill the events
            window.onmousemove = null;

            resize.dragging = false;
            cover.style.display = "none"; // hide stuff
            element.style.background = "none";
            document.body.style.overflow = "auto";

            localStorage.videoSize = JSON.stringify(videoSize); // store new video size
        };

        window.onmousemove = function(event) { // when moving whilst resizing
            var x = resize.original.x + (event.clientX - resize.startX), // get position
                y = resize.original.y + (event.clientY - resize.startY);

            if(x < 320 || y < 180) {
                x = 320; // minimum size of 320x180
                y = 180;
            }

            if(x >= y) y = x * 0.5625; // scale to 16:9 aspect ratio
            else x = y * 0.5625;

            videoSize.width = x; // store width & height
            videoSize.height = y;

            resize.element.style.width = x + "px"; // set size
            resize.element.style.height = y + "px";
        };
    };

    element.appendChild(resizePoint); // append elements
    element.appendChild(cover);
}

function convertTime(timeString) { // Credit to Foxscotch/Night Fox for this regex match to convert minute and second time to second format. eg. 2m35s to 155.
    let result = timeString.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/),
        seconds = (result[3] ? parseInt(result[3]) : 0);

    if(result[2]) seconds += parseInt(result[2]) * 60; // Add any minutes.
    if(result[1]) seconds += parseInt(result[1]) * 60 * 60; // Add any hours.

    return seconds || 0;
}

/*
Changelog:
1.0   - Initial release
1.1   - Soundcloud support
2.0   - Remake
2.1   - Vocaroo support
2.2   - Imgur album support
3.0   - Removed jQuery dependancy
3.1   - Starts YouTube videos at a certain time when specified.
3.2   - YouTube start times fix, gifv, mp4, and webm support.
3.2.1 - SSL support.
3.2.2 - SSL support for Imgur embedding.
3.2.3 - Bugfix
3.2.4 - Recognizes #t= as the start time.
3.3   - Audio support, Vocaroo dropped until https, optimizations.
3.3.1 - Bugfix
3.3.2 - Imgur album support dropped. It was broken and it's much nicer using the site anyway.
3.4   - Added the ability to resize videos and added support for more media formats.
*/