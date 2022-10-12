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

const socket = io();
const messageDivElement = document.getElementById("messageDiv")

/* On a satus update event from the server, create new element with data */
socket.on("status update", (data) => {
    console.log(data);
    messageDivElement.innerHTML += `
        <div style="display: flex; flex-direction:row; align-items:center; gap: 50px;">
            <p style="font-weight: bold; font-size:25px;">${escapeHTML(data.status_text)}</p>
            <span style="font-size: 15px;">${escapeHTML(data.current_date)}</span>
        </div>
    `
})