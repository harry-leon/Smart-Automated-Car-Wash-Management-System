# Scripts Directory

This directory contains automation scripts for the AutoWash Pro project.

## ai-task-reviewer.js

AI-powered task reviewer that uses Google's Gemini API to analyze linked GitHub issues and provide automated feedback.

### Features

- ✅ **Rate Limiting**: Implements concurrent request limiting (1 request at a time by default)
- ✅ **Exponential Backoff**: Automatically retries on rate limit errors with exponential backoff (up to 30 seconds)
- ✅ **Graceful Degradation**: Skips review instead of failing when API quota is exceeded
- ✅ **Error Handling**: Comprehensive error handling for various API failure scenarios
- ✅ **Logging**: Detailed console logging for debugging and monitoring

### Configuration

Set the following environment variables:

```bash
# Required
GEMINI_API_KEY=your-gemini-api-key

# Optional (defaults shown)
LINKED_ISSUES_JSON='[]'  # JSON array of issues to review
```

### Usage

```bash
# Direct execution
node scripts/ai-task-reviewer.js

# Via npm (if added to package.json)
npm run review

# Via GitHub Actions (automatic)
# Triggered on pull requests with linked issues
```

### Retry Logic

The script implements exponential backoff for rate-limited requests:

- **Attempt 1**: Immediate (no delay)
- **Attempt 2**: 1,000ms delay (1 second)
- **Attempt 3**: 2,000ms delay (2 seconds)
- **Max delay**: 30,000ms (30 seconds)

### Handling Quota Exceeded Errors

When the Gemini API quota is exceeded (HTTP 429):

1. The script logs the error
2. Displays a warning message
3. **Gracefully exits** (exit code 0) instead of failing
4. This prevents PR checks from being blocked

If you need to fix quota errors:
- Upgrade your Gemini API plan at: https://ai.google.dev/pricing
- Check usage limits at: https://ai.google.dev/gemini-api/docs/rate-limits
- Consider caching results to reduce redundant API calls

### Testing

```bash
# Test with mock data
LINKED_ISSUES_JSON='[{"title":"Test Issue","description":"Test Description","labels":["bug"]}]' \
  node scripts/ai-task-reviewer.js

# Test rate limiting
# Modify RATE_LIMIT_CONFIG in the script for testing different scenarios
```

### Troubleshooting

**Error: GEMINI_API_KEY environment variable is not set**
- Set your Gemini API key before running: `export GEMINI_API_KEY=your-key`

**Error: Module '@google/generative-ai' not found**
- Install dependencies: `npm install @google/generative-ai`

**Error: 429 - API Quota Exceeded**
- This is expected with free tier limits
- The script will gracefully skip the review
- Upgrade your API plan or wait for quota to reset

### Security

- Never commit API keys to version control
- Use GitHub Secrets for sensitive credentials (see `.github/workflows/ai-task-review.yml`)
- The script is marked executable and can be run directly

### Performance

- **Single concurrent request**: Prevents overwhelming the API
- **Configurable delays**: Adjust backoff timing as needed
- **Timeout safeguards**: Each request is monitored for hanging

### Dependencies

- `@google/generative-ai` - Official Google Generative AI SDK

### License

Same as the main project (AutoWash Pro)
