import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system-notify';
    content: string;
    isContextMarker?: boolean; // used to inject a context-change note into the Groq payload
}

interface ChatContext {
    medicineName?: string;
    activeIngredient?: string;
    dosage?: string;
    batchNumber?: string;
    status?: string;
    userRole?: string;
}

interface ChatWidgetProps {
    contextData?: ChatContext;
    title?: string;
}

function buildSystemPrompt(context: ChatContext): string {
    const hasMedicineContext = !!(context.medicineName && context.medicineName.trim() !== '');

    if (context.userRole === 'regulator') {
        return `You are an expert pharmaceutical regulatory AI assistant embedded in PharmaVerify, a blockchain-based drug authentication platform.
Your role is to assist government regulators in monitoring the pharmaceutical supply chain recorded on the Cardano blockchain.

${hasMedicineContext
    ? `Active Context:\n- Medicine / Batch Under Review: ${context.medicineName}\n- Batch Number: ${context.batchNumber || 'N/A'}`
    : 'No specific medicine is selected — you are providing system-level oversight.'}

Guidelines:
- Provide concise, data-driven, risk-focused analysis.
- Flag counterfeit risk signals, recall patterns, and supply chain anomalies when asked.
- You may also answer general regulatory, pharmacovigilance, or drug policy questions freely.
- Do NOT restrict yourself only to the context above — answer any relevant question the user asks.`;
    }

    if (context.userRole === 'manufacturer') {
        return `You are an expert pharmaceutical AI assistant embedded in PharmaVerify, a blockchain-based drug authentication platform.
You are assisting a pharmaceutical manufacturer in the process of batch registration and supply chain management.

Guidelines:
- Help with questions about pharmaceutical manufacturing, GMP (Good Manufacturing Practice), batch registration, and quality control.
- Explain blockchain-based drug authentication and NFT batch minting concepts when asked.
- Answer questions about post-quantum cryptography and how it protects pharmaceutical supply chains.
- Answer any general pharmaceutical, chemistry, or drug safety questions freely.
- Be concise, professional, and technically accurate.`;
    }

    if (hasMedicineContext) {
        return `You are an expert pharmaceutical AI assistant embedded in PharmaVerify, a blockchain-based medicine verification platform.
A user has just verified or is reviewing a specific medicine. Use the context below to give targeted, relevant answers.

Medicine Context:
- Name: ${context.medicineName}
- Active Ingredient: ${context.activeIngredient || 'Unknown'}
- Dosage: ${context.dosage || 'Unknown'}
- Batch Number: ${context.batchNumber || 'N/A'}
- Verification Status: ${context.status || 'Unknown'}

Guidelines:
- Prioritise the context above when answering questions about this specific medicine.
- If the user asks a general question (e.g. drug interactions, side effects of other medicines, general pharma knowledge), answer it freely and helpfully — do NOT refuse just because it's outside the medicine context.
- Be concise, professional, and educational. Do not provide personalised medical diagnoses.`;
    }

    return `You are an expert pharmaceutical AI assistant embedded in PharmaVerify, a blockchain-based medicine verification platform.
No specific medicine is currently selected, so you are operating as a general pharmaceutical knowledge assistant.

You can help with:
- Drug information, uses, side effects, and interactions
- Pharmaceutical storage and handling best practices
- Medicine verification and authentication concepts
- Drug safety and pharmacovigilance
- Blockchain-based pharmaceutical supply chain
- General medical or health-related questions

Guidelines:
- Answer all questions freely and helpfully.
- Be concise, professional, and educational.
- Do not provide personalised medical diagnoses or replace a doctor's advice.
- If a question is completely unrelated to health, medicine, or pharma, politely redirect.`;
}

