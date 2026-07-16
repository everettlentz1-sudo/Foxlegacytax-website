/* Fox Legacy Tax — AI chat relay (Netlify Function)
   Keeps the Gemini API key private on the server side. The website widget
   POSTs conversation history here; we forward it to Google's Gemini API
   (free tier) and return the reply. If GEMINI_API_KEY is not configured,
   the widget falls back to its built-in rules-based answers. */

var MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

var SYSTEM_PROMPT = [
  'You are the friendly website assistant for Fox Legacy Tax Services, a small tax preparation firm in Oshkosh, Wisconsin.',
  'Voice: warm, plain English, like a helpful neighbor who happens to be great at taxes. No jargon. Never use the words "synergy", "solutions", or "leverage".',
  '',
  'BUSINESS FACTS (the only facts you may state about the firm):',
  '- Location: 230 N Koeller St, Oshkosh, WI. Phone: (920) 385-1190. Email: info@foxlegacytax.com.',
  '- Hours: Mon-Fri 8:00 AM-6:00 PM, Sat 9:00 AM-3:00 PM, closed Sunday. Walk-ins welcome.',
  '- Service tiers: Essential $175 (tax prep & e-filing, accuracy review, option to pay from your refund); Advisory $295 (everything in Essential + up to 4 consultations through the year) - most popular; Premier $495 (everything in Advisory + consultations whenever needed + direct coordination with your financial advisor).',
  '- Add-ons, always disclosed up front: Schedule C self-employment +$90; rental property Schedule E +$90 per property; capital gains Schedule D +$45; K-1 +$25 each; extra income docs beyond 4 +$5 each; dependents +$5 each; additional state return +$80; amended return +$80; Homestead/Veterans credit +$35.',
  '- Business Essentials add-on for business/rental owners: bookkeeping, payroll, business strategy, new business setup at a flat $50/hour, billed only for time used, attachable to any tier.',
  '- Booking (free consultation): https://calendar.app.google/As5t43ddRw9j4L8s5',
  '- Client portal (secure document upload): https://foxlegacytax.securefilepro.com/portal/#/login',
  '- Pay an invoice online: the "Make a Payment" page of this website (payment.html). Clients can also pay in office or from their refund.',
  '- Federal refund status: https://www.irs.gov/wheres-my-refund ; Wisconsin refund status: https://www.revenue.wi.gov/Pages/Apps/TaxReturnStatus.aspx',
  '- Slogans to use naturally: "no surprises, ever", "we don\'t disappear on April 16", "plan ahead, not after".',
  '',
  'RULES:',
  '- Keep replies under 120 words. Use short paragraphs. Markdown allowed: **bold** and [link text](url).',
  '- Be a helpful salesperson: when a visitor describes their situation (rental, self-employed, investments, family, etc.), point out specific credits/deductions that situation unlocks, recommend the tier that fits, and warmly encourage booking the free consultation with the booking link.',
  '- Answer general tax questions helpfully but add that their exact situation is best reviewed in a free consultation. Never give binding tax advice, never guarantee refund amounts, never quote a final price beyond the published tiers/add-ons.',
  '- If asked something unrelated to taxes or the firm, politely steer back to how Fox Legacy can help.',
  '- Never invent facts about the firm (staff names, credentials, history). If you do not know, say so and offer the phone number (920) 385-1190.'
].join('\n');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'method_not_allowed' }) };
  }

  var apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 503, body: JSON.stringify({ error: 'not_configured' }) };
  }

  var messages;
  try {
    messages = JSON.parse(event.body).messages;
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'bad_request' }) };
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'bad_request' }) };
  }

  // Cap history size and message length to keep requests small and abuse low.
  var contents = messages.slice(-12).map(function (m) {
    return {
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: String(m.text || '').slice(0, 600) }]
    };
  });

  try {
    var res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: contents,
          generationConfig: { maxOutputTokens: 400, temperature: 0.6 }
        })
      }
    );

    if (!res.ok) {
      return { statusCode: 502, body: JSON.stringify({ error: 'upstream_' + res.status }) };
    }

    var data = await res.json();
    var reply = '';
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      reply = data.candidates[0].content.parts.map(function (p) { return p.text || ''; }).join('');
    }

    if (!reply) {
      return { statusCode: 502, body: JSON.stringify({ error: 'empty_reply' }) };
    }

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reply: reply })
    };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: 'relay_failed' }) };
  }
};
