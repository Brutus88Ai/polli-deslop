export const POLLINATIONS_API_BASE = "https://gen.pollinations.ai";

export class PollinationsDeslopClient {
    constructor() {
        this.apiBase = POLLINATIONS_API_BASE;
    }

    getToken() {
        return localStorage.getItem("polli:key") || localStorage.getItem("pollinations_api_key") || null;
    }

    async deslopText(rawText) {
        const token = this.getToken();
        if (!token) throw new Error("No BYOP token connected. Connect via <polli-connect> or use 0-Pollen trope analysis.");

        const systemPrompt = `You are an expert human prose editor dedicated to removing 'LLM Voice' slop.
Analyze and rewrite the input text to completely eliminate:
1. Cliché filler words: 'delve', 'testament', 'tapestry', 'crucial', 'beacon', 'unwavering', 'foster'
2. False balance & formulaic tripartite structures: 'Not only X, but also Y, paving the way for Z'
3. Rhetorical patronizing questions and hollow corporate optimism
Return JSON with keys:
- humanProse: concise, punchy rewrite with authentic voice
- slopIndex: integer percentage (0-100) indicating density of LLM voice in original
- detectedTropes: array of specific identified cliché phrases`;

        const res = await fetch(`${this.apiBase}/v1/chat/completions`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai",
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: rawText }
                ]
            })
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Pollinations error (${res.status}): ${err}`);
        }

        const data = await res.json();
        return JSON.parse(data.choices?.[0]?.message?.content || "{}");
    }
}
