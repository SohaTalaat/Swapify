# Embedding Service Setup Guide

Your application now supports **OpenAI** and **Google Gemini** for semantic embeddings.

## Quick Setup (5 minutes)

### 1. Get OpenAI API Key (Recommended - Free $5 credits)

1. Go to: https://platform.openai.com/signup
2. Create an account
3. Navigate to: https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)
6. Update your `.env`:
   ```
   OPENAI_API_KEY=sk-proj-your_key_here
   ```

**Cost**: Free $5 trial, then $0.04 per 1M input tokens (~$0.01 for embedding 10,000 small items)

---

### 2. Get Google Gemini API Key (Free tier available)

1. Go to: https://makersuite.google.com/app/apikeys
2. Sign in with Google account
3. Click "Create API key" (or use existing)
4. Copy the key
5. Update your `.env`:
   ```
   GEMINI_API_KEY=your_key_here
   ```

**Cost**: Free tier available (generous limits)

---

## How It Works

The service will try **in this order**:

1. ✅ **OpenAI** (text-embedding-3-small model)

   - Fast, reliable, excellent quality
   - Resized to 384 dimensions for consistency

2. ✅ **Google Gemini** (embedding-001 model)

   - Free tier available
   - Good quality embeddings

3. ⚠️ **Hash-based fallback** (if both APIs fail)
   - No external API needed
   - But not real semantic embeddings

---

## Testing

```bash
# Generate embeddings for all listings
php artisan generate:embeddings

# Check logs to see which provider was used
tail -20 storage/logs/laravel.log | grep "✅"
```

You should see output like:

```
Listing #1 => ✅ OK
Listing #2 => ✅ OK
...
✅ Done generating embeddings!
```

---

## Troubleshooting

### "OpenAI embedding failed [status 401]"

- Check your API key is correct and not expired
- Regenerate key from https://platform.openai.com/api-keys

### "Gemini embedding failed [status 401]"

- Check your API key is correct
- Verify at https://makersuite.google.com/app/apikeys

### Falls back to hash-based embedding

- Both APIs are failing
- Check logs: `tail storage/logs/laravel.log`
- Verify `.env` has valid API keys

---

## Pricing

| Provider       | Free Tier       | Cost                            |
| -------------- | --------------- | ------------------------------- |
| OpenAI         | $5 trial        | $0.04 per 1M tokens             |
| Gemini         | Yes (generous)  | Free tier + paid                |
| Local (Ollama) | Yes (unlimited) | Free (but requires local setup) |

---

## Environment Variables

```env
# Required - choose at least one
OPENAI_API_KEY=sk-proj-your_key
GEMINI_API_KEY=your_key

# Optional - used if you set up Ollama locally
EMBEDDING_API_URL=http://localhost:11434/api/embed
```

---

**Questions?** Check the service code at:
`app/Services/Recommendation/HFEmbeddingService.php`
