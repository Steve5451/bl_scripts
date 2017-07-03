// ==UserScript==
// @name         Revalidate Avatars
// @version      1.0.1
// @description  Revalidate avatars to see immediate changes.
// @author       Steve5451
// @namespace    http://thepotato.net/
// @include      https://forum.blockland.us/*
// @updateURL    http://pastebin.com/raw/5ya37Eai
// @downloadURL  http://pastebin.com/raw/5ya37Eai
// @grant        none
// @noframes
// ==/UserScript==

const avatars = document.getElementsByClassName("avatar"); // Get all avatars on the page

for(var i = 0; i < avatars.length; ++i) { // For every avatar
    const src = avatars[i].src; // Get image url

    if(!src || !src.startsWith("https://forum.blockland.us")) continue; // Skip altered or blank avatars

    let xml = new XMLHttpRequest(); // Open new http request
    xml.open("HEAD", src, true); // We only need the header, no need to fetch the whole image
    xml.setRequestHeader("Cache-Control", "max-age=0"); // Set image to expire so it's revalidated
    xml.send();
}

/* Changelog:

1.0   - Initial release
1.0.1 - Compatibility patch

*/