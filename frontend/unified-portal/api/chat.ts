import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Check for Internal Secret to prevent unauthorized API consumption
        const clientSecret = request.headers['x-internal-secret'] as string;
        const serverSecret = process.env.INTERNAL_API_SECRET as string;

        if (serverSecret && clientSecret !== serverSecret) {
            return response.status(401).json({ error: 'Unauthorized: Invalid internal secret' });
        }

        const { messages, context = {} } = request.body;

        if (!messages) {
            return response.status(400).json({ error: 'Missing messages field' });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error("GROQ_API_KEY is not set in the environment.");
            return response.status(500).json({ error: 'Server configuration error' });
        }

        const hasMedicineContext = context.medicineName && context.medicineName !== '';

        let systemPrompt: string;

        if (context.userRole === 'regulator') {
            systemPrompt = `You are an expert pharmaceutical regulatory AI assistant embedded in PharmaVerify, a blockchain-based drug authentication platform.
Your role is to assist government regulators in monitoring the pharmaceutical supply chain recorded on the Cardano blockchain.

${hasMedicineContext ? `Active Context:
- Medicine / Batch Under Review: ${context.medicineName}
- Batch Number: ${context.batchNumber || 'N/A'}` : 'No specific medicine is selected — you are providing system-level oversight.'}

Guidelines:
- Provide concise, data-driven, risk-focused analysis.
- Flag counterfeit risk signals, recall patterns, and supply chain anomalies when asked.
- You may also answer general regulatory, pharmacovigilance, or drug policy questions freely.
- Do NOT restrict yourself only to the context above — answer any relevant question the user asks.`;

        } else if (hasMedicineContext) {
            systemPrompt = `You are an expert pharmaceutical AI assistant embedded in PharmaVerify, a blockchain-based medicine verification platform.
A user has just verified or is reviewing a specific medicine. Use the context below to give targeted, relevant answers.

Medicine Context:
- Name: ${context.medicineName}
- Active Ingredient: ${context.activeIngredient || 'Unknown'}
- Dosage: ${context.dosage || 'Unknown'}
- Batch Number: ${context.batchNumber || 'N/A'}
- Verification Status: ${context.status || 'Unknown'}

Guidelines:
- Prioritise the context above when answering questions about this medicine.
- However, if the user asks a general question (e.g. about drug interactions, side effects of other medicines, general pharma knowledge, or anything unrelated to this specific medicine), answer it freely and helpfully.
- Do NOT refuse or deflect general questions just because they don't match the medicine context.
- Be concise, professional, and educational. Do not provide personalised medical diagnoses.`;

        } else {
            systemPrompt = `You are an expert pharmaceutical AI assistant embedded in PharmaVerify, a blockchain-based medicine verification platform.
No specific medicine is currently selected, so you are operating as a general pharmaceutical knowledge assistant.

You can help with:
- Drug information, uses, side effects, and interactions
- Pharmaceutical storage and handling
- Medicine verification and authentication
- Drug safety and pharmacovigilance
- Blockchain-based supply chain concepts
- Any other general medical or pharmaceutical questions

Guidelines:
- Answer all questions freely and helpfully.
- Be concise, professional, and educational.
- Do not provide personalised medical diagnoses or replace a doctor's advice.
- If a question is completely unrelated to health, medicine, or pharma, politely redirect.`;
        }

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'system', content: systemPrompt }, ...messages],
                temperature: 0.5,
                max_tokens: 1024
            })
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Groq API error:", res.status, errorText);
            throw new Error(`Groq API returned status ${res.status}`);
        }

        const data = await res.json();
        const aiMessage = data.choices[0].message.content;

        return response.status(200).json({
            success: true,
            message: aiMessage
        });

    } catch (error) {
        console.error("AI Assistant error:", error);
        return response.status(500).json({ success: false, error: String(error) });
    }
}
