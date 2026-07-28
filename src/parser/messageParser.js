let buildingMsg = ""

function checkDate(txt) {
    let dateString = txt.slice(0, 10);
    let [day, month, year] = dateString.split("/");
    let dateObj = new Date(year, month - 1, day);
    return !Number.isNaN(dateObj.getDate())
}

export function msgParser(text) {
    let validDate = checkDate(text)
    if (validDate) {

        // If we're already building a message,
        // it's now complete.
        if (buildingMsg !== "") {
            console.log(buildingMsg);
        }

        // Start the new message
        buildingMsg = text;

    } else {

        // Continuation line
        buildingMsg += `\\n${text}`;

    }

}
