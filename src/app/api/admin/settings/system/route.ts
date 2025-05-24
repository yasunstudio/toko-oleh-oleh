import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get system settings
    const settings = await prisma.setting.findMany({
      where: { category: 'system' }
    });

    // Convert to key-value object
    const systemSettings = settings.reduce((acc: Record<string, string>, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    // Set default values if not found
    const defaultSettings = {
      maintenanceMode: systemSettings.maintenanceMode || 'false',
      systemTimezone: systemSettings.systemTimezone || 'Asia/Jakarta',
      defaultLanguage: systemSettings.defaultLanguage || 'id',
      maxFileUploadSize: systemSettings.maxFileUploadSize || '10',
      sessionDuration: systemSettings.sessionDuration || '24',
      debugMode: systemSettings.debugMode || 'false',
      analyticsEnabled: systemSettings.analyticsEnabled || 'true',
      backupFrequency: systemSettings.backupFrequency || 'daily'
    };

    return NextResponse.json(defaultSettings);
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      maintenanceMode,
      systemTimezone,
      defaultLanguage,
      maxFileUploadSize,
      sessionDuration,
      debugMode,
      analyticsEnabled,
      backupFrequency
    } = body;

    // Validate required fields
    if (
      typeof maintenanceMode !== 'string' ||
      typeof systemTimezone !== 'string' ||
      typeof defaultLanguage !== 'string' ||
      typeof maxFileUploadSize !== 'string' ||
      typeof sessionDuration !== 'string' ||
      typeof debugMode !== 'string' ||
      typeof analyticsEnabled !== 'string' ||
      typeof backupFrequency !== 'string'
    ) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // Update settings using upsert
    const settingsToUpdate = [
      { key: 'maintenanceMode', value: maintenanceMode },
      { key: 'systemTimezone', value: systemTimezone },
      { key: 'defaultLanguage', value: defaultLanguage },
      { key: 'maxFileUploadSize', value: maxFileUploadSize },
      { key: 'sessionDuration', value: sessionDuration },
      { key: 'debugMode', value: debugMode },
      { key: 'analyticsEnabled', value: analyticsEnabled },
      { key: 'backupFrequency', value: backupFrequency }
    ];

    await Promise.all(
      settingsToUpdate.map(setting =>
        prisma.setting.upsert({
          where: {
            category_key: {
              category: 'system',
              key: setting.key
            }
          },
          update: {
            value: setting.value,
            updatedAt: new Date()
          },
          create: {
            category: 'system',
            key: setting.key,
            value: setting.value
          }
        })
      )
    );

    return NextResponse.json({ message: 'System settings updated successfully' });
  } catch (error) {
    console.error('Error updating system settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
