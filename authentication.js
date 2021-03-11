// Client ID and API key from the Developer Console
var CLIENT_ID =
    "329459155522-0egrb0157q2aipusu1bqrb6h6hqioveh.apps.googleusercontent.com";
var API_KEY = "AIzaSyATllGfLrnnNKDr__hBoYaIaNFUbKvob9A";

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = [
    "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://mail.google.com/";

var authorizeButton = document.getElementById("authorize_button");
var signoutButton = document.getElementById("signout_button");
var container = document.getElementById("container");
var gMail = document.getElementById("gMail");

/**
 *  On load, calledgMail to load the auth2 library and API client library.
 */
function handleClientLoad() {
    gapi.load("client:auth2", initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.client
        .init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES,
        })
        .then(
            function () {
                // Listen for sign-in state changes.
                gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

                // Handle the initial sign-in state.
                updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
                authorizeButton.onclick = handleAuthClick;
                signoutButton.onclick = handleSignoutClick;
            },
            function (error) {
                appendPre(JSON.stringify(error, null, 2));
            }
        );
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = "none";
        signoutButton.style.display = "block";
        displayMails();
    } else {
        authorizeButton.style.display = "block";
        signoutButton.style.display = "none";
        container.style.display = "none";
        gMail.style.display = "none";
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
    var pre = document.getElementById("content");
    var textContent = document.createTextNode(message + "\n");
    // pre.appendChild(textContent);
}

/**
 * Print all Labels in the authorized user's inbox. If no labels
 * are found an appropriate message is printed.
 */
function listLabels() {
    gapi.client.gmail.users.labels
        .list({
            userId: "me",
        })
        .then(function (response) {
            var labels = response.result.labels;
            appendPre("Labels:");

            if (labels && labels.length > 0) {
                for (i = 0; i < labels.length; i++) {
                    var label = labels[i];
                    appendPre(label.name);
                }
            } else {
                appendPre("No Labels found.");
            }
        });
}

function displayMails(label) {
    var tbody = document.getElementById("tbody");
    tbody.innerHTML = "";
    if (!label) {
        // label = "INBOX";
        label = "CATEGORY_PERSONAL";
        container.style.display = "block";
        gMail.style.display = "block";
    }

    if (label == "DRAFT") {
        var request = gapi.client.gmail.users.drafts.list({
            userId: "me",
            maxResults: 10,
        });
    } else {
        var request = gapi.client.gmail.users.messages.list({
            userId: "me",
            labelIds: label,
            maxResults: 10,
        });
    }

    request.execute(function (response) {
        if (label != "DRAFT") {
            response.messages.forEach((element) => {
                var messageRequest = gapi.client.gmail.users.messages.get({
                    userId: "me",
                    id: element.id,
                   // fields:"internalDate"
                });

                if (label == "CATEGORY_PERSONAL")
                    messageRequest.execute(constructMailData);
                else if (label == "SENT") messageRequest.execute(constructSentData);
                // else messageRequest.execute(constructDraftData);
            });
        } else {
            if (response.drafts) {
                response.drafts.forEach((element) => {
                    var messageRequest = gapi.client.gmail.users.drafts.get({
                        userId: "me",
                        id: element.id,
                    });

                    messageRequest.execute(constructDraftData);
                });
            } else {
                constructNoData();
            }
        }
    });
}
function constructMailData(result) {
    var tbody = document.getElementById("tbody");
    var row = `<tr>
  <td>${getHeader(result.payload.headers, "From")}</td>
  <td>${getHeader(result.payload.headers, "Subject")}</td>
  <td>${getHeader(result.payload.headers, "Date")}</td>
</tr>`;
    tbody.innerHTML += row;
}
function constructDraftData(result) {
    var tbody = document.getElementById("tbody");
    tbody.setAttribute("label", result.id);

    var row = `<tr onclick="openDraftMail('${result.message.id}','${result.id}')">
    <td>${getHeader(result.message.payload.headers, "To")}</td>
    <td>${getHeader(result.message.payload.headers, "Subject")}</td>
    <td>${getHeader(result.message.payload.headers, "Date")}</td>
  </tr>`;
    tbody.innerHTML += row;
}

