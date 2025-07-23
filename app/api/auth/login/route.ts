import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/server/src/config/db';
import { User } from '@/server/src/models/user.model';
import { createToken } from '@/server/src/utils';

export async function POST(req: NextRequest) {
  await connectDB();
  const { email, password } = await req.json();

  try {
    if (!email || !password) {
      return NextResponse.json({
        status: 'error',
        message: 'Email and password are required',
        fields: {
          email: !email ? 'missing' : 'provided',
          password: !password ? 'missing' : 'provided',
        },
      }, { status: 400 });
    }

    const user = await User.login(email, password);
    const token = createToken(user.id);

    return NextResponse.json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Login failed',
      details: err.details,
    }, { status: err.statusCode || 500 });
  }
} 