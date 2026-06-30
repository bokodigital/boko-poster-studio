# Publishing routing — Boko Content Command Center

When asked to **post/schedule approved content**, route each item to the channel below.
Always confirm before any live, public post.

| Platform  | Account / destination                      | Scheduling tool            |
|-----------|--------------------------------------------|----------------------------|
| Facebook  | **Boko Digital Solutions** page            | Meta Business Suite        |
| Instagram | **Boko Digital Solutions** account         | Meta Business Suite        |
| LinkedIn  | **Maria's profile** (Maria Jose Mendieta)  | LinkedIn share composer    |
| YouTube   | **Boko Digital Solutions** channel         | YouTube Studio (manual)    |
| Hubspot   | **Boko Digital** account (email)           | HubSpot email              |

Notes:
- Only posts with status **Approved** are eligible to publish/schedule.
- A post's **Platform** field on the board determines the destination.
- Each card has its own publish control (you review the card details first):
  - **Approved + future date** -> "Schedule" -> opens the destination, copies the
    caption/email, downloads the image, and moves the card to **Scheduled**.
  - **Approved + same day** -> "Publish now" -> same prep, moves to **Published**.
  - **Scheduled** cards show "Mark published" to move them to **Published**.

---

## Automated scheduling (Claude-driven, in-session)

This is **not** a standing background integration - a static site can't post on its
own. Scheduling is performed by **Claude live in a session** using the Claude Chrome
extension. It runs only while you're working with Claude, and **Claude confirms every
post before it goes live**. Claude never enters your credentials.

### Channels wired
- **Facebook + Instagram -> Meta Business Suite** (Boko Digital Solutions). [set up]
- LinkedIn / YouTube / HubSpot: opened for manual scheduling for now; can be wired later.

### To run a scheduling session
1. Move the FB/IG cards you want live into the **Approved** column.
2. Be **logged into Meta Business Suite** (business.facebook.com) as
   Boko Digital Solutions in the same browser.
3. Tell Claude: **"Schedule the approved Facebook/Instagram posts in Meta Business Suite."**

### What Claude does per card
1. Reads the card's caption + hashtags from the board.
2. Renders the card's poster image (PNG) to attach - Instagram requires an image.
3. Opens the Meta Business Suite composer, selects the FB Page / IG account,
   pastes caption + hashtags, uploads the image, and sets the card's scheduled
   date/time (if a card has no time, Claude asks for one).
4. **Stops, shows you the filled composer + the exact date/time, and waits for your
   explicit "yes"** before clicking Schedule.
5. On your confirmation: schedules in Meta, then marks the card **Scheduled** on the
   board (or **Published** if the date is today). Then moves to the next card.

### Limits
- Reels/video are uploaded to YouTube manually by you; Meta video scheduling can be
  added later.
- If you're not logged in, Claude pauses and asks you to sign in.
- Claude schedules one card at a time and confirms each - no bulk auto-posting.
