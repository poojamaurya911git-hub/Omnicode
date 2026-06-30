// FILE: collab-engine/jdoodleClient.js
// JDoodle API client for code execution with exponential backoff retries

const JDOODLE_API_URL = 'https://api.jdoodle.com/v1/execute';

/**
 * Language to JDoodle language/versionIndex mapping
 */
const LANGUAGE_MAP = {
  cpp: { language: 'cpp17', versionIndex: '0' },
  python: { language: 'python3', versionIndex: '4' },
  java: { language: 'java', versionIndex: '4' },
  javascript: { language: 'nodejs', versionIndex: '4' },
};

/**
 * Sleep utility for retry backoff
 * @param {number} ms
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute code via JDoodle API with exponential backoff retries
 * @param {Object} params
 * @param {string} params.code - Source code to execute
 * @param {string} params.language - Language key (cpp, python, java, javascript)
 * @param {string} params.stdin - Standard input
 * @returns {Object} { stdout, stderr, status, cpuTime, memory }
 */
export async function execute({ code, language, stdin = '' }) {
  const clientId = process.env.JDOODLE_CLIENT_ID;
  const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('JDoodle credentials not configured. Set JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET.');
  }

  const langConfig = LANGUAGE_MAP[language];
  if (!langConfig) {
    throw new Error(`Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_MAP).join(', ')}`);
  }

  const requestBody = {
    clientId,
    clientSecret,
    script: code,
    language: langConfig.language,
    versionIndex: langConfig.versionIndex,
    stdin: stdin || '',
  };

  // Exponential backoff: 3 retries with delays of 1s, 2s, 4s
  const MAX_RETRIES = 3;
  let lastError = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(JDOODLE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');

        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          return {
            stdout: '',
            stderr: `JDoodle API error (${response.status}): ${errorText}`,
            status: 'error',
            cpuTime: '',
            memory: '',
          };
        }

        throw new Error(`JDoodle API returned ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      // JDoodle returns { output, statusCode, memory, cpuTime }
      // statusCode 200 = success, others = error
      const isError = result.statusCode && result.statusCode !== 200;

      return {
        stdout: isError ? '' : (result.output || ''),
        stderr: isError ? (result.output || 'Execution error') : '',
        status: isError ? 'error' : 'success',
        cpuTime: result.cpuTime || '',
        memory: result.memory || '',
      };
    } catch (error) {
      lastError = error;

      if (error.name === 'AbortError') {
        lastError = new Error('JDoodle API request timed out');
      }

      // Don't retry on the last attempt
      if (attempt < MAX_RETRIES - 1) {
        const backoffMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.warn(`[JDoodle] Attempt ${attempt + 1} failed, retrying in ${backoffMs}ms:`, lastError.message);
        await sleep(backoffMs);
      }
    }
  }

  // All retries exhausted
  console.error('[JDoodle] All retries exhausted:', lastError?.message);
  return {
    stdout: '',
    stderr: `Code execution failed after ${MAX_RETRIES} attempts: ${lastError?.message || 'Unknown error'}`,
    status: 'error',
    cpuTime: '',
    memory: '',
  };
}

export default { execute };
