import { onObjectFinalized } from 'firebase-functions/v2/storage';
import * as admin from 'firebase-admin';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { defineSecret } from 'firebase-functions/params';

// Load environment variables in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

admin.initializeApp();

const openaiApiKey = defineSecret('OPENAI_API_KEY');

export const processResume = onObjectFinalized(
  { secrets: [openaiApiKey] },
  async (event) => {
    const object = event.data;
    if (!object.name) {
      console.error('No file name provided');
      return;
    }

    // Check if file is a resume (PDF or DOCX)
    if (!object.name.match(/\.(pdf|docx)$/i)) {
      console.log('Not a resume file, skipping');
      return;
    }

    try {
      // Get the file from Storage
      const bucket = admin.storage().bucket();
      const file = bucket.file(object.name);
      const [fileContent] = await file.download();

      // Extract text based on file type
      let text: string;
      if (object.name.toLowerCase().endsWith('.pdf')) {
        const pdfData = await pdfParse(fileContent);
        text = pdfData.text;
      } else {
        // DOCX file
        const result = await mammoth.extractRawText({ buffer: fileContent });
        text = result.value;
      }

      // Use OpenAI to extract structured data
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a resume parser. Extract work experience, skills, and summary from the resume text. Also identify 5-10 relevant skill tags. Format the response as JSON with the following structure: { workExperience: string[], skills: string[], summary: string, tags: string[] }"
          },
          {
            role: "user",
            content: text
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      const parsedData = JSON.parse(content);

      // Create the resume document
      const resumeData: ResumeData = {
        filePath: object.name,
        chunks: {
          workExperience: parsedData.workExperience,
          skills: parsedData.skills,
          summary: parsedData.summary
        },
        tags: parsedData.tags
      };

      // Save to Firestore
      await admin.firestore()
        .collection('resumes')
        .doc(object.name.replace(/[^a-zA-Z0-9]/g, '_'))
        .set(resumeData);

      console.log('Successfully processed resume:', object.name);
    } catch (error) {
      console.error('Error processing resume:', error);
      throw error;
    }
  }
);

interface ResumeData {
  filePath: string;
  chunks: {
    workExperience: string[];
    skills: string[];
    summary: string;
  };
  tags: string[];
} 