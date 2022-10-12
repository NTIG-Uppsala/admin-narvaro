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
$(document).ready( () => {
    const socket = io();

    $("div[name='main']").change(() => {
        let status_array = []
        /* Loop through every child of main */
        $("div[name='main']").children().each((index, element) => {
            /* Get values from all people */
            let person = $(element).find("p[name='personName']").text();
            let status = $(element).find('input[name="avaliableCheckbox"]').is(':checked')
            let locked = $(element).find('input[name="lockCheckbox"]').is(':checked')

            let data = {
                name: person,
                status: status,
                locked: locked
            }
    
            console.log(data)
            status_array.push(data)
        });
        console.log("changed");
        
        /* Push all data through websocket */
        socket.emit("status change", status_array)

    });
});