// export function parseMessageText(rawMessageText) {
//     const [timestampStr, rest] = rawMessageText.split(" - ");
//     if(rest.includes(": ")){
//         const [sender, ...msgParts] = rest.split(": ");
//     const messageContent = msgParts.join(": ");
//     const [dateStr, timeStr] = timestampStr.split(", ");

//     return {
//         sender: sender,
//         message: messageContent,
//         timestamp: `${dateStr} ${timeStr}`,
//     };
//     }else{
//         const [messageContent] = rest.split()
//         const [dateStr, timeStr] = timestampStr.split(", ");
//                return {
//           sender: null,
//           message: messageContent,
//           timestamp: `${dateStr} ${timeStr}`,
//     }
//     }
// }

// let result = parseMessageText("20/07/26, 10:25 AM - Sara joined using this group's invite link")
// console.log(result)
//

// export function isMessageStartLine(lineText) {
//   let dateString = lineText.slice(0, 8);
//   // if (dateString.length === 6) {
//   //   let newDateString = dateString.replace(
//   //     /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/,
//   //     "$2/$1/$3",
//   //   );
//   //   let [day, month, year] = newDateString.split("/");
//   //   let dateObj = new Date(year, month - 1, day);
//   //   console.log(dateObj);
//   // }

//   // if (dateString.length === 7) {
//   //   let newDateString = dateString.replace(
//   //     /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/,
//   //     "$2/$1/$3",
//   //   );
//   //   let [day, month, year] = newDateString.split("/");
//   //   let dateObj = new Date(year, month - 1, day);
//   //   console.log(dateObj);
//   // }

//   let [day, month, year] = dateString.split("/");
//   // let fullYear = "20"+year;
//   let dateObj = new Date(year, month - 1, day);
//   console.log(!Number.isNaN(dateObj.getDate()));
//   // return !Number.isNaN(dateObj.getDate());
// }

// isMessageStartLine("2/3/20");

export function parseMessageText(rawMessageText) {
    const [timestampStr, rest] = rawMessageText.split(" - ");
    const [sender, ...msgParts] = rest.split(": ");
    const messageContent = msgParts.join(": ");
    const [dateStr, timeStr] = timestampStr.split(", ");

    return {
        sender: sender,
        message: messageContent,
        timestamp: `${dateStr} ${timeStr}`,
    };
}

// let obj = parseMessageText("10/5/20, 11:27 PM - Mir Aatif: <Media omitted>")
// console.log(obj);

export function isMessageStartLine(lineText) {
    const [timestampStr, rest] = lineText.split(" - ");
    console.log(timestampStr);
    // let [day, month, year] = dateString.split("/");
    // let fullYear = "20"+year;
    // let dateObj = new Date(fullYear, month - 1, day);
    // return !Number.isNaN(dateObj.getDate());
}

let result = isMessageStartLine("10/5/20, 11:27 PM - Mir Aatif: <Media omitted>")
console.log(result);

