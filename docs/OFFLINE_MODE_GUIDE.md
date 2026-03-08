# Offline Mode Guide - Wedding Sticker Designer

This guide explains how the wedding sticker assistant works offline without requiring internet or Ollama AI.

---

## Overview

The app has **two modes** for understanding user messages:

| Mode | When Used | Speed |
|------|-----------|-------|
| **Online (Ollama)** | When Ollama server is running at `http://127.0.0.1:11434` | ~1-3 seconds |
| **Offline (Local)** | When Ollama is unavailable | Instant |

---

## How Offline Mode Works

When Ollama is unavailable, the app uses **pattern-based extraction** to understand what users type. It looks for specific patterns in the text to extract:

> **Note:** All offline responses include a 1 second delay to feel more natural (not instant/robotic).

### 1. Title/Blessing (Optional)
The heading at the top of the sticker.

**Recognized patterns:**
- "Alhamdulillah wedding ceremony"
- "Congratulations on your wedding"
- "Masha Allah wedding"
- "Barakallah wedding"
- "Best wishes on your wedding"
- "With prayers on your wedding"

**Examples:**
```
User: "alhamdulillah wedding ceremony"
→ Extracts: title = "Alhamdulillah Wedding Ceremony"

User: "congratulations on your wedding"
→ Extracts: title = "Congratulations On Your Wedding"
```

---

### 2. Names (Required)
The bride and groom names.

**Recognized patterns:**
- "Name1 & Name2"
- "Name1 and Name2"
- "Name1 with Name2"
- Full names supported: "Yahaya Suleiman & Haruna Mohammed"

**Examples:**
```
User: "John & Sarah"
→ Extracts: name1 = "John", name2 = "Sarah"

User: "Muhammad and Fatima"
→ Extracts: name1 = "Muhammad", name2 = "Fatima"

User: "Yahaya Suleiman & Haruna Mohammed"
→ Extracts: name1 = "Yahaya Suleiman", name2 = "Haruna Mohammed"
```

---

### 3. Date (Required)
The wedding date.

**Recognized formats:**
- "6th March, 2020"
- "15th April 2025"
- "March 6, 2020"
- "April 15, 2025"
- "6/3/2020" or "15-04-2025"
- "on 6th March" (without year)

**Examples:**
```
User: "wedding is on 15th January, 2025"
→ Extracts: date = "15th January, 2025"

User: "date is March 20, 2025"
→ Extracts: date = "March 20, 2025"
```

---

### 4. Courtesy/Family Name (Optional)
The family name shown at the bottom of the sticker.

**Recognized patterns:**
- "courtesy Rahman family"
- "from the Johnson family"
- "by the Smith family"
- "the Anderson family"

**Examples:**
```
User: "courtesy Musa family"
→ Extracts: courtesy = "courtesy Musa family"

User: "from the Rahman family"
→ Extracts: courtesy = "from the Rahman family"
```

---

## Complete Message Example

You can provide all information in one message:

```
User: "Alhamdulillah wedding ceremony for Ahmad & Zainab on 5th January 2025, courtesy Musa family"

→ Extracts:
   title = "Alhamdulillah Wedding Ceremony"
   name1 = "Ahmad"
   name2 = "Zainab"
   date = "5th January 2025"
   courtesy = "courtesy Musa family"
```

---

## Quick Shortcuts (Always Work Offline)

These responses work instantly without any AI:

| User Says | Assistant Response |
|-----------|-------------------|
| "hi", "hello", "hey" | Friendly greeting with time of day |
| "assalamualaikum", "salam" | "Wa alaikum assalam!" |
| "who are you?" | Introduction as wedding sticker assistant |
| "what can you do?" | Explains the 4 template fields |
| "help" | Shows how to create a sticker |
| "let's start" | Prompts for names and date |
| "how much?" | Explains the service is free |

---

## Setting Up Ollama (Optional)

For smarter AI responses, install Ollama:

### Windows
1. Download from https://ollama.ai
2. Install and run
3. Open terminal and run:
   ```
   ollama pull qwen2.5:0.5b
   ```
4. The app will automatically detect Ollama at `http://127.0.0.1:11434`

### Verify Ollama is Running
Open browser and go to: `http://127.0.0.1:11434`
You should see: "Ollama is running"

---

## Troubleshooting

### App says "Ollama unavailable"
- Make sure Ollama is installed and running
- Check if `http://127.0.0.1:11434` is accessible
- Try restarting Ollama

### Names not being extracted
- Use "&" or "and" between names: "John & Mary"
- Capitalize first letters: "Ahmad & Fatima"

### Date not being extracted
- Use full month names: "15th January, 2025"
- Or use format: "January 15, 2025"

### Courtesy not being extracted
- Include "family" keyword: "courtesy Rahman family"
- Or use "from the" pattern: "from the Smith family"

---

## Template Fields Reference

| Field | Required | SVG Element IDs |
|-------|----------|-----------------|
| Title | No | `blessing-text`, `occasion-text`, `event-type-text`, `ceremony-text` |
| Name 1 | Yes | `name1-first` (in `wedding-names-group`) |
| Name 2 | Yes | `name2-first` (in `wedding-names-group`) |
| Date | Yes | `date-text` |
| Courtesy | No | `courtesy-text` |

---

## Best Practices for Offline Use

1. **Be specific** - Include all details in one message when possible
2. **Use clear separators** - Use "&" or "and" for names
3. **Include full dates** - "15th January, 2025" works better than "next week"
4. **Use keywords** - "courtesy", "family", "from the" help identify family names

---

*Last updated: December 2025*
