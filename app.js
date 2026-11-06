import { PollinationsDeslopClient } from "./pollinations-client.js";

const client = new PollinationsDeslopClient();

const COMMON_SLOP_TROPES = [
    "delve", "testament", "tapestry", "crucial", "beacon", "unwavering",
    "foster", "cornerstone", "revolutionize", "pave the way", "game-changer",
    "in summary", "moreover", "it is important to remember", "a multifaceted"
];

const SAMPLES = [
    {
        title: "Standard AI Product Announcement",
        text: "In today's fast-paced digital tapestry, organizations must delve into cutting-edge paradigms. This new product is a testament to our unwavering commitment to revolutionize developer workflows, fostering synergy and paving the way for a brighter tomorrow."
    },
    {
        title: "AI Essay Opening",
        text: "From the dawn of human civilization to the modern era, technology has played a crucial, multifaceted role. But as we stand at the precipice of an AI revolution, one cannot help but wonder: what does the future hold?"
    }
];

function analyzeLocally(text) {
    const lower = text.toLowerCase();
    const hits = COMMON_SLOP_TROPES.filter(trope => lower.includes(trope));
    const words = text.trim().split(/\s+/).length || 1;
    const slopRatio = Math.min(100, Math.round((hits.length / (words / 15)) * 100));
    
    // Simple rule-based humanizer
    let cleaned = text;
    hits.forEach(t => {
        const re = new RegExp(t, "gi");
        cleaned = cleaned.replace(re, "[...]");
    });
    
    return {
        slopIndex: Math.max(slopRatio, hits.length * 12),
        detectedTropes: hits,
        humanProse: `[Local 0-Pollen Preview]: ${cleaned.replace(/\[\.\.\.\]/g, "").replace(/\s{2,}/g, " ").trim()}`
    };
}

function updateUI(data) {
    document.getElementById("stats-badge").innerHTML = `Slop Index: <strong>${data.slopIndex}%</strong> · Tropes Found: ${data.detectedTropes.length}`;
    document.getElementById("text-output").value = data.humanProse || "";
    
    const chipContainer = document.getElementById("tropes-list");
    chipContainer.innerHTML = "";
    if (data.detectedTropes.length === 0) {
        chipContainer.innerHTML = `<span style="color:var(--muted);font-size:0.85rem;">No obvious LLM tropes detected. Clean human tone!</span>`;
    } else {
        data.detectedTropes.forEach(t => {
            const chip = document.createElement("span");
            chip.className = "trope-chip";
            chip.textContent = `⚠ "${t}"`;
            chipContainer.appendChild(chip);
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const sampleContainer = document.getElementById("sample-pills");
    SAMPLES.forEach(s => {
        const btn = document.createElement("button");
        btn.className = "sample-btn";
        btn.textContent = s.title;
        btn.addEventListener("click", () => {
            document.getElementById("text-input").value = s.text;
            const res = analyzeLocally(s.text);
            updateUI(res);
        });
        sampleContainer.appendChild(btn);
    });

    document.getElementById("text-input").value = SAMPLES[0].text;
    updateUI(analyzeLocally(SAMPLES[0].text));

    document.getElementById("btn-analyze-local").addEventListener("click", () => {
        const text = document.getElementById("text-input").value.trim();
        if (!text) return alert("Please paste or type text to analyze.");
        updateUI(analyzeLocally(text));
    });

    document.getElementById("btn-deslop-live").addEventListener("click", async () => {
        const text = document.getElementById("text-input").value.trim();
        if (!text) return alert("Please enter text.");
        const token = client.getToken();
        if (!token) return alert("Connect your Pollinations wallet via <polli-connect> for live AI de-voicing (BYOP), or use 'Analyze Tropes (0 Pollen)'.");

        document.getElementById("text-output").value = "De-voicing text with Pollinations model...";
        try {
            const res = await client.deslopText(text);
            updateUI(res);
        } catch (e) {
            alert(`De-slop error: ${e.message}`);
        }
    });

    document.addEventListener("polli-connect", (e) => {
        const key = e.detail?.key || e.detail?.apiKey || e.detail?.token;
        if (key) {
            localStorage.setItem("polli:key", key);
            document.getElementById("auth-status").textContent = `BYOP Connected (${key.slice(0, 6)}…)`;
        }
    });
});
