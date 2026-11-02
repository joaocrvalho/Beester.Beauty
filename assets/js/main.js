(() => {
    "use strict";

    const ICONES = {
        sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 1.8L21.5 18.5l-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z"/>',
        heart: '<path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10z"/>',
        crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 10H5z"/>'
    };

    const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
    const $ = (id) => document.getElementById(id);

    // Escapa texto vindo do JSON antes de inserir como HTML
    const esc = (valor) =>
        String(valor ?? "").replace(/[&<>"']/g, (c) => (
            { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
        ));

    const texto = (id, valor) => { const el = $(id); if (el) el.textContent = valor ?? ""; };

    function foto(containerId, src, alt, rotulo) {
        const caixa = $(containerId);
        if (!caixa) return;
        const img = new Image();
        img.alt = alt || "";
        img.loading = "lazy";
        img.onerror = () => {
            caixa.innerHTML = `<div class="moldura__vazio" role="img" aria-label="${esc(alt)}">${esc(rotulo)}</div>`;
        };
        img.src = src;
        caixa.appendChild(img);
    }

    function logo(el, marca) {
        el.innerHTML = `<span class="marca__nome">${esc(marca.nome)}</span><span class="marca__desc">${esc(marca.subtitulo)}</span>`;
    }

    function montar(d) {
        const { marca } = d;

        document.title = `${marca.nome} | ${marca.descricao}`;

        // Marca e menu
        logo($("marca-logo"), marca);
        logo($("rodape-logo"), marca);
        $("menu").innerHTML = d.menu.map((m) => `<a href="${esc(m.alvo)}">${esc(m.rotulo)}</a>`).join("");

        // WhatsApp em todos os botões
        const wa = `https://wa.me/${marca.whatsapp}?text=${encodeURIComponent(marca.mensagemWhatsapp)}`;
        document.querySelectorAll("[data-whatsapp]").forEach((a) => {
            a.href = wa;
            a.target = "_blank";
            a.rel = "noopener";
        });

        // Hero
        texto("hero-titulo", d.hero.titulo);
        texto("hero-subtitulo", d.hero.subtitulo);
        texto("hero-botao", d.hero.botao);
        foto("hero-foto", d.hero.imagem, d.hero.imagemAlt, marca.nome);

        // Serviços
        texto("servicos-titulo", d.servicos.titulo);
        texto("servicos-subtitulo", d.servicos.subtitulo);
        $("servicos-lista").innerHTML = d.servicos.itens.map((s) => `
            <article class="card revelar${s.destaque ? " card--destaque" : ""}">
                ${s.destaque ? '<span class="card__selo">Mais especial</span>' : ""}
                <span class="card__icone" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONES[s.icone] || ICONES.sparkle}</svg>
                </span>
                <h3>${esc(s.nome)}</h3>
                <p>${esc(s.descricao)}</p>
                <div class="card__preco">${moeda.format(s.valor)}</div>
            </article>`).join("");

        // Informações do atendimento
        texto("atendimento-titulo", d.atendimento.titulo);
        texto("atendimento-texto", d.atendimento.texto);

        // Noivas
        texto("noivas-titulo", d.noivas.titulo);
        $("noivas-paragrafos").innerHTML = d.noivas.paragrafos.map((p) => `<p>${esc(p)}</p>`).join("");
        texto("previa-rotulo", d.noivas.previa.rotulo);
        texto("previa-valor", moeda.format(d.noivas.previa.valor));
        foto("noivas-foto", d.noivas.imagem, d.noivas.imagemAlt, "Noivas");

        // Adicionais
        texto("adicionais-titulo", d.adicionais.titulo);
        texto("adicionais-subtitulo", d.adicionais.subtitulo);
        $("adicionais-lista").innerHTML = d.adicionais.itens.map((i) =>
            `<li class="revelar"><span class="nome">${esc(i.nome)}</span><span class="valor">${moeda.format(i.valor)}</span></li>`
        ).join("");

        // Domicílio
        texto("domicilio-titulo", d.domicilio.titulo);
        texto("domicilio-texto", d.domicilio.texto);

        // Chamada final e rodapé
        texto("chamada-titulo", d.chamada.titulo);
        texto("chamada-texto", d.chamada.texto);
        texto("chamada-botao", d.chamada.botao);
        texto("rodape-descricao", marca.descricao);
        $("rodape-instagram").href = marca.instagram;
        texto("rodape-direitos", `© ${new Date().getFullYear()} ${marca.nome}. ${d.rodape.direitos}`);
    }

    function interacoes() {
        const topo = $("topo");
        const menu = $("menu");
        const botao = $("menu-toggle");
        const subir = $("subir");

        const fechar = () => {
            menu.classList.remove("aberto");
            botao.setAttribute("aria-expanded", "false");
        };
        botao.addEventListener("click", () => {
            const aberto = menu.classList.toggle("aberto");
            botao.setAttribute("aria-expanded", String(aberto));
        });
        menu.addEventListener("click", (e) => { if (e.target.closest("a")) fechar(); });
        document.addEventListener("keydown", (e) => { if (e.key === "Escape") fechar(); });

        window.addEventListener("scroll", () => {
            topo.classList.toggle("com-sombra", window.scrollY > 8);
            subir.hidden = window.scrollY < 600;
        }, { passive: true });
        subir.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

        // Animação de entrada
        const alvos = document.querySelectorAll(".revelar");
        if ("IntersectionObserver" in window) {
            const obs = new IntersectionObserver((itens) => {
                itens.forEach((i) => {
                    if (i.isIntersecting) { i.target.classList.add("visivel"); obs.unobserve(i.target); }
                });
            }, { threshold: 0.15 });
            alvos.forEach((el) => obs.observe(el));
        } else {
            alvos.forEach((el) => el.classList.add("visivel"));
        }
    }

    fetch("data/info.json")
        .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        })
        .then((dados) => { montar(dados); interacoes(); })
        .catch((erro) => {
            console.error("Falha ao carregar data/info.json:", erro);
            document.querySelector("main").innerHTML =
                '<p style="padding:80px 20px;text-align:center">Não foi possível carregar o conteúdo. Tente novamente em instantes.</p>';
        });
})();
