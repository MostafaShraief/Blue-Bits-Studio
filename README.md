# Blue Bits Studio

## Overview
Blue Bits Studio is a React 19 + TailwindCSS v4 frontend application connected to a .NET 9 Web API backend. It aids the Blue Bits team in automating lecture and bank extraction, coordination, drawing, and Pandoc document conversion.

## Technologies
- **Frontend**: React 19, React Router 7, Vite, TailwindCSS v4
- **Backend**: C# .NET 9 Web API
- **Database**: Entity Framework Core with SQLite

## Setup Instructions

### Backend
1. Navigate to the `Backend/` folder.
2. Run `dotnet tool install --global dotnet-ef` if you haven't already.
3. Run `dotnet ef database update` to ensure latest migrations are applied.
4. Run `dotnet run` to start the backend server. The API will listen on `http://localhost:5135`.

### Frontend
1. Open a new terminal in the root project folder.
2. Run `pnpm install`
3. Run `pnpm dev` to start the Vite development server.

## Features
1. **Extraction Wizard**: 3-step process to generate ChatGPT prompts for lecture extraction.
2. **Coordination Wizard**: 2-step process to review markdown according to specific rules.
3. **Draw Wizard**: Prompt generation for diagramming using AI.
4. **Pandoc Wizard**: Convert markdown output to styled `.docx` format.
5. **History Dashboard**: Browse past sessions persisted in SQLite.
