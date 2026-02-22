// Use values from .env if available, otherwise fallback to provided values
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyCiAzvfG04C5KzIi0a-tvyF0FDYZbIZLSo';

const models = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash'
];

async function test() {
    console.log(`Using API Key: ${GOOGLE_API_KEY.substring(0, 10)}...`);

    for (const model of models) {
        process.stdout.write(`Testing ${model}... `);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`;
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: 'say hi short' }] }],
                })
            });

            const data = await res.json();

            if (res.ok) {
                console.log(`✅ OK`);
                console.log('   ->', data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/\n/g, ' '));
            } else {
                console.log(`❌ FAIL: ${data.error?.message || JSON.stringify(data)}`);
            }
        } catch (e) {
            console.log(`❌ ERR: ${e.message}`);
        }
    }
}

test();
