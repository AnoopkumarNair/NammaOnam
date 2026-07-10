export async function getDriveAssetsMap(): Promise<Map<string, string>> {
  try {
    // We hit the Apps Script directly rather than localhost to avoid SSR issues
    const scriptUrl = "https://script.google.com/macros/s/AKfycbyHWq-VhpMpP8XuS_z1GsAm1jJlfgOyWN2MHLd2ajy4kroiVo6ffLOvHwsovACJCK3N/exec";
    const res = await fetch(scriptUrl, { 
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(4000) 
    });
    
    if (!res.ok) return new Map();
    
    const data = await res.json();
    const map = new Map<string, string>();
    
    if (data && data.files) {
      data.files.forEach((file: { name: string; id: string; webContentLink: string }) => {
        if (file.name && file.id) {
          // Use the direct Google CDN URL — no redirect, no rate-limiting
          const cdnUrl = `https://lh3.googleusercontent.com/d/${file.id}=w1000`;
          map.set(file.name, cdnUrl);
        }
      });
    }
    
    return map;
  } catch (error) {
    console.error("Failed to fetch drive assets map:", error);
    return new Map();
  }
}

