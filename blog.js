// Substitua pelas suas credenciais reais do Supabase
const SUPABASE_URL = 'https://sbernzrwccdmbwxelkls.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ztZPPn2HJq3VDkfLXfFqEA_ijzadfIv';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função assíncrona para buscar e renderizar os posts
async function carregarPostsBlog() {
    const blogGrid = document.getElementById('blogGrid');
    if (!blogGrid) return;

    try {
        // Busca na tabela 'posts' os artigos publicados, ordenando por data decrescente
        const { data: posts, error } = await supabaseClient
            .from('posts')
            .select('*')
            .eq('published', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Verifica se o banco está vazio
        if (!posts || posts.length === 0) {
            blogGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 50px 0;">
                    <i data-lucide="inbox" style="width: 48px; height: 48px; color: #ccc; margin-bottom: 15px;"></i>
                    <h3 style="color: #666;">Nenhum artigo publicado ainda.</h3>
                    <p style="color: #999;">Volte em breve para conferir nossas novidades.</p>
                </div>`;
            lucide.createIcons(); // Recarrega os ícones
            return;
        }

        // Renderiza o HTML para cada post retornado do banco
        blogGrid.innerHTML = posts.map(post => {
            // Formatação elegante da data
            const dataFormatada = new Date(post.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

            // Imagem de fallback caso o post não tenha imagem de capa
            const imagem = post.image_url || 'imgs/lab1.jpeg';

            return `
                <article class="blog-card">
                    <img src="${imagem}" alt="${post.title}" class="blog-card-img" />
                    <div class="blog-card-content">
                        <div class="blog-card-meta">${dataFormatada} • ${post.author}</div>
                        <h3 class="blog-card-title">${post.title}</h3>
                        <p class="blog-card-excerpt">${post.excerpt || 'Clique em ler artigo para ver o conteúdo completo.'}</p>
                        <a href="post.html?slug=${post.slug}" class="btn-light" style="text-align: center; text-decoration: none; margin-top: auto;">Ler Artigo</a>
                    </div>
                </article>
            `;
        }).join('');

    } catch (err) {
        console.error('Erro ao conectar com o Supabase:', err);
        blogGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 50px 0; color: #d93025;">
                <p><strong>Erro de conexão:</strong> Não foi possível carregar os artigos no momento.</p>
            </div>`;
    }
}

// Executa a função assim que o DOM da página de blog estiver carregado
document.addEventListener('DOMContentLoaded', carregarPostsBlog);