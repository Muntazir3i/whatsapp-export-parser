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

export function isMessageStartLine(lineText) {
  let dateString = lineText.slice(0, 8);
  if (dateString.length === 6) {
    let newDateString = dateString.replace(
      /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/,
      "$2/$1/$3",
    );
    let [day, month, year] = newDateString.split("/");
    let dateObj = new Date(year, month - 1, day);
    console.log(dateObj);
  }

  if (dateString.length === 7) {
    let newDateString = dateString.replace(
      /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/,
      "$2/$1/$3",
    );
    let [day, month, year] = newDateString.split("/");
    let dateObj = new Date(year, month - 1, day);
    console.log(dateObj);
  }

  let [day, month, year] = dateString.split("/");
  let dateObj = new Date(year, month - 1, day);
  console.log(dateObj.toLocaleDateString());

  // console.log(dateObj);
  // return !Number.isNaN(dateObj.getDate());
}

isMessageStartLine("12/05/25");

/**
console.log(dateString);
console.log(dateString.length) ;
  let [day, month, year] = dateString.split("/");
let dateObj = new Date(year, month - 1, day);
 */
