import OpenAI from 'openai';
// import {OPENAI_API_KEY} from '@env';
const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

export const getChatCompletion = async (messages) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000,
        });
        
        return completion.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API 오류:', error);
        throw error;
    }
}; 