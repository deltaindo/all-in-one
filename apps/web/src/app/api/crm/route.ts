import { NextResponse } from 'next/server';
import { successResponse } from '@delta/api-lib';

export async function GET() {
  return NextResponse.json(
    successResponse({
      contacts: 0,
      campaigns: 0,
      messages: 0,
    })
  );
}
