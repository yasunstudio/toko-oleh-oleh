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

    // Get shipping settings
    const settings = await prisma.setting.findMany({
      where: { category: 'shipping' }
    });

    // Convert to key-value object
    const shippingSettings = settings.reduce((acc: Record<string, string>, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    // Set default values if not found
    const defaultSettings = {
      freeShippingThreshold: shippingSettings.freeShippingThreshold || '100000',
      standardShippingCost: shippingSettings.standardShippingCost || '10000',
      expressShippingCost: shippingSettings.expressShippingCost || '25000',
      maxWeight: shippingSettings.maxWeight || '30',
      maxDimensions: shippingSettings.maxDimensions || '100x100x100',
      processingTime: shippingSettings.processingTime || '1-2',
      shippingZones: shippingSettings.shippingZones || 'domestic,international',
      packageInsurance: shippingSettings.packageInsurance || 'true'
    };

    return NextResponse.json(defaultSettings);
  } catch (error) {
    console.error('Error fetching shipping settings:', error);
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
      freeShippingThreshold,
      standardShippingCost,
      expressShippingCost,
      maxWeight,
      maxDimensions,
      processingTime,
      shippingZones,
      packageInsurance
    } = body;

    // Validate required fields
    if (
      typeof freeShippingThreshold !== 'string' ||
      typeof standardShippingCost !== 'string' ||
      typeof expressShippingCost !== 'string' ||
      typeof maxWeight !== 'string' ||
      typeof maxDimensions !== 'string' ||
      typeof processingTime !== 'string' ||
      typeof shippingZones !== 'string' ||
      typeof packageInsurance !== 'string'
    ) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // Update settings using upsert
    const settingsToUpdate = [
      { key: 'freeShippingThreshold', value: freeShippingThreshold },
      { key: 'standardShippingCost', value: standardShippingCost },
      { key: 'expressShippingCost', value: expressShippingCost },
      { key: 'maxWeight', value: maxWeight },
      { key: 'maxDimensions', value: maxDimensions },
      { key: 'processingTime', value: processingTime },
      { key: 'shippingZones', value: shippingZones },
      { key: 'packageInsurance', value: packageInsurance }
    ];

    await Promise.all(
      settingsToUpdate.map(setting =>
        prisma.setting.upsert({
          where: {
            category_key: {
              category: 'shipping',
              key: setting.key
            }
          },
          update: {
            value: setting.value,
            updatedAt: new Date()
          },
          create: {
            category: 'shipping',
            key: setting.key,
            value: setting.value
          }
        })
      )
    );

    return NextResponse.json({ message: 'Shipping settings updated successfully' });
  } catch (error) {
    console.error('Error updating shipping settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
