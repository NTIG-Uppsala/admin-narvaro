/* When document has loaded in */
$(document).ready(function() {
    const socket = io();
    let newHTML;
    /* On a satus update event from the server, create new element with data */
    socket.on("status update", (dataArray) => {
        /* Set innerhtml of statusDiv */
        console.log("Detected change of status", dataArray);
        newHTML = "";
        let id = 0;
        dataArray.forEach((person) => {
            id++;
            console.log(person)
            if (person.name.length > 0) {
                newHTML += `
                <div class="message-container ${(id%2==0) ? 'gray-color': ''}" id="message-containerOutput">
                    <div class="name status-flex">

                        <span>${person.name }</span>
                        <span class="role subheading">${ person.role }</span>
                    </div>
                    <div class="status status-flex">
                        <span style="color: ${(person.status == true) ? '#66bb6a' : 'red'} ">${(person.status == true) ? "Tillgänglig" : "Ej tillgänglig"}</span>
                        <span class="latest-update subheading">Senast uppdaterad: ${person.latest_change_from_now}</span>
                  </div>  
                </div>
            `
            }
            
        })
        $("#statusDiv").html(newHTML);
    })
});