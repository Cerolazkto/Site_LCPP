// Substitua pelas suas credenciais reais do Supabase
const SUPABASE_URL = 'https://sbernzrwccdmbwxelkls.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ztZPPn2HJq3VDkfLXfFqEA_ijzadfIv';

// CORREÇÃO: Mudamos o nome para supabaseClient para evitar conflito
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Referências aos elementos da tela
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');

// 1. VERIFICAR SE O USUÁRIO JÁ ESTÁ LOGADO
async function checarSessao() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        carregarListaDePosts(); // Carrega os posts para deletar
    } else {
        loginSection.style.display = 'block';
        dashboardSection.style.display = 'none';
    }
}

// 2. FUNÇÃO DE LOGIN
async function fazerLogin() {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert('Erro no login: ' + error.message);
    } else {
        alert('Login efetuado com sucesso!');
        checarSessao();
    }
}

// 3. FUNÇÃO DE LOGOUT
async function fazerLogout() {
    await supabaseClient.auth.signOut();
    checarSessao();
}

// 4. FUNÇÃO PARA CRIAR (POST) NOVO ARTIGO
async function criarPost() {
    const title = document.getElementById('postTitle').value;
    const slug = document.getElementById('postSlug').value;
    const excerpt = document.getElementById('postExcerpt').value;
    const content = document.getElementById('postContent').value;
    const image_url = document.getElementById('postImage').value;

    if (!title || !slug || !content) {
        alert('Preencha os campos obrigatórios (Título, Slug e Conteúdo).');
        return;
    }

    // O comando "insert" envia os dados para o Supabase
    const { data, error } = await supabaseClient
        .from('posts')
        .insert([
            { 
                title: title, 
                slug: slug, 
                excerpt: excerpt, 
                content: content, 
                image_url: image_url 
            }
        ]);

    if (error) {
        alert('Erro ao criar post: ' + error.message);
    } else {
        alert('Post publicado com sucesso!');
        // Limpar os campos do formulário
        document.getElementById('postTitle').value = '';
        document.getElementById('postSlug').value = '';
        document.getElementById('postExcerpt').value = '';
        document.getElementById('postContent').value = '';
        document.getElementById('postImage').value = '';
        
        // Atualiza a lista na tela
        carregarListaDePosts(); 
    }
}

// 5. FUNÇÃO PARA LISTAR OS POSTS (Para poder deletar)
async function carregarListaDePosts() {
    const postList = document.getElementById('adminPostList');
    postList.innerHTML = 'Carregando...';

    const { data: posts, error } = await supabaseClient
        .from('posts')
        .select('id, title, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        postList.innerHTML = 'Erro ao carregar posts.';
        return;
    }

    postList.innerHTML = posts.map(post => `
        <li style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #ccc;">
            <span><strong>${post.title}</strong></span>
            <button onclick="deletarPost('${post.id}')" style="background: #d93025; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer;">
                Deletar
            </button>
        </li>
    `).join('');
}

// 6. FUNÇÃO PARA DELETAR UM POST
async function deletarPost(id) {
    const confirmar = confirm("Tem certeza que deseja apagar este artigo definitivamente?");
    
    if (confirmar) {
        // O comando "delete" apaga a linha baseada no ID
        const { error } = await supabaseClient
            .from('posts')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao deletar: ' + error.message);
        } else {
            alert('Post deletado com sucesso.');
            carregarListaDePosts(); // Atualiza a lista
        }
    }
}

// Inicializa checando se o usuário está logado ao abrir a página
document.addEventListener('DOMContentLoaded', checarSessao);