export default function ChatWidget({ contextData = {}, title = 'Smart AI Assistant' }: ChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const prevMedicineNameRef = useRef<string | undefined>(undefined);
    const contextChangeIndexRef = useRef<number>(-1); // index after which the new context applies

    // Dynamic greeting — context-aware on first mount
    useEffect(() => {
        if (messages.length === 0) {
            const greeting = contextData?.medicineName
                ? `Hello! I'm PharmaVerify's AI Assistant. I can see you're reviewing **${contextData.medicineName}**. Ask me anything about this medicine, or any general pharmaceutical question!`
                : `Hello! I'm PharmaVerify's AI Assistant. Ask me anything about medicines, drug safety, storage, interactions, or pharmaceutical verification. How can I help you?`;
            setMessages([{ role: 'assistant', content: greeting }]);
            prevMedicineNameRef.current = contextData?.medicineName;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Detect medicine context change mid-conversation
    useEffect(() => {
        const prev = prevMedicineNameRef.current;
        const curr = contextData?.medicineName;

        // Only trigger when medicine is newly selected (or changed), not on initial mount
        if (curr && curr !== prev && messages.length > 0) {
            prevMedicineNameRef.current = curr;

            const notifyContent = `🔬 **Context updated:** You've selected **${curr}** for review.

I now have full details about this medicine:
- Active Ingredient: ${contextData?.activeIngredient || 'Unknown'}
- Dosage: ${contextData?.dosage || 'Unknown'}
- Batch: ${contextData?.batchNumber || 'N/A'}
- Status: ${contextData?.status || 'Unknown'}

Feel free to ask me anything about it, or continue with any general question!`;

            setMessages(prev => {
                const updated = [...prev, { role: 'system-notify' as const, content: notifyContent }];
                contextChangeIndexRef.current = updated.length; // mark where new context starts
                return updated;
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contextData?.medicineName]);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        setApiError(null);
        const userMessage: ChatMessage = { role: 'user', content: inputValue.trim() };
        const newMessages = [...messages, userMessage];

        setMessages(newMessages);
        setInputValue('');
        setIsLoading(true);

        const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY;

        if (!apiKey) {
            setMessages([...newMessages, {
                role: 'assistant',
                content: '⚠️ AI is not configured. Please set `VITE_GROQ_API_KEY` in your `.env` file and restart the dev server.'
            }]);
            setIsLoading(false);
            return;
        }

        // Build message history for Groq:
        // - Skip the local UI greeting (index 0)
        // - Skip system-notify bubbles (UI-only)
        // - If context changed mid-conversation, only send messages AFTER the context change
        //   plus a clear context-update marker so the model knows things shifted
        const changeIdx = contextChangeIndexRef.current;
        const historyStart = changeIdx > 0 ? changeIdx : 1; // start after greeting or after context change

        const slicedMessages = newMessages
            .slice(historyStart)
            .filter(m => m.role !== 'system-notify')
            .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

        // If we had a context change, prepend a synthetic exchange so the model is aware
        const hasContextChange = changeIdx > 0;
        const groqMessages: { role: 'user' | 'assistant'; content: string }[] = hasContextChange
            ? [
                {
                    role: 'user',
                    content: `[CONTEXT UPDATED] The user has now selected a specific medicine: ${contextData?.medicineName}. Please treat all subsequent questions in light of this new context.`
                },
                {
                    role: 'assistant',
                    content: `Understood! I've updated my context to focus on ${contextData?.medicineName}. I'm ready to help with questions about it, or any general pharmaceutical question. What would you like to know?`
                },
                ...slicedMessages,
              ]
            : slicedMessages;

        const systemPrompt = buildSystemPrompt(contextData);

        try {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'system', content: systemPrompt }, ...groqMessages],
                    temperature: 0.5,
                    max_tokens: 1024,
                }),
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error('Groq API error:', res.status, errText);
                throw new Error(`Groq API error ${res.status}`);
            }

            const data = await res.json();
            const aiMessage = data.choices[0].message.content;
            setMessages([...newMessages, { role: 'assistant', content: aiMessage }]);

        } catch (err) {
            console.error('Chat error:', err);
            const errMsg = err instanceof Error ? err.message : String(err);
            setApiError(errMsg);
            setMessages([...newMessages, {
                role: 'assistant',
                content: `Sorry, I couldn't reach the AI service. This may be a network issue.\n\nError: ${errMsg}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                id="chat-widget-fab"
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 z-50 animate-bounce"
                title="Open AI Assistant"
            >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </button>
        );
    }

    return (
        <div
            id="chat-widget-panel"
            className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl flex flex-col z-50 overflow-hidden border border-white/20 bg-black/80 backdrop-blur-xl rounded-2xl"
            data-html2canvas-ignore
        >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-500/80 to-purple-500/80 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center space-x-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div>
                        <h3 className="text-white font-bold text-sm leading-none">{title}</h3>
                        {contextData?.medicineName && (
                            <p className="text-white/60 text-[10px] mt-0.5 truncate max-w-[180px]">
                                📋 {contextData.medicineName}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    id="chat-widget-close"
                    onClick={() => setIsOpen(false)}
                    className="text-white/80 hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* API Error Banner */}
            {apiError && (
                <div className="px-3 py-2 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs flex-shrink-0">
                    ⚠️ Network error — check your internet connection.
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${
                        msg.role === 'system-notify' ? 'justify-center' :
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                        {msg.role === 'system-notify' ? (
                            // Context-change notification bubble
                            <div className="max-w-[95%] rounded-xl px-4 py-3 bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs text-center">
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            </div>
                        ) : (
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                                msg.role === 'user'
                                    ? 'bg-indigo-500 text-white rounded-br-none'
                                    : 'bg-white/10 text-white/90 border border-white/10 rounded-bl-none'
                            }`}>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white/10 border border-white/10 rounded-2xl rounded-bl-none px-4 py-3 flex space-x-1.5">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-black/40 border-t border-white/10 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                        id="chat-widget-input"
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={contextData?.medicineName
                            ? `Ask about ${contextData.medicineName} or anything pharma...`
                            : 'Ask me anything about medicines...'}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-white/30"
                        disabled={isLoading}
                    />
                    <button
                        id="chat-widget-send"
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-colors flex-shrink-0"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
