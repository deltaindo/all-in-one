import { NextResponse } from 'next/server';
import { successResponse } from '@delta/api-lib';

export async function GET() {
  return NextResponse.json(
    successResponse([
      {
        id: '1',
        name: 'Main Office',
        location: 'Jakarta',
        status: 'ACTIVE',
      },
    ])
  );
}
