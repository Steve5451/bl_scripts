// ==UserScript==
// @name        Blockland Blocker
// @version     3.4
// @description Block users and topics.
// @author      Steve5451
// @namespace   http://thepotato.net/
// @updateURL   http://pastebin.com/raw.php?i=NKgd5gC6
// @downloadURL http://pastebin.com/raw.php?i=NKgd5gC6
// @include     https://forum.blockland.us*
// @grant       none
// @noframes
// ==/UserScript==
// Known bugs:
// 1. The block button on profiles raises their name slightly.

//--------- Variables that aren't in your settings ------------\\

var defaultBlockLevel = "1101"; // In order: Block posts, quotes, topics, and whether to show the reveal button or not. One means true zero means false.
var blockedText = '-garbage-';
var revealText = 'Show garbage'; // The text on the button to show the post / blocked topic.
var hideText = 'Hide garbage'; // The text on the button to hide the revealed post / blocked topic.

var removeIconURL = 'http://i.imgur.com/txG3bgo.png'; // Icon to be used as the button used to block topics.

// -------- You should probably leave the below alone ---------\\

var ver = "3.4";

if(localStorage.blockedUsers3 === undefined) {
    localStorage.blockedUsers3 = "[]";
}

if(localStorage.blockedPerm === undefined) {
    localStorage.blockedPerm = "[]";
}

if(localStorage.blockedTopics3 === undefined) {
    localStorage.blockedTopics3 = "[]";
}

if(localStorage.introShown === undefined) {
    localStorage.introShown = "true"; // The user hasn't been introduced to the new script, whether it be the new version or that they're a new user.
    showIntro(); // Show the intro.
}

function showIntro() {
    var intro = document.createElement("div"); // Create intro element. This is also the darkened background.
    intro.setAttribute("id","introBG"); // Give it an ID for styling purposes.
    var introD = document.createElement("div"); // This will be the dialog we see.
    introD.setAttribute("id","introD");
    introD.innerHTML = '<div style="font-size: 16pt;">Welcome to the Blockland Blocker script version ' + ver + '.</div><br/>This script allows you to block any user or topic you want. To change your settings just click your profile and click Blocker Settings on the left.<br/> To block a user just open their profile and click "Block" on the top right corner of their profile. Alternatively you can do this through the settings by clicking Add and entering their name into the dialog box.<br/>In Blocker Settings you can unblock a user or topic by simply pressing \'remove\'. You can also unblock a user by going to their profile and clicking Unblock on the top right corner of their profile.<br/>In the settings a blocked user will have three checkboxes. The first one allows you to decide whethe to block their posts, second quotes, third topics, and fourth whether to show the reveal post button.<br/>If you have any questions then feel free to <a href="https://forum.blockland.us/index.php?action=pm;sa=send;u=132993">send me a PM</a>.<br/><br/><input type="button" id="dismissInfo" value="Gotcha"/>';
    document.body.appendChild(intro); // Append them.
    intro.appendChild(introD);

    document.getElementById("dismissInfo").onclick = function() {
        intro.remove(); // They clicked the dismiss button, let's remove the dialog.
    };
}

var styleBlock = document.createElement("style"); // Create a stylesheet for some of our new elements.
styleBlock.setAttribute("type","text/css");
styleBlock.innerHTML = ".garbagePost { overflow: hidden; height: 0px; } .garbageLink { color: #005177; cursor: pointer; } .toggleTopicButtons { cursor: pointer; } .removeTopicButton, .removeUserButton { color: #005177; cursor: pointer; } #introBG { background-color: rgba(0,0,0,0.5); z-index: 100; width: 100%; height: 100%; position: fixed; top: 0px; left: 0px; } #introD { margin: 0 auto; margin-top: 100px; background-color: #fff; padding: 10px; max-width: 600px; color: #333; font-size: 11pt;} .topicBlockButton { cursor: pointer; float: right; } .blockerSettingsUser { border-bottom: 1px solid #6394bd; }";
document.head.appendChild(styleBlock);

