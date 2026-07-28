import db from "../db/database.js";




const insertChat = db.prepare(`
    INSERT INTO chats (name, file_name)
    VALUES (@name, @file_name)
    RETURNING *
`);

function fileNameExtractor(location) {
    
    let indexOfWith = location.indexOf("with") + 5; 
    
    let fileName = location.slice(indexOfWith);
    let indexOfDot = fileName.indexOf(".");
    let name = fileName.slice(0, indexOfDot);

    return [fileName, name];
}

function importChat(location) {
    let [fileName, name] = fileNameExtractor(location);
    

    const newRow = insertChat.get({
        name: name,
        file_name: fileName
    });

    console.log("Database Insertion Result:", newRow);
}


importChat("/home/mdot/projectFolder/whatsapp-export-parser/with sample.txt");
