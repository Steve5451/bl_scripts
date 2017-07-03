// ==UserScript==
// @name         That post isn't new!
// @version      1.4.3
// @description  badspot pls fix
// @author       Steve5451
// @namespace    http://thepotato.net/
// @match        https://forum.blockland.us/index.php*
// @updateURL    http://pastebin.com/raw/5v9JW4hi
// @downloadURL  http://pastebin.com/raw/5v9JW4hi
// @grant        none
// @noframes
// ==/UserScript==
/* Known bugs:
Much like any hacky script it's not 100% successful.
 Please PM me if you discover any bugs at https://forum.blockland.us/index.php?action=profile;u=132993   */

const maxLength = 64; // How many posts to store as read. 64 is probably enough but feel free to change it. (about half a kilobyte)

// ================================================= You probably shouldn't edit below this line ======================================================= //

const username = document.getElementsByClassName("logoLink")[0].parentNode.parentNode.parentNode.children[1].children[0].innerHTML || ""; // Get our username from "Hey, NAME, you have..."

if(localStorage.seenMessages === undefined)
    localStorage.seenMessages = "[]";

var seenMessages = JSON.parse(localStorage.seenMessages) || [];

if(window.location.href.startsWith("https://forum.blockland.us/index.php?topic=")) { // We're in a thread
    if(window.location.href.includes("&postTime=")) { // This URL has the postTime specified by my script.
        var postTime = window.location.href.split("&postTime=")[1].split("#")[0]; // Get the post time

        seenMessages.unshift(postTime); // Add to list
        seenMessages = seenMessages.slice(0, maxLength); // Cut list down to the size specified by maxLength so it doesn't become too big

        localStorage.seenMessages = JSON.stringify(seenMessages) || []; // Store list

        window.history.replaceState(null, null, window.location.href.substr(0, window.location.href.indexOf("&postTime=")) || null); // Remove &postTime from our URL, for copying purposes.
    }
} else if(window.location.href.startsWith("https://forum.blockland.us/index.php?board=")) { // Board
    var images = document.querySelectorAll('img[src*="/new.gif"'); // Get all (new) images

    for(i = 0; i < images.length; i++) {
        if(images[i].parentNode.parentNode.parentNode.children[5].children[0].children.length > 2) { // Post from today or yesterday
            var postTime = images[i].parentNode.parentNode.parentNode.children[5].children[0].innerHTML.split(" at ")[1].split("<br>by ")[0].replace(/\D/g,''); // Get the time of the post
        } else { // Post from an older date
            var postTime = images[i].parentNode.parentNode.parentNode.children[5].children[0].innerHTML.split("<br>by ")[0].replace(/\D/g,'');
        }

        if(images[i].parentNode.parentNode.parentNode.children[5].children[0].lastChild.innerHTML === username) { // Is this my post?
            images[i].style.display = "none"; // Hide the (new) button
        } else if(seenMessages.includes(postTime)) { // It wasn't. Perhaps it's on our list?
            images[i].style.display = "none";
        } else { // It has not been seen.
            images[i].parentNode.parentNode.children[0].href += "&postTime=" + postTime; // Modify the url so that it passes its last post date when it's clicked
            images[i].parentNode.href = images[i].parentNode.href.replace("#new","&postTime=" + postTime + "#new");
        }
    }
} else if(window.location.href.startsWith("https://forum.blockland.us/index.php?action=unreadreplies")) { // Unread repies page
    var images = document.querySelectorAll('img[src*="/new.gif"'); // Get all (new) images

    for(i = 0; i < images.length; i++) {
        if(images[i].parentNode.parentNode.parentNode.children[6].children[0].children.length > 2) // Post from today or yesterday
            var postTime = images[i].parentNode.parentNode.parentNode.children[6].children[0].innerHTML.split(" at ")[1].split("<br>by ")[0].replace(/\D/g,'');
        else // Post from an older date
            var postTime = images[i].parentNode.parentNode.parentNode.children[6].children[0].innerHTML.split(",")[2].split("<br>by ")[0].replace(/\D/g,'');

        if(images[i].parentNode.parentNode.parentNode.children[6].children[0].lastChild.innerHTML === username) // Is this my post?
            images[i].parentNode.parentNode.parentNode.style.display = "none"; // Hide the row
        else if(seenMessages.includes(postTime)) // It wasn't. Perhaps it's on our list?
            images[i].parentNode.parentNode.parentNode.style.display = "none";
    }
} else { // We're somewhere else. As far as I know these images only exist on the index and Help. Let's run it.
    var images = document.querySelectorAll('img[src*="/on.gif"'); // This time we're getting all of the lamp images

    for(i = 0; i < images.length; i++) {
        var postUsername = images[i].parentNode.parentNode.children[4].children[0],
            postDate;

        if(postUsername.children.length > 4) { // Post is within two days old.
            postDate = postUsername.innerHTML.split("</b> at ")[1].split(" ")[0].replace(/\D/g,'');
            postUsername = postUsername.children[4].innerHTML;  // Get the username of the last post
        } else { // Post is over two days old.
            postDate = postUsername.innerHTML.split(", ")[2].split("<br>")[0].replace(/\D/g,'');
            postUsername = postUsername.children[3].innerHTML;
        }

        if(postUsername === username) // Do we have the last post on that board?
            images[i].src = "https://forum.blockland.us/Themes/Blockland/images/off.gif"; // Yes, so let's dim the lamp.
        else if(seenMessages.includes(postDate))
            images[i].src = "https://forum.blockland.us/Themes/Blockland/images/off.gif";
    }
}

/* Changelog:

1.0   - Initial release
1.1   - Updated Topics page support
1.2   - Updated Topics page now removes the thread instead of hiding the (new) button. Added support for the Index lamps.
1.3   - Remembers viewed posts to hide all read (new) posts + bugfix.
1.4   - Way more reliable now.
1.4.1 - Updated Topics bug fix and a few lines of debug code removed.
1.4.2 - &postTime removed from URL for copying purposes, increased stored posts, and minor bugfix.
1.4.3 - Fixed bug from last patch.

*/