var blockedUsers = JSON.parse(localStorage.blockedUsers3); // Get an array of blocked users from browser's localStorage.
var blockedPerm = JSON.parse(localStorage.blockedPerm); // Array of permissions for blocked users.

// There's a bug where blocking someone doesn't always apply block settings and messes everything up. I couldn't find a cause for it so here's a solution.
if(blockedUsers.length > blockedPerm.length) {
    for(var i = 0; i < blockedUsers.length; ++i) {
        if(blockedPerm[i] === undefined) { // Aha, this index wasn't created. Let's fix that.
            blockedPerm[i] = defaultBlockLevel; // Apply is the default block level
            localStorage.blockedPerm = JSON.stringify(blockedPerm); // Store
        }
    }
}

function createTopicButtons() { // Called when you click the + or - button ton you expand the topic block buttons.
    if(topicButtonsDisplayed === false) { // Buttons aren't being displayed.
        for(var i = 0; i < topicButtons.length; ++i) {
            topicButtons[i].style.width = "auto"; // Make them visible
            topicButtons[i].style.visibility = "visible"; // ^
        }
        toggleTopicButton.innerHTML = "-"; // Change button to show that they're expanded and that this will now hide them again.

        topicButtonsDisplayed = true; // Mark as displayed
    } else if(topicButtonsDisplayed === true) { // Not displayed.
        for(var t = 0; t < topicButtons.length; ++t) {
            topicButtons[t].style.visibility = "hidden"; // Hide it
            topicButtons[t].style.width = "0px"; // ^
        }
        toggleTopicButton.innerHTML = "+"; // Show that it is closed and can be expanded again.

        topicButtonsDisplayed = false; // Mark as hidden.
    }
}

function removeTopics() { // This is the function to find and remove blocked topics.
    var blockedTopics = JSON.parse(localStorage.blockedTopics3); // Get an array of blocked topics from localStorage.
    var blockedUsers = JSON.parse(localStorage.blockedUsers3); // Get an array of blocked topics from localStorage.
    var toBeRemoved = []; // Create an array for topics to be removed.
    var topicTables = document.getElementsByClassName("windowbg"); // Get an array of elements with the windowbg class.
    for(var i = 0; i < topicTables.length; ++i) {
        if(topicTables[i].getAttribute("width") == "42%") { // The topic tables have a width of 42%, we'll use that to determine if we're looking at a topic.
            if(blockedTopics.indexOf(topicTables[i].children[0].getAttribute("href").split("&")[0]) !== -1) { // This topic is on the block list.
                toBeRemoved.push(topicTables[i].parentNode); // Add to list of blocked topics
            }
        }
    }
    for(i = 0; i < toBeRemoved.length; ++i) {
        toBeRemoved[i].remove(); // Remove blocked topic.
    }

    topicTables = document.getElementsByClassName("windowbg2");

    toBeRemoved = []; // Reset block array.
    for(i = 0; i < topicTables.length; ++i) {
        if(topicTables[i].getAttribute("width") === "14%") { // Author row has a width of 14%, let's use that to detect the row.
            var userIndex = blockedUsers.indexOf(topicTables[i].children[0].innerHTML);
            if(userIndex !== -1) {
                var permTopics = blockedPerm[userIndex].charAt(2);
                var permButton = blockedPerm[userIndex].charAt(3);
                if(permTopics == "1") {
                    if(permButton == "1") {
                        topicTables[i].parentNode.children[1].children[0].style.visibility = "hidden";

                        if(topicTables[i].parentNode.children[1].children[1])
                            topicTables[i].parentNode.children[1].children[1].style.visibility = "hidden";

                        var showText = document.createElement("a");
                        showText.setAttribute("class", "garbageLink");
                        showText.innerHTML = revealText;

                        topicTables[i].parentNode.children[1].prepend(showText);

                        showText.onclick = function() {
                            showText.style.display = "none";

                            for(var t = 0; t < showText.parentNode.children.length; ++t) {
                                showText.parentNode.children[t].style.visibility = "visible";
                            }
                        };

                        topicTables[i].parentNode.children[1];
                        //topicTables[i].parentNode.children[1].innerHTML = '<a expanded="false" class="showGarbage garbageLink">' + revealText + '</a><div class="garbagePost">' + topicTables[i].parentNode.children[1].innerHTML + '</div>'; // Wrap the topic in our Show Garbage link.
                    } else {
                        toBeRemoved.push(topicTables[i].parentNode); // We don't need no button, let's just remove it.
                    }
                }
            }
        }
    }

    if(toBeRemoved.length > 0) {
        for(i = 0; i < toBeRemoved.length; ++i) {
            toBeRemoved[i].remove(); // Remove the filthy topics.
        }
    }

}

