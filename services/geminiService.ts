import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash-image-preview';

const getCreativePrompt = (timeInterval: string): string => {
    // A direct instruction to ensure the model returns an image.
    const instruction = " The final output must be only the generated image, without any descriptive text.";

    switch (timeInterval) {
        case 'one second':
            return `Analyze this image and creatively generate an image of the scene one second in the future. Introduce a subtle but dynamic change—a shift in expression, a slight movement, or a change in lighting that suggests the story is moving forward.${instruction}`;
        case 'one hour':
            return `Analyze this image and creatively generate an image of the scene one hour in the future. The sun has moved, casting new light and long shadows. The atmosphere has shifted. If there are people, they should be in a different pose or engaged in a new activity, reflecting the passing hour. The scene should feel transformed.${instruction}`;
        case 'one day':
            return `Analyze this image and creatively generate an image of the scene 24 hours later. The weather is completely different. Signs of the previous day's activities might be present but altered. If there are people, they should be wearing different clothes and be in a new pose. Introduce an unexpected element that tells a story about what happened during the last 24 hours.${instruction}`;
        case 'one year':
            return `Analyze this image and creatively generate an image of the scene a full year in the future. The season is different. Show the dramatic effects of time: plants have grown or withered, structures may show wear. If there are people, show the passage of a year on them: they might appear slightly older, have a different hairstyle, facial hair, or fashion style. They should be wearing season-appropriate clothing and be in a new pose that tells a story. The overall transformation should be significant.${instruction}`;
        default:
            return `Generate an image showing this scene ${timeInterval} in the future.${instruction}`;
    }
};


export async function generateFutureImage(base64ImageData: string, mimeType: string, timeInterval: string): Promise<string> {
    try {
        const prompt = getCreativePrompt(timeInterval);

        const imagePart = {
            inlineData: {
                data: base64ImageData,
                mimeType: mimeType,
            },
        };

        const textPart = {
            text: prompt,
        };

        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [imagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        // The response from this model can have multiple parts. Find the image part.
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                return part.inlineData.data;
            }
        }

        // If no image part is found, the model might have only returned text.
        // We log the text for debugging but throw a more user-friendly error.
        const returnedText = response.text?.trim();
        console.warn("Gemini API returned text instead of an image:", returnedText);
        throw new Error("The AI failed to generate an image and returned a text description instead. Please try again.");

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            // Avoid adding "Gemini API Error:" prefix to our custom, user-friendly error.
            if (error.message.startsWith("The AI failed to generate an image")) {
                throw error;
            }
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unexpected error occurred while communicating with the Gemini API.");
    }
}