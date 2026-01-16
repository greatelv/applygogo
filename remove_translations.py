#!/usr/bin/env python3
"""
Remove next-intl translations and replace with hardcoded English text.
This script processes TypeScript/TSX files to remove useTranslations calls
and replace t() function calls with hardcoded English strings.
"""

import re
import sys

def process_file(filepath):
    """Process a single file to remove translations."""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove import statements
    content = re.sub(r'import\s+{\s*useTranslations.*?}\s+from\s+["\']next-intl["\'];?\n?', '', content)
    content = re.sub(r'import\s+{\s*useLocale.*?}\s+from\s+["\']next-intl["\'];?\n?', '', content)
    content = re.sub(r',\s*useLocale', '', content)
    content = re.sub(r',\s*useTranslations', '', content)
    
    # Remove useTranslations hook declarations
    content = re.sub(r'\s*const\s+t\s*=\s*useTranslations\([^)]+\);?\n?', '', content)
    content = re.sub(r'\s*const\s+locale\s*=\s*useLocale\(\);?\n?', '', content)
    
    # Common translation mappings for Settings page
    translations = {
        # Settings
        't("title")': '"Settings"',
        't("subtitle")': '"Manage your account information and billing in one place"',
        
        # Account
        't("account.title")': '"Account & Pass"',
        't("account.userName")': '"Username"',
        't("account.email")': '"Email"',
        't("account.createdAt")': '"Joined At"',
        
        # Pass
        't("pass.title")': '"Pass Information"',
        't("pass.status")': '"Pass Status"',
        't("pass.credits")': '"Remaining Credits"',
        't("pass.expiry")': '"Expiry Date"',
        't("pass.usagePeriod")': '"Usage Period"',
        't("pass.unlimited")': '"Unlimited"',
        't("pass.notAvailable")': '"No Info"',
        't("pass.expiringSoon")': '"Expiring Soon"',
        't("pass.paymentMethod")': '"Last Payment Method"',
        't("pass.tossPay")': '"Toss Pay"',
        't("pass.creditCard")': '"Credit Card"',
        't("pass.placeholderCard")': '"**** **** **** ****"',
        't("pass.upgradeTip")': '"💡 Purchase a pass to get all templates and unlimited re-translations"',
        
        # Purchase
        't("purchase.title")': '"Purchase Pass"',
        't("purchase.badge")': '"🎉 Open Special Offer"',
        't("purchase.currentlyUsing")': '"Currently Using"',
        't("purchase.recommended")': '"Recommended"',
        't("purchase.pass30")': '"30-Day Pass"',
        't("purchase.pass7")': '"7-Day Pass"',
        't("purchase.refill")': '"Credit Refill"',
        't("purchase.off")': '"OFF"',
        't("purchase.unlimitedBenefit")': '"All Templates & Unlimited Re-translation"',
        't("purchase.days30")': '"30 Days Free Access"',
        't("purchase.days7")': '"7 Days Trial Access"',
        't("purchase.noLimit")': '"No Time Limit"',
        't("purchase.requiresPass")': '"Requires Pass"',
        't("purchase.buy")': '"Purchase Pass"',
        't("purchase.buyTest")': '"Purchase Pass (Test)"',
        't("purchase.preparing")': '"Preparing (Beta)"',
        't("purchase.notPossible")': '"Not Possible"',
        't("purchase.betaNotice")': '"🎉 During the **BETA launch period**, only the **3-day unlimited pass** provided upon signup is available. Full passes will be available after official launch!"',
        't("purchase.refundPolicyLink")': '"Check ApplyGogo\'s [Cancellation and Refund Policy](/terms) before purchasing."',
        
        # Refund
        't("refund.title")': '"Cancellation & Refund Policy"',
        't("refund.policy1")': '"Full refund within 7 days of payment if service is not used"',
        't("refund.policy2")': '"No refund if credits have been used or AI processing has started"',
        't("refund.policy3")': '"This service does not operate a partial refund policy"',
        't("refund.viewTerms")': '"View Full Terms"',
        
        # History
        't("history.title")': '"Payment History"',
        't("history.date")': '"Paid At"',
        't("history.orderId")': '"Order ID"',
        't("history.product")': '"Product"',
        't("history.method")': '"Method"',
        't("history.amount")': '"Amount"',
        't("history.status")': '"Status"',
        't("history.manage")': '"Manage"',
        't("history.paid")': '"Paid"',
        't("history.refunded")': '"Refunded"',
        't("history.refund")': '"Refund"',
        't("history.empty")': '"No payment history"',
        
        # Danger
        't("danger.title")': '"Danger Zone"',
        't("danger.deleteAccount")': '"Delete Account"',
        't("danger.deleteDesc")': '"Deleting your account will permanently remove all data"',
        
        # Edit page
        't("title")': '"Edit"',
        't("subtitle")': '"Review and edit the content analyzed by AI."',
        't("original")': '"Original"',
        't("translated")': '"Translated"',
        't("korean")': '"Korean"',
        't("english")': '"English"',
        't("sync_retranslate")': '"Sync & Retranslate"',
        't("processing")': '"Processing..."',
        't("delete")': '"Delete"',
        't("add_item")': '"Add Item"',
        't("next")': '"Next"',
        't("back")': '"Back"',
        't("back_create_new")': '"Start New"',
    }
    
    # Apply translations
    for key, value in translations.items():
        content = content.replace(key, value)
    
    # Handle t.raw() calls
    content = re.sub(r't\.raw\([^)]+\)', '{}', content)
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Processed: {filepath}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 remove_translations.py <file1> <file2> ...")
        sys.exit(1)
    
    for filepath in sys.argv[1:]:
        try:
            process_file(filepath)
        except Exception as e:
            print(f"Error processing {filepath}: {e}")
