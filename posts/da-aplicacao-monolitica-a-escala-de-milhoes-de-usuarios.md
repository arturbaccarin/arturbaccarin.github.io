Escalar uma aplicação para milhões de usuários exige decisões arquiteturais bem fundamentadas, sempre guiadas por **limitações** do sistema, partindo de uma arquitetura monolítica simples até uma arquitetura distribuída e altamente escalável.

## Sistema inicial

No estágio inicial, uma aplicação normalmente roda em **um único servidor**. Os usuários acessam o site por meio de um domínio, resolvido por serviços de DNS terceirizados. O navegador ou aplicativo móvel recebe o endereço IP do servidor e envia requisições HTTP diretamente a ele. O servidor processa as requisições e retorna páginas HTML ou respostas JSON.

**Limitações:** Como toda a aplicação depende de um único servidor, qualquer falha torna o sistema completamente indisponível, já que não existe mecanismo de failover (processo automático de transferência de operações para um sistema, servidor ou rede de backup redundante quando o componente principal falha.). Além disso, à medida que o número de usuários cresce, o servidor rapidamente se torna um gargalo de performance, podendo atingir seu limite de capacidade e causar lentidão ou falhas de conexão. 

Outro ponto crítico é o fato de o servidor web ser stateful, mantendo sessões localmente. Isso dificulta a expansão horizontal e aumenta o risco de falhas ao adicionar ou remover servidores. 

Por fim, o mesmo servidor precisa lidar tanto com o tráfego web quanto com as operações de banco de dados, o que mistura responsabilidades e torna o escalonamento mais complexo, já que qualquer aumento de carga afeta todos os serviços hospedados nele.

## Separação das camadas web e banco de dados

O primeiro incremento é **dividir o sistema em duas camadas**: uma camada web (web tier) e uma camada de banco de dados (data tier). O servidor web passa a lidar apenas com requisições HTTP e renderização de páginas ou respostas JSON, enquanto o banco de dados é hospedado em um servidor separado.

Essa separação permite que cada camada seja escalada **independentemente**: se o tráfego web aumentar, podemos adicionar servidores web; se a carga de dados crescer, podemos aumentar a capacidade do banco de dados.

**Limitações:** Apesar dessa melhoria estrutural, o sistema ainda possui pontos únicos de falha. Se o servidor web ou o banco de dados ficarem indisponíveis, a aplicação para de funcionar, pois não há redundância em nenhuma das camadas. Além disso, o tráfego continua concentrado em um único servidor web e em um único banco de dados, o que mantém o risco de gargalos de performance conforme a base de usuários cresce.

## Load balancer e múltiplos servidores web

Agora introduzimos **um load balancer** e múltiplos servidores web. Ele distribui o tráfego entre os servidores, evitando pontos únicos de falha. Usuários agora se conectam diretamente ao IP público do load balancer, enquanto os servidores web usam **IPs privados** para se comunicar entre si, aumentando a segurança.

Com dois ou mais servidores, o sistema ganha **alta disponibilidade**: se um servidor falhar, o tráfego é redirecionado automaticamente para os servidores saudáveis. Além disso, o load balancer permite **escalar horizontalmente**, adicionando novos servidores conforme o aumento da demanda.

**Limitações:** Apesar da alta disponibilidade na camada web, o banco de dados continua sendo um ponto único de falha. Como existe apenas uma instância responsável pelas operações, qualquer problema no banco interrompe o funcionamento do sistema, especialmente as operações de escrita.

Além disso, um único banco de dados tem capacidade limitada para atender grandes volumes de leituras simultâneas. À medida que o número de usuários cresce, as consultas se acumulam, aumentando a latência e tornando o sistema vulnerável a sobrecarga.

## Replicação leader-followers

A solução é implementar **replicação de banco de dados** no modelo leader-followers. O banco leader processa todas as operações de escrita, enquanto os followers replicam os dados e processam leituras. Essa arquitetura melhora a performance e garante alta disponibilidade.

Se um follower falhar, suas leituras são redirecionadas para outros followers ou temporariamente para o leader. Se o leader falhar, um follower é promovido a leader, e um novo follower é criado para manter a replicação. Esse modelo garante que o sistema continue operando mesmo em caso de falha em um dos servidores.

**Limitações:** Mesmo com replicação de banco e múltiplos servidores web, o sistema enfrenta problemas de **latência**. Consultas frequentes ao banco aumentam o tempo de resposta, enquanto arquivos estáticos como imagens, vídeos, CSS e JavaScript são entregues diretamente pelo servidor, resultando em lentidão para usuários geograficamente distantes.

## Cache e CDN

Para resolver esse problema, introduzimos **uma camada de cache** e utilizamos **Content Delivery Networks (CDNs)**. O cache mantém em memória dados frequentemente acessados, reduzindo a carga no banco e acelerando respostas. O CDN distribui arquivos estáticos globalmente, entregando-os a partir do servidor mais próximo do usuário, diminuindo significativamente a latência.

