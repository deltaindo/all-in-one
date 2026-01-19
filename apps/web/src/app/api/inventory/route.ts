import { NextResponse } from 'next/server';
import { successResponse } from '@delta/api-lib';

export async function GET() {
  return NextResponse.json(
    successResponse({
      items: 0,
      totalValue: 0,
      lowStock: 0,
    })
  );
}
