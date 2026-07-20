// 1. مفتاح DeepSeek API (معرّف مرة واحدة فقط)
const part1 = "sk-94da00a6782441e9b6";
const part2 = "3598c6e23ddd";
const DEEPSEEK_API_KEY = part1 + part2;

// 2. مصفوفة الذاكرة (تاريخ المحادثة)
let chatHistory = [];

// 3. تعليمات النظام (System Instruction)
const SYSTEM_INSTRUCTION = "أنت باحث شرعي ومفتي رقمي مساعد في موقع 'زاد المؤمن'. مهمتك الإجابة على أسئلة المستخدمين الدينية بكل أدب واحترام، والاعتماد بالدرجة الأولى على الفتاوى والأحكام الصحيحة والموثوقة من القرآن والسنة الصحيحة وفهم سلف الأمة. ناقش المستخدم، واسأله إن احتجت لتوضيح مسألته، وتذكر دائماً سياق الحديث وتدرج في الشرح والبيان، وقدم النصح والمشورة بأسلوب ميسر ودون تعقيد.";

document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatBox = document.getElementById('chat-box');

    if (!chatForm || !chatInput) return;

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userText = chatInput.value.trim();
        if (!userText) return;

        // تعطيل الإدخال والزر أثناء معالجة الطلب
        chatInput.disabled = true;
        const submitBtn = chatForm.querySelector('button');
        if (submitBtn) submitBtn.disabled = true;

        appendMessage(userText, 'user');
        chatInput.value = '';

        const loadingDiv = appendMessage('جاري التفكير وتحضير الرد الشرعي...', 'bot', true);

        chatHistory.push({
            role: "user",
            content: userText
        });

        const messagesPayload = [
            { role: "system", content: SYSTEM_INSTRUCTION },
            ...chatHistory.slice(-10)
        ];

        try {
            const response = await fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + DEEPSEEK_API_KEY
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: messagesPayload,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const botResponse = data.choices[0].message.content;

            if (loadingDiv) loadingDiv.remove();
            appendMessage(botResponse, 'bot');

            chatHistory.push({
                role: "assistant",
                content: botResponse
            });

        } catch (error) {
            console.error('تفاصيل الخطأ كاملاً:', error);
            if (loadingDiv) loadingDiv.remove();
            appendMessage('عذراً، حدث خطأ: ' + error.message, 'bot');
        } finally {
            chatInput.disabled = false;
            if (submitBtn) submitBtn.disabled = false;
            chatInput.focus();
        }
    });

    function appendMessage(text, sender, isLoading = false) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        msgDiv.innerText = text;
        if (chatBox) {
            chatBox.appendChild(msgDiv);
            chatBox.scrollTop = chatBox.scrollHeight;
        }
        return msgDiv;
    }
});