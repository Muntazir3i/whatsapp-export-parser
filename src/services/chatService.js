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

/**
 * Service class for managing application-level chat and message operations.
 */
export class chatServices {

    /**
     * Creates an instance of chatServices.
     *
     * @param {import('../db/chatRepository.js').chatRepository} chatRepository - Repository instance handling database queries for chats.
     */
    constructor(chatRepository) {
        this.chatRepository = chatRepository;
    }

    /**
     * Retrieves a list of all chats along with their latest message details.
     *
     * @returns {Array<Object>} List of all chats containing id, name, lastMessage, and timestamp.
     */
    getChats() {
        return this.chatRepository.findAllChats();
    }

    /**
     * Retrieves details for a specific chat by its ID.
     *
     * @param {number|string} chatId - The unique identifier of the chat.
     * @returns {Object|undefined} Chat object if found, or `undefined` if not found.
     */
    getChat(chatId) {
        return this.chatRepository.findChatById(chatId);
    }

    /**
     * Retrieves the latest messages for a given chat ID.
     *
     * @param {number|string} chat_id - The unique identifier of the chat.
     * @returns {Array<Object>} List of recent message objects for the specified chat.
     */
    getMessages(chat_id) {
        return this.chatRepository.findMessagesByChatId(chat_id);
    }

    /**
     * Deletes a chat and all associated messages by chat ID.
     *
     * @param {number|string} chat_id - The unique identifier of the chat to delete.
     * @returns {{ messages: number, chat: number }} Object detailing the count of deleted message and chat records.
     */
    deleteChat(chat_id) {
        return this.chatRepository.deleteMessageById(chat_id);
    }

}