function removeButtonAction() { // Called when the - button to remove a topic is pressed.
    var topicURL = this.parentNode.parentNode.children[1].children[0].getAttribute("href").split("&")[0]; // Get URL of topic
    var curBlockedTopics = JSON.parse(localStorage.blockedTopics3); // Get array of currently blocked topics
    curBlockedTopics.push(topicURL); // Add to array ^
    localStorage.blockedTopics3 = JSON.stringify(curBlockedTopics); // And store it localStorage as an array again.
    removeTopics(); // Remove blocked topics because we just blocked a new one.
}

function removeFromList() { // Callled when you remove a blocked topic or user.
    if(this.getAttribute("fromList") === "topic") { // Are we removing a user from the list or a topic?
        var blockedTopics = JSON.parse(localStorage.blockedTopics3); // Get blocked topics.
        var topic = this.nextSibling.nextSibling.getAttribute("href"); // Get url of blocked topic.
        var topicIndex = blockedTopics.indexOf(topic); // Get index of the topic we're removing from the list.
        if(topicIndex === -1) {
            alert("That topic is not on your list of blocked topics. Something may have gone wrong, consider resetting.");
        } else {
            blockedTopics.splice(topicIndex,1); // Remove it from the array of blocked topics.
            localStorage.blockedTopics3 = JSON.stringify(blockedTopics); // Save it
            this.parentNode.remove(); // Remove the div so the user knows it's been removed.
        }
    } else { // User
        var blockedUsers = JSON.parse(localStorage.blockedUsers3);
        var blockedPerm = JSON.parse(localStorage.blockedPerm);
        var user = this.getAttribute("user");
        var userIndex = blockedUsers.indexOf(user);
        if(userIndex === -1) {
            alert("That name is not on your list of blocked users. Something may have gone wrong, consider resetting.");
        } else {
            blockedUsers.splice(userIndex,1);
            blockedPerm.splice(userIndex,1);
            blockedPerm.length = blockedUsers.length;
            localStorage.blockedUsers3 = JSON.stringify(blockedUsers);
            localStorage.blockedPerm = JSON.stringify(blockedPerm);
            this.parentNode.remove();
        }
    }
}

var toRemove = [];

