import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/server/src/config/db';
import { Image } from '@/server/src/models/image.model';
import jwt from 'jsonwebtoken';
import { config } from '@/server/src/config';
import { Types } from 'mongoose';

async function authenticate(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: NextResponse.json({ status: 'error', message: 'No or invalid authorization header provided' }, { status: 401 }) };
  }
  const token = authHeader.split(' ')[1];
  if (!token || token === 'null' || token === 'undefined') {
    return { error: NextResponse.json({ status: 'error', message: 'No token provided' }, { status: 401 }) };
  }
  try {
    const { id } = jwt.verify(token, config.jwt.secret) as { id: string };
    return { id };
  } catch (err: any) {
    return { error: NextResponse.json({ status: 'error', message: 'Invalid or expired token' }, { status: 401 }) };
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const { id: userId, error } = await authenticate(req);
  if (error) return error;
  const { id } = params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ status: 'error', message: 'Invalid image ID' }, { status: 400 });
  }
  try {
    const { url, key } = await req.json();
    if (!url || !key) {
      return NextResponse.json({ status: 'error', message: 'URL and key are required' }, { status: 400 });
    }
    const existingImage = await Image.findById(id);
    if (!existingImage) {
      return NextResponse.json({ status: 'error', message: 'Image not found' }, { status: 404 });
    }
    if (existingImage.userId.toString() !== userId) {
      return NextResponse.json({ status: 'error', message: 'Forbidden: You do not own this image' }, { status: 403 });
    }
    const image = await Image.findByIdAndUpdate(
      id,
      { $push: { url: url, keys: key } },
      { new: true, runValidators: true },
    );
    return NextResponse.json({ status: 'success', data: image }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message || 'Failed to update image URL', details: err.details }, { status: err.statusCode || 500 });
  }
} 