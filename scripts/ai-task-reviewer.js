#!/usr/bin/env node

/**
 * AI Task Reviewer
 * Reviews linked issues and tasks using Gemini API with rate limiting and retry logic
 * Handles quota exceeded errors gracefully
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  maxConcurrentRequests: 1,
};

// Request queue for rate limiting
class RequestQueue {
  constructor(maxConcurrent = 1) {
    this.maxConcurrent = maxConcurrent;
    this.activeRequests = 0;
    this.queue = [];
  }

  async run(task) {
    while (this.activeRequests >= this.maxConcurrent) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.activeRequests++;
    try {
      return await task();
    } finally {
      this.activeRequests--;
    }
  }
}

const requestQueue = new RequestQueue(RATE_LIMIT_CONFIG.maxConcurrentRequests);

/**
 * Call Gemini API with exponential backoff retry logic
 */
async function callGeminiAPIWithRetry(model, prompt, attemptNum = 1) {
  try {
    console.log(`Sending request to Gemini API (attempt ${attemptNum}/${RATE_LIMIT_CONFIG.maxRetries})...`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    const isQuotaExceeded = error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED');
    const isRetryable = isQuotaExceeded || error.status === 500 || error.status === 503;

    if (isRetryable && attemptNum < RATE_LIMIT_CONFIG.maxRetries) {
      // Calculate exponential backoff delay
      const delayMs = Math.min(
        RATE_LIMIT_CONFIG.initialDelayMs * Math.pow(RATE_LIMIT_CONFIG.backoffMultiplier, attemptNum - 1),
        RATE_LIMIT_CONFIG.maxDelayMs
      );

      console.warn(
        `API Error (${error.status || 'UNKNOWN'}): ${error.message}`
      );
      console.log(`Rate limited or temporary error. Retrying in ${delayMs}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      // Recursive retry
      return callGeminiAPIWithRetry(model, prompt, attemptNum + 1);
    }

    // If quota exceeded and no more retries, log and gracefully exit
    if (isQuotaExceeded) {
      console.error('❌ Gemini API Quota Exceeded');
      console.error('Error Details:', error.message);
      console.warn('⚠️  Skipping AI task review due to API quota limit');
      return null;
    }

    // For other errors, throw
    throw error;
  }
}

/**
 * Review a single task with Gemini
 */
async function reviewTask(model, taskData) {
  return await requestQueue.run(async () => {
    const prompt = `
Review this GitHub task/issue and provide constructive feedback:

Title: ${taskData.title}
Description: ${taskData.description}
Labels: ${taskData.labels?.join(', ') || 'None'}
Status: ${taskData.status || 'Open'}

Please provide:
1. Summary of the issue
2. Potential solutions (if applicable)
3. Recommended next steps
4. Any concerns or blockers

Keep response concise and actionable.
    `.trim();

    const response = await callGeminiAPIWithRetry(model, prompt);
    return response;
  });
}

/**
 * Main function to review all linked issues
 */
async function main() {
  try {
    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY environment variable is not set');
      process.exit(1);
    }

    // Initialize Gemini API client
    console.log('📋 Initializing Gemini API client...');
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Get linked issues from GitHub context
    const linkedIssues = getLinkedIssuesFromContext();
    console.log(`Found ${linkedIssues.length} linked issues to review`);

    if (linkedIssues.length === 0) {
      console.log('✅ No linked issues to review');
      process.exit(0);
    }

    // Review each issue
    const reviews = [];
    for (let i = 0; i < linkedIssues.length; i++) {
      const issue = linkedIssues[i];
      console.log(`\n📝 Reviewing issue #${issue.number}: "${issue.title}"...`);
      
      const review = await reviewTask(model, issue);
      
      if (review) {
        reviews.push({ issueNumber: issue.number, review });
        console.log('✅ Review completed');
      } else {
        console.log('⏭️  Review skipped (API quota or error)');
      }
    }

    // Output results
    if (reviews.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('🎯 AI TASK REVIEW RESULTS');
      console.log('='.repeat(60));
      
      reviews.forEach(({ issueNumber, review }) => {
        console.log(`\n📌 Issue #${issueNumber}:`);
        console.log('-'.repeat(40));
        console.log(review);
      });
      
      console.log('\n' + '='.repeat(60));
    }

    console.log('\n✨ AI task review completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Unexpected error in AI task reviewer:');
    console.error(error.message);
    console.error(error);
    process.exit(1);
  }
}

/**
 * Parse linked issues from GitHub context
 * In actual use, this would parse from GitHub Actions environment variables
 */
function getLinkedIssuesFromContext() {
  // Mock data for demonstration
  // In actual workflow, this would be populated from GitHub Actions context
  const linkedIssuesJson = process.env.LINKED_ISSUES_JSON || '[]';
  
  try {
    return JSON.parse(linkedIssuesJson);
  } catch (error) {
    console.warn('Warning: Could not parse linked issues. Using empty array.');
    return [];
  }
}

// Run main function
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  callGeminiAPIWithRetry,
  reviewTask,
  RequestQueue,
  main,
};
