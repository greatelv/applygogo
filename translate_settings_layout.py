#!/usr/bin/env python3
"""
Translate settings-page.tsx to English while preserving layout
"""

import re

filepath = 'src/app/components/settings-page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove next-intl imports
content = re.sub(r'import\s+{\s*useTranslations.*?}\s+from\s+["\']next-intl["\'];?\n?', '', content)

# 2. Remove hooks
content = re.sub(r'\s*const\s+t\s*=\s*useTranslations\([^)]+\);?\n?', '', content)
content = re.sub(r'\s*const\s+locale\s*=\s*useLocale\(\);?\n?', '', content)

# 3. Handle specific object definitions (labels)
# Replace `const labels = t.raw("pass.labels");` with hardcoded object
content = re.sub(
    r'const\s+labels\s*=\s*t\.raw\("pass\.labels"\);',
    'const labels = { active: "Member", inactive: "Free", PASS_7DAY: "7-Day Pass", PASS_30DAY: "30-Day Pass", PASS_BETA_3DAY: "Beta Unlimited" };',
    content
)

# 4. Define translation map
translations = {
    # Page Title
    't("title")': '"Settings"',
    't("subtitle")': '"Manage your account information and billing in one place"',
    
    # Account Section
    't("account.title")': '"Account & Pass"',
    't("account.userName")': '"Username"',
    't("account.email")': '"Email"',
    't("account.createdAt")': '"Joined At"',
    
    # Pass Information
    't("pass.title")': '"Pass Information"',
    't("pass.status")': '"Pass Status"',
    't("pass.expiringSoon")': '"Expiring Soon"',
    't("pass.credits")': '"Remaining Credits"',
    't("pass.expiry")': '"Expiry Date"',
    't("pass.usagePeriod")': '"Usage Period"',
    't("pass.unlimited")': '"Unlimited"',
    't("pass.notAvailable")': '"No Info"',
    't("pass.paymentMethod")': '"Last Payment Method"',
    't("pass.tossPay")': '"Toss Pay"',
    't("pass.creditCard")': '"Credit Card"',
    't("pass.placeholderCard")': '"**** **** **** ****"',
    't("pass.upgradeTip")': '"💡 Purchase a pass to get all templates and unlimited re-translations"',
    
    # Purchase Section
    't("purchase.title")': '"Purchase Pass"',
    't("purchase.badge")': '"🎉 Open Special Offer"',
    't("purchase.currentlyUsing")': '"Currently Using"',
    't("purchase.recommended")': '"Recommended"',
    't("purchase.pass30")': '"30-Day Pass"',
    't("purchase.pass7")': '"7-Day Pass"',
    't("purchase.off")': '"OFF"',
    't("purchase.credits", {': '"Credits included", {', # Simplify complex interpolation if possible or handle manually
    
    # Needs special handling for t("purchase.credits", ...)
    
    't("purchase.unlimitedBenefit")': '"All Templates & Unlimited Re-translation"',
    't("purchase.days30")': '"30 Days Free Access"',
    't("purchase.days7")': '"7 Days Trial Access"',
    't("purchase.buy")': '"Purchase Pass"',
    't("purchase.buyTest")': '"Purchase Pass (Test)"',
    't("purchase.preparing")': '"Preparing (Beta)"',
    't("purchase.notPossible")': '"Not Possible"',
    't("purchase.refundPolicyLink")': '"Check ApplyGogo\'s [Cancellation and Refund Policy](/terms) before purchasing."',
    
    # Payment History
    't("history.title")': '"Payment History"',
    't("history.date")': '"Paid At"',
    't("history.product")': '"Product"',
    't("history.method")': '"Method"',
    't("history.amount")': '"Amount"',
    't("history.status")': '"Status"',
    't("history.manage")': '"Manage"',
    't("history.paid")': '"Paid"',
    't("history.refunded")': '"Refunded"',
    't("history.refund")': '"Refund"',
    't("history.empty")': '"No payment history"',
    
    # Danger Zone
    't("danger.title")': '"Danger Zone"',
    't("danger.deleteAccount")': '"Delete Account"',
    't("danger.deleteDesc")': '"Deleting your account will permanently remove all data"',
    
    # Labels (fallback)
    'labels.active': '"Member"',
    'labels.inactive': '"Free"',
}

# 5. Apply simple replacements
for key, value in translations.items():
    if 'purchase.credits' not in key: # Skip complex one for loop
        content = content.replace(key, value)

# 6. Handle complex interpolations manually using regex
# Example: {t("purchase.credits", { count: ... })} -> {PLAN_PRODUCTS...credits} Credits included
content = re.sub(
    r'\{t\("purchase\.credits",\s*\{\s*count:\s*([^}]+)\s*\}\)\}',
    r'{\1} + " Credits included"',
    content
)

# Handle rich text replacements (links)
# {t.rich("purchase.refundPolicyLink", ...)}
# This is tricky. We'll replace the whole block with static JSX if we can match it, 
# or just simplify it to text + link.
# Looking at the file, it's usually inside a <p>.
# easier: replace the t.rich call with the English JSX equivalent.

content = re.sub(
    r'\{t\.rich\("purchase\.refundPolicyLink",\s*\{[^}]*\}\)\}',
    r'Check ApplyGogo\'s <a href="/terms" className="underline font-medium">Cancellation and Refund Policy</a> before purchasing.',
    content
)

# Handle beta notice rich text if exists
content = re.sub(
    r'\{t\.rich\("purchase\.betaNotice",\s*\{[^}]*\}\)\}',
    r'🎉 During the <span class="font-bold">BETA launch period</span>, only the <span class="font-bold">3-day unlimited pass</span> provided upon signup is available. Full passes will be available after official launch!',
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Restored layout and translated settings-page.tsx")
