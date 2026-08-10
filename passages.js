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
  },

  'p6_003': {
    id: 'p6_003',
    part: 6,
    genre: 'email',
    title: 'オフィス移転の社内メール',
    text: `To: All Marketing Staff
From: Facilities Coordination, Verdaline Solutions
Subject: Relocation to the Fifth Floor

As announced last month, the Marketing Department will be moving to the fifth floor on Saturday, 14 March. Because the move will take place over the weekend, normal operations should not be [131]-------.

Please pack all personal belongings and desk materials into the labeled crates that [132]------- to your workstation this Wednesday. Items left loose on desks cannot be transported by the moving company.

[133]-------. Each unit is numbered, and your key will be distributed by your team leader on Monday morning.

If you require additional crates or have questions about the schedule, contact the Facilities desk at extension 220 [134]------- Friday afternoon.

Thank you for your cooperation.`
  },

  'p6_004': {
    id: 'p6_004',
    part: 6,
    genre: 'notice',
    title: '取引先ポータル刷新の通知',
    text: `NOTICE TO ALL REGISTERED SUPPLIERS

On 1 October, Harrowgate Industrial Supply will launch an upgraded version of its online ordering portal. The new system offers faster order tracking and a [131]------- simpler invoice submission process.

Suppliers will not need to create new accounts. Existing login credentials [132]------- automatically to the upgraded portal. However, all users will be asked to reset their passwords the first time they sign in after the launch date.

[133]-------. During that period, orders may be submitted by e-mail to orders@harrowgatesupply.example.

A recorded training session will be posted on our website in late September. We encourage every account holder to view it [134]------- placing a first order in the new system.

Questions may be directed to the Supplier Relations team.`
  },

  'p7_003': {
    id: 'p7_003',
    part: 7,
    genre: 'notice',
    title: '駐車場閉鎖のテナント向け通知',
    text: `NOTICE TO TENANTS — Riverbend Business Center

Beginning Monday, 5 May, the north parking structure will be closed for resurfacing. The work is expected to last four weeks, and the structure will reopen on Monday, 2 June.

During the closure, tenants holding monthly parking permits may park in the south lot at no additional charge. Please note that the south lot has 180 spaces, fewer than the 320 available in the north structure. For this reason, spaces will be assigned on a first-come, first-served basis, and we strongly encourage carpooling or use of the municipal shuttle, which stops at the main entrance every fifteen minutes between 7:00 A.M. and 9:30 A.M.

Visitors without permits should be directed to the metered street parking on Halloway Avenue. The building management office cannot validate street parking receipts, but visitor passes for the south lot may be requested in advance by contacting the office at least one business day before the visit.

We apologize for the inconvenience and thank you for your patience.`
  },

  'p7_004': {
    id: 'p7_004',
    part: 7,
    genre: 'email',
    title: 'ダブルパッセージ: 参加申込メールと参加規約',
    text: `Text 1

To: Registration Desk, Northfield Logistics Forum
From: Deanna Whitcombe, Operations Manager, Calderon Freight
Subject: Registration for three attendees
Date: 8 September

Hello,

I would like to register three members of our operations team for the Northfield Logistics Forum on 14 November. All three will attend the full two-day program, including the Thursday evening networking dinner.

Our company joined the Northfield Association in July of this year, so I believe we qualify for the reduced rate. I plan to submit payment by company bank transfer on 30 September. Could you confirm the total amount due before that date?

One of our attendees, Mr. Ibarra, uses a wheelchair, so I would appreciate information on accessible seating in the main hall.

Best regards,
Deanna Whitcombe


Text 2

NORTHFIELD LOGISTICS FORUM — REGISTRATION POLICY

Full program (two days, including networking dinner)
- Standard rate: $480 per attendee
- Member rate: $360 per attendee

Single-day pass: $250 (dinner not included)

The member rate applies only to employees of organizations that have held Northfield Association membership for at least six months as of the registration date. Groups of three or more registered together receive an additional 10 percent discount off the applicable rate.

Payment must be received no later than 15 October. Registrations paid by bank transfer require an invoice, which the Registration Desk issues within five business days of a request.

Attendees with accessibility requirements should notify the Registration Desk at least thirty days before the event.`
  }
};
