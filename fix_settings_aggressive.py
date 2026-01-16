#!/usr/bin/env python3
"""
Fix settings-page.tsx by aggressively removing all t() calls and locale usages.
"""

import re

filepath = 'src/app/components/settings-page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove invalid imports and hooks again (just in case)
content = re.sub(r'import\s+{\s*useTranslations.*?}\s+from\s+["\']next-intl["\'];?\n?', '', content)
content = re.sub(r'\s*const\s+t\s*=\s*useTranslations\([^)]+\);?\n?', '', content)
content = re.sub(r'\s*const\s+locale\s*=\s*useLocale\(\);?\n?', '', content)

# 2. Fix labels definition if still using t.raw
content = re.sub(
    r'const\s+labels\s*=\s*t\.raw\("pass\.labels"\);',
    'const labels = { active: "Member", inactive: "Free", PASS_7DAY: "7-Day Pass", PASS_30DAY: "30-Day Pass", PASS_BETA_3DAY: "Beta Unlimited" };',
    content
)

# 3. Aggressive Translation Replacement Map
# We will use regex for these to match t("key") even with whitespace
trans_map = [
    # Payment History
    (r't\("history.title"\)', '"Payment History"'),
    (r't\("history.date"\)', '"Paid At"'),
    (r't\("history.orderId"\)', '"Order ID"'),
    (r't\("history.product"\)', '"Product"'),
    (r't\("history.method"\)', '"Method"'),
    (r't\("history.amount"\)', '"Amount"'),
    (r't\("history.status"\)', '"Status"'),
    (r't\("history.manage"\)', '"Manage"'),
    (r't\("history.paid"\)', '"Paid"'),
    (r't\("history.refunded"\)', '"Refunded"'),
    (r't\("history.refund"\)', '"Refund"'),
    (r't\("history.empty"\)', '"No payment history"'),

    # Danger Zone
    (r't\("danger.title"\)', '"Danger Zone"'),
    (r't\("danger.deleteAccount"\)', '"Delete Account"'),
    (r't\("danger.deleteDesc"\)', '"Deleting your account will permanently remove all data"'),

    # Purchase Section
    (r't\("purchase.title"\)', '"Purchase Pass"'),
    (r't\("purchase.badge"\)', '"🎉 Open Special Offer"'),
    (r't\("purchase.currentlyUsing"\)', '"Currently Using"'),
    (r't\("purchase.recommended"\)', '"Recommended"'),
    (r't\("purchase.pass30"\)', '"30-Day Pass"'),
    (r't\("purchase.pass7"\)', '"7-Day Pass"'),
    (r't\("purchase.off"\)', '"OFF"'),
    (r't\("purchase.unlimitedBenefit"\)', '"All Templates & Unlimited Re-translation"'),
    (r't\("purchase.days30"\)', '"30 Days Free Access"'),
    (r't\("purchase.days7"\)', '"7 Days Trial Access"'),
    (r't\("purchase.buy"\)', '"Purchase Pass"'),
    (r't\("purchase.buyTest"\)', '"Purchase Pass (Test)"'),
    (r't\("purchase.preparing"\)', '"Preparing (Beta)"'),
    (r't\("purchase.notPossible"\)', '"Not Possible"'),
    (r't\("purchase.noLimit"\)', '"No time limit"'),
    (r't\("purchase.requiresPass"\)', '"Pass required"'),
    (r't\("purchase.refill"\)', '"Refill"'),
    (r't\("purchase.refundPolicyLink"\)', '"Cancellation and Refund Policy"'), # Fallback

    # Labels fallback
    (r'labels\.active', '"Member"'),
    (r'labels\.inactive', '"Free"'),
    
    # Currency
    (r'locale\s*===\s*"ko"\s*\?\s*"KRW"\s*:\s*"USD"', '"KRW"'), # Default to KRW context or USD? Keeping KRW for now as code shows KRW
]

for pattern, replacement in trans_map:
    content = re.sub(pattern, replacement, content)

# 4. Handle remaining t.rich calls
content = re.sub(
    r'\{t\.rich\("purchase\.refundPolicyLink"[^}]*\}\)\}',
    r'Check ApplyGogo\'s <a href="/terms" className="underline font-medium">Cancellation and Refund Policy</a> before purchasing.',
    content
)

content = re.sub(
    r'\{t\.rich\("purchase\.betaNotice"[^}]*\}\)\}',
    r'🎉 During the <span className="font-bold">BETA launch period</span>, only the <span className="font-bold">3-day unlimited pass</span> provided upon signup is available. Full passes will be available after official launch!',
    content
)

# 5. Fix any remaining locale usage
content = re.sub(r'locale\s*===\s*"ko"', 'false', content)
content = re.sub(r'locale\s*===\s*"en"', 'true', content)

# 6. Fix specific credits interpolation loop if missed
# {t("purchase.credits", { count: ... })}
content = re.sub(
    r'\{t\("purchase\.credits",\s*\{\s*count:\s*([^}]+)\s*\}\)\}',
    r'{\1} + " Credits included"',
    content
)

# 7. Final cleanup for any unclosed braces or errors from manual replace
content = content.replace('{PLAN_PRODUCTS.PASS_30DAY.credits,} + " Credits included"', '{PLAN_PRODUCTS.PASS_30DAY.credits} + " Credits included"')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Aggressively fixed settings-page.tsx")
