Os microsserviços são um padrão de arquitetura de *software* no qual o sistema é dividido em vários serviços pequenos e independentes que se comunicam entre si. Cada serviço funciona como uma unidade modular isolada, com barreiras bem definidas. Em vez de acessarem diretamente funções ou pacotes uns dos outros, os serviços interagem exclusivamente por meio de APIs. Isso promove um baixo acoplamento entre os componentes do sistema.

Essa abordagem é especialmente útil no desenvolvimento de sistemas grandes e complexos. À medida que o sistema cresce, torna-se cada vez mais difícil mantê-lo como o monolito (conforme discutido em [Monolito: um começo inteligente, não um erro](https://arturbaccarin.dev.br/monolito-um-comeco-inteligente-nao-um-erro/)), além de ser mais complicado para uma única pessoa compreendê-lo por completo.

Os principais benefícios dos microsserviços são:

**Cada serviço é pequeno e fácil de manter (não é à toa o prefixo “Micro”)**

Cada serviço deve ser pequeno, o que facilita sua manutenção e evolução ao longo do tempo. Por conta do tamanho reduzido, o código torna-se mais simples de entender, tanto em relação ao que o serviço deve fazer quanto à forma como ele realiza suas tarefas. Esse fator também impacta positivamente o desempenho da aplicação, pois serviços menores tendem a ser desenvolvidos e executados mais rapidamente, o que, por sua vez, contribui para o aumento da produtividade das equipes de desenvolvimento.

**Serviços são independentes**

Cada serviço pode ser entregue e escalado de forma independente, sem depender diretamente de outros serviços. Isso acelera a entrega de soluções ao mercado e aos clientes, reduz o tempo de resposta para corrigir *bugs* que afetam o usuário e aumenta a satisfação do cliente ao permitir entregas constantes de valor.

Além disso, cada equipe dentro da empresa pode ser responsável por um ou mais serviços específicos, o que facilita a autonomia dos times. Assim, cada equipe consegue desenvolver, implantar e escalar seus serviços sem depender do andamento dos demais times, promovendo agilidade e especialização.

> Ponto de atenção  
>  
> Quando é necessário implantar soluções que envolvem múltiplos serviços, é fundamental que essa implantação seja cuidadosamente coordenada entre os times. Isso evita que alterações em um serviço causem falhas em outro. É necessário criar um plano de implementação que respeite as dependências entre os serviços, definindo uma ordem lógica de implantação. Essa abordagem contrasta com o monolito, na qual é possível atualizar vários componentes de forma conjunta e atomizada.

**Isolamento de falhas**

A independência de cada serviço garante o isolamento de falhas dentro do sistema. Por exemplo, se um erro crítico acontece no serviço A, o serviço B pode continuar operando normalmente. Esse isolamento evita que falhas se propaguem, aumentando a resiliência da aplicação como um todo. Em contraste com o monolito em que uma falha em um componente pode derrubar o sistema inteiro.

**Permite experimentos e adoção de novas tecnologias**

Como os serviços são pequenos e isolados, reescrevê-los utilizando novas linguagens ou tecnologias se torna uma tarefa viável e de baixo risco. Essa flexibilidade permite que equipes experimentem soluções mais modernas e eficientes. Caso a nova abordagem não traga os resultados esperados, o serviço pode ser descartado ou revertido sem comprometer o restante do sistema.

Mas nem tudo são flores…

No mundo da tecnologia, não existe uma bala de prata.

Como qualquer abordagem arquitetural, os microsserviços também apresentam desvantagens que devem ser cuidadosamente consideradas antes da adoção.

**Definir cada serviço é custoso**

Não existe uma metodologia universal e precisa para decompor um sistema em serviços. Essa tarefa exige conhecimento profundo do domínio do negócio e experiência em design de sistemas. Uma decomposição mal feita pode resultar em um monolito distribuído, que consiste em um conjunto de serviços fortemente acoplados que precisam ser implantados juntos. Esse cenário combina o pior dos dois mundos: a rigidez do monolito com a complexidade dos microsserviços, sem os reais benefícios de nenhum dos dois.

**Sistemas distribuídos são complexos**

Ao optar por microsserviços, os desenvolvedores precisam lidar com a complexidade natural de sistemas distribuídos. A comunicação entre serviços se dá por mecanismos de comunicação entre processos, como chamadas HTTP ou mensagens assíncronas, que são mais complexas do que simples chamadas de método dentro de uma aplicação monolítica. Além disso, os serviços devem ser preparados para lidar com falhas parciais, como indisponibilidade de outros serviços ou alta latência nas respostas.

Essa complexidade técnica exige que os times tenham habilidades mais avançadas em desenvolvimento, arquitetura e operações. Além disso, há uma carga operacional significativa: múltiplas instâncias de diferentes serviços precisam ser monitoradas, escaladas, atualizadas e gerenciadas em produção. Para que os microsserviços funcionem bem, é necessário investir em um alto grau de automação, incluindo integração contínua, entrega contínua, provisionamento de infraestrutura e observabilidade.

**Decidir quando adotar microsserviços é desafiador**

Outro desafio importante está relacionado ao momento certo de adotar a arquitetura de microsserviços. Em muitos casos, especialmente no início do desenvolvimento de um novo sistema, os problemas que os microsserviços resolvem ainda não existem. A escolha por uma arquitetura distribuída desde o início pode tornar o desenvolvimento mais lento e oneroso. Isso é particularmente crítico em *startups*, cujo foco inicial costuma ser validar o modelo de negócio e lançar rapidamente. Para essas situações, começar com um monolito pode ser a melhor decisão, com a possibilidade de migrar para microsserviços à medida que a aplicação cresce e a complexidade exige uma arquitetura mais escalável.

Como é possível perceber, a arquitetura de microsserviços oferece diversos benefícios, mas também impõe desafios técnicos, operacionais e organizacionais significativos. Por isso, sua adoção deve ser feita com cautela e alinhada às reais necessidades do projeto. No entanto, para aplicações complexas, como sistemas *web* ou soluções SaaS, os microsserviços frequentemente se mostram a escolha mais adequada, especialmente no longo prazo.

**Referência**: RICHARDSON, Chris. **Microservices Patterns**. Shelter Island: Manning, 2019.
