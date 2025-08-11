import { readFile } from 'fs/promises'
import { join } from 'path'
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const validDocs = ['FAQ.md', 'USER_GUIDE.md', 'TECHNICAL_DOCUMENTATION.md', 'ROADMAP.md', 'README.md']
    
    if (!validDocs.includes(slug)) {
      return new Response('Document not found', { status: 404 })
    }
    
    const filePath = join(process.cwd(), 'docs', slug)
    const content = await readFile(filePath, 'utf8')
    
    return new Response(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error reading documentation file:', error)
    return new Response('Document not found', { status: 404 })
  }
}