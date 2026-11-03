# Site — Escola Paraíso da Criança

Este é o site da escola. Ele fica no GitHub, é publicado de graça pelo GitHub Pages
e é editado por um painel simples, o **Pages CMS**, sem precisar mexer em código.

```
index.html          → estrutura do site (não precisa mexer)
assets/             → visual e funcionamento (não precisa mexer)
conteudo/           → TODOS os textos, fotos e vídeos de cada página  ← é isto que o painel edita
img/                → fotos
videos/             → vídeos
.pages.yml          → configuração do painel (não precisa mexer)
```

---

## Parte 1 — Colocar o site no ar (só uma vez)

1. Crie uma conta gratuita em **github.com** (se ainda não tiver).
2. Clique em **New repository** (botão verde "New").
   - Nome: `paraiso-da-crianca`
   - Marque **Public** (no plano gratuito, o GitHub Pages só publica repositórios públicos).
   - Clique em **Create repository**.
3. Na página do repositório recém-criado, clique em **uploading an existing file**.
4. Abra a pasta `paraiso-da-crianca` que você baixou (descompactada) e **arraste todo o conteúdo dela** para a janela do navegador.
   - ⚠️ Os arquivos `.pages.yml` e `.nojekyll` começam com ponto e ficam ocultos no computador.
     - **Mac:** no Finder, aperte `Cmd + Shift + .` para mostrá-los antes de arrastar.
     - **Windows:** no Explorador, menu **Exibir → Itens ocultos**.
   - Se mesmo assim o `.pages.yml` não subir: no GitHub, clique em **Add file → Create new file**, dê o nome `.pages.yml` e cole o conteúdo do arquivo `pages-yml-copia.txt`.
5. Clique em **Commit changes** e aguarde o envio terminar.
6. Vá em **Settings → Pages**. Em **Source**, escolha **Deploy from a branch**; em **Branch**, escolha `main` e a pasta `/ (root)`. Clique em **Save**.
7. Em 1 a 2 minutos o site estará no ar em: `https://SEU-USUARIO.github.io/paraiso-da-crianca/`
   (o endereço aparece no topo da mesma página **Settings → Pages**).

## Parte 2 — Ativar o painel de edição (só uma vez)

1. Acesse **app.pagescms.org** e clique em **Sign in with GitHub**.
2. Autorize e instale o aplicativo do Pages CMS no repositório `paraiso-da-crianca`.
3. Abra o repositório no painel. Na lateral esquerda aparecem as seções:
   **Configurações gerais, Página inicial, Nossa História, Berçário, Educação Infantil, Territórios, Proposta Pedagógica, Contato, Política de Privacidade.**

Pronto. A partir daqui, tudo é feito pelo painel.

---

## Parte 3 — Como editar

Abra a página que deseja alterar no painel, mude o que quiser e clique em **Save** (Salvar).
O site é atualizado sozinho em **1 a 2 minutos** (às vezes é preciso recarregar a página com `Ctrl + F5` / `Cmd + Shift + R`).

### Textos

| Você escreve | Aparece no site |
|---|---|
| Uma linha em branco entre dois trechos | Dois parágrafos |
| `**pequenas grandes**` num **título** | Palavras destacadas em vermelho |
| `**Berçário**` num **texto** | Palavra em negrito |
| Linhas começando com `- ` | Lista com marcadores |
| `[HORÁRIO A CONFIRMAR]` (entre colchetes) | Texto marcado em amarelo como pendente |

> Antes de divulgar o site, vá em **Configurações gerais** e desligue
> **"Destacar textos [pendentes] em amarelo"**. Com a opção desligada, textos entre colchetes somem do site.

### Fotos

Cada foto tem quatro campos:

- **Foto** — clique para enviar uma nova ou escolher uma que já está no site.
- **Descrição da foto** — uma frase descrevendo a cena (ajuda pessoas com deficiência visual e o Google).
- **Enquadramento** — escolha qual parte da foto deve aparecer quando ela for recortada (Centro, Topo, Base, Esquerda, Direita).
- **Mostrar a imagem inteira** — ligue apenas para logos e ilustrações.

Se o campo **Foto** ficar vazio, o site mostra um espaço reservado "Foto a definir".

**Dicas para as fotos:** formato JPG, até 2 MB, com no mínimo 1600 px de largura para fotos grandes. Use apenas imagens com autorização de uso das famílias.

### Vídeos

- **Vídeo da linha do tempo** (Nossa História): envie um MP4 ou cole um link do YouTube. O link do YouTube, se preenchido, tem prioridade.
- **Vídeo do banner** (Página inicial → Banner principal → Vídeo de fundo): opcional, sem som e em loop. Se ficar vazio, aparece a foto.
- Prefira vídeos comprimidos, com **até 20 MB** (o GitHub não aceita arquivos acima de 100 MB). Para vídeos longos, use o YouTube.

### Listas (linha do tempo, espaços, galeria, períodos, aulas…)

Use **Add** para incluir um item, o ícone de lixeira para remover e arraste para mudar a ordem.

### Desfazer uma alteração

Todas as versões ficam guardadas. No GitHub, abra o arquivo em `conteudo/`, clique em **History**
e escolha a versão anterior — ou peça ajuda a quem cuida do site.

---

## Parte 4 — Usar o domínio da escola (paraisodacrianca.com.br)

1. No GitHub: **Settings → Pages → Custom domain**, digite `paraisodacrianca.com.br` e clique em **Save**.
2. No painel onde o domínio está registrado (por exemplo, Hostinger → **Domínios → DNS**), crie:
   - 4 registros do tipo **A** para `@` apontando para:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - 1 registro **CNAME** para `www` apontando para `SEU-USUARIO.github.io`
   - Antes, apague registros **A** antigos de `@` e o **CNAME** antigo de `www`, se houver.
3. ⚠️ **Não altere os registros MX nem TXT de e-mail** — eles mantêm o e-mail `contato@paraisodacrianca.com.br` funcionando.
4. Aguarde a propagação (de minutos a 24 h). Depois, em **Settings → Pages**, marque **Enforce HTTPS**.
5. Fontes: no site da Adobe Fonts, em **Projetos web**, adicione o domínio `paraisodacrianca.com.br` ao projeto da fonte Bimbo Pro.

---

## Formulário de contato

Hoje o formulário valida os dados e oferece o envio pelo WhatsApp, com a mensagem já preenchida.
Para receber os pedidos por e-mail, crie um formulário gratuito no **Formspree** (formspree.io),
copie o endereço gerado (algo como `https://formspree.io/f/abcdwxyz`) e cole em
**Configurações gerais → Endereço de envio do formulário**.
