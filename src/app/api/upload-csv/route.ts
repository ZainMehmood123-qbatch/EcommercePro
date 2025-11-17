import { NextRequest, NextResponse } from 'next/server';

// You can use environment variables for FastAPI URL
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000/products';

export async function POST(req: NextRequest) {
  try {
    // Example: check JWT token in cookies for security
    const token = req.cookies.get('next-auth.session-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Forward the file to FastAPI
    const formData = await req.formData();

    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Prepare form data to send to FastAPI
    const uploadFormData = new FormData();

    uploadFormData.append('file', file, file.name);

    // Call FastAPI endpoint
    const response = await fetch(`${FASTAPI_URL}/upload-csv`, {
      method: 'POST',
      body: uploadFormData,

      // You can forward auth headers if needed
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);

    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
