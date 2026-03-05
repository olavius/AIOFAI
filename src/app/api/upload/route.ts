import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import * as XLSX from 'xlsx'
import type { ParsedFile, SheetData } from '@/types'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv',
    ]
    const allowedExtensions = ['.xlsx', '.xls', '.csv']
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!allowedExtensions.includes(ext) && !allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Please upload Excel or CSV files.' }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let workbook: XLSX.WorkBook

    if (ext === '.csv' || file.type === 'text/csv') {
      const csvString = buffer.toString('utf-8')
      workbook = XLSX.read(csvString, { type: 'string' })
    } else {
      workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
    }

    const sheets: SheetData[] = workbook.SheetNames.map((name) => {
      const worksheet = workbook.Sheets[name]
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        header: 1,
        defval: null,
      }) as unknown as unknown[][]

      if (jsonData.length === 0) {
        return { name, headers: [], rows: [], rowCount: 0 }
      }

      const headers = (jsonData[0] as unknown[]).map((h) => String(h ?? ''))
      const dataRows = jsonData.slice(1).filter((row) =>
        (row as unknown[]).some((cell) => cell !== null && cell !== undefined && cell !== ''),
      )

      const rows = dataRows.slice(0, 5).map((row) => {
        const obj: Record<string, unknown> = {}
        headers.forEach((header, i) => {
          obj[header || `Column${i + 1}`] = (row as unknown[])[i]
        })
        return obj
      })

      return {
        name,
        headers,
        rows,
        rowCount: dataRows.length,
      }
    })

    const result: ParsedFile = {
      fileName: file.name,
      sheets,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Upload error:', error)
    const message = error instanceof Error ? error.message : 'Failed to parse file'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
