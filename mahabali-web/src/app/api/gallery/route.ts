import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Never cache — always fetch fresh from Google Drive

export async function GET() {
  try {
    const scriptUrl = "https://script.google.com/macros/s/AKfycbyHWq-VhpMpP8XuS_z1GsAm1jJlfgOyWN2MHLd2ajy4kroiVo6ffLOvHwsovACJCK3N/exec";

    const res = await fetch(scriptUrl, {
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Google Apps Script error: ${errorText}`);
    }

    const data = await res.json();
    
    // The Apps Script already returns { files: [ { id, name, webContentLink } ] }
    // which exactly matches what the frontend expects!
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gallery API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
