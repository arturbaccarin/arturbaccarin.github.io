Um serviço é um componente de *software* autônomo que implementa uma funcionalidade específica e pode ter seu *deploy* de forma independente.

Cada serviço expõe uma API, permitindo que suas funcionalidades sejam acessadas externamente.

> **Hora do conceito:**
>
> API significa *Application Programming Interface* (Interface de Programação de Aplicações). Trata-se de um conjunto de regras e definições que permite a comunicação entre diferentes sistemas ou aplicações, facilitando a troca de dados e funcionalidades de forma padronizada e segura.
>
> Uma API é composta por comandos, consultas e eventos:  
> • Um comando, como `createOrder()`, executa ações e modifica dados;  
> • Uma consulta, como `findOrderById()`, serve para recuperar informações sem causar alterações no sistema;  
> • Um serviço também pode publicar eventos, como `OrderCreated`, que são consumidos por outros serviços ou aplicações interessadas.
>
> Para saber mais: https://aws.amazon.com/pt/what-is/api/?utm_source=chatgpt.com

A API de um serviço encapsula sua implementação interna, diferentemente de um monolito, onde um desenvolvedor pode contornar a lógica da aplicação acessando diretamente o código ou o banco de dados. Nos microsserviços, essa possibilidade é eliminada, reforçando a separação de responsabilidades e a proteção da lógica interna.

Como resultado, uma arquitetura baseada em microsserviços promove a modularidade, com cada serviço adotando sua própria arquitetura e tecnologia. Isso permite que mudanças sejam feitas em um serviço sem impactar os demais, favorecendo o baixo acoplamento.

Esse baixo acoplamento proíbe que os serviços compartilhem um banco de dados comum. Os dados persistentes de um serviço devem ser tratados como atributos privados de uma classe, ou seja, acessíveis apenas por ele. Isso permite que os desenvolvedores alterem o *schema* do banco de forma isolada, sem a necessidade de coordenação com outros times. Além disso, evita bloqueios em tempo de execução, já que um serviço não interfere diretamente no banco de outro.

Os times responsáveis pelos serviços devem ser pequenos, ágeis e autônomos, com ciclos de entrega curtos e mínima dependência de outros times. Se um serviço demanda muitos desenvolvedores, leva muito tempo para ser testado ou implantado, ou ainda exige modificações em outros serviços a cada alteração, é um sinal de que ele precisa ser dividido e melhor desacoplado.

A arquitetura de microsserviços estrutura a aplicação como um conjunto de serviços pequenos, independentes e bem desacoplados.

Como resultado, essa abordagem acelera o desenvolvimento, facilita a manutenção, melhora a escalabilidade, simplifica testes e *deploys*, e permite que a organização entregue valor de forma mais rápida e eficiente.

**Referência**:  
RICHARDSON, Chris. **Microservices Patterns**. Shelter Island: Manning, 2019.