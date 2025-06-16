import { NextResponse } from 'next/server';
import { adminDb } from '@/app/utils/firebase-admin';


export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received request:", body); // 🔍 Log input

    const { deviceName, ...data } = body;
    const timestamp = new Date().toISOString();

    await adminDb.collection(deviceName.toLowerCase()).doc(timestamp).set(body);
     console.log(`Data written to collection '${deviceName}'`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
