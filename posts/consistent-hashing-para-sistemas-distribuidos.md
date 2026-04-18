Em sistemas distribuídos, um dos principais desafios é alcançar escalabilidade horizontal, ou seja, aumentar a capacidade adicionando mais servidores. No entanto, simplesmente adicionar máquinas não resolve o problema por si só. É necessário garantir que dados e requisições sejam distribuídos de forma eficiente e equilibrada.

Uma abordagem bastante comum para distribuição de carga é utilizar uma função de hash combinada com uma operação de módulo, como `hash(key) % N`, onde `N` representa o número de servidores. Essa estratégia funciona bem quando o número de servidores é fixo e a distribuição de dados é uniforme. Por exemplo, ao calcular `hash(key0) % 4`, podemos determinar exatamente em qual servidor um dado está armazenado.

> `hash(key)` significa aplicar uma função de hash sobre uma chave para transformá-la em um número (geralmente um inteiro). Em outras palavras, é uma forma de pegar um valor qualquer como uma string, ID ou objeto e convertê-lo em um valor numérico determinístico.

O problema aparece quando o número de servidores muda. Se um servidor sai do ar e o total passa de quatro para três, o valor de `N` muda, fazendo com que praticamente todas as chaves sejam remapeadas. Esse processo é conhecido como *rehashing*, que acontece quando a adição ou remoção de servidores força o recálculo do destino das chaves, fazendo com que elas passem a apontar para outros servidores. Como os dados ainda estão nos servidores antigos, os clientes acabam consultando locais incorretos até que a redistribuição seja concluída.

O *consistent hashing* foi criado para resolver exatamente esse tipo de situação. A principal ideia é simples: minimizar a quantidade de dados que precisam ser redistribuídos quando há mudanças no cluster. Em vez de remapear quase todas as chaves, apenas uma pequena fração é afetada.

O funcionamento dessa técnica começa com a definição de um espaço de hash contínuo, que pode ser imaginado como um grande intervalo de números organizado em forma de anel.

Nesse modelo:

- Servidores são mapeados no anel usando um identificador (como IP ou nome)
- Chaves também são mapeadas no mesmo espaço
- Para encontrar o servidor de uma chave, percorre-se o anel no sentido horário até encontrar o primeiro servidor disponível

Uma das maiores vantagens do *consistent hashing* aparece quando há alterações no conjunto de servidores. Ao adicionar um novo servidor, apenas as chaves localizadas entre ele e seu predecessor no anel precisam ser redistribuídas. Da mesma forma, ao remover um servidor, somente as chaves sob sua responsabilidade precisam ser realocadas.

Em termos práticos:

- Adição de servidor → redistribuição localizada
- Remoção de servidor → impacto limitado a um intervalo específico
- Nenhuma redistribuição massiva

Apesar de eficiente, a abordagem básica do *consistent hashing* apresenta alguns problemas. Como os servidores são posicionados de forma aparentemente aleatória no anel, pode haver desequilíbrio na distribuição de dados. Alguns servidores podem ficar responsáveis por grandes porções do espaço de hash, enquanto outros ficam com pouco.

Além disso, a distribuição de chaves pode não ser uniforme, concentrando dados em determinadas regiões do anel.

Para resolver essas limitações, utiliza-se o conceito de *virtual nodes* (ou nós virtuais). Em vez de mapear cada servidor para um único ponto no anel, cada servidor é representado por múltiplos pontos.

Na prática:

- Um servidor físico passa a ter várias posições no anel
- Cada posição é tratada como um nó virtual
- O conjunto desses nós distribui melhor a carga

Isso melhora significativamente o balanceamento. Quanto maior o número de nós virtuais, mais uniforme tende a ser a distribuição de dados. Por outro lado, há um custo adicional de memória e complexidade, já que o sistema precisa gerenciar mais entradas no anel. Trata-se de um *trade-off* que deve ser ajustado conforme o cenário.

Outro ponto importante é entender quais dados precisam ser movidos quando há mudanças no cluster. No *consistent hashing*, isso é bem definido:

- Ao adicionar um servidor, apenas as chaves entre ele e seu predecessor são afetadas
- Ao remover um servidor, suas chaves são transferidas para o próximo nó no anel

Essa previsibilidade é uma das grandes vantagens da técnica, pois permite operações de escala e manutenção com impacto controlado.

O *consistent hashing* é amplamente utilizado em sistemas reais, especialmente em cenários que exigem alta escalabilidade e resiliência. Entre os principais casos de uso estão caches distribuídos, bancos de dados NoSQL e sistemas de distribuição de conteúdo.

Em resumo, o *consistent hashing* resolve de forma elegante o problema do *rehashing* e permite que sistemas distribuídos cresçam de maneira eficiente. Ao reduzir drasticamente a movimentação de dados em mudanças de infraestrutura, ele se torna uma peça-chave no design de sistemas modernos.

**Referência**: XU, Alex. **System Design Interview** – An insider’s guide. ByteByteGo, 2022.