function constructSentData(result) {
    var tbody = document.getElementById("tbody");

    var row = `<tr>
    <td>${getHeader(result.payload.headers, "To")}</td>
    <td>${getHeader(result.payload.headers, "Subject")}</td>
    <td>${getHeader(result.payload.headers, "Date")}</td>
  </tr>`;
    tbody.innerHTML += row;
}

function constructNoData(result) {
    var tbody = document.getElementById("tbody");

    var row = `<tr">
    <td colspan="2"> You don't have any saved drafts.
    Saving a draft allows you to keep a message you aren't ready to send yet.</td>
  </tr>`;
    tbody.innerHTML += row;
}

function getHeader(headers, index) {
    var header = "";

    headers.forEach((item) => {
        if (item.name === index) {
            header = item.value;
            if (index == "Date") {
                header = formatAMPM(new Date(item.value));
            }
        }
    });
    if (header == "" && index == "To") {
        header = "Draft";
    } else if (header == "" && index == "Subject") header = "(no subject)";

    return header;
}

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
}

function closeModal() {
    document.getElementById("composeTo").value = "";
    document.getElementById("composeSub").value = "";
    document.getElementById("composeMsg").value = "";
    $("#composeModal").modal("hide");
}

function sendMail() {
    var composeTo = document.getElementById("composeTo").value;
    var composeSub = document.getElementById("composeSub").value;
    var composeMsg = document.getElementById("composeMsg").value;
    var sendBtn = document.getElementById("sendBtn");
    var deleteId = document.getElementById("composeTo").getAttribute("label");

    sendBtn.setAttribute("class", "disabled");

    sendMessage(
        {
            To: composeTo,
            Subject: composeSub,
        },
        composeMsg,
        deleteId
    );

    return false;
}

function sendMessage(headers, msg, deleteId) {
    var email = "";

    for (var header in headers)
        email += header += ": " + headers[header] + "\r\n";

    email += "\r\n" + msg;
    var basRaw = window.btoa(email).replace(/\+/g, "-").replace(/\//g, "_");

    var request = gapi.client.gmail.users.messages.send({
        userId: "me",
        resource: {
            raw: basRaw,
        },
    });

    return request.execute(function () {
        var sendBtn = document.getElementById("sendBtn");
        $("#composeModal").modal("hide");
        swal("Message sent sucessfully!!!");
        if (deleteId) deleteDraftMsg(deleteId);
        document.getElementById("composeTo").value = "";
        document.getElementById("composeSub").value = "";
        document.getElementById("composeMsg").value = "";
        sendBtn.removeAttribute("class", "disabled");
    });
}

function openDraftMail(draftId, deleteId) {
    return gapi.client.gmail.users.messages
        .get({
            userId: "me",
            id: draftId,
            format: "full",
        })
        .then(
            function (response) {
                var date, to, subject;
                if (
                    response.result &&
                    response.result.payload &&
                    response.result.payload.parts.length
                ) {
                    var msg = Base64.decode(response.result.payload.parts[0].body.data);

                    response.result.payload.headers.forEach((item) => {
                        if (item.name == "Date") date = formatAMPM(new Date(item.value));
                        if (item.name == "To") to = item.value;
                        if (item.name == "Subject") subject = item.value;
                    });
                    if (to)
                        to = to.substring(to.lastIndexOf("<") + 1, to.lastIndexOf(">"));
                    else to = null;

                    displayDraft(date, to, subject, msg, draftId, deleteId);
                } else {
                    alert("something went wrong");
                }
            },
            function (err) {
                console.error("Error!!!!", err);
            }
        )
        .catch((err) => {
            console.log("Error!!!!", err);
        });

    function displayDraft(date, to, subject, msg, draftId, deleteId) {
        var composeTo = document.getElementById("composeTo");
        var composeSub = document.getElementById("composeSub");
        var composeMsg = document.getElementById("composeMsg");
        composeTo.setAttribute("label", deleteId);

        composeTo.value = to;
        composeSub.value = subject;
        composeMsg.value = msg;
        $("#composeModal").modal("show");
    }
}

function deleteDraftMsg(deleteId) {
    return gapi.client.gmail.users.drafts
        .delete({
            userId: "me",
            id: deleteId,
            format: "full",
        })
        .then(
            function (response) {
                console.log(response);
            },
            function (err) {
                console.error("Error!!!!", err);
            }
        )
        .catch((err) => {
            console.log("Error!!!!", err);
        });
}



//and loading needed


