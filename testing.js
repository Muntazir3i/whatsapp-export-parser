import { createDatabaseConnection } from "./src/db/database.js";
import { createSchema } from "./src/db/schema.js";
import { chatRepository } from "./src/db/chatRepository.js";
import { chatServices } from "./src/services/chatService.js";

const db = createDatabaseConnection();

createSchema(db)

const cp = new chatRepository(db)

const cs = new chatServices(cp)


console.log(cs.getChats());
