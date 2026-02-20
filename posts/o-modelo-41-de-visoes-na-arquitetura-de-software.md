A arquitetura de *software* pode ser vista sob diferentes perspectivas assim como acontece com a arquitetura de um prédio, que pode ser analisada sob os pontos de vista estrutural, hidráulico, elétrico, entre outros.

Com base nessa ideia, Philippe Kruchten propôs o modelo 4+1 de visões, descrito em um artigo que se tornou referência na área, referenciado a seguir:

> KRUCHTEN, Philippe. **Architectural Blueprints – The “4+1” View Model of Software Architecture**. 1995. Disponível em: https://www.cs.ubc.ca/~gregor/teaching/papers/4+1view-architecture.pdf. Acesso em: 09 ago. 2025.

Segundo o autor, dividir a arquitetura em múltiplas visões ajuda a tratar separadamente as preocupações dos diferentes *stakeholders* do sistema como usuários finais, desenvolvedores, engenheiros de *software*, gerentes de projeto, entre outros.

De forma geral, a arquitetura de *software* lida com o projeto e a estruturação do sistema em um nível mais alto. Ela fornece uma visão ampla do sistema, sem entrar nos detalhes do código-fonte ou da implementação específica de cada parte.

Essa arquitetura resulta da combinação de elementos estruturais organizados de maneira a atender tanto aos requisitos funcionais quanto aos não funcionais como confiabilidade, escalabilidade, portabilidade e disponibilidade.

**Pausa para conceito:**

- **Requisitos funcionais** são as funcionalidades que o sistema deve oferecer, ou seja, o que ele deve fazer. Exemplos: autenticar usuários, processar pagamentos, gerar relatórios.
- **Requisitos não funcionais** são as características de qualidade ou restrições do sistema, ou seja, como ele deve se comportar. Exemplos: desempenho, segurança, escalabilidade, usabilidade, confiabilidade.

Para descrever a arquitetura de *software*, foi desenvolvido um modelo baseado em cinco visões principais:

- **Visão lógica**: representa o modelo de objetos do sistema, especialmente quando se utiliza uma abordagem de design orientado a objetos. Exemplo: a classe Cliente se relaciona com a classe Pedido, formando a base do modelo de domínio do sistema.
- **Visão de processos**: aborda os aspectos de concorrência e sincronização da aplicação. Exemplo: o sistema conta com um processo dedicado ao tratamento de requisições simultâneas de usuários, garantindo integridade dos dados.
- **Visão física**: descreve como o *software* é distribuído no *hardware*, refletindo sua arquitetura física e aspectos de desempenho. Exemplo: o serviço de autenticação é executado em um servidor separado, garantindo maior segurança e escalabilidade.
- **Visão de desenvolvimento**: mostra como o *software* está organizado no ambiente de desenvolvimento, destacando a estrutura dos módulos e componentes. Exemplo: o projeto está dividido em módulos como *frontend*, *backend* e bibliotecas compartilhadas, organizados em um repositório central.
- **Visão de cenários (casos de uso)**: integra as demais visões por meio de interações reais com o sistema, baseadas nos requisitos funcionais. Essa visão ajuda a validar a arquitetura e orientar sua evolução. Exemplo: o caso de uso “Realizar Compra” percorre simultaneamente elementos das visões lógica, de processos e física.

![Modelo 4+1](/assets/img/posts/modelo-4-1-desenho.png)

Para cada visão do modelo 4+1, os arquitetos de *software* podem escolher um ou mais estilos arquiteturais adequados. Isso permite a coexistência de diferentes estilos em um mesmo sistema, proporcionando flexibilidade e adaptabilidade para atender a múltiplos requisitos, funcionais e não funcionais.

A seguir, aprofundamos cada uma das principais visões arquiteturais:

### Arquitetura lógica

A arquitetura lógica foca, principalmente, nos requisitos funcionais do sistema. Ela define como o sistema será decomposto em um conjunto de abstrações, geralmente baseadas no domínio do problema, utilizando princípios da orientação a objetos como abstração, encapsulamento e herança.

Essa decomposição tem como objetivo facilitar a análise funcional e a identificação de mecanismos e elementos de design reutilizáveis, comuns entre diferentes partes do sistema.

### Arquitetura de processos

A arquitetura de processos se concentra nos requisitos não funcionais do sistema, abordando aspectos como concorrência, sistemas distribuídos, integridade, tolerância a falhas e a interação entre as abstrações da visão lógica e o processo, como, por exemplo, “em qual *thread* uma operação sobre um objeto será executada”.

Ela lida com o controle e a organização de tarefas e processos que compõem a aplicação, assegurando que o sistema funcione de maneira eficiente e robusta.

Essa arquitetura pode ser descrita por diferentes camadas de abstração, onde cada camada tem sua responsabilidade específica. No nível mais alto, a arquitetura de processos pode ser vista como uma rede de processos lógicos que se comunicam entre si.

Várias camadas lógicas podem coexistir simultaneamente, compartilhando recursos físicos como CPU e memória, sem que uma sobrecarregue a outra.

