# DocChat AI

A modern web application that enables users to upload PDF documents and have intelligent conversations about their content using the Google Gemini AI. Built with React, TypeScript, and Supabase for a seamless document-based RAG (Retrieval-Augmented Generation) experience.

## Features

- **PDF Upload & Parsing**: Upload PDF documents with automatic text extraction powered by PDF.js
- **Document Management**: View, select, and delete your uploaded documents
- **AI-Powered Chat**: Ask questions about your documents and get answers from Google Gemini
- **Markdown Support**: AI responses are rendered with full Markdown formatting (bold, italics, code blocks, lists, links, etc.)
- **User Authentication**: Secure login and registration with Supabase Auth
- **Chat History**: Conversations are saved per document session
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technologies Used

### Frontend
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality React components
- **React Router** - Client-side routing
- **React Markdown** - Markdown rendering with GitHub Flavored Markdown support
- **PDF.js** - PDF document parsing and text extraction
- **React Hook Form** - Efficient form handling
- **TanStack React Query** - Data synchronization and caching

### Backend & Database
- **Supabase** - PostgreSQL database and authentication
- **Supabase Edge Functions** - Serverless functions for AI integration
- **Google Gemini API** - AI model for document Q&A

### UI & Design
- **Radix UI** - Headless component primitives
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **Date-fns** - Date utilities

## Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthForm.tsx           # Login/Registration form
│   │   ├── ui/                        # shadcn UI components
│   │   ├── ChatInterface.tsx          # Chat window with Markdown rendering
│   │   └── DocumentSidebar.tsx        # Document list and upload
│   ├── pages/
│   │   ├── Index.tsx                  # Main routing page
│   │   ├── Dashboard.tsx              # Main application dashboard
│   │   └── NotFound.tsx               # 404 page
│   ├── hooks/
│   │   ├── use-toast.ts               # Toast notification hook
│   │   └── use-mobile.tsx             # Mobile detection hook
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts              # Supabase client configuration
│   │       └── types.ts               # TypeScript types from Supabase
│   ├── lib/
│   │   └── utils.ts                   # Utility functions
│   ├── App.tsx                        # Main app wrapper
│   ├── main.tsx                       # Entry point
│   ├── index.css                      # Global styles
│   └── vite-env.d.ts                  # Vite environment types
├── supabase/
│   ├── functions/
│   │   └── chat-with-document/        # Edge function for AI chat
│   │       └── index.ts
│   ├── migrations/
│   │   └── *.sql                      # Database schema migrations
│   └── config.toml                    # Supabase local config
├── public/
│   ├── pdf.worker.min.mjs             # PDF.js worker (for parsing)
│   └── ...                            # Static assets
├── vite.config.ts                     # Vite configuration
├── tailwind.config.ts                 # Tailwind CSS configuration
├── tsconfig.json                      # TypeScript configuration
├── package.json                       # Dependencies
└── README.md                          # This file
```

## Database Schema

The application uses three main tables:

### documents
Stores uploaded PDF documents and their extracted text content.
- `id` - UUID primary key
- `user_id` - Reference to authenticated user
- `title` - Document filename
- `content` - Extracted text from PDF
- `file_type` - MIME type
- `file_size` - File size in bytes
- `created_at`, `updated_at` - Timestamps

### chat_sessions
Manages conversation sessions per document.
- `id` - UUID primary key
- `user_id` - Reference to authenticated user
- `document_id` - Reference to document
- `created_at`, `updated_at` - Timestamps

### chat_messages
Stores individual chat messages in a session.
- `id` - UUID primary key
- `session_id` - Reference to chat session
- `role` - "user" or "assistant"
- `content` - Message content
- `created_at` - Message timestamp

All tables use Row Level Security (RLS) to ensure users can only access their own data.

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn/bun
- Supabase account and project
- Google Gemini API key

### Environment Setup

1. **Clone the repository** (if applicable) or ensure you have all project files

2. **Create a `.env` file** in the project root with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

3. **Set up Supabase Edge Function secret** (for AI integration):
   The `LOVABLE_API_KEY` environment variable should be set in your Supabase project for the Edge Function to access the Gemini API. This is configured via the Supabase dashboard.

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Verify database migrations**:
   ```bash
   supabase db status  # If using Supabase CLI locally
   ```

### Running Locally

1. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

2. **Build for production**:
   ```bash
   npm run build
   ```

3. **Preview production build**:
   ```bash
   npm run preview
   ```

4. **Run linting**:
   ```bash
   npm lint
   ```

## Usage

1. **Sign Up**: Create a new account with email and password
2. **Upload Document**: Click "Upload Document" and select a PDF file
3. **Ask Questions**: Select a document and ask questions about its content
4. **View Responses**: AI responses are formatted with Markdown support including code blocks, lists, and links
5. **Manage Documents**: Delete documents you no longer need from the sidebar

## API Integration

### Edge Function: chat-with-document
Located at `supabase/functions/chat-with-document/`, this function:
- Accepts user messages and document content
- Sends requests to Google Gemini API
- Returns formatted AI responses
- Handles errors and rate limiting gracefully

## Security

- All database access is protected with Row Level Security (RLS)
- User authentication is handled by Supabase Auth
- API keys are kept secure in environment variables and Edge Function secrets
- Users can only access their own documents and chat history

## Troubleshooting

### PDF Upload Fails
- Ensure the PDF is not corrupted
- Check that the file is under reasonable size limits
- Verify the PDF.js worker file is being served correctly

### Chat Not Working
- Verify your Supabase credentials in `.env`
- Check that the Edge Function is deployed
- Ensure the Gemini API key is configured in Supabase

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist`
- Ensure you're using a compatible Node.js version (16+)

## License

This project is open source and available under the MIT License.
