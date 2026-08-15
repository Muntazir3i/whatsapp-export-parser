# WhatsApp Export Parser & Chat Manager 📱

A high-performance Node.js ETL pipeline and interactive CLI manager that parses WhatsApp chat export files (`.zip` archives or `.txt` text files) into a structured **SQLite** database.

Designed with clean OOP architecture, streaming line readers, batched database transactions, and **cursor-based (keyset) pagination** for sub-millisecond query performance.

---

## ✨ Features

- 📦 **Dual File & ZIP Extraction Support**: Directly process exported `.zip` archives or raw `.txt` chat files.
- ⚡ **High Throughput Ingestion**: Batched SQLite transactions (`better-sqlite3`) processing 1,000+ messages per transaction.
- 🚀 **Cursor-Based (Keyset) Pagination**: High-performance $O(\log N)$ message browsing using indexed seek queries (`id < cursor` / `id > cursor`), completely eliminating `OFFSET` performance bottlenecks.
- 🌐 **Robust Multi-Format & Regional Parser**: Fully parses Android & iOS (iPhone) exports, 12-hour AM/PM and 24-hour clocks, international date delimiters (`/`, `.`, `-`), and invisible Unicode control character sanitization (`\u200e`, `\u202f`, `\ufeff`).
- 🔄 **Multi-Line Message Accumulation**: Stateful line parser that seamlessly handles multi-line messages, emojis, formatted lists, and colons within chat bodies.
- 📊 **Real-Time CLI Progress Indicators**: Live ASCII progress bars for both ZIP extraction and message ingestion.
- 🏗️ **Clean Modular Architecture**: Decoupled components following Single Responsibility Principle (SRP) and Separation of Concerns (SoC).

---

## 📁 Project Architecture

```
whatsapp-export-parser/
├── src/
│   ├── cli/
│   │   └── cliApp.js        # Interactive CLI menu & paginated conversation browser
│   ├── db/
│   │   ├── chatRepository.js# Keyset paginated query repository
│   │   ├── database.js      # SQLite connection factory
│   │   └── schema.js        # DDL schema definition, indexes & ChatRepository
│   ├── parser/
│   │   ├── reader.js        # Line-by-line file streaming & byte metrics
│   │   ├── messageParser.js # Robust multi-format parsing & Unicode sanitization
│   │   └── importer.js      # Stream orchestrator & ConsoleProgressReporter
│   ├── services/
│   │   ├── chatService.js   # Application business logic layer
│   │   └── importChat.js    # Interactive file prompt & ZIP extraction service
│   └── index.js             # Application Composition Root
├── package.json
└── README.md
```

---

## 🗄️ Database Schema & Indexes

The parser creates a local `chats.db` SQLite database with the following relational schema and composite B-Tree indexes:

### `chats` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | Unique chat session ID |
| `name` | `TEXT NOT NULL` | Contact / Group name parsed from filename or folder |
| `file_name` | `TEXT` | Relative file name of the export |
| `imported_at` | `DATETIME DEFAULT CURRENT_TIMESTAMP` | Ingestion timestamp |

### `messages` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | Unique message ID |
| `chat_id` | `INTEGER NOT NULL` | Foreign key referencing `chats(id)` (`ON DELETE CASCADE`) |
| `sender` | `TEXT` | Sender display name or phone number (`NULL` for system events) |
| `message` | `TEXT` | Full message content (supports multi-line text) |
| `timestamp` | `TEXT NOT NULL` | Date & time string (`DD/MM/YY HH:MM` or `M/D/YY H:MM AM/PM`) |
| `type` | `TEXT NOT NULL` | Message category (`text`, `media`, `deleted`, `system`) |

### ⚡ Indexes
- `idx_messages_chat_id_id ON messages (chat_id, id DESC)`: Enables $O(\log N)$ cursor-based seek pagination.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18.0.0 or higher
- `npm` package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Muntazir3i/whatsapp-export-parser.git
   cd whatsapp-export-parser
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## 💻 Usage

Run the interactive application CLI:

```bash
npm start
```

Interactive menu options:

```text
==========================================
 📱 WhatsApp Export Parser & Chat Manager 
==========================================

Menu Options:
 [1] 📥 Import New Chat (.zip or .txt)
 [2] 📋 View All Chats
 [3] 💬 View Messages for a Chat (by ID)
 [4] 🗑️  Delete a Chat (by ID)
 [5] 🚪 Exit
------------------------------------------
Select an option (1-5): 
```

### 💬 Interactive Keyset Message Viewer

When viewing messages (Option 3), navigate chat history using cursor controls:
- `[n]` **Next Page**: Load older messages ($O(\log N)$ B-Tree index seek).
- `[p]` **Previous Page**: Load newer messages.
- `[e]` **Exit**: Return to main menu.

---

## 🛠️ Built With

- **[Node.js](https://nodejs.org/)** - JavaScript runtime environment (ES Modules)
- **[better-sqlite3](https://github.com/WiseLibs/better-sqlite3)** - Fast & synchronous SQLite3 library
- **[extract-zip](https://github.com/maxogden/extract-zip)** - Pure JavaScript ZIP extraction library

---

## 🤝 Contributing

1. Create a feature branch:
   ```bash
   git switch -c feature/your-feature
   ```
2. Commit your changes and open a Pull Request targeting `main`.

---

## 📄 License

This project is licensed under the **ISC License**.
