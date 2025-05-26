import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        category: 'contact'
      }
    });

    const settingsMap = settings.reduce((acc: Record<string, string>, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    return NextResponse.json({
      status: 'success',
      data: settingsMap
    });
  } catch (error) {
    console.error('Error fetching contact settings:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch contact settings'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid settings data'
        },
        { status: 400 }
      );
    }

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      await prisma.setting.upsert({
        where: {
          category_key: {
            category: 'contact',
            key: key
          }
        },
        update: {
          value: value as string
        },
        create: {
          category: 'contact',
          key: key,
          value: value as string
        }
      });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Contact settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating contact settings:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to update contact settings'
      },
      { status: 500 }
    );
  }
}