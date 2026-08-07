/**
 * @file chatService.js
 * @description
 * Provides application-level operations for managing chats and messages.
 *
 * This service coordinates one or more repository operations to implement
 * application features such as retrieving chats, loading conversations,
 * searching messages, and deleting chats. It contains business logic but
 * does not interact directly with the user interface or execute raw SQL.
 */

export class chatServices{

    constructor(chatRepository){
        this.chatRepository = chatRepository;
    }

    getChats(){
        return this.chatRepository.findAllChats()
    }

    getChat(chatId){
        return this.chatRepository.findChatById(chatId)
    }

}