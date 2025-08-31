# Tharawat - Personal Finance Management Platform

## Overview

Tharawat is a comprehensive personal finance management platform built with React, TypeScript, and Supabase. It provides users with tools to track income, expenses, debts, investments, and financial goals while offering AI-powered financial advice and market insights.

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **React Query** for data fetching
- **Recharts** for data visualization

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** database with Row Level Security (RLS)
- **Edge Functions** for custom API logic
- **Real-time subscriptions** for live data updates

### AI Integration
- **OpenAI API** for financial advice
- **Groq API** for fast AI responses
- **Custom financial agent** with memory and context

## Features

### 📊 Dashboard
- Financial overview with key metrics
- Monthly income, expenses, and investing tracking
- Net savings calculations
- Interactive charts and visualizations

### 💰 Personal Finances
- Income stream management (salary, stable, unstable)
- Expense tracking (fixed, variable, one-time)
- Debt management with payment tracking
- Financial goal setting and progress monitoring

### 📈 Portfolio Management
- Multi-asset portfolio tracking
- Real estate, stocks, bonds, crypto, and commodity investments
- Performance analytics and P&L calculations
- Asset allocation insights

### 🏦 Deposits & Savings
- Certificate of deposits (CDs) tracking
- Savings accounts with compound interest
- Investment-linked deposits
- Automated interest calculations and crediting

### 🤖 AI Financial Assistant
- Conversational AI for financial advice
- Context-aware recommendations
- Financial data analysis and insights
- Goal-based planning assistance

### 📊 Market Data
- Real-time Egyptian stock market data (EGX)
- Cryptocurrency prices and market caps
- Gold prices (24k, 22k, 21k, 18k, 14k)
- Currency exchange rates
- Bond and ETF market data
- Real estate price trends

### 🏢 Banking Products
- Egyptian bank products database
- Interest rates comparison
- Product features and eligibility
- Multi-language support (Arabic/English)

## Database Schema

### Core Financial Tables

#### `personal_finances`
- User's overall financial summary
- Monthly income, expenses, investing amounts
- Net savings calculations

#### `income_streams`
- Types: salary, stable, unstable
- Amount and frequency tracking
- Active/inactive status

#### `expense_streams`
- Types: fixed, variable, one-time
- Expense categorization and tracking
- Date-based filtering for one-time expenses

#### `debts`
- Total amount, paid amount, monthly payments
- Interest rates and duration tracking
- Payment schedule management

#### `financial_goals`
- Target amounts and dates
- Current progress tracking
- AI-generated strategies

### Investment Tables

#### `portfolios`
- User portfolio containers
- Multiple portfolios per user support

#### `assets`
- Real estate, stocks, bonds, commodities
- Purchase and current price tracking
- Metadata for additional properties

#### `deposits`
- Fixed CDs, savings, investment-linked deposits
- Interest accrual and crediting logic
- Automated processing functions

### Market Data Tables

#### `stocks`, `bonds`, `etfs`, `cryptocurrencies`
- Real-time market data
- Price, volume, market cap tracking
- Performance metrics and changes

#### `gold_prices`, `currency_rates`
- Precious metals pricing
- Multi-currency support
- Historical data retention

#### `real_estate_prices`
- Location-based pricing data
- Property type categorization
- City and neighborhood granularity

### AI & User Tables

#### `ai_agent_memory`
- Conversation context and history
- User-specific financial insights
- Learning and adaptation data

#### `profiles`
- User profile information
- Settings and preferences

## API Documentation

### Edge Functions

#### `/ai-financial-agent`
- **POST** - Chat with AI financial advisor
- **Body**: `{ message: string, context?: object }`
- **Response**: AI recommendations and actions

#### `/ai-investment-analysis`
- **POST** - Get investment analysis
- **Body**: `{ assets: Asset[], analysis_type: string }`
- **Response**: Detailed investment insights

