// ============================================
// Visualização de Artigo do Blog | LCPP
// Renderização de Rich Text e Metadados
// ============================================

async function carregarPost() {
    const postArea = document.getElementById('postContentArea');
    if (!postArea) return;
    
    // 1. Pegar o 'slug' da URL (ex: ?slug=novo-artigo)
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        postArea.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i data-lucide="alert-circle" style="width: 48px; height: 48px; color: #d93025; margin-bottom: 15px;"></i>
                <h2 style="color: #d93025; margin-bottom: 10px;">Artigo não especificado.</h2>
                <p style="color: #666; margin-bottom: 25px;">Por favor, selecione um artigo válido na lista do blog.</p>
                <a href="blog.html" class="btn-primary" style="text-decoration: none; display: inline-block;">Ver todos os artigos</a>
            </div>`;
        lucide.createIcons();
        return;
    }

    try {
        // 2. Buscar o post específico no Supabase pelo slug
        const { data: post, error } = await supabaseClient
            .from('posts')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) throw error;

        if (!post) {
            postArea.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <i data-lucide="file-question" style="width: 48px; height: 48px; color: #666; margin-bottom: 15px;"></i>
                    <h2 style="color: var(--preto-lcpp); margin-bottom: 10px;">Artigo não encontrado</h2>
                    <p style="color: #666; margin-bottom: 25px;">O artigo que você procura pode ter sido removido ou o endereço está incorreto.</p>
                    <a href="blog.html" class="btn-primary" style="text-decoration: none; display: inline-block;">Voltar ao Blog</a>
                </div>`;
            lucide.createIcons();
            return;
        }

        // 3. Atualizar o título e meta tags da página
        document.title = `${post.title} | Blog LCPP`;

        // 4. Formatar a data
        const dataFormatada = new Date(post.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        // 5. Formatar a imagem de capa (se existir)
        const imagem = post.image_url 
            ? `<img src="${post.image_url}" alt="${post.title}" class="post-cover" />` 
            : '';

        // 6. Tratamento do conteúdo: detecta se já é HTML rico (Quill) ou texto legado
        let conteudoFormatado = post.content || '';
        const contemHtml = /<[a-z][\s\S]*>/i.test(conteudoFormatado);
        if (!contemHtml) {
            conteudoFormatado = conteudoFormatado.replace(/\n/g, '<br>');
        }

        // 7. Renderizar no HTML
        postArea.innerHTML = `
            <div class="post-header reveal active">
                <span class="category-tag" style="margin-bottom: 12px; display: inline-block;">Pesquisa & Notícias</span>
                <h1 class="post-title">${post.title}</h1>
                <div class="post-meta">
                    <span><i data-lucide="user" style="width: 14px; height: 14px; vertical-align: middle;"></i> <strong>${post.author || 'LCPP'}</strong></span>
                    <span style="margin: 0 8px;">•</span>
                    <span><i data-lucide="calendar" style="width: 14px; height: 14px; vertical-align: middle;"></i> Publicado em ${dataFormatada}</span>
                </div>
            </div>
            ${imagem}
            <div class="post-body reveal active">
                ${conteudoFormatado}
            </div>
            
            <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: gap: 15px;">
                <a href="blog.html" class="btn-light" style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
                    <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i> Todos os Artigos
                </a>
                <button onclick="navigator.clipboard.writeText(window.location.href); alert('Link copiado para a área de transferência!');" class="btn-light" style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer;">
                    <i data-lucide="share-2" style="width: 16px; height: 16px;"></i> Compartilhar
                </button>
            </div>
        `;

        // Inicializar os ícones do Lucide
        lucide.createIcons();

    } catch (err) {
        console.error('Erro ao carregar o post:', err);
        postArea.innerHTML = `
            <div style="text-align: center; color: #d93025; padding: 50px 20px;">
                <i data-lucide="wifi-off" style="width: 44px; height: 44px; margin-bottom: 12px;"></i>
                <p><strong>Erro de conexão:</strong> Não foi possível carregar este artigo.</p>
                <p style="color: #666; font-size: 0.9rem; margin-top: 8px;"><small>${err.message}</small></p>
                <a href="blog.html" class="btn-light" style="margin-top: 20px; display: inline-block; text-decoration: none;">Voltar para o blog</a>
            </div>`;
        lucide.createIcons();
    }
}

// Rodar a função ao abrir a página
document.addEventListener('DOMContentLoaded', carregarPost);
