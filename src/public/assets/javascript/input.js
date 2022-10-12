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
            let person_element = $(element).find("p[name='personName']");
            let status_element = $(element).find('input[name="avaliableCheckbox"]')
            let locked_element = $(element).find('input[name="lockCheckbox"]')

            if (locked_element.is(':checked')) {
                status_element.attr('disabled','disabled')
            }
            else {
                status_element.removeAttr('disabled')
            }

            let data = {
                name: person_element.text(),
                status: status_element.is(':checked'),
                locked: locked_element.is(':checked')
            }
    
            console.log(data)
            status_array.push(data)
        });
        console.log("changed");
        
        /* Push all data through websocket */
        socket.emit("status change", status_array)

    });
});