#### `/market-analysis`
- **POST** - Market data analysis
- **Body**: `{ market_type: string, filters?: object }`
- **Response**: Market trends and analysis

#### `/deposits`
- **POST** - Process deposit operations
- **Body**: `{ action: string, deposit_data: object }`
- **Response**: Deposit status and calculations

### Key Database Functions

#### `calculate_monthly_income(user_uuid)`
- Calculates total monthly income from all streams
- Handles stable vs unstable income types

#### `calculate_monthly_expenses(user_uuid)`
- Computes total monthly expenses
- Includes recurring and one-time expenses

#### `process_deposit(deposit_id)`
- Handles interest accrual and crediting
- Automated deposit management

#### `calculate_deposit_accrual(deposit_id, from_date, to_date)`
- Calculates interest for specific periods
- Supports different deposit types and compounding

## File Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── Navigation.tsx   # Main navigation
│   ├── Dashboard*.tsx   # Dashboard components
│   ├── Portfolio*.tsx   # Portfolio management
│   ├── AI*.tsx          # AI assistant components
│   └── *Manager.tsx     # Financial data managers
├── hooks/               # Custom React hooks
│   ├── useAuth.tsx      # Authentication
│   ├── usePersonalFinances.tsx
│   ├── useCurrency.tsx  # Currency formatting
│   └── use*.tsx         # Feature-specific hooks
├── pages/               # Route components
│   ├── Index.tsx        # Landing page
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Finances.tsx     # Financial management
│   ├── Portfolio.tsx    # Investment portfolio
│   ├── Assistant.tsx    # AI assistant
│   └── Analytics.tsx    # Data analytics
├── integrations/        # External integrations
│   └── supabase/        # Supabase client and types
└── lib/                 # Utility functions

supabase/
├── functions/           # Edge functions
│   ├── ai-financial-agent/
│   ├── ai-investment-analysis/
│   ├── market-analysis/
│   └── deposits/
└── migrations/          # Database migrations
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Environment Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd tharawat
npm install
```

2. **Configure Supabase**
```bash
# Copy environment variables
cp .env.example .env

# Add your Supabase credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Database Setup**
- Run migrations in Supabase SQL editor
- Enable Row Level Security on all tables
- Configure authentication providers

4. **AI Integration**
- Add OpenAI API key to Supabase secrets
- Add Groq API key for faster responses
- Configure rate limiting and usage monitoring

5. **Development**
```bash
npm run dev
```

### Production Deployment

1. **Build the application**
```bash
npm run build
```

2. **Deploy to your hosting platform**
- Vercel, Netlify, or any static hosting
- Configure environment variables
- Set up domain and SSL

3. **Edge Functions**
- Functions deploy automatically with Supabase
- Monitor logs and performance
- Set up alerts and monitoring

## Security Features

### Row Level Security (RLS)
- All user data isolated by `auth.uid()`
- Fine-grained access control
- Secure multi-tenant architecture

### Data Validation
- Input sanitization and validation
- Type safety with TypeScript
- Database constraints and triggers

### Authentication
- Supabase Auth with multiple providers
- Session management and refresh tokens
- Secure password policies

## Performance Optimization

### Database
- Indexed columns for fast queries
- Automated cleanup functions
- Efficient data aggregation functions

### Frontend
- Lazy loading and code splitting
- React Query for caching
- Optimistic updates for better UX

### API
- Edge function optimization
- Connection pooling
- Rate limiting and throttling

## Contributing

### Development Workflow
1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Code review and merge

### Code Standards
- TypeScript strict mode
- ESLint and Prettier formatting
- Component and hook naming conventions
- Comprehensive error handling

## Support

For issues, feature requests, or questions:
- Create GitHub issues for bugs
- Use discussions for feature requests
- Check documentation for common solutions
- Review logs in Supabase dashboard

## License

This project is licensed under the MIT License - see the LICENSE file for details.