Um processo é o agrupamento de tarefas que formam uma unidade executável e, nesse nível, pode ser controlado, ou seja, pode ser iniciado, interrompido, reconfigurado ou finalizado.

Uma característica importante da arquitetura de processos é que os processos podem ser replicados para distribuir a carga de processamento, o que melhora a disponibilidade do sistema, tornando-o mais escalável.

Os programas são frequentemente divididos em tarefas independentes e cada tarefa é representada por uma *thread* de controle separado. Cada *thread* pode ser agendada e executada de forma independente em diferentes nós de processamento, o que permite maior flexibilidade e performance no sistema distribuído.

As tarefas principais se comunicam entre si por meio de mecanismos de comunicação bem definidos, como mensagens síncronas e assíncronas, chamadas de procedimento remoto (RPC) e transmissão de eventos.

Já as tarefas secundárias podem se comunicar por mecanismos como *rendezvous* (mecanismo de sincronização em que dois ou mais processos ou *threads* aguardam uns aos outros para se encontrarem e trocarem dados antes de continuar a execução) ou memória compartilhada.

É importante que as tarefas principais não façam suposições sobre a localização física das tarefas no sistema, ou seja, não devem assumir que estão no mesmo processo ou nó de processamento. Isso garante maior flexibilidade e independência em relação à alocação física do sistema, permitindo uma melhor escalabilidade e portabilidade.

### Arquitetura de desenvolvimento

A arquitetura de desenvolvimento foca na organização do *software* dentro do ambiente de desenvolvimento, onde o sistema é dividido em subsistemas e bibliotecas, que podem ser trabalhados por um ou mais desenvolvedores.

Esses subsistemas são organizados de forma hierárquica em camadas, com interfaces bem definidas para comunicação entre elas.

A descrição completa da arquitetura de desenvolvimento só é possível após a identificação de todos os elementos do *software*, mas regras essenciais, como particionamento, agrupamento e visibilidade, já podem ser estabelecidas.

Essa arquitetura leva em consideração principalmente requisitos internos relacionados à facilidade de desenvolvimento, gerenciamento, reutilização e restrições das ferramentas ou da linguagem usada.

A visão de desenvolvimento serve como base para a alocação de requisitos e tarefas, organização das equipes, planejamento de custos e monitoramento do progresso do projeto.

Além disso, é fundamental para a reutilização, portabilidade e segurança do *software*, sendo crucial para o estabelecimento de uma linha de produto.

### Arquitetura física

A arquitetura física foca nos requisitos não funcionais do sistema, como disponibilidade, confiabilidade (tolerância a falhas), desempenho (taxa de transferência) e escalabilidade.

O *software* é executado em uma rede de computadores ou nós de processamento e os diversos elementos do sistema como redes, processos, tarefas e objetos precisam ser mapeados adequadamente entre esses nós.

O sistema deve suportar várias configurações físicas que podem ser usadas para desenvolvimento, testes ou implantação em diferentes locais ou para diferentes clientes.

Por isso, o mapeamento do *software* para os nós precisa ser altamente flexível, causando o menor impacto possível no código-fonte, para garantir que a arquitetura se adapte facilmente a diferentes cenários e condições operacionais.

### Cenários (casos de uso)

Agora é hora de integrar todos os elementos das quatro arquiteturas. As arquiteturas funcionam em conjunto por meio de um conjunto de cenários, que são basicamente casos de uso mais gerais.

Esses cenários servem como uma abstração dos requisitos mais importantes do sistema. Eles desempenham dois papéis principais:

- como um impulsionador para a descoberta dos elementos arquitetônicos durante o projeto, ajudando na identificação e definição dos componentes essenciais;
- como uma ferramenta de validação e ilustração após a conclusão do projeto arquitetônico, sendo usados para verificar a conformidade da arquitetura e servir como base para os testes do protótipo arquitetônico.

**Exemplo de Cenário: Sistema de Compra Online**

1. **O usuário acessa o site de compras e faz login**: O sistema valida as credenciais inseridas e ativa o perfil de usuário correspondente.
2. **O sistema exibe os produtos disponíveis**: O servidor consulta a base de dados e apresenta os produtos organizados por categoria, disponibilidade e preço.
3. **O usuário seleciona um produto e adiciona ao carrinho de compras**: O sistema atualiza o carrinho de compras, alocando os recursos necessários para armazenar o item selecionado.
4. **O usuário procede para o checkout e insere os dados de pagamento**: O sistema valida os dados inseridos, como número do cartão e endereço de cobrança, e verifica a disponibilidade do pagamento.
5. **Após validação, o sistema confirma a compra e emite um recibo**: O sistema processa o pagamento, atualiza o estoque e envia um recibo eletrônico para o usuário, finalizando a transação.

### Conclusão

Este modelo de visão “4+1” permite que diferentes partes interessadas acessem as informações que são mais relevantes para elas sobre a arquitetura de *software*.

Engenheiros de sistemas analisam a arquitetura a partir das **visões física e de processo**. Usuários finais, clientes e especialistas em dados a visualizam pela **visão lógica**. Já gerentes de projeto e a equipe responsável pela configuração de *software* a observam a partir da **visão de desenvolvimento**.