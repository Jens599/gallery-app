import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/server/src/config/db';
import { User } from '@/server/src/models/user.model';
import { Image } from '@/server/src/models/image.model';
import jwt from 'jsonwebtoken';
import { config } from '@/server/src/config';

export async function DELETE(req: NextRequest) {
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
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({
        status: 'error',
        message: 'User no longer exists',
      }, { status: 401 });
    }

    // Cast user to UserType to fix linter error
    const typedUser = user as import('@/server/src/models/user.model').UserType;

    // Delete all user's images first
    const imageDeleteResult = await Image.deleteMany({ userId: (typedUser._id as any).toString() });
    if (!imageDeleteResult.acknowledged) {
      return NextResponse.json({
        status: 'error',
        message: "Failed to delete user's images",
      }, { status: 500 });
    }

    // Delete the user
    const deletedUser = await User.findByIdAndDelete((typedUser._id as any));
    if (!deletedUser) {
      return NextResponse.json({
        status: 'error',
        message: 'User not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'User and associated images successfully deleted',
      data: {
        deletedUser: {
          id: deletedUser._id,
          username: deletedUser.username,
          email: deletedUser.email,
        },
        imagesDeleted: imageDeleteResult.deletedCount,
      },
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Delete user failed',
      details: err.details,
    }, { status: err.statusCode || 500 });
  }
} 