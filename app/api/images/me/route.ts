import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/server/src/config/db';
import { Image } from '@/server/src/models/image.model';
import jwt from 'jsonwebtoken';
import { config } from '@/server/src/config';

export async function GET(req: NextRequest) {
  await connectDB();
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({
      status: 'error',
      message: 'No or invalid authorization header provided',
    }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  if (!token || token === 'null' || token === 'undefined') {
    return NextResponse.json({
      status: 'error',
      message: 'No token provided',
    }, { status: 401 });
  }

  try {
    const { id } = jwt.verify(token, config.jwt.secret) as { id: string };
    if (!id) {
      return NextResponse.json({ status: 'error', message: 'User not authenticated' }, { status: 401 });
    }
    const images = await Image.find({ userId: id }).sort({ createdAt: -1 });
    const total = await Image.countDocuments({ userId: id });
    return NextResponse.json({
      status: 'success',
      data: { images, total },
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Failed to fetch images',
      details: err.details,
    }, { status: err.statusCode || 500 });
  }
} 