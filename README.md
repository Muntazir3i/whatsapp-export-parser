# WhatsApp Export Parser 

A high-performance Node.js ETL pipeline that parses WhatsApp chat export files (`.zip` archives or `.txt` text files) into a structured **SQLite** database.

Designed with clean OOP architecture, streaming line readers, and batched database transactions for maximum ingestion throughput and low memory overhead.

---

## ✨ Features

- 📦 **Dual File Support**: Directly process exported `.zip` archives or raw `.txt` chat files.
- ⚡ **High Throughput Ingestion**: Batched SQLite transactions (`better-sqlite3`) processing 1,000+ messages per transaction.
- 🔄 **Multi-Line Message Accumulation**: Stateful line parser that seamlessly handles multi-line messages, emojis, formatted lists, and colons within chat bodies.
- 📊 **Real-Time CLI Progress Indicators**: Live ASCII progress bars for both ZIP extraction and message ingestion.
- 🏗️ **Clean Modular Architecture**: Decoupled components following Single Responsibility Principle (SRP) and Separation of Concerns (SoC).

---

## 📁 Project Architecture

```
whatsapp-export-parser/
├── src/
│   ├── db/
│   │   ├── database.js      # SQLite connection factory
│   │   └── schema.js        # DDL schema definition & ChatRepository
│   ├── parser/
│   │   ├── reader.js        # Line-by-line file streaming & byte metrics
│   │   ├── messageParser.js # Multi-line message accumulation & date parsing
│   │   └── importer.js      # Stream orchestrator & ConsoleProgressReporter
│   ├── services/
│   │   └── importChat.js    # Interactive file prompt & ZIP extraction service
│   └── index.js             # Application Composition Root
├── package.json
└── README.md
```

---

## 🗄️ Database Schema

The parser creates a local `chats.db` SQLite database with the following relational schema:

### `chats` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | Unique chat session ID |
| `name` | `TEXT NOT NULL` | Contact / Group name parsed from filename |
| `file_name` | `TEXT NOT NULL` | Relative file name of the export |
| `created_at` | `DATETIME DEFAULT CURRENT_TIMESTAMP` | Ingestion timestamp |

### `messages` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | Unique message ID |
| `chat_id` | `INTEGER NOT NULL` | Foreign key referencing `chats(id)` |
| `sender` | `TEXT` | Sender display name or phone number (`NULL` for system events) |
| `message` | `TEXT` | Full message content (supports multi-line text) |
| `timestamp` | `TEXT NOT NULL` | Standardized date & time string (`DD/MM/YY HH:MM`) |
| `type` | `TEXT NOT NULL` | Message category (`text`, `media`, `deleted`, `system`) |

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

Run the main application CLI:

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

---

## 🛠️ Built With

- **[Node.js](https://nodejs.org/)** - JavaScript runtime environment (ES Modules)
- **[better-sqlite3](https://github.com/WiseLibs/better-sqlite3)** - Fast & synchronous SQLite3 library
- **[extract-zip](https://github.com/maxogden/extract-zip)** - Pure JavaScript ZIP extraction library

---

## 🤝 Contributing

Thanks for taking the time to contribute!

### Getting Started

Clone the repository:

```bash
git clone https://github.com/Muntazir3i/whatsapp-export-parser
cd whatsapp-export-parser
npm install
```

### Branches

Please do not commit directly to `main`. Create a feature branch instead:

```bash
git switch -c feature/your-feature
```

**Branch Naming Examples:**
```
feature/zip-parser
feature/media-support
fix/date-parser
docs/readme
```

### Pull Requests

When finished, push your branch and open a Pull Request targeting `main`:

```bash
git push origin feature/your-feature
```

### Code Style Guidelines

- Use **ES Modules** (`import` / `export`)
- Keep functions small and focused
- Maintain **Separation of Concerns**
- Add clear comments/JSDoc where necessary
- Keep commits focused and clean

---

## 📄 License

This project is licensed under the **ISC License**.
