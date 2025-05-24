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

    // Get security settings
    const settings = await prisma.setting.findMany({
      where: { category: 'security' }
    });

    // Convert to key-value object
    const securitySettings = settings.reduce((acc: Record<string, string>, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    // Set default values if not found
    const defaultSettings = {
      twoFactorEnabled: securitySettings.twoFactorEnabled || 'false',
      sessionTimeout: securitySettings.sessionTimeout || '3600',
      passwordMinLength: securitySettings.passwordMinLength || '8',
      passwordRequireSpecialChars: securitySettings.passwordRequireSpecialChars || 'true',
      maxLoginAttempts: securitySettings.maxLoginAttempts || '5',
      accountLockoutDuration: securitySettings.accountLockoutDuration || '1800',
      apiRateLimit: securitySettings.apiRateLimit || '100',
      encryptionLevel: securitySettings.encryptionLevel || 'AES-256'
    };

    return NextResponse.json(defaultSettings);
  } catch (error) {
    console.error('Error fetching security settings:', error);
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
      twoFactorEnabled,
      sessionTimeout,
      passwordMinLength,
      passwordRequireSpecialChars,
      maxLoginAttempts,
      accountLockoutDuration,
      apiRateLimit,
      encryptionLevel
    } = body;

    // Validate required fields
    if (
      typeof twoFactorEnabled !== 'string' ||
      typeof sessionTimeout !== 'string' ||
      typeof passwordMinLength !== 'string' ||
      typeof passwordRequireSpecialChars !== 'string' ||
      typeof maxLoginAttempts !== 'string' ||
      typeof accountLockoutDuration !== 'string' ||
      typeof apiRateLimit !== 'string' ||
      typeof encryptionLevel !== 'string'
    ) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // Update settings using upsert
    const settingsToUpdate = [
      { key: 'twoFactorEnabled', value: twoFactorEnabled },
      { key: 'sessionTimeout', value: sessionTimeout },
      { key: 'passwordMinLength', value: passwordMinLength },
      { key: 'passwordRequireSpecialChars', value: passwordRequireSpecialChars },
      { key: 'maxLoginAttempts', value: maxLoginAttempts },
      { key: 'accountLockoutDuration', value: accountLockoutDuration },
      { key: 'apiRateLimit', value: apiRateLimit },
      { key: 'encryptionLevel', value: encryptionLevel }
    ];

    await Promise.all(
      settingsToUpdate.map(setting =>
        prisma.setting.upsert({
          where: {
            category_key: {
              category: 'security',
              key: setting.key
            }
          },
          update: {
            value: setting.value,
            updatedAt: new Date()
          },
          create: {
            category: 'security',
            key: setting.key,
            value: setting.value
          }
        })
      )
    );

    return NextResponse.json({ message: 'Security settings updated successfully' });
  } catch (error) {
    console.error('Error updating security settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
