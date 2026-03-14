Um rate limiter é responsável por controlar a taxa de tráfego enviada por um cliente ou serviço. No contexto HTTP, ele limita o número de requisições que um cliente pode fazer dentro de um período específico. Quando o limite é ultrapassado, as chamadas excedentes são bloqueadas automaticamente.

## Por que usar um Rate Limiter?

A primeira vantagem é a proteção contra ataques de negação de serviço (DoS). Ao limitar o número de requisições por cliente, o sistema evita a exaustão de recursos causada por tráfego malicioso ou automatizado.

Outro benefício é a redução de custos. Ao bloquear requisições desnecessárias ou abusivas, menos recursos computacionais são consumidos. Isso significa menos servidores ativos e melhor alocação de infraestrutura para APIs prioritárias.

Além disso, o rate limiter evita sobrecarga dos servidores. Bots, scripts mal configurados ou usuários mal-intencionados podem gerar picos de tráfego que prejudicam a experiência de todos. A limitação de requisições atua como uma camada de proteção preventiva.

## Contadores de requisições

A base de qualquer algoritmo de rate limiting é um contador que registra quantas requisições foram feitas por um determinado usuário, IP ou token de API.

Armazenar esses contadores em banco de dados tradicional não é recomendado devido à latência de acesso em disco. Por isso, a melhor abordagem é utilizar armazenamento em memória, que oferece alta performance e suporte a expiração automática de dados.

Uma das soluções mais populares é o Redis, um banco de dados em memória que oferece comandos como:

- **INCR**: incrementa um contador.
- **EXPIRE**: define um tempo de expiração para a chave.

Essa combinação permite implementar contadores com validade automática, ideal para janelas de tempo.

## Principais algoritmos de Rate Limiting

### Token Bucket

O algoritmo Token Bucket utiliza um “balde” com capacidade fixa que armazena tokens. Esses tokens são adicionados periodicamente a uma taxa definida.

Cada requisição consome um token. Se houver tokens disponíveis, a requisição é permitida; caso contrário, é rejeitada.

Esse modelo é simples de implementar, eficiente em memória e permite pequenos picos de tráfego, desde que existam tokens acumulados. No entanto, ajustar corretamente o tamanho do balde e a taxa de reposição pode ser desafiador.

### Leaking Bucket

O Leaking Bucket é semelhante ao Token Bucket, mas processa requisições a uma taxa fixa. Ele normalmente utiliza uma fila FIFO.

Quando uma requisição chega, ela é adicionada à fila, desde que haja espaço. As requisições são processadas em intervalos regulares. Se a fila estiver cheia, novas requisições são descartadas.

Esse algoritmo é adequado para cenários que exigem taxa de saída estável. Porém, picos podem preencher a fila rapidamente, causando bloqueio de requisições recentes.

### Fixed Window Counter

Esse algoritmo divide o tempo em janelas fixas (por exemplo, por minuto). Cada janela possui um contador. Quando o limite é atingido, novas requisições são bloqueadas até o início da próxima janela.

Ele é simples e eficiente em memória, mas possui um problema conhecido: picos nas bordas das janelas podem permitir que mais requisições passem do que o limite definido.

### Sliding Window Log

Para resolver o problema das bordas da janela fixa, o Sliding Window Log registra o timestamp de cada requisição.

Quando uma nova requisição chega, timestamps antigos (fora da janela atual) são removidos. Se o número de registros dentro da janela for menor que o limite, a requisição é aceita.

Essa abordagem é extremamente precisa, pois garante que o limite nunca seja ultrapassado em qualquer intervalo móvel. Em contrapartida, consome mais memória, já que armazena todos os registros recentes, inclusive de requisições rejeitadas.

### Sliding Window Counter

O Sliding Window Counter combina as abordagens de janela fixa e janela deslizante. Ele calcula uma média ponderada entre a janela atual e a anterior.

Essa técnica suaviza picos de tráfego e é mais eficiente em memória do que o Sliding Window Log. Entretanto, trata-se de uma aproximação estatística, podendo gerar pequenas imprecisões.

## Visão Geral da Arquitetura

O rate limiter costuma funcionar como um middleware.

O fluxo geralmente segue este padrão:

1. O cliente envia uma requisição.
2. Essa requisição passa primeiro pelo middleware de rate limiting.
3. O middleware consulta o contador no Redis e verifica se o limite foi atingido.
4. Se o limite não foi alcançado, a requisição segue para os servidores de API e o contador é incrementado.
5. Caso contrário, a requisição é rejeitada.

Quando o limite é excedido, o servidor retorna o código HTTP **429 (Too Many Requests)**.

## Headers HTTP de Rate Limiting

Para informar o cliente sobre seu estado de consumo, o servidor pode retornar headers específicos:

- **X-RateLimit-Remaining**: número de requisições restantes na janela atual.
- **X-RateLimit-Limit**: limite máximo permitido por janela.
- **X-RateLimit-Retry-After**: tempo em segundos até que novas requisições sejam permitidas.

Esses headers ajudam clientes e integradores a ajustarem automaticamente seu comportamento.

## Conclusão

O rate limiter é um componente importante em arquiteturas de APIs, pois ajuda a controlar o volume de requisições, evitar abusos e manter a estabilidade do sistema. A escolha do algoritmo depende do nível de precisão desejado, do padrão de tráfego e dos requisitos de desempenho.

Em muitos cenários, a combinação de cache em memória, middleware dedicado e infraestrutura distribuída oferece um bom equilíbrio entre eficiência e escalabilidade. Para quem desenvolve APIs, microsserviços ou plataformas SaaS, implementar rate limiting faz parte das boas práticas de arquitetura e contribui para um ambiente mais previsível e controlado.

**Referência**: XU, Alex. **System Design Interview** – An insider’s guide. ByteByteGo, 2022.