Para manter a consistência e a confiabilidade, políticas de expiração (TTL), estratégias de failover e técnicas de invalidação de arquivos são essenciais. Isso garante que conteúdo estático esteja atualizado e disponível mesmo em caso de falha de um servidor de CDN.

**Limitações:** Servidores web stateful, que mantêm sessões localmente, ainda representam um problema para escalabilidade. Cada requisição precisa ser direcionada para o mesmo servidor, dificultando a adição ou remoção de servidores e aumentando o risco de falha. Essa arquitetura também complica o balanceamento de carga e o failover.

## Web tier stateless e autoscaling

A solução é **remover o estado dos servidores web**, armazenando sessões em um **data store compartilhado**, que pode ser um banco de dados relacional, NoSQL ou cache distribuído como Redis/Memcached. Isso cria uma arquitetura **stateless**, permitindo que qualquer servidor atenda qualquer requisição.

Com essa abordagem, a camada web se torna **autoscalável**: servidores podem ser adicionados ou removidos automaticamente conforme a demanda, tornando o sistema mais robusto e resiliente.

**Limitações:** Quando a aplicação cresce internacionalmente, surgem novos desafios: usuários distantes dos servidores sofrem maior latência, e a indisponibilidade de um data center pode afetar toda a operação. Além disso, a sincronização de dados entre regiões e deploys consistentes tornam-se críticos.

## Multi-data center

Para resolver esses problemas, utilizamos **múltiplos data centers**. O tráfego é redirecionado para o centro de dados mais próximo via **GeoDNS**, enquanto dados e caches são replicados entre regiões. Deploys automatizados garantem consistência entre todos os data centers, e estratégias de replicação assíncrona ajudam a manter disponibilidade global.

**Limitações:** Alguns processos demorados, como customização de fotos (corte, ajuste, filtros), sobrecarregam a camada web. Além disso, componentes fortemente acoplados dificultam escalabilidade independente e manutenção.

## Filas de mensagens e processamento assíncrono

A solução é introduzir **filas de mensagens**. Servidores web publicam tarefas na fila, que são consumidas por workers especializados. Produtores e consumidores podem escalar independentemente: se a fila crescer, adicionamos mais workers; se a fila estiver vazia, reduzimos os workers.

Isso desacopla componentes do sistema, melhora a performance e garante que tarefas demoradas não bloqueiem respostas aos usuários.

**Limitações:** À medida que a base de usuários cresce, mesmo com replicação e cache, o banco de dados pode se tornar um gargalo. Operações de leitura e escrita concentradas em poucos servidores limitam a escalabilidade e aumentam o risco de hotspots.

## Sharding (escalabilidade horizontal do banco)

A solução é **sharding**, dividindo o banco de dados em múltiplos shards com base em uma chave de particionamento, como `user_id`. Cada shard armazena um subconjunto único dos dados, permitindo consultas e operações de escrita distribuídas.

Sharding melhora a performance e a escalabilidade, mas exige atenção ao **resharding**, hotspots e consultas complexas, que podem precisar de desnormalização de dados. Essa técnica garante que o banco de dados continue eficiente mesmo com crescimento rápido da base de usuários.

**Limitações:** Quando a aplicação cresce para atender uma base de usuários global, simplesmente replicar bancos de dados e usar múltiplos data centers não é suficiente. Sem monitoramento centralizado, métricas e automação, é difícil identificar problemas, otimizar desempenho e gerenciar operações.

## Observabilidade e automação

Para lidar com a complexidade, é necessário investir em **ferramentas de observabilidade e automação**. O sistema passa a incluir monitoramento de logs, métricas e automação de deploys e builds.

**Logging** permite acompanhar erros e falhas, podendo ser feito por servidor ou de forma centralizada. 

**Métricas** ajudam a entender a saúde do sistema, desde o nível de host (CPU, memória, I/O) até métricas agregadas de banco de dados, cache e performance da aplicação, além de métricas de negócio, como usuários ativos, retenção e receita. 

**Automação** melhora produtividade e confiabilidade, incluindo integração contínua, testes automatizados e deploys consistentes, evitando erros humanos.

## Conclusão

Ao longo dessa jornada, o sistema evolui de uma arquitetura simples, baseada em um único servidor, para uma estrutura distribuída, resiliente e altamente escalável. Cada etapa resolve gargalos específicos, começando pela separação de responsabilidades, passando por balanceamento de carga, replicação de banco, uso de cache e CDN, adoção de servidores stateless, expansão para múltiplos data centers, processamento assíncrono com filas, sharding do banco de dados e, por fim, observabilidade e automação. Esse processo incremental permite que a arquitetura acompanhe o crescimento da aplicação de forma controlada, garantindo performance, disponibilidade e capacidade de atender milhões de usuários com eficiência.

**Referência**: XU, Alex. **System Design Interview** – An insider’s guide. ByteByteGo, 2022.