'use strict';
/**
 * Gemini API 連携モジュール
 *  - 弱点カテゴリに沿った新問題生成
 *  - 問題解説の「AI先生に質問 / 詳細解説」
 *  - 弱点分析・アドバイスレポートの生成
 */
const Gemini = {
  getApiKey() {
    return localStorage.getItem('gemini_api_key') || CONFIG.GEMINI_API_KEY || '';
  },

  setApiKey(key) {
    localStorage.setItem('gemini_api_key', key.trim());
  },

  async callGemini(promptText) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Gemini API キーが設定されていません。設定画面から登録してください。');
    }

    // 利用可能なモデルの優先順位リスト
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro'];
    let lastError = null;

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          lastError = new Error(err.error?.message || `Status: ${response.status}`);
          continue; // 次のモデルで試行
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } catch (e) {
        lastError = e;
      }
    }

    throw lastError || new Error('Gemini API の呼び出しに失敗しました。');
  },

  /**
   * 1. 弱点補強問題の自動生成
   */
  async generateQuestions(part = 5, cat = 'pos', count = 3) {
    const prompt = `
あなたはTOEIC満点講師です。
TOEIC Part ${part} の演習問題を ${count} 問作成してください。
対象カテゴリ: ${cat} (品詞, 前置詞, 文法, 動名詞, 語彙など)

以下の純粋な JSON 配列のみを出力してください（Markdownのコードブロック \`\`\`json 等は含めないでください）。

[
  {
    "id": "gen_${Date.now()}_1",
    "part": ${part},
    "passageId": null,
    "cat": "${cat}",
    "q": "問題文 (空所は ------- と記載)",
    "choices": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
    "a": 0,
    "exp": "日本語の詳しい解説。"
  }
]
`;
    const resText = await this.callGemini(prompt);
    const cleanJson = resText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  },

  /**
   * 2. AI先生による詳細解説
   */
  async explainQuestion(question, selectedIndex, passageText = null) {
    const prompt = `
あなたは親切で分かりやすいTOEICの専属講師です。
生徒が以下の問題を間違えたか、またはより詳しい解説を求めています。

【問題文】 ${question.q || '(空所の適切な語・文を選ぶ問題)'}
${passageText ? `\n【本文パッセージ】\n${passageText}\n` : ''}
【選択肢】 A: ${question.choices[0]}, B: ${question.choices[1]}, C: ${question.choices[2]}, D: ${question.choices[3]}
【正解】 ${['A','B','C','D'][question.a]} (${question.choices[question.a]})
${selectedIndex !== null ? `【生徒の回答】 ${['A','B','C','D'][selectedIndex]}` : ''}

文法規則や文脈、TOEICで狙われやすい引っ掛けポイントを踏まえて、150字程度で簡潔かつ分かりやすく励ましながら解説してください。
`;
    return await this.callGemini(prompt);
  },

  /**
   * 3. AI弱点分析レポートの作成
   */
  async generateWeaknessReport(history, srsData) {
    const recent = history.slice(-30);
    const summary = recent.map(h => `Category: ${h.category}, Result: ${h.correct ? 'Correct' : 'Wrong'}`).join('\n');

    const prompt = `
あなたはプロのTOEICコーチです。
以下は受講者の直近の解題履歴データです：

${summary}

受講者の文法・語彙の傾向と弱点を分析し、スコアアップのための具体的でやる気が出るアドバイスレポート（200字程度、マークダウン形式）を作成してください。
`;
    return await this.callGemini(prompt);
  }
};
