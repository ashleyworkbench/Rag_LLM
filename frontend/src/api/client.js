import axios from 'axios'

const BASE_URL = 'http://localhost:8000/api'

// Upload a file — returns { filename, chunks, total_indexed }
export async function uploadFile(file, onProgress) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await axios.post(`${BASE_URL}/upload/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total))
    },
  })
  return res.data
}

// Fetch list of uploaded documents
export async function fetchDocuments() {
  const res = await axios.get(`${BASE_URL}/upload/documents`)
  return res.data
}

// Delete a document
export async function deleteDocument(filename) {
  const res = await axios.delete(`${BASE_URL}/upload/delete/${encodeURIComponent(filename)}`)
  return res.data
}

// Stream a query — calls onToken for each word, onSources when done
export async function streamQuery(question, onToken, onSources, onDone) {
  const response = await fetch(`${BASE_URL}/query/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    // Keep last incomplete line in buffer
    buffer = lines.pop()

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('event:')) continue

      if (trimmed.startsWith('data: ')) {
        const data = trimmed.slice(6)

        if (data === '[DONE]') {
          onDone?.()
          return
        }

        // Check if sources JSON
        try {
          const parsed = JSON.parse(data)
          if (Array.isArray(parsed)) {
            onSources?.(parsed)
            continue
          }
        } catch (_) {}

        // Unescape newlines
        onToken(data.replace(/\\n/g, '\n'))
      }
    }
  }
  onDone?.()
}
