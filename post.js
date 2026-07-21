// Substitua pelas suas credenciais reais do Supabase (as mesmas que você usou nos outros arquivos)
const SUPABASE_URL = 'https://sbernzrwccdmbwxelkls.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ztZPPn2HJq3VDkfLXfFqEA_ijzadfIv';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function carregarPost() {
    const postArea = document.getElementById('postContentArea');
    
    // 1. Pegar o 'slug' da URL (ex: ?slug=novo-artigo)
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        postArea.innerHTML = '<h2 style="color: #d93025; text-align: center;">Artigo não especificado.</h2>';
        return;
    }

    try {
        // 2. Buscar o post específico no Supabase pelo slug
        const { data: post, error } = await supabaseClient
            .from('posts')
            .select('*')
            .eq('slug', slug)
            .single(); // .single() garante que pegaremos apenas 1 objeto, não uma lista

        if (error) throw error;

        if (!post) {
            postArea.innerHTML = '<h2 style="text-align: center;">Artigo não encontrado.</h2>';
            return;
        }

        // 3. Atualizar o título da aba do navegador
        document.title = `${post.title} | Blog LCPP`;

        // 4. Formatar a data
        const dataFormatada = new Date(post.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        // 5. Renderizar o conteúdo no HTML
        const imagem = post.image_url ? `<img src="${post.image_url}" alt="${post.title}" class="post-cover">` : '';

        // Formatação simples para transformar quebras de linha em parágrafos (<br> ou <p>)
        const conteudoFormatado = post.content.replace(/\n/g, '<br>');

        postArea.innerHTML = `
            <div class="post-header reveal active">
                <h1 class="post-title">${post.title}</h1>
                <div class="post-meta">
                    <strong>${post.author}</strong> • Publicado em ${dataFormatada}
                </div>
            </div>
            ${imagem}
            <div class="post-body reveal active">
                ${conteudoFormatado}
            </div>
        `;

        // Inicializar os ícones do Lucide novamente, caso haja algum no conteúdo
        lucide.createIcons();

    } catch (err) {
        console.error('Erro ao carregar o post:', err);
        postArea.innerHTML = `
            <div style="text-align: center; color: #d93025; padding: 40px;">
                <p><strong>Erro:</strong> Não foi possível carregar este artigo.</p>
                <p><small>${err.message}</small></p>
            </div>`;
    }
}

// Rodar a função ao abrir a página
document.addEventListener('DOMContentLoaded', carregarPost);