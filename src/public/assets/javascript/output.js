/* XSS prevention */
// https://stackoverflow.com/questions/30661497/xss-prevention-and-innerhtml
function escapeHTML(unsafe_str) {
    return unsafe_str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/\'/g, '&#39;')
        .replace(/\//g, '&#x2F;')
}

/* When document has loaded in */
$(document).ready(function() {
    const socket = io();
    /* On a satus update event from the server, create new element with data */
    socket.on("status update", (dataArray) => {
        /* Set innerhtml of statusDiv */
        console.log("status update", dataArray);
        let newHTML = "";
        dataArray.forEach((person) => {
            newHTML += `
                <div class="message-container">
                    <p>${person.name}</p>
                    <span>${(person.status == true) ? "tillgänglig" : "ej tillgänglig"}</span>
                </div>
            `
        })
        $("#statusDiv").html(newHTML);
    })
});