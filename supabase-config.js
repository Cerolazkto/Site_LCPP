// ============================================
// Configuração centralizada do Supabase
// Todas as páginas importam este arquivo.
// ============================================

const SUPABASE_URL = 'https://avewsgbqzitthlgqapzj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vRyaxju0gHlJaLSE6A9dmg_YRdww3Ny';

// Nome do bucket no Supabase Storage para fotos de capa do blog
const SUPABASE_STORAGE_BUCKET = 'blog-images';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
