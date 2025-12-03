# Tharawat Wealth Guide

**Tharawat** is a comprehensive personal finance management platform built with React, TypeScript, and Supabase. It features an AI-powered financial assistant, portfolio tracking, and real-time market data.

## 📚 Documentation

- **[Project Overview & Architecture](DOCUMENTATION.md)**: Detailed guide on features, tech stack, database schema, and file structure.
- **[External API Integration](EXTERNAL_API_INTEGRATION.md)**: Guide for connecting the frontend to the multi-agent chat backend.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- npm

### 2. Installation

```bash
# Install dependencies
npm install
```

### 3. Configuration

This project is configured to connect to a deployed Vercel Chat API.

**Environment Setup:**
Ensure your `.env` file has the following configuration to use the external chat backend:

```env
VITE_USE_EXTERNAL_CHAT_API=true
VITE_EXTERNAL_CHAT_API_URL=https://vercel-chat-salah-kodous-s-projects.vercel.app
```

### 4. Development

Start the development server:

```bash
npm run dev
```

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **AI Integration**: Custom Multi-Agent System (Vercel)

## 🔗 Project Info

- **Original Lovable Project**: [https://lovable.dev/projects/1766af6c-304d-4a10-bd58-59a8921ef156](https://lovable.dev/projects/1766af6c-304d-4a10-bd58-59a8921ef156)
