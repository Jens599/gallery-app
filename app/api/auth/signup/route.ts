import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/server/src/config/db';
import { User } from '@/server/src/models/user.model';
import { createToken } from '@/server/src/utils';

export async function POST(req: NextRequest) {
  await connectDB();
  const { username, email, password } = await req.json();

  try {
    if (!username || !email || !password) {
      return NextResponse.json({
        status: 'error',
        message: 'Username, email, and password are required',
        fields: {
          username: !username ? 'missing' : 'provided',
          email: !email ? 'missing' : 'provided',
          password: !password ? 'missing' : 'provided',
        },
      }, { status: 400 });
    }

    const user = await User.signup(username, email, password);
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
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Signup failed',
      details: err.details,
    }, { status: err.statusCode || 500 });
  }
} 