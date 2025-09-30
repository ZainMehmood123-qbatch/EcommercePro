// app/api/uploads/route.ts
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const fileCandidate = data.get('file');
    if (!(fileCandidate instanceof File)) {
      return NextResponse.json(
        { error: 'No file received or invalid file' },
        { status: 400 }
      );
    }

    const file: File = fileCandidate;
    const allowedTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP and GIF allowed.' },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const sanitizedFileName = file.name.replace(fileExtension, '').replace(/\s+/g, '_');
    const uniqueFileName = `${sanitizedFileName}_${timestamp}${fileExtension}`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    await mkdir(uploadsDir, { recursive: true });

    const filepath = path.join(uploadsDir, uniqueFileName);
    await writeFile(filepath, buffer);

    const imageUrl = `/uploads/products/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      url: imageUrl,
      message: 'File uploaded successfully'
    });

  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json(
        { error: 'File upload failed', details: err.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'File upload failed', details: 'Unknown error' },
      { status: 500 }
    );
  }
}
