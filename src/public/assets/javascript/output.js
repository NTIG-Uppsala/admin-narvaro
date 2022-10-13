/* When document has loaded in */
$(document).ready(function() {
    const socket = io();
    let newHTML;
    /* On a satus update event from the server, create new element with data */
    socket.on("status update", (dataArray) => {
        /* Set innerhtml of statusDiv */
        console.log("status update", dataArray);
        newHTML = "";
        dataArray.forEach((person) => {
            console.log(person)
            if (person.name.length > 0) {
                newHTML += `
                <div class="message-container" id="message-containerOutput">
                    <p>${person.name}</p>
                    <span style="color:${(person.status == true) ? "#66bb6a" : "red"}">${(person.status == true) ? "Tillgänglig" : "Ej tillgänglig"}</span>
                </div>
            `
            }
            
        })
        $("#statusDiv").html(newHTML);
    })
});