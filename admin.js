// ============================================
// Painel Administrativo do Blog LCPP
// Gerenciamento de Conteúdo, Quill e Storage
// ============================================

// Referências aos elementos da tela
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const navLogoutBtn = document.getElementById('navLogoutBtn');
const loggedUserEmail = document.getElementById('loggedUserEmail');
const postsCountBadge = document.getElementById('postsCountBadge');

// Instância do Quill Rich Text Editor
let quillEditor = null;

// Controle de Imagem Selecionada
let modoImagemAtual = 'upload'; // 'upload' ou 'url'
let arquivoImagemSelecionado = null;

// 1. INICIALIZAÇÃO DO QUILL EDITOR
function inicializarQuill() {
    if (quillEditor || !document.getElementById('quillEditor')) return;

    quillEditor = new Quill('#quillEditor', {
        theme: 'snow',
        placeholder: 'Escreva o conteúdo completo da publicação aqui...',
        modules: {
            toolbar: [
                [{ 'header': [2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['blockquote', 'code-block'],
                ['link', 'image'],
                ['clean']
            ]
        }
    });
}

// 2. CONTROLE DE ABAS DE IMAGEM (UPLOAD vs URL)
function alternarAbaImagem(modo) {
    modoImagemAtual = modo;
    const tabUpload = document.getElementById('tabUploadBtn');
    const tabUrl = document.getElementById('tabUrlBtn');
    const uploadMode = document.getElementById('imageUploadMode');
    const urlMode = document.getElementById('imageUrlMode');

    if (modo === 'upload') {
        tabUpload.classList.add('active');
        tabUrl.classList.remove('active');
        uploadMode.style.display = 'block';
        urlMode.style.display = 'none';
    } else {
        tabUrl.classList.add('active');
        tabUpload.classList.remove('active');
        uploadMode.style.display = 'none';
        urlMode.style.display = 'block';
    }
}

// 3. SELEÇÃO E PRÉ-VISUALIZAÇÃO DE IMAGEM
function selecionarArquivoImagem(input) {
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Validação de tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('A imagem é muito grande! Por favor, escolha uma imagem com até 5MB.');
        input.value = '';
        return;
    }

    arquivoImagemSelecionado = file;
    const previewContainer = document.getElementById('imagePreviewContainer');
    const previewImg = document.getElementById('imagePreviewEl');
    const fileNameSpan = document.getElementById('imageFileName');

    const reader = new FileReader();
    reader.onload = function(e) {
        previewImg.src = e.target.result;
        fileNameSpan.textContent = `${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
        previewContainer.classList.add('active');
        lucide.createIcons();
    };
    reader.readAsDataURL(file);
}

function removerImagemSelecionada() {
    arquivoImagemSelecionado = null;
    const fileInput = document.getElementById('postImageFile');
    if (fileInput) fileInput.value = '';

    const previewContainer = document.getElementById('imagePreviewContainer');
    if (previewContainer) previewContainer.classList.remove('active');
    
    const previewImg = document.getElementById('imagePreviewEl');
    if (previewImg) previewImg.src = '';
}

// 4. FUNÇÃO PARA ENVIAR IMAGEM AO SUPABASE STORAGE
async function fazerUploadImagemParaStorage(file) {
    const bucket = typeof SUPABASE_STORAGE_BUCKET !== 'undefined' ? SUPABASE_STORAGE_BUCKET : 'blog-images';
    
    // Sanitização do nome do arquivo
    const extensao = file.name.split('.').pop();
    const nomeLimpo = file.name
        .substring(0, file.name.lastIndexOf('.'))
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
    const caminhoArquivo = `posts/${Date.now()}_${nomeLimpo}.${extensao}`;

    // Upload usando o Supabase JS Client
    const { data, error } = await supabaseClient.storage
        .from(bucket)
        .upload(caminhoArquivo, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Erro no upload para o Supabase Storage:', error);
        throw new Error(
            `Erro ao enviar imagem para o Storage: ${error.message}.\n\n` +
            `Dica: Verifique se o bucket "${bucket}" foi criado como PÚBLICO no painel do Supabase.`
        );
    }

    // Obter URL pública do arquivo enviado
    const { data: publicUrlData } = supabaseClient.storage
        .from(bucket)
        .getPublicUrl(caminhoArquivo);

    return publicUrlData.publicUrl;
}

// 5. GERADOR AUTOMÁTICO DE SLUG A PARTIR DO TÍTULO
function configurarGeradorDeSlug() {
    const titleInput = document.getElementById('postTitle');
    const slugInput = document.getElementById('postSlug');
    if (!titleInput || !slugInput) return;

    let slugEditadoManualmente = false;

    slugInput.addEventListener('input', () => {
        slugEditadoManualmente = slugInput.value.trim().length > 0;
    });

    titleInput.addEventListener('input', () => {
        if (!slugEditadoManualmente) {
            slugInput.value = titleInput.value
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
                .replace(/[^a-z0-9\s-]/g, '') // remove caracteres especiais
                .trim()
                .replace(/\s+/g, '-'); // substitui espaços por hífens
        }
    });
}

// 6. VERIFICAR SE O USUÁRIO JÁ ESTÁ LOGADO
async function checarSessao() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (session && session.user) {
            loginSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            if (navLogoutBtn) navLogoutBtn.style.display = 'inline-block';
            if (loggedUserEmail) loggedUserEmail.textContent = session.user.email || 'Admin';
            
            inicializarQuill();
            configurarGeradorDeSlug();
            carregarListaDePosts();
        } else {
            loginSection.style.display = 'block';
            dashboardSection.style.display = 'none';
            if (navLogoutBtn) navLogoutBtn.style.display = 'none';
        }
    } catch (e) {
        console.error('Erro ao verificar sessão:', e);
    }
    lucide.createIcons();
}

// 7. FUNÇÃO DE LOGIN
async function fazerLogin() {
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    const btnSubmit = document.getElementById('btnLoginSubmit');

    if (!email || !password) {
        alert('Por favor, informe seu e-mail e senha.');
        return;
    }

    try {
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Entrando...';
        }

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            alert('Falha ao autenticar: ' + error.message);
        } else {
            checarSessao();
        }
    } catch (err) {
        alert('Erro inesperado: ' + err.message);
    } finally {
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Entrar no Painel';
        }
    }
}

// 8. FUNÇÃO DE LOGOUT
async function fazerLogout() {
    if (confirm('Deseja realmente sair do painel administrativo?')) {
        await supabaseClient.auth.signOut();
        checarSessao();
    }
}

// 9. FUNÇÃO PARA CRIAR (POST) NOVO ARTIGO COM UPLOAD E RICH TEXT
async function criarPost() {
    const title = document.getElementById('postTitle').value.trim();
    const slug = document.getElementById('postSlug').value.trim();
    const author = document.getElementById('postAuthor').value.trim() || 'LCPP';
    const excerpt = document.getElementById('postExcerpt').value.trim();
    const btnPublicar = document.getElementById('btnPublicar');
    const btnPublicarTexto = document.getElementById('btnPublicarTexto');

    // Validação de conteúdo do Quill
    const contentHtml = quillEditor ? quillEditor.root.innerHTML : '';
    const contentText = quillEditor ? quillEditor.getText().trim() : '';

    if (!title) {
        alert('Informe o título do post.');
        document.getElementById('postTitle').focus();
        return;
    }

    if (!slug) {
        alert('Informe a URL amigável (slug) do artigo.');
        document.getElementById('postSlug').focus();
        return;
    }

    if (!contentText || contentText.length === 0) {
        alert('O artigo precisa ter algum conteúdo de texto.');
        if (quillEditor) quillEditor.focus();
        return;
    }

    // Iniciar processo de publicação com feedback visual
    btnPublicar.disabled = true;
    const textoOriginal = btnPublicarTexto.textContent;

    try {
        let finalImageUrl = '';

        // Tratamento da Imagem: Upload para Storage ou URL Direta
        if (modoImagemAtual === 'upload' && arquivoImagemSelecionado) {
            btnPublicarTexto.textContent = 'Enviando imagem para o Storage...';
            finalImageUrl = await fazerUploadImagemParaStorage(arquivoImagemSelecionado);
        } else if (modoImagemAtual === 'url') {
            finalImageUrl = document.getElementById('postImage').value.trim();
        }

        btnPublicarTexto.textContent = 'Salvando artigo no banco...';

        // Inserir post no Supabase com suporte a HTML rico e imagem
        const { data, error } = await supabaseClient
            .from('posts')
            .insert([
                { 
                    title: title, 
                    slug: slug, 
                    author: author,
                    excerpt: excerpt || contentText.substring(0, 160) + '...', 
                    content: contentHtml, 
                    image_url: finalImageUrl || null,
                    published: true
                }
            ]);

        if (error) {
            throw error;
        }

        alert('✅ Artigo publicado com sucesso!');

        // Limpar formulário
        document.getElementById('postTitle').value = '';
        document.getElementById('postSlug').value = '';
        document.getElementById('postExcerpt').value = '';
        document.getElementById('postAuthor').value = 'LCPP';
        
        const postImageInput = document.getElementById('postImage');
        if (postImageInput) postImageInput.value = '';
        
        removerImagemSelecionada();

        if (quillEditor) {
            quillEditor.setContents([]);
        }

        // Recarregar lista de posts
        carregarListaDePosts();

    } catch (err) {
        console.error('Erro ao publicar:', err);
        alert('Erro ao publicar artigo:\n' + err.message);
    } finally {
        btnPublicar.disabled = false;
        btnPublicarTexto.textContent = textoOriginal;
        lucide.createIcons();
    }
}

// 10. LISTAR POSTS PUBLICADOS (COM CONTADOR E OPÇÃO DE EXCLUIR)
async function carregarListaDePosts() {
    const postList = document.getElementById('adminPostList');
    if (!postList) return;

    postList.innerHTML = '<li style="text-align: center; color: #888; padding: 20px;">Carregando publicações...</li>';

    try {
        const { data: posts, error } = await supabaseClient
            .from('posts')
            .select('id, title, slug, created_at, author, image_url')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (postsCountBadge) {
            postsCountBadge.textContent = `${posts.length} ${posts.length === 1 ? 'artigo' : 'artigos'}`;
        }

        if (!posts || posts.length === 0) {
            postList.innerHTML = `
                <li style="text-align: center; color: #888; padding: 30px;">
                    Nenhum artigo publicado ainda. Use o formulário acima para publicar o primeiro!
                </li>`;
            return;
        }

        postList.innerHTML = posts.map(post => {
            const dataFmt = new Date(post.created_at).toLocaleDateString('pt-BR');
            const thumb = post.image_url || 'imgs/lab1.jpeg';

            return `
                <li class="admin-post-item" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #edf2f7; gap: 15px;">
                    <div style="display: flex; align-items: center; gap: 15px; overflow: hidden;">
                        <img src="${thumb}" alt="${post.title}" style="width: 55px; height: 55px; object-fit: cover; border-radius: 8px; flex-shrink: 0; background: var(--azul-claro);">
                        <div style="overflow: hidden;">
                            <strong style="display: block; color: var(--preto-lcpp); font-size: 1rem; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
                                ${post.title}
                            </strong>
                            <small style="color: #666; font-size: 0.8rem;">
                                Por ${post.author || 'LCPP'} • Publicado em ${dataFmt} • <a href="post.html?slug=${post.slug}" target="_blank" style="color: var(--azul-royal); text-decoration: none; font-weight: 600;">Ver artigo ↗</a>
                            </small>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; flex-shrink: 0;">
                        <button onclick="deletarPost('${post.id}', '${post.title.replace(/'/g, "\\'")}')" style="background: #fee2e2; color: #dc2626; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; transition: var(--transition);">
                            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Deletar
                        </button>
                    </div>
                </li>
            `;
        }).join('');

        lucide.createIcons();

    } catch (err) {
        console.error('Erro ao listar posts:', err);
        postList.innerHTML = `<li style="color: #d93025; padding: 20px; text-align: center;">Erro ao carregar lista de artigos: ${err.message}</li>`;
    }
}

// 11. FUNÇÃO PARA DELETAR UM POST
async function deletarPost(id, titulo) {
    const confirmar = confirm(`Tem certeza que deseja apagar definitivamente o artigo:\n"${titulo}"?`);
    
    if (confirmar) {
        try {
            const { error } = await supabaseClient
                .from('posts')
                .delete()
                .eq('id', id);

            if (error) throw error;

            alert('Artigo deletado com sucesso.');
            carregarListaDePosts();
        } catch (err) {
            alert('Não foi possível deletar o post: ' + err.message);
        }
    }
}

// Inicializa a verificação de sessão ao carregar a página
document.addEventListener('DOMContentLoaded', checarSessao);
