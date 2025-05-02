# Resumeganizer

Resumeganizer is a clean, simple dashboard to help job seekers organize and track their resumes. Upload, label, and track which resume you used for which job application.

## Features

- Organize resumes by categories (e.g., Software Developer, Product Manager)
- Upload and store multiple versions of your resume
- Track application status for each resume
- Add notes and details about where each resume was used
- Simple and intuitive interface

## Tech Stack

- Frontend: Next.js with TypeScript and Tailwind CSS
- Backend: Firebase (Storage and Firestore)
- Hosting: Vercel
- Authentication: Coming soon

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Firebase project and enable Storage and Firestore
4. Create a `.env.local` file in the root directory with your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
app/
  ├── components/     # React components
  ├── lib/           # Utility functions and Firebase setup
  ├── types/         # TypeScript type definitions
  └── page.tsx       # Main application page
```

## Contributing

Feel free to open issues and pull requests for any improvements you'd like to add.

## License

MIT
