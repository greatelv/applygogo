#!/usr/bin/env python3
"""
Fix resume-edit-page.tsx by removing all translation calls
"""

import re

# Read the file
with open('src/app/components/resume-edit-page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove imports
content = re.sub(r'import\s+{\s*useTranslations.*?}\s+from\s+["\']next-intl["\'];?\n?', '', content)

# Remove useTranslations hook
content = re.sub(r'\s*const\s+t\s*=\s*useTranslations\([^)]+\);?\n?', '', content)

# Translation mappings - comprehensive list
translations = {
    # Tips
    '"tip.title"': '"You can edit content directly by clicking it"',
    '"tip.description"': '"Edit the original content and click the [Sync & Retranslate] button to have AI re-translate according to the changes. Delete unnecessary items using the trash icon."',
    
    # Personal Info
    '"personal.title"': '"Personal Information"',
    '"personal.description"': '"Manage essential details such as name, contact information, and professional summary."',
    '"personal.professionalSummary"': '"Professional Summary"',
    '"personal.name"': '"Name"',
    '"personal.nameKo"': '"Name (Korean)"',
    '"personal.nameEn"': '"Name (English)"',
    '"personal.email"': '"Email"',
    '"personal.emailPlaceholder"': '"Email Address"',
    '"personal.phone"': '"Phone"',
    '"personal.phonePlaceholder"': '"Phone Number"',
    '"personal.links"': '"Links"',
    '"personal.linkLabel"': '"Link Label"',
    '"personal.linkUrl"': '"Link URL"',
    '"personal.addLink"': '"Add Link"',
    '"personal.summaryPlaceholder"': '"Enter a professional summary."',
    
    # Experience
    '"experience.title"': '"Experience"',
    '"experience.description"': '"List your professional experience and key achievements in reverse chronological order."',
    
    # Education
    '"education.title"': '"Education"',
    '"education.description"': '"Provide details about your educational background, starting with the most recent."',
    '"education.empty"': '"Click the {button} button above to add education."',
    
    # Skills
    '"skills.title"': '"Core Skills"',
    '"skills.description"': '"Add your key technical skills or professional competencies as keywords."',
    '"skills.empty"': '"No skills added yet."',
    '"skills.placeholder"': '"New skill"',
    
    # Additional
    '"additional.title"': '"Additional Info"',
    '"additional.description"': '"Add certifications, awards, languages, activities, and other details."',
    '"additional.addCertification"': '"Add Certification"',
    '"additional.empty"': '"Click the {button} button above to add certifications, awards, or activities."',
    
    # Common
    '"title"': '"Edit"',
    '"subtitle"': '"Review and edit the content analyzed by AI."',
    '"original"': '"Original"',
    '"translated"': '"Translated"',
    '"korean"': '"Korean"',
    '"english"': '"English"',
    '"sync_retranslate"': '"Sync & Retranslate"',
    '"processing"': '"Processing..."',
    '"delete"': '"Delete"',
    '"add_item"': '"Add Item"',
    '"next"': '"Next"',
    '"back"': '"Back"',
    '"back_create_new"': '"Start New"',
    '"buy_pass"': '"Purchase Pass"',
    '"alert.success"': '"Saved Successfully"',
    '"alert.error"': '"Error Occurred"',
    '"alert.confirm"': '"OK"',
}

# Apply all translations
for key, value in translations.items():
    # Handle t(key) pattern
    content = content.replace(f't({key})', value)
    # Handle {t(key)} pattern in JSX
    content = content.replace(f'{{t({key})}}', f'{{{value}}}')

# Write back
with open('src/app/components/resume-edit-page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed resume-edit-page.tsx")
