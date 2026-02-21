Parâmetros opcionais são argumentos que não precisam ser fornecidos ao chamar uma função. Eles possuem valores padrão que são utilizados quando nenhum valor é passado, trazendo flexibilidade ao código.

Diferente de linguagens como Python e PHP, o Go não oferece suporte nativo a parâmetros opcionais.

Para se obter esse comportamento no Go, apresento três soluções.

### 1. Struct de parâmetros

A primeira abordagem é utilizar *structs* para encapsular os parâmetros opcionais, enquanto os obrigatórios permanecem na assinatura da função:

```go
type Config struct {
    Port int
}

func NewServer(addr string, cfg Config) {
}
```

Essa técnica facilita a adição de novos parâmetros sem quebrar a compatibilidade com chamadas existentes. 

Entretanto, é importante lembrar que quando criamos uma *struct* sem passar valores para seus campos, eles são inicializados com seus *zero values*:

- `0` para inteiros
- `0.0` para floats
- `""` para strings
- `nil` para slices, maps, channels, ponteiros, interfaces e funções

Se for necessário distinguir entre um valor `0` em um inteiro passado pelo cliente e o *zero value* do tipo, pode-se usar ponteiros, pois seu *zero value* será `nil`.

```go
type Config struct {
    Port *int
}
```

Apesar de funcional, essa abordagem exige a criação explícita de variáveis para referência:

```go
port := 0
config := httplib.Config{
    Port: &port,
}
```

Outro ponto de atenção ao ponteiro é que se ele não for bem tratado existe o risco do programa gerar um `panic` por *nil pointer exception*. 

Outro ponto negativo de utilizar uma *struct* como parâmetro opcional é que, se esse parâmetro não for utilizado, ainda será necessário passar uma *struct* vazia na chamada da função:

```go
httplib.NewServer("localhost", httplib.Config{})
```

### 2. Builder

O padrão de projeto *Builder* delega a criação e validação da *struct* `Config` para uma *struct* intermediária `ConfigBuilder`, que expõe métodos para configurar os campos:

```go
type ConfigBuilder struct {
    port *int
}

func (b *ConfigBuilder) Port(port int) *ConfigBuilder {
    b.port = &port
    return b
}

func (b *ConfigBuilder) Build() (Config, error) {
    // lógica de validação e preenchimento
}
```

Um exemplo de uso pelo cliente seria:

```go
builder := httplib.ConfigBuilder{}
builder.Port(8080)

cfg, err := builder.Build()
if err != nil {
    return err
}

server, err := httplib.NewServer("localhost", cfg)
if err != nil {
    return err
}
```

Essa abordagem também resolve o problema de compatibilidade e facilita validações complexas, mas adiciona uma camada extra de abstração.

### 3. Function Optional Pattern

O *Function Optional Pattern* é um padrão onde uma função principal recebe uma lista de funções opcionais como argumento.

Essas funções extras são usadas para modificar ou estender o comportamento da função principal, mas sem serem obrigatórias.

Se forem passadas, elas são executadas em determinado ponto do código; caso contrário, a função segue com o comportamento padrão.

No Go, esse padrão pode ser aplicado com o uso de parâmetros variádicos, que permitem que uma função receba zero ou mais argumentos de um mesmo tipo.

Um parâmetro variádico é declarado com `...` antes do tipo e os argumentos são tratados como um *slice* dentro da função.

```go
func sum(numbers ...int) int {
    sum := 0
    for _, n := range numbers {
        sum += n
    }
    return sum
}
```

**Passo a passo para usar o padrão**

1 - Criar uma *struct* interna de configuração

```go
type options struct {
    port *int
}
```

2 - Definir um tipo de função que recebe um ponteiro para a *struct* criada

```go
type Option func(*options) error
```

3 - Criar funções públicas que retornam o tipo definido

Essas funções alterarão os campos da *struct* `options`.

Esse padrão permite criar quantas funções `WithX` forem necessárias (`WithTimeout`, `WithTLS`, etc.), mantendo a função principal limpa.

```go
func WithPort(port int) Option {
    return func(o *options) error {
        if port < 0 {
            return errors.New("port should be positive")
        }
        o.port = &port
        return nil
    }
}
```

4 - Definir a função principal com parâmetros variádicos

```go
func NewServer(addr string, opts ...Option) (*http.Server, error)
```

5 - Processar a lista de funções opcionais dentro da função

```go
func NewServer(addr string, opts ...Option) (*http.Server, error) {
    var o options
    for _, opt := range opts {
        if err := opt(&o); err != nil {
            return nil, err
        }
    }

    // ...
}
```

Com essa solução podemos chamar a função `NewServer` somente com o parâmetro obrigatório `addr`:

```go
server, err := httplib.NewServer("localhost")
```

Ou com vários parâmetros opcionais:

```go
server, err := httplib.NewServer("localhost",
httplib.WithPort(8080),
httplib.WithTimeout(time.Second))
```

Embora o Go não ofereça suporte nativo a parâmetros opcionais, existem padrões eficazes para contornar essa limitação, como o uso de *structs*, *builders* e funções variádicas. A escolha da abordagem ideal depende da complexidade da configuração, da necessidade de validação e da escalabilidade do código.

**Referência**: HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.