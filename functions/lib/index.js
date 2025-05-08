"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processResume = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth = __importStar(require("mammoth"));
const openai_1 = __importDefault(require("openai"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables in development
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}
admin.initializeApp();
const openai = new openai_1.default({
    apiKey: process.env.NODE_ENV === 'production'
        ? functions.config().openai.key
        : process.env.OPENAI_API_KEY,
});
exports.processResume = functions.storage
    .object()
    .onFinalize(async (object) => {
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
        let text;
        if (object.name.toLowerCase().endsWith('.pdf')) {
            const pdfData = await (0, pdf_parse_1.default)(fileContent);
            text = pdfData.text;
        }
        else {
            // DOCX file
            const result = await mammoth.extractRawText({ buffer: fileContent });
            text = result.value;
        }
        // Use OpenAI to extract structured data
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
        const resumeData = {
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
    }
    catch (error) {
        console.error('Error processing resume:', error);
        throw error;
    }
});
//# sourceMappingURL=index.js.map