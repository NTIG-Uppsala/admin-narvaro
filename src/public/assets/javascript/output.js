/* When document has loaded in */
$(document).ready(function() {
    const socket = io();
    let newHTML;
    /* On a satus update event from the server, create new element with data */
    socket.on("status update", (dataArray) => {
        /* Set innerhtml of statusDiv */
        console.log("status update", dataArray);
        newHTML = "";
        let id = 0;
        dataArray.forEach((person) => {
            id++;
            console.log(person)
            if (person.name.length > 0) {
                newHTML += `
                <div class="message-container ${(id%2==0) ? 'gray-color': ''}" id="message-containerOutput">
                    <div class="name">
                        <span>${person.name }</span>
                        <span class="role">${ person.role }</span>
                    </div>
                    <div class="status">
                        <span style="color: ${(person.status == true) ? '#66bb6a' : 'red'} ">${(person.status == true) ? "Tillgänglig" : "Ej tillgänglig"}</span>
                        <span class="latest-update">${person.latest_change}</span>
                  </div>  
                </div>
            `
            }
            
        })
        $("#statusDiv").html(newHTML);
    })
});