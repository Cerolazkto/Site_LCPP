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
});