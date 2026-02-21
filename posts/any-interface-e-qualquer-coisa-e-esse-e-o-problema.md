Em Go, `interface{}` representa uma interface vazia. Isso significa que ela não define nenhum método e, por isso, qualquer tipo de dado em Go a implementa automaticamente. Em outras palavras, ela pode armazenar qualquer tipo e valor.

Esse recurso é útil quando não se sabe, antecipadamente, qual tipo será utilizado como em situações que envolvem deserialização de JSON ou comunicação genérica entre componentes.

No Go 1.18, foi introduzido o tipo `any`, que nada mais é do que um alias para `interface{}`.

**Observação**: A partir deste ponto do texto, usarei apenas `any`, então lembre-se: `any` e `interface{}` são equivalentes.

Na maioria dos casos, o uso do `any` é considerado uma generalização excessiva (*overgeneralization*).

Ao utilizá-lo, perde-se a verificação de tipos em tempo de compilação. Isso significa que, para acessar o valor armazenado em um `any`, geralmente é necessário realizar uma *type assertion*. Ou seja, é preciso checar se o valor dentro do `any` é realmente do tipo esperado, o que pode tornar o código mais complexo e propenso a erros.

A *type assertion*, que consiste em extrair o valor de dentro de um `any` e convertê-lo de volta para seu tipo original, pode também gerar sobrecarga de desempenho, especialmente se for usada com frequência no código.

O `any` também pode prejudicar a legibilidade e a manutenibilidade do código, já que não se sabe, com clareza, qual tipo de dado está sendo manipulado.

No exemplo abaixo, não há nenhum erro em nível de compilação no código; no entanto, futuros desenvolvedores que precisarem utilizar a *struct* `Store` terão que ler a documentação ou se aprofundar no código para entender como utilizar seus métodos.

```go
type Store struct {
    // ...
}

type Product struct {
    // ...
}

type Order struct {
    // ...
}

func (s *Store) Get(id int) (any, error) {
    // ...
}

func (s *Store) Set(id int, data any) error {
    // ...
}
```

Retornar valores do tipo `any` também pode ser prejudicial, pois não há nenhuma garantia, em tempo de compilação, de que o valor retornado pelo método será utilizado de forma correta e segura, o que pode, inclusive, levar a um *panic* durante a execução.

Ao utilizar `any`, perdemos os benefícios do Go ser uma linguagem estaticamente tipada, como a verificação de tipo em tempo de compilação, a detecção precoce de erros e a otimização de desempenho, já que o compilador não precisa realizar verificações de tipo em tempo de execução.

Em vez de utilizar `any` nas assinaturas dos métodos, recomenda-se criar métodos específicos, mesmo que isso resulte em alguma duplicação, como múltiplas versões de métodos `Get` e `Set`.

```go
func (s *Store) GetProduct(id int) (*Product, error) {
    // ...
}

func (s *Store) SetProduct(id int, p *Product) error {
    // ...
}

func (s *Store) GetOrder(id int) (*Order, error) {
    // ...
}

func (s *Store) SetOrder(id int, o *Order) error {
    // ...
}
```

Ter mais métodos não é necessariamente um problema, pois os clientes que os utilizarão podem criar suas próprias abstrações por meio de interfaces.

```go
type ProductStorer interface {
    GetProduct(id int) (*Product, error)
    SetProduct(id int, p *Product) error
}
```

Lembrando que o ideal é que as interfaces sejam definidas pelo consumidor, como explicado em:  
[https://arturbaccarin.dev.br/interface-e-coisa-de-consumidor/](https://arturbaccarin.dev.br/interface-e-coisa-de-consumidor/)

### Mas o uso de `any` é sempre ruim? A resposta é: não.

Na programação, raramente existe uma regra sem exceções.

Como mencionado no início do texto, há situações em que o uso de `any` é justificado, especialmente quando não é possível conhecer antecipadamente o tipo dos dados com os quais se estará lidando, como em:

**Serialização e deserialização de JSON** quando não se conhece o formato exato do JSON em tempo de compilação.

```go
// Extraído direto da biblioteca padrão "encoding/json"
func Marshal(v any) ([]byte, error) {
    e := newEncodeState()
    defer encodeStatePool.Put(e)

    err := e.marshal(v, encOpts{escapeHTML: true})
    if err != nil {
        return nil, err
    }
    buf := append([]byte(nil), e.Bytes()...)
    return buf, nil
}

func Unmarshal(data []byte, v any) error {
    // Check for well-formedness.
    // Avoids filling out half a data structure
    // before discovering a JSON syntax error.
    var d decodeState
    err := checkValid(data, &d.scan)
    if err != nil {
        return err
    }

    d.init(data)
    return d.unmarshal(v)
}
```

**Cache genérico** para armazenar qualquer tipo de valor.

```go
type Cache struct {
    store map[string]any
}

func NewCache() *Cache {
    return &Cache{store: make(map[string]any)}
}

func (c *Cache) Set(key string, value any) {
    c.store[key] = value
}

func (c *Cache) Get(key string) (any, bool) {
    val, ok := c.store[key]
    return val, ok
}
```

**`Logger` genérico** que aceita qualquer tipo de valor.

```go
func Log(value any) {
    fmt.Printf("[LOG]: %v\n", value)
}

func main() {
    Log("A string log")
    Log(123)
    Log(true)
    Log(struct{ Name string }{Name: "Test"})
}
```

Embora o uso de `any` ofereça flexibilidade, ele deve ser evitado sempre que for possível utilizar tipos específicos. Fora de casos bem específicos, prefira manter a tipagem forte do Go para garantir segurança, legibilidade e manutenibilidade do código.

**Referência**:  
HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.