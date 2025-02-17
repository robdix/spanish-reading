## Project Instructions: Spanish Learning App

### Overview
This project is a Spanish learning web app built using Next.js, leveraging AI-powered features to help users improve their language skills. It includes a reading tracker, a story generator, and a transcript uploader, all integrated with Supabase for authentication and data storage.

---

### Tech Stack

| Layer | Technology |
|------------|--------------|
| **Frontend** | Next.js (React) |
| **Backend** | Next.js API Routes |
| **Database & Auth** | Supabase (PostgreSQL + Auth) |
| **AI Processing** | Anthropic API (Claude) |
| **Hosting** | Vercel (Next.js-native) |
| **Styling** | Tailwind CSS (optional) |

---

### Core Features

#### 1. Reading Tracker
- Tracks how many words a user has read.
- Supports daily targets and streak tracking.
- Updates automatically when a user marks a story as read.

#### 2. Story Generator
- Generates short stories based on user-defined parameters.
- Allows users to hover over words for AI-generated definitions.
- Users can mark words to add to a flashcard deck for later review.

#### 3. Transcript Uploader
- Users upload podcast or video transcripts.
- AI extracts words the user might not know.
- Users can add these words to flashcards.

---

### Architecture and Implementation

#### Frontend (Next.js)
- Pages and API routes managed via Next.js.
- Uses React hooks for state management (avoiding additional libraries unless needed).
- Components structured for reusability and performance.
- Minimal dependencies to keep the app lightweight.

#### Backend (API Routes in Next.js)
- Handles requests to the Anthropic API for story generation and word definitions.
- Manages database interactions (user data, flashcards, transcript storage) via Supabase.
- Implements authentication through Supabase's built-in auth system.

#### Database (Supabase)
- Stores user accounts and authentication data.
- Tracks user progress (read stories, flashcards, streaks).
- Saves user-uploaded transcripts as raw text.
- Maintains word lists for vocabulary tracking.

#### AI Integration (Anthropic API)
- Generates short stories with structured learning elements.
- Extracts unknown words from transcripts dynamically.
- Provides word definitions and explanations on hover.

#### Hosting & Deployment (Vercel)
- Frontend and API routes deployed on Vercel.
- Database managed through Supabase.
- CI/CD pipeline configured via Vercel's auto-deployment from GitHub.

---

### Development Guidelines

- **Code Simplicity:** Keep everything as lean as possible, minimising dependencies.
- **Modularity:** Separate concerns into clear components and API endpoints.
- **Performance:** Optimize database queries, caching where necessary.
- **Scalability:** Ensure that the core architecture allows for easy addition of future features.
- **Security:** Use Supabase's authentication for user data security.

---

# Modules

## 1. Reading Tracker

## 2. Story Generator

### User Selections

#### 1. Content Type (User Chooses One)
- **Wikipedia-style article** (Factual, encyclopedia-like)
- **News-style report** (Structured, slightly conversational)
- **Dialogue** (Casual, conversation-based)
- **Traditional short story** (Fiction, narrative-based)

#### 2. Topic Selection
- Users can optionally select a topic (e.g., history, travel, daily life).

#### 3. Length Selection (Flexible)
- **Short (100-200 words)**
- **Medium (200-400 words)**
- **Long (400-600 words)**
- **Very Long (600-1000 words)**
- Exact length is flexible due to LLM limitations.

#### 4. Difficulty Level
- User selects their level (A1, A2, B1, B2, C1).
- Level is passed directly to Claude without specific constraints
- Claude handles appropriate vocabulary and grammar selection

---

### Generation Process
1. User submits preferences → Request sent to **Anthropic API**.
2. API returns generated text matching the selected difficulty level and category.
3. The frontend **counts words client-side** before displaying the text.
4. Stories are stored in Supabase only after being marked as read

---

### Reading & Interaction

#### 1. Tracking Progress
- Word count updates as the user reads.
- **Words are logged only when the user marks the story as read.**
- Once read, the full text and metadata are stored in Supabase under the user's account
- Word counting uses simple space-separation (no special handling for contractions)

#### 2. Word Definitions
- **Double-click** on a word to highlight it.
- Definition appears in a sidebar.
- Sidebar includes:
  - **Example sentence using the word.**
  - **Option to save the word to a personal dictionary.**
- Definitions show both Spanish and English translations
- No caching of definitions (fresh API call for each lookup)

#### 3. Future Flashcard Export
- Saved words are stored in a dictionary.
- Users can later manually export words to a flashcard system.

### 3. Transcript Uploader

## Future Features

### Story Bank
- Store generated stories in database for reuse
- Match existing stories to user's selected parameters (difficulty, length, type)
- Only show stories the user hasn't read yet
- Allow users to rate stories (1-5 stars)
- Use ratings to:
  - Surface popular stories more often
  - Identify high-quality content for each difficulty level
  - Help improve prompt engineering
- Track metrics per story:
  - Number of times read
  - Average rating
  - Completion rate
  - Most looked-up words
- Could enable features like:
  - "Story of the day" for each difficulty level
  - Curated collections of well-rated stories
  - Community recommendations
  - Story difficulty validation based on user feedback