if(window.location.href.indexOf("?topic=") !== -1) { //We're viewing a topic
    var posts = document.getElementsByClassName("post"); // Get an array of posts.

    for(var i = 0; i < posts.length; ++i) { // Check every post for the blocked user.
        var user = posts[i].parentNode.parentNode.children[0].children[0].children[0].innerHTML; // Gets the username

        var userIndex = blockedUsers.indexOf(user); // Get index, if any, of the blocked user.
        if(userIndex !== -1) { // Is this user blocked?
            var permPosts = blockedPerm[userIndex].charAt(0); // Are we blocking their quotes?
            var permButton = blockedPerm[userIndex].charAt(3); // Are we blocking their quotes?
            if(permPosts == "1") {
                if(permButton == "1") { // Are we displaying a block button?

                    var hideButton = createHidePostButton();
                    makeHidePostButton(hideButton);

                    posts[i].parentNode.insertBefore(hideButton, posts[i]);
                    posts[i].style.display = "none";
                } else {
                    toRemove.push(posts[i].parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode); // Let's add this to the list of removed posts. If we do it here then we'll just end up with scrambled indexes.
                }
            }
        }
    }

    for(var i = 0; i < toRemove.length; ++i) {
        toRemove[i].remove();
    }

    // Rearrange the windowbg's so that everything is seamless.
    var curPosts = document.getElementsByClassName("post"); // Get all the posts
    for(var i = 0; i < curPosts.length; ++i) {
        if(i % 2 === 0 || i === 0) { // The index is even, which means this is /supposed/ to be a windowbg, odds are windowbg2.
            var windowBg = curPosts[i].parentNode.parentNode.parentNode.parentNode.parentNode; // Get the windowbg parent
            if(windowBg.getAttribute("class") === "windowbg2") // Is it a windowbg2? It's not supposed to be.
                windowBg.setAttribute("class","windowbg"); // Change that to a windowbg.
        } else { // It's an odd index
            var windowBg = curPosts[i].parentNode.parentNode.parentNode.parentNode.parentNode;
            if(windowBg.getAttribute("class") === "windowbg")
                windowBg.setAttribute("class","windowbg2");
        }
    }
}

if(window.location.href.includes("?topic=") || window.location.href.includes("?action=post2")) { // This will work on both the post screen and a topic.
    var quotes = document.getElementsByClassName("quote"); // Get an array of quotes.

    for(var i = 0; i < quotes.length; ++i) {
        var user = quotes[i].previousSibling.firstChild;

        if(user.innerHTML !== undefined) {
            user = user.innerHTML.split("Quote from: ")[1].split(" on ")[0]; // Gets the author of a quote.
            var userIndex = blockedUsers.indexOf(user); // Get index, if any, of the blocked user.
            if(userIndex !== -1) { // Is this user blocked?
                var permQuotes = blockedPerm[userIndex].charAt(1); // Are we blocking their quotes?
                var permButton = blockedPerm[userIndex].charAt(3); // Should we show a button for this user?
                if(permQuotes == "1") {
                    if(permButton == "1") {
                        var quoteHolder = document.createElement("div");
                        quoteHolder.style.display = "none";
                        quotes[i].appendChild(quoteHolder);

                        while(quotes[i].childNodes.length - 1 > 0) {
                            quoteHolder.appendChild(quotes[i].childNodes[0]);
                        }

                        var hideButton = createHidePostButton();
                        makeHidePostButton(hideButton);

                        quotes[i].prepend(hideButton);
                    } else {
                        quotes[i].innerHTML = blockedText;
                    }
                }
            }
        }
    }
}

