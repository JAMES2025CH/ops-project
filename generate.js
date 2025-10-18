// 這是一個 Vercel Serverless Function (我們的「總機」)

export default async function handler(request, response) {
    // 1. 只允許 POST 請求
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. 從 Vercel 的「環境變數」中安全地讀取您的金鑰
    // (這個 'GEMINI_API_KEY' 是我們等一下要去 Vercel 網站上設定的名稱)
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        // 如果伺服器上沒有設定金鑰，就回傳錯誤
        return response.status(500).json({ error: 'API Key not configured on server' });
    }

    // 3. 這是 Google AI 的真實 API 網址
    const GOOGLE_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent";

    // 4. 嘗試將前端的請求轉發給 Google
    try {
        // 將前端傳來的資料 (request.body) 和我們安全的金鑰組合起來，發送給 Google
        const googleResponse = await fetch(`${GOOGLE_API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request.body) // 將前端的請求內容原封不動轉發
        });

        // 5. 取得 Google 的回應
        const data = await googleResponse.json();

        // 6. 將 Google 的回應原封不動地送回給您的前端 (index.html)
        if (!googleResponse.ok) {
            // 如果 Google 回傳錯誤，也將錯誤訊息傳回前端
            console.error('Google API Error:', data);
            return response.status(googleResponse.status).json(data);
        }

        response.status(200).json(data);

    } catch (error) {
        // 如果「總機」本身出錯
        console.error('Proxy Error:', error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
}