document.addEventListener('DOMContentLoaded', () => {
    // Inicializar ícones do Lucide
    lucide.createIcons();

    // 1. EFEITO DE CONTADOR ANIMADO
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    const animateCounters = () => {
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = parseInt(counter.innerText) || 0;
                const inc = target / speed;

                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 10);
                } else {
                    counter.innerText = target + "+";
                }
            };
            updateCount();
        });
    };

    // --- LÓGICA DO INDICADOR DE NAVEGAÇÃO (SCROLLSPY) ---
    // Renomeado para scrollSpyOptions para evitar conflito
    const scrollSpyOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px', 
        threshold: 0
    };

    const scrollSpyCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    const navObserver = new IntersectionObserver(scrollSpyCallback, scrollSpyOptions);

    document.querySelectorAll('section[id]').forEach(section => {
        navObserver.observe(section);
    });

    // 2. OBSERVAR SCROLL PARA REVELAR ELEMENTOS
    const revealElements = document.querySelectorAll('.reveal');
    
    // Renomeado para revealOptions
    const revealOptions = {
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Se for a seção de stats, inicia o contador
                if (entry.target.classList.contains('stats')) {
                    animateCounters();
                }
            }
        }); 
    }, revealOptions);

    revealElements.forEach(el => revealObserver.observe(el));

    // Observar a seção de stats apenas se ela existir
    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        revealObserver.observe(statsSection);
    }

    // 3. MUDANÇA DE COR DA NAVBAR AO ROLAR
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.navbar');
        if (nav) {
            if (window.scrollY > 50) {
                nav.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
            } else {
                nav.style.boxShadow = "none";
            }
        }
    });

    // 4. INTERATIVIDADE NO ORGANOGRAMA
    const memberCards = document.querySelectorAll('.member-card');

    memberCards.forEach(card => {
        card.addEventListener('click', () => {
            memberCards.forEach(c => {
                c.style.transform = 'scale(1)';
                c.style.borderColor = '#eee'; // Reset para cor padrão
            });
            card.style.transform = 'scale(1.05)';
            card.style.borderColor = '#1E6FBF'; // Cor Azul Royal
        });
    });

    // 5. EFEITO PARALLAX NA GOTA
    window.addEventListener('scroll', () => {
        const heroIcon = document.querySelector('.hero-bg-icon');
        if (heroIcon) {
            let value = window.scrollY;
            heroIcon.style.transform = `translateY(${value * 0.2}px) rotate(${value * 0.05}deg)`;
        }
    });

    // Função para filtrar a tabela em tempo real com JavaScript Vanilla
    document.getElementById('searchInput').addEventListener('keyup', function() {
        const filter = this.value.toLowerCase();
        const rows = document.querySelectorAll('#portfolioTable tbody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            // Alterna a exibição com base na correspondência textual
            row.style.display = text.includes(filter) ? '' : 'none';
        });
    });

    // 6. VALIDAÇÃO DO FORMULÁRIO DE CONTATO
    const formContato = document.getElementById('formContato');

    if (formContato) {
        formContato.addEventListener('submit', function(evento) {
            evento.preventDefault(); // Impede a página de recarregar
            
            let formularioValido = true;

            // Captura dos campos
            const nome = document.getElementById('nome');
            const email = document.getElementById('email');
            const mensagem = document.getElementById('mensagem');

            // Função auxiliar para exibir erros
            const mostrarErro = (input, mensagemDeErro) => {
                const spanErro = document.getElementById(`${input.id}Error`);
                spanErro.textContent = mensagemDeErro;
                input.classList.add('input-error');
                formularioValido = false;
            };

            // Função auxiliar para limpar os erros
            const limparErro = (input) => {
                const spanErro = document.getElementById(`${input.id}Error`);
                spanErro.textContent = '';
                input.classList.remove('input-error');
            };

            // Reseta os erros a cada nova tentativa
            [nome, email, mensagem].forEach(limparErro);

            // 1. Validar Nome
            if (nome.value.trim() === '') {
                mostrarErro(nome, 'Por favor, informe seu nome completo.');
            }

            // 2. Validar E-mail com Regex
            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email.value.trim() === '') {
                mostrarErro(email, 'Por favor, informe seu e-mail.');
            } else if (!regexEmail.test(email.value.trim())) {
                mostrarErro(email, 'Informe um formato de e-mail válido.');
            }

            // 3. Validar Mensagem
            if (mensagem.value.trim() === '') {
                mostrarErro(mensagem, 'Por favor, escreva a sua mensagem.');
            } else if (mensagem.value.trim().length < 15) {
                mostrarErro(mensagem, 'Sua mensagem deve conter pelo menos 15 caracteres.');
            }

            // Se estiver tudo correto, simula o envio!
            if (formularioValido) {
                // 1. Prepara o botão para o estado de "A enviar..."
                const botaoSubmit = formContato.querySelector('button[type="submit"]');
                const textoOriginalBotao = botaoSubmit.textContent;
                botaoSubmit.textContent = 'A enviar...';
                botaoSubmit.disabled = true; // Previne duplo clique
                botaoSubmit.style.opacity = '0.7';
                botaoSubmit.style.cursor = 'not-allowed';

                // 2. Prepara os dados do formulário
                const formData = new FormData(formContato);

                // 3. Faz o envio real para o Formspree
                // SUBSTITUA O LINK ABAIXO PELO SEU ENDPOINT DO FORMSPREE
                fetch('https://formspree.io/f/mgoqkrbk', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    if (response.ok) {
                        // Sucesso no envio
                        const msgSucesso = document.getElementById('msgSucesso');
                        msgSucesso.classList.add('show');
                        
                        formContato.reset(); // Limpa os campos
                        
                        // Oculta a mensagem de sucesso após 5 segundos
                        setTimeout(() => {
                            msgSucesso.classList.remove('show');
                        }, 5000);
                    } else {
                        // Erro retornado pelo servidor do Formspree
                        alert('Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente mais tarde.');
                    }
                })
                .catch(error => {
                    // Erro de rede (falha na internet do utilizador, etc)
                    alert('Erro de conexão. Verifique a sua internet e tente novamente.');
                    console.error('Erro no fetch:', error);
                })
                .finally(() => {
                    // 4. Restaura o botão ao estado original, independentemente de sucesso ou erro
                    botaoSubmit.textContent = textoOriginalBotao;
                    botaoSubmit.disabled = false;
                    botaoSubmit.style.opacity = '1';
                    botaoSubmit.style.cursor = 'pointer';
                });
            }
        });
    }

    // CONFIGURAÇÃO DO SUPABASE
    // Substitua pelas suas credenciais obtidas no painel do Supabase (Project Settings > API)
    const SUPABASE_URL = 'https://sbernzrwccdmbwxelkls.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_ztZPPn2HJq3VDkfLXfFqEA_ijzadfIv';

    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // BUSCAR E RENDERIZAR POSTS DO BLOG
    async function carregarPostsBlog() {
        const blogGrid = document.getElementById('blogGrid');
        if (!blogGrid) return;

        try {
            const { data: posts, error } = await supabaseClient
                .from('posts')
                .select('*')
                .eq('published', true)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!posts || posts.length === 0) {
                blogGrid.innerHTML = '<p class="blog-loading">Nenhum artigo publicado no momento.</p>';
                return;
            }

            blogGrid.innerHTML = posts.map(post => {
                const dataFormatada = new Date(post.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });

                const imagem = post.image_url || 'imgs/lab1.jpeg';

                return `
                    <article class="blog-card">
                        <img src="${imagem}" alt="${post.title}" class="blog-card-img" />
                        <div class="blog-card-content">
                            <div class="blog-card-meta">${dataFormatada} • ${post.author}</div>
                            <h3 class="blog-card-title">${post.title}</h3>
                            <p class="blog-card-excerpt">${post.excerpt || ''}</p>
                            <a href="post.html?slug=${post.slug}" class="btn-light" style="text-align: center; text-decoration: none;">Ler Artigo</a>
                        </div>
                    </article>
                `;
            }).join('');

        } catch (err) {
            console.error('Erro ao carregar posts:', err);
            blogGrid.innerHTML = '<p class="blog-loading">Erro ao carregar os artigos. Tente novamente mais tarde.</p>';
        }
    }

    // Chamar a função após o DOM carregar
    document.addEventListener('DOMContentLoaded', () => {
        carregarPostsBlog();
    });

});