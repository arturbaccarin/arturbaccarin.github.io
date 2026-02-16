Na arquitetura de *software*, o *monolito é um estilo em que todas as camadas do sistema (como front-end, back-end, lógica de negócio e acesso a dados) estão agrupadas em um único arquivo executável ou componente de deploy*.

Apesar de muitas vezes ser mal visto pela comunidade, esse modelo pode trazer diversos benefícios em aplicações pequenas ou em estágios iniciais do projeto, como:

- **Desenvolvimento simplificado** – IDEs e outras ferramentas de desenvolvimento funcionam muito bem com aplicações únicas, tornando o desenvolvimento mais ágil.

- **Facilidade para mudanças radicais** – Como todo o código está no mesmo lugar, é possível alterar APIs, regras de negócio e chamadas ao banco de forma centralizada e consistente.

- **Testes facilitados** – Testes de integração e end-to-end são mais diretos, pois é possível iniciar toda a aplicação, invocar APIs REST e testar as interfaces.

- **Deploy direto** – A publicação é simplificada, geralmente bastando copiar o artefato gerado da compilação para o servidor de aplicação.

- **Escalabilidade simples** – Basta executar múltiplas instâncias da aplicação e utilizar um balanceador de carga (load balancer) para distribuir as requisições.

No entanto, com o crescimento da aplicação, tarefas como desenvolvimento, testes, *deploy* e escalabilidade tendem a se tornar mais complexas. Essa complexidade, por sua vez, acaba desmotivando os desenvolvedores que precisam lidar com o sistema.

Corrigir *bugs* ou implementar novas funcionalidades passa a consumir muito tempo. Pior ainda, forma-se uma espiral negativa: o código difícil de entender leva a alterações mal feitas, o que só aumenta a complexidade e os riscos.

Outro problema comum em monolitos que crescem demais é o tempo necessário para realizar o *deploy*. Como todo o sistema está em uma única base de código, qualquer pequena alteração exige a publicação da aplicação inteira. Se algo der errado nesse processo, há o risco de toda a aplicação ficar indisponível.

Além disso, o monolito pode gerar mais duas complicações importantes. Mesmo sendo simples de escalar horizontalmente, não é possível escalar apenas partes específicas da aplicação, por exemplo, um módulo que recebe um tipo específico de requisição com alto volume. A escalabilidade é sempre feita de forma integral.

A obsolescência tecnológica também é uma preocupação. A linguagem de programação ou *framework* escolhidos no início do projeto tendem a permanecer até o fim da vida útil do sistema. Isso ocorre porque atualizar toda a base de código pode ser tão trabalhoso que, muitas vezes, é mais viável reescrever o sistema do zero do que atualizá-lo.

Em resumo, o monolito é uma boa escolha no início de um projeto pela sua simplicidade. Porém, com o crescimento da aplicação, surgem desafios que podem comprometer a escalabilidade, manutenção e agilidade. Nesses casos, pode ser necessário repensar a arquitetura para acompanhar a evolução do sistema.

**Referência**: RICHARDSON, Chris. **Microservices Patterns**. Shelter Island: Manning, 2019.
