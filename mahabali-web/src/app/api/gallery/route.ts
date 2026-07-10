import { NextResponse } from "next/server";

export async function GET() {
  try {
    const scriptUrl = "https://script.google.com/macros/s/AKfycbyHWq-VhpMpP8XuS_z1GsAm1jJlfgOyWN2MHLd2ajy4kroiVo6ffLOvHwsovACJCK3N/exec";

    const res = await fetch(scriptUrl, {
      next: { revalidate: 60 * 1 }, // cache for 1 minute
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Google Apps Script error: ${errorText}`);
    }

    const data = await res.json();
    
    // Filter out assets used in Stalls and Sponsors
    try {
      // Import dynamically to avoid circular dependencies if any
      const { fetchSheetData } = await import('@/services/google-sheets');
      const [sponsors, stalls] = await Promise.all([
        fetchSheetData<any>("Sponsors"),
        fetchSheetData<any>("Stalls")
      ]);
      
      const usedAssetNames = new Set<string>();
      sponsors.forEach(s => {
        if (s["Image URL"]) usedAssetNames.add(s["Image URL"].split('/').pop());
        if (s["Logo URL"]) usedAssetNames.add(s["Logo URL"].split('/').pop());
      });
      stalls.forEach(s => {
        if (s["Image URL"]) usedAssetNames.add(s["Image URL"].split('/').pop());
      });
      
      if (data && data.files) {
        data.files = data.files.filter((f: any) => {
          // 1. Skip if parent folder name is explicitly "assets" (case-insensitive)
          if (f.parentName && f.parentName.toLowerCase() === "assets") {
            return false;
          }
          
          // 2. Skip if filename matches stall_ or sponsor_ prefixes (fallback)
          const name = f.name?.toLowerCase() || "";
          if (name.startsWith("stall_") || name.startsWith("sponsor_")) {
            return false;
          }
          
          // 3. Skip if explicitly used in Google Sheets Stalls/Sponsors
          if (usedAssetNames.has(f.name)) {
            return false;
          }

          // 4. Skip document files (txt, pdf, docx, etc)
          if (name.endsWith(".txt") || name.endsWith(".pdf") || name.endsWith(".doc") || name.endsWith(".docx")) {
            return false;
          }

          return true;
        });
      }
    } catch (e) {
      console.error("Failed to filter out assets from gallery:", e);
    }
    
    // The Apps Script already returns { files: [ { id, name, webContentLink } ] }
    // which exactly matches what the frontend expects!
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gallery API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
