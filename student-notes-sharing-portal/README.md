# CampusNotes — Student Notes Sharing Portal

A full-stack web application where B.Tech students can **upload, search, and download** academic notes in PDF format.

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| UI Icons | Lucide React |
| HTTP Client | Axios |
| Backend | Java 25 · Spring Boot 3.5 |
| ORM | Spring Data JPA / Hibernate |
| Database | MySQL 8 |
| Build Tool | Maven |

---

## Project Structure

```
student-notes-sharing-portal/
├── frontend/                  React + Vite source
│   ├── src/
│   │   ├── components/        Sidebar, TopBar, NoteCard, UploadModal, Toast
│   │   ├── pages/             HomePage, LibraryPage, UploadPage
│   │   ├── services/api.js    Axios calls to backend
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/                   Spring Boot REST API
│   ├── src/main/java/com/campusnotes/
│   │   ├── controller/        NoteController.java
│   │   ├── service/           NoteService.java
│   │   ├── repository/        NoteRepository.java
│   │   ├── model/             Note.java
│   │   ├── dto/               NoteResponse.java, StatsResponse.java
│   │   ├── config/            CorsConfig.java
│   │   └── exception/         GlobalExceptionHandler.java, ResourceNotFoundException.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── database/
│   └── schema.sql             MySQL schema + optional demo data
├── .gitignore
└── README.md
```

---

## Prerequisites — Apple Silicon Mac (M-series)

### 1. Check what you already have

Open Terminal and run:

```bash
java -version      # Need Java 25 (latest LTS)
mvn -version       # Need Maven 3.8+
node -v            # Need Node.js 18+
npm -v             # Comes with Node
mysql --version    # Need MySQL 8
```

### 2. Install missing dependencies

**Homebrew** (macOS package manager):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
# After install, follow the instructions to add brew to your PATH
```

**Java 25 (Temurin)**:
```bash
brew install --cask temurin@25
java -version   # should print openjdk version "25..."
```

**Maven**:
```bash
brew install maven
mvn -version
```

**Node.js** (includes npm):
```bash
brew install node
node -v
```

**MySQL 8**:
```bash
brew install mysql
brew services start mysql
# Set your root password (first time only):
mysql_secure_installation
```

---

## Database Setup

### Step 1 — Start MySQL

```bash
brew services start mysql
# Check it is running:
brew services list | grep mysql
```

### Step 2 — Create the database

```bash
mysql -u root -p
```

Inside the MySQL prompt:
```sql
CREATE DATABASE student_notes_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

SHOW DATABASES;   -- confirm student_notes_db appears
EXIT;
```

### Step 3 — Run the schema

```bash
mysql -u root -p student_notes_db < database/schema.sql
```

---

## Backend Setup

### Step 4 — Configure credentials

Open `backend/src/main/resources/application.properties`.

**Option A — Environment variables (recommended)**

```bash
export DB_USERNAME=root
export DB_PASSWORD=your_actual_password
```

Then start the backend (Step 5). Spring Boot reads `${DB_USERNAME}` and `${DB_PASSWORD}` automatically.

**Option B — Edit the file directly**

Find these two lines and replace the placeholders:

```properties
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:changeme}
```

Change `changeme` to your actual MySQL password:

```properties
spring.datasource.username=root
spring.datasource.password=your_actual_password
```

> ⚠️ Do not commit this file with a real password. Add credentials to `.env` or use environment variables.

### Step 5 — Run the Spring Boot backend

**Terminal window 1:**

```bash
cd student-notes-sharing-portal/backend
mvn spring-boot:run
```

You should see:
```
Started CampusNotesApplication in X.XXX seconds
```

The API is now available at `http://localhost:8080/api/notes`.

Uploaded PDFs are stored in `backend/uploads/` (created automatically on first upload).

---

## Frontend Setup

### Step 6 — Install dependencies

**Terminal window 2:**

```bash
cd student-notes-sharing-portal/frontend
npm install
```

### Step 7 — Start the React dev server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in Xms
  ➜  Local:   http://localhost:5173/
```

### Step 8 — Open in browser

Visit: **http://localhost:5173**

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | All notes |
| GET | `/api/notes?search=keyword` | Search notes |
| GET | `/api/notes?subject=DS` | Filter by subject |
| GET | `/api/notes?semester=3` | Filter by semester |
| GET | `/api/notes/{id}` | Single note |
| POST | `/api/notes` | Upload note (multipart) |
| GET | `/api/notes/{id}/download` | Download PDF |
| DELETE | `/api/notes/{id}` | Delete note |
| GET | `/api/notes/subjects` | Distinct subjects |
| GET | `/api/notes/stats` | Dashboard stats |

---

## Optional — Insert Demo Notes

Uncomment the `INSERT INTO notes...` block inside `database/schema.sql` and run:

```bash
mysql -u root -p student_notes_db < database/schema.sql
```

> Note: the demo notes have no actual PDF files. The download button will return a 404 for demo rows. Upload real PDFs through the UI for a fully working experience.

---

## Troubleshooting

### MySQL authentication error
```
Access denied for user 'root'@'localhost'
```
Fix: Check your credentials in `application.properties` or environment variables.

For MySQL 8, you may need:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

### Java not found
```
zsh: command not found: java
```
Fix:
```bash
brew install --cask temurin@25
# Then add to your shell profile:
export JAVA_HOME=$(/usr/libexec/java_home -v 25)
export PATH=$JAVA_HOME/bin:$PATH
```

### Maven not found
```
zsh: command not found: mvn
```
Fix: `brew install maven`

### Port 8080 already in use
```
Web server failed to start. Port 8080 was already in use.
```
Fix:
```bash
lsof -ti :8080 | xargs kill -9
# Then restart the backend
```

### CORS errors in browser console
Make sure:
1. Spring Boot backend is running (`localhost:8080`)
2. Frontend is running on `localhost:5173` (Vite default)
3. `CorsConfig.java` allows `http://localhost:5173` — it does by default

### Frontend cannot reach backend
1. Is the backend running? Check Terminal 1 for errors.
2. Is MySQL running and connected? Check the backend startup log.
3. Try: `curl http://localhost:8080/api/notes` — should return `[]` or JSON data.

### npm install fails (network issue)
If you are behind a proxy:
```bash
npm config set proxy http://your-proxy:port
npm config set https-proxy http://your-proxy:port
npm install
```

---

## Notes on This Version

- **No authentication** — this is a basic academic demo. All users can upload and delete notes. Adding login/auth is a recommended next step for production.
- **Local file storage** — PDFs are stored in `backend/uploads/`. For production, use AWS S3 or similar.
- **No pagination** — the library loads all notes at once. Add pagination for large datasets.

---

## Built With

- [Spring Boot](https://spring.io/projects/spring-boot)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Lucide React](https://lucide.dev/)
- [Axios](https://axios-http.com/)
- [MySQL](https://www.mysql.com/)
