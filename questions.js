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
  // PART 5 (47問)
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

  // 仮定法現在（suggest/recommend/request/ask/require/demand/insist that + 原形）
  {
    id: 'g007', part: 5, passageId: null, cat: 'gram',
    q: 'Ms. Vega insisted that the original schedule ------- in place.',
    choices: ['remain', 'remains', 'be remained', 'remained'],
    a: 0, exp: 'insist that + 原形。remain は自動詞（= stay）なので be remained は存在しない。remain unchanged / remain in place / remain open を塊で暗記。'
  },
  {
    id: 'g008', part: 5, passageId: null, cat: 'gram',
    q: 'The client requested that the invoice ------- by e-mail instead of post.',
    choices: ['be sent', 'send', 'sends', 'is sent'],
    a: 0, exp: 'request that + 原形。invoice は送「られる」側 → be + 過去分詞。原形と be+p.p. が両方あるときだけ態を1秒考える。'
  },

  // 語彙コロケーション（追加分）
  {
    id: 'v008', part: 5, passageId: null, cat: 'colloc',
    q: 'Please ------- that all windows are locked before leaving the office.',
    choices: ['ensure', 'insure', 'assure', 'reassure'],
    a: 0, exp: 'ensure=確実にする / insure=保険をかける / assure+人=安心させる。assure の直後は必ず人。'
  },
  {
    id: 'v009', part: 5, passageId: null, cat: 'colloc',
    q: 'The warranty does not cover damage caused by improper -------.',
    choices: ['handling', 'holding', 'touching', 'carrying'],
    a: 0, exp: 'improper handling =「不適切な取り扱い」。warranty の除外条件で頻出。'
  },
  {
    id: 'v010', part: 5, passageId: null, cat: 'colloc',
    q: 'All product designs must receive final ------- from the creative director.',
    choices: ['approval', 'approving', 'approve', 'approvingly'],
    a: 0, exp: 'receive の目的語 → 名詞 approval。receive / obtain / grant approval のセット。'
  },
  {
    id: 'v011', part: 5, passageId: null, cat: 'colloc',
    q: 'We regret to inform you that the model you ordered has been -------.',
    choices: ['discontinued', 'interrupted', 'suspended', 'expired'],
    a: 0, exp: 'discontinued=生産終了（再入荷なし）。out of stock=一時的在庫切れ、と区別。regret to inform は悪いニュースの枕詞。'
  },
  {
    id: 'v012', part: 5, passageId: null, cat: 'colloc',
    q: 'Ms. Ando has extensive ------- in international contract law.',
    choices: ['expertise', 'expert', 'expertly', 'experts'],
    a: 0, exp: 'extensive expertise =「豊富な専門知識」（不可算）。expert は人。注意: have proven ------- の形では proven は形容詞（実証済みの）で have は本動詞「持つ」。現在完了と読み違えて副詞を選ばない（proven track record / proven method と同類）。'
  },
  {
    id: 'v013', part: 5, passageId: null, cat: 'colloc',
    q: 'The airline will ------- passengers for meals if flights are delayed overnight.',
    choices: ['compensate', 'precede', 'estimate', 'negotiate'],
    a: 0, exp: 'compensate + 人 + for =「補償する」。reimburse=立替精算、compensate=損害への埋め合わせ。'
  },
  {
    id: 'v014', part: 5, passageId: null, cat: 'colloc',
    q: 'Customers who spend over $100 are ------- to free shipping.',
    choices: ['entitled', 'deserved', 'qualified', 'permitted'],
    a: 0, exp: 'be entitled to + 名詞 =「〜の権利がある」。特典系名詞（refund / discount / free shipping）が続く。qualified は for。'
  },
  {
    id: 'v015', part: 5, passageId: null, cat: 'colloc',
    q: 'Please review the ------- agenda before tomorrow\'s board meeting.',
    choices: ['enclosed', 'closed', 'inclusive', 'included'],
    a: 0, exp: 'enclosed =「同封の」（郵便）。メールなら attached（添付の）。ペアで暗記。'
  },

  // 言い換え（TOEIC頻出パラフレーズ。Part 7 の正解選択肢はほぼこの形）
  {
    id: 'v016', part: 5, passageId: null, cat: 'colloc',
    q: '"Training will be provided to all new employees." 言い換えると？',
    choices: [
      'New hires can learn the skills on the job',
      'Applicants must already be fully trained',
      'Only experienced staff will be hired',
      'Employees must pay for their own training'
    ],
    a: 0, exp: 'training will be provided = learn on the job。「未経験でも入社後に学べる」のサイン。'
  },
  {
    id: 'v017', part: 5, passageId: null, cat: 'colloc',
    q: '"Applications received after May 1 will not be considered." 言い換えると？',
    choices: [
      'Late applications will be rejected',
      'All applications will be reviewed by May 1',
      'Applications must be revised after May 1',
      'Early applications receive a discount'
    ],
    a: 0, exp: 'not be considered = be rejected。「検討されない」=「不合格」。'
  },
  {
    id: 'v018', part: 5, passageId: null, cat: 'colloc',
    q: '"Our products are reasonably priced." 言い換えると？',
    choices: [
      'The products are affordable',
      'The products are of poor quality',
      'The prices change frequently',
      'The products are expensive but durable'
    ],
    a: 0, exp: 'reasonably priced = affordable = inexpensive（手頃な価格）。'
  },
  {
    id: 'v019', part: 5, passageId: null, cat: 'colloc',
    q: '"Attendance at the seminar is mandatory for all staff." 言い換えると？',
    choices: [
      'All staff are required to attend',
      'Staff may attend if they wish',
      'The seminar is open to the public',
      'Attendance will be rewarded'
    ],
    a: 0, exp: 'mandatory = required = compulsory（必須）。反意語は optional / voluntary（任意）。'
  },
  {
    id: 'v020', part: 5, passageId: null, cat: 'colloc',
    q: '"Seats will be assigned in the order that requests are received." 言い換えると？',
    choices: [
      'Seating is first-come, first-served',
      'Seats are assigned randomly',
      'Requests must be made in person',
      'Seats are reserved for members only'
    ],
    a: 0, exp: 'in the order received = first-come, first-served（先着順）。両方向で言い換えられるように。'
  },
  {
    id: 'v021', part: 5, passageId: null, cat: 'colloc',
    q: '"Refreshments will be complimentary for all attendees." 言い換えると？',
    choices: [
      'Attendees can have refreshments for free',
      'Refreshments are sold at a discount',
      'Attendees should bring their own refreshments',
      'Refreshments are for staff only'
    ],
    a: 0, exp: 'complimentary = free of charge = at no cost。無料3点セットの3つ目。'
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
  },


  // ================================================================
  // PART 5 追加分（品詞・前置詞/接続詞）
  // ================================================================
  {
    id: 'p008', part: 5, passageId: null, cat: 'pos',
    q: 'All employees must submit their travel expense reports to the finance department for ------- before the end of the month.',
    choices: ['approve', 'approving', 'approval', 'approved'],
    a: 2, exp: '前置詞 for の直後は名詞。「前置詞＋（　）」は名詞を選ぶのが原則。'
  },
  {
    id: 'p009', part: 5, passageId: null, cat: 'pos',
    q: 'The new inventory system has proven to be remarkably ------- in reducing warehouse delays.',
    choices: ['effect', 'effective', 'effectively', 'effectiveness'],
    a: 1, exp: 'be動詞の補語かつ副詞 remarkably に修飾される位置なので形容詞。「副詞＋（　）」が be の後ろなら形容詞。'
  },
  {
    id: 'p010', part: 5, passageId: null, cat: 'pos',
    q: "Ms. Alvarez handled the client's complaint so ------- that the contract was renewed the following week.",
    choices: ['profession', 'professional', 'professionally', 'professionalism'],
    a: 2, exp: 'handled という完全な動詞句を修飾するので副詞。so ... that の空所は、修飾対象が動詞か名詞かで品詞を決める。'
  },
  {
    id: 'p011', part: 5, passageId: null, cat: 'pos',
    q: 'The construction crew worked overtime to ensure the ------- of the new distribution center by March.',
    choices: ['complete', 'completely', 'completion', 'completed'],
    a: 2, exp: 'the と of に挟まれた位置は名詞しか入らない。「the ------- of」は品詞問題の最頻出パターン。'
  },
  {
    id: 'p012', part: 5, passageId: null, cat: 'pos',
    q: 'Applicants who have previously worked in logistics will be given ------- consideration during the screening process.',
    choices: ['prefer', 'preference', 'preferential', 'preferably'],
    a: 2, exp: '名詞 consideration を修飾する位置なので形容詞。名詞の直前が空所ならまず形容詞を疑う。'
  },
  {
    id: 'p013', part: 5, passageId: null, cat: 'pos',
    q: 'The revised safety guidelines were distributed to all shift supervisors ------- after the board meeting concluded.',
    choices: ['immediate', 'immediacy', 'immediately', 'immediateness'],
    a: 2, exp: '文の要素が揃っており後ろの after 節を修飾するので副詞。完全文の後の空所は副詞が基本。'
  },
  {
    id: 'p014', part: 5, passageId: null, cat: 'pos',
    q: 'Because the supplier failed to meet the agreed deadline, the manufacturer decided to ------- the contract.',
    choices: ['termination', 'terminal', 'terminate', 'terminally'],
    a: 2, exp: 'to の直後で目的語 the contract を取るので動詞の原形。to＋（　）＋目的語なら to不定詞と判断する。'
  },
  {
    id: 'p015', part: 5, passageId: null, cat: 'pos',
    q: "The training manual provides a ------- overview of the company's data security procedures.",
    choices: ['comprehend', 'comprehension', 'comprehensive', 'comprehensively'],
    a: 2, exp: '冠詞 a と名詞 overview の間は形容詞の定位置。「a＋（　）＋名詞」は形容詞。'
  },
  {
    id: 'r007', part: 5, passageId: null, cat: 'prep',
    q: 'The renovation of the east wing will not begin ------- the tenants have relocated to temporary offices.',
    choices: ['until', 'by', 'during', 'prior to'],
    a: 0, exp: '後ろが節なので接続詞が必要。「〜するまで始まらない」の意味で until。by / during / prior to は前置詞で節を導けない。'
  },
  {
    id: 'r008', part: 5, passageId: null, cat: 'prep',
    q: 'Employees may access the parking garage on weekends ------- they present a valid identification badge.',
    choices: ['in case of', 'provided that', 'owing to', 'regardless of'],
    a: 1, exp: '後ろが節で「〜という条件で」。provided that は条件の接続詞。他は前置詞句で名詞しか続かない。'
  },
  {
    id: 'r009', part: 5, passageId: null, cat: 'prep',
    q: "The keynote speaker's presentation was postponed ------- a malfunction in the auditorium's sound system.",
    choices: ['because', 'so that', 'due to', 'therefore'],
    a: 2, exp: '後ろが名詞句なので前置詞句の due to。because は節、because of なら名詞句という区別が問われる。'
  },
  {
    id: 'r010', part: 5, passageId: null, cat: 'prep',
    q: 'The consulting firm has offices in twelve countries ------- Asia and South America.',
    choices: ['throughout', 'among', 'along', 'toward'],
    a: 0, exp: '広い地域の「〜各地に」は throughout。among は同種の複数の中で、along は線状のものに沿って。'
  },
  {
    id: 'r011', part: 5, passageId: null, cat: 'prep',
    q: '------- the marketing team relies on social media, the sales division still favors direct client visits.',
    choices: ['Unlike', 'In spite of', 'While', 'Instead of'],
    a: 2, exp: '後ろが節なので接続詞。対比の「〜する一方で」は While。他はすべて前置詞（句）。'
  },

  // ================================================================
  // PART 5 追加分（文法・準動詞）
  // ================================================================
  {
    id: 'g009', part: 5, passageId: null, cat: 'gram',
    q: 'The board members insisted that the quarterly report ------- to all shareholders before the annual meeting.',
    choices: ['is distributed', 'be distributed', 'distributing', 'was distributing'],
    a: 1, exp: 'insist / suggest / recommend / request / require の that節は原形（仮定法現在）。受動なので be distributed。'
  },
  {
    id: 'g010', part: 5, passageId: null, cat: 'gram',
    q: 'The consultant recommended that the company ------- its overseas expansion until market conditions improve.',
    choices: ['postpones', 'postponed', 'postpone', 'to postpone'],
    a: 2, exp: 'recommend that の後は原形。三人称単数主語でも -s を付けないのがポイント。'
  },
  {
    id: 'g011', part: 5, passageId: null, cat: 'gram',
    q: 'Regulations require that every visitor ------- a temporary badge while inside the research facility.',
    choices: ['wears', 'wear', 'wearing', 'has worn'],
    a: 1, exp: 'require that も仮定法現在で原形。every visitor という単数主語に惑わされない。'
  },
  {
    id: 'g012b', part: 5, passageId: null, cat: 'gram',
    q: 'Ms. Tanaka requested that the invoice ------- in euros rather than in yen.',
    choices: ['will be issued', 'be issued', 'is issuing', 'issued'],
    a: 1, exp: 'request that も原形。受動の内容なので be + 過去分詞の原形 be issued。'
  },
  {
    id: 'g013b', part: 5, passageId: null, cat: 'gram',
    q: 'The new packaging line, which ------- last March, has already reduced shipping costs by twelve percent.',
    choices: ['installed', 'was installed', 'has installed', 'installing'],
    a: 1, exp: '先行詞 line は設置される側なので受動態。last March という過去の一点があるので過去形。'
  },
  {
    id: 'g014', part: 5, passageId: null, cat: 'gram',
    q: 'Each of the branch managers ------- responsible for submitting a monthly sales forecast to headquarters.',
    choices: ['are', 'is', 'have been', 'being'],
    a: 1, exp: 'Each of + 複数名詞 は単数扱い。of 以下の複数名詞に引きずられないこと。'
  },
  {
    id: 'g015', part: 5, passageId: null, cat: 'gram',
    q: 'Sales in the eastern region grew ------- than the marketing team had anticipated at the start of the fiscal year.',
    choices: ['more rapid', 'much rapidly', 'far more rapidly', 'the most rapidly'],
    a: 2, exp: 'than があるので比較級、かつ動詞 grew を修飾するので副詞の比較級。far は比較級の強調。'
  },
  {
    id: 'g016', part: 5, passageId: null, cat: 'gram',
    q: '------- the supervisor nor the technicians were informed of the schedule change in advance.',
    choices: ['Either', 'Neither', 'Both', 'Not only'],
    a: 1, exp: 'nor と対になるのは neither。either or / both and / not only but also とペアで覚える。'
  },
  {
    id: 'g017', part: 5, passageId: null, cat: 'gram',
    q: 'Employees ------- travel expenses exceed the monthly limit must obtain written approval from the finance department.',
    choices: ['who', 'whose', 'which', 'whom'],
    a: 1, exp: '直後が無冠詞の名詞で「従業員の交通費」という所有関係なので所有格の whose。'
  },
  {
    id: 'g018', part: 5, passageId: null, cat: 'gram',
    q: 'Although the two proposals appear similar, the pricing structure of the second one is far more detailed than ------- of the first.',
    choices: ['them', 'that', 'those', 'it'],
    a: 1, exp: '比較対象は単数の structure なので、繰り返しを避ける代名詞は that。複数なら those。'
  },
  {
    id: 'e006', part: 5, passageId: null, cat: 'gerund',
    q: 'The finance team is responsible for ------- all reimbursement requests within five business days.',
    choices: ['process', 'processes', 'processing', 'to process'],
    a: 2, exp: '前置詞 for の後ろに動詞を置くときは動名詞。be responsible for -ing の形で押さえる。'
  },
  {
    id: 'e007', part: 5, passageId: null, cat: 'gerund',
    q: 'After reviewing the contract, the legal department suggested ------- the confidentiality clause entirely.',
    choices: ['to rewrite', 'rewriting', 'rewrite', 'rewritten'],
    a: 1, exp: 'suggest は動名詞を目的語に取り、to不定詞は取らない。avoid / consider / recommend も同じ仲間。'
  },
  {
    id: 'e008', part: 5, passageId: null, cat: 'gerund',
    q: 'The plant manager could not afford ------- production while the replacement parts were still in transit.',
    choices: ['halting', 'halt', 'to halt', 'halted'],
    a: 2, exp: 'afford は to不定詞のみを取る（afford to do）。動名詞を取る suggest 型との区別が問われる。'
  },
  {
    id: 'e009', part: 5, passageId: null, cat: 'gerund',
    q: '------- in 1998, Delmar Logistics has grown into the largest freight handler in the region.',
    choices: ['Founding', 'Founded', 'To found', 'Having founded'],
    a: 1, exp: '分詞構文。主語 Delmar Logistics は設立される側なので過去分詞。主語との能動・受動関係で判断する。'
  },
  {
    id: 'e010', part: 5, passageId: null, cat: 'gerund',
    q: 'Please remember ------- the security code before leaving the office, as the alarm activates automatically at ten.',
    choices: ['entering', 'to enter', 'entered', 'having entered'],
    a: 1, exp: 'remember to do =「これからすることを忘れずに」、remember doing =「したことを覚えている」。指示文なので to不定詞。'
  },
  {
    id: 'e011', part: 5, passageId: null, cat: 'gerund',
    q: 'The supplier apologized for ------- us of the delay until the shipment had already left the warehouse.',
    choices: ['not notifying', 'not to notify', 'not notified', 'having not notify'],
    a: 0, exp: '前置詞 for の後は動名詞、否定は動名詞の直前に not を置く（not -ing）。語順が問われる典型。'
  },

  // ================================================================
  // PART 5 追加分（語彙コロケーション・言い換え）
  // ================================================================
  {
    id: 'v022', part: 5, passageId: null, cat: 'colloc',
    q: 'All shipments to overseas branches are ------- to additional customs duties, which are billed separately.',
    choices: ['subject', 'reliant', 'sensitive', 'capable'],
    a: 0, exp: 'be subject to =「〜の対象となる・課される」。関税・手数料・変更などに使う定型。'
  },
  {
    id: 'v023', part: 5, passageId: null, cat: 'colloc',
    q: 'Ms. Delgado asked the accounting team to ------- the discrepancy between the invoice total and the purchase order.',
    choices: ['resolve', 'conclude', 'persuade', 'dedicate'],
    a: 0, exp: 'resolve a discrepancy / an issue =「食い違いを解消する」。persuade は人が目的語。'
  },
  {
    id: 'v024b', part: 5, passageId: null, cat: 'colloc',
    q: 'The new scheduling software has helped the plant ------- production costs by nearly fifteen percent.',
    choices: ['reduce', 'shorten', 'lower down', 'decline'],
    a: 0, exp: 'コスト削減は reduce costs（cut costs も可）。shorten は長さ・時間、decline は自動詞で目的語を取れない。'
  },
  {
    id: 'v025b', part: 5, passageId: null, cat: 'colloc',
    q: 'Employees who wish to attend the leadership seminar must obtain written ------- from their department head.',
    choices: ['permission', 'permit', 'admittance', 'allowance'],
    a: 0, exp: 'obtain written permission =「書面による許可を得る」。permission は不可算。permit は許可証（可算）。'
  },
  {
    id: 'v026b', part: 5, passageId: null, cat: 'colloc',
    q: 'The renovation of the east wing will ------- normal office operations for approximately two weeks.',
    choices: ['disrupt', 'disturb', 'distract', 'disorder'],
    a: 0, exp: '業務やサービスの中断は disrupt operations。disturb は人の静けさ、distract は注意をそらす。'
  },
  {
    id: 'v027b', part: 5, passageId: null, cat: 'colloc',
    q: 'The courier service offers ------- delivery for an extra fee, guaranteeing arrival by the next business day.',
    choices: ['expedited', 'hastened', 'urgent', 'instant'],
    a: 0, exp: 'expedited delivery / shipping =「速達扱いの配送」。物流の定番表現。instant は翌営業日と矛盾。'
  },
  {
    id: 'v028', part: 5, passageId: null, cat: 'colloc',
    q: "The technician's report clearly showed how the humidity in the storage room had ------- the packaging materials.",
    choices: ['affected', 'effected', 'afflicted', 'reflected'],
    a: 0, exp: '「影響を与える」の動詞は affect。effect は動詞では effect change のような限定的用法のみ。'
  },
  {
    id: 'v029', part: 5, passageId: null, cat: 'colloc',
    q: 'Applicants are reminded that the salary figure listed in the posting is ------- and may be adjusted based on experience.',
    choices: ['negotiable', 'arguable', 'refundable', 'debatable'],
    a: 0, exp: '給与が「交渉の余地がある」は negotiable。求人広告で頻出。arguable / debatable は主張についての議論。'
  },
  {
    id: 'v030', part: 5, passageId: null, cat: 'colloc',
    q: 'Hotel guests may ------- the fitness center at no charge simply by presenting their room key.',
    choices: ['access', 'approach', 'enter into', 'reach for'],
    a: 0, exp: '施設やサービスを「利用する」は access（他動詞なので前置詞不要）。enter into は契約や議論に使う。'
  },
  {
    id: 'v031', part: 5, passageId: null, cat: 'colloc',
    q: 'Due to an unexpected ------- of orders following the trade show, the warehouse extended its operating hours.',
    choices: ['surge', 'elevation', 'boost', 'progress'],
    a: 0, exp: 'a surge of / in orders =「注文の急増」。需要や問い合わせの急増に使う。'
  },
  {
    id: 'v032', part: 5, passageId: null, cat: 'colloc',
    q: 'The customer service manual instructs staff to ------- unresolved complaints to a senior representative within 24 hours.',
    choices: ['escalate', 'elevate', 'promote', 'advance'],
    a: 0, exp: '苦情や案件を上位者に引き継ぐのは escalate ~ to ...。elevate は物理的・地位的に高める意味。'
  },
  {
    id: 'v033', part: 5, passageId: null, cat: 'colloc',
    q: '"The store will issue a full refund only if the item is returned unopened within 30 days of purchase." 言い換えると？',
    choices: [
      'Items must be both unopened and returned within a month to qualify for a full refund.',
      'Any item returned within 30 days will receive a full refund regardless of its condition.',
      'Unopened items can be returned at any time for a full refund.',
      'The store gives partial refunds for items opened after 30 days.'
    ],
    a: 0, exp: 'only if は「未開封」と「30日以内」の両方が必要という条件。両条件の同時成立が言い換えの鍵。'
  },
  {
    id: 'v034', part: 5, passageId: null, cat: 'colloc',
    q: '"Mr. Alvarez will be out of the office until Thursday, so please direct any urgent inquiries to Ms. Chen." 言い換えると？',
    choices: [
      "Ms. Chen should be contacted about pressing matters during Mr. Alvarez's absence.",
      'Mr. Alvarez will answer urgent questions after he returns on Thursday.',
      "Ms. Chen has permanently taken over Mr. Alvarez's responsibilities.",
      'Urgent inquiries should be held until Mr. Alvarez comes back.'
    ],
    a: 0, exp: 'direct inquiries to A = A に問い合わせる、urgent = pressing。不在中の代理窓口という趣旨。'
  },
  {
    id: 'v035', part: 5, passageId: null, cat: 'colloc',
    q: '"Registration fees are waived for members who sign up before the early-bird deadline." 言い換えると？',
    choices: [
      'Members who register early do not have to pay the fee.',
      'Members receive a discount on the registration fee if they sign up early.',
      'All participants can register for free until the deadline.',
      'The registration deadline has been extended for members.'
    ],
    a: 0, exp: 'waive a fee =「料金を免除する」。全額不要なので割引（一部負担）とは異なる。'
  },
  {
    id: 'v036', part: 5, passageId: null, cat: 'colloc',
    q: '"The updated software will be installed on all workstations over the weekend to minimize interruptions to daily work." 言い換えると？',
    choices: [
      "The installation is scheduled for the weekend so that employees' regular tasks are affected as little as possible.",
      'Employees will need to install the software themselves before Monday.',
      'The software update was delayed because it interrupted daily work.',
      'Workstations will be unavailable throughout the following week.'
    ],
    a: 0, exp: 'minimize interruptions to daily work =「通常業務への支障を最小限にする」が言い換えの核。'
  },
  {
    id: 'v037', part: 5, passageId: null, cat: 'colloc',
    q: '"Applicants lacking formal certification may still be considered if they can demonstrate equivalent practical experience." 言い換えると？',
    choices: [
      'Candidates without certification can be evaluated when they show comparable hands-on experience.',
      'Only certified applicants will be reviewed by the hiring committee.',
      'Practical experience is valued more highly than formal certification.',
      'Applicants must have both certification and practical experience.'
    ],
    a: 0, exp: 'lacking = without、equivalent = comparable。資格がなくても実務経験があれば対象という条件付きの譲歩。'
  },
  {
    id: 'v038', part: 5, passageId: null, cat: 'colloc',
    q: '"Shipping charges will be added to your invoice unless your order exceeds $500." 言い換えると？',
    choices: [
      'Orders over $500 are not charged for shipping.',
      'A shipping fee of $500 applies to all invoices.',
      'Customers must pay shipping charges on every order.',
      'Orders under $500 qualify for free shipping.'
    ],
    a: 0, exp: 'unless =「〜でない限り」。500ドル超なら送料が加算されない、と条件を裏返して読む。'
  },

  // ================================================================
  // PART 6 追加分
  // ================================================================
  {
    id: 'p6_003_q1', part: 6, passageId: 'p6_003', blankNum: 131, cat: 'colloc',
    q: '空所[131]に入る語句を選んでください。',
    choices: ['disrupted', 'dismissed', 'declined', 'detached'],
    a: 0, exp: '「通常業務が妨げられることはない」という文脈なので disrupt（中断させる）。'
  },
  {
    id: 'p6_003_q2', part: 6, passageId: 'p6_003', blankNum: 132, cat: 'gram',
    q: '空所[132]に入る語句を選んでください。',
    choices: ['will be delivered', 'delivering', 'to deliver', 'has delivered'],
    a: 0, exp: '関係代名詞 that の述語動詞が必要。crates は届けられる側なので受動態、かつ今週水曜の予定なので未来形。'
  },
  {
    id: 'p6_003_q3', part: 6, passageId: 'p6_003', blankNum: 133, cat: 'reading',
    q: '空所[133]に入る最も適切な文を選んでください。',
    choices: [
      'Lockable storage cabinets have been installed along the fifth-floor corridor.',
      'The moving company has requested a copy of the building insurance policy.',
      'Marketing reports for the first quarter are due at the end of this week.',
      'Parking permits for the north garage will expire at the end of March.'
    ],
    a: 0, exp: '直後に「各ユニットには番号があり鍵は月曜に配布」とあるため、鍵付き収納庫の設置を述べる文がつながる。'
  },
  {
    id: 'p6_003_q4', part: 6, passageId: 'p6_003', blankNum: 134, cat: 'prep',
    q: '空所[134]に入る語句を選んでください。',
    choices: ['before', 'among', 'despite', 'along'],
    a: 0, exp: '「金曜午後より前に連絡してください」という期限なので before。'
  },
  {
    id: 'p6_004_q1', part: 6, passageId: 'p6_004', blankNum: 131, cat: 'pos',
    q: '空所[131]に入る語句を選んでください。',
    choices: ['considerably', 'considerable', 'consider', 'consideration'],
    a: 0, exp: '形容詞の比較級 simpler を修飾するので副詞 considerably。'
  },
  {
    id: 'p6_004_q2', part: 6, passageId: 'p6_004', blankNum: 132, cat: 'gram',
    q: '空所[132]に入る語句を選んでください。',
    choices: ['will transfer', 'transferring', 'having transferred', 'to be transferred'],
    a: 0, exp: '主節の述語動詞が必要で、10月1日以降の話なので未来形。他は述語動詞になれない。'
  },
  {
    id: 'p6_004_q3', part: 6, passageId: 'p6_004', blankNum: 133, cat: 'reading',
    q: '空所[133]に入る最も適切な文を選んでください。',
    choices: [
      'The portal will be unavailable from 6:00 P.M. on 30 September until 8:00 A.M. on 1 October.',
      'Our warehouse in the eastern district was expanded earlier this year.',
      'Printed catalogs are no longer mailed to suppliers on a quarterly basis.',
      'Payment terms for all purchase orders remain unchanged at thirty days.'
    ],
    a: 0, exp: '直後に「その期間中は注文をメールで送ってよい」とあるため、ポータルが使えない時間帯を示す文が入る。'
  },
  {
    id: 'p6_004_q4', part: 6, passageId: 'p6_004', blankNum: 134, cat: 'gerund',
    q: '空所[134]に入る語句を選んでください。',
    choices: ['before', 'in order to', 'so that', 'as soon as'],
    a: 0, exp: '後ろが動名詞 placing なので前置詞 before。in order to / so that / as soon as は動名詞を直接取れない。'
  },

  // ================================================================
  // PART 7 追加分
  // ================================================================
  {
    id: 'p7_003_q1', part: 7, passageId: 'p7_003', blankNum: null, cat: 'reading',
    q: 'What is the main purpose of the notice?',
    choices: [
      'To inform tenants about a temporary change in parking arrangements',
      'To announce an increase in monthly parking permit fees',
      'To introduce a new shuttle service operated by the building',
      'To request that tenants renew their visitor passes'
    ],
    a: 0, exp: '冒頭の「the north parking structure will be closed for resurfacing」より、工事に伴う駐車場の一時変更の通知。'
  },
  {
    id: 'p7_003_q2', part: 7, passageId: 'p7_003', blankNum: null, cat: 'reading',
    q: 'What is indicated about the south lot?',
    choices: [
      'It has fewer spaces than the north structure',
      'It is reserved exclusively for visitors',
      'It charges an additional monthly fee',
      'It will also be resurfaced in June'
    ],
    a: 0, exp: '「the south lot has 180 spaces, fewer than the 320 available in the north structure」と明記。'
  },
  {
    id: 'p7_003_q3', part: 7, passageId: 'p7_003', blankNum: null, cat: 'reading',
    q: 'According to the notice, what can the management office NOT do?',
    choices: [
      'Validate parking receipts from Halloway Avenue',
      'Issue visitor passes for the south lot',
      'Accept requests made one business day in advance',
      'Provide information about the closure period'
    ],
    a: 0, exp: '「The building management office cannot validate street parking receipts」より、路上駐車の領収書は認証できない。'
  },
  {
    id: 'p7_004_q1', part: 7, passageId: 'p7_004', blankNum: null, cat: 'reading',
    q: 'Why did Ms. Whitcombe write the e-mail?',
    choices: [
      'To register employees and ask for the amount owed',
      'To cancel a previous registration request',
      'To apply for membership in the Northfield Association',
      'To propose a topic for the networking dinner'
    ],
    a: 0, exp: '「I would like to register three members」「Could you confirm the total amount due」より、登録と金額確認が目的。'
  },
  {
    id: 'p7_004_q2', part: 7, passageId: 'p7_004', blankNum: null, cat: 'reading',
    q: 'What rate will Calderon Freight most likely be charged per attendee?',
    choices: ['$480', '$432', '$360', '$324'],
    a: 1, exp: 'クロス照合問題。7月入会なので登録時点で会員歴6か月未満→会員料金は不可。標準 $480 に3名以上の10%引きが適用され $432。'
  },
  {
    id: 'p7_004_q3', part: 7, passageId: 'p7_004', blankNum: null, cat: 'reading',
    q: 'In Text 2, the word "applicable" is closest in meaning to',
    choices: ['relevant', 'affordable', 'temporary', 'approximate'],
    a: 0, exp: '「off the applicable rate」は「該当する料金から」の意味なので relevant が最も近い。'
  },


  // ================================================================
  // 動詞の語法（動名詞 vs to不定詞）
  //   前置詞+動名詞は機械的に解けるが、動詞ごとの語法は暗記が要る。
  //   実測でこの領域の正答率が最も低かったため厚めに用意している。
  // ================================================================
  {
    id: 'e012', part: 5, passageId: null, cat: 'gerund',
    q: 'The committee considered ------- the deadline, but decided against it in the end.',
    choices: ['to extend', 'extending', 'extend', 'extended'],
    a: 1, exp: 'consider は動名詞のみ。動名詞グループの覚え方「MEGAFEPS」= Mind / Enjoy / Give up / Avoid / Finish / Escape / Postpone / Suggest（＋consider, deny, admit, practice）。'
  },
  {
    id: 'e013', part: 5, passageId: null, cat: 'gerund',
    q: 'Ms. Reyes managed ------- the report before the client meeting began.',
    choices: ['finishing', 'to finish', 'finish', 'finished'],
    a: 1, exp: 'manage は to不定詞のみ（manage to do =「どうにか〜する」）。不定詞グループ: manage / afford / decide / agree / offer / refuse / promise / hope / plan / expect。'
  },
  {
    id: 'e014', part: 5, passageId: null, cat: 'gerund',
    q: 'Would you mind ------- the air conditioning down a little?',
    choices: ['to turn', 'turning', 'turn', 'turned'],
    a: 1, exp: 'mind は動名詞のみ。Part 2 の「Would you mind doing?」→ 承諾は Not at all とセットで押さえる。'
  },
  {
    id: 'e015', part: 5, passageId: null, cat: 'gerund',
    q: 'The supplier refused ------- the defective units without the original receipt.',
    choices: ['replacing', 'to replace', 'replace', 'replaced'],
    a: 1, exp: 'refuse は to不定詞のみ。同じ「断る」でも avoid（避ける）は動名詞なので混同注意。'
  },
  {
    id: 'e016', part: 5, passageId: null, cat: 'gerund',
    q: 'Please remember ------- the alarm when you are the last to leave.',
    choices: ['setting', 'to set', 'set', 'having set'],
    a: 1, exp: 'remember to do =「これから〜するのを忘れずに」、remember doing =「〜したのを覚えている」。指示・依頼の文脈なら to不定詞。'
  },
  {
    id: 'e017', part: 5, passageId: null, cat: 'gerund',
    q: 'I still remember ------- this building for the first time twenty years ago.',
    choices: ['to visit', 'visiting', 'visit', 'to have visited'],
    a: 1, exp: 'こちらは過去の記憶なので remember doing。e016 と対で、意味で使い分ける型として覚える。'
  },
  {
    id: 'e018', part: 5, passageId: null, cat: 'gerund',
    q: 'The technician stopped ------- the manual because the instructions were unclear.',
    choices: ['reading', 'to read', 'read', 'to have read'],
    a: 1, exp: 'stop to do =「〜するために立ち止まる」（目的）、stop doing =「〜するのをやめる」。「説明が不明瞭だったので読むために手を止めた」＝目的なので to read。'
  },
  {
    id: 'e019', part: 5, passageId: null, cat: 'gerund',
    q: 'We regret ------- you that your application was not successful.',
    choices: ['informing', 'to inform', 'inform', 'having informed'],
    a: 1, exp: 'regret to do =「残念ながら今から〜する」、regret doing =「〜したことを後悔する」。通知文の定型は regret to inform。'
  },
  {
    id: 'e020', part: 5, passageId: null, cat: 'gerund',
    q: 'Our team is looking forward to ------- with your firm on the next project.',
    choices: ['work', 'working', 'be working', 'have worked'],
    a: 1, exp: 'look forward to の to は前置詞なので動名詞。to があると不定詞と誤りやすい最頻出の罠。'
  },
  {
    id: 'e021', part: 5, passageId: null, cat: 'gerund',
    q: 'The staff are now used to ------- the new inventory system every morning.',
    choices: ['operate', 'operating', 'operated', 'operation'],
    a: 1, exp: 'be used to doing =「〜に慣れている」（to は前置詞）。used to do =「以前は〜していた」と区別する。'
  },
  {
    id: 'e022', part: 5, passageId: null, cat: 'gerund',
    q: 'Several residents objected to ------- the parking fee without prior notice.',
    choices: ['raise', 'raising', 'be raised', 'have raised'],
    a: 1, exp: 'object to / be committed to / be dedicated to / be opposed to は全て to が前置詞なので動名詞が続く。'
  },
  {
    id: 'e023', part: 5, passageId: null, cat: 'gerund',
    q: 'The firm cannot afford ------- another delay in the construction schedule.',
    choices: ['risking', 'to risk', 'risk', 'risked'],
    a: 1, exp: 'afford は to不定詞のみ（afford to do =「〜する余裕がある」）。can/cannot afford to の形で頻出。'
  },
  {
    id: 'e024', part: 5, passageId: null, cat: 'gerund',
    q: 'The manufacturer denied ------- any safety regulations during the inspection.',
    choices: ['to violate', 'violating', 'violate', 'to have violate'],
    a: 1, exp: 'deny は動名詞のみ（deny doing =「〜したことを否定する」）。refuse to do（依頼を断る）と意味も語法も別物。'
  },
  {
    id: 'e025', part: 5, passageId: null, cat: 'gerund',
    q: 'The department head agreed ------- the proposal at the next board meeting.',
    choices: ['presenting', 'to present', 'present', 'presented'],
    a: 1, exp: 'agree は to不定詞のみ。「同意する」系でも admit は動名詞（admit doing）なので混同しないこと。'
  },

  // ================================================================
  // PART 2 応答問題（リスニング）
  //   q       : 読み上げられる問いかけ（画面には解答後まで出さない）
  //   choices : 応答3つ（Part 2 は本番も3択）
  //   ptype   : 問いかけの種類。解答後のヒント表示に使う
  // ================================================================
  {
    id: 'l001', part: 2, passageId: null, cat: 'listening', ptype: 'wh',
    q: "Who's giving the safety training on Thursday?",
    choices: ['Someone from the head office.', 'Yes, I attended it last year.', 'In the third-floor training room.'],
    a: 0, exp: 'Who疑問文なので「人」を答える。WH疑問文にYes/Noでは答えられない。'
  },
  {
    id: 'l002', part: 2, passageId: null, cat: 'listening', ptype: 'wh',
    q: 'When does the shuttle bus leave for the airport?',
    choices: ['From the north entrance.', 'Every twenty minutes.', 'The flight was delayed.'],
    a: 1, exp: 'When疑問文なので時間・頻度を答える。airport から flight を連想させる引っかけに注意。'
  },
  {
    id: 'l003', part: 2, passageId: null, cat: 'listening', ptype: 'wh',
    q: 'Where did you put the sales report I printed?',
    choices: ["It's on your desk, under the folder.", "I'll print another copy tomorrow.", 'Because the printer was out of paper.'],
    a: 0, exp: 'Where疑問文なので場所を答える。printed/print の同語反復と、Because で始まる誤答が引っかけ。'
  },
  {
    id: 'l004', part: 2, passageId: null, cat: 'listening', ptype: 'wh',
    q: 'How long will the renovation of the lobby take?',
    choices: ['About six weeks, they said.', 'Yes, it looks much better now.', 'Take the elevator to the second floor.'],
    a: 0, exp: 'How long は期間を問う。take の同語反復に釣られないこと。'
  },
  {
    id: 'l005', part: 2, passageId: null, cat: 'listening', ptype: 'yesno',
    q: 'Have you finished reviewing the budget proposal?',
    choices: ['The new review process, I think.', "Not yet, but I'm almost done.", 'At the finance department.'],
    a: 1, exp: 'Yes/No疑問文だが「Not yet」のような部分的な返答が正解になることが多い。'
  },
  {
    id: 'l006', part: 2, passageId: null, cat: 'listening', ptype: 'yesno',
    q: 'Is the conference room available at two o\'clock?',
    choices: ['Let me check the schedule.', "She's a very good speaker.", "No, I didn't book the flight."],
    a: 0, exp: 'Yes/Noを言わない間接応答が正解。「確認します」型の返答に慣れること。'
  },
  {
    id: 'l007', part: 2, passageId: null, cat: 'listening', ptype: 'yesno',
    q: 'Did you get the email about the parking permit?',
    choices: ['Yes, I parked in the garage.', "I haven't checked my inbox yet.", 'The permanent staff only.'],
    a: 1, exp: '間接応答が正解。parking/parked の同語反復、permit/permanent の類似音が引っかけ。'
  },
  {
    id: 'l008', part: 2, passageId: null, cat: 'listening', ptype: 'statement',
    q: 'This copier keeps jamming again.',
    choices: ["I'll call the maintenance company.", 'Yes, I have a copy of it.', 'In the supply closet.'],
    a: 0, exp: '平叙文（不満・報告）には解決策を申し出る応答が自然。copier/copy の類似音が引っかけ。'
  },
  {
    id: 'l009', part: 2, passageId: null, cat: 'listening', ptype: 'statement',
    q: 'I thought the workshop was really useful.',
    choices: ["It's on the fourth floor.", 'So did I, especially the last part.', "No, I don't work there anymore."],
    a: 1, exp: '感想を述べる平叙文には同意の「So did I」。thought に呼応する形。'
  },
  {
    id: 'l010', part: 2, passageId: null, cat: 'listening', ptype: 'statement',
    q: "We're running low on printer paper.",
    choices: ["I'll order some this afternoon.", 'Yes, I ran to the station.', 'The paper was published last month.'],
    a: 0, exp: '在庫不足を伝える平叙文には対応を申し出る応答。running/ran、paper の別義が引っかけ。'
  },
  {
    id: 'l011', part: 2, passageId: null, cat: 'listening', ptype: 'choice',
    q: 'Should I send the invoice by email or by mail?',
    choices: ['Yes, please send it.', 'Email is faster.', 'He sent it yesterday.'],
    a: 1, exp: 'A or B の選択疑問文には原則Yes/Noで答えられない。どちらかを選ぶ応答が正解。'
  },
  {
    id: 'l012', part: 2, passageId: null, cat: 'listening', ptype: 'choice',
    q: 'Do you want to meet before lunch or after?',
    choices: ['At the new restaurant downtown.', 'After would be better for me.', 'No, I already ate.'],
    a: 1, exp: '選択疑問文。before か after のどちらかを選ぶ。lunch からの連想語に注意。'
  },
  {
    id: 'l013', part: 2, passageId: null, cat: 'listening', ptype: 'choice',
    q: 'Is the training online or in person this year?',
    choices: ['Both, actually.', 'Yes, I signed up already.', 'She trains new employees.'],
    a: 0, exp: '選択疑問文には「Both」「Either」といった第三の答えもよく使われる。'
  },
  {
    id: 'l014', part: 2, passageId: null, cat: 'listening', ptype: 'tag',
    q: "You've met our new manager, haven't you?",
    choices: ['Yes, at the staff meeting on Monday.', "The manager's office is upstairs.", "I'll manage it myself."],
    a: 0, exp: '付加疑問文は普通のYes/No疑問文と同じように答える。haven\'t you? に惑わされない。'
  },
  {
    id: 'l015', part: 2, passageId: null, cat: 'listening', ptype: 'tag',
    q: "The store closes at eight, doesn't it?",
    choices: ["It's quite close to here.", "Actually, it's open until nine.", "No, I didn't buy anything."],
    a: 1, exp: '付加疑問文への訂正応答。Yes/Noを使わず事実を訂正するパターン。closes/close の類似音に注意。'
  },
  {
    id: 'l016', part: 2, passageId: null, cat: 'listening', ptype: 'request',
    q: 'Would you mind covering the front desk for an hour?',
    choices: ["Not at all, I'm free until three.", 'Yes, the cover is on the desk.', "It costs about an hour's pay."],
    a: 0, exp: 'Would you mind〜? への承諾は「Not at all」。No系の返答が承諾になる点が最重要。'
  },
  {
    id: 'l017', part: 2, passageId: null, cat: 'listening', ptype: 'request',
    q: "Why don't we take the earlier train tomorrow?",
    choices: ['Because it was crowded.', "That's a good idea.", "He's training the interns."],
    a: 1, exp: "Why don't we〜? は提案表現で理由を聞いていない。Because で答えるのは誤り。"
  },
  {
    id: 'l018', part: 2, passageId: null, cat: 'listening', ptype: 'request',
    q: "Could you forward me the client's contact information?",
    choices: ["Sure, I'll do it right now.", 'The contract expires in June.', 'Yes, they moved forward with it.'],
    a: 0, exp: 'Could you〜? は依頼表現。承諾の「Sure」が自然。contact/contract の類似音が引っかけ。'
  }

];
