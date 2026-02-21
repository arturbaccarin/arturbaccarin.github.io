Ao trabalhar com slices em Go, é comum precisar inicializá-los sem elementos. Nesse cenário, temos duas opções principais:

- Inicializar como **nulo**
- Inicializar com **tamanho zero**

## Formas de inicialização

```go
var s []string        // nil = true
s = []string(nil)     // nil = true
s = []string{}        // nil = false
s = make([]string, 0) // nil = false
```

Em todos os casos, o slice é vazio, ou seja, `len(s) == 0`. 

A diferença está na alocação: slices nulos não ocupam memória, enquanto slices de tamanho zero já possuem uma estrutura alocada.

## Nulo vs. Zero Allocation

- **Slices nulo**: não possuem backing array, são mais leves e não exigem alocação inicial.
- **Slices vazios (len=0)**: já possuem uma referência a um array interno, mesmo que sem elementos.

Essa distinção pode impactar performance em cenários de alto volume, como funções que retornam slices frequentemente.

## Quando usar nulo

Se não há necessidade de alocar memória antecipadamente, prefira inicializações nulas.

Um exemplo prático:

```go
func f() []string {
    var s []string
    
    if foo() {
        s = append(s, "foo")
    }

    return s
}
```

Nesse caso, se a condição não for satisfeita, a função retorna um slice nulo, sem alocação desnecessária.

Entre as opções de inicialização nula, a forma mais comum é: `var s []string` em vez de `s = []string(nil)`.

## Atenção ao uso de slices vazios

Evite inicializar slices com `[]string{}` quando não há elementos, pois essa sintaxe é amplamente usada para inicialização com valores:

```go
s := []string{"foo", "bar", "baz"}
```

Alguns linters podem até apontar `[]string{}` vazio como erro, justamente para evitar confusão semântica.

## Nulo vs. Vazio em bibliotecas

É importante destacar que algumas bibliotecas diferenciam slices nulos de slices vazios. Por exemplo, `encoding/json` e `reflect` tratam os dois casos de forma distinta:

```go
type Foo struct {
    Bar []string
}

func main() {
    var s1 []string
    f1 := Foo{Bar: s1}
    b, _ := json.Marshal(f1)
    fmt.Println(string(b)) // {"Bar":null}

    var s2 = make([]string, 0)
    f2 := Foo{Bar: s2}
    b, _ = json.Marshal(f2)
    fmt.Println(string(b)) // {"Bar":[]}
}
```

Essa diferença pode impactar clientes que esperam um array vazio em vez de `null`. Em APIs, por exemplo, retornar `null` pode indicar ausência de dados, enquanto `[]` indica que o campo existe, mas não possui elementos.

## Como validar se o slice tem elementos?

Nunca compare diretamente com `nil`. A forma correta é verificar o comprimento:

```go
if len(s) != 0 { // slice contém elementos }
```

Verificando o comprimento do slice, cobrimos todos os cenários:

- Se o slice é nulo, `len(slice) != 0` é falso
- Se o slice não é nulo, mas é vazio, `len(slice) != 0` também é falso

Esse princípio também é válido para `maps`.

Slices nulos e slices vazios compartilham o mesmo comportamento em relação ao comprimento (`len == 0`), mas diferem na alocação e em como algumas bibliotecas os interpretam. A regra prática é simples: **para checar se há elementos, use sempre** `len`. Além disso, escolha entre nulo ou vazio considerando performance, semântica e compatibilidade com bibliotecas externas.

**Referência**: HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.