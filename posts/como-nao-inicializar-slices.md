## Problema da inicialização sem capacidade

Inicializar um slice utilizando `make` sem determinar o tamanho e a capacidade não é nada performático.

Vamos considerar um exemplo de função que converte um slice de `Foo` para um slice de `Bar`:

```go
func convert(foos []Foo) []Bar {
    bars := make([]Bar, 0) // Omitindo a capacidade

    for _, foo := range foos {
        bars = append(bars, fooToBar(foo))
    }

    return bars
}
```

Quando é adicionado o primeiro elemento no slice a partir do `append`, é alocado um array adjacente a ele com capacidade 1.

Adicionando o segundo elemento, a capacidade do array adjacente é estourada e cria-se um novo array adjacente com o dobro da capacidade do primeiro, como explicado em: [https://arturbaccarin.dev.br/capacidade-dos-slices-explicada/](https://arturbaccarin.dev.br/capacidade-dos-slices-explicada/).

Agora imagine se forem adicionados **1000 elementos** ao slice. Isso fará com que sejam criados vários arrays adjacentes durante o processo, gerando uma carga extra ao Garbage Collector para limpar da memória os arrays não utilizados.

## Primeira solução: definir a capacidade esperada

Uma das opções para reduzir a criação de arrays adjacentes e reutilizar o mesmo array é definir o slice já com a **capacidade esperada**:

```go
func convert(foos []Foo) []Bar {
    bars := make([]Bar, 0, len(foos))

    for _, foo := range foos {
        bars = append(bars, fooToBar(foo))
    }

    return bars
}
```

## Segunda solução: definir o comprimento esperado

A segunda opção é definir o slice com o **comprimento esperado**, inicializando seus elementos e substituindo os valores diretamente por referência ao índice:

```go
func convert(foos []Foo) []Bar {
    bars := make([]Bar, len(foos))

    for i, foo := range foos {
        bars[i] = fooToBar(foo)
    }

    return bars
}
```

Essa abordagem é levemente mais performática que a primeira, pois a adição de novos valores ao slice não utiliza a função `append`.

No entanto, isso não justifica a utilização dessa opção em todos os casos. Aqui, a prioridade deve ser a **legibilidade do código**.

## Slices e condições

Quando trabalhamos com slices em Go cujo tamanho futuro não é conhecido com precisão, como em casos em que elementos só são adicionados sob determinadas condições, surge a dúvida sobre como inicializar a estrutura de forma mais eficiente.

- Se a condição for atendida na maioria das vezes, pode ser vantajoso reservar capacidade antecipadamente para reduzir realocações e otimizar o desempenho.

- Por outro lado, quando a ocorrência é rara ou imprevisível, iniciar com um slice vazio evita desperdício de memória.

Não existe uma regra absoluta, mas sim a necessidade de avaliar o comportamento esperado do programa e escolher a estratégia que melhor se adapta ao caso de uso.

Em resumo, a escolha da forma de inicializar slices em Go deve equilibrar performance e clareza. Avalie sempre o padrão de uso esperado para decidir entre otimização de memória ou simplicidade de código.

**Referência**: HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.