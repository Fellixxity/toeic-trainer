'use strict';
/**
 * TOEIC 全パート (Part 5, Part 6, Part 7) 問題バンク
 *
 * フォーマット:
 *   id        : 一意なID (Part 5: p001~, Part 6: p6_001_q1~, Part 7: p7_001_q1~)
 *   part      : 5, 6, または 7
 *   passageId : Part 6/7 の場合は PASSAGE_BANK のキー。Part 5 は null
 *   blankNum  : Part 6 専用の空所番号（例: 131）
 *   cat       : pos / prep / gram / gerund / colloc / reading(Part7)
 *   q         : 問題文（Part 6 の場合は空所指示文、Part 7 は設問）
 *   choices   : 選択肢4つ（表示時にシャッフル）
 *   a         : 正解のインデックス（0-3）
 *   exp       : 解説（日本語）
 */
const QUESTION_BANK = [

  // ================================================================
  // PART 5 (31問)
  // ================================================================
  {
    id: 'p001', part: 5, passageId: null, cat: 'pos',
    q: 'The board of directors made a ------- to restructure the entire organization.',
    choices: ['decide', 'decision', 'decisive', 'decisively'],
    a: 1, exp: '冠詞 "a" の直後なので名詞が入る。"decision"（決定）が正解。'
  },
  {
    id: 'p002', part: 5, passageId: null, cat: 'pos',
    q: 'Ms. Kim gave a ------- presentation at the annual international conference.',
    choices: ['remark', 'remarkably', 'remarkable', 'remarked'],
    a: 2, exp: '冠詞 "a" と名詞 "presentation" の間なので形容詞が入る。"remarkable"（注目に値する）が正解。'
  },
  {
    id: 'p003', part: 5, passageId: null, cat: 'pos',
    q: 'The software was ------- designed to help employees improve their daily efficiency.',
    choices: ['specific', 'specifically', 'specification', 'specify'],
    a: 1, exp: '受動態の動詞句 "was designed" を修飾するので副詞が入る。"specifically"（特別に）が正解。'
  },
  {
    id: 'p004', part: 5, passageId: null, cat: 'pos',
    q: 'All employees are encouraged to submit their ------- by the end of the week.',
    choices: ['suggest', 'suggestion', 'suggestive', 'suggested'],
    a: 1, exp: '所有格 "their" の後なので名詞が入る。"suggestion"（提案）が正解。'
  },
  {
    id: 'p005', part: 5, passageId: null, cat: 'pos',
    q: 'The ------- of the new product line exceeded all of the company\'s expectations.',
    choices: ['popularize', 'popular', 'popularly', 'popularity'],
    a: 3, exp: '定冠詞 "The" の後・動詞 "exceeded" の前なので名詞が入る。"popularity"（人気）が正解。'
  },
  {
    id: 'p006', part: 5, passageId: null, cat: 'pos',
    q: 'The ------- review of all submitted applications will begin next Monday.',
    choices: ['thorough', 'thoroughly', 'thoroughness', 'thoroughed'],
    a: 0, exp: '定冠詞 "The" と名詞 "review" の間なので形容詞が入る。"thorough"（徹底的な）が正解。'
  },
  {
    id: 'p007', part: 5, passageId: null, cat: 'pos',
    q: 'We ------- recommend that all team members attend the upcoming safety training session.',
    choices: ['strong', 'strength', 'strongly', 'stronger'],
    a: 2, exp: '動詞 "recommend" を修飾するので副詞が入る。"strongly"（強く）が正解。'
  },
  {
    id: 'r001', part: 5, passageId: null, cat: 'prep',
    q: 'The renovation project was completed ------- schedule, impressing all of the stakeholders.',
    choices: ['ahead of', 'instead of', 'in spite of', 'because of'],
    a: 0, exp: '"ahead of schedule"（予定より早く）が正解の定番表現。'
  },
  {
    id: 'r002', part: 5, passageId: null, cat: 'prep',
    q: '------- the heavy rain, the outdoor ceremony proceeded exactly as planned.',
    choices: ['Because of', 'Due to', 'Despite', 'Since'],
    a: 2, exp: '逆接の意味が必要な前置詞。"Despite"（～にもかかわらず）が正解。'
  },
  {
    id: 'r003', part: 5, passageId: null, cat: 'prep',
    q: 'Please review the contract carefully ------- submitting it to the client.',
    choices: ['before', 'after', 'while', 'since'],
    a: 0, exp: '"before + 動名詞" で「～する前に」。提出前に確認するのが自然。'
  },
  {
    id: 'r004', part: 5, passageId: null, cat: 'prep',
    q: 'The conference room will be available ------- 2 P.M. and 5 P.M. tomorrow.',
    choices: ['from', 'between', 'during', 'among'],
    a: 1, exp: '"between A and B"（AとBの間）が正解の定番表現。'
  },
  {
    id: 'r005', part: 5, passageId: null, cat: 'prep',
    q: 'The manager approved the budget ------- some reservations about the proposed timeline.',
    choices: ['despite', 'because of', 'due to', 'as a result of'],
    a: 0, exp: '"despite"（～にもかかわらず）が正解。逆接の接続前置詞。'
  },
  {
    id: 'r006', part: 5, passageId: null, cat: 'prep',
    q: 'The submission deadline for the quarterly report has been extended ------- two weeks.',
    choices: ['by', 'for', 'to', 'until'],
    a: 0, exp: '"extended by two weeks"（2週間延長された）。差分・増加を表す "by"。'
  },
  {
    id: 'g001', part: 5, passageId: null, cat: 'gram',
    q: 'By the end of this quarter, the sales team ------- its annual target.',
    choices: ['will reach', 'will have reached', 'has reached', 'reached'],
    a: 1, exp: '"By the end of ~" は未来完了の合図。"will have reached" が正解。'
  },
  {
    id: 'g002', part: 5, passageId: null, cat: 'gram',
    q: 'The financial report ------- by the accounting department before the board meeting.',
    choices: ['prepares', 'is preparing', 'was prepared', 'has prepared'],
    a: 2, exp: '報告書は準備される側なので受動態 "was prepared" が正解。'
  },
  {
    id: 'g003', part: 5, passageId: null, cat: 'gram',
    q: 'If the company ------- its overseas expansion plan, it would require additional funding.',
    choices: ['pursue', 'pursues', 'pursued', 'will pursue'],
    a: 2, exp: '仮定法過去（If + 過去形, would + 原形）。"pursued" が正解。'
  },
  {
    id: 'g004', part: 5, passageId: null, cat: 'gram',
    q: 'All visitors ------- to wear their identification badges at all times in the building.',
    choices: ['require', 'required', 'are required', 'requiring'],
    a: 2, exp: '受動態 "are required"（着用が義務付けられている）が正解。'
  },
  {
    id: 'g005', part: 5, passageId: null, cat: 'gram',
    q: 'Neither the director nor the assistants ------- available for the emergency meeting.',
    choices: ['is', 'are', 'was', 'being'],
    a: 1, exp: '"Neither A nor B" は B に一致させる。"the assistants" が複数形なので "are"。'
  },
  {
    id: 'g006', part: 5, passageId: null, cat: 'gram',
    q: 'The new workplace safety regulations ------- into effect on January 1st of next year.',
    choices: ['come', 'will come', 'came', 'have been coming'],
    a: 1, exp: '未来の特定日なので単純未来 "will come" が正解。'
  },
  {
    id: 'e001', part: 5, passageId: null, cat: 'gerund',
    q: 'Thank you for ------- the time to attend our product demonstration today.',
    choices: ['take', 'took', 'taken', 'taking'],
    a: 3, exp: '前置詞 "for" の後ろなので動名詞 "taking" が正解。'
  },
  {
    id: 'e002', part: 5, passageId: null, cat: 'gerund',
    q: 'The organization is committed to ------- a safe and inclusive working environment.',
    choices: ['provide', 'provided', 'providing', 'have provided'],
    a: 2, exp: '"be committed to" の to は前置詞。動名詞 "providing" が正解。'
  },
  {
    id: 'e003', part: 5, passageId: null, cat: 'gerund',
    q: 'In addition to ------- the annual report, she also prepared a detailed slide presentation.',
    choices: ['write', 'wrote', 'writing', 'written'],
    a: 2, exp: '"In addition to" の to は前置詞。動名詞 "writing" が正解。'
  },
  {
    id: 'e004', part: 5, passageId: null, cat: 'gerund',
    q: 'The new company policy focuses on ------- communication between all departments.',
    choices: ['improve', 'improving', 'improved', 'improvement'],
    a: 1, exp: '"focus on" の on は前置詞。動名詞 "improving" が正解。'
  },
  {
    id: 'e005', part: 5, passageId: null, cat: 'gerund',
    q: 'The candidate was selected primarily for her extensive experience in ------- large-scale projects.',
    choices: ['manage', 'managing', 'managed', 'management'],
    a: 1, exp: '"experience in -ing"（～の経験）。前置詞 in の後ろなので動名詞 "managing"。'
  },
  {
    id: 'v001', part: 5, passageId: null, cat: 'colloc',
    q: 'The innovative marketing campaign ------- considerable attention from potential customers.',
    choices: ['attracted', 'noticed', 'observed', 'watched'],
    a: 0, exp: '"attract attention"（注目を集める）コロケーション。'
  },
  {
    id: 'v002', part: 5, passageId: null, cat: 'colloc',
    q: 'The executive team needs to ------- a final decision before the end of this month.',
    choices: ['do', 'take', 'make', 'have'],
    a: 2, exp: '"make a decision"（決定を下す）コロケーション。'
  },
  {
    id: 'v003', part: 5, passageId: null, cat: 'colloc',
    q: 'The company will ------- a press conference next week to announce the merger officially.',
    choices: ['make', 'do', 'hold', 'give'],
    a: 2, exp: '"hold a press conference"（記者会見を開く）コロケーション。'
  },
  {
    id: 'v004', part: 5, passageId: null, cat: 'colloc',
    q: 'Please ------- into account all potential risks before proceeding with the expansion project.',
    choices: ['keep', 'take', 'put', 'bring'],
    a: 1, exp: '"take into account"（考慮に入れる）定番表現。'
  },
  {
    id: 'v005', part: 5, passageId: null, cat: 'colloc',
    q: 'The entire renovation of the headquarters is expected to ------- approximately three months.',
    choices: ['spend', 'pass', 'take', 'last'],
    a: 2, exp: '"take + 期間"（～の時間がかかる）。'
  },
  {
    id: 'v006', part: 5, passageId: null, cat: 'colloc',
    q: 'The annual financial report ------- that overall profits increased by 15% this fiscal year.',
    choices: ['told', 'said', 'indicated', 'spoke'],
    a: 2, exp: '無生物（report）が主語の時は "indicated"（示す）を使う。'
  },
  {
    id: 'v007', part: 5, passageId: null, cat: 'colloc',
    q: 'After months of intensive research, the development team finally ------- a major breakthrough.',
    choices: ['did', 'made', 'got', 'achieved'],
    a: 3, exp: '"achieve a breakthrough"（突破口を開く）格調高い表現。'
  },


  // ================================================================
  // PART 6 (長文穴埋め — 8問)
  // ================================================================

  // p6_001 用
  {
    id: 'p6_001_q1', part: 6, passageId: 'p6_001', blankNum: 131, cat: 'prep',
    q: 'Select the best word or phrase for blank [131].',
    choices: ['As a result', 'On the other hand', 'In addition', 'Otherwise'],
    a: 0, exp: '前文「改装工事が行われる」を受けて「その結果、2階と3階が閉鎖される」となる。"As a result"（結果として）が自然。'
  },
  {
    id: 'p6_001_q2', part: 6, passageId: 'p6_001', blankNum: 132, cat: 'pos',
    q: 'Select the best word or phrase for blank [132].',
    choices: ['Compete', 'Complimentary', 'Completion', 'Completely'],
    a: 1, exp: '名詞 "packing materials" を修飾する形容詞が必要。"Complimentary"（無料の）が正解。'
  },
  {
    id: 'p6_001_q3', part: 6, passageId: 'p6_001', blankNum: 133, cat: 'gram',
    q: 'Select the best sentence for blank [133].',
    choices: [
      'The new cafeteria will open earlier than usual.',
      'We are confident that the upgraded facilities will benefit everyone.',
      'All meetings scheduled for Friday have been canceled.',
      'Please leave your parking passes with security.'
    ],
    a: 1, exp: '不便をかけることへの理解に続く文節。「改修された施設が皆様の利益になると確信しています」が前後の文脈に最も合致。'
  },
  {
    id: 'p6_001_q4', part: 6, passageId: 'p6_001', blankNum: 134, cat: 'pos',
    q: 'Select the best word or phrase for blank [134].',
    choices: ['appreciate', 'appreciated', 'appreciation', 'appreciating'],
    a: 1, exp: '助動詞 "are" + 副詞 "greatly" の後ろで受動態を作る過去分詞 "appreciated" が正解。'
  },

  // p6_002 用
  {
    id: 'p6_002_q1', part: 6, passageId: 'p6_002', blankNum: 131, cat: 'gram',
    q: 'Select the best sentence for blank [131].',
    choices: [
      'Our team is currently updating your billing address.',
      'Your account manager will contact you shortly to confirm your payment details.',
      'These features are accessible immediately after logging in.',
      'The previous version of the software has been discontinued.'
    ],
    a: 2, exp: '前文「分析ツールと24/7サポートに無制限アクセスできる」に続き、「これらの機能はログイン後すぐに利用可能です」が自然。'
  },
  {
    id: 'p6_002_q2', part: 6, passageId: 'p6_002', blankNum: 132, cat: 'colloc',
    q: 'Select the best word or phrase for blank [132].',
    choices: ['reserve', 'remain', 'restore', 'replace'],
    a: 0, exp: '"reserve a seat"（席を予約する/確保する）コロケーションが正解。'
  },
  {
    id: 'p6_002_q3', part: 6, passageId: 'p6_002', blankNum: 133, cat: 'pos',
    q: 'Select the best word or phrase for blank [133].',
    choices: ['recommend', 'recommending', 'recommended', 'recommendation'],
    a: 2, exp: 'be動詞 + is highly の後なので保護となる過去分詞/形容詞 "recommended"（推奨される）が正解。'
  },
  {
    id: 'p6_002_q4', part: 6, passageId: 'p6_002', blankNum: 134, cat: 'pos',
    q: 'Select the best word or phrase for blank [134].',
    choices: ['available', 'availability', 'avail', 'availably'],
    a: 0, exp: '主語 + is readily + 形容詞 "available"（利用可能な / 対応可能な）が正解。'
  },


  // ================================================================
  // PART 7 (読解問題 — 5問)
  // ================================================================

  // p7_001 用
  {
    id: 'p7_001_q1', part: 7, passageId: 'p7_001', blankNum: null, cat: 'reading',
    q: 'What is the main purpose of the email?',
    choices: [
      'To announce a promotional sale',
      'To inform a customer about a delivery delay',
      'To request feedback on a purchase',
      'To confirm the receipt of a payment'
    ],
    a: 1, exp: '本文冒頭「shipment of your ... Headphones has been delayed by two business days」から、配送遅延を通知することが主目的。'
  },
  {
    id: 'p7_001_q2', part: 7, passageId: 'p7_001', blankNum: null, cat: 'reading',
    q: 'When is Mr. Miller\'s package now expected to ship?',
    choices: [
      'November 1',
      'November 3',
      'November 4',
      'November 5'
    ],
    a: 3, exp: '本文中「it is now scheduled to leave our fulfillment center on November 5」と明記されている。'
  },
  {
    id: 'p7_001_q3', part: 7, passageId: 'p7_001', blankNum: null, cat: 'reading',
    q: 'What is offered to Mr. Miller as compensation for the inconvenience?',
    choices: [
      'A full refund for his order',
      'Free express shipping on his current order',
      'A $15 credit voucher for future purchases',
      'A replacement pair of headphones'
    ],
    a: 2, exp: '本文中「we have applied a $15 credit voucher to your account ... toward any future purchase」から $15 のクーポン進呈が正解。'
  },

  // p7_002 用
  {
    id: 'p7_002_q1', part: 7, passageId: 'p7_002', blankNum: null, cat: 'reading',
    q: 'Who is the workshop primarily intended for?',
    choices: [
      'Entry-level office assistants',
      'Mid-level managers and aspiring executives',
      'University students majoring in business',
      'IT support specialists'
    ],
    a: 1, exp: '広告文「designed for mid-level managers and aspiring executives」より中間管理職および将来のエグゼクティブが対象。'
  },
  {
    id: 'p7_002_q2', part: 7, passageId: 'p7_002', blankNum: null, cat: 'reading',
    q: 'How can a participant receive a 15% discount on the registration fee?',
    choices: [
      'By paying in cash upon arrival',
      'By attending both days of the workshop',
      'By registering prior to November 15',
      'By completing an online survey beforehand'
    ],
    a: 2, exp: '広告文「Register before November 15 to receive an Early Bird Discount of 15% off」より11月15日前の登録が正解。'
  }

];
