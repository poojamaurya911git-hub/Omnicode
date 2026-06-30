// FILE: next-app/app/api/submissions/execute/route.js
// POST /api/submissions/execute — Proxy code execution to collab-engine JDoodle client

import { NextResponse } from 'next/server';
import { authenticateUser } from '../../../../lib/middleware.js';

const COLLAB_ENGINE_URL = process.env.COLLAB_ENGINE_URL || 'http://localhost:4000';

export async function POST(request) {
  try {
    const authUser = await authenticateUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, language, stdin, problemId } = body;

    // Input validation
    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    if (typeof code !== 'string' || code.trim().length === 0) {
      return NextResponse.json(
        { error: 'Code cannot be empty' },
        { status: 400 }
      );
    }

    if (!['cpp', 'python', 'java', 'javascript'].includes(language)) {
      return NextResponse.json(
        { error: 'Language must be one of: cpp, python, java, javascript' },
        { status: 400 }
      );
    }

    // Proxy to collab-engine execute endpoint
    const response = await fetch(`${COLLAB_ENGINE_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        language,
        stdin: stdin || '',
        problemId: problemId || '',
        userId: authUser.id,
      }),
      signal: AbortSignal.timeout(30000), // 30s timeout for code execution
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Code execution failed' },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json(
      {
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        status: result.status || 'unknown',
        cpuTime: result.cpuTime || '',
        memory: result.memory || '',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Execute] Error:', error);

    if (error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'Code execution timed out' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error during code execution' },
      { status: 500 }
    );
  }
}
