Um padrão é uma solução reutilizável para um problema que ocorre em um contexto específico.

A ideia surgiu dos projetos de arquitetura e engenharia do mundo real, que vão de grandes soluções, como distribuir o acesso à água em uma cidade, até menores, como definir a posição de uma janela em um quarto para garantir a melhor luminosidade durante o dia. Cada um desses soluciona um problema organizando os objetos físicos dentro de um escopo específico.

Essa abordagem se mostrou útil para a arquitetura de *software*. Desde os anos 90, desenvolvedores vêm documentando inúmeros padrões de projeto que resolvem problemas arquiteturais, definindo um conjunto de elementos do sistema de forma colaborativa.

Um dos motivos pelos quais os padrões são valiosos é que eles descrevem o contexto em que se aplicam. A ideia é que um padrão oferece uma solução para um contexto específico e pode não funcionar bem em outros contextos. Por exemplo, a solução que resolve o problema do alto número de requisições que o MercadoLivre recebe por dia talvez não seja a melhor para uma *startup* que está começando agora.

Além de exigir que o contexto do problema seja especificado, um padrão obriga a descrever outros aspectos críticos da solução, como as forças em conflito, as consequências da aplicação e os *trade-offs* envolvidos.

Um padrão de projeto inclui três características básicas:

- **Forças**: representam os fatores e interesses em conflito que precisam ser considerados ao resolver um problema dentro de um determinado contexto. Essas forças podem entrar em conflito, e é necessário definir quais têm prioridade (dependendo do contexto), pois pode ser impossível atender a todas. Por exemplo, ao projetar um sistema de *login*, é preciso equilibrar a usabilidade (permitir que o usuário acesse rapidamente) com a segurança (exigir autenticação forte), duas forças que podem entrar em conflito. Ou, de forma mais simples, o código deve ser tanto simples quanto performático, mas um sistema síncrono (mais simples) não é tão performático quanto um assíncrono, que é mais complexo.

- **Resultado**: descreve as consequências da aplicação do padrão, trazendo tanto os benefícios — ou seja, as forças que ele resolve — quanto as desvantagens, que incluem forças não resolvidas e problemas que podem surgir com a aplicação do padrão. Esse resultado fornece uma visão mais completa e equilibrada da solução, permitindo decisões arquiteturais melhores.

- **Padrões relacionados**: como o próprio nome indica, essa característica descreve as relações entre o padrão em questão e outros padrões. Existem cinco tipos principais de relações entre padrões.
    - Predecessor: é aquele que dá origem ou motiva a aplicação de outro padrão. Por exemplo, o padrão de Microsserviços é predecessor de outros padrões, como *Service Discovery* e *API Gateway*.
    - Sucessor: é aquele que resolve um problema introduzido pelo seu predecessor. Por exemplo, ao adotar o padrão de Microsserviços, surgem desafios como roteamento de requisições e gerenciamento de serviços — problemas que padrões como *API Gateway* e *Service Discovery* ajudam a resolver.
    - Alternativo: é aquele que oferece uma solução alternativa ao padrão escolhido. Por exemplo, o Monolito é uma alternativa aos Microsserviços; deve-se escolher um ou outro
    - Generalização: é aquele que oferece uma solução mais ampla e genérica para um tipo de problema. Por exemplo, o padrão Cliente-Servidor é uma generalização de arquiteturas como Microsserviços ou Monolito, pois descreve a ideia básica de separar clientes e servidores, independentemente da complexidade da solução adotada.
    - Especialização: é aquele que representa uma forma mais específica de outro padrão mais geral — o oposto da generalização.

Além disso, é possível organizar padrões que tratam de questões em uma determinada área de problema em grupos.

Por exemplo, pode-se agrupar os padrões API Gateway e Service Discovery, pois ambos lidam com problemas típicos de sistemas distribuídos.

Compreender e organizar os padrões, suas características e relações permite construir soluções de software mais robustas e adaptáveis, ajudando desenvolvedores e arquitetos a tomar decisões conscientes que equilibram requisitos técnicos e de negócio.

**Referência**: RICHARDSON, Chris. **Microservices Patterns**. Shelter Island: Manning, 2019.