if(window.location.href.indexOf("?action=post2") !== -1) { // We're replying to a topic.
    var posts = document.getElementsByClassName("post"); // Get an array of posts.

    for(var i = 0; i < posts.length; ++i) { // Check every post for the blocked user.
        var user = posts[i].parentNode.parentNode.previousSibling.previousSibling.children[0].innerHTML.split('\n									Posted by: ')[1];
        if(user !== undefined) { // The preview post you make will be included aswell so this will omit that.
            user = user.split('\n								')[0];
        }

        var userIndex = blockedUsers.indexOf(user); // Get index, if any, of the blocked user.
        if(userIndex !== -1) { // Is this user blocked?
            var permPosts = blockedPerm[userIndex].charAt(0); // Are we blocking their quotes?
            var permButton = blockedPerm[userIndex].charAt(3); // Should we show a button for this user?
            if(permPosts == "1") {
                if(permButton == "1") {
                    posts[i].style.display = "none";

                    var hideButton = createHidePostButton();
                    makeHidePostButton(hideButton);

                    posts[i].parentNode.insertBefore(hideButton, posts[i]);
                } else {
                    posts[i].parentNode.parentNode.previousSibling.previousSibling.hidden = true; // Since we don't have to care about the order of the indexes on this page we'll simply hide them.
                    posts[i].parentNode.parentNode.previousSibling.hidden = true;
                    posts[i].parentNode.parentNode.hidden = true;
                }
            }
        }
    }
} else if(window.location.href.indexOf("?board=") !== -1) { // We're looking at a board
    // for the topic removal buttons
    var topicButtonsDisplayed = false;
    var topicButtons = [];

    var topicLeft = document.getElementsByClassName("windowbg2"); // A list of potential leftmost topic tables.
    for(var i = 0; i < topicLeft.length; ++i) {
        if(topicLeft[i].getAttribute("width") === "5%" && topicLeft[i].getAttribute("align") === "center") { // This is a correct table
            var newButton = document.createElement("img"); // Create the topic remover button
            newButton.src = removeIconURL; // Give it the image we defined at the top.
            newButton.setAttribute("class", "topicBlockButton");
            newButton.style.visibility = "hidden"; // It shouldn't be shown yet.
            newButton.style.width = "0px"; // ^
            newButton.onclick = removeButtonAction; // Run a function when it's clicked.
            topicButtons.push(newButton); // Add it to our array of buttons so they can be easily accessed later on.
            topicLeft[i].appendChild(newButton); // Append it.
        }
    }

    var toggleTopicButton = document.createElement("a"); // Create the + button to expand topic block buttons.
    toggleTopicButton.setAttribute("class", "toggleTopicButtons"); // Set appropriate class
    toggleTopicButton.innerHTML = "+"; // Make it a +
    toggleTopicButton.onclick = createTopicButtons; // When clicked run the createTopicButtons function.
    document.getElementsByClassName("titlebg")[0].children[0].appendChild(toggleTopicButton); // Place it.

    removeTopics();

    var links = document.body.getElementsByTagName("a");

    for(var l = 0; l < links.length; ++l) {
        if(!links[l].href) continue;

        var link = links[l].href.substr(0, links[l].href.lastIndexOf(".")) + ".0";

        if(blockedUsers.includes(links[l].innerHTML)) {
            links[l].innerHTML = "Blocked user";
        }
    }
} else if(window.location.href == "https://forum.blockland.us/index.php?action=profile" || window.location.href.indexOf("?action=profile;sa=blockprefs") !== -1) { // We're on the profile page, so let's add our own little link for the blocker page settings in Modify Profile.
    var pageLinks = document.getElementsByTagName("a"); // Get a list of elements with the catbg class.

    for(var i = 0; i < pageLinks.length; ++i) {
        if(pageLinks[i].getAttribute("href").indexOf(";sa=account") !== -1) { // We'll use this Account Related Settings link to find what box to place our link in.
            var newLink = document.createElement("a"); // Create link
            newLink.innerHTML = "Blocker Settings";
            newLink.setAttribute("href","https://forum.blockland.us/index.php?action=profile;sa=blockprefs");
            pageLinks[i].parentNode.appendChild(newLink); // Append it. There's an extra <br/> at the end so it's extra low, but I like it this way. It'll be easier to find too.
            break;
        }
    }
} else if(window.location.href.match(/^(.*\?action=profile;u=[0-9]{1,})$/)) { // We're on someone else's profile.
    var user = document.getElementsByClassName("titlebg")[0].children[0]; // Get their name.

    var filtered = user.innerHTML.replace(/	/g,''); // SMF adds tabs, spaces, and new lines to this (????????) so let's just filter those out.
    filtered = filtered.replace(/\n/g,'');

    if(blockedUsers.indexOf(filtered) !== -1) { // Are they blocked?
        user.innerHTML += ' <span class="smalltext">(blocked)</span><span style="float:right;"><input type="button" username="' + filtered + '" class="profileBlock" value="Unblock"/></span>'; // Yes, so let's show that they're blocked and add an unblock button.
    } else {
        user.innerHTML += '<span style="float:right;"><input type="button" username="' + filtered + '" class="profileBlock" value="Block"/></span>'; // Nope, let's add a block button.
    }

    var blockButtons = document.getElementsByClassName("profileBlock"); // Our earlier placed block and unblock buttons.
    for(var i = 0; i < blockButtons.length; ++i) {
        blockButtons[i].onclick = function() {
            if(this.value === "Block") { // Are we blocking?
                blockedUsers = JSON.parse(localStorage.blockedUsers3);
                blockedUsers.push(this.getAttribute("username")); // Add to block list.
                blockedPerm.push(defaultBlockLevel); // Add their block permissions to list.
                localStorage.blockedPerm = JSON.stringify(blockedPerm); // Store
                localStorage.blockedUsers3 = JSON.stringify(blockedUsers); // Store
                alert("User blocked.");
                location.reload(); // Reload page so that the user doesn't don't keep mashing the block button.
            } else if(this.value === "Unblock") { // We're unblocking.
                blockedUsers = JSON.parse(localStorage.blockedUsers3);

                var userIndex = blockedUsers.indexOf(this.getAttribute("username")); // Get array if blocked users.
                if(userIndex !== -1) {
                    blockedUsers.splice(userIndex, 1); // Remove from array.
                    localStorage.blockedUsers3 = JSON.stringify(blockedUsers); // Save array.
                    alert("User unblocked"); // Tell user.
                    location.reload(); // Reload.
                } else {
                    alert("User isn't on your block list. Something may have gone wrong, consider resetting.");
                }
            } else {
                alert("Something is terribly wrong, tell Steve."); // help!
            }
        };
    }
} else { // chances are that we're on the board index.
    var blockedTopics = JSON.parse(localStorage.blockedTopics3);
    var links = document.body.getElementsByTagName("a");

    for(var l = 0; l < links.length; ++l) {
        if(!links[l].href) continue;

        var link = links[l].href.substr(0, links[l].href.lastIndexOf(".")) + ".0";

        if(blockedTopics.includes(link)) {
            links[l].innerHTML = "Blocked topic";
        } else if(blockedUsers.includes(links[l].innerHTML)) {
            if(!window.location.href.includes("?topic="))
                links[l].innerHTML = "Blocked user";
        }
    }
}

