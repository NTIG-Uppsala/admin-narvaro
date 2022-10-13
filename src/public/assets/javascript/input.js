/* When document has loaded in */
$(document).ready( () => {
    const socket = io();
    /* listen on updates from other users */
    socket.on("status update", (dataArray) => {
        console.log("Detected remote change", dataArray);

        /* Update checkboxses */
        dataArray.forEach((person) => {
            $("div[name='main']").children().each((index, element) => {

                let person_element = $(element).find("span[name='personName']");
                let status_element = $(element).find('input[name="avaliableCheckbox"]')
                let locked_element = $(element).find('input[name="lockCheckbox"]')

                if (person_element.text() == person.name) {
                    if (person.locked) {
                        status_element.prop('disabled', true)
                        locked_element.prop('checked', true)
                    }
                    else {
                        status_element.prop('disabled', false)
                        locked_element.prop('checked', false)
                    }
        
                    if (person.status) {
                        status_element.prop('checked', true)
                    }
                    else {
                        status_element.prop('checked', false)
                    }
                }
            });
        });

    });

    $("div[name='main']").change(() => {
        let status_array = []
        /* Loop through every child of main */
        $("div[name='main']").children().each((index, element) => {
            /* Get values from all people */
            let person_element = $(element).find("span[name='personName']");
            let status_element = $(element).find('input[name="avaliableCheckbox"]')
            let locked_element = $(element).find('input[name="lockCheckbox"]')

            if (locked_element.is(':checked')) {
                status_element.prop('disabled', true)
            }
            else {
                status_element.prop('disabled', false)
            }

            let data = {
                name: person_element.text(),
                status: status_element.is(':checked'),
                locked: locked_element.is(':checked')
            }
    
            console.log(data)
            status_array.push(data)
        });
        console.log("Detcted local changed");
        
        /* Push all data through websocket */
        socket.emit("status change", status_array)

    });
});