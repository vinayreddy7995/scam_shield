import React, { useState } from 'react';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY; 

function App() {
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (!GEMINI_API_KEY) {
      alert("API Key missing! Check Vercel environment variables.");
      return;
    }

    setLoading(true);
    setResult(null);

    const promptText = `Analyze this message for scam/phishing risks:
    Sender: ${sender}
    Body: ${message}

    Respond strictly in JSON format with these exact keys:
    {
      "is_scam": boolean,
      "risk_score": number (0 to 100),
      "threat_type": string,
      "red_flags": [array of strings],
      "explanation": string,
      "recommended_action": string
    }`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        }
      );

      const data = await response.json();

      if (data.error) {
        alert(`API Error: ${data.error.message}`);
        setLoading(false);
        return;
      }

      const parsedContent = JSON.parse(data.candidates[0].content.parts[0].text);
      setResult(parsedContent);
    } catch (err) {
      alert(`Error running analysis: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px', backgroundColor: '#0f172a', color: '#f8fafc', borderRadius: '12px' }}>
      <h1 style={{ color: '#818cf8', textAlign: 'center' }}>🛡️ ScamShield AI</h1>
      <p style={{ textAlign: 'center', color: '#94a3b8' }}>Paste any suspicious email or text to run instant threat analysis.</p>

      <form onSubmit={handleScan} style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Sender Email / Phone (Optional):</label>
          <input 
            type="text" 
            placeholder="e.g. security@paypa1-update.com"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Message Body *:</label>
          <textarea 
            rows="5"
            required
            placeholder="Paste text here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#4f46e5', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'Scanning with Gemini...' : 'Analyze Message'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
            <div>
              <h2 style={{ margin: 0 }}>Threat Level</h2>
              <span style={{ color: '#94a3b8' }}>Category: {result.threat_type}</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', padding: '8px 16px', borderRadius: '6px', backgroundColor: result.risk_score > 50 ? '#7f1d1d' : '#14532d', color: result.risk_score > 50 ? '#fca5a5' : '#86efac' }}>
              Risk: {result.risk_score}/100
            </div>
          </div>

          <div style={{ marginTop: '15px' }}>
            <h3>Explanation:</h3>
            <p>{result.explanation}</p>
          </div>

          {result.red_flags?.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <h3>Red Flags Detected:</h3>
              <ul>
                {result.red_flags.map((flag, idx) => (
                  <li key={idx} style={{ color: '#fca5a5' }}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#312e81', borderRadius: '6px' }}>
            <strong>Action Plan:</strong> {result.recommended_action}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