if(window.location.href.indexOf("?action=profile;sa=blockprefs") !== -1) { // Luckily SMF won't correct for ;sa=blockprefs so we can use this to commandeer the profile page as our own settings page. :D
    document.title = "Blocker Settings"; // Set the title of the page. This will really seal the deal.

    document.getElementsByClassName("titlebg")[0].children[0].innerHTML = "Blocker Settings"; // Change the title from your username to something more appropriate.

    var boldElem = document.getElementsByTagName("b"); // I'll be using the Name: collum to get the parent for the block we're going to use as our settings page. Not the most efficient solution, but it's all we've got.
    for(var i = 0; i < boldElem.length; ++i) {
        if(boldElem[i].innerHTML === "Name: ") {
            boldElem[i].parentNode.parentNode.parentNode.innerHTML = '<div id="blockerDiv"><b>Blocked Users:</b><div id="blockedUsersDiv"><input type="button" id="manuallyAddUser" value="Add" /><br/><br/></div><br/><b>Blocked Topics:</b><div id="blockedTopicsDiv"><br/></div><br/><input type="button" id="blockReset" value="Reset" style="float: right;"/>';

            var blockerDiv = document.getElementById("blockerDiv");

            var blockedUsersDiv = document.getElementById("blockedUsersDiv");
            var blockedTopicsDiv = document.getElementById("blockedTopicsDiv");

            var blockedTopics = JSON.parse(localStorage.blockedTopics3);
            var blockedUsers = JSON.parse(localStorage.blockedUsers3);

            for(var a = 0; a < blockedUsers.length; ++a) { // For each blocked user
                var newDiv = document.createElement("div"); // Create a new div
                newDiv.setAttribute("class","blockerSettingsUser"); // Give it the blockSettingsUser class
                newDiv.setAttribute("userindex",a);
                newDiv.style.paddingTop = "3px"; // Give it padding
                newDiv.style.paddingBottom = "3px";
                newDiv.innerHTML = '<a fromList="user" user="' + blockedUsers[a] + '" class="removeUserButton">remove</a> | ' + blockedUsers[a] + '<span class="smalltext" style="float: right;">[<input type="checkbox" perm="0" userindex="' + a + '" class="permissionBox"/>Posts] [<input type="checkbox" perm="1" userindex="' + a + '" class="permissionBox"/>Quotes] [<input type="checkbox" perm="2" userindex="' + a + '" class="permissionBox"/>Topics] [<input type="checkbox" perm="3" userindex="' + a + '" class="permissionBox"/>Button]</span>'; // Add list of blocked users and the option to remove them from the list.
                blockedUsersDiv.appendChild(newDiv); // ^insert the information and < Add it in.
            }

            for(var a = 0; a < blockedTopics.length; ++a) { // For each blocked topic
                var newDiv = document.createElement("div"); // Create a new div
                newDiv.innerHTML = '<a fromList="topic" class="removeTopicButton">remove</a> | <a href="' + blockedTopics[a] + '" target="_blank">' + blockedTopics[a] + '</a>'; // Add a link element with information
                blockedTopicsDiv.appendChild(newDiv); // Add it in.
            }

            var removeTopicButtons = document.getElementsByClassName("removeTopicButton");
            for(var a = 0; a < removeTopicButtons.length; ++a) {
                removeTopicButtons[a].onclick = removeFromList; // Forward to our removeFromList function.
            }

            var removeUserButtons = document.getElementsByClassName("removeUserButton");
            for(var a = 0; a < removeUserButtons.length; ++a) {
                removeUserButtons[a].onclick = removeFromList; // Forward to our removeFromList function.
            }

            var checkboxes = document.getElementsByClassName("permissionBox");
            for(var a = 0; a < checkboxes.length; ++a) {
                var userIndex = checkboxes[a].getAttribute("userindex");

                if(checkboxes[a].getAttribute("perm") == "0" && blockedPerm[userIndex].charAt(0) == "1") { // Posts
                    checkboxes[a].checked = true;
                }
                if(checkboxes[a].getAttribute("perm") == "1" && blockedPerm[userIndex].charAt(1) == "1") { // Quotes
                    checkboxes[a].checked = true;
                }
                if(checkboxes[a].getAttribute("perm") == "2" && blockedPerm[userIndex].charAt(2) == "1") { // Topics
                    checkboxes[a].checked = true;
                }
                if(checkboxes[a].getAttribute("perm") == "3" && blockedPerm[userIndex].charAt(3) == "1") { // Show button
                    checkboxes[a].checked = true;
                }

                checkboxes[a].onclick = function() { // This is a really bad way to do it, but this is the most reliable solution I've found for taking the information from all permission checkboxes and assembling them into our "1101" type string.
                    var blockList = document.getElementsByClassName("blockerSettingsUser");

                    for(var b = 0; b < blockList.length; ++b) {
                        blockedPerm = JSON.parse(localStorage.blockedPerm);
                        var thisCheckboxes = blockList[b].getElementsByClassName("permissionBox");
                        var userIndex = blockList[b].getAttribute("userindex");
                        var perm = this.getAttribute("perm");
                        var newVar = "";

                        for(var c = 0; c < 4; ++c)
                            newVar += +thisCheckboxes[c].checked;

                        blockedPerm[userIndex] = newVar; // Apply our new variable containing permissions to our array.
                        localStorage.blockedPerm = JSON.stringify(blockedPerm); // Save it
                        newVar = "";
                    }
                };
            }

            document.getElementById("manuallyAddUser").onclick = function() {
                var userToBlock = prompt("Enter the exact name of the user you wish to block. Be mindful of spaces at the beginning or end.");
                if(userToBlock !== "" && userToBlock !== null && userToBlock !== undefined) {
                    blockedUsers = JSON.parse(localStorage.blockedUsers3);
                    blockedUsers.push(userToBlock);
                    blockedPerm.push(defaultBlockLevel);
                    localStorage.blockedUsers3 = JSON.stringify(blockedUsers);
                    localStorage.blockedPerm = JSON.stringify(blockedPerm);
                    location.reload();
                }
            };

            break;
        }
    }

    // Remove some profile blocks so our settings page makes sense.
    var titles = document.getElementsByClassName("titlebg");
    for(var i = 0; i < titles.length; ++i) {
        if(titles[i].children[0].innerHTML === "Additional Information:") {
            titles[i].remove(); // Remove this at the bottom.
            break;
        }
    }

    var links = document.getElementsByTagName("a");
    for(var i = 0; i < links.length; ++i) {
        if(links[i].innerHTML === "Show the last posts of this person.") {
            links[i].parentNode.parentNode.remove(); // This too.
            break;
        }
    }

    document.getElementById("blockReset").onclick = function() {
        var c = confirm("This will reset all settings to default including your blocked users and topics. Press OK to continue.");
        if(c === true) {
            localStorage.removeItem("blockedUsers3"); // Reset akk used localStorage variables.
            localStorage.removeItem("blockedPerm");
            localStorage.removeItem("blockedTopics");
            location.reload();
        }
    };
}

