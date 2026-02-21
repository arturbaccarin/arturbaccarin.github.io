**Generics** são um recurso que permite escrever funções e estruturas de dados que funcionam com qualquer tipo, garantindo reutilização de código e segurança de tipos em tempo de compilação.

Esse recurso difere do uso dos tipos `any/interface{}` em Go, que aceitam valores de qualquer tipo, mas sem validação em tempo de compilação. Nesse caso, a verificação ocorre apenas em tempo de execução, o que aumenta o risco de erros inesperados durante a execução do programa.

Para mais informações: [https://arturbaccarin.dev.br/any-interface-e-qualquer-coisa-e-esse-e-o-problema/](https://arturbaccarin.dev.br/any-interface-e-qualquer-coisa-e-esse-e-o-problema/).

**Generics** foram adicionados na versão 1.18.

Para exemplificar, vamos criar uma função que recebe um `map` como parâmetro e retorna um `slice` contendo suas chaves:

```go
func getKeys(m map[string]int) []string {
    keys := make([]string, 0, len(m))
    for k := range m {
        keys = append(keys, k)
    }

    return keys
}
```

Porém, o tipo da chave está fixado como `string`. Se precisarmos realizar a mesma operação para um `map[int]`, uma das opções não recomendadas seria duplicar o código e utilizar `any` nos parâmetros de entrada e saída.

```go
func getKeys(m any) ([]any, error) {
    switch t := m.(type) {
    case map[string]int:
        keys := make([]any, 0, len(t))
        for k := range t {
            keys = append(keys, k)
        }
        return keys, nil

    case map[int]string:
        keys := make([]any, 0, len(t))
        for k := range t {
            keys = append(keys, k)
        }
        return keys, nil

    default:
        return nil, fmt.Errorf("unsupported map type: %T", m)
    }
}
```

Essa solução escala mal, pois, se for necessário adicionar mais um tipo, será preciso duplicar ainda mais o código do laço `for`.

Outro ponto de falha é o uso de `any`, que elimina um dos principais benefícios do Go: ser uma linguagem fortemente tipada. Nesse caso, a função pode ser chamada com qualquer tipo de variável e eventuais erros só serão detectados em tempo de execução, quando a função retornar um resultado inesperado.

Por não conhecermos o tipo do parâmetro de entrada, somos obrigados a retornar um `slice` de `any`, que terá que ser tratado pelo código que chama a função. Isso pode causar erros e aumentar o custo de processamento, devido à necessidade de realizar *type assertion*, ou seja, extrair o valor do `any` e convertê-lo para seu tipo original.

Esse problema é resolvido com os **generics**. Na sua estrutura, é necessário definir um parâmetro de tipo junto à declaração do nome da função, como visto abaixo na função `Filter`.

```go
func Filter[T any](slice []T, predicate func(T) bool) []T {
    var result []T
    for _, item := range slice {
        if predicate(item) {
            result = append(result, item)
        }
    }
    return result
}

func main() {
    numbers := []int{1, 2, 3, 4, 5, 6}
    even := Filter(numbers, func(n int) bool {
        return n%2 == 0
    })
    fmt.Println("Even numbers:", even)

    words := []string{"go", "generics", "rocks", "AI"}
    longWords := Filter(words, func(s string) bool {
        return len(s) > 3
    })
    fmt.Println("Long words:", longWords)
}
```

Agora, vamos refatorar nosso código que extrai as chaves de um `map`.

O primeiro ponto de atenção é que não é possível criar um mapa com chaves de qualquer tipo. É obrigatório que o tipo da chave seja comparável, ou seja, que suporte as operações == e !=.

Por esse motivo, utilizamos o tipo `comparable` na refatoração, caso contrário teremos o erro `invalid map key type K (missing comparable constraint)`.

```go
func getKeys[K comparable, V any](m map[K]V) []K {
    keys := make([]K, 0, len(m))
    for k := range m {
        keys = append(keys, k)
    }

    return keys
}
```

Outra possibilidade é criar restrições de tipo para os **generics**, como mostrado no exemplo abaixo.

```go
type typeConstraint interface {
    int | ~string
}

type Foo string

func getKeys[K typeConstraint, V any](m map[K]V) []K {
    keys := make([]K, 0, len(m))
    for k := range m {
        keys = append(keys, k)
    }

    return keys
}

func main() {
    f := map[Foo]string{"a": "one", "b": "two"}
    bar := getKeys(f)

    // ...
}
```

Se tentarmos utilizar a função com um `map[float64]string`, por exemplo, o erro `float64 does not satisfy typeConstraint (float64 missing in int | ~string)` será exibido durante a compilação.

Observando a `typeConstraint`, foi definido `~string` em vez de apenas `string`. O til (~) indica que, nessa restrição, é possível utilizar tipos personalizados baseados em `string`, como mostrado a seguir. Já o `int` sem o til permite apenas variáveis do tipo `int`.

Se o til for removido, ocorrerá o erro `Foo does not satisfy typeConstraint (possibly missing ~ for string in typeConstraint)` em tempo de compilação.

Outra utilização dos **generics** é com `structs`, especialmente quando é necessário criar estruturas de dados como filas, pilhas ou até árvores. No exemplo abaixo, é criada uma pilha genérica:

```go
type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Push(item T) {
    s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() (T, bool) {
    if len(s.items) == 0 {
        var zero T
        return zero, false
    }

    lastIndex := len(s.items) - 1
    item := s.items[lastIndex]
    s.items = s.items[:lastIndex]
    return item, true
}
```

Por fim, é importante destacar que os **generics** não podem ser utilizados diretamente em métodos de `structs`, como mostrado a seguir. Caso isso ocorra, o compilador emitirá o erro `method must have no type parameters`.

```go
type Foo struct{}

func (Foo) bar[T any](t T) {}
```

Embora os **generics** possam ser extremamente úteis em situações específicas, é essencial usá-los com cautela. Em muitos casos, a decisão de não utilizá-los se assemelha à decisão de não usar interfaces, pois ambas introduzem um nível de abstração que, se for desnecessário, pode tornar o código mais difícil de entender e manter.

**Generics** são uma ferramenta poderosa, mas, como toda abstração, envolvem um custo. Se forem utilizados de forma prematura ou sem uma justificativa clara, podem adicionar complexidade sem trazer benefícios reais. Em vez de recorrer a parâmetros de tipo logo no início, devemos primeiro focar em resolver os problemas concretos de forma simples e direta.

Como regra: só considere o uso de **generics** quando perceber repetição de código entre diferentes tipos. Até lá, mantenha seu código simples, claro e voltado às necessidades reais do projeto.

**Referência**:  
HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.