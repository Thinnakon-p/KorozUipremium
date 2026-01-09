/**
 * Nebula OS - Global Configuration
 * กรุณาใส่ค่าจาก Supabase Dashboard ของคุณที่นี่
 */

const CONFIG = {
    // 1. จาก Supabase: Settings > API > Project URL
    SUPABASE_URL: "https://jvekmyjfoffqqzzwuola.supabase.co", 
    
    // 2. จาก Supabase: Settings > API > anon (public) key
    SUPABASE_ANON_KEY: "sb_publishable_GBGuYw-sSu-Cs0fu5DWqGQ_LjkO7-FZ", 
    
    // 3. จาก Google AI Studio (ถ้าจะใช้ระบบ AI)
    GEMINI_API_KEY: "" 
};

// ตรวจสอบความพร้อมของ SDK
if (typeof supabase === 'undefined') {
    console.error("Supabase SDK โหลดไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
}

// สร้าง Instance ของ Supabase Client ชุดเดียวเพื่อใช้ทั้งระบบ
const supabaseClient = (typeof supabase !== 'undefined') 
    ? supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY) 
    : null;

/**
 * ฟังก์ชันตรวจสอบสิทธิ์ผู้ดูแลระบบ
 */
async function checkAdminStatus(user) {
    if (!user || !supabaseClient) return false;
    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
        
        if (error) return false;
        return data?.is_admin || false;
    } catch (e) {
        return false;
    }
}