Ao criar *structs* em Go, é possível incorporar outras *structs* para compor seus campos. Essa técnica permite reutilizar *structs* e promover seus métodos e atributos, mas exige cuidado.

Para incorporar uma *struct*, basta declará-la como campo de outra *struct* **sem nomear o tipo**, como no exemplo abaixo:

```go
type Foo struct {
    Bar
}

type Bar struct {
    Baz int
}
```

Nesse caso, `Bar` é um *embedded type* de `Foo`. Com isso, os campos de `Bar` podem ser acessados diretamente por `Foo` de duas formas:

1. Direta: `Foo.Baz = 45`
2. Indireta: `Foo.Bar.Baz = 51`

A técnica também se aplica a interfaces. Veja o exemplo do pacote `io`, nativo do Go:

```go
type ReadWriter interface {
    Reader
    Writer
}
```

Aqui, `ReadWriter` é uma composição das interfaces `Reader` e `Writer`. Para implementá-la, uma *struct* precisa implementar os métodos de ambas:

```go
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}
```

Com isso, qualquer tipo que implemente `ReadWriter` pode ser usado onde se espera um `Reader` ou `Writer`.

## O ponto de atenção e cuidado

Ao incorporar uma *struct*, seus métodos são promovidos para o tipo que a recebe. Isso pode causar confusão ou permitir acessos indesejados.

Veja o exemplo abaixo, que representa um banco de dados em memória com controle de concorrência via `sync.Mutex`:

```go
type InMem struct {
    sync.Mutex
    m map[string]string
}

func New() *InMem {
    return &InMem{m: make(map[string]string)}
}

func (i *InMem) Get(key string) (string, bool) {
    i.Lock()
    v, ok := i.m[key]
    i.Unlock()
    return v, ok
}
```

Até aqui, tudo certo. Mas como `sync.Mutex` é um *embedded type*, o seguinte código também é válido:

```go
m := inmem.New()
m.Lock()
```

Isso permite que o **mutex** seja acessado diretamente de fora da *struct*, o que **não faz sentido** para o encapsulamento desejado.

Para evitar esse tipo de acesso, declare o campo como **privado**, sem incorporação:

```go
type InMem struct {
    mu sync.Mutex // Mutex não incorporado
    m map[string]string
}
```

Assim, o **mutex** só pode ser acessado dentro dos métodos da própria *struct*.

## Boas práticas

- Evite promover campos e métodos que **não devem ser acessados externamente**.
- Não use *embedded types* apenas por estética ou para simplificar o acesso.
- Em *structs* públicas, a incorporação pode gerar **complexidade futura**: novos campos ou métodos na *struct* interna podem quebrar regras da externa.
- Sempre avalie se há uma solução melhor **sem** usar *embedded types*.

Em geral, o uso de *embedded types* é raro e, quando necessário, deve ser bem justificado. Na maioria dos casos, seu uso é apenas por conveniência.

**Referência**: HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.