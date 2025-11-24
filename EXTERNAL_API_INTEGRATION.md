# External Multi-Agent Chat API Integration Guide

This guide explains how to connect the Tharawat frontend to an external multi-agent chat API system.

## Overview

The frontend supports two modes:
1. **Supabase Functions** (default) - Uses Supabase Edge Functions
2. **External API** - Connects to your custom multi-agent API

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Set to 'true' to use external API
VITE_USE_EXTERNAL_CHAT_API=false

# Your external chat API endpoint
VITE_EXTERNAL_CHAT_API_URL=https://your-api-domain.com
```

## External API Requirements

### 1. Authentication

Your API must validate Supabase JWT tokens:

```typescript
// Example middleware
const token = request.headers.authorization?.replace('Bearer ', '');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const { data: { user }, error } = await supabase.auth.getUser(token);

if (error || !user) {
  return { error: 'Unauthorized', status: 401 };
}
```

### 2. Required Endpoints

#### POST /api/chat/send-message

Send a user message and get AI response.

**Request:**
```json
{
  "message": "What's my portfolio performance?",
  "userId": "uuid",
  "chatId": "uuid",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Hello",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "role": "assistant",
      "content": "Hi! How can I help?",
      "created_at": "2024-01-01T00:00:01Z"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": "Your portfolio has gained 12.5% this month...",
  "metadata": {
    "agents_used": ["portfolio", "data_analyst"],
    "execution_time_ms": 2500,
    "original_language": "ar"
  },
  "ui_components": {
    "show_finances": false,
    "show_portfolio": true,
    "show_asset_detail": null
  }
}
```

#### GET /api/chat/conversations/:userId

Fetch all conversations for a user.

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Portfolio Analysis",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### GET /api/chat/messages/:chatId

Fetch all messages in a conversation.

**Response:**
```json
[
  {
    "id": "uuid",
    "chat_id": "uuid",
    "user_id": "uuid",
    "role": "user",
    "content": "Show my portfolio",
    "created_at": "2024-01-01T00:00:00Z",
    "metadata": {}
  }
]
```

#### POST /api/chat/conversations

Create a new conversation.

**Request:**
```json
{
  "userId": "uuid",
  "title": "New Chat"
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "New Chat",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### DELETE /api/chat/conversations/:chatId

Delete a conversation.

**Response:**
```json
{
  "success": true
}
```

## Database Access

Your external API needs access to Supabase to fetch user financial data:

### Required Connection Details

```typescript
const SUPABASE_URL = "https://nuslehifiiopxqggsejl.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key"; // Store securely!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
```

### User Financial Data Query

```typescript
async function getUserFinancialData(userId: string) {
  // Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Personal Finances
  const { data: finances } = await supabase
    .from('personal_finances')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Debts
  const { data: debts } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', userId);

  // Income Streams
  const { data: income } = await supabase
    .from('income_streams')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  // Expense Streams
  const { data: expenses } = await supabase
    .from('expense_streams')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  // Portfolios with Assets
  const { data: portfolios } = await supabase
    .from('portfolios')
    .select(`
      *,
      assets (*)
    `)
    .eq('user_id', userId);

  // Deposits
  const { data: deposits } = await supabase
    .from('deposits')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active');

  // Financial Goals
  const { data: goals } = await supabase
    .from('financial_goals')
    .select('*')
    .eq('user_id', userId);

  return {
    profile,
    finances,
    debts,
    income,
    expenses,
    portfolios,
    deposits,
    goals
  };
}
```

## Multi-Agent System Architecture

Your external API should implement the same multi-agent architecture:

### 1. Translator Agent
- Detects language (Arabic/English)
- Translates user query to English for processing
- Translates final response back to user's language

### 2. Router Agent
- Analyzes user intent
- Determines which agents to invoke
- Creates execution plan

### 3. Specialized Agents

- **Finance Agent**: Personal finance queries, budgeting
- **Portfolio Agent**: Investment portfolio analysis
- **Data Analyst Agent**: Financial data analysis, trends
- **Summarizer Agent**: Summarize news, articles
- **Creative Agent**: General conversation, greetings
- **Scam Agent**: Detect scam attempts in queries

### 4. Orchestrator Agent
- Combines outputs from multiple agents
- Ensures coherent response
- Follows execution plan from router

## Security Requirements

### 1. API Key Storage

Store all sensitive keys securely:
- `SUPABASE_SERVICE_ROLE_KEY` (critical!)
- `GROQ_API_KEY` or `OPENAI_API_KEY`
- `GOOGLE_SEARCH_API_KEY` (if using web search)
- `FIRECRAWL_API_KEY` (if using web scraping)

### 2. Rate Limiting

Implement rate limiting to prevent abuse:
```typescript
// Example: 60 requests per minute per user
const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator: (req) => req.user.id
});
```

### 3. Input Validation

Validate all inputs:
```typescript
const messageSchema = z.object({
  message: z.string().min(1).max(5000),
  userId: z.string().uuid(),
  chatId: z.string().uuid(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    created_at: z.string().optional()
  })).max(50) // Limit history size
});
```

## Error Handling

Return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 500
}
```

Common error codes:
- `UNAUTHORIZED` (401): Invalid/missing token
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `VALIDATION_ERROR` (400): Invalid input
- `INTERNAL_ERROR` (500): Server error

## Testing

### 1. Test with Supabase Functions First

```env
VITE_USE_EXTERNAL_CHAT_API=false
```

### 2. Switch to External API

```env
VITE_USE_EXTERNAL_CHAT_API=true
VITE_EXTERNAL_CHAT_API_URL=https://your-api-domain.com
```

### 3. Verify Functionality

- User authentication works
- Chat history loads correctly
- AI responses are generated
- UI components display properly
- Error handling works

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Supabase service role key securely stored
- [ ] All API endpoints implemented
- [ ] Authentication middleware in place
- [ ] Rate limiting configured
- [ ] Error handling implemented
- [ ] Database queries optimized
- [ ] CORS configured properly
- [ ] Logging set up
- [ ] Monitoring and alerts configured

## Support

For questions or issues:
1. Check this documentation
2. Review existing Supabase functions in `/supabase/functions/`
3. Test with Supabase functions first
4. Contact support@yourdomain.com

## Example External API Structure

```
your-api/
├── src/
│   ├── middleware/
│   │   ├── auth.ts           # JWT validation
│   │   └── rateLimit.ts      # Rate limiting
│   ├── agents/
│   │   ├── translator.ts     # Language translation
│   │   ├── router.ts         # Intent detection
│   │   ├── finance.ts        # Finance queries
│   │   ├── portfolio.ts      # Portfolio analysis
│   │   ├── dataAnalyst.ts    # Data analysis
│   │   └── orchestrator.ts   # Response combination
│   ├── routes/
│   │   └── chat.ts           # Chat endpoints
│   ├── services/
│   │   ├── supabase.ts       # Supabase client
│   │   └── llm.ts            # AI model client
│   └── index.ts              # Main server
├── .env
└── package.json
```
