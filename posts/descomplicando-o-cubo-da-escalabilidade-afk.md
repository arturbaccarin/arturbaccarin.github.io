O cubo da escalabilidade AFK é um modelo tridimensional que representa diferentes estratégias de escalabilidade de sistemas. Ele é composto por três eixos (X, Y e Z), cada um correspondendo a uma abordagem distinta para escalar aplicações, bancos de dados e até organizações.

Ele foi criado por Abbott, Fisher e Kimbrel, daí a sigla AFK, e foi introduzido no livro “The Art of Scalability”.

O ponto de origem do cubo, definido por x = 0, y = 0, z = 0, representa um sistema monolito ou uma organização composta por uma única pessoa que realiza todas as tarefas, sem qualquer especialização ou divisão com base na função, no cliente ou no tipo de solicitação. À medida que se move ao longo de qualquer um dos eixos, X, Y ou Z, o sistema se torna mais escalável por meio de diferentes estratégias, como a separação por funcionalidades, segmentação por tipo de cliente ou usuário, e replicação para distribuição de carga.

A imagem a seguir apresenta o cubo específico para aplicações.

![Cubo da escalabilidade](/assets/img/posts/cubo-escalabilidade.jpg)

**Eixo X**

Representa uma forma de escalar sistemas clonando a aplicação. Isso significa criar várias cópias idênticas do mesmo sistema e distribuir as requisições entre elas. Essa distribuição é feita por um balanceador de carga (*load balancer*), que envia os pedidos dos usuários para uma das instâncias disponíveis.

Esse tipo de escalabilidade é muito comum e fácil de entender. Ele funciona bem para lidar com o aumento do número de acessos, melhorando a capacidade (mais usuários ao mesmo tempo) e a disponibilidade (mais chances de continuar funcionando se uma instância falhar). Além disso, é uma solução de baixo custo e simples de aplicar, já que basta copiar o sistema que já existe.

No entanto, o eixo X tem limitações. Como todas as instâncias são iguais, se o sistema for muito grande ou tiver muitos dados, ele pode ficar lento. Isso porque, mesmo com mais cópias, o sistema ainda é um monolito, e esse tipo de estrutura não lida bem com crescimentos muito complexos.

**Eixo Y**

Trata da divisão da aplicação por funcionalidades. Isso significa separar o sistema em partes menores, chamadas de serviços, onde cada um cuida de uma função específica, como gerenciamento de pedidos ou de clientes.

Essa divisão ajuda a resolver problemas que surgem quando a aplicação cresce e fica mais complexa. Com essa separação, cada serviço pode funcionar de forma independente, o que melhora o desempenho, facilita a manutenção e evita que falhas em uma parte do sistema afetem as outras.

Apesar de ser mais cara que outras formas de escalabilidade, como duplicar servidores (eixo X), a escalabilidade pelo eixo Y é muito eficaz para organizar o código e permitir que ele cresça de forma sustentável.

Essa abordagem é a base da arquitetura de microsserviços, onde a aplicação é formada por vários serviços pequenos e especializados. Cada um desses serviços pode ser escalado separadamente, conforme a necessidade.

**Eixo Z**

Trata da separação do trabalho com base em atributos dos pedidos, como o cliente ou o usuário que está fazendo a requisição. Ou seja, em vez de cada instância da aplicação cuidar de todos os dados, cada uma cuida apenas de uma parte, como um grupo específico de usuários.

Essa abordagem ajuda a escalar o sistema quando há crescimento no número de clientes, transações ou volume de dados. Cada instância da aplicação fica responsável por uma “fatia” dos dados, o que reduz o tempo de processamento e melhora o desempenho geral.

Embora o *software* não precise ser dividido em vários serviços como no eixo Y, ele precisa ser escrito de forma que permita essa separação, o que pode aumentar o custo e a complexidade da implementação.

Em resumo, a escalabilidade pelo eixo Z é ideal para lidar com grandes volumes de dados e usuários, dividindo a carga de forma inteligente entre diferentes instâncias da aplicação.

Combinando os três eixos, o cubo da escalabilidade AFK oferece uma visão completa e prática de como evoluir sistemas conforme crescem em uso, dados e complexidade. Cada eixo resolve diferentes tipos de desafios: o X melhora capacidade e disponibilidade com cópias idênticas; o Y reduz a complexidade por meio da divisão funcional; e o Z permite lidar com grandes volumes de dados e usuários por meio da segmentação. Juntos, esses eixos ajudam arquitetos e desenvolvedores a escolher as melhores estratégias de escalabilidade de acordo com as necessidades do sistema, promovendo soluções mais eficientes, resilientes e preparadas para o crescimento.

**Referências:**

ABBOTT, Martin L.; FISHER, Michael T.. **The Art of Scalability**: scalable web architecture, processes, and organizations for the modern enterprise. Boston: Addison-Wesley, 2010.

RICHARDSON, Chris. **Microservices Patterns**. Shelter Island: Manning, 2019.
