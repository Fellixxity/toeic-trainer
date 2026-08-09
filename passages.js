'use strict';
/**
 * TOEIC Part 6 & Part 7 パッセージデータ
 *
 * 各パッセージの構造:
 *   id     : パッセージ一意ID (例: 'p6_001', 'p7_001')
 *   part   : 6 または 7
 *   title  : 文書のタイトル/種類（例: '社内連絡メモ', '顧客宛Eメール'）
 *   genre  : memo / email / article / notice / advertisement
 *   text   : パッセージ本文（Part 6 の場合は [131] のような空所プレースホルダーを含む）
 */
const PASSAGE_BANK = {
  // ================================================================
  // Part 6 (長文穴埋め)
  // ================================================================
  'p6_001': {
    id: 'p6_001',
    part: 6,
    genre: 'memo',
    title: '社内オフィス移転通知メモ',
    text: `To: All Headquarters Staff
From: Facilities Management
Date: October 12
Subject: Upcoming Office Renovation

Please be advised that the main office building will undergo extensive renovations starting next month. [131]-------, the second and third floors will be completely closed during the construction period.

All departmental staff currently working on these floors are required to move to temporary work spaces on the fifth floor by Friday, October 28. [132]------- packing materials will be distributed by the facilities team starting tomorrow morning. Please ensure that all personal belongings and sensitive documents are packed securely before your departure.

We understand that this relocation may cause temporary inconvenience. [133]-------. Your cooperation and patience during this transition are greatly [134]-------.

If you have any questions regarding IT setup or desk assignments, please contact the Help Desk.`
  },
  'p6_002': {
    id: 'p6_002',
    part: 6,
    genre: 'email',
    title: '新サービス登録お礼メール',
    text: `Dear Ms. Harrison,

Thank you for registering for Apex Cloud Solutions. We are delighted to welcome you as a premium member of our enterprise platform.

Your subscription gives you unlimited access to our advanced analytics tools and 24/7 technical support. [131]-------. To help you get started quickly, we have scheduled a free introductory webinar for new users next Tuesday at 10:00 A.M.

If you wish to participate, please click the confirmation link in this email to [132]------- your seat. Space is limited, so early registration is highly [133]-------.

Should you encounter any technical issues, our support team is readily [134]------- via live chat or phone.`
  },

  // ================================================================
  // Part 7 (読解問題)
  // ================================================================
  'p7_001': {
    id: 'p7_001',
    part: 7,
    genre: 'email',
    title: '製品配送遅延とお詫びEメール',
    text: `From: Customer Service <support@luminaelectronics.com>
To: David Miller <dmiller@email.com>
Date: November 4
Subject: Update on Order #48291

Dear Mr. Miller,

Thank you for your recent purchase with Lumina Electronics. We are writing to provide you with an update regarding your order #48291, placed on November 1.

Due to an unexpectedly high volume of orders during our anniversary promotional sale, the shipment of your UltraSound Wireless Headphones has been delayed by two business days. We originally estimated that your package would ship on November 3, but it is now scheduled to leave our fulfillment center on November 5.

Once your package has shipped, you will receive an automated email containing your tracking number so that you can monitor the status of your delivery.

We sincerely apologize for this unexpected delay and any inconvenience it may cause. As a token of our appreciation for your patience, we have applied a $15 credit voucher to your account, which can be used toward any future purchase on our website.

If you have any further questions or if you wish to modify your order, please do not hesitate to reply directly to this email or call customer support at 1-800-555-0199.

Sincerely,
Sarah Jenkins
Customer Relations Specialist
Lumina Electronics`
  },
  'p7_002': {
    id: 'p7_002',
    part: 7,
    genre: 'advertisement',
    title: 'ビジネス講座受講者募集広告',
    text: `EXECUTIVE LEADERSHIP WORKSHOP
Hosted by the International Management Institute (IMI)

Date: December 8-9 (Two-day intensive course)
Location: Grand Hyatt Hotel, Downtown Chicago
Registration Fee: $650 (Includes all course materials, daily lunch, and networking reception)

Are you ready to take your management career to the next level? Join industry experts for an interactive two-day workshop designed for mid-level managers and aspiring executives.

Key Topics Covered:
- Strategic decision-making in volatile markets
- Effective cross-cultural team management
- Digital transformation and innovation leadership

Special Offer: Register before November 15 to receive an Early Bird Discount of 15% off the standard registration fee. Group discounts are also available for organizations registering three or more employees together.

For complete program details and online registration, please visit our website at www.imi-workshops.org/leadership.`
  }
};
