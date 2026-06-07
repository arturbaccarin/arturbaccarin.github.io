## Concatenação utilizando o Operador +=

Uma implementação simples para concatenar string consiste em utilizar o operador `+=`.

Antes de analisar os impactos dessa abordagem, considere a seguinte implementação:

```go
func concat(values []string) string {
    s := ""

    for _, value := range values {
        s += value
    }

    return s
}
```

À primeira vista, a implementação parece adequada. Entretanto, ela ignora uma característica importante das strings em Go: sua imutabilidade.

Como strings não podem ser modificadas após sua criação, cada operação de concatenação não altera o conteúdo existente de `s`. Em vez disso, uma nova string é alocada em memória contendo o resultado da concatenação. Consequentemente, cada iteração realiza novas alocações e cópias de dados, aumentando significativamente o custo da operação.

Em cenários com grande quantidade de concatenações, esse comportamento pode causar degradação perceptível de desempenho.

## Utilizando strings.Builder

Para minimizar as realocações e cópias de memória, Go fornece a estrutura `strings.Builder`.

A implementação equivalente utilizando essa estrutura é apresentada a seguir:

```go
func concat(values []string) string {
    sb := strings.Builder{}

    for _, value := range values {
        _, _ = sb.WriteString(value)
    }

    return sb.String()
}
```

Nessa abordagem, um objeto `strings.Builder` é criado. Durante cada iteração, o método `WriteString` adiciona o conteúdo da string ao buffer interno da estrutura.

Ao contrário da concatenação por meio de `+=`, os dados são acumulados em um buffer interno, reduzindo a quantidade de cópias necessárias e melhorando a eficiência da operação.

O método `WriteString` retorna dois valores: a quantidade de bytes escritos e um erro. Embora o erro seja ignorado no exemplo, isso ocorre porque o método nunca retorna um erro diferente de `nil`. O retorno existe para que `strings.Builder` implemente a interface `io.StringWriter`, cuja assinatura exige esse comportamento.

Além de `WriteString`, a estrutura também permite adicionar outros tipos de dados por meio dos seguintes métodos:

* `Write` para slices de bytes.
* `WriteByte` para um único byte.
* `WriteRune` para um único rune.

## Funcionamento interno do strings.Builder

Internamente, `strings.Builder` utiliza um slice de bytes para armazenar os dados concatenados.

Cada chamada para `WriteString` resulta em uma operação de `append` sobre esse slice. Esse comportamento gera duas implicações importantes.

A primeira é que a estrutura não deve ser utilizada concorrentemente. Como múltiplas operações de `append` podem ocorrer simultaneamente, condições de corrida podem surgir caso o mesmo objeto seja compartilhado entre goroutines sem sincronização adequada.

A segunda implicação está relacionada ao crescimento dinâmico do slice interno. Sempre que sua capacidade é atingida, um novo array precisa ser alocado e os dados existentes precisam ser copiados. Esse processo gera alocações adicionais e impacta a performance.

## Pré-alocação com Grow

Quando o tamanho final da string é conhecido previamente, é possível evitar parte dessas alocações utilizando o método `Grow`.

O exemplo abaixo calcula previamente a quantidade total de bytes e reserva espaço suficiente antes da concatenação.

```go
for i := 0; i < len(values); i++ {
    total += len(values[i])
}

sb := strings.Builder{}
sb.Grow(total)

for _, value := range values {
    _, _ = sb.WriteString(value)
}
```

Inicialmente, o código percorre o slice para calcular a quantidade total de bytes que a string resultante conterá. O cálculo utiliza a função `len`, pois o objetivo é determinar o número de bytes e não a quantidade de runes.

Após esse cálculo, o método `Grow` é chamado para garantir capacidade suficiente no buffer interno antes do início das concatenações.

Com essa estratégia, o número de realocações é reduzido, resultando em uma execução mais eficiente.

## Comparação de desempenho

Realizando um benchmark comparando as três abordagens:

```go
package main

import (
	"strings"
	"testing"
)

var values []string

func init() {
	values = make([]string, 1000)

	s := strings.Repeat("a", 1000)

	for i := range values {
		values[i] = s
	}
}

func concatPadrao(values []string) string {
	s := ""

	for _, value := range values {
		s += value
	}

	return s
}

func concatStringBuilder(values []string) string {
	var sb strings.Builder

	for _, value := range values {
		_, _ = sb.WriteString(value)
	}

	return sb.String()
}

func concatStringBuilderPreAlloc(values []string) string {
	total := 0

	for _, value := range values {
		total += len(value)
	}

	var sb strings.Builder
	sb.Grow(total)

	for _, value := range values {
		_, _ = sb.WriteString(value)
	}

	return sb.String()
}

func BenchmarkConcatPadrao(b *testing.B) {
	for i := 0; i < b.N; i++ {
		_ = concatPadrao(values)
	}
}

func BenchmarkConcatStringBuilder(b *testing.B) {
	for i := 0; i < b.N; i++ {
		_ = concatStringBuilder(values)
	}
}

func BenchmarkConcatStringBuilderPreAlloc(b *testing.B) {
	for i := 0; i < b.N; i++ {
		_ = concatStringBuilderPreAlloc(values)
	}
}
```

O teste utilizou um slice contendo 1.000 strings, cada uma com 1.000 bytes.

```
BenchmarkConcatPadrao-8                    5   207513758 ns/op
BenchmarkConcatStringBuilder-8          426     2880383 ns/op
BenchmarkConcatStringBuilderPreAlloc-8 3745      268440 ns/op
```

Os resultados demonstram uma diferença expressiva entre as três abordagens. A implementação baseada no operador += apresentou o pior desempenho, com tempo médio de aproximadamente 207,5 ms por operação. Esse comportamento está diretamente relacionado às múltiplas alocações e cópias de memória realizadas durante cada concatenação.

A utilização de strings.Builder sem pré-alocação reduziu o tempo médio para aproximadamente 2,88 ms por operação. Em comparação com a implementação baseada em +=, essa versão foi cerca de 72 vezes mais rápida.

O melhor resultado foi obtido pela versão que utiliza strings.Builder juntamente com o método Grow. Nessa configuração, o tempo médio caiu para aproximadamente 268 μs por operação. Em relação à implementação com +=, essa abordagem foi cerca de 773 vezes mais rápida. Quando comparada à versão que utiliza strings.Builder sem pré-alocação, o ganho foi de aproximadamente 10,7 vezes.

Embora a terceira implementação realize uma iteração adicional para calcular previamente o tamanho final da string, o custo dessa etapa é amplamente compensado pela eliminação do crescimento gradual do buffer interno. Ao reservar antecipadamente toda a capacidade necessária, o método Grow reduz a quantidade de realocações e cópias de memória, permitindo que a construção da string seja executada de forma significativamente mais eficiente.

## Quando utilizar strings.Builder

A utilização de `strings.Builder` é recomendada para a concatenação de múltiplas strings, especialmente quando a operação ocorre dentro de loops.

Por outro lado, quando apenas algumas strings precisam ser combinadas, como nome e sobrenome, o uso de `strings.Builder` pode reduzir a legibilidade do código em comparação com o operador `+=` ou com `fmt.Sprintf`.

Como regra prática, a abordagem baseada em `strings.Builder` tende a apresentar vantagens de desempenho quando mais de aproximadamente cinco strings precisam ser concatenadas. Esse valor não é absoluto e pode variar de acordo com fatores como o tamanho das strings e as características do ambiente de execução.

Quando o tamanho final da string puder ser determinado previamente, a utilização de `Grow` permite reduzir ainda mais o custo associado às alocações de memória.

**Referência**: HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.