import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import OpenAI from 'openai';

// Initialize Firebase Admin
admin.initializeApp();

// Define the OpenAI API key secret
const openaiApiKey = defineSecret('OPENAI_API_KEY');

export const processResume = onObjectFinalized(
  { secrets: [openaiApiKey] },
  async (event) => {
    const object = event.data;
    if (!object.name) {
      console.error('No file name provided');
      return;
    }

    // Only process PDF or DOCX files
    if (!object.name.match(/\.(pdf|docx)$/i)) {
      console.log('Not a resume file, skipping');
      return;
    }

    try {
      // Download the file from Storage
      const bucket = admin.storage().bucket(object.bucket);
      const file = bucket.file(object.name);
      const [fileContent] = await file.download();

      // Extract text
      let text: string;
      if (object.name.toLowerCase().endsWith('.pdf')) {
        const pdfData = await pdfParse(fileContent);
        text = pdfData.text;
      } else {
        const result = await mammoth.extractRawText({ buffer: fileContent });
        text = result.value;
      }

      // Use OpenAI to extract structured data
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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

      // Save to Firestore
      const docId = object.name.replace(/[^a-zA-Z0-9]/g, '_');
      await admin.firestore()
        .collection('resumes')
        .doc(docId)
        .set({
          filePath: object.name,
          fileUrl: file.publicUrl(),
          userId: file.metadata?.metadata?.userId,
          chunks: parsedData.chunks,
          tags: parsedData.tags,
          suggestions: parsedData.suggestions,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log('Successfully processed resume:', object.name);
    } catch (error) {
      console.error('Error processing resume:', error);
      throw error;
    }
  }
);
