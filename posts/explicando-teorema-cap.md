Aplicações modernas precisam atender milhões de usuários simultaneamente, muitas vezes espalhados pelo mundo inteiro. Para suportar essa demanda, empresas distribuem suas aplicações entre múltiplos servidores, regiões e datacenters.

Esse modelo é conhecido como **sistema distribuído**.

Em vez de depender de um único servidor, a aplicação passa a operar em **diversos nós** conectados pela rede. Um nó é qualquer servidor ou máquina que participa do sistema distribuído e compartilha processamento, armazenamento ou dados com os demais servidores.

Essa distribuição permite criar sistemas mais escaláveis, resilientes e preparados para falhas.

No entanto, distribuir uma aplicação também introduz novos desafios. O principal deles é garantir que todos os servidores permaneçam sincronizados, ou seja, que todos os nós possuam as mesmas informações atualizadas mesmo quando ocorrem falhas de comunicação.

É nesse contexto que surge o **Teorema CAP**.

---

# Vantagens dos sistemas distribuídos

- Escalabilidade: com múltiplos servidores, o sistema consegue dividir a carga de processamento e atender mais usuários simultaneamente. Sem distribuição, um único servidor rapidamente se tornaria um gargalo.

- Alta disponibilidade: se um servidor falhar, outros nós podem continuar atendendo requisições. Isso reduz indisponibilidade e melhora a continuidade do serviço.

- Tolerância a falhas: os dados podem ser replicados entre diferentes nós. Assim, mesmo que um servidor apresente problemas, as informações continuam disponíveis em outros locais.

- Redução de latência: usuários podem acessar servidores geograficamente mais próximos, reduzindo o tempo de resposta da aplicação.

- Distribuição de carga: 0 tráfego é dividido entre vários servidores, evitando sobrecarga em apenas um ponto da infraestrutura.

- Resiliência: mesmo diante de falhas parciais na infraestrutura, o sistema pode continuar operando parcialmente até que o problema seja resolvido.

- Redundância: o sistema mantém cópias dos mesmos dados ou serviços em múltiplos nós. Isso garante continuidade do funcionamento caso algum componente falhe.

---

# O problema

Embora sistemas distribuídos tragam muitas vantagens, eles dependem fortemente da comunicação entre servidores.

Os nós precisam trocar informações constantemente para manter os dados sincronizados.

O problema é que redes não são perfeitas.

Em algum momento, falhas inevitavelmente acontecem:

- servidores podem cair;
- roteadores podem falhar;
- links de internet podem ficar indisponíveis;
- datacenters podem sofrer interrupções;
- ataques DDoS podem sobrecarregar a infraestrutura;
- problemas de configuração podem interromper comunicações.

Quando isso acontece, alguns nós deixam de se comunicar entre si. Esse cenário é chamado de partição de rede.

---

# Entendendo uma partição de rede

Imagine um sistema distribuído composto por três nós: n1, n2 e n3.

Cada nó representa um servidor independente participando do sistema distribuído.

Os dados são replicados entre eles para garantir redundância e disponibilidade.

Em um cenário ideal, qualquer informação escrita em n1 é imediatamente replicada para n2 e n3.

Todos os servidores permanecem sincronizados.

Agora imagine que n3 perde comunicação com n1 e n2.

Nesse momento:

- n3 fica isolado;
- os dados deixam de ser replicados corretamente;
- alguns nós podem ficar com informações desatualizadas;
- o sistema precisa decidir como irá reagir.

É exatamente nesse ponto que o Teorema CAP entra em ação.

---

# O que diz o Teorema CAP

O Teorema CAP afirma que, durante uma partição de rede, um sistema distribuído não consegue garantir simultaneamente três propriedades: consistência, disponibilidade e tolerância a partições.

Na prática, **o sistema precisa abrir mão de uma delas**.

---

# Consistency (Consistência)

Consistência significa que todos os nós possuem exatamente os mesmos dados ao mesmo tempo.

Após uma escrita, qualquer leitura deve retornar sempre a versão mais recente da informação.

Em um sistema consistente não existem dados divergentes, todos os servidores permanecem sincronizados e os usuários sempre recebem informações atualizadas.

---

# Availability (Disponibilidade)

Disponibilidade significa que o sistema continua respondendo às requisições mesmo quando parte da infraestrutura apresenta falhas.

O usuário sempre recebe uma resposta do sistema.

Mesmo que alguns servidores estejam indisponíveis, a aplicação continua funcionando.

---

# Partition Tolerance (Tolerância a Partições)

Tolerância a partições significa que o sistema continua operando mesmo quando ocorre falha de comunicação entre os nós.

Como falhas de rede são inevitáveis em sistemas distribuídos, essa característica se torna obrigatória na prática.

---

# O grande Trade-off do CAP

O grande ponto do CAP é que, quando ocorre uma partição de rede, o sistema precisa escolher entre manter consistência ou manter disponibilidade.

Não é possível garantir ambos simultaneamente em todos os cenários.

Isso leva aos dois principais modelos utilizados em arquiteturas distribuídas.

---

# Sistemas CP: priorizando consistência

Sistemas CP priorizam consistência e tolerância a partições.

Quando ocorre uma falha de rede, o sistema prefere bloquear operações temporariamente em vez de permitir inconsistências entre os dados.

Nesse modelo:

- algumas operações podem falhar;
- parte do sistema pode ficar indisponível;
- os dados permanecem corretos e sincronizados.

Esse comportamento é muito comum em sistemas bancários e financeiros.

Em aplicações financeiras:

- saldos precisam estar corretos;
- transferências não podem gerar inconsistências;
- é melhor retornar erro temporário do que exibir dados incorretos.

---

# Sistemas AP: priorizando disponibilidade

Sistemas AP priorizam disponibilidade e tolerância a partições.

Mesmo durante falhas de rede, o sistema continua aceitando leituras e escritas.

Como consequência:

- alguns dados podem ficar temporariamente desatualizados;
- diferentes nós podem possuir versões diferentes da informação;
- os dados serão sincronizados posteriormente.

Esse modelo normalmente utiliza consistência eventual.

Ou seja, o sistema aceita pequenas inconsistências temporárias para manter a aplicação online.

Esse comportamento é comum em:

- redes sociais;
- plataformas de streaming;
- sistemas de cache;
- aplicações altamente escaláveis.

Nesses cenários, manter o serviço disponível é mais importante do que garantir consistência imediata.

---

# Por que sistemas CA não existem na prática?

Teoricamente, um sistema CA garantiria consistência, disponibilidade sem precisar lidar com partições de rede.

O problema é que falhas de comunicação sempre podem acontecer em ambientes distribuídos reais.

Como a tolerância a partições é obrigatória na prática, sistemas CA puros não são considerados viáveis no mundo real.

---

# Conclusão

O Teorema CAP mostra que sistemas distribuídos sempre envolvem decisões e trade-offs.

Quanto maior a distribuição da aplicação, maior a complexidade para manter os dados sincronizados diante de falhas de rede.

Quando uma partição acontece, o sistema precisa escolher entre priorizar consistência ou priorizar disponibilidade.

Não existe escolha universalmente correta.

A decisão depende das necessidades do negócio, dos requisitos da aplicação e do impacto que inconsistências ou indisponibilidades podem causar aos usuários.

Por isso, entender CAP é fundamental para projetar arquiteturas distribuídas modernas, resilientes e escaláveis.