function createHidePostButton() {
    var hideButton = document.createElement("input");
    hideButton.type = "button";
    hideButton.value = revealText;
    hideButton.setAttribute("class", "showGarbage");
    hideButton.setAttribute("expanded", "false");

    return hideButton;
}

function makeHidePostButton(button) {
    button.onclick = function() {
        if(this.getAttribute("expanded") == "false" || this.getAttribute("expanded") === undefined) {
            this.nextSibling.style.display = "block"; // Expand post

            this.setAttribute("expanded","true"); // Mark this button as expanded
            this.setAttribute("value", hideText); // Apply text
        } else {
            this.setAttribute("value", revealText);
            this.setAttribute("expanded", "false");
            this.nextSibling.style.display = "none";
        }
    };
}

/*
	Changelog:
	1.0   - Initial release
	2.0   - Script rewritten, now a total user blocker.
	2.0.1 - Firefox hotfix
	2.1   - Quote blocking
	2.1.1 - Small typo fix, nothing special.
	2.2   - Topic blocking
	2.3   - Show or hide the topic remover buttons.
	2.3.1 - Bug and typo fix.
	2.3.2 - Shows that a user is blocked on their profile.
	2.3.3 - Blocks posts on the post screen.
	3.0   - Completely rewritten from scratch without jQuery dependancy. New features like blocking from profile and pretty new settings page with more settings.
	3.1   - Added per-user block settings. Fixed a bug that would lock up your browser as a result of blocking topics.
	3.1.1 - Small bug and typo fix.
	3.1.2 - Bug fix
	3.1.3 - Fixed a huge bug involving the individual settings for a blocked user being mis-matched.
	3.1.4 - Fixed a bug involving authorless quotes and block levels not being set when a user is blocked.
	3.2   - Windowbg's (blue and white colors on posts) are re-arranged for a more seamless experience when the button isn't shown.
	3.2.1 - Fixed a pretty big bug that would fail to block a post if a post above it was blocked.
	3.2.3 - SSL support
    3.2.4 - Small fix
    3.2.5 - Patch for "My post isn't new!"
    3.3   - Bugfixes, optimizations, and blocked users & topics are masked from the forum index.
    3.3.1 - Fixed bug related to user's profiles.
    3.3.2 - Blockers users are now masked in the board index.
    3.3.3 - Fixed a bug where quotes weren't blocked.
    3.4   - Reworked blocking mechanic to be more compatible with other userscripts.
*/