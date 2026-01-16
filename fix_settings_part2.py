#!/usr/bin/env python3
"""
Fix settings-page.tsx - Part 2 (Catch remaining keys)
"""
import re

filepath = 'src/app/components/settings-page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

trans_map = [
    # Refund Section
    (r't\("refund.title"\)', '"Cancellation & Refund Policy"'),
    (r't\("refund.policy1"\)', '"Full refund within 7 days of payment if service is not used"'),
    (r't\("refund.policy2"\)', '"No refund if credits have been used or AI processing has started"'),
    (r't\("refund.policy3"\)', '"This service does not operate a partial refund policy"'),
    (r't\("refund.viewTerms"\)', '"View Full Terms"'),

    # Danger/Confirm Dialogs
    (r't\("danger.warning.title"\)', '"Are you absolutely sure?"'),
    (r't\("danger.warning.cancel"\)', '"Cancel"'),
    (r't\("danger.warning.confirm"\)', '"Continue"'),
    
    (r't\("danger.confirm.title"\)', '"Permanently delete account"'),
    (r't\("danger.confirm.data1"\)', '"All your resumes will be deleted"'),
    (r't\("danger.confirm.data2"\)', '"Your subscription and credits will be forfeited"'),
    (r't\("danger.confirm.data3"\)', '"This action cannot be undone"'),
    (r't\("danger.confirm.desc2"\)', '"Please type DELETE to confirm"'),
    (r't\("danger.confirm.cancel"\)', '"Cancel"'),
    (r't\("danger.confirm.delete"\)', '"Delete Account"'),
    
    (r't\("refundConfirm.title"\)', '"Request Refund?"'),
    (r't\("refundConfirm.desc"\)', '"Refund will be processed according to our policy. This may take 3-5 business days."'),
    (r't\("refundConfirm.cancel"\)', '"Cancel"'),
    (r't\("refundConfirm.confirm"\)', '"Request Refund"'),
]

for pattern, replacement in trans_map:
    content = re.sub(pattern, replacement, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed remaining t() calls in settings-page.tsx")
